import { ChainId, JSBI, Pair, Token, TokenAmount, WETH } from '@brownfi/sdk'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'styled-components'

import SwitchVersion from 'components/SwitchVersion'
import { useVersion } from 'hooks/useVersion'
import { Address, checksumAddress } from 'viem'

import { AutoColumn } from 'components/Column'
import FullPositionCard from 'components/PositionCard'
import { Flex, Text } from 'components/Rebass'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { TYPE } from 'theme'

import { PairStats } from 'components/PositionCard/usePoolStats'
import { Dots } from 'components/swap/styleds'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useQuery } from '@tanstack/react-query'
import { graphqlFetcher } from 'utils/graphql'
import { usePairs } from 'data/Reserves'
import { useDefaultTokens } from 'state/lists/hooks'
import { Modal } from 'components/Modal'
import { EmptyProposals, IndexerModalContent, PageWrapper, ResponsiveButtonPrimary, TitleRow } from './styleds'
import { ButtonPrimary } from 'components/Button'

// V3 hardcoded pools — temporary until V3 indexer is ready
// Update pair addresses after creating pools on new V3 factory
const V3_POOLS: Record<number, { pair: string; token0: { address: string; decimals: number; symbol: string; name: string }; token1: { address: string; decimals: number; symbol: string; name: string } }[]> = {
  [ChainId.BERA_MAINNET]: [
    {
      pair: '0x8c177a248011b31ebe6c8e0aac0571ee0a08f8c3',
      token0: { address: '0x6969696969696969696969696969696969696969', decimals: 18, symbol: 'WBERA', name: 'Wrapped Bera' },
      token1: { address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', decimals: 18, symbol: 'HONEY', name: 'Honey' },
    },
  ],
}

const FACTORY_STATS = `
  query FactoryStats($dayId: ID!) {
    factories {
      totalVolume
      totalFee
    }
    factoryDayData(id: $dayId) {
      tvl
      totalVolume
      totalFee
    }
  }
`

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
  }
