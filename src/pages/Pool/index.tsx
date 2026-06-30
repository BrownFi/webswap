import { ChainId, JSBI, Pair, Token, TokenAmount, WETH } from '@brownfi/sdk'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from 'styled-components'

import SwitchVersion from 'components/SwitchVersion'
import { useVersion } from 'hooks/useVersion'
import { Address, checksumAddress } from 'viem'

import { AutoColumn } from 'components/Column'
import FullPositionCard from 'components/PositionCard'
import { Flex, Text } from 'components/Rebass'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { TYPE } from 'theme'

import { PairStats, getPairBgt, computeV3FeeApr, USE_V3_UNIV2_COMPARISON } from 'components/PositionCard/usePoolStats'
import { AnnualizedReturnInfo } from 'components/pool/AnnualizedReturnInfo'
import { Dots } from 'components/swap/styleds'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useQueries, useQuery } from '@tanstack/react-query'
import { graphqlFetcher } from 'utils/graphql'
import { apiV2Service } from 'services'
import { fetchProtocolStats, ProtocolStats } from 'services/defillamaService'
import { usePairs } from 'data/Reserves'
import { useV3PoolsOnChain } from 'hooks/useV3PoolsOnChain'
import { useV3Indexer, isV3Like } from 'lib/sdk/constants/addresses'
import { useDefaultTokens } from 'state/lists/hooks'
import { Modal } from 'components/Modal'
import { EmptyProposals, IndexerModalContent, PageWrapper, TitleRow } from './styleds'
import { ButtonPrimary } from 'components/Button'

// Minimum TVL (USD) for a pool to appear in the prod (mainnet) list. Below
// this, pools are dust — hidden to declutter the table.
const MIN_TVL_FOR_LIST = 10

const LIST_ALL_PAIRS = `
  query PairList($chainId: Int) {
    pairs {
      id
      fee
      protocolFee
      feeDay
      totalSupply
      reserve0
      reserve1
      tvl
      apr
      volumeDay
      volume7Day
      updatedAt
      lambda
      k
      token0 {
        id
        decimals
        name
        price
        priceFeedId
        symbol
        totalSupply
      }
      token1 {
        id
        decimals
        name
        price
        priceFeedId
        symbol
        totalSupply
      }
    }
    _meta { block { timestamp } hasIndexingErrors }
  }
`

// V3 indexer schema: feeSplit instead of protocolFee, kB+kQ instead of k,
// plus all V3-only config (spread/skew/blend) and a uni-v2 reference price.
// Aliased to V2 field names client-side so consumers don't fork code paths.
// Used only when v3UseIndexer is true (constants/addresses.ts); when false
// the on-chain hook in useV3PoolsOnChain takes over.
const LIST_ALL_PAIRS_V3 = `
  query PairListV3($chainId: Int) {
    pairs {
      id
      fee
      feeSplit
      feeDay
      totalSupply
      reserve0
      reserve1
      tvl
      apr
      volumeDay
      volume7Day
      updatedAt
      lambda
      kB
      kQ
      compress
      sSell
      sBuy
      fixS
      disThreshold
      sBound
      pythWeight
      gamma
      uniV2Price
      lpPrice
      createdAt
      quoteTokenIndex
      token0 { id decimals name price priceFeedId symbol totalSupply }
      token1 { id decimals name price priceFeedId symbol totalSupply }
    }
    _meta { block { timestamp } hasIndexingErrors }
  }
`

