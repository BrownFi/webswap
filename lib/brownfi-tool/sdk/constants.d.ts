import JSBI from 'jsbi';
export declare type BigintIsh = JSBI | bigint | string;
export declare const INITIAL_ALLOWED_SLIPPAGE = 50;
export declare enum ChainId {
    MAINNET = 1,
    SEPOLIA = 11155111,
    SN_MAIN = -1,
    SN_SEPOLIA = -11155111,
    BSC_TESTNET = 97,
    VICTION_TESTNET = 89,
    VICTION_MAINNET = 88,
    SONIC_TESTNET = 64165,
    MINATO_SONEIUM = 1946,
    BASE_SEPOLIA = 84532
}
export declare const ChainIdHex: any;
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
export declare const FACTORY_ADDRESS: {
    1: string;
    11155111: string;
    [-1]: string;
    [-11155111]: string;
    97: string;
    89: string;
    88: string;
    64165: string;
    1946: string;
    84532: string;
};
export declare const INIT_CODE_HASH: {
    1: string;
    11155111: string;
    97: string;
    89: string;
    88: string;
    64165: string;
    1946: string;
    84532: string;
};
export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const TWO: JSBI;
export declare const THREE: JSBI;
export declare const FIVE: JSBI;
export declare const TEN: JSBI;
export declare const _100: JSBI;
export declare const _997: JSBI;
export declare const _1000: JSBI;
export declare enum SolidityType {
    uint8 = "uint8",
    uint256 = "uint256"
}
export declare const SOLIDITY_TYPE_MAXIMA: {
    uint8: JSBI;
    uint256: JSBI;
};
