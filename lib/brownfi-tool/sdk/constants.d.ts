import JSBI from 'jsbi';
export declare type BigintIsh = JSBI | bigint | string;
export declare const INITIAL_ALLOWED_SLIPPAGE = 50;
export declare enum ChainId {
    MAINNET = 1,
    SEPOLIA = 11155111,
    SN_MAIN = -1,
    SN_SEPOLIA = -11155111,
    BSC_TESTNET = 97,
    BSC_MAINNET = 56,
    VICTION_TESTNET = 89,
    VICTION_MAINNET = 88,
    SONIC_TESTNET = 64165,
    MINATO_SONEIUM = 1946,
    BASE_SEPOLIA = 84532,
    BASE_MAINNET = 8453,
    UNICHAIN_SEPOLIA = 1301,
    AURORA_TESTNET = 1313161555,
    METIS_MAINNET = 1088,
    TAIKO_TESTNET = 167009,
    BOBA_TESTNET = 28882,
    NEOX_MAINNET = 47763,
    U2U_MAINNET = 39,
    SCROLL_TESTNET = 534351,
    ARBITRUM_SEPOLIA = 421614,
    ARBITRUM_MAINNET = 42161,
    BERA_MAINNET = 80094,
    HYPER_EVM = 999,
    OP_MAINNET = 10,
    BOBA_MAINNET = 288
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
export declare const ROUTER_ADDRESS: any;
export declare const ROUTER_ADDRESS_V1: any;
export declare const ROUTER_ADDRESS_WITH_PRICE: any;
export declare const FACTORY_ADDRESS: any;
export declare const FACTORY_ADDRESS_V1: any;
export declare const INIT_CODE_HASH: any;
export declare const INIT_CODE_HASH_V1: any;
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
