const BASE_URL = import.meta.env.VITE_API_URL

async function fetchJson<T>(path: string, options?: { params?: Record<string, any>; timeout?: number }): Promise<T> {
  const url = new URL(path, BASE_URL)
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 10_000)
  try {
    // Public read-only endpoints — no cookies, no auth. Sending
    // `credentials: 'include'` against the API's `Access-Control-Allow-Origin:
    // *` + `Allow-Credentials: true` headers is forbidden by the CORS spec
    // and was causing intermittent failures in non-incognito browsers.
    const response = await fetch(url.toString(), { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

type PoolPrices = {
  chainId: number
  price0: string
  price1: string
  timestamp: number
  tokenA: string
  tokenB: string
}

const getPoolPrices = (options?: { chainId: number; tokenA: string; tokenB: string }) =>
  fetchJson<PoolPrices>(`/prices`, { params: options })

// TEMP (2026-06-23): these V3 pools just joined the Berachain cutting board,
// but the BE `/igbt-vault-apr` doesn't serve them yet (Manh deploys this
// evening). Until then, read the BGT APR straight from BeraHub's public API,
// which is CORS-open for our origin (no proxy needed). Keyed by lowercase LP
// address → reward vault. REMOVE this map + the BeraHub branch in getPoolBgt
// once the BE serves these vaults.
const BERAHUB_BGT_VAULTS: Record<string, string> = {
  '0xc123bc9259d1a99add5a2c512498ac146dd2bade': '0xa57d4c595a000e20f8ea8f82663a9c7b15d60168', // WETH/USDC.e V3
  '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26': '0xd54ec45cca5d428c3aef05993195c389c0b82b4e', // BERA/USDC.e V3
  '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c': '0x3f0cf0c62e5d7617c3f965bfefc656af650e459e', // WBERA/HONEY V3
}

// BeraHub's apr is already a fraction (0.1584 = 15.84%), matching the shape of
// our `/igbt-vault-apr` response, so callers need no special handling.
async function fetchBeraHubBgtApr(vault: string): Promise<{ apr: number }> {
  const query = `{ polGetRewardVaults(where:{vaultAddressIn:["${vault}"]}){ vaults{ dynamicData{ apr } } } }`
  const res = await fetch('https://api.berachain.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`BeraHub HTTP ${res.status}`)
  const json = await res.json()
  const apr = json?.data?.polGetRewardVaults?.vaults?.[0]?.dynamicData?.apr
  return { apr: Number(apr) || 0 }
}

const getPoolBgt = (options: { address: string }) => {
  const vault = BERAHUB_BGT_VAULTS[options.address.toLowerCase()]
  if (vault) return fetchBeraHubBgtApr(vault)
  return fetchJson<{ apr: number }>(`/igbt-vault-apr`, { params: { pool: options.address } })
}

const getMerklCampaignApr = (options: { address: string }) =>
  fetchJson<{ apr: number }>(`/merkl-campaign`, { params: { pool: options.address } })

export const apiV2Service = {
  getPoolPrices,
  getPoolBgt,
  getMerklCampaignApr,
}
