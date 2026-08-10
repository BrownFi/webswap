import { useQuery } from "@tanstack/react-query";
import { fetchProtocolStats, ProtocolStats } from "../../../../services/protocolStatsService";

// Protocol-wide stats card, ported 1:1 from webswap's pool list (PoolStatsBar) so
// the CLMM pool list shows the same aggregated numbers with the same look. Shares
// the "protocolStats" react-query cache + the service that already sums webswap
// (V3 live + V2 all-time) AND the Hemi CLMM subgraph — no separate fetch.
const formatValue = (val: number) => {
    const n = Number(val) || 0;
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
};

const PoolStatsBar = () => {
    const { data: protocolStats, isLoading } = useQuery<ProtocolStats>({
        queryKey: ["protocolStats"],
        queryFn: fetchProtocolStats,
        staleTime: 10 * 60_000,
    });

    const hasData = !!protocolStats;

    const stats = [
        { label: "Total Value Locked", value: formatValue(protocolStats?.currentTvl ?? 0), sub: "Current TVL", subColor: "#978A80" },
        { label: "All - Time Volume", value: formatValue(protocolStats?.volumeAllTime ?? 0), sub: "Since launch", subColor: "#978A80" },
        { label: "24h Volume", value: formatValue(protocolStats?.volume24h ?? 0), sub: "Across all pools", subColor: "#978A80" },
        { label: "Total Fees", value: formatValue(protocolStats?.feesAllTime ?? 0), sub: "Since launch", subColor: "#978A80" },
        { label: "24h Fees", value: formatValue(protocolStats?.fees24h ?? 0), sub: "Auto-compound", subColor: "#978A80" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={`${stat.label}-${index}`}
                    className={`relative overflow-hidden flex flex-col gap-[4px] sm:gap-[8px] p-[12px] sm:p-[20px] items-center md:items-start text-center md:text-left ${
                        index === 0 ? "col-span-2 md:col-span-1" : ""
                    }`}
                    style={{ background: "#2F2823", borderRadius: "12px" }}
                >
                    {isLoading && !hasData ? (
                        <>
                            <div className="animate-pulse rounded h-[16px] sm:h-[20px] w-[60%]" style={{ background: "#493E35" }} />
                            <div className="animate-pulse rounded h-[22px] sm:h-[28px] w-[80%]" style={{ background: "#493E35" }} />
                            <div className="animate-pulse rounded h-[14px] sm:h-[18px] w-[50%]" style={{ background: "#493E35" }} />
                        </>
                    ) : (
                        <>
                            <span className="text-[11px] sm:text-[14px]" style={{ fontFamily: "Inter", fontWeight: 500, lineHeight: "1.4", color: "#FBFBFD" }}>
                                {stat.label}
                            </span>
                            <span
                                className="text-[16px] sm:text-[22px] leading-[22px] sm:leading-[28px]"
                                style={{ fontFamily: "Inter", fontWeight: 700, letterSpacing: "-0.02em", color: "#D8A072" }}
                            >
                                {stat.value}
                            </span>
                            {stat.sub && (
                                <span
                                    className="text-[10px] sm:text-[13px]"
                                    style={{ fontFamily: "Inter", fontWeight: 400, lineHeight: "1.4", letterSpacing: "-0.02em", color: stat.subColor }}
                                >
                                    {stat.sub}
                                </span>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PoolStatsBar;
