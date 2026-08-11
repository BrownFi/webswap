import { useMerklIncentive } from "@clmm/hooks/pools/useMerklIncentive";
import { merklOpportunityUrl } from "@clmm/config/merkl";
import { formatAmount } from "@clmm/utils";
import { ExternalLink } from "lucide-react";

/**
 * Merkl incentive APR badge — reward APR + reward-token logo(s). Only the ↗ icon
 * links to the pool's Merkl opportunity page (so clicking the number in a list row
 * doesn't also trigger the row's navigate-to-detail). Hidden / "—" when no campaign.
 * - "cell":   pool-list cell (green value), "—" when none.
 * - "stat":   labeled stat block matching the position card's LIQUIDITY / APR.
 * - "header": prominent line under the pool-detail title.
 */
export default function IncentiveBadge({
    poolId,
    variant = "cell",
}: {
    poolId?: string;
    variant?: "cell" | "stat" | "header";
}) {
    const { apr, rewardTokens, opportunityId } = useMerklIncentive(poolId);

    if (!apr || apr <= 0) {
        return variant === "cell" ? <span className="opacity-40">—</span> : null;
    }

    const isHeader = variant === "header";
    const logoCls = "w-4 h-4";
    // Header link icon matches the address/contract link (12); the list cell matches
    // the reward-token logo (16).
    const iconSize = isHeader ? 12 : 16;
    const merklHref = opportunityId ? merklOpportunityUrl(opportunityId) : undefined;

    const logos = rewardTokens.map((t) =>
        t.icon ? (
            <img key={t.symbol} src={t.icon} alt={t.symbol} title={t.symbol} className={`${logoCls} rounded-full`} />
        ) : (
            <span key={t.symbol} className="text-xs font-medium">
                {t.symbol}
            </span>
        ),
    );

    // Only the ↗ icon is the link. stopPropagation so a list-row click handler
    // (navigate to pool detail) doesn't also fire when opening Merkl.
    const iconLink = merklHref && (
        <a
            href={merklHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-text-100 transition-colors"
            aria-label="View campaign on Merkl"
        >
            <ExternalLink size={iconSize} className={isHeader ? "" : "opacity-70"} />
        </a>
    );

    // Header (pool detail): inline next to the pair title, slightly larger.
    if (isHeader) {
        return (
            <span className="flex items-center gap-1.5 shrink-0 text-base text-text-200">
                <span>
                    Incentive APR: <span className="text-green-300 font-semibold">{`${formatAmount(apr, 2)}%`}</span>
                </span>
                {logos}
                {iconLink}
            </span>
        );
    }

    // cell / stat: green value.
    const value = (
        <span className="flex items-center gap-1.5 text-green-300 font-semibold">
            <span>{`${formatAmount(apr, 2)}%`}</span>
            {logos}
            {iconLink}
        </span>
    );

    if (variant === "cell") return value;

    return (
        <div>
            <div className="font-bold text-xs text-text-100/75 mb-2">INCENTIVE APR</div>
            <div className="font-semibold text-xl">{value}</div>
        </div>
    );
}
