import invariant from 'tiny-invariant'
import { TradeType } from '../constants/enums'
import { ONE, ZERO } from '../constants/types'
import { WETH } from '../constants/tokens'
import { Token } from './token'
import { Currency, ETHER } from './currency'
import { currencyEquals } from './token'
import { Pair } from './pair'
import { Route } from './route'
import { Price } from './fractions/price'
import { CurrencyAmount } from './fractions/currencyAmount'
import { TokenAmount } from './fractions/tokenAmount'
import { Fraction } from './fractions/fraction'
import { Percent } from './fractions/percent'
import { sortedInsert } from '../utils'
import { InsufficientReservesError, InsufficientInputAmountError } from '../errors'

// Expected business-as-usual rejections when a candidate pool can't satisfy
// the requested amount — happens on every thin pool and shouldn't pollute the
// console. We surface only unexpected errors.
const isExpectedTradeError = (error: unknown): boolean =>
  error instanceof InsufficientReservesError ||
  error instanceof InsufficientInputAmountError ||
  (!!error && typeof (error as any).isInsufficientReservesError === 'boolean') ||
  (!!error && typeof (error as any).isInsufficientInputAmountError === 'boolean')

/**
 * Returns the wrapped version of a CurrencyAmount for use within the SDK
 */
export function wrappedAmount(currencyAmount: CurrencyAmount, chainId: number): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  if (currencyAmount.currency === ETHER) return new TokenAmount(WETH[chainId], currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

/**
 * Returns the wrapped version of a Currency for use within the SDK
 */
export function wrappedCurrency(currency: Currency, chainId: number): Token {
  if (currency instanceof Token) return currency
  if (currency === ETHER) return WETH[chainId]
  invariant(false, 'CURRENCY')
}

/**
 * Given pairs and a path, constructs a "compute pair" that has input reserve from
 * the first pair and output reserve from the last pair.
 */
export function getComputePair(pairs: Pair[], path: Token[]): Pair {
  const firstTokenAmounts = pairs[0].tokenAmounts
  const firstToken = path[0]
  const inputReserve = firstTokenAmounts[0].token.equals(firstToken)
    ? firstTokenAmounts[0]
    : firstTokenAmounts[1]

  const lastTokenAmounts = pairs[pairs.length - 1].tokenAmounts
  const lastToken = path[path.length - 1]
  const outputReserve = lastTokenAmounts[0].token.equals(lastToken)
    ? lastTokenAmounts[0]
    : lastTokenAmounts[1]

  return new Pair(inputReserve, outputReserve, pairs[0].version)
}

/**
 * Comparator that sorts trades by output (descending) then input (ascending)
 */
export function inputOutputComparator(a: Trade, b: Trade): number {
  invariant(currencyEquals(a.inputAmount!.currency, b.inputAmount!.currency), 'INPUT_CURRENCY')
  invariant(currencyEquals(a.outputAmount!.currency, b.outputAmount!.currency), 'OUTPUT_CURRENCY')

  if (a.outputAmount!.equalTo(b.outputAmount!)) {
    if (a.inputAmount!.equalTo(b.inputAmount!)) {
      return 0
    }
    if (a.inputAmount!.lessThan(b.inputAmount!)) {
      return -1
    } else {
      return 1
    }
  } else {
    if (a.outputAmount!.lessThan(b.outputAmount!)) {
      return 1
    } else {
      return -1
    }
  }
}

/**
 * Extension of inputOutputComparator that also considers priceImpact and route length
 */
export function tradeComparator(a: Trade, b: Trade): number {
  if (!a.priceImpact || !b.priceImpact || !a.inputAmount || !b.inputAmount || !a.outputAmount || !b.outputAmount) {
    return -1
  }
  const ioComp = inputOutputComparator(a, b)
  if (ioComp !== 0) {
    return ioComp
  }

  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1
  }

  return a.route.path.length - b.route.path.length
}

// Async for-loop helper (mirrors the bundle's _forTo / _for patterns)
async function asyncForTo<T>(
  array: T[],
  callback: (i: number) => Promise<void> | void
): Promise<void> {
  for (let i = 0; i < array.length; i++) {
    await callback(i)
  }
}

