#!/usr/bin/env node
/**
 * Weekly report generator — fills the BrownFi weekly CSV from the same indexer
 * and competitor APIs the Pool List page uses. Run locally:
 *
 *   node scripts/weekly-report.mjs                 # beta API (default)
 *   node scripts/weekly-report.mjs --prod          # production API (api.brownfi.io)
 *   node scripts/weekly-report.mjs --out report.csv
 *
 * Data sources (all public, read-only — no CORS/auth from Node):
 *   - Our pools:  ${API}/indexer/v3?chainId=<id>   (GraphQL PairListV3)
 *   - Competitors: Kodiak subgraph / Project X REST / Etherex REST / Uniswap gateway
 *
 * Column semantics (per pair row) — LP-UniV2 / LP-BH match the pool-detail LP
 * chart's hover tooltip: signed % outperformance (e.g. "+3.45%"), latest point.
 *   LP-UniV2 = (lpPrice - uniV2Price) / uniV2Price * 100   ("LP vs. UniV2")
 *   LP-BH    = (lpPrice - bnhPrice)   / bnhPrice   * 100   ("LP vs. BH", buy & hold)
 *   TVL = 7-day-AVERAGE TVL; Vol / Fee = WEEKLY volume / fee totals (USD)
 *   Vol/TVL, Fee/TVL = DAILY-AVERAGE turnover = (weekly numerator / 7) / 7-day-avg TVL,
 *     header-tagged "(daily)". (So the ratio is 1/7 of Vol÷TVL of the weekly $ columns.)
 *   <Comp> Vol/TVL, <Comp> Fee/TVL = same formula on the competitor's real 7-day data,
 *     all "(daily)" and directly comparable per-day.
 *
 * Timeframe / sources: OUR side is real weekly (indexer volume7Day + weekly fee) and
 * 7-day-avg TVL from the indexer's daily pairDayDatas.tvl. Competitors use real 7-day:
 * Kodiak (subgraph poolDayData, incl. daily tvlUSD → 7-day-avg TVL), Project X (Goldsky
 * uniswap-v3-hyperevm subgraph poolDayData per pool — its own API is 24h-only), Etherex
 * (stats.last_7d_*; current TVL — no daily history), Uniswap (cumulativeVolume WEEK;
 * current TVL — no daily history).
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// CLI / config
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2)
const USE_PROD = argv.includes('--prod')
const outArg = (() => {
  const i = argv.indexOf('--out')
  return i >= 0 ? argv[i + 1] : undefined
})()

const API = process.env.BROWNFI_API || (USE_PROD ? 'https://api.brownfi.io' : 'https://beta-api.brownfi.io')

const __dirname = dirname(fileURLToPath(import.meta.url))
const stamp = new Date().toISOString().slice(0, 10)
const OUT = resolve(outArg || `${__dirname}/weekly-report-${stamp}.csv`)

// Chains + the exact pairs the weekly report tracks, keyed by pool (pair)
// address — the stable, unambiguous identifier the indexer returns as `pair.id`.
// V3 pool addresses are identical on beta and prod (same on-chain factory), so
// this list works against either API. Add a pair by dropping its address here.
const CHAINS = [
  {
    id: 80094,
    name: 'BeraChain',
    competitor: 'Kodiak',
    pairs: [
      { name: 'Bera-Honey', address: '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c' },
      { name: 'ETH-USDC', address: '0xc123bc9259d1a99add5a2c512498ac146dd2bade' },
      { name: 'ETH-BTC', address: '0x77ccfa7fdb7510e9ea1417c0737f856d87b5215d' },
      { name: 'Bera-USDC', address: '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26' },
      { name: 'Bera-ETH', address: '0xe96e91374ac86a544ff0f9dc4eb9be6c1e37807d' },
      { name: 'Dolo-Honey', address: '0x16b3a5e95db753fe5195244fa208301e38beae2a' },
    ],
  },
  {
    id: 999,
    name: 'HyperEVM',
    competitor: 'ProjX',
    pairs: [
      { name: 'Hype-USDT', address: '0x91ab7159210b8a79dadb486a0ad1e03ff786e151' },
      { name: 'Hype-BTC', address: '0x0ae102b0a525e5ac06bbda93de8d0cbcca62badf' },
      { name: 'Hype-USDC', address: '0x2f4814ae38173eb2eefa20d02e8d1ff03cc0a174' },
    ],
  },
  {
    id: 59144,
    name: 'Linea',
    competitor: 'Etherex',
    pairs: [
      { name: 'Linea-ETH', address: '0xc0f3047a4faf88fd6585c5b8ede6d25e7f671c54' },
      { name: 'ETH-USDT', address: '0x23dd44cc1af6390be85872c137009c9189c071be' },
      { name: 'ETH-USDC', address: '0x16d4714566f2f5d0efe9642fe11ef48f8c192100' },
    ],
  },
  {
    id: 42161,
    name: 'Arbitrum',
    competitor: 'Uniswap',
    pairs: [{ name: 'ETH-USDT', address: '0x06a32f34fae5068040b8dcd6af41055196f93892' }],
  },
]

// ---------------------------------------------------------------------------
// fetch helpers
// ---------------------------------------------------------------------------
async function fetchJson(url, init, timeoutMs = 15_000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

// Order-independent token-pair key — matches src/services/competitors.ts.
const pairKey = (a, b) => [a.toLowerCase(), b.toLowerCase()].sort().join('-')

// ---------------------------------------------------------------------------
// BrownFi pools (indexer) — mirrors utils/graphql.ts + Pool/index.tsx PairListV3
// ---------------------------------------------------------------------------
const PAIR_LIST_V3 = `query PairListV3 {
  pairs {
    id fee feeDay totalSupply tvl apr volumeDay volume7Day updatedAt
    uniV2Price lpPrice createdAt
    token0 { id symbol decimals }
    token1 { id symbol decimals }
  }
}`

async function fetchBrownfiPairs(chainId) {
  const json = await fetchJson(`${API}/indexer/v3?chainId=${chainId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName: 'PairListV3', query: PAIR_LIST_V3, variables: {} }),
  })
  const byAddr = {}
  for (const p of json?.data?.pairs ?? []) byAddr[p.id.toLowerCase()] = p
  return byAddr
}

// Per-pool daily series for OUR pool: latest LP-vs-BH % (the pool-detail LP chart's
// rightmost tooltip value — `bnhPrice` lives only here, not on the pair list) AND
// the 7-day-average TVL (from the daily `tvl` field) used as the ratio denominator.
// uniV2Price is deliberately omitted: prod's indexer doesn't expose it on
// pairDayDatas (only beta does); we already get it from the list query.
const PAIR_DAY_DATA = `query PairStats($pair: String) {
  pairDayDatas(first: 1000, where: {pair: $pair}, orderBy: dayStartUnix, orderDirection: asc) {
    dayStartUnix lpPrice bnhPrice tvl totalVolume totalFee
  }
}`

async function fetchPoolDaily(chainId, address) {
  try {
    const json = await fetchJson(`${API}/indexer/v3?chainId=${chainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName: 'PairStats', query: PAIR_DAY_DATA, variables: { pair: address.toLowerCase() } }),
    })
    const rows = json?.data?.pairDayDatas ?? []
    const last = rows[rows.length - 1]
    let lpVsBh = NaN
    if (last) {
      const lp = Number(last.lpPrice) || 0
      const bnh = Number(last.bnhPrice) || 0
      lpVsBh = bnh ? ((lp - bnh) / bnh) * 100 : NaN
    }
    // Vol/Fee/TVL all summed/averaged from the SAME last-7-complete-days daily
    // buckets used for Kodiak/Project X — one consistent window across sources.
    const { volUSD, feeUSD, tvl7dAvg, days } = window7d(rows, {
      ts: 'dayStartUnix',
      vol: 'totalVolume',
      fee: 'totalFee',
      tvl: 'tvl',
    })
    return { lpVsBh, tvl7dAvg, vol7d: volUSD, fee7d: feeUSD, days }
  } catch (e) {
    console.warn(`  ! pool daily fetch failed for ${address}: ${e.message}`)
    return { lpVsBh: NaN, tvl7dAvg: NaN, vol7d: NaN, fee7d: NaN, days: 0 }
  }
}

// ---------------------------------------------------------------------------
// Competitor fetchers. Each returns a map: pairKey -> { tvlUSD, volUSD, feeUSD }
// where vol/fee are over the competitor's own window (COMPETITOR_WINDOW below):
// real trailing-7-day for Kodiak/Etherex/Uniswap; 24h for Project X, whose API
// exposes no 7-day data at all (verified: apr === fee24h*365/tvl, no 7d field/
// endpoint/param). The window is surfaced in the column header so nothing is
// silently mixed.
// ---------------------------------------------------------------------------
const COMPETITOR_WINDOW = { Kodiak: '7d', Etherex: '7d', Uniswap: '7d', ProjX: '7d' }

// Sum/average a Uniswap-V3-style daily series over the last 7 COMPLETE days
// (exclude today's partial bucket). Returns 7-day volume, 7-day fees, and the
// 7-day-AVERAGE TVL — the denominator the ratios divide by. Reused by every
// source whose daily data carries TVL (our indexer, Kodiak, Project X).
function window7d(rows, { ts, vol = 'volumeUSD', fee = 'feesUSD', tvl = 'tvlUSD' }) {
  const now = Date.now() / 1000
  const todayStart = Math.floor(now / 86400) * 86400
  const weekStart = todayStart - 7 * 86400
  let volUSD = 0
  let feeUSD = 0
  let tvlSum = 0
  let days = 0
  for (const r of rows ?? []) {
    const d = Number(r[ts])
    if (d < weekStart || d >= todayStart) continue
    volUSD += Number(r[vol]) || 0
    feeUSD += Number(r[fee]) || 0
    tvlSum += Number(r[tvl]) || 0
    days++
  }
  return { volUSD, feeUSD, tvl7dAvg: days ? tvlSum / days : NaN, days }
}

// Project X (Uniswap-V3 fork on HyperEVM) — its own REST API is 24h-only, but this
// Goldsky subgraph carries full daily poolDayData (volume, fees, TVL). The all-pools
// query times out (large index), so we fetch per pool by address (fast). Returns the
// 7-day window incl. 7-day-average TVL. Blanks (NaN) on failure, never a false 0.
const PROJX_SUBGRAPH =
  'https://api.goldsky.com/api/public/project_cmbbm2iwckb1b01t39xed236t/subgraphs/uniswap-v3-hyperevm-position/prod/gn'
async function projxPoolDaily(poolAddress) {
  const query = `{ pool(id:"${poolAddress.toLowerCase()}"){ poolDayData(first:8, orderBy:date, orderDirection:desc){ date tvlUSD volumeUSD feesUSD } } }`
  const json = await fetchJson(PROJX_SUBGRAPH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return window7d(json?.data?.pool?.poolDayData, { ts: 'date' })
}
async function fetchKodiak() {
  const url =
    'https://api.subgraph.ormilabs.com/api/public/d7eed6cc-ad4a-4862-8017-89893c4095d3/subgraphs/kodiak-v3/latest/gn'
  // 8 daily buckets so we always have the last 7 COMPLETE days plus today's
  // partial (which window7d excludes). Matches kodiak.finance's 7-day volume.
  // tvlUSD is on poolDayData → gives the 7-day-average TVL denominator.
  const query = `{ pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc, where: { totalValueLockedUSD_gt: 0 }) {
    feeTier totalValueLockedUSD token0 { id } token1 { id }
    poolDayData(first: 8, orderBy: date, orderDirection: desc) { date tvlUSD volumeUSD feesUSD } } }`
  const json = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const map = {}
  for (const p of json?.data?.pools ?? []) {
    const key = pairKey(p.token0.id, p.token1.id)
    if (map[key]) continue // first (highest-TVL) pool per pair wins
    const w = window7d(p.poolDayData, { ts: 'date' })
    const curTvl = Number(p.totalValueLockedUSD) || 0
    map[key] = { tvlUSD: curTvl, tvl7dAvg: Number.isFinite(w.tvl7dAvg) ? w.tvl7dAvg : curTvl, volUSD: w.volUSD, feeUSD: w.feeUSD }
  }
  return map
}

async function fetchProjectX() {
  // Project X's own REST API is 24h-only, so we use it just for the pool ADDRESS +
  // current TVL per pair; the real 7-day window (volume, fees, 7-day-avg TVL) is
  // filled from the Goldsky subgraph in main() (per used pair — the all-pools
  // subgraph query times out). vol/fee/tvl7dAvg start NaN → blank if the subgraph
  // is unavailable, never a silent 0.
  const json = await fetchJson('https://api.prjx.com/pools?sortBy=tvlUSD&order=desc&limit=100&offset=0&version=V3')
  const map = {}
  for (const p of json?.pools ?? []) {
    if (!p.token0?.address || !p.token1?.address) continue
    const key = pairKey(p.token0.address, p.token1.address)
    if (map[key]) continue
    map[key] = {
      tvlUSD: Number(p.tvlUSD) || 0,
      poolAddress: p.id,
      volUSD: NaN,
      feeUSD: NaN,
      tvl7dAvg: NaN,
    }
  }
  return map
}

async function fetchEtherex() {
  // Etherex's Envio index (behind a subgraph-syntax "converter" that auto-scopes
  // to Linea/59144). Entity is `clPools` (concentrated-liquidity); daily buckets
  // are `poolDayData` keyed by `startOfDay` (unix s). Gives real 7-day volume/fees
  // AND daily TVL → same last-7-complete-days + 7-day-avg-TVL basis as the rest.
  const query = `{ clPools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
    feeTier totalValueLockedUSD token0 { id } token1 { id }
    poolDayData(first: 10, orderBy: date, orderDirection: desc) { startOfDay tvlUSD volumeUSD feesUSD } } }`
  const json = await fetchJson('https://gateway.kingdom.dev/linea/converter/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const map = {}
  for (const p of json?.data?.clPools ?? []) {
    if (!p.token0?.id || !p.token1?.id) continue
    const key = pairKey(p.token0.id, p.token1.id)
    if (map[key]) continue // first (highest-TVL) pool per pair wins
    const w = window7d(p.poolDayData, { ts: 'startOfDay' })
    const curTvl = Number(p.totalValueLockedUSD) || 0
    map[key] = { tvlUSD: curTvl, tvl7dAvg: Number.isFinite(w.tvl7dAvg) ? w.tvl7dAvg : curTvl, volUSD: w.volUSD, feeUSD: w.feeUSD }
  }
  return map
}

// Uniswap V3 Arbitrum. Preferred: The Graph decentralized subgraph (real daily
// poolDayData → 7-day vol/fees + 7-day-avg TVL, fully consistent with the rest) —
// but it needs a free Graph API key (set GRAPH_API_KEY). Without a key we fall back
// to Uniswap's own interface gateway: real trailing-7-day volume (cumulativeVolume
// WEEK) but only CURRENT TVL and a derived fee (gateway has no daily TVL / fee).
const GRAPH_API_KEY = process.env.GRAPH_API_KEY || ''
const UNISWAP_ARB_SUBGRAPH_ID = '3V7ZY6muhxaQL5qvntX1CFXJ32W7BxXZTGTwmpH5J4t3'

async function fetchUniswapSubgraph() {
  const url = `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_ARB_SUBGRAPH_ID}`
  const query = `{ pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc, where: { totalValueLockedUSD_gt: 0 }) {
    feeTier totalValueLockedUSD token0 { id } token1 { id }
    poolDayData(first: 10, orderBy: date, orderDirection: desc) { date tvlUSD volumeUSD feesUSD } } }`
  const json = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (json?.errors) throw new Error(JSON.stringify(json.errors).slice(0, 200))
  const map = {}
  for (const p of json?.data?.pools ?? []) {
    if (!p.token0?.id || !p.token1?.id) continue
    const key = pairKey(p.token0.id, p.token1.id)
    if (map[key]) continue // first (highest-TVL) pool per pair wins
    // PoolDayData.date is day-aligned unix seconds; normalize if a build ever
    // stores the day-index (÷86400) form instead, so the window filter is robust.
    const rows = (p.poolDayData ?? []).map((r) => ({ ...r, date: Number(r.date) < 1e7 ? Number(r.date) * 86400 : Number(r.date) }))
    const w = window7d(rows, { ts: 'date' })
    const curTvl = Number(p.totalValueLockedUSD) || 0
    map[key] = { tvlUSD: curTvl, tvl7dAvg: Number.isFinite(w.tvl7dAvg) ? w.tvl7dAvg : curTvl, volUSD: w.volUSD, feeUSD: w.feeUSD }
  }
  return map
}

async function fetchUniswapGateway() {
  // Gateway 409s unless Origin is app.uniswap.org — set it directly (no CORS in Node).
  const query = `query TopV3Pools($chain: Chain!, $first: Int!) {
    topV3Pools(first: $first, chain: $chain) {
      feeTier totalLiquidity { value } volWeek: cumulativeVolume(duration: WEEK) { value }
      token0 { address } token1 { address } } }`
  const json = await fetchJson('https://interface.gateway.uniswap.org/v1/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://app.uniswap.org' },
    body: JSON.stringify({ query, variables: { chain: 'ARBITRUM', first: 50 } }),
  })
  const map = {}
  for (const p of json?.data?.topV3Pools ?? []) {
    if (!p.token0?.address || !p.token1?.address) continue
    const key = pairKey(p.token0.address, p.token1.address)
    if (map[key]) continue
    const feeTier = Number(p.feeTier) || 0
    const vol = Number(p.volWeek?.value) || 0
    // No daily TVL history → denominator uses current TVL; fee derived from feeTier.
    const curTvl = Number(p.totalLiquidity?.value) || 0
    map[key] = { tvlUSD: curTvl, tvl7dAvg: curTvl, volUSD: vol, feeUSD: (vol * feeTier) / 1e6 }
  }
  return map
}

async function fetchUniswap() {
  if (GRAPH_API_KEY) {
    try {
      return await fetchUniswapSubgraph()
    } catch (e) {
      console.warn(`  ! Uniswap subgraph failed (${e.message}); falling back to gateway`)
    }
  }
  return fetchUniswapGateway()
}

const COMPETITOR_FETCHERS = {
  Kodiak: fetchKodiak,
  ProjX: fetchProjectX,
  Etherex: fetchEtherex,
  Uniswap: fetchUniswap,
}

// ---------------------------------------------------------------------------
// metrics
// ---------------------------------------------------------------------------
// Weekly volume/fee for our pool + the current-TVL fallback. The ratio denominator
// (7-day-average TVL) is applied in main() from fetchPoolDaily; tvlCurrent is only
// used if that daily fetch fails.
function pairMetrics(p) {
  const tvlCurrent = Number(p.tvl) || 0
  const weeklyVol = Number(p.volume7Day) || 0
  const volDay = Number(p.volumeDay) || 0
  const feeDay = Number(p.feeDay) || 0
  const fee = Number(p.fee) || 0
  // Weekly fee: scale the indexer's 24h fee by the weekly/daily volume ratio so
  // it stays consistent with the effective rate the pool actually earned; fall
  // back to volume × nominal fee rate when there's no recent daily volume.
  const effRate = volDay > 0 ? feeDay / volDay : fee
  const weeklyFee = weeklyVol * effRate
  return {
    tvlCurrent,
    vol: weeklyVol,
    fee: weeklyFee,
    // "LP vs. UniV2" % — matches the LP chart tooltip. From the pair list's
    // current lpPrice/uniV2Price (prod-safe; pairDayDatas lacks uniV2Price on prod).
    lpVsUniV2: (() => {
      const lp = Number(p.lpPrice) || 0
      const uni = Number(p.uniV2Price) || 0
      return uni ? ((lp - uni) / uni) * 100 : NaN
    })(),
  }
}

// Competitor ratios, using 7-day-AVERAGE TVL as the denominator (falls back to
// current TVL for sources without daily TVL: Etherex, Uniswap). Number() WITHOUT
// `|| 0` so a missing (NaN) value blanks the cell rather than reading as a real 0.
function competitorMetrics(c) {
  if (!c) return { tvl: NaN, volTvl: NaN, feeTvl: NaN }
  const weeklyVol = Number(c.volUSD)
  const weeklyFee = Number(c.feeUSD)
  const tvl = Number.isFinite(Number(c.tvl7dAvg)) ? Number(c.tvl7dAvg) : Number(c.tvlUSD) || 0
  return {
    tvl,
    weeklyVol,
    weeklyFee,
    volTvl: tvl > 0 && Number.isFinite(weeklyVol) ? weeklyVol / tvl : NaN,
    feeTvl: tvl > 0 && Number.isFinite(weeklyFee) ? weeklyFee / tvl : NaN,
  }
}

// ---------------------------------------------------------------------------
// formatting / CSV
// ---------------------------------------------------------------------------
const fmtMoney = (n) => (Number.isFinite(n) ? n.toFixed(2) : '')
// Turnover ratios (Vol/TVL, Fee/TVL) as percentages, e.g. 3.3155 -> "331.55%".
const fmtRatio = (n) => (Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : '')
// Signed percent, matching the LP chart tooltip (e.g. "+3.45%", "-1.20%").
const fmtPct = (n) => (Number.isFinite(n) ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}%` : '')
const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const row = (cells) => cells.map(csvCell).join(',')

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const lines = []
  lines.push(row([`Weekly Report`, `Generated ${new Date().toISOString()} (UTC)`, `Source: ${API}`]))
  lines.push(row([`Vol/Fee = weekly totals (USD); TVL = 7-day average`, `ratios = daily-average turnover = (7-day vol / 7) / 7-day-avg TVL`]))
  lines.push('')

  for (const chain of CHAINS) {
    const compName = chain.competitor
    let brownfi = {}
    let competitor = {}
    try {
      ;[brownfi, competitor] = await Promise.all([
        fetchBrownfiPairs(chain.id),
        COMPETITOR_FETCHERS[compName]().catch((e) => {
          console.warn(`  ! ${compName} fetch failed: ${e.message}`)
          return {}
        }),
      ])
    } catch (e) {
      console.warn(`  ! ${chain.name} indexer fetch failed: ${e.message}`)
    }

    // Project X: fill the real 7-day window (volume, fees, 7-day-avg TVL) from the
    // Goldsky subgraph for the pairs we use (its own API is 24h-only; the all-pools
    // subgraph query times out). Per used pool, sequential. On failure the pair's
    // competitor cells blank (never a false 0).
    if (compName === 'ProjX') {
      for (const target of chain.pairs) {
        const p = brownfi[target.address.toLowerCase()]
        if (!p) continue
        const c = competitor[pairKey(p.token0.id, p.token1.id)]
        if (!c?.poolAddress) continue
        try {
          const w = await projxPoolDaily(c.poolAddress)
          c.volUSD = w.volUSD
          c.feeUSD = w.feeUSD
          c.tvl7dAvg = Number.isFinite(w.tvl7dAvg) ? w.tvl7dAvg : c.tvlUSD
        } catch (e) {
          console.warn(`  ! ${target.name}: Project X subgraph 7d fetch failed: ${e.message}`)
        }
      }
    }

    // Ratios are DAILY-AVERAGE turnover: (real 7-day numerator / 7) / 7-day-avg TVL.
    // Every source uses a real 7-day window, so the ÷7 puts them all on one per-day
    // basis. Ratio headers are tagged "(daily)" so they aren't read as Vol÷TVL of the
    // Vol/Fee dollar columns (which stay weekly totals, hence 7× the daily ratio).
    const OURS_DAYS = 7
    const compDays = 7
    const oursTag = ' (daily)'
    const compTag = ' (daily)'
    const header = [
      'Pairs (>$1k)',
      'LP-UniV2',
      'LP-BH',
      'TVL (7d avg)',
      'Vol',
      'Fee',
      `Vol/TVL${oursTag}`,
      `Fee/TVL${oursTag}`,
      `${compName} Vol/TVL${compTag}`,
      `${compName} Fee/TVL${compTag}`,
    ]

    const dataRows = []
    let sumTvl = 0
    let sumVol = 0
    let sumFee = 0
    let compSumTvl = 0
    let compSumVol = 0
    let compSumFee = 0

    for (const target of chain.pairs) {
      const p = brownfi[target.address.toLowerCase()]
      if (!p) {
        console.warn(`  ! ${chain.name} ${target.name}: pool ${target.address} not in indexer response`)
        dataRows.push(row([target.name, '', '', '', '', '', '', '', '', '']))
        continue
      }
      const m = pairMetrics(p)
      const daily = await fetchPoolDaily(chain.id, target.address)
      // Prefer the last-7-complete-days daily sums (same window/method as the
      // competitors); fall back to the list-query weekly field / derived fee /
      // current TVL only when the daily series is unavailable.
      const hasDaily = daily.days > 0
      const vol = hasDaily ? daily.vol7d : m.vol
      const fee = hasDaily ? daily.fee7d : m.fee
      const tvl = Number.isFinite(daily.tvl7dAvg) ? daily.tvl7dAvg : m.tvlCurrent
      const volTvl = tvl > 0 ? vol / tvl : NaN
      const feeTvl = tvl > 0 ? fee / tvl : NaN
      const comp = competitor[pairKey(p.token0.id, p.token1.id)]
      const cm = competitorMetrics(comp)

      sumTvl += tvl
      sumVol += vol
      sumFee += fee
      // Only fold a competitor pair into the chain total when its numbers are
      // present (Number.isFinite) so one blank pair doesn't NaN the whole TOTAL.
      if (comp && Number.isFinite(cm.weeklyVol) && Number.isFinite(cm.weeklyFee)) {
        compSumTvl += cm.tvl
        compSumVol += cm.weeklyVol
        compSumFee += cm.weeklyFee
      }

      dataRows.push(
        row([
          target.name,
          fmtPct(m.lpVsUniV2),
          fmtPct(daily.lpVsBh),
          fmtMoney(tvl),
          fmtMoney(vol),
          fmtMoney(fee),
          fmtRatio(volTvl / OURS_DAYS),
          fmtRatio(feeTvl / OURS_DAYS),
          fmtRatio(cm.volTvl / compDays),
          fmtRatio(cm.feeTvl / compDays),
        ]),
      )
    }

    // Chain summary (totals). Ratios are TVL-weighted aggregate, daily-average:
    // sum(weekly numerator) / days-in-window / sum(TVL).
    lines.push(row([`${chain.name} Summary`]))
    lines.push(header)
    lines.push(
      row([
        'TOTAL',
        '',
        '',
        fmtMoney(sumTvl),
        fmtMoney(sumVol),
        fmtMoney(sumFee),
        fmtRatio(sumTvl > 0 ? sumVol / sumTvl / OURS_DAYS : NaN),
        fmtRatio(sumTvl > 0 ? sumFee / sumTvl / OURS_DAYS : NaN),
        fmtRatio(compSumTvl > 0 ? compSumVol / compSumTvl / compDays : NaN),
        fmtRatio(compSumTvl > 0 ? compSumFee / compSumTvl / compDays : NaN),
      ]),
    )
    lines.push(...dataRows)
    lines.push('')
    console.log(`  ${chain.name}: ${chain.pairs.length} pairs, TVL $${sumTvl.toFixed(0)}, weekly Vol $${sumVol.toFixed(0)}`)
  }

  writeFileSync(OUT, lines.join('\n'), 'utf8')
  console.log(`\nWrote ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
