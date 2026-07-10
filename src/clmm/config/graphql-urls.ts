import { ChainId } from "@cryptoalgebra/integral-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = true;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt";

/* BrownFi Algebra subgraph URLs on Hemi.
 * Empty by default — fall back to on-chain reads. Set via .env to enable
 * pool/position lists, analytics, and farming features once deployed. */
export const INFO_GRAPH_URL = {
    [ChainId.Hemi]: (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HEMI_INFO_SUBGRAPH ?? "",
};

export const FARMING_GRAPH_URL = {
    [ChainId.Hemi]: (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HEMI_FARMING_SUBGRAPH ?? "",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.Hemi]: (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HEMI_LIMIT_ORDERS_SUBGRAPH ?? "",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.Hemi]: (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HEMI_BLOCKS_SUBGRAPH ?? "",
};
