import { JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { useState } from 'react'
import { useTotalSupply } from 'data/TotalSupply'

import { useActiveWeb3React } from 'hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { useTradingFee } from 'hooks/useTradingFee'
import { getTokenSymbol } from 'utils'
import { AutoColumn } from 'components/Column'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { RowBetween, RowFixed } from 'components/Row'

interface PositionCardProps {
  pair: Pair
  pairData?: any
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount
}

const labelStyle = { fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' } as const
const valueStyle = { fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' } as const

/** @deprecated */
export function MinimalInfoCard({ pair, showUnwrapped = false }: PositionCardProps) {
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
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <div style={{ background: '#2F2823', borderRadius: '18px', padding: '24px' }}>
          <AutoColumn gap="16px">
            <span
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#D8A072',
              }}
            >
              Your position
            </span>
            <RowBetween onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
              <RowFixed style={{ gap: '8px' }}>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', color: '#FBFBFD', marginLeft: '8px' }}>
                  <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
                </span>
              </RowFixed>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', color: '#FBFBFD' }}>
                {userPoolBalance.toSignificant(4)}
              </span>
            </RowBetween>
            <AutoColumn gap="8px">
              <RowBetween>
                <span style={labelStyle}>Your share:</span>
                <span style={valueStyle}>{poolTokenPercentage ? poolTokenPercentage.toSignificant(4) + '%' : '-'}</span>
              </RowBetween>
              <RowBetween>
                <span style={labelStyle}>{getTokenSymbol(currency0, chainId)}</span>
                <span style={valueStyle}>{token0Deposited ? token0Deposited?.toSignificant(4) : '-'}</span>
              </RowBetween>
              <RowBetween>
                <span style={labelStyle}>{getTokenSymbol(currency1, chainId)}</span>
                <span style={valueStyle}>{token1Deposited ? token1Deposited?.toSignificant(4) : '-'}</span>
              </RowBetween>
            </AutoColumn>
          </AutoColumn>
        </div>
      ) : (
        <div style={{ background: '#2F2823', borderRadius: '18px', padding: '24px' }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A', textAlign: 'center', display: 'block' }}>
            By adding liquidity you&apos;ll earn {tradingFee}% of all trades on this pair proportional to your share of
            the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </span>
        </div>
      )}
    </>
  )
}
