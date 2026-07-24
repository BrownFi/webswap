import { ChainId, Token, BoostedToken } from "@cryptoalgebra/integral-sdk";

/* Hemi default token list. Addresses + decimals verified on-chain; sourced from
 * the Hemi partner onboarding guide. Users can also trade any token by pasting
 * its address (pools are discovered on-chain). */
export const TOKENS = {
    [ChainId.Hemi]: {
        WETH: new Token(ChainId.Hemi, "0x4200000000000000000000000000000000000006", 18, "WETH", "Wrapped Ether"),
        USDC: new Token(ChainId.Hemi, "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA", 6, "USDC.e", "Bridged USDC (Stargate)"),
        HEMIBTC: new Token(ChainId.Hemi, "0xAA40c0c7644e0b2B224509571e10ad20d9C4ef28", 8, "hemiBTC", "Hemi Bitcoin"),
        WBTC: new Token(ChainId.Hemi, "0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3", 8, "WBTC", "Wrapped BTC"),
        VUSD: new Token(ChainId.Hemi, "0xD3599AE62EE280709A22268a46d23164214e345B", 18, "VUSD", "Vetro USD"),
    },
};

export const UNDERLYING_TOKENS = {
    [ChainId.Hemi]: {
        UNDERLYING_USDC: TOKENS[ChainId.Hemi].USDC,
        UNDERLYING_WETH: TOKENS[ChainId.Hemi].WETH,
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
// None deployed on Hemi yet — leave empty.
export const BOOSTED_TOKENS = {
    [ChainId.Hemi]: {} as Record<string, BoostedToken>,
};

/* Token logo map — keyed by lowercase address. */
export const TOKEN_LOGOS: Record<string, string> = {
    "0x4200000000000000000000000000000000000006": "/eth-logo.svg", // WETH (local canonical logo — coingecko hotlink gets ad-block/CSP-blocked in-browser)
    "0xad11a8beb98bbf61dbb1aa0f6d6f2ecd87b35afa": "https://assets.coingecko.com/coins/images/6319/standard/usdc.png", // USDC.e
    "0xaa40c0c7644e0b2b224509571e10ad20d9c4ef28": "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png", // hemiBTC
    "0x03c7054bcb39f7b2e5b2c7acb37583e32d70cfa3": "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png", // WBTC
    "0xd3599ae62ee280709a22268a46d23164214e345b": "/VUSD_Favicon_192.png", // VUSD (Vetro USD)
};

/* Native ETH logo (used when currency.isNative === true) */
export const NATIVE_LOGO: Record<number, string> = {
    [ChainId.Hemi]: "/eth-logo.svg",
};
