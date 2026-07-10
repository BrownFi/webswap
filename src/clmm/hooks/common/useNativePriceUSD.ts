import { useNativePriceQuery } from "@clmm/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";
import { INFO_GRAPH_URL, DEFAULT_CHAIN_ID } from "@clmm/config";
import { useChainId } from "wagmi";

export function useNativePriceUSD() {
    const { infoClient } = useClients();
    const chainId = DEFAULT_CHAIN_ID;
    const hasSubgraph = Boolean(INFO_GRAPH_URL[chainId ?? DEFAULT_CHAIN_ID]);

    const { data: bundles, loading } = useNativePriceQuery({
        client: infoClient,
        skip: !hasSubgraph,
    });

    return {
        nativePriceUSD: Number(bundles?.bundles[0].maticPriceUSD || 0),
        isLoading: hasSubgraph ? loading : false,
    };
}
