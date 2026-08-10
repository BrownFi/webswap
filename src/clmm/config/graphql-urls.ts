import { ChainId } from "@cryptoalgebra/integral-sdk";

/* BrownFi Algebra (Integral 1.2.2) subgraphs on Hemi.
 * Prod subgraphs live on The Graph's decentralized gateway and need an API key;
 * dev subgraphs are on the free hosted studio. Set VITE_GRAPH_API_KEY in .env to
 * use the prod gateway URLs; otherwise we fall back to the working dev studio URLs.
 * Get a key at https://thegraph.com/studio/apikeys/ */
const GRAPH_API_KEY = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_GRAPH_API_KEY;
const subgraph = (prodId: string, devUrl: string) =>
    GRAPH_API_KEY ? `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${prodId}` : devUrl;

// Uses Uniswap analytics data to populate charts (visual placeholder only). OFF
// now that the Hemi analytics subgraph is deployed — charts use real Hemi data.
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt";

// Analytics — pool/position lists, TVL/volume/fees, charts.
export const INFO_GRAPH_URL = {
    [ChainId.Hemi]: subgraph(
        "D1UwhrB45geUZTNQ2QwrXwGEhk69iBESApJJzz378ZeS",
        "https://api.studio.thegraph.com/query/50593/hemi-analytics/version/latest"
    ),
};

// Farmings.
export const FARMING_GRAPH_URL = {
    [ChainId.Hemi]: subgraph(
        "8nwkiXDhLjGXPAaVgN6C92RsXHhuWWL45ad14aSRqYEQ",
        "https://api.studio.thegraph.com/query/50593/hemi-farmings/version/latest"
    ),
};

// Disabled modules on Hemi — no subgraph. Clients are created but never queried.
export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.Hemi]: "",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.Hemi]: "",
};
