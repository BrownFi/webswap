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
import { ROUTER_ADDRESS_V3, ROUTER_ADDRESS_V4 } from 'lib/sdk/constants/addresses'

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
  v3Trade: Trade | undefined
  /** V3 Official (v3-final, version 4) trade — quoted in parallel with the
   *  pilot V3 (version 3) so the router can compare both deployments. */
  v4Trade: Trade | undefined
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
  const chainSupportsV3 = !!chainId && !!ROUTER_ADDRESS_V3[chainId] // pilot
  const chainSupportsV4 = !!chainId && !!ROUTER_ADDRESS_V4[chainId] // official
  const tradeInV2 = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, 2)
  const tradeOutV2 = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, 2)
  const tradeInV3 = useTradeExactIn(
    isExactIn && chainSupportsV3 ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    3,
  )
  const tradeOutV3 = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn && chainSupportsV3 ? parsedAmount : undefined,
    3,
  )
  const tradeInV4 = useTradeExactIn(
    isExactIn && chainSupportsV4 ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    4,
  )
  const tradeOutV4 = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn && chainSupportsV4 ? parsedAmount : undefined,
    4,
  )

  const v2Trade = isExactIn ? tradeInV2.trade : tradeOutV2.trade
  const v3Trade = isExactIn ? tradeInV3.trade : tradeOutV3.trade
  const v4Trade = isExactIn ? tradeInV4.trade : tradeOutV4.trade

  // Loading + insufficient unioned across V2 + V3-pilot + V3-official. Inert
  // pipelines (no router on chain) are excluded so an idle one doesn't mask a
  // real "insufficient" verdict from the others.
  const loadingExactIn =
    tradeInV2.loadingExactIn ||
    (chainSupportsV3 && tradeInV3.loadingExactIn) ||
    (chainSupportsV4 && tradeInV4.loadingExactIn)
  const loadingExactOut =
    tradeOutV2.loadingExactOut ||
    (chainSupportsV3 && tradeOutV3.loadingExactOut) ||
    (chainSupportsV4 && tradeOutV4.loadingExactOut)
  // "Insufficient" only when EVERY deployed pipeline says insufficient.
  const insufficientIn = [
    tradeInV2.isInsufficient,
    !chainSupportsV3 || tradeInV3.isInsufficient,
    !chainSupportsV4 || tradeInV4.isInsufficient,
  ].every(Boolean)
  const insufficientOut = [
    tradeOutV2.isInsufficient,
    !chainSupportsV3 || tradeOutV3.isInsufficient,
    !chainSupportsV4 || tradeOutV4.isInsufficient,
  ].every(Boolean)
  const isInsufficient = insufficientIn || insufficientOut

  // Distinct from "insufficient": at least one native pipeline rejected the
  // trade because it exceeds the pool's per-swap cap (oracle-AMM curve limit),
  // not because the pool is empty. Surfaced so the button can say "reduce
  // amount" instead of the misleading "insufficient liquidity".
  const someMaxExceeded = [
    tradeInV2.maxExceeded,
    chainSupportsV3 && tradeInV3.maxExceeded,
    chainSupportsV4 && tradeInV4.maxExceeded,
    tradeOutV2.maxExceeded,
    chainSupportsV3 && tradeOutV3.maxExceeded,
    chainSupportsV4 && tradeOutV4.maxExceeded,
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
  const exactOutTrade = v4Trade ?? v3Trade ?? v2Trade
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
  const noNativeTrade = !v2Trade && !v3Trade && !v4Trade
  const nativePoolLiquidityInsufficient =
    !!isInsufficient && noNativeTrade && !isInputEmpty && !loadingExactIn && !loadingExactOut

  // A native pool rejected the trade for exceeding its per-swap cap. Driven
  // directly off `someMaxExceeded` (NOT the all-pipelines-insufficient union,
  // which is false whenever a pair has no V2 pool — e.g. V3-only pairs like
  // HYPE/USDC on HyperEVM), so it still fires there.
  const nativePoolMaxExceeded =
    someMaxExceeded && noNativeTrade && !isInputEmpty && !loadingExactIn && !loadingExactOut

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    v3Trade: v3Trade ?? undefined,
    v4Trade: v4Trade ?? undefined,
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
