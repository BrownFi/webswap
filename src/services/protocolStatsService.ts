/**
 * Protocol-wide stats for the Pool page stats bar, computed from BrownFi's OWN
 * indexer instead of DefiLlama (third-party aggregator that never matched).
 *
 * Three sources are summed together:
 *   1. Live V3 indexer (`/indexer/v3?chainId=`) — one GraphQL query per chain
 *      that returns the chain-level aggregates (`factories`) AND every pair's
 *      rolling-24h volume/fees (`pairs`), combined in a single request.
 *      All-time values are pre-summed by the indexer; only the 24h rolling
 *      numbers are summed client-side over pairs.
 *   2. Hemi (CLMM product) — read from the hemi-analytics subgraph. Hemi hosts
 *      no BrownFi V3, so its factory aggregates come from that subgraph.
 *   3. V2 (sunset) — all-time volume/fees frozen as constants. V2 is dead, so
 *      these never change; hardcoding them avoids re-fetching a stopped
 *      indexer while keeping the historical all-time numbers in the cards.
 *
 * The indexer is sharded by chainId in the URL (verified: no GraphQL batch,
 * no chainId-as-variable support, `factories(id_in)` still resolves to the URL
 * chain), so multi-chain = fan-out + sum. Failures are tolerated per source —
 * a dead chain just contributes 0 to the totals instead of failing the query.
 */

import { ChainId } from '@brownfi/sdk'
import { VERSION } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'

// Hemi CLMM analytics subgraph. Kept inline (NOT imported from clmm/config,
// which only exists on branches with the CLMM sub-app) so this service compiles
// on every branch. Prod gateway needs VITE_GRAPH_API_KEY; without it we fall
// back to the public studio endpoint. Same URLs as clmm/config/graphql-urls.
const HEMI_SUBGRAPH_URL = import.meta.env.VITE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${import.meta.env.VITE_GRAPH_API_KEY}/subgraphs/id/D1UwhrB45geUZTNQ2QwrXwGEhk69iBESApJJzz378ZeS`
  : 'https://api.studio.thegraph.com/query/50593/hemi-analytics/version/latest'

export interface TvlPoint {
  date: number
  totalLiquidityUSD: number
}

export interface ProtocolStats {
  currentTvl: number
  athTvl: number
  volume24h: number
  volumeAllTime: number
  fees24h: number
  feesAllTime: number
  tvlHistory: TvlPoint[]
  chains: { name: string; tvl: number }[]
}

// Robinhood V3 is live on the prod indexer (chainId 4663) even though the chain
// config only exists on the beta branch — include it here so the stats cover it.
const ROBINHOOD_CHAIN_ID = 4663

// Chains served by the V3 indexer. Deliberately NOT derived from
// ROUTER_ADDRESS_V3_OFFICIAL (that map lacks Robinhood) — this is the list of
// chains the indexer actually answers for.
const V3_INDEXER_CHAINS: number[] = [
  ChainId.BERA_MAINNET,
  ChainId.ARBITRUM_MAINNET,
  ChainId.HYPER_EVM,
  ChainId.LINEA_MAINNET,
  ROBINHOOD_CHAIN_ID,
]

// Hemi (CLMM product) — no BrownFi V3 deployment on Hemi; its stats come from
// the hemi-analytics subgraph (HEMI_SUBGRAPH_URL above).

// V2 is sunset. These all-time figures are FROZEN snapshots of the legacy V2
// indexer (`factories.totalVolume` / `factories.totalFee`, summed over its 5
// chains — Bera, Arbitrum, Base, HyperEVM, Linea) captured 2026-08-06 when V2
// stopped. They're constant by definition, so they're hardcoded instead of
// re-querying a stopped indexer.
const V2_ALL_TIME_VOLUME = 243_568_078.57
const V2_ALL_TIME_FEES = 417_293.92

// Persist across full page reloads (which wipe React Query's in-memory cache).
// Key is versioned so old DefiLlama-sourced caches under the legacy key are
// ignored.
// Bump when the aggregate sources or chain coverage changes so an older
// snapshot cannot keep stale cross-chain totals visible for up to 10 minutes.
const CACHE_KEY = 'brownfi:protocolStats:indexer:v2'
const CACHE_TTL = 10 * 60_000 // 10 min — matches the useQuery staleTime

// One query per V3 chain: chain-level aggregates (all-time TVL/volume/fees,
// pre-summed by the indexer) + every pair's rolling-24h volume/fees (summed
// client-side below). No nested token objects → tiny response.
const CHAIN_STATS_QUERY = `
  query ChainStats {
    factories {
      tvl
      totalVolume
      totalFee
    }
    pairs(first: 1000) {
      volumeDay
      feeDay
    }
  }
