import useENS from 'hooks/useENS'
import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade } from '@brownfi/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { getNativeToken, isAddress, isNativeCurrency } from 'utils'
import useDebounce from 'hooks/useDebounce'
import { AppDispatch, AppState } from 'state'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { hasV3Pilot, ROUTER_ADDRESS_V3_OFFICIAL } from 'lib/sdk/constants/addresses'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : '',
        }),
      )
    },
    [dispatch],
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch],
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  /** V3 BrownFi trade, when the V3 pool indexer has liquidity for this pair.
   *  Quoted in parallel with V2 so the smart router can compare them. */
  v3PilotTrade: Trade | undefined
  /** V3 Official (v3-final, version 4) trade — quoted in parallel with the
   *  pilot V3 (version 3) so the router can compare both deployments. */
  v3OfficialTrade: Trade | undefined
  /** Per-source applicability + failure reason for the route comparison, so
   *  the picker can list every BrownFi version deployed on the chain (even
   *  ones with no route) and explain why. */
  nativeStatuses: Array<{
    source: 'brownfi-v2' | 'brownfi-v3-pilot' | 'brownfi-v3-official'
    sourceName: string
    supported: boolean
    reason?: string
  }>
  /** When V2's output exceeds its 90%-reserve cap, the max output the pool can
   *  give (e.g. "Max ~123.45 HONEY"), so the picker can show how far to reduce. */
  v2MaxOutputHint?: string
  inputError?: string
  /** BrownFi-V2-specific constraint: amount-out > 90% of pool reserve.
   *  Surfaced separately so the Swap page can decide whether to block —
   *  only relevant when the chosen route is V2. */
  v2AmountOutExceedsReserve: boolean
  /** Both BrownFi V2 and V3 have insufficient pool liquidity for this
   *  trade. Surfaced separately so the Swap page can still allow the
   *  swap if an aggregator route exists. */
  nativePoolLiquidityInsufficient: boolean
  /** A native pool rejected the trade for exceeding its per-swap cap (curve
   *  limit), not for being empty. UI shows a "reduce amount" message. */
  nativePoolMaxExceeded: boolean
  loadingExactIn: boolean
  loadingExactOut: boolean
} {
  const { account, chainId } = useActiveWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const debouncedTypedValue = useDebounce(typedValue, 300)
  const parsedAmount = tryParseAmount(debouncedTypedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
  const isInputEmpty = !(+debouncedTypedValue > 0)

  // Dual-quote both BrownFi versions in parallel. useBestSwapRoute will
  // compare them against each other AND against every supported external
  // aggregator (Kyber, …) and pick the winner. The trade pipeline is no
  // longer pinned to one version — each call passes its target version
  // explicitly so the global versionSelector (used by Add/Remove Liquidity)
  // doesn't leak into the Swap surface.
  //
  // V3 is gated by whether a V3 router is deployed on this chain. Hook
  // call order stays stable (we still call useTradeExactIn/Out for V3) —
  // we just feed `undefined` for the amount so the underlying pipeline
  // short-circuits and skips the multicall.
  // Quote V2 + BOTH V3-gen deployments (pilot=3, official=4) in parallel so
  // useBestSwapRoute can compare all of them (+ aggregators) and pick best.
  // Each pipeline is gated by whether that deployment's router exists on the
  // chain; hook call order stays stable (we always call the hooks, feeding
  // `undefined` amount to skip the multicall when inert).
  const chainSupportsV3Pilot = hasV3Pilot(chainId) // pilot — env-gated (hidden on beta/mainnet)
  const chainSupportsV3Official = !!chainId && !!ROUTER_ADDRESS_V3_OFFICIAL[chainId] // official
  // V2 is deprecated (being wound down) — don't quote it on Swap. Each candidate
  // pair is an on-chain RPC quote + Pyth fetch, and V2 added a whole second
  // pipeline for a version we no longer route to. Feed `undefined` so the hooks
  // stay called (stable order) but skip the multicall. Flip SWAP_QUOTE_V2 to
  // re-enable. Pool detail/list still read V2 independently.
  const SWAP_QUOTE_V2 = false
  const tradeInV2 = useTradeExactIn(SWAP_QUOTE_V2 && isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, 2)
  const tradeOutV2 = useTradeExactOut(inputCurrency ?? undefined, SWAP_QUOTE_V2 && !isExactIn ? parsedAmount : undefined, 2)
  const tradeInV3Pilot = useTradeExactIn(
    isExactIn && chainSupportsV3Pilot ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    3,
  )
  const tradeOutV3Pilot = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn && chainSupportsV3Pilot ? parsedAmount : undefined,
    3,
  )
  const tradeInV3Official = useTradeExactIn(
    isExactIn && chainSupportsV3Official ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    4,
  )
  const tradeOutV3Official = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn && chainSupportsV3Official ? parsedAmount : undefined,
    4,
  )

  const v2Trade = isExactIn ? tradeInV2.trade : tradeOutV2.trade
  const v3PilotTrade = isExactIn ? tradeInV3Pilot.trade : tradeOutV3Pilot.trade
  const v3OfficialTrade = isExactIn ? tradeInV3Official.trade : tradeOutV3Official.trade

  // Loading + insufficient unioned across V2 + V3-pilot + V3-official. Inert
  // pipelines (no router on chain) are excluded so an idle one doesn't mask a
  // real "insufficient" verdict from the others.
  const loadingExactIn =
    tradeInV2.loadingExactIn ||
    (chainSupportsV3Pilot && tradeInV3Pilot.loadingExactIn) ||
    (chainSupportsV3Official && tradeInV3Official.loadingExactIn)
  const loadingExactOut =
    tradeOutV2.loadingExactOut ||
    (chainSupportsV3Pilot && tradeOutV3Pilot.loadingExactOut) ||
    (chainSupportsV3Official && tradeOutV3Official.loadingExactOut)
  // "Insufficient" only when EVERY deployed pipeline says insufficient.
  const insufficientIn = [
    tradeInV2.isInsufficient,
    !chainSupportsV3Pilot || tradeInV3Pilot.isInsufficient,
    !chainSupportsV3Official || tradeInV3Official.isInsufficient,
  ].every(Boolean)
  const insufficientOut = [
    tradeOutV2.isInsufficient,
    !chainSupportsV3Pilot || tradeOutV3Pilot.isInsufficient,
    !chainSupportsV3Official || tradeOutV3Official.isInsufficient,
  ].every(Boolean)
  const isInsufficient = insufficientIn || insufficientOut

  // Distinct from "insufficient": at least one native pipeline rejected the
  // trade because it exceeds the pool's per-swap cap (oracle-AMM curve limit),
  // not because the pool is empty. Surfaced so the button can say "reduce
  // amount" instead of the misleading "insufficient liquidity".
  const someMaxExceeded = [
    tradeInV2.maxExceeded,
    chainSupportsV3Pilot && tradeInV3Pilot.maxExceeded,
    chainSupportsV3Official && tradeInV3Official.maxExceeded,
    tradeOutV2.maxExceeded,
    chainSupportsV3Pilot && tradeOutV3Pilot.maxExceeded,
    chainSupportsV3Official && tradeOutV3Official.maxExceeded,
  ].some(Boolean)

  // Keep tradeIn/tradeOut for the rest of the function — these are
  // V2-backed values used by the existing inputError + balance-check logic
  // below. Real winner selection happens in useBestSwapRoute.
  const tradeIn = tradeInV2
  const tradeOut = tradeOutV2
  const bestTradeExactIn = tradeIn.trade
  const bestTradeExactOut = tradeOut.trade

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined

  const reserve0 = v2Trade?.route?.pairs?.[0]?.reserve0
  const reserve1 = v2Trade?.route?.pairs?.[0]?.reserve1

  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // Compare input balance to required input. Two cases:
  //  - Exact-in (user typed INPUT): input amount = parsedAmount. This works
  //    REGARDLESS of which route source wins (V2 / V3 / Kyber), so we don't
  //    gate on v2Trade existing. Earlier we only checked when v2Trade was
  //    present, which silently left the Swap button enabled for aggregator-
  //    only pairs even with zero balance.
  //  - Exact-out (user typed OUTPUT): the required input is the trade's
  //    maximumAmountIn (with slippage). Use whichever native pipeline quoted
  //    (V3 Official / Pilot / V2) — gating on v2Trade alone left the button
  //    wrongly enabled with zero balance when the exact-out route was V3.
  const balanceIn = currencyBalances[Field.INPUT]
  const exactOutTrade = v3OfficialTrade ?? v3PilotTrade ?? v2Trade
  const exactOutRequiredIn =
    !isExactIn && exactOutTrade && allowedSlippage
      ? computeSlippageAdjustedAmounts(exactOutTrade, allowedSlippage)[Field.INPUT]
      : null
  const requiredIn = isExactIn ? parsedAmount : exactOutRequiredIn
  const amountOut = slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.OUTPUT] : null

  if (balanceIn && requiredIn && balanceIn.lessThan(requiredIn)) {
    let symbol = requiredIn.currency.symbol
    if (chainId && symbol === ETHER.symbol) {
      symbol = getNativeToken(chainId)
    }
    inputError = 'Insufficient ' + symbol + ' balance'
  }

  // 90%-of-reserve constraint is a BrownFi-V2-pool-specific check. We
  // expose it as a separate field rather than baking it into inputError
  // so the Swap page can decide whether to block: if the smart router's
  // best route isn't V2 (e.g., it's Kyber or V3), this constraint is
  // irrelevant — the swap can proceed through the other source.
  const compareOut =
    outputCurrency?.symbol === reserve1?.token.symbol ||
    (outputCurrency === ETHER && isNativeCurrency(reserve1?.token.symbol))
      ? reserve1
      : reserve0
  const v2AmountOutExceedsReserve = !!(
    amountOut && compareOut && +amountOut?.toExact() > +compareOut.toExact() * 0.9
  )

  // BrownFi-native pool liquidity flag: true when neither V2 nor V3 has
  // a route and the SDK signaled insufficient reserves. Surfaced as a
  // separate flag so the Swap page can combine it with aggregator-route
  // availability before deciding to block the swap.
  const noNativeTrade = !v2Trade && !v3PilotTrade && !v3OfficialTrade
  const nativePoolLiquidityInsufficient =
    !!isInsufficient && noNativeTrade && !isInputEmpty && !loadingExactIn && !loadingExactOut

  // A native pool rejected the trade for exceeding its per-swap cap. Driven
  // directly off `someMaxExceeded` (NOT the all-pipelines-insufficient union,
  // which is false whenever a pair has no V2 pool — e.g. V3-only pairs like
  // HYPE/USDC on HyperEVM), so it still fires there.
  const nativePoolMaxExceeded =
    someMaxExceeded && noNativeTrade && !isInputEmpty && !loadingExactIn && !loadingExactOut

  // Per-source status for the route comparison. Surfaces EVERY BrownFi version
  // deployed on this chain (not only the ones that produced a quote) so the
  // picker can list V2 / V3 Official / V3 Pilot side-by-side and explain a
  // missing route (no liquidity, per-swap cap). `reason` is left undefined
  // while still loading so the UI doesn't flash a premature "No route".
  const settled = !isInputEmpty && !loadingExactIn && !loadingExactOut
  // Flags for the ACTIVE direction (exact-in vs exact-out) per version — the
  // inactive direction's hook runs with no amount, so its `hasPools` is always
  // false and would mislabel a live pool as "No pool".
  const v2Flags = isExactIn ? tradeInV2 : tradeOutV2
  const pilotFlags = isExactIn ? tradeInV3Pilot : tradeOutV3Pilot
  const officialFlags = isExactIn ? tradeInV3Official : tradeOutV3Official
  // Format the per-swap-cap "max input" (raw, input-token units) into a short,
  // actionable hint like "Max ~123.45 USDT" so the user knows how far to reduce.
  const fmtMaxIn = (raw?: string): string | undefined => {
    if (!raw || !inputCurrency) return undefined
    const num = Number(raw) / 10 ** inputCurrency.decimals
    if (!isFinite(num) || num <= 0) return undefined
    let sym = inputCurrency.symbol
    if (chainId && (inputCurrency === ETHER || isNativeCurrency(sym))) sym = getNativeToken(chainId)
    return `Max ~${Number(num.toPrecision(6))}${sym ? ' ' + sym : ''}`
  }
  const nativeReason = (
    t: Trade | undefined | null,
    f: { isInsufficient?: boolean; maxExceeded?: boolean; hasPools?: boolean; maxInputRaw?: string; reason?: string },
  ): string | undefined => {
    if (t) return undefined
    if (!settled) return undefined
    // Per-swap cap hit: show the max swappable input when we decoded it, else a
    // short generic message. (Boss request: short + the value the user can input.)
    if (f.maxExceeded) return fmtMaxIn(f.maxInputRaw) ?? 'Exceeds pool max swap size'
    if (!f.hasPools) return 'No pool' // no pool deployed for this pair at this version
    // Decoded contract revert (e.g. "Price feed unstable" for the oracle
    // discrepancy guard). Preferred over the generic "Pool too thin" because the
    // real revert often has nothing to do with depth — and tells the user
    // whether reducing the amount would even help.
    if (f.reason) return f.reason
    if (f.isInsufficient) return 'Pool too thin' // pool exists but can't fill the trade
    return 'No route'
  }
  const nativeStatuses = [
    // V2 row only when we actually quote V2 on Swap (see SWAP_QUOTE_V2).
    ...(SWAP_QUOTE_V2
      ? [
          {
            source: 'brownfi-v2' as const,
            sourceName: 'BrownFi V2',
            supported: true,
            reason: nativeReason(v2Trade, v2Flags),
          },
        ]
      : []),
    {
      source: 'brownfi-v3-official' as const,
      sourceName: 'BrownFi V3',
      supported: chainSupportsV3Official,
      reason: nativeReason(v3OfficialTrade, officialFlags),
    },
    {
      source: 'brownfi-v3-pilot' as const,
      sourceName: 'BrownFi V3 Pilot',
      supported: chainSupportsV3Pilot,
      reason: nativeReason(v3PilotTrade, pilotFlags),
    },
  ]

  // V2 90%-reserve cap: a quote exists but its output exceeds 90% of the pool's
  // output reserve. Surface the max output the pool can give so the user knows
  // how far to reduce. `compareOut` is the output-side reserve (CurrencyAmount).
  const v2MaxOutputHint = (() => {
    if (!v2AmountOutExceedsReserve || !compareOut) return undefined
    const maxOut = +compareOut.toExact() * 0.9
    if (!isFinite(maxOut) || maxOut <= 0) return undefined
    let sym = outputCurrency?.symbol
    if (chainId && (outputCurrency === ETHER || isNativeCurrency(sym))) sym = getNativeToken(chainId)
    return `Max ~${Number(maxOut.toPrecision(6))}${sym ? ' ' + sym : ''}`
  })()

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    v3PilotTrade: v3PilotTrade ?? undefined,
    v3OfficialTrade: v3OfficialTrade ?? undefined,
    nativeStatuses,
    v2MaxOutputHint,
    inputError,
    v2AmountOutExceedsReserve,
    nativePoolLiquidityInsufficient,
    nativePoolMaxExceeded,
    loadingExactIn,
    loadingExactOut,
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH'
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient,
      }),
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
  }, [dispatch, chainId])

  return result
}
