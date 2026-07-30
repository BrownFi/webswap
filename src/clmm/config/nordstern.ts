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

/**
 * Frontend fee ("convenienceFee") — a percentage skimmed from a Nordstern-routed
 * swap to BrownFi's treasury. Verified working: the API subtracts it from the user's
 * output and sends it to NORDSTERN_FEE_RECIPIENT. Set to 0 to disable (default off
 * until the team confirms the rate). Native BrownFi-pool swaps earn the pool fee
 * instead, so this only applies when the Nordstern route is used.
 */
export const NORDSTERN_FEE_PERCENT = 0; // e.g. 0.1 = 0.1%
export const NORDSTERN_FEE_RECIPIENT = "0x6369D6BE96B2B36FC30fB033703B3829a938b975" as Address;

export interface NordsternQuote {
    toAmount: bigint; // expected output
    minToAmount: bigint; // output after slippage (min received)
    gasEstimate: bigint;
    tx: { to: Address; value: bigint; data: `0x${string}` };
}