export default function Pool() {
  const { chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })
  const allTokens = useDefaultTokens(chainId)
  // Per-chain V3 indexer toggle: true for chains where the subgraph is live
  // (Bera), false for chains awaiting the indexer (HyperEVM) — those use the
  // useV3PoolsOnChain factory-enumeration hook instead.
  const v3UseIndexer = useV3Indexer(chainId, version)

  const { data: protocolStats, isLoading: isLoadingStats } = useQuery<ProtocolStats>({
    queryKey: ['protocolStats'],
    queryFn: fetchProtocolStats,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })

  // V2 always hits the indexer. V3 routing is gated on v3UseIndexer:
  // - true (default once /indexer/v3 tracks the current factory): indexer
  // - false (current beta state, fresh v3-final factory not yet indexed):
  //   on-chain reads via useV3PoolsOnChain
  // Flip v3UseIndexer in lib/sdk/constants/addresses.ts when the indexer
  // is caught up — no other code changes required.
  const { data, error, isLoading: isLoadingPairs } = useQuery<{
    pairs: PairStats[]
    _meta?: { block: { timestamp: number }; hasIndexingErrors: boolean }
  }>({
    queryKey: ['pairList', chainId, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: isV3Like(version) ? 'PairListV3' : 'PairList',
        query: isV3Like(version) ? LIST_ALL_PAIRS_V3 : LIST_ALL_PAIRS,
        variables: { chainId, version },
      }),
    enabled: enableGraphQL && (!isV3Like(version) || v3UseIndexer),
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const { data: onChainV3Pools, isLoading: isLoadingOnChainV3 } = useV3PoolsOnChain(
    chainId,
    isV3Like(version) && !v3UseIndexer,
  )

  // V3 indexer ships `feeSplit` / `kB` (not `protocolFee` / `k`). Alias them
  // client-side so downstream code (PositionCard, devStats, etc.) stays
  // version-agnostic. Extra V3 fields pass through unchanged.
  // Sortable columns. Default: TVL desc. Fee APR uses indexer's `apr`. The
  // 24h-Fees/TVL and BGT APR columns are computed client-side below.
  type SortKey = 'tvl' | 'volumeDay' | 'apr' | 'bgtAPR'
  type SortDir = 'asc' | 'desc'
  const [sortKey, setSortKey] = useState<SortKey>('tvl')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  // BGT APR isn't on the pair entity — it comes from apiV2Service per pair.
  // Fan out ONLY for pools listed in `pairBGT` (the BE has data only for
  // those). Previously this query ran for every Bera pool, so at N pools
  // the user paid N REST round-trips on each list load even though all
  // but the whitelisted few returned apr=0. With ~2 BGT vaults today this
  // turns 100 calls into 2.
  const pairAddresses = useMemo(
    () => (data?.pairs ?? []).map((p) => p.id),
    [data?.pairs],
  )
  const bgtAprQueries = useQueries({
    queries: pairAddresses.map((addr) => ({
      queryKey: ['getBgtApr', addr.toLowerCase()],
      queryFn: () => apiV2Service.getPoolBgt({ address: addr.toLowerCase() }),
      enabled: chainId === ChainId.BERA_MAINNET && !!addr && !!getPairBgt(addr) && isV3Like(version),
      staleTime: 5 * 60_000,
    })),
  })
  const bgtAprByAddr = useMemo(() => {
    const m: Record<string, number> = {}
    pairAddresses.forEach((addr, i) => {
      const apr = (bgtAprQueries[i]?.data as any)?.apr
      if (typeof apr === 'number' && apr > 0) m[addr.toLowerCase()] = apr * 100
    })
    return m
  }, [pairAddresses, bgtAprQueries])

  const sortedPairs = useMemo(() => {
    // V2 → indexer. V3 → indexer or on-chain depending on v3UseIndexer.
    const raw: PairStats[] =
      isV3Like(version) && !v3UseIndexer ? (onChainV3Pools ?? []) : (data?.pairs ?? [])
    const normalized: PairStats[] = isV3Like(version)
      ? raw.map((p: any) => ({
          ...p,
          protocolFee: p.protocolFee ?? p.feeSplit ?? 0,
          k: p.k ?? p.kB,
        }))
      : raw
    const dir = sortDir === 'desc' ? 1 : -1
    const valueOf = (p: PairStats): number => {
      if (sortKey === 'bgtAPR') {
        return bgtAprByAddr[p.id.toLowerCase()] ?? 0
      }
      // Returns-column sort. V3 (flag on) sorts by the annualized LP-vs-UniV2
      // return; V2 sorts by the 24h-fees/TVL daily ratio it now displays.
      if (sortKey === 'apr') {
        if (isV3Like(version) && USE_V3_UNIV2_COMPARISON) {
          return computeV3FeeApr(p)
        }
        const feeDayTvl = Number(p.tvl) > 0 ? (Number(p.feeDay) || 0) / Number(p.tvl) : 0
        return feeDayTvl
      }
      return Number((p as any)[sortKey]) || 0
    }
    return normalized.slice().sort((a, b) => (valueOf(b) - valueOf(a)) * dir)
  }, [data?.pairs, onChainV3Pools, version, sortKey, sortDir, bgtAprByAddr])

  const blocklist = useMemo(
    () =>
      new Set(
        [
          '0xFC5b86437A50e9B4ae0f20Ef9B50f8D79B053121', // WBERA/LBGT
          '0x5E9B2Cd773d8283B578Df77754DFcC2894e36b4D', // LBGT/HONEY
          '0x4EDE02365c2564422Ff3Fc297000fAb082453D7c', // USDC/USDT Linea
          '0x6b3987abbf550c4114918F78267F728d85A65dfd', // USDC/USDT Base
          '0xD4bAA274885F86717d70C1d5382F32499b11DE17', // AUSD/USDC Monad
        ].map((a) => a.toLowerCase()),
      ),
    [],
  )

  const allowedTokenAddresses = useMemo(() => {
    const wethAddress = WETH[chainId]?.address.toLowerCase()
    const set = new Set(allTokens.map((token) => token.address.toLowerCase()))
    if (wethAddress) set.add(wethAddress)
    return set
  }, [allTokens, chainId])

  // Filter pairs using GraphQL
  const filteredPairs = useMemo(
    () =>
      sortedPairs.filter((pair) => {
        if (blocklist.has(pair.id.toLowerCase())) {
          return false
        }
        if (isMainnet) {
          // Hide dust pools (< $10 TVL) from the prod list — they clutter the
          // table and their fee/APR math is meaningless. Non-mainnet keeps them
          // so test pools stay visible on beta/dev.
          if (Number(pair.tvl) < MIN_TVL_FOR_LIST) return false
          const token0Address = pair.token0?.id.toLowerCase() ?? ''
          const token1Address = pair.token1?.id.toLowerCase() ?? ''
          return allowedTokenAddresses.has(token0Address) || allowedTokenAddresses.has(token1Address)
        }
        return true
      }),
    [sortedPairs, blocklist, allowedTokenAddresses],
  )

  const [searchQuery, setSearchQuery] = useState('')

  const searchFilteredPairs = useMemo(() => {
    if (!searchQuery.trim()) return filteredPairs
    const q = searchQuery.toLowerCase()
    return filteredPairs.filter((pair) => {
      const s0 = pair.token0?.symbol?.toLowerCase() || ''
      const s1 = pair.token1?.symbol?.toLowerCase() || ''
      const n0 = pair.token0?.name?.toLowerCase() || ''
      const n1 = pair.token1?.name?.toLowerCase() || ''
      return s0.includes(q) || s1.includes(q) || n0.includes(q) || n1.includes(q)
    })
  }, [filteredPairs, searchQuery])

  const shouldUseGraphQL = enableGraphQL && filteredPairs.length > 0
  const [showIndexerModal, setShowIndexerModal] = useState(false)

  // Key the "indexer syncing" banner off the indexer's OWN reported sync head
  // (`_meta`), not pool trade-staleness. The latter false-positives on quiet
  // chains where every pool can sit idle for hours while the indexer is fully
  // synced (e.g. ARB's only 2 big pools idle >12h tripped the old heuristic).
  // Real lag = the head block falling meaningfully behind wall-clock (>15 min),
  // or the indexer reporting indexing errors.
  const indexerMeta = data?._meta
  // eslint-disable-next-line react-hooks/purity -- head-lag vs wall clock; re-running each render is fine
  const indexerLagSec = indexerMeta?.block ? Date.now() / 1000 - Number(indexerMeta.block.timestamp) : 0
  const hasIndexerIssue = !!error || !!indexerMeta?.hasIndexingErrors || indexerLagSec > 15 * 60

  useEffect(() => {
    if (hasIndexerIssue) {
      setShowIndexerModal(true)
    } else {
      setShowIndexerModal(false)
    }
  }, [hasIndexerIssue])

  const handleIndexerModalDismiss = () => setShowIndexerModal(false)

  return (
    <>
      <Modal isOpen={hasIndexerIssue && showIndexerModal} onDismiss={handleIndexerModalDismiss} maxWidth={480}>
        <IndexerModalContent>
          <TYPE.mediumHeader fontSize={16} fontWeight={600} color="white">
            Indexer is syncing
          </TYPE.mediumHeader>
          <TYPE.main fontSize={16} fontWeight={500} color="#f2dfc8" lineHeight="22px">
            Charts and portfolios are temporarily delayed while our indexer syncs with the blockchain. All other
            functions are operating normally and data will update shortly.
          </TYPE.main>
          <ButtonPrimary onClick={handleIndexerModalDismiss} className="!py-2">
            <Text fontWeight={700}>Got it</Text>
          </ButtonPrimary>
        </IndexerModalContent>
      </Modal>

      {chainId === ChainId.BERA_MAINNET && version === 1 && (
        <TYPE.main mb={6} color="#bb9981" className="max-w-[1280px] px-2">
          With the release of V2, our V1 platform will soon be deprecated. Please withdraw your liquidity from V1 and
          redeposit to V2 now to keep earning fees.{' '}
          <a
            href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa/QhlhP7rD3eN8COu8wEk-Co4oyk0vXyAM3XGiLVQgI3E"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Learn More
          </a>
        </TYPE.main>
      )}

      <PageWrapper>
        <AutoColumn gap="md" justify="center" className="p-[12px] pt-[16px] sm:pt-[24px] lg:p-[24px]">
          <AutoColumn className="gap-4 sm:gap-6" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Title row */}
            <TitleRow padding={'0'}>
              <Flex alignItems="center" className="gap-4 flex-wrap">
                <span
                  className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#FBFBFD',
                  }}
                >
                  Liquidity Pools
                </span>
                <SwitchVersion />
              </Flex>
            </TitleRow>

            {/* Stats bar */}
            <PoolStatsBar stats={protocolStats} isLoading={isLoadingStats} />

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search token"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: '48px',
                  background: '#120F0D',
                  border: '1px solid #2F2823',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '16px',
                  color: '#FBFBFD',
                  outline: 'none',
                }}
                className="placeholder-[#978A80] w-full sm:w-[300px]"
              />
            </div>

            {/* Table header + rows. V3 used to go through V3PoolList (on-chain
                reads, hardcoded pool list) — now both V2 and V3 share the same
                indexer-backed path via MemoizedPairList. */}
            {shouldUseGraphQL && searchFilteredPairs.length > 0 ? (
              <>
                <div
                  className="hidden md:flex items-center"
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '16px',
                    color: '#978A80',
                    gap: '8px',
                  }}
                >
                  {/* On V2 the BGT column is hidden. Keep Pool at flex 2 so the TVL
                      column starts at the same x as on V3, and widen the data
                      columns (TVL/Vol/Returns) to absorb BGT's freed width — V2
                      total stays 7.3, identical to V3. */}
                  <span style={{ flex: 2 }}>Pool</span>
                  <SortHeader label="TVL" flex={isV3Like(version) ? 1 : 1.3} active={sortKey === 'tvl'} dir={sortDir} onClick={() => handleSort('tvl')} />
                  <SortHeader label="24h Volume" flex={isV3Like(version) ? 1 : 1.3} active={sortKey === 'volumeDay'} dir={sortDir} onClick={() => handleSort('volumeDay')} />
                  <SortHeader label={isV3Like(version) && USE_V3_UNIV2_COMPARISON ? 'Annualized Return' : '24h Fees / TVL'} flex={isV3Like(version) ? 1.3 : 1.7} info={isV3Like(version) && USE_V3_UNIV2_COMPARISON ? <AnnualizedReturnInfo /> : undefined} active={sortKey === 'apr'} dir={sortDir} onClick={() => handleSort('apr')} />
                  {chainId === ChainId.BERA_MAINNET && isV3Like(version) && (
                    <SortHeader label="BGT APR" active={sortKey === 'bgtAPR'} dir={sortDir} onClick={() => handleSort('bgtAPR')} />
                  )}
                  <span style={{ flex: 1, textAlign: 'right' }} />
                </div>
                <MemoizedPairList pairs={searchFilteredPairs} chainId={chainId} version={version} />
              </>
            ) : enableGraphQL && (isV3Like(version) && !v3UseIndexer ? isLoadingOnChainV3 : isLoadingPairs) ? (
              <PairListSkeleton showBgt={chainId === ChainId.BERA_MAINNET && isV3Like(version)} showV3Return={isV3Like(version) && USE_V3_UNIV2_COMPARISON} />
            ) : !enableGraphQL ? (
              <OnChainLiquidityPositions />
            ) : (
              <EmptyProposals>
                <TYPE.body color={'#978A80'} textAlign="center">
                  No pools found
                </TYPE.body>
              </EmptyProposals>
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}

