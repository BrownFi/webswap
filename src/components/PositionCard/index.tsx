import { JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'react-feather'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { useActiveWeb3React } from 'hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { ButtonEmpty, ButtonPrimary, ButtonSecondary } from 'components/Button'

import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { shouldReversePair } from 'utils/pair'
import { formatNumber, formatPrice } from 'utils/prices'
import { BIG_INT_ZERO } from 'constants/common'
import { Card, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { PairStats, usePoolStats } from './usePoolStats'
import { Loader } from 'components/Loader'

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

interface PositionCardProps {
  pair: Pair
  pairStats?: PairStats
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

export default function FullPositionCard({ pair, pairStats, border, stakedBalance }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const { isBeta } = useVersion({ chainId })

  const [showMore, setShowMore] = useState(false)

  const { tradingFee, totalSupply: totalPoolTokens, feeAPR, volume24h, volume7d } = usePoolStats({ pair, pairStats })

  const userPoolTokens = useTokenBalance(account ?? undefined, pair.liquidityToken)

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const shouldReverse = shouldReversePair(pair)

  const pythPrices = usePythPrices({ chainId, pair, pairStats, currencyA: pair.token0, currencyB: pair.token1 })
  const token0Price = pythPrices.CURRENCY_A
  const token1Price = pythPrices.CURRENCY_B

  const reserve0Price = token0Price * Number(pair.reserve0.toSignificant(4))
  const reserve1Price = token1Price * Number(pair.reserve1.toSignificant(4))

  const tvl = reserve0Price + reserve1Price
  const lpPrice = tvl / (Number(totalPoolTokens?.toSignificant(4)) || 1)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userPoolTokens?.add(stakedBalance) : userPoolTokens

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <StyledPositionCard border={border}>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow className="!w-fit" gap="8px">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
                  <Text fontWeight={600} fontSize={20} className="text-white !min-w-[160px]">
                    <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
                  </Text>
                </div>
                {isBeta && <ButtonSecondary className="!w-fit !bg-orange-500/40 !px-1">Beta</ButtonSecondary>}
              </div>
              <div className="flex flex-wrap items-center gap-1 gap-y-1">
                <div className="min-w-[60px]">
                  <ButtonSecondary className="!w-fit !px-1">{tradingFee}%</ButtonSecondary>
                </div>
                <Text className="whitespace-nowrap text-[aqua] !min-w-[120px]">TVL: {formatPrice(tvl)}</Text>
                <Text className="whitespace-nowrap text-[#27E3AB]">
                  Fee APR: {feeAPR ? `${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%` : '...'}
                </Text>
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

        {showMore && (
          <AutoColumn gap="8px">
            <>
              <Flex alignItems="center">
                <h2 className="text-[20px] mr-3 font-medium text-white" style={{ fontFamily: 'Russo One' }}>
                  Pool stats
                </h2>
                <a
                  href={`${getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}`}
                  target="_blank"
                  className="cursor-pointer hover:underline"
                  rel="noreferrer"
                  title={`View on ${getScanText(chainId)}`}
                >
                  <Info size="20" style={{ color: '#27E3AB' }} />
                </a>
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
                  {formatPrice(lpPrice)}
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
                  <div className="flex items-center gap-2">
                    <CurrencyLogo currency={pair.token0} />
                    <Text fontSize={16} fontWeight={500} color="white">
                      {getTokenSymbol(currency0, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color="white" title={'' + token0Price}>
                    {formatNumber(pair.reserve0.toSignificant(4))}{' '}
                    <span className="text-[#949494]">({formatPrice(reserve0Price)})</span>
                  </Text>
                </FixedHeightRow>

                <FixedHeightRow>
                  <div className="flex items-center gap-2">
                    <CurrencyLogo currency={pair.token1} />
                    <Text fontSize={16} fontWeight={500} color="white">
                      {getTokenSymbol(currency1, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color="white" title={'' + token1Price}>
                    {formatNumber(pair.reserve1.toSignificant(4))}{' '}
                    <span className="text-[#949494]">({formatPrice(reserve1Price)})</span>
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
                  {userPoolBalance ? (
                    <Text fontSize={16} fontWeight={500} color="white">
                      {formatNumber(userPoolBalance.toSignificant(4))}{' '}
                      <span className="text-[#949494]">
                        ({formatPrice(lpPrice * Number(userPoolBalance.toSignificant(4)))})
                      </span>
                    </Text>
                  ) : (
                    <Loader stroke="gray" />
                  )}
                </FixedHeightRow>

                <Flex flexDirection={shouldReverse ? 'column-reverse' : 'column'} className="gap-2">
                  <FixedHeightRow>
                    <RowFixed className="gap-2">
                      <CurrencyLogo currency={currency0} />
                      <Text fontSize={16} fontWeight={500} color="white">
                        Pooled {getTokenSymbol(currency0, chainId)}
                      </Text>
                    </RowFixed>
                    {token0Deposited ? (
                      <RowFixed className="gap-2">
                        <Text fontSize={16} fontWeight={500} color="white">
                          {formatNumber(token0Deposited?.toSignificant(4))}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token0Price * Number(token0Deposited.toSignificant(4)))})
                        </Text>
                      </RowFixed>
                    ) : (
                      <Loader stroke="gray" />
                    )}
                  </FixedHeightRow>

                  <FixedHeightRow>
                    <RowFixed className="gap-2">
                      <CurrencyLogo currency={currency1} />
                      <Text fontSize={16} fontWeight={500} color="white">
                        Pooled {getTokenSymbol(currency1, chainId)}
                      </Text>
                    </RowFixed>
                    {token1Deposited ? (
                      <RowFixed className="gap-2">
                        <Text fontSize={16} fontWeight={500} color="white">
                          {formatNumber(token1Deposited?.toSignificant(4))}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token1Price * Number(token1Deposited.toSignificant(4)))})
                        </Text>
                      </RowFixed>
                    ) : (
                      <Loader stroke="gray" />
                    )}
                  </FixedHeightRow>
                </Flex>

                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color="white">
                    Your share
                  </Text>
                  {poolTokenPercentage ? (
                    <Text fontSize={16} fontWeight={500} color="white">
                      {(poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'}
                    </Text>
                  ) : (
                    <Loader stroke="gray" />
                  )}
                </FixedHeightRow>
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

            {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
              <ButtonPrimary
                padding="8px"
                as={Link}
                to={`/uni/${currencyId(currency0)}/${currencyId(currency1)}`}
                width="100%"
              >
                Manage Liquidity in Rewards Pool
              </ButtonPrimary>
            )}
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
  )
}
