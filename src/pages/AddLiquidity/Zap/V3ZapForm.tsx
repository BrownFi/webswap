import { ChainId, Currency, ETHER, Field as PythField, Pair } from '@brownfi/sdk'
import { createReadClient } from 'lib/sdk/rpc'
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
import { usePythPrices } from 'hooks/usePythPrices'
import { useHermesPrices } from 'hooks/useHermesPrices'
import { useTvlGate } from 'hooks/useTvlGate'
import { tvlGateMessage, isAddOverCap } from 'config/tvlGate'
import { useToast } from 'containers/ToastProvider'
import { ZapRouteComparison } from 'components/swap/ZapRouteComparison'
import { ZapRoutePreview } from './ZapRoutePreview'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Field } from 'state/mint/actions'
import { tryParseAmount } from 'state/swap/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { getZapAggregatorById } from 'services/aggregators/zapRegistry'
import { getTokenSymbol } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { beraFeeOverrides } from 'utils/beraGas'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { isUserRejection, parseZapError } from 'utils/zapErrors'
import { estimateGasWithMargin } from 'utils/estimateGasWithMargin'

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
  const { createToast } = useToast()

  // Per-pool TVL cap gate. The add is blocked when it would push the pool's TVL past
  // its cap (+ tolerance); shown as a notice on click (no button disable). No-op for
  // un-gated pools. `addBlocked` is computed below once prices are known; a ref lets
  // handleSubmit (defined before those) read the latest value without a re-bind.
  const tvlGate = useTvlGate(pair)
  const addBlockedRef = useRef(false)

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
    // Would exceed the TVL cap → block the add and tell the user (notice on click).
    if (addBlockedRef.current) {
      createToast(tvlGateMessage(tvlGate.cap, tvlGate.tvl), 'error')
      return
    }
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

      // Kyber under-estimates gas on multi-hop routes; resolve a live estimate
      // (×1.25) at send time, falling back to the adapter hint. See
      // utils/estimateGasWithMargin.
      const gasLimit = await estimateGasWithMargin(
        signer,
        { to: built.to, data: built.data, value: built.value },
        built.gasLimit,
      )

      const tx = await signer.sendTransaction({
        to: built.to,
        data: built.data,
        ...(built.value ? { value: built.value } : {}),
        ...(gasLimit ? { gasLimit } : {}),
        ...beraFeeOverrides(chainId),
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
  }, [chainId, account, library, best, deadline, deadlineSeconds, slippage, addTransaction, submittedText, createToast, tvlGate.cap, tvlGate.tvl])

  const showRoutesCard = Boolean(parsedAmount?.greaterThan('0') && pair)

  // -- Zap route preview (Initial USD / Estimated USD / Price impact) --
  // Computed client-side from Pyth prices + pool reserves + a one-shot
  // totalSupply read. Mirrors what V2 zap shows from Kyber's zapDetails
  // when its Kyber-driven, except here we synthesize the figures from
  // first principles since native V3 quotes don't ship USD-denominated
  // fields. When Kyber V3 indexing lands later, the same panel can
  // switch to best.quote.routeSummary.zapDetails for `best.source === 'kyber'`.
  // Hermes-direct prices for the USD value / price-impact display, consistent
  // with the main add page. NOTE: the zap TX itself is sized from the route
  // quote (`best`), not these — so this only keeps the displayed USD / impact
  // accurate on tokens whose on-chain oracle feed has drifted. Falls back to the
  // on-chain read when Hermes hasn't returned both sides.
  const onChainPrices = usePythPrices({
    chainId: (chainId ?? 0) as ChainId,
    currencyA: pair?.token0,
    currencyB: pair?.token1,
  })
  const hermesPrices = useHermesPrices({
    chainId: (chainId ?? 0) as ChainId,
    currencyA: pair?.token0,
    currencyB: pair?.token1,
    version: pair?.version ?? 0,
  })
  const pythPrices =
    hermesPrices[PythField.CURRENCY_A] > 0 && hermesPrices[PythField.CURRENCY_B] > 0 ? hermesPrices : onChainPrices
  const pythPrice0 = pythPrices[PythField.CURRENCY_A]
  const pythPrice1 = pythPrices[PythField.CURRENCY_B]

  // USD value of what the user is adding = input amount × the input token's price.
  // The whole input roughly becomes pool TVL (the zap only swaps part of it within
  // the same pool), so this is the pool's TVL increase for the cap check. Block when
  // currentTvl + this would exceed cap × (1 + tolerance).
  const addValueUsd = useMemo(() => {
    if (!parsedAmount || !pair) return 0
    const wrapped = wrappedCurrency(selectedCurrency, chainId)
    let price = 0
    if (wrapped) {
      const a = wrapped.address.toLowerCase()
      if (a === pair.token0.address.toLowerCase()) price = pythPrice0
      else if (a === pair.token1.address.toLowerCase()) price = pythPrice1
    }
    return Number(parsedAmount.toExact()) * (price || 0)
  }, [parsedAmount, selectedCurrency, chainId, pair, pythPrice0, pythPrice1])
  const addBlocked = isAddOverCap(tvlGate.cap, tvlGate.tvl, addValueUsd)
  addBlockedRef.current = addBlocked

  // Pair's LP totalSupply. Not on Pair instance — one-shot viem read,
  // cached 60s. Skipped until pair is determined.
  const { data: totalSupplyRaw } = useQuery({
    queryKey: ['v3-zap-total-supply', chainId, pair?.liquidityToken.address],
    queryFn: async () => {
      const client = createReadClient(chainId!)
      const supply = await client.readContract({
        address: pair!.liquidityToken.address as `0x${string}`,
        abi: [{ inputs: [], name: 'totalSupply', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
        functionName: 'totalSupply',
      })
      return supply as bigint
    },
    enabled: Boolean(chainId && pair?.liquidityToken.address),
    staleTime: 60_000,
  })

  const zapPreview = useMemo(() => {
    if (!best || !pair || !parsedAmount) return null
    if (!pythPrice0 || !pythPrice1) return null

    // Input USD — resolve which pool side matches the selected input.
    // ETHER maps to whichever pool token is the wrapped native.
    const wrapped = wrappedCurrency(selectedCurrency, chainId)
    let inputPythPrice = 0
    let inputIsToken0 = false
    if (wrapped) {
      if (wrapped.address.toLowerCase() === pair.token0.address.toLowerCase()) {
        inputPythPrice = pythPrice0
        inputIsToken0 = true
      } else if (wrapped.address.toLowerCase() === pair.token1.address.toLowerCase()) {
        inputPythPrice = pythPrice1
      }
    }
    const inputAmount = Number(parsedAmount.toExact())
    const initialUsd = inputAmount * inputPythPrice
    if (!isFinite(initialUsd) || initialUsd <= 0) return null

    // Estimated value after zap — computed from VALUE FLOW, not from the LP
    // reserve formula. BrownFi V3 is oracle-priced (reserves aren't pinned to
    // price), so a reserve-share estimate misreports impact on imbalanced
    // pools. A single-sided zap keeps ~half the input as-is and swaps the
    // other half into `other`; the only real value change is the swap
    // spread/fee on the swapped half:
    //   estimatedUsd = (kept half value) + (swap output value)
    // `amountOther` is the raw (pre-slippage) half-swap output from the
    // native quote, in `other` token units.
    const route = best.quote?.routeSummary as { amountOther?: string } | undefined
    let estimatedUsd: number | undefined
    if (route?.amountOther != null) {
      const otherToken = inputIsToken0 ? pair.token1 : pair.token0
      const otherPythPrice = inputIsToken0 ? pythPrice1 : pythPrice0
      const amountOtherTokens = Number(route.amountOther) / 10 ** otherToken.decimals
      const swapOutputUsd = amountOtherTokens * otherPythPrice
      const keptHalfUsd = (inputAmount / 2) * inputPythPrice
      estimatedUsd = keptHalfUsd + swapOutputUsd
    } else if (totalSupplyRaw) {
      // Fallback (e.g. future Kyber V3): value the minted LP by reserve share.
      // estimateLpOut is now oracle-aware, so this stays consistent.
      const reserve0 = Number(pair.reserve0.raw.toString()) / 10 ** pair.token0.decimals
      const reserve1 = Number(pair.reserve1.raw.toString()) / 10 ** pair.token1.decimals
      const tvlUsd = reserve0 * pythPrice0 + reserve1 * pythPrice1
      const supply = Number(totalSupplyRaw) / 10 ** 18 // LP always 18 decimals
      const lpOut = Number(best.lpOut.toString()) / 10 ** 18
      if (isFinite(tvlUsd) && tvlUsd > 0 && supply > 0 && lpOut > 0) {
        estimatedUsd = (lpOut / supply) * tvlUsd
      }
    }
    if (estimatedUsd === undefined || !isFinite(estimatedUsd)) return null

    // Price impact = value lost going from raw input to LP. Negative = loss
    // (typical: the swap spread/fee); positive = rounding gain.
    const impactPct = ((estimatedUsd - initialUsd) / initialUsd) * 100
    return { initialUsd, estimatedUsd, impactPct }
  }, [best, pair, parsedAmount, totalSupplyRaw, pythPrice0, pythPrice1, selectedCurrency, chainId])

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

      {/* Shared ZapRoutePreview component — same look as V2 zap so users
          see one consistent panel across both versions. Synthesizes USD
          figures client-side for V3 (native quote has no USD fields);
          will switch to Kyber's zapDetails when V3 indexing lands and
          best.source becomes 'kyber'. */}
      {showRoutesCard && zapPreview && (
        <ZapRoutePreview
          initialUsd={zapPreview.initialUsd}
          finalUsd={zapPreview.estimatedUsd}
          priceImpactPct={zapPreview.impactPct}
        />
      )}

      {needsApproval && isValid && (
        <ButtonPrimary
          onClick={() => {
            if (addBlocked) {
              createToast(tvlGateMessage(tvlGate.cap, tvlGate.tvl), 'error')
              return
            }
            approveCallback()
          }}
          disabled={approval === ApprovalState.PENDING}
        >
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
