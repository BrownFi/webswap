import { JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { darken } from 'polished'
import { useState } from 'react'
import { Text } from 'components/Rebass'
import styled from 'styled-components'
import { useTotalSupply } from 'data/TotalSupply'

import { useActiveWeb3React } from 'hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { TYPE } from 'theme'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { useTradingFee } from 'hooks/useTradingFee'
import { getTokenSymbol } from 'utils'
import { Card, GreyCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { RowBetween, RowFixed } from 'components/Row'

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

interface PositionCardProps {
  pair: Pair
  pairData?: any
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

/** @deprecated */
export function MinimalInfoCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
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
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
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
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
                <Text fontWeight={600} fontSize={20} className="text-white !min-w-[160px] !ml-2">
                  <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={600} fontSize={20} color={'white'}>
                  {userPoolBalance.toSignificant(4)}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="8px">
              <FixedHeightRow>
                <Text fontWeight={500} color="white">
                  Your share:
                </Text>
                <TYPE.black>{poolTokenPercentage ? poolTokenPercentage.toSignificant(4) + '%' : '-'}</TYPE.black>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {getTokenSymbol(currency0, chainId)}
                </Text>
                {token0Deposited ? <TYPE.black>{token0Deposited?.toSignificant(4)}</TYPE.black> : '-'}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500} color={'white'}>
                  {getTokenSymbol(currency1, chainId)}
                </Text>
                {token1Deposited ? <TYPE.black>{token1Deposited?.toSignificant(4)}</TYPE.black> : '-'}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (
        <LightCard>
          <TYPE.subHeader style={{ textAlign: 'center' }} color={'white'}>
           
            By adding liquidity you&apos;ll earn {tradingFee}% of all trades on this pair proportional to your share of
            the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </TYPE.subHeader>
        </LightCard>
      )}
    </>
  )
}