function PoolStatsBar({
  stats: protocolStats,
  isLoading,
}: {
  stats?: ProtocolStats
  isLoading?: boolean
}) {
  const formatValue = (val: number) => {
    const n = Number(val) || 0
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
  }

  const hasData = !!protocolStats

  const stats = [
    { label: 'Total Value Locked', value: formatValue(protocolStats?.currentTvl ?? 0), sub: 'Current TVL', subColor: '#978A80' },
    { label: 'All - Time Volume', value: formatValue(protocolStats?.volumeAllTime ?? 0), sub: 'Since launch', subColor: '#978A80' },
    { label: '24h Volume', value: formatValue(protocolStats?.volume24h ?? 0), sub: 'Across all pools', subColor: '#978A80' },
    { label: 'Total Fees', value: formatValue(protocolStats?.feesAllTime ?? 0), sub: 'Since launch', subColor: '#978A80' },
    { label: '24h Fees', value: formatValue(protocolStats?.fees24h ?? 0), sub: 'Auto-compound', subColor: '#978A80' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`relative overflow-hidden flex flex-col gap-[4px] sm:gap-[8px] p-[12px] sm:p-[20px] items-center md:items-start text-center md:text-left ${
            index === 0 ? 'col-span-2 md:col-span-1' : ''
          }`}
          style={{
            background: '#2F2823',
            borderRadius: '12px',
          }}
        >
          {isLoading && !hasData ? (
            <>
              <div className="animate-pulse rounded h-[16px] sm:h-[20px] w-[60%]" style={{ background: '#493E35' }} />
              <div className="animate-pulse rounded h-[22px] sm:h-[28px] w-[80%]" style={{ background: '#493E35' }} />
              <div className="animate-pulse rounded h-[14px] sm:h-[18px] w-[50%]" style={{ background: '#493E35' }} />
            </>
          ) : (
            <>
              <span className="text-[11px] sm:text-[14px]" style={{ fontFamily: 'Inter', fontWeight: 500, lineHeight: '1.4', color: '#FBFBFD' }}>
                {stat.label}
              </span>
              <span
                className="text-[16px] sm:text-[22px] leading-[22px] sm:leading-[28px]"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#D8A072',
                }}
              >
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-[10px] sm:text-[13px]" style={{ fontFamily: 'Inter', fontWeight: 400, lineHeight: '1.4', letterSpacing: '-0.02em', color: stat.subColor }}>
                  {stat.sub}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// Clickable header column with sort indicator. Used in the pool list header
// for TVL / 24h Volume / Fee APR. Highlights the active column and shows ▼/▲
// per the current direction.
function SortHeader({
  label,
  active,
  dir,
  onClick,
  flex = 1,
  info,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  // Column width relative to other columns (default 1). Longer headers like
  // "Annualized Return" use a wider basis so they don't crowd their neighbours.
  flex?: number
  // Optional (?) helper rendered OUTSIDE the sort button (so a click on it
  // doesn't trigger sorting) — used for the Annualized Return tooltip.
  info?: React.ReactNode
}) {
  return (
    <div className="inline-flex items-center justify-start gap-1" style={{ flex, textAlign: 'left' }}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-[#FBFBFD] transition-colors"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          fontSize: 'inherit',
          color: active ? '#FBFBFD' : 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{label}</span>
        {/* DefiLlama-style sort indicator: ↕ on every clickable column so users
            know they're sortable; flips to ↓/↑ on the active one. SVG instead
            of unicode so all three states render at identical dimensions. */}
        <SortIcon state={active ? (dir === 'desc' ? 'down' : 'up') : 'both'} />
      </button>
      {info}
    </div>
  )
}

function SortIcon({ state }: { state: 'up' | 'down' | 'both' }) {
  const active = state !== 'both'
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 10 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: active ? 1 : 0.45, flexShrink: 0 }}
      aria-hidden="true"
    >
      {state !== 'down' && <polyline points="3,4 5,1.5 7,4" />}
      {state !== 'up' && <polyline points="3,8 5,10.5 7,8" />}
    </svg>
  )
}

