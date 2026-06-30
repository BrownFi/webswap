import { Pair, Token, TokenAmount, JSBI } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Settings } from 'react-feather'
import { Address, checksumAddress } from 'viem'

import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { shouldReverseDisplay } from 'utils/pair'
import { useChainGuard } from 'hooks/useChainGuard'
import { V3ExtraParams } from 'components/pool/V3ExtraParams'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { useDevStats } from 'hooks/useDevStats'
import { useV3PoolOnChain } from 'hooks/useV3PoolsOnChain'
import { useVersion } from 'hooks/useVersion'
import { useV3Indexer, isV3Like, versionLabel, slugToVersion } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'
import { PoolBalanceChart } from 'components/pool/PoolBalanceChart'
import { PoolSpreadChart } from 'components/pool/PoolSpreadChart'
import { formatNumber, formatNumberLambda, formatPrice, formatCompactPrice } from 'utils/prices'
import { getEtherscanLink, getTokenSymbol, shortenAddress } from 'utils'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { currencyId } from 'utils/currencyId'
import { PairStats, usePoolStats, computeV3FeeApr } from 'components/PositionCard/usePoolStats'
import QuestionHelper from 'components/QuestionHelper'
import { getRestakers } from 'constants/restakers'
import { getCompetitor, competitorPairKey, CompetitorPairData } from 'services/competitors'

const PairChartTV = lazy(() =>
  import('components/pool/PairChartTV').then((m) => ({ default: m.PairChartTV })),
)
const YourPositionCard = lazy(() =>
  import('components/pool/YourPositionCard').then((m) => ({ default: m.YourPositionCard })),
)
const PairSettingsModal = lazy(() =>
  import('components/PositionCard/PairSettingsModal').then((m) => ({ default: m.PairSettingsModal })),
)

const GET_PAIR = `
  query PairDetail($id: ID!) {
    pair(id: $id) {
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
      token0 { id decimals name price priceFeedId symbol totalSupply }
      token1 { id decimals name price priceFeedId symbol totalSupply }
    }
  }
`

// V3 indexer schema: feeSplit instead of protocolFee, kB+kQ instead of k,
// plus spread/skew/blend config and a uniV2 reference price. Aliased to V2
// field names client-side so the rest of this page stays version-agnostic.
// Used only when v3UseIndexer is true; on-chain hook covers the other case.
const GET_PAIR_V3 = `
  query PairDetailV3($id: ID!) {
    pair(id: $id) {
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
  }
`

// The detail-page pair row is exactly the shared PairStats shape (V2 + V3
// fields, token0/token1). Alias rather than re-declaring it.
type PairRaw = PairStats


