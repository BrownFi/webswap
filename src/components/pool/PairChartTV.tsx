import { ChainId, Pair, isV3Like } from '@brownfi/sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { InfoTooltip } from 'components/pool/AnnualizedReturnInfo'
import { isMainnet, isV3Enabled } from 'connectors'
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  IRange,
  ISeriesApi,
  LineSeries,
  LineStyle,
  TickMarkType,
  Time,
  createChart,
} from 'lightweight-charts'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { graphqlFetcher } from 'utils/graphql'
import { formatPrice } from 'utils/prices'

// `uniV2Price` is indexed per chain. Verified on bf-v2-api-beta.brownfi.io
// on 2026-05-12: every chain currently on the indexer supports the field.
// Kept as an explicit allowlist so a future chain stays gated until verified
// (querying the field on an unsupported chain returns a GraphQL validation
// error and breaks the chart).
//
// Empty when pointing at the production API (`api.brownfi.io`) since it
// doesn't expose `uniV2Price` on PairDayData/PairHourData yet — only the
// beta API does. Requesting the field against prod returns a GraphQL
// validation error and breaks the chart. Capability follows the API URL,
// not the env name: a beta-branded deployment that talks to prod API also
// needs the field stripped.
const CHAINS_WITH_UNIV2_PRICE = !isV3Enabled
  ? new Set<number>()
  : new Set<number>([
      ChainId.BASE_MAINNET,
      ChainId.BERA_MAINNET,
      ChainId.BSC_MAINNET,
      ChainId.ARBITRUM_MAINNET,
      ChainId.LINEA_MAINNET,
      ChainId.SEI_MAINNET,
      ChainId.HYPER_EVM,
      ChainId.MONAD,
    ])
const hasUniV2Price = (chainId: number) => CHAINS_WITH_UNIV2_PRICE.has(chainId)
// `uniV2Price` only exists on the V3 indexer schema. Keep it only when the
// chain exposes it AND the pair is V3 — V2 pairs route to the V2 schema, which
// has no uniV2Price field (querying it is a GraphQL validation error).
const buildQuery = (template: string, keepUniV2: boolean) =>
  keepUniV2 ? template : template.replace(/\s*uniV2Price\s*/g, '\n')

const GET_PAIR_STATS = `
  query PairStats($pair: String) {
    pairDayDatas(
      first: 1000
      where: {pair: $pair}
      orderBy: dayStartUnix
      orderDirection: asc
    ) {
      dayStartUnix
      tvl
      totalVolume
      totalFee
      apr
      lpPrice
      bnhPrice
      uniV2Price
    }
  }
`

// 1H mode: last 24 hourly buckets for "intraday today" view. Same metrics as
// day data, just keyed by hourStartUnix.
const GET_PAIR_STATS_HOUR = `
  query PairStatsHour($pair: String) {
    pairHourDatas(
      first: 24
      where: {pair: $pair}
      orderBy: hourStartUnix
      orderDirection: desc
    ) {
      hourStartUnix
      tvl
      totalVolume
      totalFee
      apr
      lpPrice
      bnhPrice
      uniV2Price
    }
  }
`

// 1H paging: older hourly buckets before a cursor (`hourStartUnix_lt`, numeric/
// unquoted), 168 (~7 days) at a time. Same field selection as GET_PAIR_STATS_HOUR.
// Only the 1h mode pages — the daily ranges already cover everything at first:1000.
const GET_PAIR_STATS_HOUR_OLDER = `
  query PairStatsHourOlder($pair: String, $before: Int) {
    pairHourDatas(
      first: 168
      where: {pair: $pair, hourStartUnix_lt: $before}
      orderBy: hourStartUnix
      orderDirection: desc
    ) {
      hourStartUnix
      tvl
      totalVolume
      totalFee
      apr
      lpPrice
      bnhPrice
      uniV2Price
    }
  }
`

// PROTOTYPE (research/lp-candlestick): recent swaps for the DAILY stacked
// buy/sell volume. Client-side bucketed by day. `first: 1000` is a prototype
// limitation — pools with >1000 swaps show partial data for the oldest days.
const GET_PAIR_SWAPS = `
  query PairSwaps($pair: String) {
    transactions(first: 1000, where: { pair: $pair, type: "SWAP" }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      amount0In
      amount0Out
      reserve0
      reserve0USD
    }
  }
`

// Older page (cursor = oldest timestamp of the previous batch) so we can loop past
// the 1000/query cap and cover full history for the buy/sell volume split. Dropped
// once the indexer exposes buyVolume/sellVolume on pairDayData/pairHourData.
const GET_PAIR_SWAPS_OLDER = `
  query PairSwapsOlder($pair: String, $before: BigInt) {
    transactions(first: 1000, where: { pair: $pair, type: "SWAP", timestamp_lt: $before }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      amount0In
      amount0Out
      reserve0
      reserve0USD
    }
  }
`

// Safety cap on the pagination loop: 20 batches = up to 20k swaps. Busy/old pools
// beyond that keep only the most-recent 20k (logged) — still far past the old
// 1000-swap limit, and moot once the indexer returns aggregate buy/sell volume.
const MAX_SWAP_BATCHES = 20

type SwapTxn = {
  timestamp: number | string
  amount0In: number | string
  amount0Out: number | string
  reserve0: number | string
  reserve0USD: number | string
}

