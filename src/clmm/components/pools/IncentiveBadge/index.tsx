import { useMerklIncentive } from "@clmm/hooks/pools/useMerklIncentive";
import { merklOpportunityUrl } from "@clmm/config/merkl";
import { formatAmount } from "@clmm/utils";
import { ExternalLink } from "lucide-react";

/**
 * Merkl incentive APR badge — reward APR + reward-token logo(s), linking to the
 * pool's Merkl opportunity page. Hidden (or "—") when there's no live campaign.
 * - "cell":   pool-list cell; the whole value links to Merkl; "—" when none.
 * - "stat":   labeled stat block matching the position card's LIQUIDITY / APR.
 * - "inline": compact row for the pool header, next to the contract link — plain
 *             text with the % highlighted; only the ↗ icon is the link.
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

    const logos = rewardTokens.map((t) =>
        t.icon ? (
            <img key={t.symbol} src={t.icon} alt={t.symbol} title={t.symbol} className={`${logoSize} rounded-full`} />
        ) : (
            <span key={t.symbol} className="text-xs font-medium">
                {t.symbol}
            </span>
        ),
    );

    const merklHref = opportunityId ? merklOpportunityUrl(opportunityId) : undefined;

    // Inline: inherit the address row's muted color; only the % is green and only
    // the ↗ icon navigates to Merkl (matching the contract explorer link).
    if (compact) {
        return (
            <span className="flex items-center gap-1.5">
                <span>
                    Incentive APR <span className="text-green-300 font-medium">{`${formatAmount(apr, 2)}%`}</span>
                </span>
                {logos}
                {merklHref && (
                    <a
                        href={merklHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-text-100 transition-colors"
                        aria-label="View campaign on Merkl"
                    >
                        <ExternalLink size={11} />
                    </a>
                )}
            </span>
        );
    }

    // cell / stat: the whole value is green and links to Merkl.
    const value = (
        <span className="flex items-center gap-1.5 text-green-300 font-semibold">
            <span>{`${formatAmount(apr, 2)}%`}</span>
            {logos}
            <ExternalLink size={12} className="opacity-70" />
        </span>
    );
    const linked = merklHref ? (
        <a href={merklHref} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {value}
        </a>
    ) : (
        value
    );

    if (variant === "cell") return linked;

    return (
        <div>
            <div className="font-bold text-xs text-text-100/75 mb-2">INCENTIVE APR</div>
            <div className="font-semibold text-xl">{linked}</div>
        </div>
    );
}
