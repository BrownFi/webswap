// Competitor (Uniswap V3) data for the pool list — Arbitrum only.
// Uniswap's interface gateway (interface.gateway.uniswap.org) origin-allowlists:
// it 409s ACCESS_DENIED for brownfi.io origins (and no-origin), only allowing
// app.uniswap.org + localhost. So we go through a same-origin proxy that sets
// `Origin: https://app.uniswap.org` server-side: `/uniswap/*` → the gateway via
// functions/uniswap (CF Pages, beta/bera), api/uniswap (Vercel, dev), and
// vite.config server.proxy (local dev).
import { CompetitorPairData, CompetitorReference, competitorPairKey } from './competitors'

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

// The gateway resolves V4 pools by poolId, not by the BrownFi adapter address.
const ROBINHOOD_UNISWAP_V4_POOL_IDS = [
  '0x3bb34a44f1b2b5f32c034c38a53065a521a47b199700fa9bd19d60985ff24bf1',
  '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907',
  '0x2bca43d9d8c75399e3c6ba14e9dc88f44ca8968bb4694a8be4f80bd5a550df2e',
]

// Robinhood competitor = SPECIFIC Uniswap V3 pools (chosen by the team), fetched
// BY ADDRESS — not the top-pools list. The gateway's topV3Pools doesn't index
// Robinhood, but v3Pool(chain, address) resolves a single pool with feeTier + TVL +
// 24h volume. Each maps to its token pair so the matching BrownFi pool picks it up.
//   0xd4EB21…A3 → USDG/NVDA  (0.05%)
//   0x52e65B…Ca → WETH/USDG  (0.01%)
//   0xc61284…29 → SPCX/USDG  (0.05%)
//   0xDDCBBa…5e → WETH/SPY  (0.05%)
//   0xA43b42…D9 → SPY/USDG (0.30%)
const ROBINHOOD_UNISWAP_POOLS = [
  '0xd4EB21209C4D6093f80B5b84f5C45cc093EA14a3',
  '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca',
  '0xc61284332117c3FB23A2A56cceFFD07F7aF60029',
  '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e',
  '0xA43b424Bc609495AED4BCD88d654934b510B0aD9',
]
const V3_POOL_BY_ADDRESS_QUERY = `query V3Pool($chain: Chain!, $address: String!) {
  v3Pool(chain: $chain, address: $address) {
    feeTier
    totalLiquidity { value }
    volume24h: cumulativeVolume(duration: DAY) { value }
    token0 { address }
    token1 { address }
  }
}`

const V4_POOL_BY_ID_QUERY = `query V4Pool($chain: Chain!, $poolId: String!) {
  v4Pool(chain: $chain, poolId: $poolId) {
    feeTier
    totalLiquidity { value }
    volume24h: cumulativeVolume(duration: DAY) { value }
    token0 { address }
    token1 { address }
  }
}`

async function fetchUniswapPool<T>(query: string, variables: Record<string, string>): Promise<T | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${UNISWAP_PROXY_BASE}${UNISWAP_GRAPHQL_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    return ((await res.json()) as { data?: T }).data ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchUniswapRobinhoodPairMap(): Promise<Record<string, CompetitorPairData>> {
  const map: Record<string, CompetitorPairData> = {}
  await Promise.all(
    ROBINHOOD_UNISWAP_POOLS.map(async (address) => {
      const data = await fetchUniswapPool<{ v3Pool?: UniswapPoolRaw | null }>(V3_POOL_BY_ADDRESS_QUERY, { chain: 'ROBINHOOD', address })
      const p = data?.v3Pool
      if (!p?.token0?.address || !p?.token1?.address) return
      const feeTier = Number(p.feeTier) || 0
      const vol24hUSD = Number(p.volume24h?.value) || 0
      const reference: CompetitorReference = { version: 'V3', feeTier, tvlUSD: Number(p.totalLiquidity?.value) || 0, vol24hUSD, fees24hUSD: (vol24hUSD * feeTier) / 1_000_000 }
      const key = competitorPairKey(p.token0.address, p.token1.address)
      const existing = map[key]
      map[key] = existing ? { ...existing, references: [...(existing.references ?? []), reference] } : { ...reference, references: [reference] }
    }),
  )
  await Promise.all(
    ROBINHOOD_UNISWAP_V4_POOL_IDS.map(async (poolId) => {
      const data = await fetchUniswapPool<{ v4Pool?: UniswapPoolRaw | null }>(V4_POOL_BY_ID_QUERY, { chain: 'ROBINHOOD', poolId })
      const p = data?.v4Pool
      if (!p?.token0?.address || !p?.token1?.address) return
      const feeTier = Number(p.feeTier) || 0
      const vol24hUSD = Number(p.volume24h?.value) || 0
      const reference: CompetitorReference = { version: 'V4', feeTier, tvlUSD: Number(p.totalLiquidity?.value) || 0, vol24hUSD, fees24hUSD: (vol24hUSD * feeTier) / 1_000_000 }
      const key = competitorPairKey(p.token0.address, p.token1.address)
      const existing = map[key]
      map[key] = existing ? { ...existing, references: [...(existing.references ?? []), reference] } : { ...reference, references: [reference] }
    }),
  )
  Object.values(map).forEach((data) => data.references?.sort((a, b) => a.version.localeCompare(b.version)))
  return map
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
      body: JSON.stringify({ query: TOP_V3_POOLS_QUERY, variables: { chain: 'ARBITRUM', first: 50 } }),
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
