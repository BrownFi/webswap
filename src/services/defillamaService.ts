const BASE_URL = 'https://api.llama.fi'
const PROTOCOL = 'brownfi'

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

async function getJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

// Protocol-wide stats are version-independent, but switching the version
// toggle does a full page reload (version is page-load-constant), which wipes
// React Query's in-memory cache and would re-fire these 3 DefiLlama calls on
// every switch. Persist the result in localStorage with a short TTL so a
// reload within the window reuses it instead of refetching.
const CACHE_KEY = 'brownfi:protocolStats'
const CACHE_TTL = 10 * 60_000 // 10 min — matches the useQuery staleTime

function readProtocolStatsCache(): ProtocolStats | null {
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

function writeProtocolStatsCache(data: ProtocolStats): void {
  // Don't persist an all-zero result (a failed/empty fetch) — let it retry.
  if (!(data.currentTvl || data.volumeAllTime || data.feesAllTime)) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    /* quota / private mode — fine, just skip caching */
  }
}

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const cached = readProtocolStatsCache()
  if (cached) return cached

  const [protocolData, volumeData, feesData] = await Promise.all([
    getJson<{
      chainTvls?: Record<string, { tvl?: TvlPoint[] }>
    }>(`${BASE_URL}/protocol/${PROTOCOL}`),
    getJson<{ total24h?: number; totalAllTime?: number }>(
      `${BASE_URL}/summary/dexs/${PROTOCOL}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
    ),
    getJson<{ total24h?: number; totalAllTime?: number }>(
      `${BASE_URL}/summary/fees/${PROTOCOL}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
    ),
  ])

  const chainTvls = protocolData?.chainTvls ?? {}
  const dailyTotals = new Map<number, number>()
  const chains: { name: string; tvl: number }[] = []

  for (const [name, entry] of Object.entries(chainTvls)) {
    if (name.includes('-')) continue
    const series = entry.tvl ?? []
    if (series.length === 0) continue
    const last = Number(series[series.length - 1]?.totalLiquidityUSD) || 0
    chains.push({ name, tvl: last })
    for (const point of series) {
      const v = Number(point.totalLiquidityUSD) || 0
      dailyTotals.set(point.date, (dailyTotals.get(point.date) ?? 0) + v)
    }
  }

  const tvlHistory: TvlPoint[] = Array.from(dailyTotals.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([date, totalLiquidityUSD]) => ({ date, totalLiquidityUSD }))

  const currentTvl = tvlHistory.length ? tvlHistory[tvlHistory.length - 1].totalLiquidityUSD : 0
  const athTvl = tvlHistory.reduce((max, p) => Math.max(max, p.totalLiquidityUSD), 0)

  chains.sort((a, b) => b.tvl - a.tvl)

  const result: ProtocolStats = {
    currentTvl,
    athTvl,
    volume24h: Number(volumeData?.total24h) || 0,
    volumeAllTime: Number(volumeData?.totalAllTime) || 0,
    fees24h: Number(feesData?.total24h) || 0,
    feesAllTime: Number(feesData?.totalAllTime) || 0,
    tvlHistory,
    chains,
  }
  writeProtocolStatsCache(result)
  return result
}
