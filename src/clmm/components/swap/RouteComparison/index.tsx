import { IDerivedSwapInfo } from "@clmm/state/swapStore";
import { useNordsternSwap } from "@clmm/hooks/swap/useNordsternSwap";
import { SwapRoutePreference, useSwapRoutePreference } from "@clmm/state/routePreferenceStore";
import { formatUnits } from "viem";
import { cn, formatAmount } from "@clmm/utils";

/**
 * Route picker for the best-of swap: shows the BrownFi (native Algebra) output vs the
 * Nordstern aggregator output, flags the better one, and lets the user force either.
 * Only rendered for exact-input swaps that actually have a Nordstern route to compare.
 */
const RouteComparison = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { nativeOut, nordsternOut, hasNative, hasNordstern, useNordstern, outputCurrency, isExactIn } =
        useNordsternSwap(derivedSwap);
    const { preferredRoute, setPreferredRoute } = useSwapRoutePreference();

    if (!isExactIn || !hasNordstern || !outputCurrency) return null;

    const fmt = (v: bigint) => `${formatAmount(formatUnits(v, outputCurrency.decimals), 6)} ${outputCurrency.symbol}`;
    const selectedKey: SwapRoutePreference = useNordstern ? "nordstern" : "brownfi";
    const bestKey: SwapRoutePreference = nordsternOut > nativeOut ? "nordstern" : "brownfi";

    const rows: { key: SwapRoutePreference; label: string; out: bigint; available: boolean }[] = [
        { key: "brownfi", label: "BrownFi", out: nativeOut, available: hasNative },
        { key: "nordstern", label: "Nordstern", out: nordsternOut, available: hasNordstern },
    ];

    return (
        <div className="rounded-xl border border-card-border bg-card-dark p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-300">ROUTE</span>
                {preferredRoute !== "auto" && (
                    <button className="text-xs text-primary-200 hover:opacity-80" onClick={() => setPreferredRoute("auto")}>
                        Auto (best price)
                    </button>
                )}
            </div>
            {rows.map((r) => (
                <button
                    key={r.key}
                    disabled={!r.available}
                    onClick={() => setPreferredRoute(r.key)}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors",
                        selectedKey === r.key ? "border-primary-200 bg-primary-200/10" : "border-card-border hover:bg-white/[0.03]",
                        !r.available && "opacity-40 cursor-not-allowed"
                    )}
                >
                    <span className="flex items-center gap-2 font-medium">
                        <span
                            className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: selectedKey === r.key ? "#d59967" : "#555" }}
                        >
                            {selectedKey === r.key && <span className="w-1.5 h-1.5 rounded-full bg-primary-200" />}
                        </span>
                        {r.label}
                        {r.available && r.key === bestKey && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/15 text-green-300">Best</span>
                        )}
                    </span>
                    <span className="font-semibold">{r.available ? fmt(r.out) : "No route"}</span>
                </button>
            ))}
        </div>
    );
};

export default RouteComparison;
