import { Currency, CurrencyAmount, currencyEquals, Token, Trade } from '@brownfi/sdk'
import { useCallback, useMemo } from 'react'
import {
  TransactionConfirmationModal,
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { ButtonError } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import { getTokenSymbol } from 'utils'
import type { UnifiedRoute } from 'hooks/useBestSwapRoute'
import { isBrownFiSource } from 'services/aggregators/types'
import { getKyberFeeConfig } from 'services/aggregators/kyber/adapter'

function formatBigByDecimals(rawBig: { toString(): string }, currency: Currency | undefined): string {
  const decimals = currency instanceof Token ? currency.decimals : 18
  const num = Number(rawBig.toString()) / 10 ** decimals
  if (!isFinite(num) || num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  return Number(num.toPrecision(6)).toString()
}

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount!.currency, tradeB.inputAmount!.currency) ||
    !tradeA.inputAmount?.equalTo(tradeB?.inputAmount as any) ||
    !currencyEquals(tradeA.outputAmount!.currency, tradeB.outputAmount!.currency) ||
    !tradeA.outputAmount?.equalTo(tradeB.outputAmount as any)
  )
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  bestRoute,
  inputAmount,
  outputCurrency,
}: {
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
  /** Winning route from useBestSwapRoute — drives the aggregator view. */
  bestRoute?: UnifiedRoute | null
  /** Parsed input currency amount (Swap page already has it). */
  inputAmount?: CurrencyAmount
  /** Output currency for formatting aggregator amountOut. */
  outputCurrency?: Currency
}) {
  const { chainId } = useActiveWeb3React()
  const isAggregator = !!bestRoute && !isBrownFiSource(bestRoute.source)
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  )

  // Aggregator route — render a simplified header showing the swap
  // amounts + the source. We don't have a native Trade object so the
  // existing SwapModalHeader (which derives execution price, route, etc.
  // from Trade) can't be used.
  const aggregatorOutputDisplay = useMemo(() => {
    if (!isAggregator || !bestRoute?.amountOut) return ''
    return formatBigByDecimals(bestRoute.amountOut, outputCurrency)
  }, [isAggregator, bestRoute, outputCurrency])
  const aggregatorMinOutDisplay = useMemo(() => {
    if (!isAggregator || !bestRoute?.amountOutMin) return ''
    return formatBigByDecimals(bestRoute.amountOutMin, outputCurrency)
  }, [isAggregator, bestRoute, outputCurrency])
  const inputSymbol = getTokenSymbol(inputAmount?.currency, chainId)
  const outputSymbol = getTokenSymbol(outputCurrency, chainId)
  const inputDisplay = inputAmount?.toSignificant(6) ?? ''

  const aggregatorHeader = useCallback(() => {
    if (!isAggregator) return null
    return (
      <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
        <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: 14, color: '#978A80' }}>
          <span>You pay</span>
          <span style={{ color: '#FBFBFD', fontWeight: 600 }}>
            {inputDisplay} {inputSymbol}
          </span>
        </div>
        <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: 14, color: '#978A80' }}>
          <span>You receive (est.)</span>
          <span style={{ color: '#FBFBFD', fontWeight: 600 }}>
            {aggregatorOutputDisplay} {outputSymbol}
          </span>
        </div>
        <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
          <span>Minimum received ({allowedSlippage / 100}% slippage)</span>
          <span style={{ color: '#CFC7C1' }}>
            {aggregatorMinOutDisplay} {outputSymbol}
          </span>
        </div>
        <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
          <span>Route</span>
          <span
            style={{
              display: 'inline-flex',
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(216, 160, 114, 0.12)',
              border: '1px solid rgba(216, 160, 114, 0.35)',
              fontSize: 12,
              fontWeight: 500,
              color: '#D8A072',
            }}
          >
            via {bestRoute?.sourceName}
          </span>
        </div>
        {(() => {
          // Transparency line — when an affiliate fee is configured, show it
          // so the user understands the routed amount has a small skim.
          // Hidden entirely when fee config is absent or zero.
          const fee = getKyberFeeConfig()
          if (!fee) return null
          const pct = (fee.feeAmount / 100).toFixed(2)
          return (
            <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
              <span>BrownFi Fee</span>
              <span style={{ color: '#CFC7C1' }}>{pct}%</span>
            </div>
          )
        })()}
      </div>
    )
  }, [
    isAggregator,
    bestRoute,
    inputDisplay,
    inputSymbol,
    aggregatorOutputDisplay,
    aggregatorMinOutDisplay,
    outputSymbol,
    allowedSlippage,
  ])

  const aggregatorFooter = useCallback(() => {
    if (!isAggregator) return null
    return (
      <ButtonError onClick={onConfirm} disabled={!!swapErrorMessage}>
        <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500 }}>Confirm Swap</span>
      </ButtonError>
    )
  }, [isAggregator, onConfirm, swapErrorMessage])

  const modalHeader = useCallback(() => {
    if (isAggregator) return aggregatorHeader()
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [isAggregator, aggregatorHeader, allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    if (isAggregator) return aggregatorFooter()
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null
  }, [isAggregator, aggregatorFooter, allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading. Use aggregator amounts when an aggregator
  // route wins; otherwise fall back to native trade.
  const pendingText = isAggregator
    ? `Swapping ${inputDisplay} ${inputSymbol} for ${aggregatorOutputDisplay} ${outputSymbol}`
    : `Swapping ${trade?.inputAmount?.toSignificant(6)} ${getTokenSymbol(
        trade?.inputAmount?.currency,
        chainId,
      )} for ${trade?.outputAmount?.toSignificant(6)} ${getTokenSymbol(trade?.outputAmount?.currency, chainId)}`

  // Echo the swap amounts on the success screen so users can confirm what
  // they just signed without scrolling the explorer page.
  const submittedText = isAggregator
    ? `Swapped ${inputDisplay} ${inputSymbol} for ${aggregatorOutputDisplay} ${outputSymbol}`
    : `Swapped ${trade?.inputAmount?.toSignificant(6)} ${getTokenSymbol(
        trade?.inputAmount?.currency,
        chainId,
      )} for ${trade?.outputAmount?.toSignificant(6)} ${getTokenSymbol(trade?.outputAmount?.currency, chainId)}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Swap"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage],
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      submittedText={submittedText}
      currencyToAdd={isAggregator ? outputCurrency : trade?.outputAmount?.currency}
    />
  )
}
