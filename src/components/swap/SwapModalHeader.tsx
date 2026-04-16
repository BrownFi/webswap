import { Trade, TradeType } from '@brownfi/sdk'
import { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { getTokenSymbol, isAddress, shortenAddress } from 'utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import { AutoColumn } from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'
import { useActiveWeb3React } from 'hooks'

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const { chainId } = useActiveWeb3React()
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage,
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} className="mt-[20px]">
      <div style={{ background: '#2F2823', borderRadius: '24px', padding: '24px', marginBottom: '4px' }}>
        <p style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#CFC7C1', marginBottom: '8px' }}>You Pay</p>
        <RowBetween align="center">
          <TruncatedText
            fontSize={32}
            fontWeight={600}
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : 'white'}
            className="flex-1"
          >
            {trade.inputAmount?.toSignificant(6)} {getTokenSymbol(trade.inputAmount?.currency, chainId)}
          </TruncatedText>
          <CurrencyLogo currency={trade.inputAmount?.currency} size={'32px'} style={{ marginRight: '0' }} />
        </RowBetween>
      </div>
      <div style={{ background: '#2F2823', borderRadius: '24px', padding: '24px', marginBottom: '4px' }}>
        <p style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#CFC7C1', marginBottom: '8px' }}>You Receive</p>
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
            {trade?.outputAmount?.toSignificant(6)} {getTokenSymbol(trade.outputAmount?.currency, chainId)}
          </TruncatedText>
          <CurrencyLogo currency={trade.outputAmount?.currency} size={'32px'} style={{ marginRight: '0' }} />
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
      <div style={{ padding: '12px 0 0 0' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <span style={{ fontFamily: 'Inter', fontSize: '13px', fontStyle: 'italic', color: '#978A80', lineHeight: '20px' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)}{' '}
              {getTokenSymbol(trade.outputAmount?.currency, chainId)}
            </b>
            {' or the transaction will revert.'}
          </span>
        ) : (
          <span style={{ fontFamily: 'Inter', fontSize: '13px', fontStyle: 'italic', color: '#978A80', lineHeight: '20px' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)}{' '}
              {getTokenSymbol(trade.inputAmount?.currency, chainId)}
            </b>
            {' or the transaction will revert.'}
          </span>
        )}
      </div>
      {recipient !== null ? (
        <div style={{ padding: '12px 0 0 0' }}>
          <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80' }}>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </span>
        </div>
      ) : null}
    </AutoColumn>
  )
}