export default function PoolDetail() {
  const { pairAddress, chainId: chainIdParam } = useParams<{ pairAddress: string; chainId: string }>()
  const chainId = Number(chainIdParam)
  const [searchParams] = useSearchParams()
  const { version: reduxVersion } = useVersion({ chainId })
  // Version precedence: explicit `?v=` slug from URL > Redux toggle. Pool list
  // and Portfolio links include the version (e.g. ?v=v3-official) so a V2 pool
  // always queries /indexer and a V3 pool always queries /indexer/v3,
  // regardless of the header toggle. No `?v=` falls back to the toggle.
  const urlVersion = slugToVersion(searchParams.get('v'))
  const version = urlVersion ?? reduxVersion
  // Per-chain V3 indexer toggle. See constants/addresses.ts. Keyed on the
  // resolved version (pilot=3 vs official=4) so each picks its own indexer.
  const v3UseIndexer = useV3Indexer(chainId, version)

  // V2 → indexer. V3 → indexer or on-chain depending on v3UseIndexer
  // (constants/addresses.ts). Same single-flag pattern as the pool list.
  const { data: pairRes, isLoading } = useQuery<{ pair: PairRaw | null }>({
    queryKey: ['pairDetail', chainId, pairAddress, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: isV3Like(version) ? 'PairDetailV3' : 'PairDetail',
        query: isV3Like(version) ? GET_PAIR_V3 : GET_PAIR,
        variables: { chainId, version, id: pairAddress?.toLowerCase() },
      }),
    enabled: !!pairAddress && !!chainId && (!isV3Like(version) || v3UseIndexer),
    staleTime: 60_000,
  })

  const { data: onChainPool, isLoading: isOnChainLoading } = useV3PoolOnChain(
    chainId,
    version,
    pairAddress,
    isV3Like(version) && !v3UseIndexer,
  )

  const pairRaw = useMemo(() => {
    if (isV3Like(version) && !v3UseIndexer) {
      // V3 on-chain path. Project PairStats onto PairRaw — chart/history
      // fields stay undefined, which downstream components handle.
      if (!onChainPool) return null
      return { ...onChainPool, protocolFee: 0, k: undefined } as unknown as PairRaw
    }
    const p = pairRes?.pair
    if (!p) return null
    if (!isV3Like(version)) return p
    return { ...p, protocolFee: p.protocolFee ?? p.feeSplit ?? 0, k: p.k ?? p.kB }
  }, [pairRes, onChainPool, version])
  const pair = useMemo(() => {
    if (!pairRaw || !chainId) return null
    const t0 = pairRaw.token0
    const t1 = pairRaw.token1
    const built = new Pair(
      new TokenAmount(
        new Token(chainId, checksumAddress(t0!.id as Address), t0!.decimals, t0?.symbol, t0?.name),
        JSBI.BigInt(Math.round(pairRaw.reserve0 * 10 ** t0!.decimals)),
      ),
      new TokenAmount(
        new Token(chainId, checksumAddress(t1!.id as Address), t1!.decimals, t1?.symbol, t1?.name),
        JSBI.BigInt(Math.round(pairRaw.reserve1 * 10 ** t1!.decimals)),
      ),
      version,
    )
    // V3 uses a factory registry rather than CREATE2, so SDK-computed
    // liquidityToken address is wrong. Override with the real pair address
    // so balanceOf reads hit the right contract.
    if (isV3Like(version) && pairAddress) {
      ;(built as any).liquidityToken = new Token(chainId, checksumAddress(pairAddress as Address), 18, 'BF-V3', 'BrownFi V3')
    }
    return built
  }, [pairRaw, chainId, version, pairAddress])

  return (
    <div className="w-full" style={{ maxWidth: '1280px', padding: '0 8px' }}>
      <Link to="/pool" style={{ color: '#978A80', fontFamily: 'Inter', fontSize: '14px', textDecoration: 'none' }}>
        ← Back to pools
      </Link>

      {(isLoading || (isV3Like(version) && !v3UseIndexer && isOnChainLoading)) && <PoolDetailSkeleton />}

      {!isLoading && !(isV3Like(version) && !v3UseIndexer && isOnChainLoading) && !pair && (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#978A80', fontFamily: 'Inter' }}>
          Pool not found.
        </div>
      )}

      {pair && pairRaw && pairAddress && (
        <PoolDetailInner pair={pair} pairRaw={pairRaw} pairAddress={pairAddress} chainId={chainId} />
      )}
    </div>
  )
}

