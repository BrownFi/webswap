import { Trade, TradeType } from '@brownfi/sdk'
import { Field } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts, warningSeveritySlippage } from 'utils/prices'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
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
    <AutoColumn gap="8px" style={{ padding: '0 0px' }}>
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
          {/* Clamp display: V2's reserve-drain math can produce absurd values
              (e.g. 10,331%) on near-empty pools. Beyond 100% is meaningless to
              show; the red severity still flags it. */}
          {trade ? ((trade?.priceImpactK ?? 0) > 100 ? '>100' : formatStringToNumber(trade?.priceImpactK, 4)) : '-'}%
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

  // Multi-hop route visualization (A → B → C) intentionally omitted. The
  // route picker above already conveys the source (BrownFi V2 / Kyber /
  // etc.), which is the load-bearing info for the user. Hop visualization
  // doesn't extend cleanly to aggregator routes (Kyber's split paths are
  // graph-shaped, not linear), so hiding here keeps native + aggregator
  // detail panels symmetric.
  return (
    <AutoColumn gap="0px" style={{ width: '100%' }}>
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
        </>
      )}
    </AutoColumn>
  )
}
