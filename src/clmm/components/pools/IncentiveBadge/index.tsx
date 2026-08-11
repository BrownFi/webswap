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
 * - "inline": compact row for the pool header — muted text, only the % highlighted.
 */
export default function IncentiveBadge({
    poolId,
    variant = "cell",
}: {
    poolId?: string;
    variant?: "cell" | "stat" | "inline";
}) {
    const { apr, rewardTokens, opportunityId } = useMerklIncentive(poolId);

    if (!apr || apr <= 0) {
        return variant === "cell" ? <span className="opacity-40">—</span> : null;
    }

    const compact = variant === "inline";
    const logoSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";
    const merklHref = opportunityId ? merklOpportunityUrl(opportunityId) : undefined;

    const logos = rewardTokens.map((t) =>
        t.icon ? (
            <img key={t.symbol} src={t.icon} alt={t.symbol} title={t.symbol} className={`${logoSize} rounded-full`} />
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
            <ExternalLink size={12} className={compact ? "" : "opacity-70"} />
        </a>
    );

    // Inline (pool header): inherit the address row's muted color, only % is green.
    if (compact) {
        return (
            <span className="flex items-center gap-1.5">
                <span>
                    Incentive APR: <span className="text-green-300 font-medium">{`${formatAmount(apr, 2)}%`}</span>
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