`

export default function Pool() {
  const { chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })
  const allTokens = useDefaultTokens(chainId)

  const dayId = useMemo(() => String(Math.floor(Date.now() / 1000 / 86400) * 86400), [])

  const { data: factoryData, isLoading: isLoadingFactory } = useQuery<{
    factories: { totalVolume: number; totalFee: number }[]
    factoryDayData: { tvl: number; totalVolume: number; totalFee: number } | null
  }>({
    queryKey: ['factoryStats', chainId, dayId],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'FactoryStats',
        query: FACTORY_STATS,
        variables: { chainId, dayId },
      }),
    enabled: enableGraphQL,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const { data, error, isLoading: isLoadingPairs } = useQuery<{
    pairs: {
      id: string
      fee: number
      protocolFee: number
      feeDay: number
      totalSupply: number
      reserve0: number
      reserve1: number
      tvl: number
      apr: number
      volumeDay: number
      volume7Day: number
      updatedAt: number
      token0: {
        id: string
        decimals: number
        name: string
        price: number
        priceFeedId: string
        symbol: string
        totalSupply: number
      }
      token1: {
        id: string
        decimals: number
        name: string
        price: number
        priceFeedId: string
        symbol: string
        totalSupply: number
      }
    }[]
  }>({
    queryKey: ['pairList', chainId],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairList',
        query: LIST_ALL_PAIRS,
        variables: { chainId },
      }),
    enabled: enableGraphQL,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const sortedPairs = useMemo(
    () => (data?.pairs ?? []).slice().sort((pairA: PairStats, pairB: PairStats) => pairB.tvl - pairA.tvl),
    [data?.pairs],
  )

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
        if (isMainnet) {
          if (blocklist.has(pair.id.toLowerCase())) {
            return false
          }
          const token0Address = pair.token0?.id.toLowerCase()
          const token1Address = pair.token1?.id.toLowerCase()
          return allowedTokenAddresses.has(token0Address) || allowedTokenAddresses.has(token1Address)
        }
        return true
      }),
    [sortedPairs, blocklist, allowedTokenAddresses],
  )

  const shouldUseGraphQL = enableGraphQL && filteredPairs.length > 0
  const [showIndexerModal, setShowIndexerModal] = useState(false)

  const hasIndexerIssue =
    !!error || filteredPairs.some((pair) => pair.tvl > 1000 && pair.updatedAt < Date.now() / 1000 - 8 * 3600)

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
        <TYPE.main mb={6} color="#bb9981" className="max-w-[990px] px-2">
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
      {version === 2 && (
        <TYPE.main mb={6} color="#bb9981" className="max-w-[990px] px-2">
          BrownFi is a novel primitive AMM in DeFi. While audited by{' '}
          <a
            href="https://skynet.certik.com/projects/brownfi"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Certik
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/verichains/public-audit-reports/blob/main/Verichains%20Public%20Audit%20Report%20-%20BrownFi%20AMM%20Smartcontracts%20-%20v1.0.pdf"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Verichain
          </a>
          , pools marked &quot;Beta&quot; may experience instability during this phase—please use them with caution and
          be aware of the risks.
        </TYPE.main>
      )}

      <PageWrapper>
        <AutoColumn gap="lg" justify="center" className="p-[12px] pt-[24px] lg:p-[32px]">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            {/* Title row */}
            <TitleRow padding={'0'}>
              <Flex alignItems="center" className="gap-4">
                <TYPE.mediumHeader style={{ fontSize: '28px', fontWeight: 800 }} color={'#F5F0E8'}>
                  Liquidity Pools
                </TYPE.mediumHeader>
                <SwitchVersion />
              </Flex>
            </TitleRow>

            {/* Stats bar */}
            <PoolStatsBar factoryData={factoryData} pairs={filteredPairs} isLoading={enableGraphQL && isLoadingFactory} />

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search token"
                className="w-full max-w-[280px] bg-[#0d0b08] border border-[rgba(196,148,58,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#5C5040] focus:border-[#c4943a] focus:outline-none transition-colors"
              />
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 text-xs text-[#8A7D66] font-medium">
              <span>Pool</span>
              <span>TVL</span>
              <span>Vol 24h</span>
              <span>Free APR</span>
              <span>Bgt APR</span>
              <span>Actions</span>
            </div>

            {version === 3 ? (
              <V3PoolList />
            ) : shouldUseGraphQL ? (
              <MemoizedPairList pairs={filteredPairs} chainId={chainId} version={version} />
            ) : enableGraphQL && isLoadingPairs ? (
              <EmptyProposals>
                <TYPE.body color={'#999'} textAlign="center">
                  <Dots>Loading pools</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : (
              <OnChainLiquidityPositions />
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}

function PoolStatsBar({
  factoryData,
  pairs,
  isLoading,
}: {
  factoryData?: {
    factories: { totalVolume: number; totalFee: number }[]
    factoryDayData: { tvl: number; totalVolume: number; totalFee: number } | null
  }
  pairs: PairStats[]
  isLoading?: boolean
}) {
  const dayData = factoryData?.factoryDayData
  const factory = factoryData?.factories?.[0]

  // TVL: from factoryDayData, fallback to pairs sum
  const pairsTvl = useMemo(() => pairs.reduce((sum, p) => sum + (Number(p.tvl) || 0), 0), [pairs])
  const tvl = Number(dayData?.tvl) || pairsTvl
  // 24h data from factoryDayData
  const volume24h = Number(dayData?.totalVolume) || 0
  const fees24h = Number(dayData?.totalFee) || 0
  // All-time from factories
  const allTimeVolume = Number(factory?.totalVolume) || 0
  const totalFees = Number(factory?.totalFee) || 0

  const formatValue = (val: number) => {
    const n = Number(val) || 0
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
  }

  const hasData = !!dayData || pairs.length > 0

  const stats = [
    { label: 'Total Value Locked', value: formatValue(tvl), sub: '' },
    { label: '24h Volume', value: formatValue(volume24h), sub: 'Across all pools' },
    { label: '24h Fees', value: formatValue(fees24h), sub: 'Distributed to Lps' },
    { label: 'Total Fees', value: formatValue(totalFees), sub: 'Distributed to Lps' },
    { label: 'All - Time Volume', value: formatValue(allTimeVolume), sub: 'Since launch' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#0d0b08] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[#8A7D66] text-xs">{stat.label}</span>
          {isLoading && !hasData ? (
            <span className="text-[#c4943a] text-xl font-bold animate-pulse">--</span>
          ) : (
            <span className="text-[#c4943a] text-xl font-bold">{stat.value}</span>
          )}
          {stat.sub && (
            <span className="text-xs text-[#8A7D66]">{stat.sub}</span>
          )}
        </div>
      ))}
    </div>
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

function V3PoolList() {
  const { chainId } = useActiveWeb3React()
  const pools = V3_POOLS[chainId] ?? []

  const { data: v3Pairs, isLoading } = useQuery({
    queryKey: ['v3Pools', chainId],
    queryFn: async () => {
      const { createPublicClient, http } = await import('viem')
      const { RPC_URLS } = await import('lib/sdk/constants/addresses')
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })

      const results = await Promise.all(
        pools.map(async (pool) => {
          try {
            const reserves = await client.readContract({
              address: pool.pair as `0x${string}`,
              abi: [{ inputs: [], name: 'getReserves', outputs: [{ type: 'uint112' }, { type: 'uint112' }, { type: 'uint32' }], stateMutability: 'view', type: 'function' }] as const,
              functionName: 'getReserves',
            })
            const token0 = new Token(chainId, pool.token0.address, pool.token0.decimals, pool.token0.symbol, pool.token0.name)
            const token1 = new Token(chainId, pool.token1.address, pool.token1.decimals, pool.token1.symbol, pool.token1.name)
            const pair = new Pair(
              new TokenAmount(token0, reserves[0].toString()),
              new TokenAmount(token1, reserves[1].toString()),
              3,
            )
            // V3 uses factory.getPair() not CREATE2 — override LP token with real pair address
            ;(pair as any).liquidityToken = new Token(chainId, pool.pair, 18, 'BF-V3', 'BrownFi V3')
            return pair
          } catch {
            return null
          }
        }),
      )
      return results.filter((p): p is Pair => p !== null)
    },
    enabled: pools.length > 0,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <EmptyProposals>
        <TYPE.body color={'#999'} textAlign="center">
          <Dots>Loading V3 pools</Dots>
        </TYPE.body>
      </EmptyProposals>
    )
  }

  if (!v3Pairs || v3Pairs.length === 0) {
    return (
      <EmptyProposals>
        <TYPE.body color={'#999'} textAlign="center">
          No V3 pools found.
        </TYPE.body>
      </EmptyProposals>
    )
  }

  return (
    <>
      {v3Pairs.map((pair) => (
        <FullPositionCard key={pair.liquidityToken.address} pair={pair} />
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
