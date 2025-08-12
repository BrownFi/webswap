import { Trade, TradeType } from '@brownfi/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'
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
  const theme = useContext(ThemeContext)
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
          <Text fontWeight={500} fontSize={14} color={theme.white}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            color={'white'}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={500} color={theme.white}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? getTokenSymbol(trade.outputAmount?.currency, chainId)
                : getTokenSymbol(trade.inputAmount?.currency, chainId)}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.white} fontSize={14} fontWeight={500}>
              Price Impact
            </TYPE.black>
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
          <Text fontSize={20} fontWeight={500}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
