import { Currency, ETHER, Pair } from '@brownfi/sdk'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { Dots } from 'components/swap/styleds'
import { TransactionConfirmationModal, TransactionErrorContent } from 'components/TransactionConfirmationModal'
import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useBestZapInRoute, ZapChoice } from 'hooks/useBestZapRoute'
import { ZapRouteComparison } from 'components/swap/ZapRouteComparison'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/mint/actions'
import { tryParseAmount } from 'state/swap/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { getZapAggregatorById } from 'services/aggregators/zapRegistry'
import { getTokenSymbol } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { isUserRejection, parseZapError } from 'utils/zapErrors'

type V3ZapFormProps = {
  pair?: Pair
  pairState: PairState
  currencies: { [field in Field]?: Currency }
  allowedSlippage: number
}

export function V3ZapForm({ pair, currencies }: V3ZapFormProps) {
  const { account, chainId, library } = useActiveWeb3React()
  const deadline = useTransactionDeadline()
  const [slippage] = useUserSlippageTolerance()
  const addTransaction = useTransactionAdder()

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | undefined>(
    currencies[Field.CURRENCY_A] ?? undefined,
  )
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const balance = useCurrencyBalance(account ?? undefined, selectedCurrency)
  const parsedAmount = useMemo(() => tryParseAmount(amount, selectedCurrency), [amount, selectedCurrency])

  const isNativeETH = selectedCurrency === ETHER
  const symbol = useMemo(() => getTokenSymbol(selectedCurrency, chainId ?? undefined), [selectedCurrency, chainId])

  // Hand the orchestration hook a stable inputs array — useMemo so identity
  // changes only when the underlying amount/token changes, not on every render.
  const zapInputs = useMemo(() => {
    if (!selectedCurrency || !parsedAmount) return []
    return [{ currency: selectedCurrency, amountRaw: parsedAmount.raw.toString() }]
  }, [selectedCurrency, parsedAmount])

  const deadlineSeconds = useMemo(() => (deadline ? Number(deadline.toString()) : 0), [deadline])

  // User's manual engine preference. 'auto' = best LP-out wins (default);
  // 'native' = pin BrownFi V3 router; 'kyber' = pin Kyber zap. The hook
  // honors the pin when that source has a route; falls back to native
  // then best-available when the pinned source returns no route, so the
  // user is never stuck.
  const [zapSource, setZapSource] = useState<ZapChoice>('auto')

  // Fans out native + Kyber zap quotes in parallel; returns the winner +
  // every adapter's status (success / no-route / loading). The form
  // renders all attempts so the user can see why an engine didn't show
  // up (e.g. Kyber doesn't index V3 pools yet) instead of guessing.
  const { best, attempts, isLoading: isLoadingRoutes } = useBestZapInRoute({
    pair,
    inputs: zapInputs,
    account: account ?? undefined,
    slippageBps: slippage,
    deadline: deadlineSeconds,
    selected: zapSource,
  })

  // Approval target moves with the chosen engine. Native = V3 router;
  // Kyber = Kyber's router. If the winner flips across refetches and
  // the user already approved the previous one, useApproveCallback will
  // surface the new approval state automatically.
  const [approval, approveCallback] = useApproveCallback(parsedAmount, best?.routerAddress)
  const needsApproval = !isNativeETH && approval !== ApprovalState.APPROVED

  const error = useMemo(() => {
    if (!chainId || !account || !library) return 'Connect Wallet'
    if (!selectedCurrency) return 'Select a token'
    if (!parsedAmount || !parsedAmount.greaterThan('0')) return 'Enter an amount'
    if (balance && parsedAmount.greaterThan(balance)) return `Insufficient ${symbol ?? ''} balance`.trim()
    if (!isLoadingRoutes && !best) return 'No zap route'
    return undefined
  }, [chainId, account, library, selectedCurrency, parsedAmount, balance, symbol, isLoadingRoutes, best])

  const isValid = !error

  const handleMax = useCallback(() => {
    const max = maxAmountSpend(balance)
    setAmount(max?.toExact() ?? '')
  }, [balance])

  const handleCurrencySelect = useCallback((currency: Currency) => {
    setSelectedCurrency(currency)
    setAmount('')
  }, [])

  const summaryAmount = parsedAmount?.toSignificant(6)
  const pairLabel = useMemo(
    () => (pair ? `${pair.token0.symbol ?? '?'}/${pair.token1.symbol ?? '?'}` : 'pool'),
    [pair],
  )
  const pendingText = useMemo(
    () => `Zapping ${summaryAmount ?? ''} ${symbol ?? ''} into ${pairLabel}`,
    [summaryAmount, symbol, pairLabel],
  )
  const submittedText = useMemo(
    () => `Zapped ${summaryAmount ?? ''} ${symbol ?? ''} into ${pairLabel}`,
    [summaryAmount, symbol, pairLabel],
  )

  const handleDismissConfirm = useCallback(() => {
    setShowConfirm(false)
    if (txHash) setAmount('')
    setTxHash('')
    setErrorMessage(undefined)
  }, [txHash])

  const handleSubmit = useCallback(async () => {
    if (!chainId || !account || !library || !best || !deadline) return

    setErrorMessage(undefined)
    setTxHash('')
    setShowConfirm(true)
    setIsSubmitting(true)

    try {
      // Look up the adapter that produced this quote and ask it to build
      // calldata. The orchestration hook keeps `quote` opaque — only the
      // adapter knows how to translate its own routeSummary back into a tx.
      const adapter = getZapAggregatorById(best.source)
      if (!adapter) throw new Error(`Zap adapter ${best.source} not registered`)

      const built = await adapter.buildZapIn({
        chainId,
        account,
        quote: best.quote,
        slippageBps: slippage,
        deadline: deadlineSeconds,
      })

      const signer = typeof library.getSigner === 'function' ? library.getSigner(account) : undefined
      if (!signer) throw new Error('No signer available')

      const tx = await signer.sendTransaction({
        to: built.to,
        data: built.data,
        ...(built.value ? { value: built.value } : {}),
        ...(built.gasLimit ? { gasLimit: built.gasLimit } : {}),
      })

      setTxHash(tx.hash)
      addTransaction(tx, { summary: submittedText })
      setIsSubmitting(false)
    } catch (err) {
      setIsSubmitting(false)
      console.error('V3 Zap transaction failed:', err)
      if (isUserRejection(err as any)) {
        setShowConfirm(false)
        return
      }
      setErrorMessage(parseZapError(err))
    }
  }, [chainId, account, library, best, deadline, deadlineSeconds, slippage, addTransaction, submittedText])

  const showRoutesCard = Boolean(parsedAmount?.greaterThan('0') && pair)

  return (
    <AutoColumn gap="20px">
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirm}
        attemptingTxn={isSubmitting}
        hash={txHash}
        pendingText={pendingText}
        submittedText={submittedText}
        content={() =>
          errorMessage ? (
            <TransactionErrorContent onDismiss={handleDismissConfirm} message={errorMessage} />
          ) : (
            <div />
          )
        }
      />

      <CurrencyInputPanel
        value={amount}
        onUserInput={setAmount}
        onCurrencySelect={handleCurrencySelect}
        onMax={handleMax}
        showMaxButton={Boolean(balance && (!parsedAmount || !balance.equalTo(parsedAmount)))}
        currency={selectedCurrency}
        id="v3-zap-input"
        showCommonBases
        label="You Pay"
      />

      {showRoutesCard && (
        <ZapRouteComparison
          attempts={attempts}
          selected={zapSource}
          onSelect={setZapSource}
          isLoading={isLoadingRoutes && attempts.every((a) => a.status === 'loading')}
        />
      )}

      {needsApproval && isValid && (
        <ButtonPrimary onClick={approveCallback} disabled={approval === ApprovalState.PENDING}>
          {approval === ApprovalState.PENDING ? <Dots>Approving {symbol}</Dots> : `Approve ${symbol}`}
        </ButtonPrimary>
      )}

      <ButtonError
        onClick={handleSubmit}
        disabled={!isValid || (needsApproval && !isNativeETH) || isSubmitting || isLoadingRoutes}
        error={Boolean(error && parsedAmount?.greaterThan('0'))}
      >
        {error ?? (isSubmitting ? <Dots>Submitting</Dots> : 'Zap & Supply')}
      </ButtonError>
    </AutoColumn>
  )
}
