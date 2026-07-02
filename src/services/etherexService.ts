// Competitor (Etherex / etherex.finance) data for the pool list — Linea only.
// Uses Etherex's own REST API — the same one their frontend calls: a single GET
// returns every pair with a PRE-COMPUTED `stats.last_24h_vol` / `last_24h_fees`,
// so our 24h volume matches etherex.finance to the dollar (no daily interpolation).
// (We first tried their GraphQL "converter" gateway, but it only allows equality
// filters — no range/limit — so an exact rolling-24h there needed ~24 queries.
// This REST endpoint gives the same number Etherex shows, in one call.)
// CORS: the gateway reflects the request Origin, so the browser calls it directly.
import { CompetitorPairData, competitorPairKey } from './competitors'

const ETHEREX_PAIRS_URL =
  import.meta.env.VITE_ETHEREX_PAIRS_URL ||
  'https://gateway.kingdom.dev/linea/api/mixed-pairs?includeTokens=False'

interface EtherexPair {
  id: string
  symbol?: string
  // With includeTokens=False these are plain lowercase addresses.
  token0?: string
  token1?: string
  // Fee in hundredths of a bip (1100 = 0.11%) — same unit CompetitorPairData wants.
  fee?: number | string
  totalValueLockedUSD?: number | string
  // Etherex's own rolling-window aggregates (what etherex.finance displays).
  stats?: { last_24h_vol?: number; last_24h_fees?: number } | null
}

// Returns a pair-keyed map. When several pools share a pair (fee tiers), the
// highest-TVL one wins. Concentrated-liquidity ("CL-") pools only — the
// V3-equivalent, matching the other competitors (Kodiak / Uniswap V3).
export async function fetchEtherexPairMap(): Promise<Record<string, CompetitorPairData>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(ETHEREX_PAIRS_URL, { signal: controller.signal })
    if (!res.ok) return {}
    const json = (await res.json()) as { pairs?: EtherexPair[] }
    const pairs = (json.pairs ?? []).filter((p) => typeof p.symbol === 'string' && p.symbol.startsWith('CL-'))
    pairs.sort((a, b) => (Number(b.totalValueLockedUSD) || 0) - (Number(a.totalValueLockedUSD) || 0))
    const map: Record<string, CompetitorPairData> = {}
    for (const p of pairs) {
      if (!p.token0 || !p.token1) continue
      const key = competitorPairKey(p.token0, p.token1)
      if (map[key]) continue // first (highest-TVL) pool per pair wins
      map[key] = {
        feeTier: Number(p.fee) || 0,
        tvlUSD: Number(p.totalValueLockedUSD) || 0,
        vol24hUSD: Number(p.stats?.last_24h_vol) || 0,
        fees24hUSD: Number(p.stats?.last_24h_fees) || 0,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
