import { isV3Like } from '@brownfi/sdk'
import { Pair, TokenAmount } from '@brownfi/sdk'
import beraIcon from 'assets/images/w-bera.png'
import { versionToSlug } from 'lib/sdk/constants/addresses'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { darken } from 'polished'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Info, Settings } from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import { Text } from 'components/Rebass'
import styled from 'styled-components'

import { ButtonSecondary } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import { useDevStats } from 'hooks/useDevStats'
import { useTokenBalance } from 'state/wallet/hooks'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { Card } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { Loader } from 'components/Loader'
const PairChartModal = lazy(() => import('components/pool/PairChartModal').then((m) => ({ default: m.PairChartModal })))
import { PairFavorite, usePairStorage } from 'components/pool/PairFavoriteIcon'
import { PoolBalanceBar } from 'components/pool/PoolBalanceBar'
import { V3ExtraParams } from 'components/pool/V3ExtraParams'
import { PoolCapTags } from 'components/pool/PoolCapTags'
import { getTvlCap } from 'config/tvlGate'
import { clEnabled, concentrationLevel } from 'utils/concentration'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { isMainnet } from 'connectors'
import { useHermesPrices } from 'hooks/useHermesPrices'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { orderedCurrencyIds, shouldReverseDisplay } from 'utils/pair'
import { aprToApy, formatNumber, formatNumberLambda, formatPrice, formatCompactPrice } from 'utils/prices'
import { CompetitorPairData } from 'services/competitors'
import { deriveLiquidityMetrics, formatLiquidityBreakdown, parseStakeLpAmount } from './liquidityUtils'
import { PairSettingsModal } from './PairSettingsModal'
import { merklCampaignPool, PairStats, usePoolStats, computeV3FeeApr } from './usePoolStats'

export const FixedHeightRow = styled(RowBetween)`
  min-height: 24px;
  flex-wrap: wrap;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled.div<{ bgColor?: any; $expanded?: boolean }>`
  position: relative;
  overflow: hidden;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.15s ease, gap 0.2s ease;
  background: ${({ $expanded }) => ($expanded ? '#2F2823' : '#1E1915')};
  gap: ${({ $expanded }) => ($expanded ? '24px' : '4px')};

  /* Hover only affects collapsed rows. When expanded, the card is already
     in its "active" #2F2823 tint and a hover bump would feel jittery as
     the user moves between sub-sections. Matches the Portfolio row's
     hover treatment so the two surfaces feel consistent. */
  &:hover {
    background: ${({ $expanded }) => ($expanded ? '#2F2823' : '#252019')};
  }

  @media (min-width: 720px) {
    padding: 12px;
    border-radius: 12px;
  }
