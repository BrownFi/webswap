import { JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'react-feather'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, ButtonEmpty, ButtonSecondary } from '../Button'

import { useColor } from '../../hooks/useColor'

import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo, { DoubleCurrencySymbol } from '../DoubleLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { BIG_INT_ZERO } from '../../constants'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { useQuery } from '@tanstack/react-query'
import { internalService } from 'services'
import { formatNumber, formatPrice } from 'utils/prices'
import { shouldReversePair } from 'utils/pair'
import { useTradingFee } from 'hooks/useTradingFee'
import { usePythPrices } from 'hooks/usePythPrices'

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
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: #323038;
  position: relative;
  overflow: hidden;
  padding: 16px 24px;
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const tradingFee = useTradingFee({ pair })

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

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
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <GreyCard border={border} className="lg:!p-[32px] !p-[20px]">
          <AutoColumn gap="16px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={600} fontSize={24} color={'white'} fontFamily={'Russo One'}>
                  Your position
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={500} fontSize={20} color={'white'}>
                  {getTokenSymbol(currency0, chainId)}/{getTokenSymbol(currency1, chainId)}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={20} color={'white'}>
                  {userPoolBalance.toSignificant(4)}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="8px">
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Your share:
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {poolTokenPercentage ? poolTokenPercentage.toSignificant(4) + '%' : '-'}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {getTokenSymbol(currency0, chainId)}:
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'} color={'white'}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {getTokenSymbol(currency1, chainId)}:
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'} color={'white'}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (
        <LightCard>
          <TYPE.subHeader style={{ textAlign: 'center' }} color={'white'}>
            <span role="img" aria-label="wizard-icon">
              ⭐️
            </span>{' '}
            By adding liquidity you&apos;ll earn {tradingFee}% of all trades on this pair proportional to your share of
            the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </TYPE.subHeader>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const tradingFee = useTradingFee({ pair })

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const shouldReverse = shouldReversePair(pair)

  const pythPrices = usePythPrices({ pair, currencyA: pair.token0, currencyB: pair.token1, chainId })
  const token0Price = pythPrices.CURRENCY_A
  const token1Price = pythPrices.CURRENCY_B

  const { data: poolStats } = useQuery({
    queryKey: ['getPoolStats', pair.liquidityToken.address],
    queryFn: () => {
      return internalService.getPoolStats(pair)
    }
  })

  const pool0Price = token0Price * Number(pair.reserve0.toSignificant(4))
  const pool1Price = token1Price * Number(pair.reserve1.toSignificant(4))
  const tvl = pool0Price + pool1Price
  const feeAPR = tradingFee * (((Number(poolStats?.volume24h) || 0) * 360) / (tvl || 1))

  const [showMore, setShowMore] = useState(false)

  const userPoolTokens = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  useEffect(() => {
    console.log('======== Pair', `V${pair.version} === ${pair.token0.symbol}/${pair.token1.symbol}`)
    console.log(pair.token0.symbol, token0Price, pair.token0.address)
    console.log(pair.token1.symbol, token1Price, pair.token1.address)
    console.log(pair.liquidityToken.symbol, pair.liquidityToken.address)
  }, [pair, token0Price, token1Price])

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
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair.token0)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow className="!w-fit" gap="8px">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
                <Text fontWeight={600} fontSize={20} className="text-white">
                  <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-4 gap-y-1">
                <ButtonSecondary className="!w-fit !px-1">{tradingFee}%</ButtonSecondary>
                <Text className="whitespace-nowrap text-[aqua]">TVL: {formatPrice(tvl)}</Text>
                {/* <Text className="whitespace-nowrap text-[#27E3AB]">
                  Pool APY: {formatNumber(poolStats?.apy, { maximumFractionDigits: 2 })}%
                </Text> */}
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
                  href={`${getEtherscanLink(chainId!, pair.liquidityToken.address, 'address')}`}
                  target="_blank"
                  className="cursor-pointer hover:underline"
                  rel="noreferrer"
                  title={`View on ${getScanText(chainId!)}`}
                >
                  <Info size="20" style={{ color: '#27E3AB' }} />
                </a>
              </Flex>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  TVL
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {formatPrice(tvl)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Total LP Tokens
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {formatNumber(totalPoolTokens?.toSignificant(6), {
                    minimumFractionDigits: Number(totalPoolTokens?.toFixed(2)) > 1 ? 2 : 6
                  })}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Price per LP
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {formatPrice(lpPrice)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Volume (24h)
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {formatPrice(Number(poolStats?.volume24h || 0))}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Volume (7d)
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {formatPrice(Number(poolStats?.volume7d || 0))}
                </Text>
              </FixedHeightRow>

              <Flex flexDirection={shouldReverse ? 'column-reverse' : 'column'} className="gap-2">
                <FixedHeightRow>
                  <div className="flex items-center gap-2">
                    <CurrencyLogo currency={pair.token0} />
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      {getTokenSymbol(currency0, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color={'white'} title={'' + token0Price}>
                    {formatNumber(pair.reserve0.toSignificant(4), { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[#949494]">({formatPrice(pool0Price)})</span>
                  </Text>
                </FixedHeightRow>

                <FixedHeightRow>
                  <div className="flex items-center gap-2">
                    <CurrencyLogo currency={pair.token1} />
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      {getTokenSymbol(currency1, chainId)}
                    </Text>
                  </div>
                  <Text fontSize={16} fontWeight={500} color={'white'} title={'' + token1Price}>
                    {formatNumber(pair.reserve1.toSignificant(4), { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[#949494]">({formatPrice(pool1Price)})</span>
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
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    LP tokens
                  </Text>
                  {userPoolBalance ? (
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      {userPoolBalance.toSignificant(4)}{' '}
                      <span className="text-[#949494]">
                        ({formatPrice(lpPrice * Number(userPoolBalance.toSignificant(4)))})
                      </span>
                    </Text>
                  ) : (
                    '-'
                  )}
                </FixedHeightRow>

                <Flex flexDirection={shouldReverse ? 'column-reverse' : 'column'} className="gap-2">
                  <FixedHeightRow>
                    <RowFixed className="gap-2">
                      <CurrencyLogo currency={currency0} />
                      <Text fontSize={16} fontWeight={500} color={'white'}>
                        Pooled {getTokenSymbol(currency0, chainId)}
                      </Text>
                    </RowFixed>
                    {token0Deposited ? (
                      <RowFixed className="gap-2">
                        <Text fontSize={16} fontWeight={500} color={'white'}>
                          {token0Deposited?.toSignificant(4)}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token0Price * Number(token0Deposited.toSignificant(4)))})
                        </Text>
                      </RowFixed>
                    ) : (
                      '-'
                    )}
                  </FixedHeightRow>

                  <FixedHeightRow>
                    <RowFixed className="gap-2">
                      <CurrencyLogo currency={currency1} />
                      <Text fontSize={16} fontWeight={500} color={'white'}>
                        Pooled {getTokenSymbol(currency1, chainId)}
                      </Text>
                    </RowFixed>
                    {token1Deposited ? (
                      <RowFixed className="gap-2">
                        <Text fontSize={16} fontWeight={500} color={'white'}>
                          {token1Deposited?.toSignificant(4)}
                        </Text>
                        <Text fontSize={16} fontWeight={500} color={'#949494'}>
                          ({formatPrice(token1Price * Number(token1Deposited.toSignificant(4)))})
                        </Text>
                      </RowFixed>
                    ) : (
                      '-'
                    )}
                  </FixedHeightRow>
                </Flex>

                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    Your share
                  </Text>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    {poolTokenPercentage
                      ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                      : '-'}
                  </Text>
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
