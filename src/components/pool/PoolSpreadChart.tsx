import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { graphqlFetcher } from 'utils/graphql'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'
import { RANGE_BUCKETS, RANGE_KEYS, RangeKey, bucketClose, bucketGrid, bucketVolume } from './chartTimeBuckets'
import { usePoolMarketPrice } from 'hooks/usePoolMarketPrice'
import { isMarketRefPair as isMarketRef } from './marketRefPairs'
import { InfoTooltip } from 'components/pool/AnnualizedReturnInfo'

// "oSpread" = the oracle-vs-AMM price spread per SWAP, from the indexer
// Transaction entity: (pythPrice0/pythPrice1 − ammPriceRel) / adjPriceRel.
// It oscillates around 0 (positive = oracle above the AMM price, negative =
// below), so we plot it as a single line in % with a zero reference. Pool-wide.
// (Spec from Manh.)
//
// Lightweight-charts (TradingView v5) reimplementation of the recharts version —
// same query + per-swap math, rendered as a single LineSeries with a zero
// reference price line, adaptive time axis, and a floating crosshair tooltip.
const GET_POOL_SPREAD = `
  query PoolSpread($pair: String) {
    transactions(first: 1000, where: { pair: $pair, type: "SWAP" }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      pythPrice0
      pythPrice1
      ammPriceRel
      adjPriceRel
      amount0In
      amount0Out
      amount1In
      amount1Out
      reserve0
      reserve1
      reserve0USD
      reserve1USD
      lpPrice
      bnhPrice
    }
  }
`

// Same shape as GET_POOL_SPREAD but pages OLDER swaps via `timestamp_lt`
// (numeric unix seconds, no quotes — indexer-verified). Used by loadMore.
const GET_POOL_SPREAD_OLDER = `
  query PoolSpreadOlder($pair: String, $before: BigInt) {
    transactions(first: 1000, where: { pair: $pair, type: "SWAP", timestamp_lt: $before }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      pythPrice0
      pythPrice1
      ammPriceRel
      adjPriceRel
      amount0In
      amount0Out
      amount1In
      amount1Out
      reserve0
      reserve1
      reserve0USD
      reserve1USD
      lpPrice
      bnhPrice
    }
  }
`

// lpPrice/bnhPrice (the LP-vs-BH benchmark) are a partial indexer rollout — the
// query is rejected on chains without them. Strip them so those chains still get
// the spread + price lines; where present, LP-vs-BH renders. Mirrors the Balance chart.
const buildSpreadQuery = (template: string, keep: boolean) =>
  keep ? template : template.replace(/\s*lpPrice\s*/g, '\n').replace(/\s*bnhPrice\s*/g, '\n')

async function fetchSpreadWithFallback(operationName: string, template: string, variables: Record<string, unknown>) {
  try {
    const full = await graphqlFetcher({ operationName, query: template, variables })
    if (full) return full
  } catch {
    // fall through to the stripped query
  }
  return graphqlFetcher({ operationName, query: buildSpreadQuery(template, false), variables })
}

type Range = RangeKey

type Txn = {
  timestamp: number | string
  pythPrice0: number | string
  pythPrice1: number | string
  ammPriceRel: number | string
  adjPriceRel: number | string
  amount0In: number | string
  amount0Out: number | string
  amount1In: number | string
  amount1Out: number | string
  reserve0: number | string
  reserve1: number | string
  reserve0USD: number | string
  reserve1USD: number | string
  // LP-vs-BH benchmark prices (partial indexer rollout — stripped where absent).
  lpPrice: number | string
  bnhPrice: number | string
}
// s = oSpread in %; price0 = pool exchange rate (base priced in quote); lpVsBh =
// LP-vs-buy&hold %; vol = this swap's USD volume; volUp = base token was net-bought.
type Point = { t: number; s: number; price0: number; lpVsBh: number | null; vol: number; volUp: boolean }

const COLOR = '#D8A072'
const COLOR_PRICE0 = '#EC4899' // pink — pool's own price (matches the Pool Balance chart)
const COLOR_MARKET = '#22D3EE' // cyan — market reference price (Pyth/TradingView)
const COLOR_LPBH = '#83CF84' // green — LP vs BH (matches the Pool Balance chart)
const COLOR_VOL_UP = '#16A34A' // green — base bought that swap (bar up)
const COLOR_VOL_DOWN = '#EF5350' // red — base sold that swap (bar down)
const COLOR_VOL_LEGEND = '#9CA3AF'

