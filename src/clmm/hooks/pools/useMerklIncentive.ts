import useSWR from "swr";
import { merklCampaignAprUrl } from "@clmm/config/merkl";

const fetchApr = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null));

/**
 * Merkl incentive APR for a single pool, from BrownFi's BE (`/merkl-campaign/`).
 * Returns 0 when the pool has no live campaign (the BE returns { apr: 0 }), so the
 * Incentive column renders "—". Lights up automatically once a campaign is live.
 */
export function useMerklIncentive(pool?: string): number {
    const { data } = useSWR(pool ? merklCampaignAprUrl(pool) : null, fetchApr, {
        refreshInterval: 60_000,
        shouldRetryOnError: false,
    });

    return Number(data?.apr) || 0;
}
