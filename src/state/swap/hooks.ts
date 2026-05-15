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
  inputError?: string
  /** BrownFi-V2-specific constraint: amount-out > 90% of pool reserve.
   *  Surfaced separately so the Swap page can decide whether to block —
   *  only relevant when the chosen route is V2. */
  v2AmountOutExceedsReserve: boolean
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
  const tradeInV2 = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, 2)
  const tradeOutV2 = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, 2)
  const tradeInV3 = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, 3)
  const tradeOutV3 = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, 3)

  const v2Trade = isExactIn ? tradeInV2.trade : tradeOutV2.trade
  const v3Trade = isExactIn ? tradeInV3.trade : tradeOutV3.trade

  // Loading + insufficient flags are unioned across both versions so the UI
  // doesn't get stuck on "Insufficient liquidity" when only V3 has the pool.
  const loadingExactIn = tradeInV2.loadingExactIn || tradeInV3.loadingExactIn
  const loadingExactOut = tradeOutV2.loadingExactOut || tradeOutV3.loadingExactOut
  const isInsufficient =
    (tradeInV2.isInsufficient && tradeInV3.isInsufficient) ||
    (tradeOutV2.isInsufficient && tradeOutV3.isInsufficient)

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

  // compare input balance to max input
  const [balanceIn, amountIn, amountOut] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.OUTPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    let symbol = amountIn.currency.symbol
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

  // Only show "Insufficient pool liquidity" when BOTH V2 and V3 lack a
  // trade — if either version has a route, the smart router will surface
  // it as a candidate in RouteComparison.
  if (isInsufficient && !v2Trade && !v3Trade) {
    if (!isInputEmpty && !loadingExactIn && !loadingExactOut) {
      inputError = 'Insufficient pool liquidity for this trade. Try a smaller amount.'
    }
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    v3Trade: v3Trade ?? undefined,
    inputError,
    v2AmountOutExceedsReserve,
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
