// Competitor (Uniswap V3) data for the pool list — Arbitrum only.
// Uniswap's interface gateway (interface.gateway.uniswap.org) origin-allowlists:
// it 409s ACCESS_DENIED for brownfi.io origins (and no-origin), only allowing
// app.uniswap.org + localhost. So we go through a same-origin proxy that sets
// `Origin: https://app.uniswap.org` server-side: `/uniswap/*` → the gateway via
// functions/uniswap (CF Pages, beta/bera), api/uniswap (Vercel, dev), and
// vite.config server.proxy (local dev).
import { CompetitorPairData, competitorPairKey } from './competitors'

// Same-origin proxy prefix (see functions/uniswap, vercel.json, vite.config).
const UNISWAP_PROXY_BASE = import.meta.env.VITE_UNISWAP_PROXY_BASE || '/uniswap'
const UNISWAP_GRAPHQL_PATH = '/v1/graphql'

// The explore-pools query app.uniswap.org uses. `feeTier` comes back in
// hundredths of a bip (500 = 0.05%) — already the unit CompetitorPairData wants.
// The gateway exposes no per-pool fees field, so we derive 24h fees as
// volume × feeTier / 1e6 (standard V3 fee math).
const TOP_V3_POOLS_QUERY = `query TopV3Pools($chain: Chain!, $first: Int!) {
  topV3Pools(first: $first, chain: $chain) {
    address
    feeTier
    totalLiquidity { value }
    volume24h: cumulativeVolume(duration: DAY) { value }
    token0 { address }
    token1 { address }
  }
}`

interface UniswapPoolRaw {
  feeTier: number
  totalLiquidity?: { value: number } | null
  volume24h?: { value: number } | null
  token0?: { address: string } | null
  token1?: { address: string } | null
}

// Returns a pair-keyed map. topV3Pools comes back sorted by TVL desc, so the
// first pool seen for a pair (highest TVL) wins when several fee tiers share it.
export async function fetchUniswapPairMap(): Promise<Record<string, CompetitorPairData>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${UNISWAP_PROXY_BASE}${UNISWAP_GRAPHQL_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: TOP_V3_POOLS_QUERY, variables: { chain: 'ARBITRUM', first: 100 } }),
      signal: controller.signal,
    })
    if (!res.ok) return {}
    const json = (await res.json()) as { data?: { topV3Pools?: UniswapPoolRaw[] } }
    const pools = json.data?.topV3Pools ?? []
    const map: Record<string, CompetitorPairData> = {}
    for (const p of pools) {
      if (!p.token0?.address || !p.token1?.address) continue
      const key = competitorPairKey(p.token0.address, p.token1.address)
      if (map[key]) continue // first (highest-TVL) pool per pair wins
      const feeTier = Number(p.feeTier) || 0
      const vol24hUSD = Number(p.volume24h?.value) || 0
      map[key] = {
        feeTier,
        tvlUSD: Number(p.totalLiquidity?.value) || 0,
        vol24hUSD,
        fees24hUSD: (vol24hUSD * feeTier) / 1_000_000,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
