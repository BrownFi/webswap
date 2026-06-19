// Competitor (Project X / prjx.com V3) data for the pool list — HyperEVM only.
// Project X's API blocks cross-origin browser calls (CORS allowlist), so we go
// through a same-origin proxy: `/prjx/*` is rewritten to `https://api.prjx.com/*`
// by vercel.json in prod and by vite.config server.proxy in dev.
import { CompetitorPairData, competitorPairKey } from './competitors'

// Same-origin proxy prefix (see vercel.json / vite.config). Overridable for
// environments that proxy elsewhere.
const PRJX_PROXY_BASE = import.meta.env.VITE_PRJX_PROXY_BASE || '/prjx'

// API caps `limit` at 100. Our HyperEVM pairs are all high-TVL, so the top 100
// by TVL covers them (validated 13/13). Bump to pagination if that changes.
const PRJX_POOLS_PATH = '/pools?sortBy=tvlUSD&order=desc&limit=100&offset=0&version=V3'

interface ProjectXPoolRaw {
  feeTier: string
  tvlUSD: string
  volume24h: string
  fee24h: string
  token0: { address: string }
  token1: { address: string }
}

// Returns a pair-keyed map. Pools come sorted by TVL desc, so the first pool
// seen for a pair (highest TVL) wins when several fee tiers share a pair.
export async function fetchProjectXPairMap(): Promise<Record<string, CompetitorPairData>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${PRJX_PROXY_BASE}${PRJX_POOLS_PATH}`, { signal: controller.signal })
    if (!res.ok) return {}
    const json = (await res.json()) as { pools?: ProjectXPoolRaw[] }
    const pools = json.pools ?? []
    const map: Record<string, CompetitorPairData> = {}
    for (const p of pools) {
      if (!p.token0?.address || !p.token1?.address) continue
      const key = competitorPairKey(p.token0.address, p.token1.address)
      if (map[key]) continue // first (highest-TVL) pool per pair wins
      map[key] = {
        feeTier: Number(p.feeTier) || 0,
        tvlUSD: Number(p.tvlUSD) || 0,
        vol24hUSD: Number(p.volume24h) || 0,
        fees24hUSD: Number(p.fee24h) || 0,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
