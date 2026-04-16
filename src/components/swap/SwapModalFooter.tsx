import { Trade, TradeType } from '@brownfi/sdk'
import { useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Field } from 'state/swap/actions'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
  warningSeveritySlippage,
} from 'utils/prices'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ErrorText, StyledBalanceMaxMini, SwapCallbackError } from './styleds'
import { formatStringToNumber, getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'

const labelStyle = { fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' } as const
const valueStyle = { fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#C4B89A' } as const

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const { chainId } = useActiveWeb3React()

  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade,
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <>
      <AutoColumn gap="8px">
        <RowBetween align="center" className="!mb-[4px]">
          <span style={labelStyle}>Price</span>
          <span
            style={{
              ...valueStyle,
              display: 'flex',
              alignItems: 'center',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </span>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <span style={labelStyle}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </span>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <span style={valueStyle}>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'} ${getTokenSymbol(trade.outputAmount?.currency, chainId)}`
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'} ${getTokenSymbol(trade.inputAmount?.currency, chainId)}`}
          </span>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <span style={labelStyle}>Price Impact</span>
            <QuestionHelper text="Price impact is the difference between your trading price and oracle price." />
          </RowFixed>
          <ErrorText fontWeight={500} fontSize={14} severity={warningSeveritySlippage(trade?.priceImpactK || 0)}>
            {trade ? formatStringToNumber(trade?.priceImpactK, 4) : '-'}%
          </ErrorText>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <span style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </span>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