function PoolDetailInner({
  pair,
  pairRaw,
  pairAddress,
  chainId,
}: {
  pair: Pair
  pairRaw: PairRaw
  pairAddress: string
  chainId: number
}) {
  const { chainId: walletChainId, account } = useActiveWeb3React()
  const { version, isBeta } = useVersion({ chainId, pair })
  const navigate = useNavigate()

  // Chain match check for the action buttons (Add Liquidity, Swap). When
  // wallet ≠ pool chain, the buttons morph to "Switch to {chain}" and call
  // the wallet switch on click, then proceed to the action after success.
  const { matches: walletMatchesPool, targetChainName, switchToTarget, isSwitching } = useChainGuard(chainId)

  // Detect wallet chain CHANGE (not initial mismatch). If user actively
  // switches to a chain that doesn't match this pool, send them to /pool
  // so they can browse pools on the new chain.
  const prevWalletChainRef = useRef(walletChainId)
  useEffect(() => {
    const prev = prevWalletChainRef.current
    prevWalletChainRef.current = walletChainId
    if (prev !== undefined && walletChainId !== undefined && prev !== walletChainId && walletChainId !== chainId) {
      navigate('/pool', { replace: true })
    }
  }, [walletChainId, chainId, navigate])

  const pairStats: PairStats | undefined = pairRaw as unknown as PairStats | undefined

  const { tradingFee, volume24h, feeAPR, bgtAPR, merklCampaignApr } = usePoolStats({
    pair,
    pairStats,
    enableFetchDetail: true,
  })

  const devStats = useDevStats({ pair, pairStats, enabled: !isMainnet })
  const [showSettings, setShowSettings] = useState(false)

  // Competitor comparison — chain-specific (Kodiak on Bera, Project X on
  // HyperEVM). Reuses the same cached query as the pool list, then looks up this
  // pair by its token addresses (order-independent).
  const competitor = getCompetitor(chainId)
  const showCompetitor = !!competitor
  const { data: competitorPairMap } = useQuery<Record<string, CompetitorPairData>>({
    queryKey: [competitor?.queryKey ?? 'competitorPairMap'],
    queryFn: () => competitor!.fetch(),
    enabled: showCompetitor,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
  const competitorData =
    showCompetitor && pairRaw?.token0?.id && pairRaw?.token1?.id
      ? competitorPairMap?.[competitorPairKey(pairRaw.token0.id, pairRaw.token1.id)]
      : undefined

  // Ratio/APR columns divide by TVL, so a near-empty pool produces absurd
  // values (6,606,088% / 2,378,191,932%). Below a $1 TVL floor they're
  // meaningless — zero them so the cards render their "--" default. (Matches
  // the pool-list behavior in PositionCard.)
  const ratiosMeaningful = Number(pairRaw?.tvl) >= 1
  // Annual Return = V3-only LP-vs-UniV2 outperformance since creation (green/red);
  // V2 lacks the inputs → 0/'--' (the metric is hidden on V2). Mirrors the list.
  const annualReturn = !ratiosMeaningful ? 0 : computeV3FeeApr(pairRaw)
  // Fee APR = indexer-derived APR (V2 + V3), shown alongside.
  const feeAprDisplay = ratiosMeaningful ? feeAPR ?? 0 : 0
  const incentiveApr = (bgtAPR || 0) + (merklCampaignApr || 0)
  const incentiveIcon = bgtAPR
    ? 'https://furthermore.app/icons/bgt.svg'
    : null
  const restakers = getRestakers(chainId, pair.liquidityToken.address)
  const isBgt = bgtAPR > 0
  const incentiveLabel = isBgt ? 'BGT APR' : 'Incentive APR'

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const symbol0 = (getTokenSymbol(currency0, chainId) ?? '?')
  const symbol1 = (getTokenSymbol(currency1, chainId) ?? '?')

  // USD value breakdown for the pool balance bar
  const reserve0Num = Number(pair.reserve0.toSignificant(8)) || 0
  const reserve1Num = Number(pair.reserve1.toSignificant(8)) || 0
  const price0 = Number(pairRaw.token0?.price) || 0
  const price1 = Number(pairRaw.token1?.price) || 0
  const value0 = reserve0Num * price0
  const value1 = reserve1Num * price1
  const totalValue = value0 + value1
  const pct0 = totalValue > 0 ? (value0 / totalValue) * 100 : 50
  const pct1 = 100 - pct0

  // Pool balances panel renders in base/quote order so the bar + labels
  // stay consistent with the page title. V3 uses the indexer's authoritative
  // quoteTokenIndex; V2 / unknown fall back to the symbol whitelist. All four
  // bound values flip together to keep each row internally correct (reserve
  // amount stays attached to its own symbol + color).
  const isReversed = shouldReverseDisplay(currency0, currency1, chainId, pairRaw.quoteTokenIndex)
  const balanceL = isReversed
    ? { sym: symbol1, cur: currency1, reserve: pair.reserve1, pct: pct1, color: '#6FB3E6' }
    : { sym: symbol0, cur: currency0, reserve: pair.reserve0, pct: pct0, color: '#D8A072' }
  const balanceR = isReversed
    ? { sym: symbol0, cur: currency0, reserve: pair.reserve0, pct: pct0, color: '#D8A072' }
    : { sym: symbol1, cur: currency1, reserve: pair.reserve1, pct: pct1, color: '#6FB3E6' }

  return (
        <>
        {/* Mobile-only section: pair title + dev stats + rate, always on top */}
        <div className="lg:hidden flex flex-col gap-3 mt-4 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} chainId={chainId} size={26} margin quoteTokenIndex={pairRaw.quoteTokenIndex} />
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', color: '#FBFBFD' }}>
              <DoubleCurrencySymbol currency0={currency0} currency1={currency1} chainId={chainId} quoteTokenIndex={pairRaw.quoteTokenIndex} />
            </span>
            <span
              style={{
                background: '#2F2823',
                border: '1px solid #493E35',
                borderRadius: '999px',
                padding: '3px 8px',
                fontFamily: 'Inter',
                fontSize: '11px',
                fontWeight: 500,
                color: '#FBFBFD',
              }}
            >
              {versionLabel(version)}
            </span>
            <span
              style={{
                background: '#2F2823',
                border: '1px solid #493E35',
                borderRadius: '999px',
                padding: '3px 8px',
                fontFamily: 'Inter',
                fontSize: '11px',
                fontWeight: 500,
                color: '#83CF84',
              }}
            >
              Fee {formatNumberLambda(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
            </span>
            {isBeta && (
              <span style={{ background: '#f97316', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#fff' }}>
                Beta
              </span>
            )}
            <a
              href={getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}
              target="_blank"
              rel="noreferrer"
              className="hover:underline inline-flex items-center gap-1 ml-auto"
              style={{ fontFamily: 'Inter', fontSize: '12px', color: '#978A80' }}
              title={`View pair contract ${pair.liquidityToken.address} on explorer`}
            >
              {/* Address text hidden on mobile — icon-only carries the link */}
              <span className="hidden sm:inline">Pair {shortenAddress(pair.liquidityToken.address)}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {!isMainnet && (
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{ fontFamily: 'Inter', fontSize: '12px', color: '#8A7D66' }}
            >
              {devStats.lambda !== undefined && (
                <span>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</span>
              )}
              {devStats.kappa !== undefined && (
                <span>
                  {isV3Like(version) ? 'kB' : 'Kappa'}: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}
                </span>
              )}
              {isV3Like(version) && devStats.kQ !== undefined && (
                <span>kQ: {formatNumberLambda(devStats.kQ, { maximumFractionDigits: 4 })}</span>
              )}
              {(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee) !== undefined && (
                <span>
                  {isV3Like(version) ? 'FeeSplit' : 'ProtocolFee'}:{' '}
                  {formatNumberLambda(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee, { maximumFractionDigits: 4 })}
                </span>
              )}
              {isV3Like(version) && <V3ExtraParams devStats={devStats} />}
              {account && (
                <Settings
                  size="14"
                  className="cursor-pointer"
                  style={{ color: '#c4943a' }}
                  onClick={() => setShowSettings(true)}
                />
              )}
            </div>
          )}

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-4">
          {/* Left column */}
          <div className="flex flex-col gap-5 order-2 lg:order-1">
            {/* Cross-chain action affordance now lives ON the action buttons
                themselves — they morph to "Switch to {chain}" when wallet ≠
                pool chain. A standalone banner here was redundant. */}
            {/* Header — shown on desktop only; mobile header is above the grid */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} chainId={chainId} size={44} quoteTokenIndex={pairRaw.quoteTokenIndex} />
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', color: '#FBFBFD' }}>
                <DoubleCurrencySymbol currency0={currency0} currency1={currency1} chainId={chainId} quoteTokenIndex={pairRaw.quoteTokenIndex} />
              </span>
              <span
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#FBFBFD',
                }}
              >
                {versionLabel(version)}
              </span>
              <span
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#83CF84',
                }}
              >
                Fee {formatNumberLambda(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
              </span>
              {isBeta && (
                <span
                  style={{
                    background: '#985C2A',
                    border: '1px solid #B47140',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontFamily: 'Inter',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#FBFBFD',
                    letterSpacing: '0.04em',
                  }}
                >
                  Beta
                </span>
              )}
              <a
                href={getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}
                target="_blank"
                rel="noreferrer"
                className="hover:underline inline-flex items-center gap-1"
                style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', marginLeft: 'auto' }}
                title={`View pair contract ${pair.liquidityToken.address} on explorer`}
              >
                Pair {shortenAddress(pair.liquidityToken.address)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            {/* Dev stats — non-mainnet only (above the rate) — desktop only */}
            {!isMainnet && (
              <div
                className="hidden lg:flex flex-wrap items-center gap-x-3 gap-y-1"
                style={{ fontFamily: 'Inter', fontSize: '12px', color: '#8A7D66' }}
              >
                {devStats.lambda !== undefined && (
                  <span>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</span>
                )}
                {devStats.kappa !== undefined && (
                  <span>
                    {isV3Like(version) ? 'kB' : 'Kappa'}: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}
                  </span>
                )}
                {isV3Like(version) && devStats.kQ !== undefined && (
                  <span>kQ: {formatNumberLambda(devStats.kQ, { maximumFractionDigits: 4 })}</span>
                )}
                {(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee) !== undefined && (
                  <span>
                    {isV3Like(version) ? 'FeeSplit' : 'ProtocolFee'}:{' '}
                    {formatNumberLambda(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee, { maximumFractionDigits: 4 })}
                  </span>
                )}
                {isV3Like(version) && <V3ExtraParams devStats={devStats} />}
                {account && (
                  <Settings
                    size="14"
                    className="cursor-pointer"
                    style={{ color: '#c4943a' }}
                    onClick={() => setShowSettings(true)}
                  />
                )}
              </div>
            )}

            {showSettings && (
              <Suspense fallback={null}>
                <PairSettingsModal
                  isOpen={showSettings}
                  onDismiss={() => setShowSettings(false)}
                  pair={pair}
                  currentValues={devStats}
                />
              </Suspense>
            )}

            {/* Chart */}
            <Suspense fallback={<div style={{ height: 380, background: '#1E1915', borderRadius: '12px' }} />}>
              <PairChartTV pair={pair} />
            </Suspense>

            {/* Your position — mobile only, above activity */}
            <div className="lg:hidden">
              <Suspense fallback={<div style={{ height: 120, background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px' }} />}>
                <YourPositionCard pair={pair} pairStats={pairStats} />
              </Suspense>
            </div>

            {/* Pool analytics charts (balance/imbalance + oracle spread) — beta/dev
                ONLY, hidden on production (mainnet) per product. Same gate the
                dev-stats editor uses. */}
            {!isMainnet && (
              <>
                {/* Pool balance / imbalance over time — pool-wide (reserve0USD/reserve1USD per tx), lightweight-charts (TradingView) */}
                <PoolBalanceChart
                  pairAddress={pairAddress}
                  chainId={chainId}
                  version={version}
                  symbol0={symbol0}
                  symbol1={symbol1}
                  reversed={isReversed}
                />

                {/* Oracle spread (oSpread) over time — (pythPrice0/pythPrice1 − ammPriceRel) / adjPriceRel per SWAP */}
                <PoolSpreadChart pairAddress={pairAddress} chainId={chainId} version={version} />
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4 order-1 lg:order-2">
            {/* Primary actions — thin button strip, no surrounding card. Two
                inline buttons side-by-side so they stay above the fold without
                eating vertical space. */}
            <div className="hidden lg:grid grid-cols-2 gap-2">
              {/* Swap + Add Liquidity action buttons. Both are click-handlers
                  (not raw Links) so we can branch on wallet chain match:
                  if matches → navigate; if not → trigger wallet switch and
                  navigate on success. Mirrors Uniswap's multi-chain pattern. */}
              <button
                type="button"
                onClick={async () => {
                  if (!walletMatchesPool) {
                    await switchToTarget()
                    // Don't navigate after the switch — the user may have
                    // rejected. They can re-click; matches will be true now
                    // if accepted, falling through to the navigate branch.
                    return
                  }
                  navigate(`/swap?inputCurrency=${currencyId(currency0)}&outputCurrency=${currencyId(currency1)}`)
                }}
                disabled={isSwitching}
                className="inline-flex items-center justify-center"
                style={{
                  background: 'transparent',
                  border: '1px solid #493E35',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FBFBFD',
                  cursor: isSwitching ? 'wait' : 'pointer',
                  opacity: isSwitching ? 0.7 : 1,
                }}
              >
                {walletMatchesPool ? 'Swap' : `Switch to ${targetChainName}`}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!walletMatchesPool) {
                    await switchToTarget()
                    return
                  }
                  navigate(`/add/${currencyId(currency0)}/${currencyId(currency1)}`)
                }}
                disabled={isSwitching}
                className="inline-flex items-center justify-center"
                style={{
                  background: '#985C2A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  cursor: isSwitching ? 'wait' : 'pointer',
                  opacity: isSwitching ? 0.7 : 1,
                }}
              >
                {walletMatchesPool ? '+ Add liquidity' : `Switch to ${targetChainName}`}
              </button>
            </div>

            {/* Your position — collapsible; sits above Stats so a return
                visitor sees their state above the fold. */}
            <div className="hidden lg:block">
              <Suspense fallback={<div style={{ height: 120, background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px' }} />}>
                <YourPositionCard pair={pair} pairStats={pairStats} />
              </Suspense>
            </div>

            {/* APR + Stats — combined into one card (beta only). APR section on
                top (Annual Return / Fee APR / Incentive), a full-bleed divider,
                then the Stats section (pool balances, TVL, volume, fees, and the
                competitor comparison). bera keeps them as two separate cards. */}
            <div className="px-4 py-3.5 lg:px-5 lg:py-4" style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: '#FBFBFD', marginBottom: '10px' }}>
                APR
              </div>

              {/* Mobile: inline rows. */}
              <div className="flex flex-col gap-2 lg:hidden">
                {isV3Like(version) && <StatInline label="Annual Return" value={(annualReturn ? `${formatNumberLambda(annualReturn, { maximumFractionDigits: 2 })}%` : '--')} valueColor={annualReturn >= 0 ? '#83CF84' : '#E04848'} />}
                {!isMainnet && <StatInline label="Fee APR" value={(feeAprDisplay ? `${formatNumberLambda(feeAprDisplay, { maximumFractionDigits: 2 })}%` : '--')} valueColor="#83CF84" />}
                {incentiveApr > 0 && (
                  <div>
                    <StatInline label={incentiveLabel} value={`+${formatNumberLambda(incentiveApr, { maximumFractionDigits: 2 })}%`} valueColor="#83CF84" />
                    {restakers.length > 0 && (
                      <div className="inline-flex items-center gap-x-3 gap-y-1 flex-wrap" style={{ marginTop: '4px' }}>
                        <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#978A80' }}>Stake on</span>
                        {restakers.map((r) => (
                          <a
                            key={r.vaultAddress}
                            href={r.stakePageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:opacity-80"
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#D8A072',
                              textDecoration: 'underline',
                            }}
                          >
                            {r.iconUrl && <img src={r.iconUrl} alt="" style={{ width: 14, height: 14, borderRadius: 4 }} />}
                            {r.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop: inline label/value rows — one line each. */}
              <div className="hidden lg:block">
                {isV3Like(version) && (
                  <div className="mb-2 lg:mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] lg:text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>
                      Annual Return
                    </span>
                    <span className="text-[14px] lg:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 700, color: annualReturn >= 0 ? '#83CF84' : '#E04848' }}>
                      {(annualReturn ? `${formatNumberLambda(annualReturn, { maximumFractionDigits: 2 })}%` : '--')}
                    </span>
                  </div>
                )}
                {!isMainnet && (
                  <div className="mb-2 lg:mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] lg:text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>
                      Fee APR
                    </span>
                    <span className="text-[14px] lg:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 700, color: '#83CF84' }}>
                      {(feeAprDisplay ? `${formatNumberLambda(feeAprDisplay, { maximumFractionDigits: 2 })}%` : '--')}
                    </span>
                  </div>
                )}
                {incentiveApr > 0 && (
                  <div className="mb-2 lg:mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] lg:text-[12px] inline-flex items-center gap-1.5 flex-wrap" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>
                        {incentiveLabel}
                        {incentiveIcon && <img src={incentiveIcon} alt="BGT" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />}
                        {isBgt && <QuestionHelper text="Stake your LP token on a restaker vault to earn BGT." />}
                      </span>
                      <span className="text-[14px] lg:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 700, color: '#83CF84' }}>
                        +{formatNumberLambda(incentiveApr, { maximumFractionDigits: 2 })}%
                      </span>
                    </div>
                    {restakers.length > 0 && (
                      <div className="inline-flex items-center gap-x-3 gap-y-1 flex-wrap" style={{ marginTop: '6px' }}>
                        <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#978A80' }}>Stake on</span>
                        {restakers.map((r) => (
                          <a
                            key={r.vaultAddress}
                            href={r.stakePageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:opacity-80"
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#D8A072',
                              textDecoration: 'underline',
                            }}
                          >
                            {r.iconUrl && <img src={r.iconUrl} alt="" style={{ width: 14, height: 14, borderRadius: 4 }} />}
                            {r.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: '#FBFBFD', marginTop: '16px', marginBottom: '10px' }}>
                Stats
              </div>

              <StatRow label="Pool balances">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '13px', color: '#FBFBFD', marginTop: '4px' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyLogo currency={balanceL.cur} size="16px" />
                    {formatNumber(Number(balanceL.reserve.toSignificant(6)), { maximumFractionDigits: 2 })} {balanceL.sym}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {formatNumber(Number(balanceR.reserve.toSignificant(6)), { maximumFractionDigits: 2 })} {balanceR.sym}
                    <CurrencyLogo currency={balanceR.cur} size="16px" />
                  </span>
                </div>
                {totalValue > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        background: '#2F2823',
                      }}
                    >
                      <div style={{ width: `${balanceL.pct}%`, background: balanceL.color }} />
                      <div style={{ width: `${balanceR.pct}%`, background: balanceR.color }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '11px', color: '#978A80', marginTop: '4px' }}>
                      <span>{balanceL.pct.toFixed(2)}%</span>
                      <span>{balanceR.pct.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </StatRow>

              {showCompetitor && competitor ? (
                // BrownFi vs competitor comparison: two value columns per metric.
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '12px', marginBottom: '10px' }}>
                    <span />
                    <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', color: '#F4A340', textAlign: 'right' }}>BrownFi</span>
                    <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', color: '#978A80', textAlign: 'right' }}>{competitor.name}</span>
                  </div>
                  <StatCompareRow label="Fee" ours={`${formatNumberLambda(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`} kodiak={competitorData ? `${formatNumberLambda(competitorData.feeTier / 10000, { maximumFractionDigits: 2 })}%` : '--'} />
                  <StatCompareRow label="TVL" ours={formatPrice(pairRaw?.tvl ?? 0)} kodiak={competitorData ? formatCompactPrice(competitorData.tvlUSD) : '--'} />
                  <StatCompareRow label="24H volume" ours={formatPrice(volume24h ?? 0)} kodiak={competitorData ? formatCompactPrice(competitorData.vol24hUSD) : '--'} />
                  <StatCompareRow label="24H fees" ours={formatPrice((pairRaw?.feeDay ?? 0) as number)} kodiak={competitorData ? formatCompactPrice(competitorData.fees24hUSD) : '--'} />
                </div>
              ) : (
                <>
                  {/* Mobile: one row per stat, label + value inline. Desktop: stacked. */}
                  <div className="flex flex-col gap-2 lg:hidden">
                    <StatInline label="TVL" value={formatPrice(pairRaw?.tvl ?? 0)} />
                    <StatInline label="24H volume" value={formatPrice(volume24h ?? 0)} />
                    <StatInline label="24H fees (Auto-compound)" value={formatPrice((pairRaw?.feeDay ?? 0) as number)} />
                  </div>
                  <div className="hidden lg:block">
                    <StatRow label="TVL" value={formatPrice(pairRaw?.tvl ?? 0)} />
                    <StatRow label="24H volume" value={formatPrice(volume24h ?? 0)} />
                    <StatRow label="24H fees (Auto-compound)" value={formatPrice((pairRaw?.feeDay ?? 0) as number)} />
                  </div>
                </>
              )}
            </div>

            {/* Your position used to render here at the bottom of the rail —
                now pinned to the top (above Stats / APR cards) so it's visible
                above the fold on 14" laptops. */}
          </div>
    </div>
    </>
  )
}

function StatRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-2 lg:mb-2.5">
      <div className="text-[11px] lg:text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>{label}</div>
      {value !== undefined && (
        <div className="text-[14px] lg:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 700, color: '#FBFBFD', marginTop: '2px' }}>
          {value}
        </div>
      )}
      {children}
    </div>
  )
}

function StatCompareRow({ label, ours, kodiak }: { label: string; ours: string; kodiak: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '12px', alignItems: 'baseline', marginBottom: '12px' }}>
      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>{label}</span>
      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', color: '#FBFBFD', textAlign: 'right' }}>{ours}</span>
      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', color: '#FBFBFD', textAlign: 'right' }}>{kodiak}</span>
    </div>
  )
}

function StatInline({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', color: '#978A80' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: valueColor ?? '#FBFBFD' }}>
        {value}
      </span>
    </div>
  )
}

function SkeletonBar({ w, h, rounded = 'rounded' }: { w: number | string; h: number; rounded?: string }) {
  return (
    <div
      className={`animate-pulse ${rounded}`}
      style={{
        background: '#493E35',
        height: h,
        width: typeof w === 'number' ? `${w}px` : w,
      }}
    />
  )
}

function PoolDetailSkeleton() {
  const Card = ({ children }: { children?: React.ReactNode }) => (
    <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '20px' }}>
      {children}
    </div>
  )

  return (
    <>
      {/* Mobile-only top block: header + dev stats + rate */}
      <div className="lg:hidden flex flex-col gap-3 mt-4 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="animate-pulse rounded-full" style={{ background: '#493E35', width: 36, height: 36 }} />
          <SkeletonBar w={140} h={22} />
          <SkeletonBar w={36} h={18} rounded="rounded-full" />
          <SkeletonBar w={44} h={18} rounded="rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={110} h={14} />
        </div>
        <SkeletonBar w={220} h={36} rounded="rounded-[8px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-4">
        {/* Left column */}
        <div className="flex flex-col gap-5 order-2 lg:order-1">
          {/* Desktop-only header */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
            <div className="animate-pulse rounded-full" style={{ background: '#493E35', width: 44, height: 44 }} />
            <SkeletonBar w={180} h={32} />
            <SkeletonBar w={42} h={24} rounded="rounded-full" />
            <SkeletonBar w={54} h={24} rounded="rounded-full" />
          </div>

          {/* Desktop-only dev stats + rate */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={120} h={14} />
          </div>
          <div className="hidden lg:block"><SkeletonBar w={240} h={36} rounded="rounded-[8px]" /></div>

          {/* Chart card — matches real structure (range selector + chart + legend) */}
          <div className="p-[12px] sm:p-[16px]" style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px' }}>
            <div className="flex items-center justify-end mb-3">
              <SkeletonBar w={180} h={30} rounded="rounded-[8px]" />
            </div>
            <div className="h-[260px] sm:h-[320px] lg:h-[400px] animate-pulse rounded" style={{ background: '#2F2823' }} />
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
              <SkeletonBar w={80} h={14} />
              <SkeletonBar w={100} h={14} />
              <SkeletonBar w={90} h={14} />
              <SkeletonBar w={100} h={14} />
              <SkeletonBar w={90} h={14} />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4 order-1 lg:order-2">
          <Card>
            <div className="mb-2"><SkeletonBar w={80} h={14} /></div>
            <SkeletonBar w={140} h={36} />
          </Card>
          <Card>
            <div className="mb-4"><SkeletonBar w={60} h={18} /></div>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between"><SkeletonBar w="45%" h={16} /><SkeletonBar w="45%" h={16} /></div>
              <SkeletonBar w="100%" h={6} rounded="rounded-full" />
              <div className="flex justify-between"><SkeletonBar w={60} h={14} /><SkeletonBar w={60} h={14} /></div>
            </div>
            <div className="flex flex-col gap-3">
              <div><SkeletonBar w={60} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
              <div><SkeletonBar w={80} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
              <div><SkeletonBar w={70} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
            </div>
          </Card>
          {/* Your position (desktop sidebar) */}
          <div className="hidden lg:block">
            <Card>
              <div className="mb-4"><SkeletonBar w={100} h={18} /></div>
              <div className="flex flex-col gap-3">
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={36} rounded="rounded-[8px]" />
              </div>
            </Card>
          </div>
        </div>

        {/* Your position (mobile — matches loaded state position below the chart) */}
        <div className="lg:hidden order-3">
          <Card>
            <div className="mb-4"><SkeletonBar w={100} h={18} /></div>
            <div className="flex flex-col gap-3">
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={36} rounded="rounded-[8px]" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