function PairListSkeleton({ showBgt, showV3Return }: { showBgt: boolean; showV3Return: boolean }) {
  return (
    <>
      {/* Table header */}
      <div
        className="hidden md:flex items-center"
        style={{
          padding: '8px 16px',
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '16px',
          color: '#978A80',
          gap: '8px',
        }}
      >
        <span style={{ flex: 2 }}>Pool</span>
        <span style={{ flex: 1, textAlign: 'left' }}>TVL</span>
        <span style={{ flex: 1, textAlign: 'left' }}>24h Volume</span>
        <span style={{ flex: 1.3, textAlign: 'left' }}>{showV3Return ? 'Annualized Return' : '24h Fees / TVL'}</span>
        {showBgt && <span style={{ flex: 1, textAlign: 'left' }}>BGT APR</span>}
        <span style={{ flex: 1, textAlign: 'right' }} />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center max-md:flex-wrap max-md:gap-2"
          style={{
            padding: '16px',
            gap: '8px',
            minHeight: '60px',
            background: '#1E1915',
            borderRadius: '8px',
            marginBottom: '8px',
          }}
        >
          {/* Pool name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-md:w-full" style={{ flex: 2 }}>
            <div className="animate-pulse rounded-full shrink-0" style={{ background: '#493E35', width: 40, height: 40 }} />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="animate-pulse rounded" style={{ background: '#493E35', height: 18, width: '60%' }} />
              <div className="animate-pulse rounded" style={{ background: '#493E35', height: 14, width: '35%' }} />
            </div>
          </div>
          {/* Desktop-only columns: TVL, 24h Volume, Annualized Return, [BGT APR], actions */}
          <div className="max-md:hidden animate-pulse rounded" style={{ flex: 1, height: 20, background: '#493E35' }} />
          <div className="max-md:hidden animate-pulse rounded" style={{ flex: 1, height: 20, background: '#493E35' }} />
          <div className="max-md:hidden animate-pulse rounded" style={{ flex: 1.3, height: 20, background: '#493E35' }} />
          {showBgt && <div className="max-md:hidden animate-pulse rounded" style={{ flex: 1, height: 20, background: '#493E35' }} />}
          <div className="max-md:hidden animate-pulse rounded" style={{ flex: 1, height: 40, background: '#493E35' }} />
        </div>
      ))}
    </>
  )
}

