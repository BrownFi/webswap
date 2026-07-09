import { isV3Like, ChainId } from '@brownfi/sdk'
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
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { isMainnet } from 'connectors'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { orderedCurrencyIds, shouldReverseDisplay } from 'utils/pair'
import { formatNumber, formatNumberLambda, formatPrice } from 'utils/prices'
import { deriveLiquidityMetrics, formatLiquidityBreakdown, parseStakeLpAmount } from './liquidityUtils'
import { PairSettingsModal } from './PairSettingsModal'
import { merklCampaignPool, getPairBgt, PairStats, usePoolStats, computeV3FeeApr, USE_V3_UNIV2_COMPARISON } from './usePoolStats'

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
    padding: 16px;
    border-radius: 12px;
  }
`

// Human-facing "where to stake your LP" links for the BGT staking-info blurb.
// Keys are LOWERCASE (look up via `getBgtStakeLinks` — pool ids reach us both
// checksummed and lowercase). `infrared` is optional: the new V3 cutting-board
// vaults (2026-06-23) currently stake on BeraHub only. Whether the BGT APR % is
// shown is gated separately on the shared `getPairBgt()` whitelist — this map
// only supplies the stake URLs.
const pairBGT: Record<string, { berahub: string; infrared?: string }> = {
  // V2
  '0xd932c344e21ef6c3a94971bf4d4cc71304e2a66c': {
    // BERA/HONEY
    berahub: 'https://hub.berachain.com/earn/0x2cb34eeadb1e7ae9cc7bafb84a189e9d921e193a',
    infrared: 'https://infrared.finance/pol-vaults/brownfi-wbera-honey',
  },
  '0xd57da672354905b9e42df077df77e554dc5fd1cc': {
    // BERA/USDC.e
    berahub: 'https://hub.berachain.com/earn/0x519cef5cc2913bcefdd03d0a22601c19794c4581',
    infrared: 'https://infrared.finance/pol-vaults/brownfi-wbera-usdc.e',
  },
  // V3 (new cutting board 2026-06-23 — BeraHub only for now)
  '0xc123bc9259d1a99add5a2c512498ac146dd2bade': {
    // WETH/USDC.e V3
    berahub: 'https://hub.berachain.com/earn/0xa57d4c595a000e20f8ea8f82663a9c7b15d60168',
  },
  '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26': {
    // BERA/USDC.e V3
    berahub: 'https://hub.berachain.com/earn/0xd54ec45cca5d428c3aef05993195c389c0b82b4e',
  },
  '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c': {
    // WBERA/HONEY V3
    berahub: 'https://hub.berachain.com/earn/0x3f0cf0c62e5d7617c3f965bfefc656af650e459e',
  },
}

/** Case-insensitive lookup into `pairBGT` (stake links). */
const getBgtStakeLinks = (address?: string | null) => (address ? pairBGT[address.toLowerCase()] : undefined)

interface PositionCardProps {
  pair: Pair
  pairStats?: PairStats
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

export default function FullPositionCard({ pair, pairStats, border }: PositionCardProps) {
  const navigate = useNavigate()
  const { account, chainId } = useActiveWeb3React()
  const { isTest, isBeta, version } = useVersion({ chainId, pair })
  const [{ isFavorite }] = usePairStorage({ pair })
  // Gate the BGT APR % on the shared whitelist (case-insensitive, includes the
  // new V3 vaults) AND V3-only: V2 pools no longer surface BGT — the cutting
  // board moved emissions to V3, and the fading V2 APR misled users into
  // thinking V2 rewards were still high.
  const enableBgt = !!getPairBgt(pair.liquidityToken.address) && isV3Like(pair.version)
  const bgtStakeLinks = getBgtStakeLinks(pair.liquidityToken.address)
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
    bgtAPR,
    volume24h,
    volume7d,
    pairAccount,
    merklCampaignApr,
  } = usePoolStats({
    pair,
    pairStats,
    enableFetchDetail: showMore,
  })

  const userPoolTokens = useTokenBalance(account ?? undefined, showMore ? pair.liquidityToken : undefined)

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
  const token0Price = pythPrices.CURRENCY_A || pairStats?.token0?.price || 0
  const token1Price = pythPrices.CURRENCY_B || pairStats?.token1?.price || 0

  const { tvl, lpPrice, columnValue } = useMemo(() => {
    const r0 = token0Price * Number(pair.reserve0.toSignificant(6))
    const r1 = token1Price * Number(pair.reserve1.toSignificant(6))
    const tvl = r0 + r1
    const lpPrice = tvl / (Number(totalPoolTokens?.toSignificant(6)) || 1)
    // APR divides by TVL, so a near-empty pool produces absurd values. Below a
    // $10 TVL floor the numbers are meaningless — zero them so the column renders
    // "--". Threshold, not `tvl > 0`, because a low-TVL pool still blows up.
    const MIN_TVL_FOR_RATIOS = 10
    const ratiosMeaningful = tvl >= MIN_TVL_FOR_RATIOS
    // Returns column. V3 (with the LP-vs-UniV2 comparison enabled) shows the
    // annualized LP-vs-UniV2 outperformance ("Annualized Return"); V2 shows the
    // simple 24h-fees/TVL daily ratio ("24h Fees / TVL") — Jason 2026-06-18.
    const feeDay = Number(pairStats?.feeDay) || 0
    const feeOverTvl = ratiosMeaningful ? (feeDay / tvl) * 100 : 0
    const columnValue = !ratiosMeaningful
      ? 0
      : isV3Like(pair.version) && USE_V3_UNIV2_COMPARISON
        ? computeV3FeeApr(pairStats)
        : feeOverTvl
    return { tvl, lpPrice, columnValue }
  }, [token0Price, token1Price, pair, totalPoolTokens, pairStats])

  const stakedLiquidityTokenAmount = parseStakeLpAmount(pairAccount?.stakeLP, pair.liquidityToken)

  const { userPoolBalance, poolTokenPercentage, token0Deposited, token1Deposited } = deriveLiquidityMetrics({
    pair,
    totalPoolTokens,
    walletBalance: userPoolTokens,
    stakedBalance: stakedLiquidityTokenAmount,
  })

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
          onClick={() => navigate(`/pool/${pair.chainId}/${pair.liquidityToken.address}?v=${versionToSlug(pair.version)}`)}
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
                <span className="text-[16px] sm:text-[20px]" style={{ fontFamily: 'Inter', fontWeight: 600, lineHeight: '30px', color: '#FBFBFD', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <span className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>TVL: {formatPrice(tvl)}</span>
                <span className="md:hidden text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80' }}>
                  {isV3Like(pair.version) && USE_V3_UNIV2_COMPARISON ? 'Annualized Return' : '24h Fees / TVL'}: <span style={{ color: isV3Like(pair.version) && USE_V3_UNIV2_COMPARISON ? '#83CF84' : '#FBFBFD' }}>{columnValue > 0 ? `${formatNumberLambda(columnValue, { maximumFractionDigits: 2 })}%` : '--'}</span>
                </span>
              </div>
              {(enableBgt || enableMerklCampaignApr) && (
                <div className="md:hidden text-[12px] inline-flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 500, color: '#978A80', marginTop: '2px' }}>
                  {enableBgt ? 'BERA APR' : 'Incentive APR'}: <span style={{ color: '#83CF84' }}>+{formatNumberLambda(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 2 })}%</span>
                  {enableBgt && (
                    <img src={beraIcon} alt="BERA" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                  )}
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
          <span className="max-md:hidden text-left" style={{ flex: isV3Like(pair.version) ? 1 : 1.3, fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>{formatPrice(tvl)}</span>
          {/* Vol 24h */}
          <span className="max-md:hidden text-left" style={{ flex: isV3Like(pair.version) ? 1 : 1.3, fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>{formatPrice(volume24h)}</span>
          {/* Returns column — V3: annualized LP-vs-UniV2 return (green); V2: 24h
              fees / TVL (white, per Jason — green is reserved for the V3 return). */}
          <span className="max-md:hidden text-left" style={{ flex: isV3Like(pair.version) ? 1.3 : 1.7, fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: isV3Like(pair.version) && USE_V3_UNIV2_COMPARISON ? '#83CF84' : '#FBFBFD' }}>
            {columnValue > 0 ? `${formatNumberLambda(columnValue, { maximumFractionDigits: 2 })}%` : '--'}
          </span>
          {/* BGT APR — Berachain + V3-only (V2 BGT hidden; see enableBgt note). */}
          {chainId === ChainId.BERA_MAINNET && isV3Like(pair.version) && (
            <span className="max-md:hidden text-left inline-flex items-center justify-start gap-1.5" style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#83CF84' }}>
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
          {/* Actions */}
          <div className="hidden md:flex items-center justify-end" style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/add/${orderedCurrencyIds(currency0, currency1, chainId, pairStats?.quoteTokenIndex).join("/")}`}
              className="no-underline whitespace-nowrap inline-flex items-center justify-center gap-1"
              style={{
                background: '#985C2A',
                borderRadius: '8px',
                padding: '6px 12px',
                height: '40px',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
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
                    { cur: shouldReverse ? currency1 : currency0, deposited: shouldReverse ? token1Deposited : token0Deposited, price: shouldReverse ? token1Price : token0Price },
                    { cur: shouldReverse ? currency0 : currency1, deposited: shouldReverse ? token0Deposited : token1Deposited, price: shouldReverse ? token0Price : token1Price },
                  ].map(({ cur, deposited, price }) => (
                    <div key={getTokenSymbol(cur, chainId)} className="flex flex-wrap justify-between items-center gap-1">
                      <div className="flex items-center gap-2">
                        <CurrencyLogo currency={cur} size="20px" />
                        <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: 'white' }}>Pooled {getTokenSymbol(cur, chainId)}</span>
                      </div>
                      <span className="text-[14px] sm:text-[16px]" style={{ fontFamily: 'Inter', fontWeight: 500, color: 'white' }}>
                        {deposited ? formatNumber(deposited?.toSignificant(4)) : '-'}
                        {deposited && <span style={{ color: '#978A80' }}> ({formatPrice(price * Number(deposited.toSignificant(4)))})</span>}
                      </span>
                    </div>
                  ))}

                  {pairAccount && (
                    <>
                      <UserPositionRow label="LPing portfolio" value={pairAccount.lpPortfolio} />
                      {!isMainnet && (
                        <UserPositionRow label="HODL portfolio" value={pairAccount.bnhPortfolio} description="Your position value if you had just held the two tokens in your wallet." />
                      )}
                      <UserPositionRow colored label="LPing PnL" value={pairAccount.unrealizedPnL} mauso={pairAccount.basePortfolio} />
                      {!isMainnet && (
                        <>
                          <UserPositionRow colored label="HODL PnL" value={pairAccount.bnhPortfolio - pairAccount.basePortfolio} mauso={pairAccount.basePortfolio} description="Your profit and loss if you had just held the two tokens in your wallet." />
                          <UserPositionRow colored label="LPing vs. HODL" value={pairAccount.lpPortfolio - pairAccount.bnhPortfolio} description={`The performance gap between LPing and HODL.\nMeasured as (LPing Portfolio - HODL portfolio)`} />
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

            {/* BGT staking info */}
            {bgtStakeLinks && account && (
              <div className="md:col-span-2 hidden sm:flex gap-2 justify-center items-center text-sm text-[#b2ada9]">
                Stake your LP tokens on{' '}
                <a href={bgtStakeLinks.berahub} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">BeraHub</a>{' '}
                (earn BERA){bgtStakeLinks.infrared ? ', or on ' : ' '}
                {bgtStakeLinks.infrared && (
                  <>
                    <a href={bgtStakeLinks.infrared} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">Infrared</a>{' '}
                    (earn iBERA)
                  </>
                )}
                <img src={beraIcon} className="h-5" alt="BERA" />
              </div>
            )}
          </div>
        )}
      </AutoColumn>

      {showSettings && <PairSettingsModal isOpen={showSettings} onDismiss={() => setShowSettings(false)} pair={pair} currentValues={devStats} />}
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
