import { Trade, TradeType } from '@brownfi/sdk'
import { Field } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts, warningSeveritySlippage } from 'utils/prices'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import SwapRoute from './SwapRoute'
import { formatStringToNumber, getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ErrorText } from './styleds'
import { useTradingFee } from 'hooks/useTradingFee'

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const { chainId } = useActiveWeb3React()

  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const tradingFee = useTradingFee({ pair: trade.route.pairs[0] })

  return (
    <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
      <RowBetween>
        <RowFixed>
          <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
            {isExactIn ? 'Minimum received' : 'Maximum sold'}
          </span>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </RowFixed>
        <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
          {isExactIn
            ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${getTokenSymbol(trade.outputAmount?.currency, chainId)}`
            : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${getTokenSymbol(trade.inputAmount?.currency, chainId)}`}
        </span>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
            Price Impact
          </span>
          <QuestionHelper text="Price impact is the difference between your trading price and oracle price." />
        </RowFixed>
        <ErrorText fontWeight={500} fontSize={14} severity={warningSeveritySlippage(trade?.priceImpactK || 0)}>
          {trade ? formatStringToNumber(trade?.priceImpactK, 4) : '-'}%
        </ErrorText>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
            Liquidity Provider Fee
          </span>
          <QuestionHelper text="A portion of each trade goes to liquidity providers as a protocol incentive." />
        </RowFixed>
        <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
          {tradingFee}%
        </span>
      </RowBetween>
    </AutoColumn>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="0px" style={{ width: '100%' }}>
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <RowBetween style={{ padding: '0 16px' }}>
              <RowFixed>
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' }}>
                  Route
                </span>
                <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
              </RowFixed>
              <SwapRoute trade={trade} />
            </RowBetween>
          )}
        </>
      )}
    </AutoColumn>
  )
}
