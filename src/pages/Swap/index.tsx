import { ChainId, Currency, CurrencyAmount, JSBI, Token, Trade } from '@brownfi/sdk'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, Repeat } from 'react-feather'
import { Text } from 'components/Rebass'
import { ThemeContext } from 'styled-components'
import { AddressInputPanel } from 'components/AddressInputPanel'
import { ButtonError, ButtonPrimary, ButtonConfirmed } from 'components/Button'
import Column, { AutoColumn } from 'components/Column'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { RouteComparison } from 'components/swap/RouteComparison'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { AutoRow, RowBetween } from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import TokenWarningModal from 'components/TokenWarningModal'
import { ProgressCircles } from 'components/ProgressSteps'
import SwapHeader from 'components/swap/SwapHeader'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/common'
import { useActiveWeb3React } from 'hooks'
import { usePythPrices } from 'hooks/usePythPrices'
import { useCurrency, useAllTokens } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import useENSAddress from 'hooks/useENSAddress'
import { useSwapCallback } from 'hooks/useSwapCallback'
import { useAggregatorSwapCallback } from 'hooks/useAggregatorSwapCallback'
import { useBestSwapRoute, type UnifiedRoute } from 'hooks/useBestSwapRoute'
import { decodeContractError } from 'utils/decodeContractError'
import { isBrownFiSource } from 'services/aggregators/types'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { BigNumber } from '@ethersproject/bignumber'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useToast } from 'containers/ToastProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  useUserSingleHopOnly,
  useSelectedAggregator,
} from 'state/user/hooks'
import { LinkStyledButton } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import { AppBody } from 'pages/AppBody'
import { ClickableText, Dots } from 'pages/Pool/styleds'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useNavigate } from 'react-router-dom'
import switchIcon from 'assets/svg/switch.svg'
import { getTokenSymbol } from 'utils'
import ConnectWallet from 'components/ConnectWallet'
import { StyledBalanceMaxMini } from 'components/swap/styleds'
import QuestionHelper from 'components/QuestionHelper'

// Aggregator-route Price ratio renderer — mirrors TradePrice's invert toggle
// but derives the ratio from amountIn / amountOut directly instead of the V2
// trade's Price object. Used when the active route is Kyber (or any future
// aggregator), since V2's executionPrice doesn't reflect what's being signed.
function AggregatorPriceRow({
  amountInRaw,
  inputDecimals,
  inputSymbol,
  amountOut,
  outputDecimals,
  outputSymbol,
  showInverted,
  setShowInverted,
}: {
  amountInRaw: string | undefined
  inputDecimals: number
  inputSymbol: string
  amountOut: { toString(): string }
  outputDecimals: number
  outputSymbol: string
  showInverted: boolean
  setShowInverted: (v: boolean) => void
}) {
  const inNum = amountInRaw ? Number(amountInRaw) / 10 ** inputDecimals : 0
  const outNum = Number(amountOut.toString()) / 10 ** outputDecimals
  if (!isFinite(inNum) || !isFinite(outNum) || inNum === 0 || outNum === 0) return <span style={{ color: '#C4B89A', fontSize: 14 }}>-</span>
  const forward = outNum / inNum
  const inverted = inNum / outNum
  const value = showInverted ? inverted : forward
  const label = showInverted ? `${inputSymbol} per ${outputSymbol}` : `${outputSymbol} per ${inputSymbol}`
  return (
    <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#C4B89A', display: 'inline-flex', alignItems: 'center' }}>
      {Number(value.toPrecision(6))} {label}
      <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
        <Repeat size={14} />
      </StyledBalanceMaxMini>
    </span>
  )
}

