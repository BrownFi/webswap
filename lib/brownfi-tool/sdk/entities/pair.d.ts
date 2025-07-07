import { Price } from './fractions/price';
import { TokenAmount } from './fractions/tokenAmount';
import { BigintIsh, ChainId } from '../constants';
import { Token } from './token';
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare class Pair {
    readonly liquidityToken: Token;
    readonly tokenAmounts: [TokenAmount, TokenAmount];
    readonly version: number;
    static getAddress(tokenA: Token, tokenB: Token, version: number): string;
    constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount, version: number);
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token: Token): boolean;
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price(): Price;
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price(): Price;
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token: Token): Price;
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId(): ChainId;
    get token0(): Token;
    get token1(): Token;
    get reserve0(): TokenAmount;
    get reserve1(): TokenAmount;
    reserveOf(token: Token): TokenAmount;
    getTradingFee(): Promise<number>;
    getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair];
    getOutputAmountAsync(inputAmount: TokenAmount, pairs: Pair[], path: Token[], chainId: ChainId, account: string): Promise<[TokenAmount, Pair, string[], number, number]>;
    getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair];
    getInputAmountAsync(outputAmount: TokenAmount, pairs: Pair[], path: Token[], chainId: ChainId, account: string): Promise<[TokenAmount, Pair, string[], number, number]>;
    getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount;
    getLiquidityValue(token: Token, totalSupply: TokenAmount, liquidity: TokenAmount, feeOn?: boolean, kLast?: BigintIsh): TokenAmount;
}
