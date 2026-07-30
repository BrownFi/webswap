import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { NORDSTERN_API, NORDSTERN_NATIVE_SENTINEL, NordsternQuote, isNordsternSupported } from "@clmm/config/nordstern";

interface UseNordsternQuoteParams {
    chainId: number;
    tokenIn?: Address;
    tokenInIsNative?: boolean;
    tokenOut?: Address;
    tokenOutIsNative?: boolean;
    amountIn?: bigint; // in wei
    from?: Address;
    slippage?: number; // percent, e.g. 0.5
    enabled?: boolean;
}

/**
 * Fetches a Nordstern aggregator quote for the given exact-input swap. Returns null
 * when there's no route. Browser calls the API directly (open CORS); the Referer
 * header is set automatically by the browser, so we don't (can't) set it here.
 */
export function useNordsternQuote({
    chainId,
    tokenIn,
    tokenInIsNative,
    tokenOut,
    tokenOutIsNative,
    amountIn,
    from,
    slippage = 0.5,
    enabled = true,
}: UseNordsternQuoteParams) {
    const src = tokenInIsNative ? NORDSTERN_NATIVE_SENTINEL : tokenIn;
    const dst = tokenOutIsNative ? NORDSTERN_NATIVE_SENTINEL : tokenOut;

    return useQuery<NordsternQuote | null>({
        queryKey: ["nordstern-quote", chainId, src, dst, amountIn?.toString(), from, slippage],
        enabled: Boolean(enabled && isNordsternSupported(chainId) && src && dst && from && amountIn && amountIn > 0n),
        refetchInterval: 15_000,
        staleTime: 10_000,
        retry: 1,
        queryFn: async (): Promise<NordsternQuote | null> => {
            const url = `${NORDSTERN_API}/${chainId}?src=${src}&dst=${dst}&amount=${amountIn}&from=${from}&slippage=${slippage}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const j = await res.json();
            // No route: swaps null / zero output / no tx to submit.
            if (!j?.swaps || !j?.tx?.data || !j?.toAmount || j.toAmount === "0") return null;
            return {
                toAmount: BigInt(j.toAmount),
                minToAmount: BigInt(j.minToAmount ?? j.toAmount),
                gasEstimate: BigInt(j.gasEstimate || 0),
                tx: {
                    to: j.tx.to as Address,
                    value: BigInt(j.tx.value || 0),
                    data: j.tx.data as `0x${string}`,
                },
            };
        },
    });
}
