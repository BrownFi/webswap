import { Trade, TradeType } from '@brownfi/sdk'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} className="mt-[20px]">
      <div className="bg-gray mb-[4px] py-[12px] px-[16px]">
        <p className="text-[14px] text-white opacity-[0.5] mb-[8px]">You Pay</p>
        <RowBetween align="center">
          <TruncatedText
            fontSize={32}
            fontWeight={600}
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : 'white'}
            className="flex-1"
          >
            {trade.inputAmount.toSignificant(6)} {trade.inputAmount.currency.symbol}
          </TruncatedText>
          <CurrencyLogo currency={trade.inputAmount.currency} size={'32px'} style={{ marginRight: '0' }} />
        </RowBetween>
      </div>
      <div className="bg-gray mb-[4px] py-[12px] px-[16px]">
        <p className="text-[14px] text-white opacity-[0.5] mb-[8px]">You Receive</p>
        <RowBetween align="center">
          <TruncatedText
            fontSize={32}
            fontWeight={600}
            color={
              priceImpactSeverity > 2
                ? theme.red1
                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                ? theme.primary1
                : 'white'
            }
            className="flex-1"
          >
            {trade.outputAmount.toSignificant(6)} {trade.outputAmount.currency.symbol}
          </TruncatedText>
          <CurrencyLogo currency={trade.outputAmount.currency} size={'32px'} style={{ marginRight: '0' }} />
        </RowBetween>
      </div>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.italic textAlign="left" style={{ width: '100%' }} color={'white'} opacity={0.5}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        ) : (
          <TYPE.italic textAlign="left" style={{ width: '100%' }} color={'white'} opacity={0.5}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main color={'white'} opacity={0.5}>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