function MemoizedPairList({
  pairs,
  chainId,
  version,
}: {
  pairs: PairStats[]
  chainId: number
  version: number
}) {
  const pairsWithObjects = useMemo(
    () =>
      pairs.map((item) => {
        const { token0, token1 } = item
        const pair = new Pair(
          new TokenAmount(
            new Token(chainId, checksumAddress(token0!.id as Address), token0!.decimals, token0?.symbol, token0?.name),
            JSBI.BigInt(Math.round(item.reserve0 * 10 ** token0!.decimals)),
          ),
          new TokenAmount(
            new Token(chainId, checksumAddress(token1!.id as Address), token1!.decimals, token1?.symbol, token1?.name),
            JSBI.BigInt(Math.round(item.reserve1 * 10 ** token1!.decimals)),
          ),
          version,
        )
        // V3 pools live in a factory registry rather than at a CREATE2 address,
        // so SDK's computed `liquidityToken` is wrong. Use the indexer's pair
        // id (== the real pair address) instead.
        if (isV3Like(version)) {
          ;(pair as any).liquidityToken = new Token(
            chainId,
            checksumAddress(item.id as Address),
            18,
            'BF-V3',
            'BrownFi V3',
          )
        }
        return { pair, stats: item }
      }),
    [pairs, chainId, version],
  )

  return (
    <>
      {pairsWithObjects.map(({ pair, stats }) => (
        <FullPositionCard key={pair.liquidityToken.address} pair={pair} pairStats={stats} />
      ))}
    </>
  )
}

function OnChainLiquidityPositions() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens, version), tokens })),
    [trackedTokenPairs],
  )

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(account ?? undefined, liquidityTokens)

  const liquidityTokensWithBalances = tokenPairsWithLiquidityTokens

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))

  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return (
    <>
      {v2IsLoading ? (
        <EmptyProposals>
          <TYPE.body color={theme.text3} textAlign="center">
            <Dots>Loading</Dots>
          </TYPE.body>
        </EmptyProposals>
      ) : allV2PairsWithLiquidity?.length > 0 ? (
        <>
          {allV2PairsWithLiquidity.map((v2Pair) => (
            <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
          ))}
        </>
      ) : (
        <EmptyProposals>
          <TYPE.body color={theme.text3} textAlign="center">
            No liquidity found.
          </TYPE.body>
        </EmptyProposals>
      )}
    </>
  )
}
