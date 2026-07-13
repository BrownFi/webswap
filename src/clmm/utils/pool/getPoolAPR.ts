import { POOL_AVG_APR_API } from "@clmm/config/apr-urls";
import { Address } from "viem";

export async function getPoolAPR(poolId: Address) {
    if (!poolId) return;

    const poolsAPR = await fetch(POOL_AVG_APR_API).then((v) => v.json());

    if (poolsAPR[poolId.toLowerCase()]) {
        return poolsAPR[poolId.toLowerCase()];
    }

    return 0;
}