// Relative-price formatter (base priced in quote), adaptive decimals — matches the
// Pool Balance chart so the two charts read the same price the same way.
const formatRel = (v: number): string => {
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs === 0) return '0'
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8
  return `${sign}${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits })}`
}

// Compact USD formatter for the volume histogram (magnitude only; sign = direction).
const formatVolUsd = (v: number): string => {
  const abs = Math.abs(v)
  if (!Number.isFinite(abs) || abs === 0) return '$0'
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}k`
  if (abs >= 1) return `$${abs.toFixed(2)}`
  return `$${abs.toFixed(4)}`
}

type ToggleKey = 'spread' | 'price0' | 'market' | 'lpbh' | 'vol'

type Props = {
  pairAddress: string
  chainId: number
  version: number
  // Pool base/quote order (shouldReverseDisplay). Drives volume bar direction so
  // it matches the Pool Balance chart: base bought → green up, base sold → red down.
  reversed?: boolean
  symbol0?: string
  symbol1?: string
  // Pyth bytes32 feed ids (indexer token.priceFeedId) — for the gated market line.
  token0FeedId?: string | null
  token1FeedId?: string | null
}

export function PoolSpreadChart({
  pairAddress,
  chainId,
  version,
  reversed = false,
  symbol0 = '',
  symbol1 = '',
  token0FeedId,
  token1FeedId,
}: Props) {
  const [range, setRange] = useState<Range>('7D')
  // price0 (the pool's WETH/USDC.e price line) is hidden by default — it overlaps the
  // Market line and clutters the spread view. Toggle it on from the legend if wanted.
  const [visible, setVisible] = useState<Record<ToggleKey, boolean>>({ spread: true, price0: false, market: true, lpbh: true, vol: true })

  // Base/quote (via `reversed`) — the pool price + market lines are base priced in
  // quote, matching the Pool Balance chart.
  const baseIdx = reversed ? 1 : 0
  const quoteIdx = baseIdx === 0 ? 1 : 0
  const baseSymbol = baseIdx === 0 ? symbol0 : symbol1
  const quoteSymbol = baseIdx === 0 ? symbol1 : symbol0
  const baseFeedId = baseIdx === 0 ? token0FeedId : token1FeedId
  const quoteFeedId = baseIdx === 0 ? token1FeedId : token0FeedId
  const isMarketRefPair = isMarketRef(chainId, pairAddress)

  const { data, isLoading } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['poolSpread', chainId, pairAddress, version],
    queryFn: () =>
      fetchSpreadWithFallback(
        'PoolSpread',
        withFirstActivityGte(GET_POOL_SPREAD, 'timestamp', chainId, pairAddress),
        { chainId, version, pair: pairAddress.toLowerCase() },
      ) as Promise<{ transactions: Txn[] }>,
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  // Older swap batches accumulated by scroll-to-load-more (newest-first, like the
  // initial fetch). Combined with the initial batch in `allPoints`, so the
  // oSpread math below is unchanged.
  const [olderTxs, setOlderTxs] = useState<Txn[]>([])
  // No concurrent fetches; stop once a batch returns < 1000 (older end reached).
  const loadingRef = useRef(false)
  const exhaustedRef = useRef(false)
  // Scroll-position preservation: capture the visible TIME range before a prepend
  // and restore it after setData (so the view doesn't jump as bars grow left).
  const pendingRestoreRef = useRef(false)
  const savedRangeRef = useRef<IRange<Time> | null>(null)
  // Latest `loadMore`, read from the once-created chart subscription.
  const loadMoreRef = useRef<() => void>(() => {})

  // Reset accumulation + paging guards when the pool identity changes.
  useEffect(() => {
    setOlderTxs([])
    loadingRef.current = false
    exhaustedRef.current = false
    pendingRestoreRef.current = false
    savedRangeRef.current = null
  }, [pairAddress, chainId, version])

  // Initial batch (newest-first) + accumulated older batches (also newest-first),
  // so the whole thing stays a single descending list. The oldest accumulated
  // timestamp (last element) is the cursor for the next `timestamp_lt` page.
  const combinedTxs = useMemo<Txn[]>(() => [...(data?.transactions ?? []), ...olderTxs], [data, olderTxs])

  // oSpread per swap (× 100 for %), chronological (indexer returns newest-first).
  const allPoints = useMemo<Point[]>(() => {
    // Drop swaps with a future timestamp — a bad indexer record dated ahead of
    // now sits at the end of the series, so the chart frames right up to it
    // (stretching the axis "today → Jul 26"). Real block timestamps are never
    // ahead of now; a 1h margin absorbs any clock skew.
    const futureCutoff = Math.floor(Date.now() / 1000) + 3600
    return [...combinedTxs]
      .reverse()
      .map((t) => {
        const p0 = Number(t.pythPrice0)
        const p1 = Number(t.pythPrice1)
        const amm = Number(t.ammPriceRel)
        const adj = Number(t.adjPriceRel)
        // pythPrice0/pythPrice1 is token0/token1, but ammPriceRel/adjPriceRel use
        // the pool's quote orientation (inverted when token0 is the quote). Pick
        // the oracle-ratio orientation that matches ammPriceRel — the spread is
        // tiny, so the matching orientation is unambiguous — before the subtract.
        const rA = p1 !== 0 ? p0 / p1 : NaN
        const rB = p0 !== 0 ? p1 / p0 : NaN
        const ratio =
          Number.isFinite(rA) && (!Number.isFinite(rB) || Math.abs(rA - amm) <= Math.abs(rB - amm)) ? rA : rB
        // Skip swaps with a missing AMM price (ammPriceRel = 0) — early-pool data
        // anomalies that otherwise compute to a bogus ~100% spread (the "100% at
        // the start"). Only amm > 0 (and adj > 0) is a real trade price.
        const s = amm > 0 && adj > 0 && Number.isFinite(ratio) ? ((ratio - amm) / adj) * 100 : NaN
        // Same per-swap USD volume as the Pool Balance chart:
        // (amount0In + amount0Out) × (reserve0USD / reserve0). Direction relative to
        // the BASE token: base bought (leaves pool → baseOut) = up, sold = down.
        const r0 = Number(t.reserve0)
        const u0 = Number(t.reserve0USD)
        const vol = r0 > 0 ? (Number(t.amount0In) + Number(t.amount0Out)) * (u0 / r0) : 0
        const baseOut = Number(baseIdx === 0 ? t.amount0Out : t.amount1Out)
        const baseIn = Number(baseIdx === 0 ? t.amount0In : t.amount1In)
        // Pool exchange rate (base priced in quote) from reserve USD — identical to
        // the Pool Balance chart's price0, so the two charts show the same pool price.
        const r1 = Number(t.reserve1)
        const u1 = Number(t.reserve1USD)
        const baseAmt = baseIdx === 0 ? r0 : r1
        const baseUsd = baseIdx === 0 ? u0 : u1
        const quoteAmt = quoteIdx === 0 ? r0 : r1
        const quoteUsd = quoteIdx === 0 ? u0 : u1
        const baseUsdPrice = baseAmt > 0 ? baseUsd / baseAmt : NaN
        const quoteUsdPrice = quoteAmt > 0 ? quoteUsd / quoteAmt : NaN
        const price0 = quoteUsdPrice > 0 ? baseUsdPrice / quoteUsdPrice : NaN
        // LP-vs-BH % from the per-swap benchmark prices (indexer) — same as the
        // Pool Balance chart. null when the chain lacks the fields (stripped query).
        const lp = Number(t.lpPrice)
        const bnh = Number(t.bnhPrice)
        const lpVsBh = lp > 0 && bnh > 0 ? (lp / bnh - 1) * 100 : null
        return { t: Number(t.timestamp), s, price0, lpVsBh, vol: Number.isFinite(vol) ? vol : 0, volUp: baseOut >= baseIn }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.s) && p.t <= futureCutoff)
  }, [combinedTxs, baseIdx, quoteIdx])

  // Timeframe = a real time GRID resampled from the per-swap points, so the x-axis
  // is linear in clock time. The grid holds the FULL loaded history at this bucket
  // size; the range is a zoom preset (visible window), so scroll-left reveals older
  // bars + loads more (like the LP chart). gridEnd is always "now".
  const { bucket } = RANGE_BUCKETS[range]
  const grid = useMemo(
    () => bucketGrid(allPoints.length ? allPoints[0].t : null, bucket, Math.floor(Date.now() / 1000)),
    [allPoints, bucket],
  )

  // Spread line = per-bucket close, carried forward across empty buckets (the
  // spread persists between trades). Ascending + unique bucket times satisfy
  // lightweight-charts directly — no separate dedup needed.
  const seriesData = useMemo(() => {
    if (!grid) return []
    return bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd).map((p) => ({ time: p.t as any, value: p.s }))
  }, [allPoints, bucket, grid])

  // Pool price line (base priced in quote) = per-bucket close, carried between
  // trades — the same pool price the Balance chart shows, on the isolated 'price'
  // overlay scale here (the spread owns the visible right % axis).
  const price0Data = useMemo(() => {
    if (!grid) return []
    return bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd)
      .filter((p) => Number.isFinite(p.price0))
      .map((p) => ({ time: p.t as any, value: p.price0 }))
  }, [allPoints, bucket, grid])

  // LP-vs-BH % line — per-bucket close, carried. On its own hidden 'pct' overlay
  // scale (the spread is a tiny %, LP-vs-BH is a larger %, so they can't share an
  // axis). Empty when the chain lacks the benchmark fields.
  const lpVsBhData = useMemo(() => {
    if (!grid) return []
    return bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd)
      .filter((p) => p.lpVsBh != null && Number.isFinite(p.lpVsBh))
      .map((p) => ({ time: p.t as any, value: p.lpVsBh as number }))
  }, [allPoints, bucket, grid])

  // Signed volume histogram — bar height = total USD volume in the BUCKET, sign/
  // color = net direction (green base-buy / red base-sell). Summed per bucket so
  // it reconciles with the LP chart's volume over the same period.
  const volumeData = useMemo(() => {
    if (!grid) return []
    return bucketVolume(allPoints, bucket, grid.gridStart, grid.gridEnd, COLOR_VOL_UP, COLOR_VOL_DOWN)
  }, [allPoints, bucket, grid])

  // Market reference price (gated to MARKET_REF_PAIRS) — same hook + 'price' scale as
  // the Pool Balance chart, so the pool price vs market comparison matches there.
  const marketRaw = usePoolMarketPrice({
    baseFeedId,
    quoteFeedId,
    bucket,
    from: grid?.gridStart ?? null,
    to: grid?.gridEnd ?? null,
    enabled: isMarketRefPair,
  })
  const hasMarket = isMarketRefPair && marketRaw.length > 0
  const marketData = useMemo(
    () => (isMarketRefPair ? marketRaw.map((p) => ({ time: p.time as any, value: p.value })) : []),
    [marketRaw, isMarketRefPair],
  )


  // The "now" spread is always the latest swap, independent of the timeframe.
  const latest = allPoints[allPoints.length - 1]

  // Fetch the next older batch and prepend it. Guarded so only one fetch runs at
  // a time, and stops once a batch comes back < 1000 (older end reached). Capture
  // the visible TIME range first so the post-setData effect can restore the view.
  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) return
    const oldest = combinedTxs[combinedTxs.length - 1]
    if (!oldest) return
    const before = Number(oldest.timestamp)
    if (!Number.isFinite(before)) return
    loadingRef.current = true
    try {
      const res = (await fetchSpreadWithFallback(
        'PoolSpreadOlder',
        withFirstActivityGte(GET_POOL_SPREAD_OLDER, 'timestamp', chainId, pairAddress),
        { chainId, version, pair: pairAddress.toLowerCase(), before },
      )) as { transactions?: Txn[] } | null
      const batch = res?.transactions ?? []
      if (batch.length < 1000) exhaustedRef.current = true
      if (batch.length > 0) {
        // Times of existing bars don't change, so the saved TIME range stays valid.
        savedRangeRef.current = chartRef.current?.timeScale().getVisibleRange() ?? null
        pendingRestoreRef.current = true
        setOlderTxs((prev) => [...prev, ...batch])
      }
    } finally {
      loadingRef.current = false
    }
  }, [combinedTxs, chainId, version, pairAddress])
  loadMoreRef.current = loadMore

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  // Pool price (solid pink) + market reference (dashed cyan) on the isolated 'price'
  // overlay scale — same as the Pool Balance chart.
  const price0Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const marketRef = useRef<ISeriesApi<'Line'> | null>(null)
  // LP-vs-BH % (green) on its own hidden 'pct' scale.
  const lpbhRef = useRef<ISeriesApi<'Line'> | null>(null)
  const volSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  // Floating tooltip anchor — container-relative pixels + the hovered time. The
  // per-series values (spread, price, market, lpVsBh, vol) are read on hover.
  const [tip, setTip] = useState<
    { x: number; y: number; time: number; value: number; price0?: number; market?: number; lpVsBh?: number; vol?: number } | null
  >(null)

  // Apply the current timeframe as a VISIBLE-RANGE (zoom) preset — the chart
  // always holds the full data, so this only changes what's on screen. 'ALL' =
  // fit everything; bounded ranges = the last N seconds up to the newest point.
  // If the data doesn't reach `from`, lightweight-charts clamps to the data start.
  const applyRangePreset = useCallback(() => {
    const ts = chartRef.current?.timeScale()
    if (!ts) return
    const rangeSpan = RANGE_BUCKETS[range].span
    const last = seriesData.length ? (seriesData[seriesData.length - 1].time as number) : null
    if (rangeSpan == null || last == null) {
      ts.fitContent()
      return
    }
    ts.setVisibleRange({ from: (last - rangeSpan) as Time, to: last as Time })
  }, [range, seriesData])
  // Stable handle so the data-push effect can apply the preset without taking
  // `applyRangePreset` as a dependency (which would re-fire it on every range tick).
  const applyRangePresetRef = useRef(applyRangePreset)
  applyRangePresetRef.current = applyRangePreset

  // Create chart + series once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      // Crosshair time badge uses LOCAL time, matching the x-axis ticks + tooltip
      // (lightweight-charts' default badge is UTC, which mismatched by the tz offset).
      localization: {
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
        // Leave the bottom ~25% for the volume histogram so the spread line clears it.
        scaleMargins: { top: 0.1, bottom: 0.28 },
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderColor: '#493E35',
        timeVisible: true,
        secondsVisible: false,
        // No empty margin past the last bar: otherwise lightweight-charts fills
        // the whitespace with extrapolated tick times that overshoot into the
        // future ("Jul 26" phantom dates). fixLeftEdge stays off so scroll-to-
        // load-more still works.
        rightOffset: 0,
        fixRightEdge: true,
        // Labels adapt to the zoom level — lightweight-charts passes the tick
        // granularity, so zooming out shows month/day and zooming into a day
        // shows HH:mm (professional, TradingView-style), instead of a fixed format.
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
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#978A80', style: LineStyle.Dashed, labelBackgroundColor: '#985C2A', labelVisible: true },
        horzLine: { visible: false, labelVisible: false },
      },
      width: container.clientWidth,
      height: container.clientHeight || 260,
      autoSize: true,
    })

    // Single oSpread % line on the default (right) scale, autoscaled — the
    // spread is tiny (±fractions of a %), so let the value axis fit the data.
    const series = chart.addSeries(LineSeries, {
      lastValueVisible: false,
      priceLineVisible: false,
      color: COLOR,
      lineWidth: 1,
      priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(3)}%`, minMove: 0.0001 },
    })
    // Zero reference — oSpread oscillates around 0.
    series.createPriceLine({
      price: 0,
      color: '#493E35',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
      title: '',
    })

    // Pool price (solid pink) + market reference (dashed cyan) on an ISOLATED 'price'
    // overlay scale — the spread owns the visible right % axis, so the prices sit on
    // their own hidden auto-scaled axis (same as the Pool Balance chart). Market
    // first (behind), pool price on top. Empty on non-gated pairs.
    const commonPrice = {
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'price',
      priceFormat: { type: 'custom' as const, formatter: (v: number) => formatRel(v), minMove: 0.00000001 },
    }
    const marketLine = chart.addSeries(LineSeries, { ...commonPrice, color: COLOR_MARKET, lineWidth: 1, lineStyle: LineStyle.Dashed })
    const price0Line = chart.addSeries(LineSeries, { ...commonPrice, color: COLOR_PRICE0, lineWidth: 1 })
    marketLine.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.28 } })

    // LP vs BH % on its OWN hidden 'pct' overlay scale (autoscaled) — the spread's
    // tiny ± axis would squash it otherwise.
    const lpbhLine = chart.addSeries(LineSeries, {
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'pct',
      color: COLOR_LPBH,
      lineWidth: 1,
      priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, minMove: 0.01 },
    })
    lpbhLine.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.28 } })

    // Signed volume histogram in the bottom ~20% (same as the Pool Balance chart) —
    // its own 'vol' scale so it never overlaps the spread line.
    const volSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'vol',
      base: 0,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: { type: 'custom', formatter: (v: number) => formatVolUsd(v), minMove: 0.01 },
    })
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    const crosshairHandler = (param: {
      time?: number
      seriesData: Map<ISeriesApi<any>, { value?: number } | undefined>
      point?: { x: number; y: number }
    }) => {
      if (!param.point || param.time === undefined) {
        setTip(null)
        return
      }
      const pt = param.seriesData.get(series) as { value?: number } | undefined
      if (!pt || typeof pt.value !== 'number') {
        setTip(null)
        return
      }
      const ppr = param.seriesData.get(price0Line) as { value?: number } | undefined
      const pmk = param.seriesData.get(marketLine) as { value?: number } | undefined
      const plb = param.seriesData.get(lpbhLine) as { value?: number } | undefined
      const volPt = volSeriesRef.current
        ? (param.seriesData.get(volSeriesRef.current) as { value?: number } | undefined)
        : undefined
      setTip({
        x: param.point.x,
        y: param.point.y,
        time: Number(param.time),
        value: pt.value,
        price0: typeof ppr?.value === 'number' ? ppr.value : undefined,
        market: typeof pmk?.value === 'number' ? pmk.value : undefined,
        lpVsBh: typeof plb?.value === 'number' ? plb.value : undefined,
        vol: typeof volPt?.value === 'number' ? volPt.value : undefined,
      })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    // Scroll-to-load-more (every timeframe): when the left edge of the visible
    // logical range nears the start of the loaded data, page older swaps. loadMore
    // self-stops once a batch returns < 1000 (oldest reached).
    const rangeChangeHandler = (logical: { from: number; to: number } | null) => {
      if (!logical) return
      if (logical.from < 10) loadMoreRef.current()
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeChangeHandler as any)

    seriesRef.current = series
    price0Ref.current = price0Line
    marketRef.current = marketLine
    lpbhRef.current = lpbhLine
    volSeriesRef.current = volSeries
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      price0Ref.current = null
      marketRef.current = null
      lpbhRef.current = null
      volSeriesRef.current = null
    }
  }, [])

  // Push data into the series.
  useEffect(() => {
    seriesRef.current?.setData(seriesData)
    price0Ref.current?.setData(price0Data)
    lpbhRef.current?.setData(lpVsBhData)
    volSeriesRef.current?.setData(volumeData)
    if (!seriesData.length) return
    if (pendingRestoreRef.current) {
      // A load-more prepend just grew the series on the LEFT — keep the same TIME
      // window so the view doesn't jump (older bars slide in off-screen to the
      // left). Do NOT re-apply the preset here, or we'd yank the user back.
      const saved = savedRangeRef.current
      if (saved) chartRef.current?.timeScale().setVisibleRange(saved)
      pendingRestoreRef.current = false
      savedRangeRef.current = null
    } else {
      // Initial load (or a range-change-triggered data refresh) — zoom to the
      // current timeframe preset.
      applyRangePresetRef.current()
    }
  }, [seriesData, price0Data, lpVsBhData, volumeData])

  // Push the market reference line separately — it arrives async (Pyth fetch);
  // setData preserves the visible range, so this never re-zooms.
  useEffect(() => {
    marketRef.current?.setData(marketData)
  }, [marketData])

  // Re-zoom when the timeframe button changes (data unchanged).
  useEffect(() => {
    if (pendingRestoreRef.current) return
    applyRangePresetRef.current()
  }, [range])

  // Toggle visibility from the bottom legend.
  useEffect(() => {
    seriesRef.current?.applyOptions({ visible: visible.spread })
    price0Ref.current?.applyOptions({ visible: visible.price0 })
    marketRef.current?.applyOptions({ visible: visible.market })
    lpbhRef.current?.applyOptions({ visible: visible.lpbh })
    volSeriesRef.current?.applyOptions({ visible: visible.vol })
  }, [visible])

  return (
    <div>
      {/* Section title — sits OUTSIDE the chart card */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>Oracle Spread</div>
        {latest && (
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
            now <span style={{ color: COLOR }}>{latest.s >= 0 ? '+' : ''}{latest.s.toFixed(4)}%</span>
          </div>
        )}
      </div>
      {/* Math description */}
      <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#978A80', marginBottom: 10, lineHeight: 1.5 }}>
        oSpread = (oracle price − AMM price) ÷ adjusted price
      </div>

      <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '20px' }}>
        {/* Timeframe selector — matches the LP chart's segmented control */}
        <div className="flex items-center justify-end mb-3">
          <div
            className="inline-flex items-center gap-0.5 sm:gap-1"
            style={{ background: '#2F2823', border: '1px solid #493E35', borderRadius: 8, padding: 2 }}
          >
            {RANGE_KEYS.map((r) => (
              <button
                key={r}
                type="button"
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
                {r === 'ALL' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Chart container — native scroll/pinch zoom stays enabled. */}
        <div style={{ position: 'relative', width: '100%', height: 260 }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
          {isLoading && allPoints.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}
            >
              Loading oracle spread…
            </div>
          )}
          {!isLoading && allPoints.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}
            >
              No swaps on this pool yet.
            </div>
          )}

          {/* Floating tooltip — TradingView style, anchored near the cursor and
              clamped inside the container (mirrors PoolBalanceChart's `tip` card). */}
          {tip && (() => {
            const containerW = containerRef.current?.clientWidth ?? 0
            const containerH = containerRef.current?.clientHeight ?? 0
            const TIP_W = 168
            const TIP_H_EST = 78
            const HGAP = 14
            const VGAP = 14
            // Default: upper-right of the cursor. Flip horizontally near the right
            // edge, flip vertically (below cursor) when too close to the top.
            const wantsRight = tip.x + HGAP + TIP_W <= containerW
            const left = wantsRight ? tip.x + HGAP : Math.max(8, tip.x - HGAP - TIP_W)
            const wantsAbove = tip.y - VGAP - TIP_H_EST >= 8
            const top = wantsAbove
              ? tip.y - VGAP - TIP_H_EST
              : Math.min(tip.y + VGAP, containerH - TIP_H_EST - 8)
            const date = new Date(tip.time * 1000)
            const dateStr =
              range === '1D'
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
                  background: '#15110E',
                  border: '1px solid #2F2823',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontFamily: 'Inter',
                  fontSize: 12,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  zIndex: 5,
                }}
              >
                <div style={{ color: '#978A80', marginBottom: 4 }}>{dateStr}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ color: COLOR }}>oSpread</span>
                  <span style={{ color: '#FBFBFD' }}>
                    {tip.value >= 0 ? '+' : ''}
                    {tip.value.toFixed(4)}%
                  </span>
                </div>
                {tip.market !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
                    <span style={{ color: COLOR_MARKET }}>Market</span>
                    <span style={{ color: '#FBFBFD' }}>{formatRel(tip.market)}</span>
                  </div>
                )}
                {tip.lpVsBh !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
                    <span style={{ color: COLOR_LPBH }}>LP vs BH</span>
                    <span style={{ color: '#FBFBFD' }}>{tip.lpVsBh >= 0 ? '+' : ''}{tip.lpVsBh.toFixed(2)}%</span>
                  </div>
                )}
                {tip.vol !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
                    <span style={{ color: tip.vol >= 0 ? COLOR_VOL_UP : COLOR_VOL_DOWN }}>Volume</span>
                    <span style={{ color: '#FBFBFD' }}>{formatVolUsd(tip.vol)}</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Legend + per-series toggles (bottom, like the Pool Balance chart) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3">
          {[
            { key: 'spread' as const, label: 'oSpread', color: COLOR },
            ...(hasMarket ? [{ key: 'market' as const, label: 'Market', color: COLOR_MARKET }] : []),
            ...(lpVsBhData.length > 0 ? [{ key: 'lpbh' as const, label: 'LP vs BH', color: COLOR_LPBH }] : []),
            ...(volumeData.length > 0 ? [{ key: 'vol' as const, label: 'Volume', color: COLOR_VOL_LEGEND }] : []),
          ].map((item) => (
            <div key={item.key} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                style={{ background: 'transparent', border: 'none', padding: 0, opacity: visible[item.key] ? 1 : 0.4 }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: 'inline-block' }} />
                <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#FBFBFD' }}>{item.label}</span>
              </button>
              {item.key === 'market' && (
                <InfoTooltip
                  text={`Real market price of ${baseSymbol}/${quoteSymbol} (Pyth / TradingView). The gap between it and the pink pool price is the spread.`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