// Aggregator-route details panel. Replaces AdvancedSwapDetails (which is
// V2-trade-specific). We only render Minimum received here — Price Impact
// and LP Fee aren't applicable for aggregator routes (Kyber's fee is built
// into the quote, not exposed as a separate LP fee).
function AggregatorDetails({
  amountOutMin,
  outputDecimals,
  outputSymbol,
}: {
  amountOutMin: { toString(): string }
  outputDecimals: number
  outputSymbol: string
}) {
  const num = Number(amountOutMin.toString()) / 10 ** outputDecimals
  const formatted = !isFinite(num) || num === 0 ? '0' : num < 0.000001 ? num.toExponential(2) : Number(num.toPrecision(6)).toString()
  return (
    <div style={{ width: '100%', padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#C4B89A' }}>
            Minimum received
          </span>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#C4B89A' }}>
          {formatted} {outputSymbol}
        </span>
      </div>
    </div>
  )
}

export default function Swap() {
  const navigate = useNavigate()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const { account, chainId } = useActiveWeb3React()
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency('WETH'),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault = useMemo(
    () => urlLoadedTokens.filter((token: Token) => !(token.address in defaultTokens)),
    [urlLoadedTokens, defaultTokens],
  )

  const theme = useContext(ThemeContext)
  const { createToast } = useToast()
  const queryClient = useQueryClient()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    v3Trade,
    v4Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: rawSwapInputError,
    v2AmountOutExceedsReserve,
    nativePoolLiquidityInsufficient,
    loadingExactIn,
    loadingExactOut,
  } = useDerivedSwapInfo()

  // Single fetch per pair (cached, 60s refresh) — used by RouteComparison to
  // display USD value alongside each row's amountOut. Output side is what
  // matters for routing decisions; input USD isn't shown today.
  const pythPrices = usePythPrices({
    chainId: chainId as ChainId,
    currencyA: currencies[Field.INPUT],
    currencyB: currencies[Field.OUTPUT],
  })
  const inputUsdPrice = pythPrices.CURRENCY_A || undefined
  const outputUsdPrice = pythPrices.CURRENCY_B || undefined

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue,
  )
  const [isLoadingWrap, setLoadingWrap] = useState(false)
  const handleWrap = async () => {
    setLoadingWrap(true)
    await onWrap?.()
      .catch((error: Error) => {
        console.error('Wrap/unwrap failed', error)
        createToast(error?.message || 'Transaction failed. Please try again.', 'error')
      })
      .finally(() => {
        setLoadingWrap(false)
      })
  }

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  // BrownFi-native trade. Smart routing in useBestSwapRoute compares this
  // candidate against every supported aggregator and picks the best
  // amountOut — no V1/V2 toggle in the UI anymore (Add/Remove Liquidity
  // still surface the version split because the protocols differ).
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  // isValid moved below — it depends on swapInputError which is computed
  // after useBestSwapRoute resolves so the V2-only reserve error can be
  // conditionally suppressed when the chosen route is an aggregator or V3.
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    navigate('/swap/')
  }, [navigate])

  const [{ showConfirm, tradeToConfirm, routeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    /** Snapshot of `best` taken when the confirm modal opens. Kyber's
     *  20s refetch can update `best` while the modal is up; signing
     *  must use the snapshot the user actually saw. */
    routeToConfirm: UnifiedRoute | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    routeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  // "No route" is true only when NO source — BrownFi-native or aggregator —
  // has a quote. With the smart router, an aggregator might cover a pair
  // that V2 doesn't, so checking `!route` (V2-only) would hide a perfectly
  // executable Kyber route behind a "no route" message.
  // Computed below after `best` is in scope.

  // Multi-aggregator orchestration. Compares the BrownFi-native trade with
  // every supported aggregator's quote and picks a winner per the user's
  // selectedAggregator preference (Auto / Native / specific aggregator).
  const deadline = useTransactionDeadline()
  // Kyber's aggregator API only quotes by amountIn (exact-in). On
  // exact-out, the user's intent is amountOut, and we'd have to back-
  // solve to an amountIn — V2's slippage-adjusted estimate would be
  // wrong for Kyber. Skip aggregator candidates on exact-out by
  // withholding amountIn from the orchestration; aggregator queries
  // are gated on amountIn being defined, so they simply don't fire.
  // Adapters that support exact-out can opt in later.
  // Use parsedAmount directly rather than parsedAmounts[INPUT]: on exact-in
  // they're identical, and on exact-out amountInBig returns undefined
  // anyway. Decoupling lets `parsedAmounts` be computed AFTER displayTrade
  // (V2 vs V3) so the dependent-side display reflects the active route.
  const amountInBig = useMemo(() => {
    if (independentField !== Field.INPUT) return undefined
    const raw = parsedAmount?.raw?.toString()
    return raw ? BigNumber.from(raw) : undefined
  }, [parsedAmount, independentField])
  const {
    best,
    candidates: routeCandidates,
    isLoading: bestLoading,
    isStale: bestIsStale,
    refetchAll: refetchBest,
    lastFetchedAt: bestLastFetchedAt,
    refreshIntervalMs: bestRefreshIntervalMs,
  } = useBestSwapRoute({
    v2Trade: showWrap ? undefined : v2Trade,
    v3Trade: showWrap ? undefined : v3Trade,
    v4Trade: showWrap ? undefined : v4Trade,
    v2Unavailable: v2AmountOutExceedsReserve,
    tokenIn: currencies[Field.INPUT],
    tokenOut: currencies[Field.OUTPUT],
    amountIn: amountInBig,
    account: account ?? undefined,
    slippageBps: allowedSlippage,
    deadline: deadline ? deadline.toNumber() : Math.floor(Date.now() / 1000) + 600,
  })
  // When the confirm modal is open, freeze on the snapshot taken at open
  // time so signing uses what the user actually saw — Kyber's 20s
  // refetch interval can otherwise change `best` underneath them.
  const activeBest = showConfirm && routeToConfirm ? routeToConfirm : best
  // The "active trade" the rest of the page (approval, swap callback,
  // tooltip, advanced details) operates on is whichever BrownFi-native
  // candidate the smart router picked. For aggregator routes this is
  // undefined and the aggregator path takes over.
  const activeNativeTrade = activeBest?.nativeTrade
  // Trade shown in the detail panel + confirm modal. Reflects the user's
  // ACTIVE native route (V2 or V3) so LP fee, executionPrice, and route
  // pairs all match what's being signed. Falls back to v2Trade when no
  // active native trade exists (e.g., aggregator route wins — in that
  // case the V2/V3 detail panel isn't rendered anyway).
  const displayTrade = activeNativeTrade ?? (showWrap ? undefined : v2Trade)

  // parsedAmounts maps INPUT/OUTPUT → CurrencyAmount. The dependent side
  // (the one the user didn't type) is sourced from the active trade —
  // V3 if pinned, V2 otherwise, undefined for Kyber-only pairs. Declared
  // here (after displayTrade) rather than before useBestSwapRoute so it
  // doesn't get stuck on V2 when V3 is active.
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : displayTrade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : displayTrade?.outputAmount,
      }

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const isAggregatorRoute = !!activeBest && !isBrownFiSource(activeBest.source)
  const noRoute = !best
  const [selectedAggregator, setSelectedAggregator] = useSelectedAggregator()

  // The "amount-out exceeds 90% of pool reserve" check is V2-pool-specific.
  // Only block the swap when the smart router's chosen route is actually
  // BrownFi V2 — if the user is going to swap through Kyber or V3 instead,
  // the V2 reserve constraint doesn't apply.
  const swapInputError = useMemo(() => {
    if (rawSwapInputError) return rawSwapInputError
    if (v2AmountOutExceedsReserve && best?.source === 'brownfi-v2') {
      return 'Your amount-out exceeds the limit of 90% pool reserve. Please reduce your order size.'
    }
    // Both BrownFi versions lack a route — but if an aggregator has one,
    // the user can still swap. Only block when no source has a route.
    if (nativePoolLiquidityInsufficient && !best) {
      return 'Insufficient pool liquidity for this trade. Try a smaller amount.'
    }
    return undefined
  }, [rawSwapInputError, v2AmountOutExceedsReserve, best, nativePoolLiquidityInsufficient])
  const isValid = !swapInputError
  // User manually picked a specific aggregator, but orchestration fell back
  // to native (the chosen aggregator returned no route for this pair on
  // this chain). Surface this so the user understands why their selection
  // isn't being honored.
  const aggregatorFallbackNotice =
    selectedAggregator !== 'auto' &&
    selectedAggregator !== 'native' &&
    !isBrownFiSource(selectedAggregator) &&
    !!best &&
    isBrownFiSource(best.source)

  // When an aggregator quote wins, its amountOut overrides the native
  // trade's outputAmount in the OUTPUT field. Only applies on exact-in
  // (user typing INPUT — OUTPUT field reflects the aggregator's quote).
  const isExactIn = independentField === Field.INPUT
  const aggregatorOutputDisplay = useMemo(() => {
    if (!isAggregatorRoute || !isExactIn) return undefined
    if (!best?.amountOut || !currencies[Field.OUTPUT]) return undefined
    const decimals =
      currencies[Field.OUTPUT] instanceof Token ? (currencies[Field.OUTPUT] as Token).decimals : 18
    const num = Number(best.amountOut.toString()) / 10 ** decimals
    if (!isFinite(num) || num === 0) return '0'
    if (num < 0.000001) return num.toExponential(2)
    return Number(num.toPrecision(6)).toString()
  }, [isAggregatorRoute, isExactIn, best, currencies])
  const rawDisplayedOutput = aggregatorOutputDisplay ?? formattedAmounts[Field.OUTPUT]

  // Synchronous bridge between keystroke and the per-source loading flags.
  // useDebounce(300) + useTradeExactIn's setTimeout(300) + multicall create
  // a sub-second gap where the user typed but no `loading` flag is true
  // yet — and the OUTPUT field is still showing the previous quote. We
  // engage `pendingQuote` on the same render the inputs change (render-
  // time setState pattern), then hand off to the real loading flags as
  // soon as they fire. NumericalInput keeps the previous value visible
  // and pulses while any loading flag is true, so there's no flicker.
  const inputFingerprint = useMemo(() => {
    const inSym = currencies[Field.INPUT] instanceof Token
      ? (currencies[Field.INPUT] as Token).address
      : currencies[Field.INPUT]?.symbol ?? ''
    const outSym = currencies[Field.OUTPUT] instanceof Token
      ? (currencies[Field.OUTPUT] as Token).address
      : currencies[Field.OUTPUT]?.symbol ?? ''
    return `${typedValue}|${inSym}|${outSym}|${independentField}`
  }, [typedValue, currencies, independentField])

  const [trackedFingerprint, setTrackedFingerprint] = useState(inputFingerprint)
  const [pendingQuote, setPendingQuote] = useState(false)
  // Whether the BrownFi-native trade pipeline (useTradeExactIn/Out) has
  // completed at least one full loading cycle since the last fingerprint
  // change. The native pipeline can be SLOW to start on first input —
  // useAllCommonPairs has to fetch reserves on first run, then
  // useTradeExactIn's internal setTimeout(300) waits, then bestTradeExactIn
  // fires. Total: ~1.4s before `loadingExactIn` flips true. Meanwhile Kyber
  // returns in ~500ms. The previous 350ms time-based grace would fire at
  // ~T+850ms — BEFORE V2 engages — briefly clearing pendingQuote and
  // unmasking the "Kyber" row without skeleton. Switch to an EVENT-based
  // grace: don't clear pendingQuote until native has actually completed
  // (or a 2.5s absolute fallback for pairs that have no native pool).
  const [nativeCycleDone, setNativeCycleDone] = useState(true)
  const nativeCycleStartedRef = useRef(false)
  // Derived staleness check. TRUE on the SAME render that detects the input
  // change, BEFORE any setState below propagates. Without this, the previous
  // render's DOM (showing the prior "Kyber Best" row) stays on screen for
  // one frame after typing because `pendingQuote` is state and the current
  // render still sees the old value. Including this in `isLoadingOrStale`
  // forces the skeleton to render immediately on the input-change render,
  // killing the brief "Kyber → loading → Kyber Best" flash the user saw.
  const fingerprintIsStale = trackedFingerprint !== inputFingerprint
  if (fingerprintIsStale) {
    setTrackedFingerprint(inputFingerprint)
    const willFetch =
      !!typedValue && Number(typedValue) > 0 && !!currencies[Field.INPUT] && !!currencies[Field.OUTPUT]
    setPendingQuote(willFetch)
    // Reset the native-cycle gate so we wait for V2/V3 to engage again.
    // Without this, a stale "done" from the previous fingerprint would let
    // the grace timer fire immediately on the new fetch cycle.
    if (willFetch) setNativeCycleDone(false)
  }
  // On cold mount the page renders with the typedValue already set (URL
  // prefill, persisted Redux state, etc.) but `trackedFingerprint` is
  // initialized to the SAME value as `inputFingerprint`, so the mismatch
  // check above never fires — `pendingQuote` stays false for the entire
  // first fetch cycle. When Kyber's HTTP returns (~T+500ms) and V2/V3
  // hasn't engaged its internal debounce yet (~T+800ms), there's a 300ms
  // window where every loading flag is false and the picker briefly
  // renders the lone Kyber row as "Kyber Best" before the skeleton
  // re-appears. Promote pendingQuote to true whenever ANY source flag
  // goes hot so the grace timer below has something to clear.
  useEffect(() => {
    if (bestLoading || loadingExactIn || loadingExactOut) {
      // Bridging state-promotion pattern: when a downstream loading flag
      // rises asynchronously after mount, sync pendingQuote up so the grace
      // timer has something to clear. `react-hooks/set-state-in-effect` is
      // overly strict for this case — there's no derived alternative because
      // pendingQuote must persist beyond the loading flag's lifetime.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingQuote(true)
    }
  }, [bestLoading, loadingExactIn, loadingExactOut])

  // Track the native trade pipeline's cycle. A "cycle" is a true→false
  // edge on loadingExactIn or loadingExactOut. The ref captures the rising
  // edge synchronously across renders; the state captures the falling edge
  // for the grace effect to react to.
  useEffect(() => {
    if (loadingExactIn || loadingExactOut) {
      nativeCycleStartedRef.current = true
    } else if (nativeCycleStartedRef.current) {
      nativeCycleStartedRef.current = false
      setNativeCycleDone(true)
    }
  }, [loadingExactIn, loadingExactOut])

  // Clear pendingQuote only when ALL source loading flags are quiet AND
  // either the native cycle has finished OR an absolute max-wait has
  // elapsed. The max-wait is a safety valve for pairs where the native
  // pipeline determines it has no quote (no V2 pool) without ever raising
  // its loading flag — without it, the picker would stay in skeleton
  // forever on aggregator-only pairs.
  //
  // - 350ms when native already completed → tight follow-on.
  // - 2500ms when native hasn't engaged yet → covers the worst observed
  //   reserves-load gap (~1.4s) plus the V2 trade itself (~600ms) with
  //   margin, then falls through to show the Kyber-only result.
  useEffect(() => {
    if (!pendingQuote) return
    if (bestLoading || loadingExactIn || loadingExactOut) return
    const delay = nativeCycleDone ? 350 : 2500
    const t = setTimeout(() => setPendingQuote(false), delay)
    return () => clearTimeout(t)
  }, [pendingQuote, bestLoading, loadingExactIn, loadingExactOut, nativeCycleDone])

  // `fingerprintIsStale` covers the first-render window; `pendingQuote`
  // covers the post-loading grace; the source flags cover everything in
  // between. Either one being true → skeleton stays up.
  const isLoadingOrStale =
    fingerprintIsStale || bestLoading || loadingExactIn || loadingExactOut || pendingQuote
  const displayedOutput = rawDisplayedOutput

  // Both approval paths are called unconditionally per Hook rules. We pick
  // the one that matches the chosen route's source below. For aggregator
  // routes the spender is the aggregator's own router (e.g. Kyber Meta
  // Aggregation Router), not BrownFi's. For BrownFi-native routes we feed
  // the SELECTED trade so V3 trades approve the V3 router (and V2 trades
  // approve V2). useApproveCallbackFromTrade derives the router from
  // trade.route.pairs[0].version after the Phase 7.1 fix.
  const [nativeApproval, nativeApproveCallback] = useApproveCallbackFromTrade(
    activeNativeTrade,
    allowedSlippage,
  )
  const [aggregatorApproval, aggregatorApproveCallback] = useApproveCallback(
    parsedAmounts[Field.INPUT],
    isAggregatorRoute ? activeBest?.aggregatorQuote?.routerAddress : undefined,
  )
  const approval = isAggregatorRoute ? aggregatorApproval : nativeApproval
  const approveCallback = isAggregatorRoute ? aggregatorApproveCallback : nativeApproveCallback

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  // BrownFi-native swap callback. Feeds the SELECTED native trade (V2 OR
  // V3) — useSwapCallback dispatches to the correct router internally via
  // callSwapContract which reads trade.route.pairs[0].version.
  const { callback: nativeSwapCallback, error: nativeSwapCallbackError } = useSwapCallback(
    activeNativeTrade,
    allowedSlippage,
    recipient,
  )
  // Aggregator swap callback. Always called per Hook rules — short-circuits
  // when `best` is null or native.
  const { callback: aggregatorCallback, error: aggregatorCallbackError } = useAggregatorSwapCallback(
    activeBest,
    allowedSlippage,
    deadline ? deadline.toNumber() : Math.floor(Date.now() / 1000) + 600,
  )
  const swapCallback = isAggregatorRoute ? aggregatorCallback : nativeSwapCallback
  const swapCallbackError = isAggregatorRoute ? aggregatorCallbackError : nativeSwapCallbackError

  // Price impact derives from BrownFi's V2 trade. When the chosen route is
  // an aggregator (Kyber), V2's impact is irrelevant to the actual swap —
  // we'd be warning about a quote we're not executing. Treat impact as
  // undefined for aggregator routes (no severity warning, no disable).
  // V3 will need its own breakdown once concentrated-liquidity impact is
  // computable; for now V3 also bypasses the V2 warning.
  const { priceImpactWithoutFee } = useMemo(() => {
    if (!best || best.source !== 'brownfi-v2') return { priceImpactWithoutFee: undefined }
    return computeTradePriceBreakdown(displayTrade)
  }, [displayTrade, best])

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    // Stale aggregator quote — refetch before signing rather than build
    // calldata against an expired route. The user re-clicks Swap once the
    // fresh quote lands.
    if (bestIsStale) {
      refetchBest()
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, routeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, routeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
        // Refresh RainbowKit/wagmi balance display after swap
        setTimeout(() => queryClient.invalidateQueries(), 5000)
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          routeToConfirm,
          showConfirm,
          swapErrorMessage:
            error.message?.indexOf('user rejected transaction') !== -1
              ? 'User rejected transaction'
              : decodeContractError(error, error.message ?? 'Swap failed. Please try again.') ?? error.message,
          txHash: undefined,
        })
      })
  }, [
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    displayTrade,
    singleHopOnly,
    bestIsStale,
    refetchBest,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage. When price impact is unknown (e.g. aggregator
  // route — we only compute impact for BrownFi V2) treat as severity 0
  // rather than letting warningSeverity's undefined-handling default to
  // 4 ("Price Impact Too High") and block the swap.
  const priceImpactSeverity = priceImpactWithoutFee ? warningSeverity(priceImpactWithoutFee) : 0

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, routeToConfirm: undefined, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: displayTrade, routeToConfirm: best ?? undefined, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, displayTrade, txHash, best])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  )

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <AppBody>
        <SwapHeader />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={displayTrade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            bestRoute={activeBest}
            inputAmount={parsedAmounts[Field.INPUT]}
            outputCurrency={currencies[Field.OUTPUT]}
          />

          <AutoColumn gap={'8px'}>
            <CurrencyInputPanel
              label={'You Pay'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
              showCommonBases={true}
              balanceUsdPrice={inputUsdPrice}
              // Pulse only when this field is the DEPENDENT side (user is
              // typing OUTPUT). Combine both the derived `fingerprintIsStale`
              // (true on the same render as the input change) and the
              // state-based `pendingQuote` (grace period) so the dependent
              // field starts pulsing immediately, without the one-frame
              // stale-value flash.
              loading={
                loadingExactOut ||
                (independentField === Field.OUTPUT && (fingerprintIsStale || pendingQuote))
              }
            />
            <AutoColumn justify="space-between" className="relative">
              <AutoRow
                justify={isExpertMode ? 'space-between' : 'center'}
                style={{ padding: '0 1rem' }}
                className="absolute z-[9] top-[-20px]"
              >
                <ArrowWrapper clickable>
                  <a
                    role="button"
                    aria-label="Switch input and output tokens"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                    <img src={switchIcon} className="w-[20px]" alt="switch" />
                  </a>
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton
                    id="add-recipient-button"
                    aria-label="Add a recipient address"
                    onClick={() => onChangeRecipient('')}
                  >
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={displayedOutput}
              onUserInput={handleTypeOutput}
              loading={
                loadingExactIn ||
                bestLoading ||
                (independentField === Field.INPUT && (fingerprintIsStale || pendingQuote))
              }
              label={'Your Receive'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
              showCommonBases={true}
              balanceUsdPrice={outputUsdPrice}
            />

            {/* Inline route picker — renders whenever at least one
                source returned a quote (BrownFi V2 native and/or any
                aggregator). Click a row to pin that source. Persists to
                selectedAggregator. */}
            {routeCandidates.length >= 1 && !showWrap && (
              <RouteComparison
                candidates={routeCandidates}
                selected={selectedAggregator}
                onSelect={setSelectedAggregator}
                outputCurrency={currencies[Field.OUTPUT]}
                outputSymbol={getTokenSymbol(currencies[Field.OUTPUT], chainId) ?? ''}
                outputUsdPrice={outputUsdPrice}
                isLoading={isLoadingOrStale}
                lastFetchedAt={bestLastFetchedAt}
                refreshIntervalMs={bestRefreshIntervalMs}
                onRefresh={refetchBest}
              />
            )}

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton
                    id="remove-recipient-button"
                    aria-label="Remove recipient address"
                    onClick={() => onChangeRecipient(null)}
                  >
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            <AutoColumn gap="8px" style={{ padding: '4px 0px' }}>
              {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                <RowBetween align="center">
                  <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                    Slippage Tolerance
                  </ClickableText>
                  <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                    {allowedSlippage / 100}%
                  </ClickableText>
                </RowBetween>
              )}
              {/* Price row — route-aware. For BrownFi-native we use the
                  V2 trade's executionPrice (the existing TradePrice).
                  For aggregator routes the V2 trade's price doesn't
                  reflect what's actually being signed, so derive the
                  ratio from activeBest's amountOut + the user's input
                  amount. Hide while loading either way. */}
              {!isLoadingOrStale && isAggregatorRoute && activeBest && parsedAmounts[Field.INPUT] ? (
                <RowBetween align="center">
                  <Text fontWeight={500} fontSize={14} color={theme.text2}>
                    Price
                  </Text>
                  <AggregatorPriceRow
                    amountInRaw={parsedAmounts[Field.INPUT]?.raw.toString()}
                    inputDecimals={currencies[Field.INPUT] instanceof Token ? (currencies[Field.INPUT] as Token).decimals : 18}
                    inputSymbol={getTokenSymbol(currencies[Field.INPUT], chainId) ?? ''}
                    amountOut={activeBest.amountOut}
                    outputDecimals={currencies[Field.OUTPUT] instanceof Token ? (currencies[Field.OUTPUT] as Token).decimals : 18}
                    outputSymbol={getTokenSymbol(currencies[Field.OUTPUT], chainId) ?? ''}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                  />
                </RowBetween>
              ) : displayTrade && !isLoadingOrStale ? (
                <RowBetween align="center">
                  <Text fontWeight={500} fontSize={14} color={theme.text2}>
                    Price
                  </Text>
                  <TradePrice
                    price={displayTrade.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                  />
                </RowBetween>
              ) : (
                <div className="h-[22px]"></div>
              )}
              {/* Forced-aggregator-no-route notice. User picked a specific
                  aggregator in Settings but it has no route here, so
                  orchestration fell back to BrownFi native. */}
              {aggregatorFallbackNotice && (
                <RowBetween align="center">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(216, 160, 114, 0.08)',
                      border: '1px solid rgba(216, 160, 114, 0.30)',
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#D8A072',
                    }}
                  >
                    No route via{' '}
                    {String(selectedAggregator).charAt(0).toUpperCase() +
                      String(selectedAggregator).slice(1)}{' '}
                    for this pair — using BrownFi
                  </span>
                </RowBetween>
              )}
            </AutoColumn>
          </AutoColumn>
          {/* Route-aware details panel. Native routes render V2's full
              detail (Min received / Price Impact / LP Fee / Route) from
              the SDK Trade. Aggregator routes (Kyber) don't have those
              same semantics — Kyber's fee is baked into the quote, not
              an LP fee — so we render only Minimum received from the
              activeBest snapshot. Hidden during loading either way. */}
          {!swapIsUnsupported && !isLoadingOrStale && (
            isAggregatorRoute && activeBest ? (
              <AggregatorDetails
                amountOutMin={activeBest.amountOutMin}
                outputDecimals={currencies[Field.OUTPUT] instanceof Token ? (currencies[Field.OUTPUT] as Token).decimals : 18}
                outputSymbol={getTokenSymbol(currencies[Field.OUTPUT], chainId) ?? ''}
              />
            ) : (
              <AdvancedSwapDetailsDropdown trade={displayTrade} />
            )
          )}
          <BottomGrouping>
            {swapIsUnsupported ? (
              <ButtonError disabled>Unsupported Asset</ButtonError>
            ) : !account ? (
              <ConnectWallet />
            ) : showWrap && !isLoadingWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={handleWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : isLoadingWrap || (isLoadingOrStale && userHasSpecifiedInputOutput) ? (
              // Use isLoadingOrStale (the same signal that gates the route
              // details/skeleton) rather than just loadingExactIn/Out — the
              // latter has gaps (debounce + async reserve-load window) where no
              // flag is hot yet, leaving the button with no loading feedback on
              // no-aggregator pairs. This keeps the button in sync with the
              // skeleton: loading from keystroke until the quote resolves.
              //
              // NOTE: intentionally NOT gated on `!swapInputError`. Errors like
              // "Insufficient balance" are known synchronously, but the user
              // still needs immediate confirmation that their input registered
              // and a quote is being fetched (the output field's opacity pulse
              // is too subtle, esp. on an empty field). Once the quote resolves
              // and isLoadingOrStale clears, this falls through to the balance/
              // error button below.
              <ButtonError disabled>
                <Dots>Finding best price</Dots>
              </ButtonError>
            ) : noRoute && userHasSpecifiedInputOutput && !swapInputError ? (
              <ButtonError disabled>
                Insufficient liquidity for this trade.
              </ButtonError>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>Approving</Dots>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + getTokenSymbol(currencies[Field.INPUT], chainId)
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: displayTrade,
                        routeToConfirm: best ?? undefined,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  error={isValid && priceImpactSeverity > 2}
                >
                  {priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: displayTrade,
                      routeToConfirm: best ?? undefined,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3 && !isExpertMode
                  ? `Price Impact Too High`
                  : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressCircles steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
      </AppBody>

      {swapIsUnsupported && (
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  )
}
