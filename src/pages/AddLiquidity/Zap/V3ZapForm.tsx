import { Currency, ETHER, Pair, getRouterAddress } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { Dots } from 'components/swap/styleds'
import { useToast } from 'containers/ToastProvider'
import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/mint/actions'
import { tryParseAmount } from 'state/swap/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { getTokenSymbol } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { getV3ZapEstimate, buildV3UpdateData, executeV3ZapIn } from 'utils/v3Zap'
import { isUserRejection, parseZapError } from 'utils/zapErrors'
import { Text } from 'components/Rebass'
import { BigNumber } from '@ethersproject/bignumber'
import { formatNumber } from 'utils/prices'

type V3ZapFormProps = {
  pair?: Pair
  pairState: PairState
  currencies: { [field in Field]?: Currency }
  allowedSlippage: number
}

export function V3ZapForm({ pair, pairState, currencies, allowedSlippage }: V3ZapFormProps) {
  const { account, chainId, library } = useActiveWeb3React()
  const { createToast } = useToast()
  const deadline = useTransactionDeadline()
  const [slippage] = useUserSlippageTolerance()

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | undefined>(
    currencies[Field.CURRENCY_A] ?? undefined,
  )
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const balance = useCurrencyBalance(account ?? undefined, selectedCurrency)
  const parsedAmount = useMemo(() => tryParseAmount(amount, selectedCurrency), [amount, selectedCurrency])

  const isNativeETH = selectedCurrency === ETHER

  const wrappedTokenIn = useMemo(
    () => wrappedCurrency(selectedCurrency, chainId ?? undefined),
    [selectedCurrency, chainId],
  )

  // Determine the "other" token in the pair
  const wrappedTokenOther = useMemo(() => {
    if (!pair || !wrappedTokenIn) return undefined
    if (pair.token0.address === wrappedTokenIn.address) return pair.token1
    if (pair.token1.address === wrappedTokenIn.address) return pair.token0
    return undefined
  }, [pair, wrappedTokenIn])

  const symbol = useMemo(() => getTokenSymbol(selectedCurrency, chainId ?? undefined), [selectedCurrency, chainId])
  const otherSymbol = useMemo(() => {
    if (!wrappedTokenOther) return ''
    return wrappedTokenOther.symbol ?? ''
  }, [wrappedTokenOther])

  // Approval to V3 router
  const routerAddress = useMemo(() => (chainId ? getRouterAddress(chainId, 3) : undefined), [chainId])
  const [approval, approveCallback] = useApproveCallback(parsedAmount, routerAddress)
  const needsApproval = !isNativeETH && approval !== ApprovalState.APPROVED

  // Fetch V3 zap estimate
  const estimateQueryKey = useMemo(
    () => [
      'v3ZapEstimate',
      chainId,
      wrappedTokenIn?.address,
      wrappedTokenOther?.address,
      parsedAmount?.raw.toString(),
      slippage,
    ],
    [chainId, wrappedTokenIn, wrappedTokenOther, parsedAmount, slippage],
  )

  const isEstimateEnabled = Boolean(
    chainId && wrappedTokenIn && wrappedTokenOther && parsedAmount?.greaterThan('0'),
  )

  const { data: estimatedOutput, isFetching: isFetchingEstimate } = useQuery({
    queryKey: estimateQueryKey,
    queryFn: () =>
      getV3ZapEstimate(
        chainId!,
        wrappedTokenIn!.address,
        wrappedTokenOther!.address,
        parsedAmount!.raw.toString(),
        slippage,
      ),
    enabled: isEstimateEnabled,
    refetchInterval: 15_000,
  })

  // Validation
  const error = useMemo(() => {
    if (!chainId || !account || !library) return 'Connect Wallet'
    if (!selectedCurrency) return 'Select a token'
    if (!parsedAmount || !parsedAmount.greaterThan('0')) return 'Enter an amount'
    if (!wrappedTokenOther) return 'Token not in this pool'
    if (balance && parsedAmount.greaterThan(balance)) return `Insufficient ${symbol ?? ''} balance`.trim()
    return undefined
  }, [chainId, account, library, selectedCurrency, parsedAmount, wrappedTokenOther, balance, symbol])

  const isValid = !error

  const handleMax = useCallback(() => {
    const max = maxAmountSpend(balance)
    setAmount(max?.toExact() ?? '')
  }, [balance])

  const handleCurrencySelect = useCallback((currency: Currency) => {
    setSelectedCurrency(currency)
    setAmount('')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!chainId || !account || !library || !parsedAmount || !wrappedTokenIn || !wrappedTokenOther || !deadline) return

    try {
      setIsSubmitting(true)

      const updateData = await buildV3UpdateData(
        [wrappedTokenIn.address, wrappedTokenOther.address],
        chainId,
      )

      const amountOtherMin = estimatedOutput?.amountOtherMin?.toString() ?? '0'

      const response = await executeV3ZapIn({
        chainId,
        library,
        account,
        tokenIn: wrappedTokenIn.address,
        tokenOther: wrappedTokenOther.address,
        amountIn: parsedAmount.raw.toString(),
        amountOtherMin,
        deadline: BigNumber.from(deadline.toString()),
        updateData,
        isNativeETH,
        slippageBps: slippage,
      })

      setIsSubmitting(false)
      setAmount('')
      if (response) {
        createToast('Zap Successful', 'success')
      }
    } catch (err) {
      setIsSubmitting(false)
      if (isUserRejection(err as any)) return
      console.error('V3 Zap transaction failed:', err)
      createToast(parseZapError(err), 'error')
    }
  }, [chainId, account, library, parsedAmount, wrappedTokenIn, wrappedTokenOther, deadline, estimatedOutput, isNativeETH, createToast])

  const halfAmount = parsedAmount ? Number(parsedAmount.toExact()) / 2 : 0
  const estimatedOther = estimatedOutput
    ? Number(estimatedOutput.amountOut) / Math.pow(10, wrappedTokenOther?.decimals ?? 18)
    : 0

  return (
    <AutoColumn gap="20px">
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

      {isEstimateEnabled && (isFetchingEstimate || estimatedOutput) && (
        <div className="px-4 py-3 rounded-lg bg-white/5 text-sm text-white/70">
          {isFetchingEstimate ? (
            <Dots>Fetching estimate</Dots>
          ) : estimatedOutput ? (
            <>
              <Text fontSize={13} color="white" opacity={0.7}>
                Estimated: swap {formatNumber(halfAmount)} {symbol} &rarr; {formatNumber(estimatedOther)} {otherSymbol}
              </Text>
              <Text fontSize={12} color="white" opacity={0.5} style={{ marginTop: 4 }}>
                Then add liquidity with both tokens
              </Text>
            </>
          ) : null}
        </div>
      )}

      {needsApproval && isValid && (
        <ButtonPrimary
          onClick={approveCallback}
          disabled={approval === ApprovalState.PENDING}
        >
          {approval === ApprovalState.PENDING ? <Dots>Approving {symbol}</Dots> : `Approve ${symbol}`}
        </ButtonPrimary>
      )}

      <ButtonError
        onClick={handleSubmit}
        disabled={!isValid || (needsApproval && !isNativeETH) || isSubmitting || (!estimatedOutput && isEstimateEnabled)}
        error={Boolean(error && parsedAmount?.greaterThan('0'))}
      >
        {error ?? (isSubmitting ? <Dots>Submitting</Dots> : 'Zap & Supply')}
      </ButtonError>
    </AutoColumn>
  )
}
