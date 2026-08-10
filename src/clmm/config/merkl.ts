// Merkl incentive APR, served by BrownFi's own BE (proxying Merkl, like webswap on
// Bera) — the FE does NOT call Merkl directly. Per-pool endpoint:
//   GET {API}/merkl-campaign/?pool={address}  ->  { apr: number }
// Pool address must be lowercase.
const API_URL = import.meta.env.VITE_API_URL ?? "https://api.brownfi.io";

export const merklCampaignAprUrl = (pool: string) => `${API_URL}/merkl-campaign/?pool=${pool.toLowerCase()}`;
