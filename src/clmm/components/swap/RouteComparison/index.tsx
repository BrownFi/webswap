import { useState } from "react";
import { IDerivedSwapInfo } from "@clmm/state/swapStore";
import { useNordsternSwap } from "@clmm/hooks/swap/useNordsternSwap";
import { SwapRoutePreference, useSwapRoutePreference } from "@clmm/state/routePreferenceStore";
import { TradeState } from "@clmm/types/trade-state";
import { formatUnits } from "viem";
import { cn, formatAmount } from "@clmm/utils";
import { ChevronDown } from "lucide-react";

type RowKey = Exclude<SwapRoutePreference, "auto">;

/**
 * Route picker (inline accordion), modeled on the webswap Kyber RouteComparison:
 * collapsed trigger shows the active route + Best/Comparing badge + output; expand
 * to see BrownFi vs Nordstern side by side and force either. Handles the slow/loading
 * quote (skeleton until anything resolves, "Comparing…" until both settle) and the
 * no-route case per source.
 */
const RouteComparison = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const {
        nativeOut,
        nordsternOut,
        hasNative,
        hasNordstern,
        useNordstern,
        outputCurrency,
        isExactIn,
        isLoading: nordsternLoading,
    } = useNordsternSwap(derivedSwap);
    const { preferredRoute, setPreferredRoute } = useSwapRoutePreference();
    const [open, setOpen] = useState(false);

    const nativeLoading =
        derivedSwap.tradeState.state === TradeState.LOADING || derivedSwap.tradeState.state === TradeState.SYNCING;
    const hasAmount = Boolean(derivedSwap.parsedAmount);

    // Only for exact-input swaps with an amount entered.
    if (!isExactIn || !hasAmount || !outputCurrency) return null;

    const isLoading = nativeLoading || nordsternLoading;
    const hasAnyRoute = hasNative || hasNordstern;
    const showSkeleton = isLoading && !hasAnyRoute; // nothing resolved yet
    const comparing = isLoading && hasAnyRoute; // one in, still waiting on the other

    const fmt = (v: bigint) => `${formatAmount(formatUnits(v, outputCurrency.decimals), 6)} ${outputCurrency.symbol}`;

    const activeKey: RowKey = useNordstern ? "nordstern" : "brownfi";
    // Best = the higher available output (only meaningful once both settle).
    const bestKey: RowKey = hasNordstern && (!hasNative || nordsternOut > nativeOut) ? "nordstern" : "brownfi";

    const rows: { key: RowKey; label: string; out: bigint; available: boolean }[] = [
        { key: "brownfi", label: "BrownFi", out: nativeOut, available: hasNative },
        { key: "nordstern", label: "Nordstern", out: nordsternOut, available: hasNordstern },
    ];
    const active = rows.find((r) => r.key === activeKey)!;

    // Per-row % difference vs the best route (bigint math, 2-decimal precision).
    const bestRow = rows.find((r) => r.key === bestKey);
    const bestOut = bestRow?.available ? bestRow.out : 0n;
    const deltaPct = (out: bigint): number | undefined =>
        bestOut === 0n ? undefined : Number(((out - bestOut) * 10000n) / bestOut) / 100;

    // Click the Best row → back to auto; any other → pin that source.
    const handleSelect = (key: RowKey) => setPreferredRoute(key === bestKey ? "auto" : key);

    return (
        <div className="rounded-xl border border-card-border bg-card-dark overflow-hidden">
            <button
                type="button"
                disabled={showSkeleton}
                onClick={() => !showSkeleton && setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-text-300 uppercase tracking-wide">Route</span>
                    {showSkeleton ? (
                        <span className="inline-block w-20 h-3.5 rounded bg-card-border animate-pulse" />
                    ) : (
                        <>
                            <span className="font-semibold text-text-100">{active.label}</span>
                            {comparing ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-200/10 border border-primary-200/40 text-primary-200 uppercase">
                                    Comparing…
                                </span>
                            ) : active.available && active.key === bestKey ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/10 border border-green-400/40 text-green-300 uppercase">
                                    Best
                                </span>
                            ) : null}
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showSkeleton ? (
                        <span className="inline-block w-20 h-3.5 rounded bg-card-border animate-pulse" />
                    ) : (
                        <span className={cn("font-semibold", active.available ? "text-text-100" : "text-red-400 text-xs")}>
                            {active.available ? fmt(active.out) : "No route"}
                        </span>
                    )}
                    <ChevronDown size={14} className={cn("text-text-300 transition-transform", open && !showSkeleton && "rotate-180")} />
                </div>
            </button>

            <div
                className="grid transition-[grid-template-rows] duration-200"
                style={{ gridTemplateRows: open && !showSkeleton ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-card-border p-2 flex flex-col gap-1">
                        {rows.map((r) => {
                            const rowActive = r.key === activeKey;
                            return (
                                <button
                                    key={r.key}
                                    type="button"
                                    disabled={!r.available}
                                    onClick={() => r.available && handleSelect(r.key)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                                        rowActive ? "border-primary-100 bg-primary-100/10" : "border-transparent hover:bg-white/[0.03]",
                                        !r.available && "opacity-45 cursor-not-allowed"
                                    )}
                                >
                                    <span className="flex items-center gap-2.5 font-medium">
                                        <span
                                            className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                                            style={{ borderColor: rowActive ? "#D8A072" : "#493E35" }}
                                        >
                                            {rowActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-200" />}
                                        </span>
                                        {r.label}
                                        {!comparing && r.available && r.key === bestKey && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/10 border border-green-400/40 text-green-300 uppercase">
                                                Best
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className={cn("font-semibold", r.available ? "text-text-100" : "text-red-400 text-xs")}>
                                            {r.available ? fmt(r.out) : "No route"}
                                        </span>
                                        {!comparing && r.available && r.key !== bestKey && deltaPct(r.out) !== undefined && (
                                            <span
                                                className={cn(
                                                    "text-[11px] font-medium",
                                                    deltaPct(r.out)! < 0 ? "text-primary-200" : "text-green-300"
                                                )}
                                            >
                                                {deltaPct(r.out)! > 0 ? "+" : ""}
                                                {deltaPct(r.out)!.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteComparison;
