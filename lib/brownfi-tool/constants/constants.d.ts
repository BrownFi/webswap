import { ChainId, JSBI, Token } from '../sdk';
export declare const BIPS_BASE: JSBI;
export declare const AddressZero = "0x0000000000000000000000000000000000000000";
export declare const ROUTER_ADDRESS: any;
export declare const ROUTER_ADDRESS_WITH_PRICE: any;
export declare const PYTH_ADDRESS: any;
export declare const RPC_URLS: any;
export declare enum Field {
    CURRENCY_A = "CURRENCY_A",
    CURRENCY_B = "CURRENCY_B",
    LIQUIDITY_PERCENT = "LIQUIDITY_PERCENT",
    LIQUIDITY = "LIQUIDITY"
}
export declare enum ApprovalState {
    UNKNOWN = 0,
    NOT_APPROVED = 1,
    PENDING = 2,
    APPROVED = 3
}
export declare const DAI: Token;
export declare const USDC: Token;
export declare const USDT: Token;
export declare const WBTC: Token;
export declare const BASE_USDC: Token;
export declare const PINNED_PAIRS: {
    readonly [chainId in ChainId]?: [Token, Token][];
};
declare type ChainTokenList = {
    readonly [chainId in ChainId]: Token[];
};
export declare const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList;
export interface SerializedToken {
    chainId: number;
    address: string;
    decimals: number;
    symbol?: string;
    name?: string;
}
export interface SerializedPair {
    token0: SerializedToken;
    token1: SerializedToken;
}
export {};
