// Merkl incentive APR sources.
//
// PREFERRED (tomorrow): BrownFi's own BE proxies Merkl, per pool —
//   GET {API}/merkl-campaign/?pool=<lowercase addr> -> { apr }
// STOPGAP (now): call Merkl directly (open CORS) because the BE endpoint isn't
// deployed yet. Merkl's opportunity `identifier` IS the pool address and `apr`
// is campaign-only (no swap-fee double-count). Flip useMerklIncentive back to the
// BE URL once it's live.
const API_URL = import.meta.env.VITE_API_URL ?? "https://api.brownfi.io";

export const MERKL_API = "https://api.merkl.xyz/v4";
export const MERKL_PROTOCOL_ID = "brownfi";

// BE proxy (per pool) — preferred, use once deployed.
export const merklCampaignAprUrl = (pool: string) => `${API_URL}/merkl-campaign/?pool=${pool.toLowerCase()}`;

// Direct Merkl opportunities (all BrownFi pools on the chain) — temporary.
export const merklOpportunitiesUrl = (chainId: number) =>
    `${MERKL_API}/opportunities?mainProtocolId=${MERKL_PROTOCOL_ID}&chainId=${chainId}`;
