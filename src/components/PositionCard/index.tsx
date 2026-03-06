import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, ExternalLink } from 'react-feather'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
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
import { PairChartModal } from 'components/pool/PairChartModal'
import { PairFavorite, usePairStorage } from 'components/pool/PairFavoriteIcon'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_ZERO } from 'constants/common'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { isMainnet } from 'connectors'
import { shouldReversePair } from 'utils/pair'
import { formatNumber, formatNumberLambda, formatPrice } from 'utils/prices'
import { merklCampaignPool, PairStats, usePoolStats } from './usePoolStats'
import { MouseoverTooltip } from 'components/Tooltip'
import { deriveLiquidityMetrics, formatLiquidityBreakdown, parseStakeLpAmount } from './liquidityUtils'

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
const StyledPositionCard = styled(LightCard)<{ bgColor?: any }>`
  border: none;
  background: #323038;
  position: relative;
  overflow: hidden;
  padding: 16px 24px;
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
  const token0Price = pythPrices.CURRENCY_A
  const token1Price = pythPrices.CURRENCY_B

  const reserve0Price = token0Price * Number(pair.reserve0.toSignificant(4))
  const reserve1Price = token1Price * Number(pair.reserve1.toSignificant(4))

  const tvl = reserve0Price + reserve1Price
  const lpPrice = tvl / (Number(totalPoolTokens?.toSignificant(4)) || 1)
  const feeAPRLiem = tradingFee * (((Number(volume24h) || 0) * 360) / (tvl || 1))
  const feeAPR = shouldUseIndexer ? feeAPRIndexer : feeAPRLiem

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
    <StyledPositionCard border={border}>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow className="!w-fit" gap="8px">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div onClick={handleCopyPoolAddress} className="cursor-pointer">
                    <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
                  </div>
                  <Text fontWeight={600} fontSize={20} className="text-white !min-w-[160px]">
                    <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
                  </Text>
                </div>
                {isBeta && <ButtonSecondary className="!w-fit !bg-orange-500/40 !px-1">Beta</ButtonSecondary>}
              </div>
              <div className="flex flex-wrap items-center gap-1 gap-y-1">
                <div className="min-w-[60px]">
                  <ButtonSecondary className="!w-fit !px-1">
                    {formatNumber(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 4 })}%
                  </ButtonSecondary>
                </div>
                <Text className="whitespace-nowrap text-[aqua] !min-w-[120px]">TVL: {formatPrice(tvl)}</Text>
                {enableBgt || enableMerklCampaignApr ? (
                  <MouseoverTooltip
                    text={
                      <div className="text-sm">
                        <div className="font-bold">APR</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[#dcdcdc]">Fee APR:</div>
                          <div className="text-[#27E3AB]">
                            {`${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-[#dcdcdc]">{enableBgt ? 'BGT' : 'Merkl'} APR:</div>
                          <div className="text-[#e5b28e]">
                            {`${formatNumber(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 2 })}%`}
                          </div>
                          {enableMerklCampaignApr && (
                            <div className="flex items-center gap-2">
                              <a
                                href="https://app.merkl.xyz/opportunities/linea/ERC20LOGPROCESSOR/0xA87E2c65F2b79164bab690Ec6808431D8c419598"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center"
                              >
                                <div>Check</div>
                                <ExternalLink
                                  size="14"
                                  className="ml-0.5 cursor-pointer text-blue-600 hover:text-blue-600"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-[#dcdcdc]">Total APR:</div>
                          <div className="text-[#27E3AB]">
                            {`${formatNumber(feeAPR + (enableBgt ? bgtAPR : merklCampaignApr), {
                              maximumFractionDigits: 2,
                            })}%`}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="flex gap-1 items-center">
                      <Text className="whitespace-nowrap text-[#27E3AB]">
                        APR: {`${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%`}
                        <span className="text-[#e5b28e]">
                          {` + ${formatNumber(enableBgt ? bgtAPR : merklCampaignApr, { maximumFractionDigits: 2 })}%`}
                        </span>
                      </Text>
                      {enableBgt ? (
                        <img src="https://furthermore.app/icons/bgt.svg" className="h-5 border-none" />
                      ) : (
                        <img src="https://lineascan.build/token/images/weth_32.png" className="h-5" />
                      )}
                    </div>
                  </MouseoverTooltip>
                ) : (
                  <Text className="whitespace-nowrap text-[#27E3AB]">
                    Fee APR: {feeAPR ? `${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%` : '...'}
                  </Text>
                )}
              </div>
            </div>
          </AutoRow>
          <div className="flex-1 flex justify-end">
            <ButtonEmpty padding="0px" width="fit-content" onClick={() => setShowMore(!showMore)}>
              <div className="text-[#27E3AB] flex items-center">
                {showMore ? (
                  <>
                    Manage
                    <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                  </>
                ) : (
                  <>
                    Manage
                    <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                  </>
                )}
              </div>
            </ButtonEmpty>
          </div>
        </FixedHeightRow>

        {!isMainnet && (
          <div className="flex flex-wrap gap-3 text-white text-sm">
            <Text>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</Text>
            <Text>Kappa: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}</Text>
            <Text>DevFee: {`${formatNumberLambda(devStats.protocolFee, { maximumFractionDigits: 4 })}`}</Text>
          </div>
        )}

        {showMore && (
          <AutoColumn gap="8px">
            <>
              <Flex alignItems="center" justifyContent="space-between" className="gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[20px] font-medium text-white" style={{ fontFamily: 'Russo One' }}>
                    Pool stats
                  </h2>
                  <div className="flex gap-2">
                    <a
                      href={`${getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}`}
                      target="_blank"
                      className="cursor-pointer"
                      rel="noreferrer"
                      title={`View on ${getScanText(chainId)}`}
                    >
                      <Info size="20" style={{ color: '#27E3AB' }} />
                    </a>
                    <PairChartModal
                      enableAdvancedZoom
                      pair={pair}
                      name={<DoubleCurrencySymbol currency0={currency0} currency1={currency1} />}
                    />
                  </div>
                </div>
                {isTest && <PairFavorite pair={pair} />}
              </Flex>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color="white">
                  TVL
                </Text>
                <Text fontSize={16} fontWeight={500} color="white">
                  {formatPrice(tvl)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color="white">
                  Total LP Tokens
                </Text>
                <Text fontSize={16} fontWeight={500} color="white">
                  {formatNumber(totalPoolTokens?.toSignificant(6))}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color="white">
                  Price per LP
                </Text>
                <Text fontSize={16} fontWeight={500} color="white">
                  {formatPrice(iskHYPEUSDT ? lpPrice / 1e9 : lpPrice)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color="white">
                  Volume (24h)
                </Text>
                <Text fontSize={16} fontWeight={500} color="white">
                  {formatPrice(volume24h)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color="white">
                  Volume (7d)
                </Text>
                <Text fontSize={16} fontWeight={500} color="white">
                  {formatPrice(volume7d)}
                </Text>
              </FixedHeightRow>

              <Flex flexDirection={shouldReverse ? 'column-reverse' : 'column'} className="gap-2">
                <FixedHeightRow>
                  <div className="flex items-center gap-2" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                    <CurrencyLogo currency={pair.token0} />
                    <Text fontSize={16} fontWeight={500} color="white">
                      {getTokenSymbol(currency0, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color="white">
                    {formatNumber(pair.reserve0.toSignificant(4))}{' '}
                    <span className="text-[#949494]">
                      ({formatPrice(showTokenPrice ? token0Price : reserve0Price)})
                    </span>
                  </Text>
                </FixedHeightRow>

                <FixedHeightRow>
                  <div className="flex items-center gap-2" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                    <CurrencyLogo currency={pair.token1} />
                    <Text fontSize={16} fontWeight={500} color="white">
                      {getTokenSymbol(currency1, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color="white">
                    {formatNumber(pair.reserve1.toSignificant(4))}{' '}
                    <span className="text-[#949494]">
                      ({formatPrice(showTokenPrice ? token1Price : reserve1Price)})
                    </span>
                  </Text>
                </FixedHeightRow>
              </Flex>
            </>

            {account && (
              <>
                <div className="w-full h-[1px] my-[8px] bg-white opacity-[0.1]" />
                <h2 className="text-[20px] font-medium text-white" style={{ fontFamily: 'Russo One' }}>
                  Your position
                </h2>

                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color="white">
                    LP tokens
                  </Text>
                  {poolTokenPercentage && userPoolBalance ? (
                    <RowFixed className="gap-1 flex-wrap items-center">
                      {stakedLpDisplay && (
                        <Text fontSize={16} fontWeight={500} color="#e5b28e">
                          {stakedLpDisplay} staked
                        </Text>
                      )}
                      {walletLpDisplay && (
                        <>
                          {stakedLpDisplay && (
                            <Text fontSize={16} fontWeight={500} color="white">
                              +
                            </Text>
                          )}
                          <Text fontSize={16} fontWeight={500} color="white">
                            {walletLpDisplay}
                          </Text>
                        </>
                      )}
                      {!stakedLpDisplay && !walletLpDisplay && (
                        <Text fontSize={16} fontWeight={500} color="white">
                          {totalLpDisplay ?? '0'}
                        </Text>
                      )}
                      <Text fontSize={16} fontWeight={500} color="#949494">
                        ({(poolTokenPercentage.toFixed(2) === '0.00' ? '0' : poolTokenPercentage.toFixed(2)) + '%'})
                      </Text>
                    </RowFixed>
                  ) : (
                    <Loader stroke="gray" />
                  )}
                </FixedHeightRow>

                <Flex flexDirection={shouldReverse ? 'column-reverse' : 'column'} className="gap-2">
                  <FixedHeightRow>
                    <RowFixed className="gap-2" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                      <CurrencyLogo currency={currency0} />
                      <Text fontSize={16} fontWeight={500} color="white">
                        Pooled {getTokenSymbol(currency0, chainId)}
                      </Text>
                    </RowFixed>
                    {token0Deposited ? (
                      <RowFixed className="gap-1">
                        <Text fontSize={16} fontWeight={500} color="white">
                          {formatNumber(token0Deposited?.toSignificant(4))}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token0Price * (showTokenPrice ? 1 : Number(token0Deposited.toSignificant(4))))})
                        </Text>
                      </RowFixed>
                    ) : (
                      <Text fontSize={16} fontWeight={500} color="gray">
                        -
                      </Text>
                    )}
                  </FixedHeightRow>

                  <FixedHeightRow>
                    <RowFixed className="gap-2" onClick={() => setShowTokenPrice(!showTokenPrice)}>
                      <CurrencyLogo currency={currency1} />
                      <Text fontSize={16} fontWeight={500} color="white">
                        Pooled {getTokenSymbol(currency1, chainId)}
                      </Text>
                    </RowFixed>
                    {token1Deposited ? (
                      <RowFixed className="gap-1">
                        <Text fontSize={16} fontWeight={500} color="white">
                          {formatNumber(token1Deposited?.toSignificant(4))}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token1Price * (showTokenPrice ? 1 : Number(token1Deposited.toSignificant(4))))})
                        </Text>
                      </RowFixed>
                    ) : (
                      <Text fontSize={16} fontWeight={500} color="gray">
                        -
                      </Text>
                    )}
                  </FixedHeightRow>
                </Flex>

                {account && pairAccount && (
                  <>
                    <UserPositionRow label="LPing portfolio" value={pairAccount.lpPortfolio} />
                    <UserPositionRow
                      label="HODL portfolio"
                      value={pairAccount.bnhPortfolio}
                      description="Your position value if you had just held the two tokens in your wallet."
                    />
                    <UserPositionRow
                      colored
                      label="LPing PnL"
                      value={pairAccount.unrealizedPnL}
                      mauso={pairAccount.basePortfolio}
                    />
                    <UserPositionRow
                      colored
                      label="HODL PnL"
                      value={pairAccount.bnhPortfolio - pairAccount.basePortfolio}
                      mauso={pairAccount.basePortfolio}
                      description="Your profit and loss if if you had just held the two tokens in your wallet."
                    />
                    <UserPositionRow
                      colored
                      label="LPing vs. HODL"
                      value={pairAccount.lpPortfolio - pairAccount.bnhPortfolio}
                      description={`The performance gap between LPing and HODL.\nMeasured as (LPing Portfolio - HODL portfolio)`}
                    />
                  </>
                )}
              </>
            )}

            <RowBetween marginTop="10px">
              <ButtonPrimary
                padding="8px"
                as={Link}
                to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                width="48%"
              >
                Add
              </ButtonPrimary>
              {userPoolTokens && JSBI.greaterThan(userPoolTokens.raw, BIG_INT_ZERO) ? (
                <ButtonPrimary
                  padding="8px"
                  as={Link}
                  width="48%"
                  to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                >
                  Remove
                </ButtonPrimary>
              ) : (
                <ButtonPrimary disabled padding="8px" width="48%">
                  Remove
                </ButtonPrimary>
              )}
            </RowBetween>

            {enableBgt && account && (
              <div className="flex gap-2 justify-center items-center mt-2">
                <div className="text-center text-[#b2ada9]">
                  Stake your LP tokens on{' '}
                  <a
                    href={pairBGT[pair.liquidityToken.address][0]}
                    target="_blank"
                    className="cursor-pointer hover:underline text-[#e9ad6e]"
                    rel="noreferrer"
                  >
                    BeraHub
                  </a>{' '}
                  (earn BGT), or on{' '}
                  <a
                    href={pairBGT[pair.liquidityToken.address][1]}
                    target="_blank"
                    className="cursor-pointer hover:underline text-[#e9ad6e]"
                    rel="noreferrer"
                  >
                    Infrared
                  </a>{' '}
                  (earn iBGT)
                </div>
                <img src="https://furthermore.app/icons/bgt.svg" className="h-5" />
              </div>
            )}
          </AutoColumn>
        )}
      </AutoColumn>
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
        color={colored ? (Math.abs(value) < 0.01 ? '#949494' : value > 0 ? '#35b935' : '#ff6c00') : 'white'}
      >
        {Math.abs(value) >= 0.01 ? formatPrice(value) : '~ $0'}
        {Math.abs(value) >= 0.01 && mauso && ` (${((value * 100) / mauso).toFixed(2)}%)`}
      </Text>
    </FixedHeightRow>
  )
}
