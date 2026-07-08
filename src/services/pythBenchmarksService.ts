// Historical market prices from Pyth Benchmarks — the SAME oracle our protocol
// reads on-chain (via priceFeedIds on the V3 factory). Used to backfill the
// no-trade GAPS on the pool price chart with a dashed "true market" line: our
// pool only records a price when someone trades, but the underlying crypto price
// keeps moving, so a flat carried line would misrepresent the market. Pyth gives
// us that between-trade movement.
//
// Two steps:
//   1. resolve our on-chain Pyth feed IDs (bytes32, from the indexer) to
//      Benchmarks symbols (e.g. Crypto.BTC/USD) — via the Hermes feed catalog;
//   2. pull historical close prices per feed at the chart's bucket resolution
//      (TradingView UDF shim — one request per feed covers the whole window).

// Chart bucket size (seconds) → Benchmarks/TradingView resolution string.
// Matches RANGE_BUCKETS in chartTimeBuckets.ts (5m / 1h / 4h / 1d; 15m kept for
// safety though the 1D view now buckets at 5m).
const RESOLUTION_BY_BUCKET: Record<number, string> = {
  300: '5',
  900: '15',
  3600: '60',
  14400: '240',
  86400: 'D',
}
export const resolutionForBucket = (bucketSec: number): string => RESOLUTION_BY_BUCKET[bucketSec] ?? '60'

const HERMES_FEEDS_URL = 'https://hermes.pyth.network/v2/price_feeds?asset_type=crypto'
const BENCHMARKS_HISTORY_URL = 'https://benchmarks.pyth.network/v1/shims/tradingview/history'

// feed id (no 0x, lowercase) → Benchmarks symbol. The full crypto catalog is
// ~585 feeds / ~185 KB and changes rarely, so fetch it ONCE per session and
// cache the promise. On failure the promise is cleared so a later call retries
// instead of being stuck with an empty map.
let symbolMapPromise: Promise<Map<string, string>> | null = null

function loadSymbolMap(): Promise<Map<string, string>> {
  if (!symbolMapPromise) {
    symbolMapPromise = (async () => {
      const res = await fetch(HERMES_FEEDS_URL)
      if (!res.ok) throw new Error(`Hermes feeds HTTP ${res.status}`)
      const arr = (await res.json()) as Array<{ id?: string; attributes?: { symbol?: string } }>
      const map = new Map<string, string>()
      for (const f of arr) {
        if (f?.id && f?.attributes?.symbol) map.set(String(f.id).toLowerCase(), f.attributes.symbol)
      }
      if (map.size === 0) throw new Error('Hermes feeds returned empty catalog')
      return map
    })().catch(() => {
      symbolMapPromise = null // allow a retry on the next call
      return new Map<string, string>()
    })
  }
  return symbolMapPromise
}

const normalizeFeedId = (feedId: string | null | undefined): string | null => {
  if (!feedId) return null
  const id = feedId.replace(/^0x/, '').toLowerCase()
  return !id || /^0+$/.test(id) ? null : id
}

// Resolve a bytes32 Pyth feed id to its Benchmarks symbol (e.g. Crypto.BTC/USD).
// null when the token has no registered feed or it isn't in the crypto catalog.
export async function resolveSymbol(feedId: string | null | undefined): Promise<string | null> {
  const id = normalizeFeedId(feedId)
  if (!id) return null
  const map = await loadSymbolMap()
  return map.get(id) ?? null
}

export type MarketBar = { time: number; close: number }

// Historical close prices for one symbol at `resolution` over [from, to] (unix
// seconds). Bars are aligned to the resolution grid (15m/1h/4h/1d = the same
// bucket boundaries the chart uses), so callers can key them by bucket directly.
// Returns [] on any failure (feed unavailable, network, non-ok status).
export async function fetchMarketHistory(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
): Promise<MarketBar[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12_000)
  try {
    const url = new URL(BENCHMARKS_HISTORY_URL)
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('resolution', resolution)
    url.searchParams.set('from', String(from))
    url.searchParams.set('to', String(to))
    const res = await fetch(url.toString(), { signal: controller.signal })
    if (!res.ok) return []
    const d = (await res.json()) as { s?: string; t?: number[]; c?: number[] }
    if (d?.s !== 'ok' || !Array.isArray(d.t) || !Array.isArray(d.c)) return []
    const out: MarketBar[] = []
    for (let i = 0; i < d.t.length; i++) {
      const close = Number(d.c[i])
      if (Number.isFinite(close) && close > 0) out.push({ time: d.t[i], close })
    }
    return out
  } catch {
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}

// Combined: given the BASE and QUOTE feed ids, return the market relative price
// (base priced in quote = baseClose / quoteClose) per bucket over [from, to].
// Continuous across the window (Pyth publishes every period), so it fills the
// pool's no-trade gaps. [] when either feed can't be resolved or fetched.
export async function fetchMarketRelativePrice(
  baseFeedId: string | null | undefined,
  quoteFeedId: string | null | undefined,
  bucketSec: number,
  from: number,
  to: number,
): Promise<{ time: number; value: number }[]> {
  const [baseSymbol, quoteSymbol] = await Promise.all([resolveSymbol(baseFeedId), resolveSymbol(quoteFeedId)])
  if (!baseSymbol || !quoteSymbol) return []
  const resolution = resolutionForBucket(bucketSec)
  const [baseBars, quoteBars] = await Promise.all([
    fetchMarketHistory(baseSymbol, resolution, from, to),
    fetchMarketHistory(quoteSymbol, resolution, from, to),
  ])
  if (!baseBars.length || !quoteBars.length) return []
  // Key quote closes by bucket-aligned time so we can pair them with base bars.
  const quoteByBucket = new Map<number, number>()
  for (const b of quoteBars) quoteByBucket.set(Math.floor(b.time / bucketSec) * bucketSec, b.close)
  const out: { time: number; value: number }[] = []
  for (const b of baseBars) {
    const bucket = Math.floor(b.time / bucketSec) * bucketSec
    const q = quoteByBucket.get(bucket)
    if (q && q > 0) out.push({ time: bucket, value: b.close / q })
  }
  return out
}
