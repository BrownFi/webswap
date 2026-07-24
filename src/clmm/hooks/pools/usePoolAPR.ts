import { usePoolFeeDataQuery, useSinglePoolQuery } from "@clmm/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { DEFAULT_CHAIN_ID, INFO_GRAPH_URL } from "@clmm/config";

/**
 * Pool fee APR from the subgraph: annualize the most recent day's fees over the
 * pool's current TVL. Replaces getPoolAPR(), which fetched api.algebra.finance —
 * a host that has no BrownFi/Hemi data (returns {}), so POOL APR was always 0 even
 * for pools with real trading fees. Returns 0 when the pool has no fees/TVL yet
 * (a genuinely 0% pool), so the caller can render it directly.
 */
export function usePoolAPR(poolId: Address | undefined) {
    const { infoClient } = useClients();
    const hasSubgraph = Boolean(INFO_GRAPH_URL[DEFAULT_CHAIN_ID]);

    const { data: pool } = useSinglePoolQuery({
        variables: { poolId: poolId as string },
        client: infoClient,
        skip: !hasSubgraph || !poolId,
    });

    const { data: poolFeeData } = usePoolFeeDataQuery({
        variables: { poolId },
        client: infoClient,
        skip: !hasSubgraph || !poolId,
    });

    const dailyFees = poolFeeData?.poolDayDatas?.length ? Number(poolFeeData.poolDayDatas[0].feesUSD) : 0;
    const yearFee = dailyFees * 365;
    const tvl = pool?.pool ? Number(pool.pool.totalValueLockedUSD) : 0;

    return tvl > 0 ? (yearFee / tvl) * 100 : 0;
}
