import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import { lazy, Suspense, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Info, Settings, ExternalLink } from 'react-feather'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'components/Rebass'
import styled from 'styled-components'

import { ButtonEmpty, ButtonPrimary, ButtonSecondary } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import { useDevStats } from 'hooks/useDevStats'
import { useTokenBalance } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { Card, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { Loader } from 'components/Loader'
const PairChartModal = lazy(() => import('components/pool/PairChartModal').then((m) => ({ default: m.PairChartModal })))
import { PairFavorite, usePairStorage } from 'components/pool/PairFavoriteIcon'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { isMainnet } from 'connectors'
import { BIG_INT_ZERO } from 'constants/common'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { shouldReversePair } from 'utils/pair'
import { formatNumber, formatNumberLambda, formatPrice } from 'utils/prices'
import { deriveLiquidityMetrics, formatLiquidityBreakdown, parseStakeLpAmount } from './liquidityUtils'
import { PairSettingsModal } from './PairSettingsModal'
import { merklCampaignPool, PairStats, usePoolStats } from './usePoolStats'

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
const StyledPositionCard = styled.div<{ bgColor?: any }>`
  position: relative;
  overflow: hidden;
  padding: 12px 16px;
  transition: all 0.2s ease;
  &:hover {
    border-color: rgba(196, 148, 58, 0.3);
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

interface PositionCardProps {
  pair: Pair
  pairStats?: PairStats
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

export default function FullPositionCard({ pair, pairStats, border }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const { isTest, isBeta } = useVersion({ chainId, pair })
  const [{ isFavorite }] = usePairStorage({ pair })
  const enableBgt = !!pairBGT[pair.liquidityToken.address]
  const enableMerklCampaignApr = merklCampaignPool.includes(pair.liquidityToken.address.toLowerCase())
  const devStats = useDevStats({ pair, enabled: !isMainnet })

  const [showMore, setShowMore] = useState(isFavorite)
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

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const shouldReverse = shouldReversePair(pair)

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

  const { tvl, lpPrice, feeAPR } = useMemo(() => {
    const r0 = token0Price * Number(pair.reserve0.toSignificant(6))
    const r1 = token1Price * Number(pair.reserve1.toSignificant(6))
    const tvl = r0 + r1
    const lpPrice = tvl / (Number(totalPoolTokens?.toSignificant(6)) || 1)
    const feeAPRFallback = tradingFee * (((Number(volume24h) || 0) * 365) / (tvl || 1))
    const feeAPR = shouldUseIndexer ? feeAPRIndexer : feeAPRFallback
    return { tvl, lpPrice, feeAPR }
  }, [token0Price, token1Price, pair, totalPoolTokens, tradingFee, volume24h, shouldUseIndexer, feeAPRIndexer])

  const stakedLiquidityTokenAmount = parseStakeLpAmount(pairAccount?.stakeLP, pair.liquidityToken)

  const { userPoolBalance, poolTokenPercentage, token0Deposited, token1Deposited } = deriveLiquidityMetrics({
    pair,
    totalPoolTokens,
    walletBalance: userPoolTokens,
    stakedBalance: stakedLiquidityTokenAmount,
  })

  const {
    stakedDisplay: stakedLpDisplay,
    walletDisplay: walletLpDisplay,
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
    <StyledPositionCard
      style={{
        border: showMore ? '1px solid rgba(196,148,58,0.4)' : '1px solid transparent',
        borderBottom: showMore ? '1px solid rgba(196,148,58,0.4)' : '1px solid rgba(196,148,58,0.08)',
        background: showMore ? 'rgba(26,21,16,0.95)' : 'transparent',
        borderRadius: showMore ? '16px' : '0',
      }}
    >
      <AutoColumn gap="0px">
        {/* Collapsed row: matching table columns */}
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center cursor-pointer py-2 max-md:grid-cols-2 max-md:gap-2"
          onClick={() => setShowMore(!showMore)}
        >
          {/* Pool name */}
          <div className="flex items-center gap-2">
            <div onClick={(e) => { e.stopPropagation(); handleCopyPoolAddress() }} className="cursor-pointer">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
            </div>
            <div>
              <Text fontWeight={700} fontSize={16} className="text-[#F5F0E8]">
                <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
              </Text>
              <Text fontSize={12} className="text-[#c4943a]">
                {formatNumber(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
              </Text>
            </div>
            {isBeta && <ButtonSecondary className="!w-fit !bg-orange-500/40 !px-1 !text-xs !py-0">Beta</ButtonSecondary>}
          </div>
          {/* TVL */}
          <Text fontWeight={600} fontSize={14} className="text-[#F5F0E8] max-md:hidden">{formatPrice(tvl)}</Text>
          {/* Vol 24h */}
          <Text fontWeight={500} fontSize={14} className="text-[#F5F0E8] max-md:hidden">{formatPrice(volume24h)}</Text>
          {/* Free APR */}
          <Text fontWeight={600} fontSize={14} className="text-[#27AE60] max-md:hidden">
            {feeAPR ? `${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%` : '--'}
          </Text>
          {/* Bgt APR */}
          <Text fontWeight={600} fontSize={14} className="text-[#27AE60] max-md:hidden">
            {enableBgt || enableMerklCampaignApr
              ? `+${formatNumber(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 1 })}%`
              : '--'}
          </Text>
          {/* Actions */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
              className="text-xs bg-transparent border border-[rgba(196,148,58,0.4)] !text-[#c4943a] hover:bg-[rgba(196,148,58,0.1)] rounded-lg px-3 py-1.5 no-underline whitespace-nowrap transition-colors inline-flex items-center gap-1"
              style={{ background: 'transparent', color: '#c4943a' }}
            >
              + Add liquidity
            </Link>
          </div>
        </div>

        {!isMainnet && showMore && (
          <div className="flex flex-wrap items-center gap-3 text-[#8A7D66] text-xs py-2">
            <Text>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</Text>
            <Text>Kappa: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}</Text>
            <Text>DevFee: {`${formatNumberLambda(devStats.protocolFee, { maximumFractionDigits: 4 })}`}</Text>
            {canEditSettings && (
              <Settings size="14" className="cursor-pointer text-[#c4943a] hover:text-[#d4a94f]" onClick={() => setShowSettings(true)} />
            )}
          </div>
        )}

        {/* Expanded: Two side-by-side panels */}
        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Left panel: Pool stats */}
            <div className="bg-[#12100b] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[18px] font-bold text-[#F5F0E8]">Pool stats</h3>
                <a
                  href={`${getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}`}
                  target="_blank"
                  className="cursor-pointer"
                  rel="noreferrer"
                  title={`View on ${getScanText(chainId)}`}
                >
                  <Info size="16" className="text-[#8A7D66] hover:text-[#c4943a]" />
                </a>
                <Suspense fallback={null}>
                  <PairChartModal
                    enableAdvancedZoom
                    pair={pair}
                    name={<DoubleCurrencySymbol currency0={currency0} currency1={currency1} />}
                  />
                </Suspense>
                {isTest && <PairFavorite pair={pair} />}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#8A7D66]">TVL</span><span className="text-[#F5F0E8]">{formatPrice(tvl)}</span></div>
                <div className="flex justify-between"><span className="text-[#8A7D66]">Total LP Tokens</span><span className="text-[#F5F0E8]">{formatNumber(totalPoolTokens?.toSignificant(6))}</span></div>
                <div className="flex justify-between"><span className="text-[#8A7D66]">Volume (24h)</span><span className="text-[#F5F0E8]">{formatPrice(volume24h)}</span></div>
                <div className="flex justify-between"><span className="text-[#8A7D66]">Volume (7d)</span><span className="text-[#F5F0E8]">{formatPrice(volume7d)}</span></div>
                <div className="flex justify-between items-center" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <CurrencyLogo currency={pair.token0} size="20px" />
                    <span className="text-[#F5F0E8]">{getTokenSymbol(currency0, chainId)}</span>
                  </div>
                  <span className="text-[#F5F0E8]">
                    {formatNumber(pair.reserve0.toSignificant(4))} <span className="text-[#8A7D66]">({formatPrice(showTokenPrice ? token0Price : token0Price * Number(pair.reserve0.toSignificant(6)))})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <CurrencyLogo currency={pair.token1} size="20px" />
                    <span className="text-[#F5F0E8]">{getTokenSymbol(currency1, chainId)}</span>
                  </div>
                  <span className="text-[#F5F0E8]">
                    {formatNumber(pair.reserve1.toSignificant(4))} <span className="text-[#8A7D66]">({formatPrice(showTokenPrice ? token1Price : token1Price * Number(pair.reserve1.toSignificant(6)))})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right panel: Your position */}
            <div className="bg-[#1a1510] border border-[rgba(196,148,58,0.15)] rounded-xl p-4">
              <h3 className="text-[18px] font-bold text-[#F5F0E8] mb-4">Your position</h3>

              {account ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8A7D66]">LP tokens</span>
                    {poolTokenPercentage && userPoolBalance ? (
                      <span className="text-[#F5F0E8]">
                        {totalLpDisplay ?? '0'} <span className="text-[#8A7D66]">({(poolTokenPercentage.toFixed(2) === '0.00' ? '0' : poolTokenPercentage.toFixed(2))}%)</span>
                      </span>
                    ) : (
                      <Loader stroke="gray" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CurrencyLogo currency={currency0} size="20px" />
                      <span className="text-[#8A7D66]">Pooled {getTokenSymbol(currency0, chainId)}</span>
                    </div>
                    <span className="text-[#F5F0E8]">
                      {token0Deposited ? formatNumber(token0Deposited?.toSignificant(4)) : '-'}
                      {token0Deposited && <span className="text-[#8A7D66]"> ({formatPrice(token0Price * Number(token0Deposited.toSignificant(4)))})</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CurrencyLogo currency={currency1} size="20px" />
                      <span className="text-[#8A7D66]">Pooled {getTokenSymbol(currency1, chainId)}</span>
                    </div>
                    <span className="text-[#F5F0E8]">
                      {token1Deposited ? formatNumber(token1Deposited?.toSignificant(4)) : '-'}
                      {token1Deposited && <span className="text-[#8A7D66]"> ({formatPrice(token1Price * Number(token1Deposited.toSignificant(4)))})</span>}
                    </span>
                  </div>

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
                  <div className="pt-2 space-y-2">
                    <ButtonPrimary
                      as={Link}
                      to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                      padding="10px"
                      className="!text-sm"
                    >
                      + Add liquidity
                    </ButtonPrimary>
                    <Link
                      to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                      className="block text-center text-sm text-[#8A7D66] hover:text-[#c4943a] no-underline transition-colors"
                    >
                      Remove
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-[#8A7D66] text-sm text-center py-8">
                  Connect wallet to view your position
                </div>
              )}
            </div>

            {/* BGT staking info */}
            {enableBgt && account && (
              <div className="md:col-span-2 flex gap-2 justify-center items-center text-sm text-[#b2ada9]">
                Stake your LP tokens on{' '}
                <a href={pairBGT[pair.liquidityToken.address][0]} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">BeraHub</a>{' '}
                (earn BGT), or on{' '}
                <a href={pairBGT[pair.liquidityToken.address][1]} target="_blank" className="cursor-pointer hover:underline text-[#e9ad6e]" rel="noreferrer">Infrared</a>{' '}
                (earn iBGT)
                <img src="https://furthermore.app/icons/bgt.svg" className="h-5" alt="BGT" />
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
