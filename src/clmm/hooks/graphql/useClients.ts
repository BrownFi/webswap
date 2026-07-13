import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { infoClient, farmingClient, limitOrderClient, uniswapInfoClient, blocksClient } from "@clmm/graphql/clients";

export function useClients() {
    const chainId = DEFAULT_CHAIN_ID;

    return {
        infoClient: infoClient[chainId],
        uniswapInfoClient,
        farmingClient: farmingClient[chainId],
        limitOrderClient: limitOrderClient[chainId],
        blocksClient: blocksClient[chainId],
    };
}