type DayData = {
  dayStartUnix: number
  tvl: number
  totalVolume: number
  totalFee: number
  apr: number
  lpPrice: number
  bnhPrice: number
  uniV2Price: number
}

type HourData = Omit<DayData, 'dayStartUnix'> & { hourStartUnix: number }

type SeriesKey = 'lpPrice' | 'bnhPrice' | 'uniV2Price' | 'lpVsUniV2' | 'tvl' | 'netPnL' | 'volume'

// GitBook explainer for the LP-vs-UniV2 benchmark (the per-token price-gap
// line). Mirrors the develop branch's chart.
const LEARN_MORE_URL = 'https://brownfi.gitbook.io/brownfi-docs/brownfi-v3/benchmark'
const BENCHMARK_HINT =
  "The UniV2 constant-product curve serves as the benchmark for measuring BrownFi pool performance. The LP line should sit above the UniV2 line, with the gap widening over time, reflecting BrownFi V3's lower IL and higher fee yield compared to UniV2."
const VOLUME_HINT =
  'Trading volume per bar (in USD). Green is buy volume (token0 bought), red is sell volume (token0 sold), stacked so the full bar is the total volume for that period.'

type SeriesMeta = {
  key: SeriesKey
  label: string
  color: string
  type: 'line' | 'area' | 'histogram'
  priceScaleId: string
  yAxis: 'left' | 'right' | 'hidden'
  /** When set, overrides the default LineSeries stroke (2px). Reference
   *  lines use 1px so the LP series visually dominates. */
  lineWidth?: 1 | 2 | 3 | 4
  /** When set, overrides the default solid line style. Reference lines
   *  use Dashed to read as benchmarks. */
  lineStyle?: LineStyle
}

// Original BrownFi palette. HODL + UniV2 reference benchmarks render
// 1px + dotted (LineStyle.Dotted) AND at ~60% opacity (alpha `99` ≈ 0.6)
// so they read as muted references vs LP Price's default 2px solid.
// UniV2 uses red to distinguish it from HODL's blue.
//
// Net PnL and Volume are both green but in clearly different shades:
// Net PnL = #83CF84 (light pastel green, line) and Volume = #16A34A
// (deep saturated green, histogram). The hue distance + render-type
// difference keeps them visually separable on the same chart.
const SERIES_ALL: SeriesMeta[] = [
  { key: 'lpPrice',       label: 'LP Price',       color: '#D8A072',   type: 'line',      priceScaleId: 'right',  yAxis: 'right' },
  { key: 'bnhPrice',      label: 'HODL Price',     color: '#9CA3AF99', type: 'line',      priceScaleId: 'right',  yAxis: 'right', lineWidth: 1, lineStyle: LineStyle.Dotted },
  { key: 'uniV2Price',    label: 'UniV2 Price',    color: '#E0484899', type: 'line',      priceScaleId: 'right',  yAxis: 'right', lineWidth: 1, lineStyle: LineStyle.Dotted },
  // "LP vs. UniV2" = LP's % outperformance over the UniV2 constant-product
  // benchmark: (lp − uni) / uni × 100. Shares the hidden 'pct' overlay scale
  // with "LP vs. BH" — both are percentages, so they auto-fit together and are
  // directly comparable; read exact values via the hover tooltip. Cyan — kept
  // distinct from TVL's purple (they read too similar otherwise) and the green
  // "LP vs. BH".
  { key: 'lpVsUniV2',     label: 'LP vs. UniV2',   color: '#22D3EE99', type: 'line',      priceScaleId: 'pct',    yAxis: 'hidden', lineWidth: 1, lineStyle: LineStyle.Dotted },
  // "LP vs. BH" = LP's % outperformance over Buy & Hold (HODL):
  // (lp − bnh) / bnh × 100. Same 'pct' overlay scale as LP vs. UniV2 — and kept
  // right next to it in the legend so the two % benchmarks read together.
  // Internal key stays `netPnL` to avoid a sweep across the indexer field name.
  { key: 'netPnL',        label: 'LP vs. BH',      color: '#83CF84',   type: 'line',      priceScaleId: 'pct',    yAxis: 'hidden' },
  { key: 'tvl',           label: 'TVL',            color: '#B47AAE',   type: 'line',      priceScaleId: 'left',   yAxis: 'left' },
  { key: 'volume',        label: 'Volume',         color: '#16A34A',   type: 'histogram', priceScaleId: 'volume', yAxis: 'hidden' }, // legend swatch = the candle's buy-green
]

// PROTOTYPE: daily stacked buy/sell volume colors (green buys on top, red sells
// on the bottom).
const COLOR_BUY = '#16A34A' // buy — the LP chart's original volume green
const COLOR_SELL = '#EF5350' // sell — same red as the Pool Balance volume chart

