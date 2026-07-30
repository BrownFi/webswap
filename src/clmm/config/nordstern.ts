import { Address } from "viem";

/**
 * Nordstern Finance — REST DEX aggregator (docs.nordstern.finance). Aggregates
 * external Hemi DEX liquidity and returns ready-to-submit calldata. No API key/fee;
 * CORS is open (access-control-allow-origin: *) so the browser calls it directly.
 *
 *   GET {NORDSTERN_API}/{chainId}?src&dst&amount(wei)&from&slippage(percent)
 *   -> { swaps, toAmount, minToAmount, gasEstimate, tx:{ to, value, data } }
 * `swaps:null` / `toAmount:"0"` / missing `tx` = no route.
 */
export const NORDSTERN_API = "https://api.nordstern.finance/aggregator";

// tx.to router ("Guard Contract") — the spender to approve the input token to.
export const NORDSTERN_ROUTER: Record<number, Address> = {
    43111: "0xC87De04e2EC1F4282dFF2933A2D58199f688fC3d",
};

// Sentinel the API uses for the native token.
export const NORDSTERN_NATIVE_SENTINEL = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

export const isNordsternSupported = (chainId?: number) => Boolean(chainId && NORDSTERN_ROUTER[chainId]);

export interface NordsternQuote {
    toAmount: bigint; // expected output
    minToAmount: bigint; // output after slippage (min received)
    gasEstimate: bigint;
    tx: { to: Address; value: bigint; data: `0x${string}` };
}
