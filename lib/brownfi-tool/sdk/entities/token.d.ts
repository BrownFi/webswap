import { ChainId } from '../constants';
import { Currency } from './currency';
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export declare class Token extends Currency {
    readonly chainId: ChainId;
    readonly address: string;
    constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string);
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other: Token): boolean;
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other: Token): boolean;
}
/**
 * Compares two currencies for equality
 */
export declare function currencyEquals(currencyA: Currency | undefined, currencyB: Currency | undefined): boolean;
export declare const WETH: {
    1: Token;
    11155111: Token;
    [-1]: Token;
    [-11155111]: Token;
    97: Token;
    89: Token;
    88: Token;
    64165: Token;
    1946: Token;
    84532: Token;
    1301: Token;
    1313161555: Token;
    1088: Token;
    167009: Token;
};
