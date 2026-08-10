import { useMemo } from "react";
import useSWR from "swr";
import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { merklOpportunitiesUrl } from "@clmm/config/merkl";

const fetchOpportunities = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : []));

export interface MerklRewardToken {
    symbol: string;
    icon?: string;
}

export interface MerklIncentive {
    // Campaign-only reward APR (0 when no live campaign -> renders "—").
    apr: number;
    // Reward tokens for the badge (symbol + logo url), populated once live.
    rewardTokens: MerklRewardToken[];
}

interface MerklOpportunity {
    identifier?: string;
    apr?: number;
    rewardsRecord?: { breakdowns?: { token?: { symbol?: string; icon?: string } }[] };
}

/**
 * Merkl incentive for a single pool.
 *
 * TEMP: reads Merkl directly (open CORS) as a stopgap — BrownFi's BE endpoint
 * (/merkl-campaign/) isn't deployed yet. One shared SWR request (same URL key) is
 * deduped across every row. Merkl's opportunity `identifier` === pool address;
 * `apr` is campaign-only (no swap-fee double-count); reward token symbols come
 * from `rewardsRecord.breakdowns` (only present while a campaign is live).
 *
 * TODO(tomorrow): swap back to the BE proxy `merklCampaignAprUrl(pool)`. For the
 * badge to keep the reward token, the BE must return the symbol(s) too — otherwise
 * it only returns { apr } and the badge falls back to "X%" with no token.
 */
export function useMerklIncentive(pool?: string): MerklIncentive {
    const { data } = useSWR(merklOpportunitiesUrl(DEFAULT_CHAIN_ID), fetchOpportunities, {
        refreshInterval: 60_000,
        shouldRetryOnError: false,
    });

    return useMemo(() => {
        if (!pool || !Array.isArray(data)) return { apr: 0, rewardTokens: [] };

        const opp = (data as MerklOpportunity[]).find(
            (o) => String(o?.identifier).toLowerCase() === pool.toLowerCase(),
        );
        if (!opp) return { apr: 0, rewardTokens: [] };

        const seen = new Set<string>();
        const rewardTokens: MerklRewardToken[] = [];
        for (const b of opp.rewardsRecord?.breakdowns ?? []) {
            const symbol = b?.token?.symbol;
            if (!symbol || seen.has(symbol)) continue;
            seen.add(symbol);
            rewardTokens.push({ symbol, icon: b?.token?.icon });
        }

        return { apr: Number(opp.apr) || 0, rewardTokens };
    }, [pool, data]);
}