`

const pairBGT: Record<string, [string, string]> = {
  '0xd932c344e21ef6C3a94971bf4D4cC71304E2a66C': [
    // BERA/HONEY
    'https://hub.berachain.com/earn/0x2cb34eeadb1e7ae9cc7bafb84a189e9d921e193a',
    'https://infrared.finance/pol-vaults/brownfi-wbera-honey',
  ],
  '0xd57Da672354905B9E42Df077Df77E554dC5Fd1Cc': [
    // BERA/USDC.e
    'https://hub.berachain.com/earn/0x519cef5cc2913bcefdd03d0a22601c19794c4581',
    'https://infrared.finance/pol-vaults/brownfi-wbera-usdc.e',
  ],
}

// Toggle the BGT/Incentive APR column on the pool list. Set true to re-enable.
const SHOW_BGT_APR = false

interface PositionCardProps {
  pair: Pair
  pairStats?: PairStats
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
  // Competitor stats for this pair, when it also exists on the rival DEX.
  competitor?: CompetitorPairData
  // Competitor display name (e.g. "Kodiak", "Project X") — used on the mobile row.
  competitorName?: string
  // Whether to render the competitor columns at all (must mirror the table header).
  showCompetitorColumns?: boolean
}

export default function FullPositionCard({ pair, pairStats, border, competitor, competitorName, showCompetitorColumns }: PositionCardProps) {
  const navigate = useNavigate()
  const { account, chainId } = useActiveWeb3React()
  const { isTest, isBeta, version } = useVersion({ chainId, pair })
  const [{ isFavorite }] = usePairStorage({ pair })
  const enableBgt = !!pairBGT[pair.liquidityToken.address]
  const enableMerklCampaignApr = merklCampaignPool.includes(pair.liquidityToken.address.toLowerCase())
  const devStats = useDevStats({ pair, pairStats, enabled: !isMainnet })

  const [showMore] = useState(isFavorite)
  const [showTokenPrice, setShowTokenPrice] = useState(false)

  const canEditSettings = !isMainnet && !!account
  const [showSettings, setShowSettings] = useState(false)

  const iskHYPEUSDT = pair.liquidityToken.address === '0xBb78f5ad054CAC4274813b6A4BBcC47D75a18BC3' // HYPE/USD₮0

  const {
    tradingFee,
    totalSupply: totalPoolTokens,
    feeAPR: feeAPRIndexer,
    bgtAPR,
    volume24h,
    volume7d,
    shouldUseIndexer,
    pairAccount,
    merklCampaignApr,
  } = usePoolStats({
    pair,
    pairStats,
    enableFetchDetail: showMore,
  })

  const userPoolTokens = useTokenBalance(account ?? undefined, showMore ? pair.liquidityToken : undefined)

  // Price every position value on this card from ONE live source so it stays
  // internally consistent. A no-swap pool never refreshes the indexer / on-chain
  // token price, so the stored portfolio values (lpPortfolio, bnhPortfolio) go
  // stale — and pricing HODL fresh while leaving LPing on the stale indexer value
  // made "LPing vs. HODL" mix two price bases. Fix (mirrors YourPositionCard, per
  // Manh 2026-07-16): one fresh per-token price → value pooled rows + LPing/HODL
  // portfolios + PnL from it, with a per-side fallback to the indexer snapshot.
  // The actual portfolio figures are computed below, once token0/1Deposited exist.
  const hermesPrices = useHermesPrices({
    chainId,
    currencyA: pair.token0,
    currencyB: pair.token1,
    version: pair.version,
    // Hermes now also prices LPing portfolio (shown on every env), so poll it
    // whenever the position block is on screen with an account — identical gating
    // to YourPositionCard, so both cards value LPing/HODL the same way regardless
    // of env. (The HODL rows themselves stay !isMainnet-gated in the render below.)
    enabled: showMore && !!account,
  })

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  // Base/quote order: V3 pools use the indexer's authoritative quoteTokenIndex;
  // V2 / unknown fall back to the unwrapped-symbol whitelist. Same source as
  // the pair name (DoubleCurrencySymbol) and the Pool Detail page, so the
  // balance bar, name, and detail all agree.
  const shouldReverse = shouldReverseDisplay(currency0, currency1, chainId, pairStats?.quoteTokenIndex)

  const pythPrices = usePythPrices({
    chainId,
    pair,
    pairStats,
    currencyA: pair.token0,
    currencyB: pair.token1,
    enableFetchDetail: showMore,
  })
  const token0Price = hermesPrices.CURRENCY_A || pythPrices.CURRENCY_A || pairStats?.token0?.price || 0
  const token1Price = hermesPrices.CURRENCY_B || pythPrices.CURRENCY_B || pairStats?.token1?.price || 0

  const { tvl, lpPrice, annualizedReturn, feeAPY } = useMemo(() => {
    const r0 = token0Price * Number(pair.reserve0.toSignificant(6))
    const r1 = token1Price * Number(pair.reserve1.toSignificant(6))
    const tvl = r0 + r1
    const lpPrice = tvl / (Number(totalPoolTokens?.toSignificant(6)) || 1)
    // APR/ratio columns divide by TVL, so a near-empty pool produces absurd
    // values. Below a $30 TVL floor zero them so the column renders "--".
    const MIN_TVL_FOR_RATIOS = 30
    const ratiosMeaningful = tvl >= MIN_TVL_FOR_RATIOS
    // Fee APY (LP share) — indexer/volume-based APR converted to APY (n=360
    // compounding). Shown for V2 + V3 (unchanged source; feeAPRIndexer is raw).
    const feeAPRFallback = tradingFee * (((Number(volume24h) || 0) * 365) / (tvl || 1))
    const feeAPY = ratiosMeaningful ? aprToApy(shouldUseIndexer ? feeAPRIndexer : feeAPRFallback) : 0
    // Annualized Return = V3-only LP-vs-UniV2 metric. V2 pools lack the inputs,
    // so computeV3FeeApr returns 0 → the column renders '--' for them.
    const annualizedReturn = !ratiosMeaningful ? 0 : computeV3FeeApr(pairStats, pair.chainId)
    return { tvl, lpPrice, annualizedReturn, feeAPY }
  }, [token0Price, token1Price, pair, totalPoolTokens, pairStats, tradingFee, volume24h, shouldUseIndexer, feeAPRIndexer])

  const stakedLiquidityTokenAmount = parseStakeLpAmount(pairAccount?.stakeLP, pair.liquidityToken)

  const { userPoolBalance, poolTokenPercentage, token0Deposited, token1Deposited } = deriveLiquidityMetrics({
    pair,
    totalPoolTokens,
    walletBalance: userPoolTokens,
    stakedBalance: stakedLiquidityTokenAmount,
  })

  // Fresh-priced portfolio figures (see the price comment above). Same token0/1Price
  // used by the pooled rows values LPing (current pooled amounts) and HODL (bnh0/bnh1
  // buy&hold amounts), so the pooled USD rows sum to LPing portfolio and LPing-vs-HODL
  // is like-for-like. Falls back to the indexer snapshot per-metric when no live price.
  const havePrices = token0Price > 0 && token1Price > 0
  const d0 = token0Deposited ? Number(token0Deposited.toExact()) : 0
  const d1 = token1Deposited ? Number(token1Deposited.toExact()) : 0
  const basePortfolio = pairAccount?.basePortfolio ?? 0
  const lpPortfolio =
    havePrices && token0Deposited && token1Deposited
      ? d0 * token0Price + d1 * token1Price
      : pairAccount?.lpPortfolio ?? 0
  const hodlPortfolio =
    havePrices && pairAccount
      ? pairAccount.bnh0 * token0Price + pairAccount.bnh1 * token1Price
      : pairAccount?.bnhPortfolio ?? 0
  const lpPnL = havePrices && pairAccount ? lpPortfolio - basePortfolio : pairAccount?.unrealizedPnL ?? 0
  const hodlPnL = hodlPortfolio - basePortfolio
  const lpVsHodl = lpPortfolio - hodlPortfolio

  const {
    totalDisplay: totalLpDisplay,
  } = formatLiquidityBreakdown({
    walletBalance: userPoolTokens,
    stakedBalance: stakedLiquidityTokenAmount,
    totalBalance: userPoolBalance,
  })

  const handleCopyPoolAddress = () => {
    const text = `'${pair.liquidityToken.address}', // ${pair.token0.symbol}/${pair.token1.symbol}`
    navigator.clipboard.writeText(text)
  }

  return (
    <StyledPositionCard $expanded={showMore}>
      <AutoColumn gap="0px">
        {/* Collapsed row: matching table columns */}
        <div
          className="flex items-center cursor-pointer max-md:flex-wrap max-md:gap-2"
          style={{ gap: '8px', minHeight: '60px' }}
          onClick={() =>
            navigate(`/pool/${pair.chainId}/${pair.liquidityToken.address}?v=${versionToSlug(pair.version)}`, {
              // Flag so the detail page auto-scrolls to the Pool Balance chart on
              // mobile when arriving from the list (per Paven). Only set here on
              // the list/portfolio row nav — direct loads/refreshes don't scroll.
              state: { scrollToPoolBalance: true },
            })
          }
        >
          {/* Pool name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-md:w-full" style={{ flex: 2 }}>
            <div onClick={(e) => { e.stopPropagation(); handleCopyPoolAddress() }} className="cursor-pointer shrink-0 hidden sm:block">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={40} quoteTokenIndex={pairStats?.quoteTokenIndex} />
            </div>
            <div onClick={(e) => { e.stopPropagation(); handleCopyPoolAddress() }} className="cursor-pointer shrink-0 sm:hidden flex items-center">
              <CurrencyLogo currency={currency0} size="28px" />
              <CurrencyLogo currency={currency1} size="28px" style={{ marginLeft: '-8px' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2.5 max-w-full">
                <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px', color: '#FBFBFD', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <DoubleCurrencySymbol currency0={currency0} currency1={currency1} quoteTokenIndex={pairStats?.quoteTokenIndex} />
                </span>
                <a
                  href={getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:opacity-80 shrink-0 inline-flex items-center"
                  style={{ color: '#978A80' }}
                  title={`View pair on ${getScanText(chainId)}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.02em', color: '#83CF84' }}>
                  {formatNumberLambda(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
                </span>
                {isBeta && <ButtonSecondary className="!w-fit !bg-orange-500/40 !px-1 !text-xs !py-0 shrink-0">Beta</ButtonSecondary>}
                <span className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#FBFBFD' }}>TVL: {formatPrice(tvl)}</span>
                {isV3Like(pair.version) && (
                  <span className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#FBFBFD' }}>
                    Annual Return: <span style={{ color: annualizedReturn >= 0 ? '#83CF84' : '#E04848' }}>{annualizedReturn ? `${formatNumberLambda(annualizedReturn, { maximumFractionDigits: 2 })}%` : '--'}</span>
                  </span>
                )}
                {!isMainnet && (
                  <span className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#83CF84' }}>
                    Fee APY: {feeAPY ? `${formatNumberLambda(feeAPY, { maximumFractionDigits: 2 })}%` : '--'}
                  </span>
                )}
              </div>
              {/* TVL-cap tag on its own line so it doesn't collide with the TVL column.
                  Gated so un-capped pools don't render an empty spacer row. */}
              {(getTvlCap(pair.chainId, pair.liquidityToken.address) !== undefined ||
                (clEnabled(pair.chainId) && concentrationLevel(pairStats?.kB, pairStats?.kQ) !== undefined)) && (
                <div style={{ marginTop: '2px' }}>
                  <PoolCapTags
                    chainId={pair.chainId}
                    poolAddress={pair.liquidityToken.address}
                    kB={pairStats?.kB}
                    kQ={pairStats?.kQ}
                    size="xs"
                  />
                </div>
              )}
              {SHOW_BGT_APR && (enableBgt || enableMerklCampaignApr) && (
                <div className="md:hidden text-[12px] inline-flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#83CF84', marginTop: '2px' }}>
                  {enableBgt ? 'BERA APR' : 'Incentive APR'}: +{formatNumberLambda(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 2 })}%
                  {enableBgt && (
                    <img src={beraIcon} alt="BERA" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                  )}
                </div>
              )}
              {showCompetitorColumns && competitor && (
                <div className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#FBFBFD', marginTop: '2px' }}>
                  {competitorName}: {formatNumberLambda(competitor.feeTier / 10000, { maximumFractionDigits: 2 })}% fee · TVL {formatCompactPrice(competitor.tvlUSD)} · 24h {formatCompactPrice(competitor.vol24hUSD)}
                </div>
              )}
              {!isMainnet && (
                <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                  <PoolBalanceBar
                    compact
                    currency0={shouldReverse ? currency1 : currency0}
                    currency1={shouldReverse ? currency0 : currency1}
                    symbol0={getTokenSymbol(shouldReverse ? currency1 : currency0, chainId) ?? ''}
                    symbol1={getTokenSymbol(shouldReverse ? currency0 : currency1, chainId) ?? ''}
                    reserve0={Number((shouldReverse ? pair.reserve1 : pair.reserve0).toSignificant(6))}
                    reserve1={Number((shouldReverse ? pair.reserve0 : pair.reserve1).toSignificant(6))}
                    price0={shouldReverse ? token1Price : token0Price}
                    price1={shouldReverse ? token0Price : token1Price}
                  />
                </div>
              )}
            </div>
          </div>
          {/* TVL */}
          <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#FBFBFD' }}>{formatPrice(tvl)}</span>
          {/* Vol 24h */}
          <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#FBFBFD' }}>{formatPrice(volume24h)}</span>
          {/* Annualized Return — V3 only (V2 has no LP-vs-UniV2 data). Green ≥0 / red <0. */}
          {isV3Like(pair.version) && (
            <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: annualizedReturn >= 0 ? '#83CF84' : '#E04848' }}>
              {annualizedReturn ? `${formatNumberLambda(annualizedReturn, { maximumFractionDigits: 2 })}%` : '--'}
            </span>
          )}
          {/* Fee APY — indexer APR converted to APY (V2 + V3); beta/non-mainnet only */}
          {!isMainnet && (
            <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#83CF84' }}>
              {feeAPY ? `${formatNumberLambda(feeAPY, { maximumFractionDigits: 2 })}%` : '--'}
            </span>
          )}
          {/* Incentive APR (green with BERA icon when applicable) */}
          {SHOW_BGT_APR && (
            <span className="max-md:hidden text-left inline-flex items-center justify-start gap-1.5" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#83CF84' }}>
              {enableBgt || enableMerklCampaignApr ? (
                <>
                  +{formatNumberLambda(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 2 })}%
                  {enableBgt && (
                    <img src={beraIcon} alt="BERA" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                  )}
                </>
              ) : (
                '--'
              )}
            </span>
          )}
          {/* Competitor Fee / TVL / 24h Volume — only for pairs that also exist
              on the rival DEX; '--' otherwise. Gated to mirror the header. */}
          {showCompetitorColumns && (
            <>
              <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#FBFBFD' }}>
                {competitor ? `${formatNumberLambda(competitor.feeTier / 10000, { maximumFractionDigits: 2 })}%` : '--'}
              </span>
              <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#FBFBFD' }}>
                {competitor ? formatCompactPrice(competitor.tvlUSD) : '--'}
              </span>
              <span className="max-md:hidden text-left" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '15px', lineHeight: '22px', color: '#FBFBFD' }}>
                {competitor ? formatCompactPrice(competitor.vol24hUSD) : '--'}
              </span>
            </>
          )}
          {/* Actions */}
          <div className="hidden md:flex items-center justify-end" style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/add/${orderedCurrencyIds(currency0, currency1, chainId, pairStats?.quoteTokenIndex).join("/")}`}
              className="no-underline whitespace-nowrap inline-flex items-center justify-center gap-1"
              style={{
                background: '#985C2A',
                borderRadius: '8px',
                padding: '6px 10px',
                height: '34px',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '13px',
                color: 'white',
                border: 'none',
              }}
            >
              + Add liquidity
            </Link>
          </div>
        </div>

        {!isMainnet && (
          <div
            className="flex flex-wrap items-center gap-3 text-[#8A7D66] text-xs py-2 justify-start"
            onClick={(e) => e.stopPropagation()}
          >
            {devStats.lambda !== undefined && (
              <Text>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</Text>
            )}
            {devStats.kappa !== undefined && (
              <Text>
                {isV3Like(version) ? 'kB' : 'Kappa'}: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}
              </Text>
            )}
            {isV3Like(version) && devStats.kQ !== undefined && (
              <Text>kQ: {formatNumberLambda(devStats.kQ, { maximumFractionDigits: 4 })}</Text>
            )}
            {/* Fee is already shown in green under the pair name — drop it here */}
            {(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee) !== undefined && (
              <Text>
                {isV3Like(version) ? 'FeeSplit' : 'ProtocolFee'}:{' '}
                {formatNumberLambda(isV3Like(version) ? devStats.feeSplit : devStats.protocolFee, { maximumFractionDigits: 4 })}
              </Text>
            )}
            {isV3Like(version) && <V3ExtraParams devStats={devStats} />}
            {canEditSettings && (
              <Settings size="14" className="cursor-pointer text-[#c4943a] hover:text-[#d4a94f]" onClick={() => setShowSettings(true)} />
            )}
          </div>
        )}

        {/* Expanded: Two side-by-side panels */}
        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Left panel: Pool stats */}
            <div className="p-[16px] sm:p-[24px]" style={{ border: '1px solid #493E35', borderRadius: '12px', background: 'transparent' }}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: '24px',
                    color: '#D8A072',
                  }}
                >
                  Pool stats
                </span>
                <a
                  href={`${getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}`}
                  target="_blank"
                  className="cursor-pointer"
                  rel="noreferrer"
                  title={`View on ${getScanText(chainId)}`}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2F2823', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Info size="16" style={{ color: '#B8ADA4' }} />
                  </div>
                </a>
                <Suspense fallback={null}>
                  <PairChartModal
                    enableAdvancedZoom
                    pair={pair}
                    name={<DoubleCurrencySymbol currency0={currency0} currency1={currency1} quoteTokenIndex={pairStats?.quoteTokenIndex} />}
                  />
                </Suspense>
                {isTest && <PairFavorite pair={pair} />}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>TVL</span><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{formatPrice(tvl)}</span></div>
                <div className="flex justify-between"><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>Total LP Tokens</span><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{formatNumber(totalPoolTokens?.toSignificant(6))}</span></div>
                <div className="flex justify-between"><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>Price per LP</span><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{formatPrice(iskHYPEUSDT ? lpPrice / 1e9 : lpPrice)}</span></div>
                <div className="flex justify-between"><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>Volume (24h)</span><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{formatPrice(volume24h)}</span></div>
                <div className="flex justify-between"><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>Volume (7d)</span><span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{formatPrice(volume7d)}</span></div>
                {[shouldReverse ? pair.token1 : pair.token0, shouldReverse ? pair.token0 : pair.token1].map((token, idx) => {
                  const currency = idx === 0 ? (shouldReverse ? currency1 : currency0) : (shouldReverse ? currency0 : currency1)
                  const reserve = idx === 0 ? (shouldReverse ? pair.reserve1 : pair.reserve0) : (shouldReverse ? pair.reserve0 : pair.reserve1)
                  const price = idx === 0 ? (shouldReverse ? token1Price : token0Price) : (shouldReverse ? token0Price : token1Price)
                  return (
                    <div key={token.address} className="flex flex-wrap justify-between items-center gap-1" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <CurrencyLogo currency={token} size="20px" />
                        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>{getTokenSymbol(currency, chainId)}</span>
                      </div>
                      <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: 'white' }}>
                        {formatNumber(reserve.toSignificant(4))} <span style={{ color: '#978A80' }}>({formatPrice(showTokenPrice ? price : price * Number(reserve.toSignificant(6)))})</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right panel: Your position */}
            <div className="p-[16px] sm:p-[24px]" style={{ border: '1px solid #493E35', borderRadius: '12px', background: 'transparent' }}>
              <span
                className="block mb-4"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '24px',
                  color: '#D8A072',
                }}
              >
                Your position
              </span>

              {account ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>LP tokens</span>
                    {poolTokenPercentage && userPoolBalance ? (
                      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: 'white' }}>
                        {totalLpDisplay ?? '0'} <span style={{ color: '#978A80' }}>({(poolTokenPercentage.toFixed(2) === '0.00' ? '0' : poolTokenPercentage.toFixed(2))}%)</span>
                      </span>
                    ) : (
                      <Loader stroke="gray" />
                    )}
                  </div>
                  {[
                    { cur: shouldReverse ? currency1 : currency0, deposited: shouldReverse ? token1Deposited : token0Deposited, price: shouldReverse ? token1Price : token0Price, amt: shouldReverse ? d1 : d0 },
                    { cur: shouldReverse ? currency0 : currency1, deposited: shouldReverse ? token0Deposited : token1Deposited, price: shouldReverse ? token0Price : token1Price, amt: shouldReverse ? d0 : d1 },
                  ].map(({ cur, deposited, price, amt }) => (
                    <div key={getTokenSymbol(cur, chainId)} className="flex flex-wrap justify-between items-center gap-1">
                      <div className="flex items-center gap-2">
                        <CurrencyLogo currency={cur} size="20px" />
                        <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: 'white' }}>Pooled {getTokenSymbol(cur, chainId)}</span>
                      </div>
                      <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: 'white' }}>
                        {deposited ? formatNumber(deposited?.toSignificant(4)) : '-'}
                        {deposited && <span style={{ color: '#978A80' }}> ({formatPrice(price * amt)})</span>}
                      </span>
                    </div>
                  ))}

                  {pairAccount && (
                    <>
                      <UserPositionRow label="LPing portfolio" value={lpPortfolio} />
                      {!isMainnet && (
                        <UserPositionRow label="HODL portfolio" value={hodlPortfolio} description="Your position value if you had just held the two tokens in your wallet." />
                      )}
                      <UserPositionRow colored label="LPing PnL" value={lpPnL} mauso={basePortfolio} />
                      {!isMainnet && (
                        <>
                          <UserPositionRow colored label="HODL PnL" value={hodlPnL} mauso={basePortfolio} description="Your profit and loss if you had just held the two tokens in your wallet." />
                          <UserPositionRow colored label="LPing vs. HODL" value={lpVsHodl} description={`The performance gap between LPing and HODL.\nMeasured as (LPing Portfolio - HODL portfolio)`} />
                        </>
                      )}
                    </>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 flex gap-3">
                    <Link
                      to={`/add/${orderedCurrencyIds(currency0, currency1, chainId, pairStats?.quoteTokenIndex).join("/")}`}
                      className="no-underline flex items-center justify-center flex-1"
                      style={{
                        background: '#985C2A',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        height: '44px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      Add
                    </Link>
                    <Link
                      to={`/remove/${orderedCurrencyIds(currency0, currency1, chainId, pairStats?.quoteTokenIndex).join("/")}`}
                      className="no-underline flex items-center justify-center flex-1"
                      style={{
                        background: '#985C2A',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        height: '44px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      Remove
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '16px', flex: 1 }}>
                  <ConnectButton.Custom>
                    {({ openConnectModal, mounted }) => (
                      <button
                        onClick={openConnectModal}
                        disabled={!mounted}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#FFFFFF',
                          background: '#985C2A',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          height: '48px',
                          cursor: 'pointer',
                        }}
                      >
                        Connect wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}
            </div>

            {/* BERA staking info */}
            {enableBgt && account && (
              <div className="md:col-span-2 hidden sm:flex gap-2 justify-center items-center text-sm text-[#b2ada9]">
                Stake your LP tokens on{' '}
                <a href={pairBGT[pair.liquidityToken.address][0]} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">BeraHub</a>{' '}
                (earn BERA), or on{' '}
                <a href={pairBGT[pair.liquidityToken.address][1]} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">Infrared</a>{' '}
                (earn iBERA)
                <img src={beraIcon} className="h-5" alt="BERA" />
              </div>
            )}
          </div>
        )}
      </AutoColumn>

      {showSettings && <PairSettingsModal isOpen={showSettings} onDismiss={() => setShowSettings(false)} pair={pair} currentValues={devStats} quoteTokenIndex={pairStats?.quoteTokenIndex} />}
    </StyledPositionCard>
  )
}

const UserPositionRow = ({
  label,
  description,
  value,
  mauso,
  colored,
}: {
  label: string
  description?: string
  value: number
  mauso?: number
  colored?: boolean
}) => {
  return (
    <FixedHeightRow>
      <div className="flex">
        <Text fontSize={16} fontWeight={500} color="white">
          {label}
        </Text>
        {description && <QuestionHelper text={description} />}
      </div>
      <Text
        fontSize={16}
        fontWeight={500}
        color={colored ? (Math.abs(value) < 0.01 ? '#8A7D66' : value > 0 ? '#35b935' : '#ff6c00') : 'white'}
      >
        {Math.abs(value) >= 0.01 ? formatPrice(value) : '~ $0'}
        {Math.abs(value) >= 0.01 && mauso && Math.abs(mauso) >= 0.01 && ` (${((value * 100) / mauso).toFixed(2)}%)`}
      </Text>
    </FixedHeightRow>
  )
}