export interface BestTradeOptions {
  maxNumResults?: number
  maxHops?: number
}

/**
 * Result of bestTradeExactIn/Out: the sorted trade list, plus flags set during
 * the search. The flags ride on the array (accumulated through recursion) —
 * typed here so callers read them without `as any`.
 *
 * - maxExceeded: a candidate pool was skipped because the trade exceeds its
 *   per-swap cap (vs a genuinely empty pool). Lets the UI show "reduce amount"
 *   instead of "insufficient liquidity".
 * - transientError: a candidate quote threw a NON-business error (RPC timeout,
 *   Hermes fetch failure, JSON-RPC rate-limit) and was skipped. This is
 *   indistinguishable from "thin pool" at the result level (both yield no
 *   trade), so we flag it explicitly — the hook layer retries on this but NOT
 *   on a clean insufficient-liquidity result, so a momentary network blip
 *   doesn't leave the route permanently missing while a genuinely empty pool
 *   still reports "insufficient" immediately.
 */
export type TradeList = Trade[] & {
  maxExceeded?: boolean
  transientError?: boolean
  maxInputRaw?: string
  /** Raw revert info from a non-cap business rejection (insufficient reserves,
   *  oracle guard, …), carried verbatim so the hook layer can decode it into a
   *  user-facing reason without coupling the SDK to the app's error registry. */
  failRevert?: { selector?: string; data?: string; message?: string }
}

export class Trade {
  public readonly route: Route
  public readonly tradeType: TradeType
  public priceImpact: Percent
  public priceImpactK?: number
  public inputAmount?: CurrencyAmount
  public outputAmount?: CurrencyAmount
  public executionPrice?: Price
  public priceUpdate: string[]
  public updateFee: number
  public tradingFee?: number

  constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType) {
    this.route = route
    this.tradeType = tradeType
    this.priceImpact = new Percent('0')
    this.priceUpdate = []
    this.updateFee = 0
  }

  /**
   * Constructs an exact-in trade
   */
  static exactIn(route: Route, amountIn: CurrencyAmount): Trade {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT)
  }

  /**
   * Constructs an exact-out trade
   */
  static exactOut(route: Route, amountOut: CurrencyAmount): Trade {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT)
  }

  /**
   * Promise-based sleep helper
   */
  static sleep(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, timeout)
    })
  }

  /**
   * Given input currency and pairs, computes the full token path
   */
  static getPath(input: Currency, pairs: Pair[]): Token[] {
    const path: Token[] = [input instanceof Token ? input : WETH[pairs[0].chainId]]
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH')
      const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0
      path.push(output)
    }
    return path
  }

  /**
   * Async arrow function that computes amounts by calling getOutputAmountAsync or
   * getInputAmountAsync on the "compute pair".
   */
  computeAmount = async ({ value: amount, from: account }: { value: CurrencyAmount; from: string }): Promise<void> => {
    const route = this.route
    const tradeType = this.tradeType
    const amounts = new Array(2)

    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(currencyEquals(amount.currency, route.input), 'INPUT')
      const inputAmount = wrappedAmount(amount, route.chainId)
      const computePair = getComputePair(route.pairs, route.path)
      const [amountOut, , priceUpdate, updateFee, priceImpactK] =
        await computePair.getOutputAmountAsync(inputAmount, route.pairs, route.path, route.chainId, account)
      amounts[amounts.length - 1] = amountOut
      this.priceUpdate = priceUpdate
      this.updateFee = updateFee
      this.priceImpactK = priceImpactK
    } else {
      invariant(currencyEquals(amount.currency, route.output), 'OUTPUT')
      const outputAmount = wrappedAmount(amount, route.chainId)
      const computePair = getComputePair(route.pairs, route.path)
      const [amountIn, , priceUpdate, updateFee, priceImpactK] =
        await computePair.getInputAmountAsync(outputAmount, route.pairs, route.path, route.chainId, account)
      amounts[0] = amountIn
      this.priceUpdate = priceUpdate
      this.updateFee = updateFee
      this.priceImpactK = priceImpactK
    }

    this.inputAmount = tradeType === TradeType.EXACT_INPUT
      ? amount
      : route.input === ETHER
        ? CurrencyAmount.ether(amounts[0].raw)
        : amounts[0]

    this.outputAmount = tradeType === TradeType.EXACT_OUTPUT
      ? amount
      : route.output === ETHER
        ? CurrencyAmount.ether(amounts[amounts.length - 1].raw)
        : amounts[amounts.length - 1]

    this.executionPrice = new Price(
      this.inputAmount!.currency,
      this.outputAmount!.currency,
      this.inputAmount!.raw,
      this.outputAmount!.raw
    )
  }

  /**
   * Get the minimum amount the user will receive given slippage tolerance
   */
  minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
    if (!this.outputAmount) {
      return CurrencyAmount.ether('0')
    }
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(slippageTolerance)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.ether(slippageAdjustedAmountOut)
    }
  }

  /**
   * Get the maximum amount the user will send given slippage tolerance
   */
  maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
    if (!this.inputAmount) {
      return CurrencyAmount.ether('0')
    }
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(slippageTolerance)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.ether(slippageAdjustedAmountIn)
    }
  }

  /**
   * Find the best trade for exact input by recursing over pairs
   */
  static async bestTradeExactIn(
    account: string,
    pairs: Pair[],
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    currentPairs: Pair[] = [],
    originalAmountIn: CurrencyAmount = currencyAmountIn,
    bestTrades: TradeList = []
  ): Promise<TradeList> {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION')

    const chainId =
      currencyAmountIn instanceof TokenAmount
        ? currencyAmountIn.token.chainId
        : currencyOut instanceof Token
          ? currencyOut.chainId
          : undefined
    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountIn = wrappedAmount(currencyAmountIn, chainId!)
    const tokenOut = wrappedCurrency(currencyOut, chainId!)

    const wrappedOriginalIn = wrappedCurrency(originalAmountIn.currency, chainId!)

    await asyncForTo(pairs, async (i) => {
      const pair = pairs[i]

      if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) return
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return

      // Cycle guard: skip if this pair would route the path back to the original
      // input token (e.g., A→B→C→A→...). getComputePair would build Pair(X,X) and
      // throw the 'ADDRESSES' invariant, killing the whole search — even paths
      // that were already accumulated. Such loops are never optimal anyway.
      if (currentPairs.length > 0) {
        const otherToken = pair.token0.equals(amountIn.token) ? pair.token1 : pair.token0
        if (otherToken.equals(wrappedOriginalIn) && !otherToken.equals(tokenOut)) return
      }

      const path = Trade.getPath(originalAmountIn.currency, [...currentPairs, pair])
      const oAmountIn = wrappedAmount(originalAmountIn, chainId!)
      const computePair = getComputePair([...currentPairs, pair], path)

      let amountOut: TokenAmount | undefined
      try {
        const result = await computePair.getOutputAmountAsync(
          oAmountIn,
          [...currentPairs, pair],
          path,
          chainId!,
          account
        )
        amountOut = result[0]
      } catch (error) {
        if (!isExpectedTradeError(error)) {
          // A non-business error (RPC/Hermes/network) — the quote didn't get a
          // real answer. Flag it so the hook layer can retry rather than treat
          // this as a settled "no route".
          bestTrades.transientError = true
        }
        // Tag the result when the pool rejected because the trade exceeds its
        // per-swap cap (not an empty pool) so the UI can say "reduce amount".
        if ((error as any)?.isMaxAmountOutExceededError) {
          bestTrades.maxExceeded = true
          if ((error as any).maxIn) bestTrades.maxInputRaw = (error as any).maxIn
        } else if (!bestTrades.failRevert && (error as any)?.revertSelector !== undefined) {
          bestTrades.failRevert = {
            selector: (error as any).revertSelector,
            data: (error as any).revertData,
            message: (error as any).revertMessage,
          }
        }
        return
      }

      if (!amountOut) return

      // Defensive catch around match + recursion: a throw here (Pyth race making
      // computeAmount revert with MAX_80, an unforeseen invariant, etc.) must
      // not nuke trades already accumulated in bestTrades for other paths.
      try {
        if (amountOut.token.equals(tokenOut)) {
          const newRoute = new Route([...currentPairs, pair], originalAmountIn.currency, currencyOut)
          const newTrade = new Trade(newRoute, originalAmountIn, TradeType.EXACT_INPUT)
          await newTrade.computeAmount({ value: originalAmountIn, from: account })
          sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator)
        } else if (maxHops > 1 && pairs.length > 1) {
          const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))
          await Trade.bestTradeExactIn(
            account,
            pairsExcludingThisPair,
            amountOut,
            currencyOut,
            { maxNumResults, maxHops: maxHops - 1 },
            [...currentPairs, pair],
            originalAmountIn,
            bestTrades
          )
        }
      } catch {
        // Recursion / Route / computeAmount threw unexpectedly — treat as
        // transient so the hook retries rather than locking in a missing route.
        bestTrades.transientError = true
        return
      }
    })

    return bestTrades
  }

  /**
   * Find the best trade for exact output by recursing over pairs
   */
  static async bestTradeExactOut(
    account: string,
    pairs: Pair[],
    currencyIn: Currency,
    currencyAmountOut: CurrencyAmount,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    currentPairs: Pair[] = [],
    originalAmountOut: CurrencyAmount = currencyAmountOut,
    bestTrades: TradeList = []
  ): Promise<TradeList> {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION')

    const chainId =
      currencyAmountOut instanceof TokenAmount
        ? currencyAmountOut.token.chainId
        : currencyIn instanceof Token
          ? currencyIn.chainId
          : undefined
    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountOut = wrappedAmount(currencyAmountOut, chainId!)
    const tokenIn = wrappedCurrency(currencyIn, chainId!)

    const wrappedOriginalOut = wrappedCurrency(originalAmountOut.currency, chainId!)

    for (let i = 0; i < (pairs?.length ?? 0); i++) {
      const pair = pairs[i]

      if (!pair?.token0.equals(amountOut.token) && !pair?.token1.equals(amountOut.token)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      // Cycle guard (see bestTradeExactIn).
      if (currentPairs.length > 0) {
        const otherToken = pair.token0.equals(amountOut.token) ? pair.token1 : pair.token0
        if (otherToken.equals(wrappedOriginalOut) && !otherToken.equals(tokenIn)) continue
      }

      const path = Trade.getPath(originalAmountOut.currency, [...currentPairs, pair]).reverse()
      const oAmountOut = wrappedAmount(originalAmountOut, chainId!)
      const computePair = getComputePair([pair, ...currentPairs], path)

      let amountIn: TokenAmount | undefined
      try {
        const result = await computePair.getInputAmountAsync(
          oAmountOut,
          [...currentPairs, pair],
          path,
          chainId!,
          account
        )
        amountIn = result[0]
      } catch (error) {
        if (!isExpectedTradeError(error)) {
          // Non-business error — flag for retry (see bestTradeExactIn).
          bestTrades.transientError = true
        }
        if ((error as any)?.isMaxAmountOutExceededError) {
          bestTrades.maxExceeded = true
          if ((error as any).maxIn) bestTrades.maxInputRaw = (error as any).maxIn
        } else if (!bestTrades.failRevert && (error as any)?.revertSelector !== undefined) {
          bestTrades.failRevert = {
            selector: (error as any).revertSelector,
            data: (error as any).revertData,
            message: (error as any).revertMessage,
          }
        }
        continue
      }

      if (!amountIn) continue

      // Defensive catch (see bestTradeExactIn).
      try {
        if (amountIn.token.equals(tokenIn)) {
          const newRoute = new Route([pair, ...currentPairs], currencyIn, originalAmountOut.currency)
          const newTrade = new Trade(newRoute, originalAmountOut, TradeType.EXACT_OUTPUT)
          await newTrade.computeAmount({ value: originalAmountOut, from: account })
          sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator)
        } else if (maxHops > 1 && pairs.length > 1) {
          const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))
          await Trade.bestTradeExactOut(
            account,
            pairsExcludingThisPair,
            currencyIn,
            amountIn,
            { maxNumResults, maxHops: maxHops - 1 },
            [pair, ...currentPairs],
            originalAmountOut,
            bestTrades
          )
        }
      } catch {
        bestTrades.transientError = true
        continue
      }
    }

    return bestTrades
  }
}
