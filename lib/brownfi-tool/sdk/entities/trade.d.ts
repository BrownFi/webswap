import { TradeType } from '../constants';
import { Currency } from './currency';
import { CurrencyAmount } from './fractions/currencyAmount';
import { Percent } from './fractions/percent';
import { Price } from './fractions/price';
import { Pair } from './pair';
import { Route } from './route';
import { Token } from './token';
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
interface InputOutput {
    readonly inputAmount: CurrencyAmount;
    readonly outputAmount: CurrencyAmount;
}
export declare function inputOutputComparator(a: InputOutput, b: InputOutput): number;
export declare function tradeComparator(a: Trade, b: Trade): number;
export interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class Trade {
    /**
     * The route of the trade, i.e. which pairs the trade goes through.
     */
    route: Route;
    /**
     * The type of the trade, either exact in or exact out.
     */
    tradeType: TradeType;
    amount: CurrencyAmount;
    /**
     * The input amount for the trade assuming no slippage.
     */
    inputAmount: CurrencyAmount | undefined;
    /**
     * The output amount for the trade assuming no slippage.
     */
    outputAmount: CurrencyAmount | undefined;
    /**
     * The price expressed in terms of output amount/input amount.
     */
    executionPrice: Price | undefined;
    /**
     * The mid price after the trade executes assuming no slippage.
     */
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    priceImpact: Percent | undefined;
    slippage: number | undefined;
    priceUpdate: string[];
    updateFee: number;
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn(route: Route, amountIn: CurrencyAmount): Trade;
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut(route: Route, amountOut: CurrencyAmount): Trade;
    constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType);
    init: (route: Route, amount: CurrencyAmount, tradeType: TradeType) => Promise<void>;
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount;
    static sleep(timeout: number): Promise<unknown>;
    static getPath(input: Currency, pairs: Pair[]): Token[] | null;
    /**
     * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactIn(pairs: Pair[], currencyAmountIn: CurrencyAmount, currencyOut: Currency, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountIn?: CurrencyAmount, bestTrades?: Trade[]): Promise<Trade[]>;
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyIn the currency to spend
     * @param currencyAmountOut the exact amount of currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountOut used in recursion; the original value of the currencyAmountOut parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactOut(pairs: Pair[], currencyIn: Currency, currencyAmountOut: CurrencyAmount, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountOut?: CurrencyAmount, bestTrades?: Trade[]): Promise<Trade[]>;
}
export {};
