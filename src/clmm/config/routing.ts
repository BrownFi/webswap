import { WNATIVE, Token, ChainId } from "@cryptoalgebra/integral-sdk";
import { TOKENS } from "./tokens";

type ChainTokenList = {
    readonly [chainId: number]: Token[];
};

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
    ...WNATIVE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]]));

// for native swap router — common bases used as intermediate hops when routing
// trades. Hemi liquidity is a linear chain (WETH-USDC.e-VUSD-hemiBTC-WBTC), so ALL
// core tokens must be bases or multi-hop routes through VUSD/hemiBTC can't be found.
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WNATIVE_ONLY,
    [ChainId.Hemi]: [
        ...WNATIVE_ONLY[ChainId.Hemi],
        TOKENS[ChainId.Hemi].USDC,
        TOKENS[ChainId.Hemi].USDT,
        TOKENS[ChainId.Hemi].WBTC,
        TOKENS[ChainId.Hemi].HEMIBTC,
        TOKENS[ChainId.Hemi].VUSD,
    ],
};