// Compact USD for the buy/sell tooltip rows (e.g. $1.2k, $340).
const fmtVolUsd = (v: number): string => {
  const abs = Math.abs(v)
  if (!Number.isFinite(abs) || abs === 0) return '$0'
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}k`
  if (abs >= 1) return `$${abs.toFixed(0)}`
  return `$${abs.toFixed(2)}`
}

type Props = {
  pair: Pair
}

const PairChartTVInner = ({ pair }: Props) => {
  const showExtendedMetrics = !isMainnet
  const supportsUniV2 = hasUniV2Price(pair.chainId)
  const isV3 = isV3Like(pair.version)
  // uniV2Price is a V3-indexer field — only request/show it for V3 pairs on a
  // chain that exposes it (else the V2 schema rejects the query). Same predicate
  // graphql.ts uses to route /indexer/v3 vs /indexer.
  const keepUniV2 = supportsUniV2 && isV3
  const availableSeries = useMemo(() => {
    if (!showExtendedMetrics) return SERIES_ALL.filter((s) => s.key === 'lpPrice' || s.key === 'volume')
    // Hide the UniV2 reference AND the "LP vs. UniV2" % line on V2 pairs / chains
    // without uniV2Price indexer data — the field is stripped from the query, so
    // the comparison would be misleading (lpPrice − 0) otherwise. "LP vs. BH"
    // stays (it uses bnhPrice, which is always available).
    return keepUniV2
      ? SERIES_ALL
      : SERIES_ALL.filter((s) => s.key !== 'uniV2Price' && s.key !== 'lpVsUniV2')
  }, [showExtendedMetrics, supportsUniV2, keepUniV2])

  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>(() => ({
    lpPrice: true,
    bnhPrice: showExtendedMetrics,
    uniV2Price: showExtendedMetrics,
    // LP vs. UniV2 (% outperformance) — gated on the chain exposing uniV2Price
    // via the availableSeries filter below.
    lpVsUniV2: showExtendedMetrics,
    tvl: showExtendedMetrics,
    netPnL: showExtendedMetrics,
    volume: true,
  }))

  // '1h' = today's intraday (24 hourly buckets, separate query). The rest are
  // daily-aggregated ranges that slice the same `pairDayDatas` series.
  type Range = '1h' | '7d' | '1m' | '3m' | '1y' | 'all'
  const RANGE_DAYS: Record<Exclude<Range, '1h'>, number | null> = { '7d': 7, '1m': 30, '3m': 90, '1y': 365, all: null }
  const [range, setRange] = useState<Range>('1m')
  const isHourly = range === '1h'

  const iskHYPEUSDT = pair.liquidityToken.address === '0xBb78f5ad054CAC4274813b6A4BBcC47D75a18BC3'

  const { data: dayResp, isPending: isPendingDay } = useQuery<{ pairDayDatas: DayData[] }>({
    queryKey: ['pairStats', pair.chainId, pair.liquidityToken.address, pair.version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairStats',
        query: buildQuery(GET_PAIR_STATS, keepUniV2),
        variables: { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase() },
      }),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled: !isHourly,
  })

  const { data: hourResp, isPending: isPendingHour } = useQuery<{ pairHourDatas: HourData[] }>({
    queryKey: ['pairStatsHour', pair.chainId, pair.liquidityToken.address, pair.version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairStatsHour',
        query: buildQuery(GET_PAIR_STATS_HOUR, keepUniV2),
        variables: { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase() },
      }),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled: isHourly,
  })

  // PROTOTYPE: recent swaps for the stacked buy/sell volume. Enabled in BOTH modes
  // (daily buckets by day, 1h by hour) — the recent first:1000 swaps cover both.
  const { data: swapResp } = useQuery<{ transactions: SwapTxn[] }>({
    queryKey: ['pairSwaps', pair.chainId, pair.liquidityToken.address, pair.version],
    // Loop with a timestamp_lt cursor to pull FULL swap history (not just the
    // newest 1000) so the buy/sell volume has no gap. Stops when a batch returns
    // < 1000 (oldest reached) or the MAX_SWAP_BATCHES safety cap is hit.
    queryFn: async () => {
      const base = { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase() }
      const all: SwapTxn[] = []
      let before: string | undefined
      for (let i = 0; i < MAX_SWAP_BATCHES; i++) {
        const resp = (await graphqlFetcher({
          operationName: before ? 'PairSwapsOlder' : 'PairSwaps',
          query: before ? GET_PAIR_SWAPS_OLDER : GET_PAIR_SWAPS,
          variables: before ? { ...base, before } : base,
        })) as { transactions?: SwapTxn[] } | null
        const txs = resp?.transactions ?? []
        all.push(...txs)
        if (txs.length < 1000) break
        before = String(txs[txs.length - 1].timestamp)
        if (i === MAX_SWAP_BATCHES - 1) {
          console.warn(`[PairChartTV] swap history capped at ${MAX_SWAP_BATCHES}k — older volume buckets omitted`)
        }
      }
      return { transactions: all }
    },
    // Full-history fetch is heavier than a single page, so refresh less often than
    // the 60s price polling — volume bars don't need sub-minute freshness.
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    // V3 only — V2's indexer has no per-swap `transactions` for a buy/sell split
    // (the query 500s), so V2 falls back to the aggregate totalVolume bars.
    enabled: !!pair.liquidityToken.address && !!pair.chainId && isV3,
  })

  // PROTOTYPE: bucket swaps and split buy/sell USD volume. Bucket size follows the
  // mode — per HOUR in 1h, per DAY otherwise.
  //  - vol (USD) = (amount0In + amount0Out) × token0-USD-price
  //  - isBuy = amount0Out > amount0In (token0 LEFT the pool → someone bought token0)
  //    NOTE (demo simplification): this is raw-token0 orientation. A base/quote-
  //    aware buy/sell (flip when token0 is the quote) can layer on later.
  // Produces two ASC-by-bucket arrays: volTotal (buy+sell) and volSell (sell only)
  // — the stacked-histogram trick draws green(total) behind, red(sell) on top.
  const { volTotal, volSell } = useMemo(() => {
    const rows = swapResp?.transactions ?? []
    const bucket = isHourly ? 3600 : 86400
    // Drop any swap with a bad/future timestamp — a single future-dated bucket
    // stretches the whole time axis and paints phantom future dates on it.
    const nowSec = Math.floor(Date.now() / 1000)
    const byBucket = new Map<number, { buy: number; sell: number }>()
    rows.forEach((t) => {
      const ts = Number(t.timestamp)
      if (!Number.isFinite(ts) || ts > nowSec) return
      const reserve0 = Number(t.reserve0)
      const in0 = Number(t.amount0In)
      const out0 = Number(t.amount0Out)
      const vol = reserve0 > 0 ? (in0 + out0) * (Number(t.reserve0USD) / reserve0) : 0
      if (!Number.isFinite(vol) || vol <= 0) return
      const isBuy = out0 > in0
      const bucketStart = Math.floor(ts / bucket) * bucket
      const acc = byBucket.get(bucketStart) ?? { buy: 0, sell: 0 }
      acc.buy += isBuy ? vol : 0
      acc.sell += isBuy ? 0 : vol
      byBucket.set(bucketStart, acc)
    })
    const buckets = [...byBucket.entries()].sort((a, b) => a[0] - b[0])
    return {
      volTotal: buckets.map(([time, v]) => ({ time: time as any, value: v.buy + v.sell })),
      volSell: buckets.map(([time, v]) => ({ time: time as any, value: v.sell })),
    }
  }, [swapResp, isHourly])

  const isPending = isHourly ? isPendingHour : isPendingDay
  const data = isHourly ? hourResp : dayResp

  // 1H-only scroll-to-load-more: older hourly buckets accumulated as the user
  // scrolls left past the initial 24. Combined with the live hourly rows below so
  // all LP/BH/UniV2 math is unchanged. The daily path is never paged.
  const [olderHours, setOlderHours] = useState<HourData[]>([])
  // One fetch at a time; stop once a batch comes back < 168 (older end reached).
  const loadingRef = useRef(false)
  const exhaustedRef = useRef(false)
  // Scroll-position preservation across a prepend: capture the visible TIME range
  // before appending, restore it after setData (so the view doesn't jump).
  const pendingRestoreRef = useRef(false)
  const savedRangeRef = useRef<IRange<Time> | null>(null)
  // fitContent only ONCE per range/mode (initial framing). Otherwise the 60s
  // refetch re-fits and yanks the user out of wherever they scrolled/zoomed
  // (the "1h suddenly shows all data after a minute" bug). Reset on pool/range change.
  const didFitRef = useRef(false)
  // Latest `loadMore` + hourly-mode flag, read by the once-created subscription.
  const loadMoreRef = useRef<() => void>(() => {})
  const isHourlyRef = useRef(isHourly)
  isHourlyRef.current = isHourly

  // Reset accumulation + guards when the pool identity changes OR the range
  // switches. Entering 1h must start fresh from the latest 24.
  useEffect(() => {
    setOlderHours([])
    loadingRef.current = false
    exhaustedRef.current = false
    pendingRestoreRef.current = false
    savedRangeRef.current = null
    didFitRef.current = false
  }, [pair.chainId, pair.liquidityToken.address, pair.version, range])

  // Combined hourly rows (live initial 24 + accumulated older batches). Both are
  // desc; merged + de-duped by hourStartUnix. Empty when not in 1h mode.
  const combinedHours = useMemo<HourData[]>(() => {
    if (!isHourly) return []
    const live = (hourResp as { pairHourDatas?: HourData[] } | undefined)?.pairHourDatas ?? []
    const byTime = new Map<number, HourData>()
    ;[...live, ...olderHours].forEach((h) => byTime.set(Number(h.hourStartUnix), h))
    // desc (newest-first), so the oldest accumulated bucket is the last element.
    return [...byTime.values()].sort((a, b) => Number(b.hourStartUnix) - Number(a.hourStartUnix))
  }, [isHourly, hourResp, olderHours])

  const fullChartData = useMemo(() => {
    // Guard against future-dated buckets from the indexer — a single point with a
    // dayStartUnix/hourStartUnix in the future stretches the time axis and paints
    // a phantom future date on it (e.g. a "Jul 26" tick when today is Jul 1).
    const nowSec = Math.floor(Date.now() / 1000)
    const toPoint = (lpRaw: number, bnhRaw: number, uniRaw: number, tvlRaw: number, volRaw: number, time: number) => {
      // Apply the iskHYPEUSDT scale BEFORE computing the diff so we don't
      // mix raw and scaled values. The divergence is in the same price
      // units as lpPrice/uniV2Price; rendering on the LEFT axis lets it
      // auto-scale independently of the primary price range.
      const lp = iskHYPEUSDT ? lpRaw / 1e9 : lpRaw
      const bnh = iskHYPEUSDT ? bnhRaw / 1e9 : bnhRaw
      const uni = iskHYPEUSDT ? uniRaw / 1e9 : uniRaw
      return {
        time,
        lpPrice: lp,
        bnhPrice: bnh,
        uniV2Price: uni,
        // "LP vs. UniV2" = LP's % outperformance over the UniV2 constant-product
        // benchmark: (lp − uni) / uni × 100. Scale-invariant, so the iskHYPEUSDT
        // /1e9 factor cancels (lp and uni are both scaled).
        lpVsUniV2: uni ? ((lp - uni) / uni) * 100 : 0,
        tvl: tvlRaw,
        // "LP vs. BH" = LP's % outperformance over Buy & Hold (HODL):
        // (lp − bnh) / bnh × 100.
        netPnL: bnh ? ((lp - bnh) / bnh) * 100 : 0,
        volume: volRaw,
      }
    }
    if (isHourly) {
      const rows = combinedHours
      if (!rows.length) return []
      // Combined rows are desc — flip to asc so the chart renders left→right.
      return [...rows]
        .filter((d) => Number(d.hourStartUnix) <= nowSec)
        .sort((a, b) => Number(a.hourStartUnix) - Number(b.hourStartUnix))
        .map((d) => toPoint(Number(d.lpPrice) || 0, Number(d.bnhPrice) || 0, Number(d.uniV2Price) || 0, Number(d.tvl) || 0, Number(d.totalVolume) || 0, Number(d.hourStartUnix)))
    }
    const rows = (data as { pairDayDatas?: DayData[] } | undefined)?.pairDayDatas
    if (!rows) return []
    return rows
      .filter((d) => Number(d.dayStartUnix) <= nowSec)
      .map((d) =>
        toPoint(Number(d.lpPrice) || 0, Number(d.bnhPrice) || 0, Number(d.uniV2Price) || 0, Number(d.tvl) || 0, Number(d.totalVolume) || 0, Number(d.dayStartUnix)),
      )
  }, [data, isHourly, iskHYPEUSDT, combinedHours])

  const chartData = useMemo(() => {
    if (isHourly) return fullChartData // full accumulated hourly set (24 + paged)
    const days = RANGE_DAYS[range as Exclude<Range, '1h'>]
    if (!days || fullChartData.length <= days) return fullChartData
    return fullChartData.slice(-days)
  }, [fullChartData, range, isHourly])

  // PROTOTYPE: scope the stacked volume to the SAME window as the price data so the
  // range selector zooms the chart (the volume no longer stretches it to all
  // history). Scope the volume to the earliest VISIBLE price bucket
  // (chartData[0].time) in EVERY mode — for 1h that's the loaded hourly window,
  // for 'all' it's a no-op (all data), for 7d/1m/3m it's the sliced range — so
  // fitContent always frames the price window, not the full swap history.
  const { chartVolTotal, chartVolSell } = useMemo(() => {
    const cutoff = chartData.length ? Number(chartData[0].time) : 0
    return {
      chartVolTotal: volTotal.filter((p) => Number(p.time) >= cutoff),
      chartVolSell: volSell.filter((p) => Number(p.time) >= cutoff),
    }
  }, [volTotal, volSell, chartData])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRefs = useRef<Partial<Record<SeriesKey, ISeriesApi<any>>>>({})
  // PROTOTYPE: the two stacked daily-volume histograms (green=total behind,
  // red=sell on top). Separate from seriesRefs since they aren't SeriesKeys.
  const volBuyRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const volSellRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  // Hovered per-series values for the tooltip. `volTotal`/`volSell` carry the two
  // stacked-histogram bars at the cursor (buy = total − sell).
  const [hovered, setHovered] = useState<
    (Partial<Record<SeriesKey, number>> & { volTotal?: number; volSell?: number }) | null
  >(null)
  // Floating tooltip state — anchor x/y in container-relative pixels.
  // null when cursor is outside the plot area.
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

  // 1H-only: fetch the next older hourly batch and prepend it. Guarded so only
  // one fetch runs at a time, and stops once a batch comes back < 168. Captures
  // the visible TIME range first so the post-setData effect can restore the view.
  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) return
    // combinedHours is desc — the oldest accumulated bucket is the last element.
    const oldest = combinedHours[combinedHours.length - 1]
    if (!oldest) return
    const before = Number(oldest.hourStartUnix)
    if (!Number.isFinite(before)) return
    loadingRef.current = true
    try {
      const res = (await graphqlFetcher({
        operationName: 'PairStatsHourOlder',
        query: buildQuery(GET_PAIR_STATS_HOUR_OLDER, keepUniV2),
        variables: { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase(), before },
      })) as { pairHourDatas?: HourData[] } | null
      const batch = res?.pairHourDatas ?? []
      if (batch.length < 168) exhaustedRef.current = true
      if (batch.length > 0) {
        // Times of existing bars don't change, so the saved TIME range stays valid.
        savedRangeRef.current = chartRef.current?.timeScale().getVisibleRange() ?? null
        pendingRestoreRef.current = true
        setOlderHours((prev) => [...prev, ...batch])
      }
    } finally {
      loadingRef.current = false
    }
  }, [combinedHours, keepUniV2, pair.chainId, pair.version, pair.liquidityToken.address])
  loadMoreRef.current = loadMore

  // Create chart once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Smart Y-axis formatter — abbreviate large magnitudes (K/M/B), keep
    // small prices (e.g. 0.45) readable with 2-4 decimals.
    const priceFormatter = (price: number) => {
      const abs = Math.abs(price)
      const sign = price < 0 ? '-' : ''
      if (abs >= 1_000_000_000) return `${sign}${(abs / 1e9).toFixed(2)}B`
      if (abs >= 1_000_000) return `${sign}${(abs / 1e6).toFixed(2)}M`
      if (abs >= 1_000) return `${sign}${(abs / 1e3).toFixed(2)}K`
      if (abs >= 1) return `${sign}${abs.toFixed(2)}`
      if (abs === 0) return '0'
      return `${sign}${abs.toFixed(3)}`
    }

    const chart = createChart(container, {
      localization: {
        priceFormatter,
        // Crosshair time badge → LOCAL time, matching the x-axis ticks + tooltip
        // (lightweight-charts' default badge is UTC, off by the timezone offset).
        timeFormatter: (time: any) =>
          new Date(Number(time) * 1000).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
      },
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#CFC7C1',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#2F2823' },
        horzLines: { color: '#2F2823' },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      leftPriceScale: {
        visible: showExtendedMetrics,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#493E35',
        timeVisible: false,
        secondsVisible: false,
        // Clamp the right edge to the newest bar + kill the right margin. With
        // gappy daily data lightweight-charts otherwise extrapolates tick labels
        // into the empty space past the last bar — showing FUTURE dates on the
        // axis (e.g. "Jul 26" when the latest bar is today) that match no bar and
        // disagree with the tooltip. fixLeftEdge stays off so 1h scroll-to-load
        // older buckets still works.
        fixRightEdge: true,
        rightOffset: 0,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        // Keep the vertical line + date badge on the time axis. Hide the
        // horizontal line entirely — the tooltip already shows per-series
        // values, so a y-axis price badge is redundant.
        vertLine: { color: '#978A80', style: LineStyle.Dashed, labelBackgroundColor: '#985C2A', labelVisible: true },
        horzLine: { visible: false, labelVisible: false },
      },
      width: container.clientWidth,
      height: container.clientHeight || 400,
      autoSize: true,
    })

    // Create all series — hide the "last value" floating badge + horizontal price line
    const commonNoLabels = { lastValueVisible: false, priceLineVisible: false }
    availableSeries.forEach((meta) => {
      let series: ISeriesApi<any>
      if (meta.type === 'histogram') {
        series = chart.addSeries(HistogramSeries, {
          ...commonNoLabels,
          color: meta.color,
          priceScaleId: meta.priceScaleId,
          priceFormat: { type: 'custom', formatter: priceFormatter, minMove: 0.01 },
        })
      } else if (meta.type === 'area') {
        series = chart.addSeries(AreaSeries, {
          ...commonNoLabels,
          lineColor: meta.color,
          topColor: `${meta.color}55`,
          bottomColor: `${meta.color}00`,
          priceScaleId: meta.priceScaleId,
          lineWidth: 2,
        })
      } else {
        series = chart.addSeries(LineSeries, {
          ...commonNoLabels,
          color: meta.color,
          priceScaleId: meta.priceScaleId,
          lineWidth: meta.lineWidth ?? 2,
          ...(meta.lineStyle !== undefined ? { lineStyle: meta.lineStyle } : {}),
        })
      }
      seriesRefs.current[meta.key] = series
    })

    // Volume sits at the bottom 20% of the chart
    if (seriesRefs.current.volume) {
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })
    }

    // PROTOTYPE: daily STACKED buy/sell volume on the same 'volume' scale. The
    // trick: GREEN (total = buy+sell) is created FIRST so it draws BEHIND, then
    // RED (sell) is created SECOND so it draws ON TOP — covering 0→sell. Net
    // visual: red-bottom / green-top stack. Fed only in daily mode (empty in 1h,
    // where the existing single 'volume' histogram is used instead).
    const volBuy = chart.addSeries(HistogramSeries, {
      ...commonNoLabels,
      color: COLOR_BUY,
      priceScaleId: 'volume',
      base: 0,
      priceFormat: { type: 'custom', formatter: priceFormatter, minMove: 0.01 },
    })
    const volSellSeries = chart.addSeries(HistogramSeries, {
      ...commonNoLabels,
      color: COLOR_SELL,
      priceScaleId: 'volume',
      base: 0,
      priceFormat: { type: 'custom', formatter: priceFormatter, minMove: 0.01 },
    })
    volBuyRef.current = volBuy
    volSellRef.current = volSellSeries

    // The "LP vs. UniV2" + "LP vs. BH" % lines share their own invisible overlay
    // scale ('pct') so they auto-fit to the same percentage range together and
    // stay directly comparable. Keep them clear of the volume band at the bottom.
    if (seriesRefs.current.lpVsUniV2 || seriesRefs.current.netPnL) {
      chart.priceScale('pct').applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.35 },
      })
    }

    // Live-update legend + floating tooltip as the user hovers the chart
    const crosshairHandler = (param: {
      time?: number
      seriesData: Map<ISeriesApi<any>, { value?: number } | undefined>
      point?: { x: number; y: number }
    }) => {
      if (!param.point || param.time === undefined) {
        setHovered(null)
        setTip(null)
        return
      }
      const next: Partial<Record<SeriesKey, number>> & { volTotal?: number; volSell?: number } = {}
      ;(Object.keys(seriesRefs.current) as SeriesKey[]).forEach((k) => {
        const s = seriesRefs.current[k]
        if (!s) return
        const point = param.seriesData.get(s) as { value?: number } | undefined
        if (point && typeof point.value === 'number') {
          next[k] = point.value
        }
      })
      // PROTOTYPE: the stacked buy/sell bars aren't SeriesKeys — read them directly.
      // Green = total (buy+sell), red = sell; the tooltip derives buy = total − sell.
      const totalPt = volBuyRef.current ? (param.seriesData.get(volBuyRef.current) as { value?: number } | undefined) : undefined
      const sellPt = volSellRef.current ? (param.seriesData.get(volSellRef.current) as { value?: number } | undefined) : undefined
      if (totalPt && typeof totalPt.value === 'number') next.volTotal = totalPt.value
      if (sellPt && typeof sellPt.value === 'number') next.volSell = sellPt.value
      setHovered(next)
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    // Scroll-to-load-more — 1h mode ONLY. When the left edge of the visible
    // logical range nears the start of the loaded data, page older hourly
    // buckets. Gated on `isHourlyRef` so the daily ranges (which already cover
    // everything at first:1000) never trigger a fetch.
    const rangeChangeHandler = (logical: { from: number; to: number } | null) => {
      if (!logical) return
      if (!isHourlyRef.current) return
      if (logical.from < 10) loadMoreRef.current()
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeChangeHandler as any)

    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRefs.current = {}
      volBuyRef.current = null
      volSellRef.current = null
    }
  }, [availableSeries])

  // Toggle x-axis time labels when switching between hourly and daily modes.
  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        // Labels adapt to the zoom level (same as the Pool charts): lightweight-
        // charts passes the tick granularity, so zooming out shows month/day and
        // zooming into a day shows HH:mm — instead of a format fixed by range.
        tickMarkFormatter: (time: any, tickMarkType: TickMarkType) => {
          const d = new Date(Number(time) * 1000)
          switch (tickMarkType) {
            case TickMarkType.Year:
              return d.toLocaleDateString(undefined, { year: 'numeric' })
            case TickMarkType.Month:
              // Full year, not '2-digit': "Jul '26" reads like "July 26th".
              return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
            case TickMarkType.Time:
              return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
            case TickMarkType.TimeWithSeconds:
              return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            case TickMarkType.DayOfMonth:
            default:
              return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }
        },
      },
    })
    chartRef.current?.timeScale().fitContent()
  }, [isHourly])

  // Push data into series
  useEffect(() => {
    const refs = seriesRefs.current
    if (!chartData.length) return
    availableSeries.forEach((meta) => {
      const s = refs[meta.key]
      if (!s) return
      // V3: the single 'volume' histogram is replaced by the stacked buy/sell
      // pair below, so feed it empty. V2 has no per-swap indexer data for a
      // buy/sell split, so it keeps the original single-color totalVolume bars.
      if (meta.key === 'volume' && isV3) {
        s.setData([])
        return
      }
      const mapped = chartData
        .map((p) => ({
          time: p.time as any,
          value: p[meta.key] as number,
        }))
        .filter((p) => Number.isFinite(p.value))
      s.setData(mapped)
    })

    // PROTOTYPE: stacked buy/sell volume in BOTH modes (per-hour in 1h, per-day
    // otherwise) — green(total) drawn behind, red(sell) on top. Scoped to the
    // selected range so the volume matches the visible price window (not stretched
    // to all history) and the range selector actually zooms.
    volBuyRef.current?.setData(chartVolTotal)
    volSellRef.current?.setData(chartVolSell)
    if (pendingRestoreRef.current) {
      // A 1h load-more prepend just grew the series on the LEFT — keep the same
      // TIME window so the view doesn't jump (older bars slide in off-screen).
      const saved = savedRangeRef.current
      if (saved) chartRef.current?.timeScale().setVisibleRange(saved)
      pendingRestoreRef.current = false
      savedRangeRef.current = null
    } else if (!didFitRef.current) {
      // Frame the window once, on the first data arrival for this range/mode.
      // Later 60s refetches update the series in place (setData preserves the
      // visible range) so the user's scroll/zoom position is left alone.
      chartRef.current?.timeScale().fitContent()
      didFitRef.current = true
    }
  }, [chartData, availableSeries, chartVolTotal, chartVolSell, isV3])

  // Toggle visibility
  useEffect(() => {
    const refs = seriesRefs.current
    availableSeries.forEach((meta) => {
      refs[meta.key]?.applyOptions({ visible: !!visible[meta.key] })
    })
    // PROTOTYPE: the stacked buy/sell histograms follow the 'volume' toggle.
    volBuyRef.current?.applyOptions({ visible: !!visible.volume })
    volSellRef.current?.applyOptions({ visible: !!visible.volume })
  }, [visible, availableSeries])

  return (
    <div
      className="p-[12px] sm:p-[16px]"
      style={{
        background: '#1E1915',
        border: '1px solid #2F2823',
        borderRadius: '12px',
      }}
    >
      
      {/* Range selector */}
      <div className="flex items-center justify-end mb-3">
        <div
          className="inline-flex items-center gap-0.5 sm:gap-1"
          style={{ background: '#2F2823', border: '1px solid #493E35', borderRadius: 8, padding: 2 }}
        >
          {(['1h', '7d', '1m', '3m', '1y', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="cursor-pointer text-[11px] sm:text-[12px] px-[8px] sm:px-[10px] py-[4px] sm:py-[5px]"
              style={{
                background: range === r ? '#985C2A' : 'transparent',
                color: range === r ? '#FFFFFF' : '#978A80',
                fontFamily: 'Inter',
                fontWeight: 500,
                border: 'none',
                borderRadius: 7,
                textTransform: 'uppercase',
              }}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div
        ref={containerRef}
        className="h-[220px] sm:h-[260px] lg:h-[320px]"
        style={{ width: '100%', position: 'relative' }}
      >
        {isPending && !data && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: '#978A80', fontFamily: 'Inter' }}
          >
            Loading chart…
          </div>
        )}
        {!isPending && chartData.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: '#978A80', fontFamily: 'Inter' }}
          >
            No data
          </div>
        )}

        {/* Floating tooltip — TradingView style: anchored diagonally above-
            and-right of the cursor (or tap point on mobile), flipping sides
            when near edges. */}
        {tip && hovered && (() => {
          const containerW = containerRef.current?.clientWidth ?? 0
          const containerH = containerRef.current?.clientHeight ?? 0
          const TIP_W = 196
          const TIP_H_EST = 132
          const HGAP = 14
          const VGAP = 14
          // Default: upper-right of the cursor. Flip horizontally near the
          // right edge, flip vertically (below cursor) when too close to top.
          const wantsRight = tip.x + HGAP + TIP_W <= containerW
          const left = wantsRight
            ? tip.x + HGAP
            : Math.max(8, tip.x - HGAP - TIP_W)
          const wantsAbove = tip.y - VGAP - TIP_H_EST >= 8
          const top = wantsAbove
            ? tip.y - VGAP - TIP_H_EST
            : Math.min(tip.y + VGAP, containerH - TIP_H_EST - 8)
          const date = new Date(tip.time * 1000)
          const dateStr = isHourly
            ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
            : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          return (
            <div
              className="pointer-events-none"
              style={{
                position: 'absolute',
                top,
                left,
                width: TIP_W,
                background: 'rgba(20, 16, 14, 0.95)',
                border: '1px solid #2F2823',
                borderRadius: 6,
                padding: '6px 8px',
                fontFamily: 'Inter',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                zIndex: 5,
              }}
            >
              <div style={{ fontSize: 10, color: '#978A80', marginBottom: 4, letterSpacing: '0.02em' }}>{dateStr}</div>
              {availableSeries
                .filter((meta) => visible[meta.key] && hovered[meta.key] !== undefined)
                .map((meta) => {
                  const v = hovered[meta.key] as number
                  const formatted =
                    meta.key === 'lpVsUniV2' || meta.key === 'netPnL'
                      ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
                      : meta.key === 'tvl' || meta.key === 'volume'
                        ? formatPrice(v, { maximumFractionDigits: 0 })
                        : formatPrice(v, { maximumFractionDigits: 3 })
                  return (
                    <div
                      key={meta.key}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 11, lineHeight: '16px' }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#CFC7C1' }}>
                        <span style={{ width: 7, height: 7, background: meta.color, borderRadius: 2, display: 'inline-block' }} />
                        {meta.label}
                      </span>
                      <span style={{ color: '#FBFBFD', fontWeight: 600 }}>{formatted}</span>
                    </div>
                  )
                })}
              {/* PROTOTYPE: stacked buy/sell split at the hovered bucket. Shown only
                  when the volume stack is visible and a bar exists (total > 0). */}
              {visible.volume && hovered.volTotal !== undefined && hovered.volTotal > 0 && (() => {
                const total = hovered.volTotal as number
                const sell = hovered.volSell ?? 0
                const buy = total - sell
                const row = (label: string, color: string, value: number) => (
                  <div
                    key={label}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 11, lineHeight: '16px' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color }}>
                      <span style={{ width: 7, height: 7, background: color, borderRadius: 2, display: 'inline-block' }} />
                      {label}
                    </span>
                    <span style={{ color: '#FBFBFD', fontWeight: 600 }}>{fmtVolUsd(value)}</span>
                  </div>
                )
                return (
                  <>
                    {row('Buy', COLOR_BUY, buy)}
                    {row('Sell', COLOR_SELL, sell)}
                  </>
                )
              })()}
            </div>
          )
        })()}
      </div>

      {/* Legend + toggles (bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3">
        {availableSeries.map((meta) => (
          // PROTOTYPE: a single 'Volume' item toggles the whole stacked buy/sell
          // pair (its visibility flows to both histograms via the effect below).
          <button
            key={meta.key}
            onClick={() => setVisible((prev) => ({ ...prev, [meta.key]: !prev[meta.key] }))}
            className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              opacity: visible[meta.key] ? 1 : 0.4,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: meta.color,
                borderRadius: 3,
                display: 'inline-block',
              }}
            />
            <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#FBFBFD' }}>
              {meta.label}
            </span>
            {/* LP vs. UniV2 benchmark explainer — interactive tooltip with a
                clickable Learn More (V3 chart only). */}
            {meta.key === 'lpVsUniV2' && isV3 && supportsUniV2 && (
              <InfoTooltip text={BENCHMARK_HINT} learnMoreUrl={LEARN_MORE_URL} />
            )}
            {/* Volume explainer — buy/sell split description (V3 only; V2 shows a
                plain total-volume bar with no split). */}
            {meta.key === 'volume' && isV3 && <InfoTooltip text={VOLUME_HINT} />}
            {/* Values live in the floating tooltip on both desktop (hover) and
                mobile (tap) — no need to duplicate them here. */}
          </button>
        ))}
      </div>

    
    </div>
  )
}

export const PairChartTV = memo(PairChartTVInner, (prev, next) => {
  return (
    prev.pair.liquidityToken.address === next.pair.liquidityToken.address &&
    prev.pair.chainId === next.pair.chainId
  )
})
