import { ChainId, Currency, JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, ButtonEmpty } from '../Button'
// import { CardNoise } from '../earn/styled'

import { useColor } from '../../hooks/useColor'

import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'
import { BIG_INT_ZERO } from '../../constants'
import { getTokenSymbol } from 'utils'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
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
                  {getTokenSymbol(currency0, chainId)}/
                  {chainId === ChainId.BOBA_MAINNET ? 'BOBA' : getTokenSymbol(currency1, chainId)}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={20} color={'white'}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="8px">
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  Your pool share:
                </Text>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
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
                  {chainId === ChainId.BOBA_MAINNET ? 'BOBA' : getTokenSymbol(currency1, chainId)}:
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
            By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the pool.
            Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </TYPE.subHeader>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance

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

  const backgroundColor = useColor(pair?.token0)
  const BOBA: Currency = {
    decimals: 18,
    symbol: 'BOBA',
    name: 'Boba Token'
  }

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      {/* <CardNoise /> */}
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <DoubleCurrencyLogo
              currency0={currency0}
              currency1={chainId === ChainId.BOBA_MAINNET ? BOBA : currency1}
              size={20}
            />
            <div className="flex items-center">
              <Text fontWeight={600} fontSize={20} className="text-white">
                {chainId !== ChainId.BOBA_MAINNET ? (
                  !currency0 || !currency1 ? (
                    <Dots>Loading</Dots>
                  ) : (
                    `${getTokenSymbol(currency0, chainId)}/${getTokenSymbol(currency1, chainId)}`
                  )
                ) : null}
                {chainId === ChainId.SONIC_TESTNET &&
                getTokenSymbol(currency0, chainId) === 'DIAM' &&
                getTokenSymbol(currency1, chainId) === 'S'
                  ? ' (FTM/USD)'
                  : getTokenSymbol(currency0, chainId) === 'S' && getTokenSymbol(currency1, chainId) === 'CORAL'
                  ? ' (FTM/ETH)'
                  : ''}
                {chainId === ChainId.BOBA_MAINNET && 'USD/BOBA'}
              </Text>
              &nbsp;<Text className="text-[#27E3AB]">(APR/1D: 95%)</Text>
            </div>
          </AutoRow>
          <RowFixed gap="8px">
            <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="fit-content"
              onClick={() => setShowMore(!showMore)}
            >
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
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <>
              <h2 className="text-[20px] font-bold text-white" style={{ fontFamily: 'Russo One' }}>
                Liquidity
              </h2>
              <FixedHeightRow>
                <div className="flex items-center">
                  <CurrencyLogo currency={pair.token0} />
                  <Text fontSize={16} fontWeight={500} color={'white'} marginLeft={'8px'}>
                    {pair.token0.symbol}
                  </Text>
                </div>

                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {pair.reserve0.toSignificant(4)}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <div className="flex items-center">
                  <CurrencyLogo currency={chainId === ChainId.BOBA_MAINNET ? BOBA : pair.token1} />
                  <Text fontSize={16} fontWeight={500} color={'white'} marginLeft={'8px'}>
                    {chainId === ChainId.BOBA_MAINNET ? 'BOBA' : pair.token1.symbol}:
                  </Text>
                </div>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {pair.reserve1.toSignificant(4)}
                </Text>
              </FixedHeightRow>

              {chainId === ChainId.SONIC_TESTNET && pair.token0.symbol === 'DIAM' && pair.token1.symbol === 'WS' && (
                <Text fontWeight={500} fontSize={14} color={'#ffffff'} marginTop={'8px'}>
                  Pair S/Diamond = FTM/USD
                </Text>
              )}
              {chainId === ChainId.SONIC_TESTNET && pair.token1.symbol === 'CORAL' && pair.token0.symbol === 'WS' && (
                <Text fontWeight={500} fontSize={14} color={'#ffffff'} marginTop={'8px'}>
                  Pair S/CORAL = FTM/ETH
                </Text>
              )}
            </>

            {account && (
              <>
                <div className="w-full h-[1px] my-[8px] bg-white opacity-[0.1]" />
                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    Your total pool tokens:
                  </Text>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                  </Text>
                </FixedHeightRow>
                {stakedBalance && (
                  <FixedHeightRow>
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      Pool tokens in rewards pool:
                    </Text>
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      {stakedBalance.toSignificant(4)}
                    </Text>
                  </FixedHeightRow>
                )}
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      Pooled {getTokenSymbol(currency0, chainId)}
                    </Text>
                  </RowFixed>
                  {token0Deposited ? (
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500} marginLeft={'6px'} color={'white'}>
                        {token0Deposited?.toSignificant(6)}
                      </Text>
                      <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                    </RowFixed>
                  ) : (
                    '-'
                  )}
                </FixedHeightRow>

                <FixedHeightRow>
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} color={'white'}>
                      Pooled {chainId === ChainId.BOBA_MAINNET ? 'BOBA' : getTokenSymbol(currency1, chainId)}:
                    </Text>
                  </RowFixed>
                  {token1Deposited ? (
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500} marginLeft={'6px'} color={'white'}>
                        {token1Deposited?.toSignificant(6)}
                      </Text>
                      <CurrencyLogo
                        size="20px"
                        style={{ marginLeft: '8px' }}
                        currency={chainId === ChainId.BOBA_MAINNET ? BOBA : currency1}
                      />
                    </RowFixed>
                  ) : (
                    '-'
                  )}
                </FixedHeightRow>

                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    Your pool share:
                  </Text>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    {poolTokenPercentage
                      ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                      : '-'}
                  </Text>
                </FixedHeightRow>

                <FixedHeightRow>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    Your gains:
                  </Text>
                  <Text fontSize={16} fontWeight={500} color={'white'}>
                    +$100
                  </Text>
                </FixedHeightRow>
              </>
            )}

            {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.raw, BIG_INT_ZERO) && (
              <RowBetween marginTop="10px">
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  to={`/add/${currencyId(currency0)}/${
                    chainId === ChainId.BOBA_MAINNET
                      ? '0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7'
                      : currencyId(currency1)
                  }`}
                  width="48%"
                >
                  Add
                </ButtonPrimary>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  width="48%"
                  to={`/remove/${currencyId(currency0)}/${
                    chainId === ChainId.BOBA_MAINNET
                      ? '0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7'
                      : currencyId(currency1)
                  }`}
                >
                  Remove
                </ButtonPrimary>
              </RowBetween>
            )}
            {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
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
