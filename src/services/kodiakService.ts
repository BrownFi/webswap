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
  poolDayData: { date: string; volumeUSD: string; feesUSD: string }[]
}

// first: 2 to reach today + yesterday's buckets — the trailing 24h spans both.
// (Kodiak's subgraph has no hourly data, so 24h is interpolated from daily.)
const KODIAK_POOLS_QUERY = `{
  pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc, where: { totalValueLockedUSD_gt: 0 }) {
    feeTier
    totalValueLockedUSD
    token0 { id }
    token1 { id }
    poolDayData(first: 2, orderBy: date, orderDirection: desc) { date volumeUSD feesUSD }
  }
}`

// Rolling 24h from Kodiak's DAILY buckets (their subgraph has no hourly data) —
// matches how kodiak.finance itself shows "Volume 24H": today's volume (partial)
// plus the portion of yesterday still inside the trailing-24h window. Any bucket
// older than yesterday is outside the window → contributes 0, which fixes the old
// bug where an inactive pool's latest (stale, days-old) bucket was shown as "24h".
function trailing24h(rows: { date: string; volumeUSD: string; feesUSD: string }[]): { vol: number; fees: number } {
  const now = Date.now() / 1000
  const todayStart = Math.floor(now / 86400) * 86400
  const yestStart = todayStart - 86400
  const yestFrac = (86400 - (now - todayStart)) / 86400 // share of yesterday still within the last 24h
  let vol = 0
  let fees = 0
  for (const r of rows) {
    const date = Number(r.date)
    const w = date === todayStart ? 1 : date === yestStart ? yestFrac : 0
    if (w === 0) continue
    vol += (Number(r.volumeUSD) || 0) * w
    fees += (Number(r.feesUSD) || 0) * w
  }
  return { vol, fees }
}

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
      const { vol, fees } = trailing24h(p.poolDayData ?? [])
      map[key] = {
        feeTier: Number(p.feeTier) || 0,
        tvlUSD: Number(p.totalValueLockedUSD) || 0,
        vol24hUSD: vol,
        fees24hUSD: fees,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