`

// Hemi CLMM subgraph: factory aggregates (all-time) + latest day bucket for
// 24h. The subgraph has no rolling-24h factory field, so 24h here is the
// current UTC-day bucket (0:00 → now), consistent with the indexer's
// factoryDayData convention.
const HEMI_STATS_QUERY = `
  query HemiStats {
    factories {
      totalValueLockedUSD
      totalVolumeUSD
      totalFeesUSD
    }
    algebraDayDatas(orderBy: date, orderDirection: desc, first: 1) {
      volumeUSD
      feesUSD
    }
  }
`

interface ChainStats {
  tvl: number
  volumeAllTime: number
  feesAllTime: number
  volume24h: number
  fees24h: number
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

async function fetchChainStats(chainId: number): Promise<ChainStats> {
  const data = await graphqlFetcher({
    operationName: 'ChainStats',
    query: CHAIN_STATS_QUERY,
    variables: { chainId, version: VERSION.V3_OFFICIAL },
  })
  const factory = (data as any)?.factories?.[0]
  const pairs: any[] = (data as any)?.pairs ?? []
  return {
    tvl: num(factory?.tvl),
    volumeAllTime: num(factory?.totalVolume),
    feesAllTime: num(factory?.totalFee),
    volume24h: pairs.reduce((acc, p) => acc + num(p.volumeDay), 0),
    fees24h: pairs.reduce((acc, p) => acc + num(p.feeDay), 0),
  }
}

async function fetchHemiStats(): Promise<ChainStats | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12_000)
  try {
    const res = await fetch(HEMI_SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName: 'HemiStats', query: HEMI_STATS_QUERY, variables: {} }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const body = (await res.json()) as any
    const factory = body?.data?.factories?.[0]
    const latestDay = body?.data?.algebraDayDatas?.[0]
    return {
      tvl: num(factory?.totalValueLockedUSD),
      volumeAllTime: num(factory?.totalVolumeUSD),
      feesAllTime: num(factory?.totalFeesUSD),
      volume24h: num(latestDay?.volumeUSD),
      fees24h: num(latestDay?.feesUSD),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

function readCache(): ProtocolStats | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw) as { ts: number; data: ProtocolStats }
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: ProtocolStats): void {
  // Don't persist an empty fetch (every live source failed) — let it retry.
  if (data.currentTvl <= 0) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    /* quota / private mode — fine, just skip caching */
  }
}

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const cached = readCache()
  if (cached) return cached

  const results = await Promise.allSettled([...V3_INDEXER_CHAINS.map(fetchChainStats), fetchHemiStats()])

  // V2 all-time numbers seed the totals — they're always present even if every
  // live source is down.
  let tvl = 0
  let volume24h = 0
  let volumeAllTime = V2_ALL_TIME_VOLUME
  let fees24h = 0
  let feesAllTime = V2_ALL_TIME_FEES
  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value) continue
    tvl += r.value.tvl
    volume24h += r.value.volume24h
    volumeAllTime += r.value.volumeAllTime
    fees24h += r.value.fees24h
    feesAllTime += r.value.feesAllTime
  }

  const result: ProtocolStats = {
    currentTvl: tvl,
    athTvl: tvl,
    volume24h,
    volumeAllTime,
    fees24h,
    feesAllTime,
    tvlHistory: [],
    chains: [],
  }
  writeCache(result)
  return result
}
