// Competitor (Kodiak V3) data for the pool list — Berachain only.
// We fetch Kodiak's public subgraph once, then match their pools to ours by
// token-pair address (order-independent) so the list can show Kodiak's Fee /
// TVL / 24h Volume next to ours for pairs that exist on both DEXes.
import { CompetitorPairData, competitorPairKey } from './competitors'

const KODIAK_SUBGRAPH_URL =
  import.meta.env.VITE_KODIAK_SUBGRAPH_URL ||
  'https://api.subgraph.ormilabs.com/api/public/d7eed6cc-ad4a-4862-8017-89893c4095d3/subgraphs/kodiak-v3/latest/gn'

interface KodiakPoolRaw {
  feeTier: string
  totalValueLockedUSD: string
  token0: { id: string }
  token1: { id: string }
  poolDayData: { volumeUSD: string; feesUSD: string }[]
}

const KODIAK_POOLS_QUERY = `{
  pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc, where: { totalValueLockedUSD_gt: 0 }) {
    feeTier
    totalValueLockedUSD
    token0 { id }
    token1 { id }
    poolDayData(first: 1, orderBy: date, orderDirection: desc) { volumeUSD feesUSD }
  }
}`

// Returns a map keyed by `kodiakPairKey`. When a pair has multiple Kodiak pools
// (different fee tiers), the highest-TVL pool wins — pools come back sorted by
// TVL desc, so the first one seen for a pair is the largest.
export async function fetchKodiakPairMap(): Promise<Record<string, CompetitorPairData>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(KODIAK_SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: KODIAK_POOLS_QUERY }),
      signal: controller.signal,
    })
    if (!res.ok) return {}
    const json = (await res.json()) as { data?: { pools?: KodiakPoolRaw[] } }
    const pools = json.data?.pools ?? []
    const map: Record<string, CompetitorPairData> = {}
    for (const p of pools) {
      const key = competitorPairKey(p.token0.id, p.token1.id)
      if (map[key]) continue // first (highest-TVL) pool per pair wins
      map[key] = {
        feeTier: Number(p.feeTier) || 0,
        tvlUSD: Number(p.totalValueLockedUSD) || 0,
        vol24hUSD: Number(p.poolDayData?.[0]?.volumeUSD) || 0,
        fees24hUSD: Number(p.poolDayData?.[0]?.feesUSD) || 0,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
