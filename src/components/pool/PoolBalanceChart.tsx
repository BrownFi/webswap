import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  AreaSeries,
  BaselineSeries,
  ColorType,
  CrosshairMode,
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

// Lightweight-charts (TradingView v5) reimplementation of PoolBalanceChart.
// Same data + computation as the recharts version: pool-balance % split from the
// indexer's `Transaction` entity (reserve0USD/reserve1USD per tx), plus an
// overlaid daily LP-vs-BH % line on a right scale.
//
// The headline thing this prototype tests is "dominant-token shading": instead of
// recharts' two band Areas, the token0 % is drawn as a single BaselineSeries with
// its base value pinned at 50%. The fill ABOVE 50 is orange (token0-heavy) and
// BELOW 50 is blue (token1-heavy), so the dominant token is read directly from the
// fill color of one continuous series.
//
// Colors follow BASE/QUOTE via the `reversed` (= shouldReverseDisplay) signal:
// the BASE token is always orange/gold, the QUOTE always blue — consistent across
// every pool. `reversed` also lists the base first in the legend rows.
const GET_POOL_BALANCES = `
  query PoolBalances($pair: String) {
    transactions(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      reserve0
      reserve1
      reserve0USD
      reserve1USD
    }
  }
`

// Same shape as GET_POOL_BALANCES but pages OLDER txs via `timestamp_lt`
// (numeric unix seconds, no quotes — indexer-verified). Used by loadMore.
const GET_POOL_BALANCES_OLDER = `
  query PoolBalancesOlder($pair: String, $before: BigInt) {
    transactions(first: 1000, where: { pair: $pair, timestamp_lt: $before }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      reserve0
      reserve1
      reserve0USD
      reserve1USD
    }
  }
`

// LP-vs-BH series (daily) — same source as the LP chart's lpPrice/bnhPrice lines.
const GET_POOL_LPBH = `
  query PoolLpBh($pair: String) {
    pairDayDatas(first: 1000, where: { pair: $pair }, orderBy: dayStartUnix, orderDirection: asc) {
      dayStartUnix
      lpPrice
      bnhPrice
    }
  }
`

const RANGES = { '1D': 86400, '7D': 7 * 86400, '1M': 30 * 86400, ALL: null } as const
type Range = keyof typeof RANGES
const RANGE_KEYS: Range[] = ['1D', '7D', '1M', 'ALL']

type Txn = {
  timestamp: number | string
  reserve0: number | string
  reserve1: number | string
  reserve0USD: number | string
  reserve1USD: number | string
}
type DayRow = { dayStartUnix: number | string; lpPrice: number | string; bnhPrice: number | string }
// pct0/pct1 = each token's % of pool value; lpVsBh = LP-vs-buy&hold % (right
// axis), step-attached from daily data; basePrice = the BASE (non-quote) token's
// USD price for this tx (its reserveUSD / its reserve), drawn on its own isolated
// overlay scale. Base is chosen via quoteTokenIndex.
type Point = {
  t: number
  pct0: number
  pct1: number
  lpVsBh: number | null
  price0: number
}

const COLOR0 = '#D8A072' // token0 (app orange/tan)
const COLOR1 = '#4DA3FF' // token1 (blue)
const COLOR_LPBH = '#83CF84' // LP vs BH (green)
const COLOR_PRICE0 = '#EC4899' // token0 USD price (pink/magenta) — distinct from the three above

// Relative-price formatter that adapts decimals to magnitude (no `$` — the value
// is base priced in the quote token, e.g. ~1581 USDC.e per WETH). Keeps precision
// for tiny ratios and stays tidy for large ones.
const formatRel = (v: number): string => {
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs === 0) return '0'
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8
  return `${sign}${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits })}`
}

// Low-opacity fills for the dominant-token Baseline shading. Two stops each so
// the gradient fades toward the 50% midline (matches recharts' fillOpacity 0.18).
const COLOR0_FILL_NEAR = 'rgba(216, 160, 114, 0.28)' // orange, away from base (top of chart)
const COLOR0_FILL_FAR = 'rgba(216, 160, 114, 0.04)' // orange, near base
const COLOR1_FILL_NEAR = 'rgba(77, 163, 255, 0.28)' // blue, away from base (bottom of chart)
const COLOR1_FILL_FAR = 'rgba(77, 163, 255, 0.04)' // blue, near base

type Props = {
  pairAddress: string
  chainId: number
  version: number
  symbol0: string
  symbol1: string
  // Pool base/quote signal (= shouldReverseDisplay). Drives BOTH the legend order
  // AND the colors: when true the base is raw token1, so it lists first + is gold.
  reversed?: boolean
  // Accepted for caller compatibility but no longer read — base/quote now comes
  // solely from `reversed` (single source of truth). Safe to drop in a later sweep.
  quoteTokenIndex?: number | null
  // When false, the LP-vs-BH green line (+ its right axis, query, legend item, and
  // tooltip row) is COMPLETELY omitted — a clean token0/token1 + 50% + price chart
  // on a single left % axis. Default true keeps the full behavior.
  showLpVsBh?: boolean
}

type ToggleKey = 't0' | 't1' | 'lpbh' | 'price0'

export function PoolBalanceChart({
  pairAddress,
  chainId,
  version,
  symbol0,
  symbol1,
  reversed = false,
  showLpVsBh = true,
}: Props) {
  const [range, setRange] = useState<Range>('ALL')
  // Per-series visibility, toggled by the bottom legend (like PairChartTV).
  const [visible, setVisible] = useState<Record<ToggleKey, boolean>>({ t0: true, t1: true, lpbh: true, price0: true })

  // The price line plots the BASE token priced in the QUOTE token (the pool
  // exchange rate, e.g. USDC.e per WETH). Base/quote comes from the canonical
  // `reversed` (= shouldReverseDisplay: quoteTokenIndex for V3, symbol whitelist
  // for V2) so the chart agrees with the pair title everywhere — single source.
  const baseIdx = reversed ? 1 : 0
  const quoteIdx = baseIdx === 0 ? 1 : 0
  const baseSymbol = baseIdx === 0 ? symbol0 : symbol1
  const quoteSymbol = baseIdx === 0 ? symbol1 : symbol0

  // Colors follow BASE/QUOTE, not raw token0/token1: the BASE token is always GOLD
  // (COLOR0) and the QUOTE always BLUE (COLOR1), consistent across every pool. Base
  // is token0 when not reversed, token1 when reversed — so the raw-token colors swap.
  const token0Color = reversed ? COLOR1 : COLOR0
  const token1Color = reversed ? COLOR0 : COLOR1

  const { data, isLoading } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['poolBalances', chainId, pairAddress, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PoolBalances',
        query: withFirstActivityGte(GET_POOL_BALANCES, 'timestamp', chainId, pairAddress),
        variables: { chainId, version, pair: pairAddress.toLowerCase() },
      }),
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  const { data: dayData } = useQuery<{ pairDayDatas: DayRow[] }>({
    queryKey: ['poolLpBh', chainId, pairAddress, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PoolLpBh',
        query: GET_POOL_LPBH,
        variables: { chainId, version, pair: pairAddress.toLowerCase() },
      }),
    // Gated off when the LP-vs-BH line is hidden — no request fires.
    enabled: showLpVsBh && !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  // Older tx batches accumulated by scroll-to-load-more (newest-first, like the
  // initial fetch). Combined with the initial batch in `combinedTxs`, so the
  // pct/LP-vs-BH step-attach math below is unchanged.
  const [olderTxs, setOlderTxs] = useState<Txn[]>([])
  // No concurrent fetches; stop once a batch returns < 1000 (older end reached).
  const loadingRef = useRef(false)
  const exhaustedRef = useRef(false)
  // Scroll-position preservation: capture the visible TIME range before a prepend
  // and restore it after setData (so the view doesn't jump as bars grow left).
  const pendingRestoreRef = useRef(false)
  const savedRangeRef = useRef<IRange<Time> | null>(null)

  // Reset accumulation + paging guards when the pool identity changes.
  useEffect(() => {
    setOlderTxs([])
    loadingRef.current = false
    exhaustedRef.current = false
    pendingRestoreRef.current = false
    savedRangeRef.current = null
  }, [pairAddress, chainId, version])

  // Daily LP-vs-BH %, ascending — the step source for each trade point.
  const dailyLpBh = useMemo(() => {
    const rows = dayData?.pairDayDatas ?? []
    return rows
      .map((r) => {
        const lp = Number(r.lpPrice)
        const bnh = Number(r.bnhPrice)
        return { t: Number(r.dayStartUnix), lpVsBh: lp > 0 && bnh > 0 ? (lp / bnh - 1) * 100 : NaN }
      })
      .filter((d) => Number.isFinite(d.t) && Number.isFinite(d.lpVsBh))
      .sort((a, b) => a.t - b.t)
  }, [dayData])

  // Initial batch (newest-first) + accumulated older batches (also newest-first),
  // so the whole thing stays a single descending list. The oldest accumulated
  // timestamp (last element) is the cursor for the next `timestamp_lt` page.
  const combinedTxs = useMemo<Txn[]>(() => [...(data?.transactions ?? []), ...olderTxs], [data, olderTxs])

  // Full fetched series as a % split, chronological (indexer returns newest-first).
  // Kept in RAW token order — colors/lines are tied to each raw token. Each point
  // also carries the LP-vs-BH value from the latest daily bucket ≤ its timestamp.
  const allPoints = useMemo<Point[]>(() => {
    const base = [...combinedTxs]
      .reverse()
      .map((t) => {
        const r0 = Number(t.reserve0USD)
        const r1 = Number(t.reserve1USD)
        const total = r0 + r1
        const pct0 = total > 0 ? (r0 / total) * 100 : NaN
        const pct1 = 100 - pct0
        // RELATIVE price = base token priced in the quote token (the pool exchange
        // rate). Computed as base's USD price ÷ quote's USD price — correct even
        // though BrownFi reserves aren't value-balanced. base/quote chosen via
        // quoteTokenIndex (base = non-quote token).
        const baseAmt = Number(baseIdx === 0 ? t.reserve0 : t.reserve1)
        const baseUsd = baseIdx === 0 ? r0 : r1
        const quoteAmt = Number(quoteIdx === 0 ? t.reserve0 : t.reserve1)
        const quoteUsd = quoteIdx === 0 ? r0 : r1
        const baseUsdPrice = baseAmt > 0 ? baseUsd / baseAmt : NaN
        const quoteUsdPrice = quoteAmt > 0 ? quoteUsd / quoteAmt : NaN
        const price0 = quoteUsdPrice > 0 ? baseUsdPrice / quoteUsdPrice : NaN
        return { t: Number(t.timestamp), pct0, pct1, price0 }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.pct0))
    // Step-attach LP-vs-BH: both arrays are ascending, so walk a pointer.
    let di = 0
    let last: number | null = null
    return base.map((p) => {
      while (di < dailyLpBh.length && dailyLpBh[di].t <= p.t) last = dailyLpBh[di++].lpVsBh
      return { ...p, lpVsBh: last }
    })
  }, [combinedTxs, dailyLpBh, baseIdx, quoteIdx])

  // De-duplicate timestamps (lightweight-charts requires strictly-ascending,
  // unique time values; two trades can share a second). Keep the latest reserve
  // snapshot for a given second by overwriting as we walk ascending.
  //
  // The chart always holds the FULL accumulated set — the timeframe selector is a
  // zoom preset (visible TIME range), not a data filter, so every range can
  // scroll left and trigger load-more.
  const seriesData = useMemo(() => {
    const byTime = new Map<number, Point>()
    allPoints.forEach((p) => byTime.set(p.t, p))
    const sorted = [...byTime.values()].sort((a, b) => a.t - b.t)
    return {
      pct0: sorted.map((p) => ({ time: p.t as any, value: p.pct0 })),
      pct1: sorted.map((p) => ({ time: p.t as any, value: p.pct1 })),
      lpVsBh: sorted
        .filter((p) => p.lpVsBh != null && Number.isFinite(p.lpVsBh))
        .map((p) => ({ time: p.t as any, value: p.lpVsBh as number })),
      price0: sorted
        .filter((p) => Number.isFinite(p.price0))
        .map((p) => ({ time: p.t as any, value: p.price0 })),
    }
  }, [allPoints])

  // The "now" split is always the latest trade, independent of the timeframe.
  const latest = allPoints[allPoints.length - 1]
  const nowPct0 = latest ? latest.pct0 : null
  // Legend items — base first (display order); each keeps its raw color + a
  // toggle key. LP vs BH appended when available.
  const legendItems: { key: ToggleKey; label: string; color: string }[] =
    nowPct0 == null
      ? []
      : [
          ...(reversed
            ? [
                { key: 't1' as const, label: symbol1, color: token1Color },
                { key: 't0' as const, label: symbol0, color: token0Color },
              ]
            : [
                { key: 't0' as const, label: symbol0, color: token0Color },
                { key: 't1' as const, label: symbol1, color: token1Color },
              ]),
          ...(showLpVsBh && latest?.lpVsBh != null ? [{ key: 'lpbh' as const, label: 'LP vs BH', color: COLOR_LPBH }] : []),
          ...(latest && Number.isFinite(latest.price0)
            ? [{ key: 'price0' as const, label: `${baseSymbol}/${quoteSymbol}`, color: COLOR_PRICE0 }]
            : []),
        ]

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  // The token0 % BaselineSeries (drives the dominant-token shading).
  const baseSeriesRef = useRef<ISeriesApi<'Baseline'> | null>(null)
  // The thin token1 % LineSeries.
  const line1Ref = useRef<ISeriesApi<'Line'> | null>(null)
  // The green LP-vs-BH LineSeries (right scale).
  const lpbhRef = useRef<ISeriesApi<'Line'> | null>(null)
  // The base-token USD-price AreaSeries (backmost, own isolated 'price' overlay scale).
  const price0Ref = useRef<ISeriesApi<'Area'> | null>(null)

  // Hovered values for the floating tooltip (set while the crosshair moves).
  const [hovered, setHovered] = useState<{ pct0?: number; pct1?: number; lpVsBh?: number; price0?: number } | null>(null)
  // Floating tooltip anchor — container-relative pixels + the hovered time.
  // null when the cursor is outside the plot area. Mirrors PairChartTV's `tip`.
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

  // Latest `loadMore`, read from the once-created chart subscription.
  const loadMoreRef = useRef<() => void>(() => {})

  // Apply the current timeframe as a VISIBLE-RANGE (zoom) preset — the chart
  // always holds the full data, so this only changes what's on screen. 'ALL' =
  // fit everything; bounded ranges = the last N seconds up to the newest point.
  // If the data doesn't reach `from`, lightweight-charts clamps to the data start.
  const applyRangePreset = useCallback(() => {
    const ts = chartRef.current?.timeScale()
    if (!ts) return
    const span = RANGES[range]
    const last = seriesData.pct0.length ? (seriesData.pct0[seriesData.pct0.length - 1].time as number) : null
    if (span == null || last == null) {
      ts.fitContent()
      return
    }
    ts.setVisibleRange({ from: (last - span) as Time, to: last as Time })
  }, [range, seriesData])
  // Stable handle so the data-push effect can apply the preset without taking
  // `applyRangePreset` as a dependency (which would re-fire it on every range tick).
  const applyRangePresetRef = useRef(applyRangePreset)
  applyRangePresetRef.current = applyRangePreset

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
      const res = (await graphqlFetcher({
        operationName: 'PoolBalancesOlder',
        query: withFirstActivityGte(GET_POOL_BALANCES_OLDER, 'timestamp', chainId, pairAddress),
        variables: { chainId, version, pair: pairAddress.toLowerCase(), before },
      })) as { transactions?: Txn[] } | null
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
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      rightPriceScale: {
        // Always shown: LP-vs-BH % when showLpVsBh, otherwise the base-token USD
        // price (the price series moves to this scale, with USD labels).
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#493E35',
        timeVisible: true,
        secondsVisible: false,
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

    const commonNoLabels = { lastValueVisible: false, priceLineVisible: false }

    // BACKMOST layer: base-token USD price as a subtle ambient AREA. Created FIRST
    // so lightweight-charts (which draws in creation order) renders it behind the
    // three data lines. Scale depends on showLpVsBh:
    //  - true  (beta): the hidden 'price' overlay — LP-vs-BH owns the right axis,
    //    so the price auto-scales independently with no edge axis of its own.
    //  - false (bera): the visible 'right' scale — its USD priceFormat then drives
    //    the right-axis labels (the price line is the only right-axis series).
    const priceScaleId = showLpVsBh ? 'price' : 'right'
    const price0 = chart.addSeries(AreaSeries, {
      ...commonNoLabels,
      priceScaleId,
      lineColor: COLOR_PRICE0,
      lineWidth: 1,
      topColor: 'rgba(236, 72, 153, 0.18)',
      bottomColor: 'rgba(236, 72, 153, 0.00)',
      priceFormat: { type: 'custom', formatter: (v: number) => formatRel(v), minMove: 0.00000001 },
    })
    // Give whichever scale the price ends up on a little vertical breathing room.
    price0.priceScale().applyOptions({ scaleMargins: { top: 0.15, bottom: 0.15 } })

    // Dominance FILL follows BASE/QUOTE color too: above-50% = token0's color,
    // below-50% = token1's color. When not reversed token0=gold/token1=blue → gold
    // above / blue below; when reversed those swap (token0=quote=blue above,
    // token1=base=gold below). So the fill PAIR swaps with `reversed` just like the
    // line colors.
    const topFillNear = reversed ? COLOR1_FILL_NEAR : COLOR0_FILL_NEAR
    const topFillFar = reversed ? COLOR1_FILL_FAR : COLOR0_FILL_FAR
    const bottomFillNear = reversed ? COLOR0_FILL_NEAR : COLOR1_FILL_NEAR
    const bottomFillFar = reversed ? COLOR0_FILL_FAR : COLOR1_FILL_FAR

    // LEFT scale — balance %. token0 % as a Baseline pinned at 50: ABOVE 50 fills
    // with token0's color (token0-heavy), BELOW 50 fills with token1's color. This
    // single series replaces recharts' two band Areas. The baseline's own line is
    // the token0 line. Created after the price area so it renders on top of it.
    const baseSeries = chart.addSeries(BaselineSeries, {
      ...commonNoLabels,
      priceScaleId: 'left',
      baseValue: { type: 'price', price: 50 },
      relativeGradient: false,
      // token0's LINE stays its own color on both sides of 50% (so the line is
      // solid across the midline); only the FILL is two-tone (token0 above /
      // token1 below).
      topLineColor: token0Color,
      topFillColor1: topFillNear,
      topFillColor2: topFillFar,
      bottomLineColor: token0Color,
      bottomFillColor1: bottomFillFar,
      bottomFillColor2: bottomFillNear,
      lineWidth: 1,
      priceFormat: { type: 'custom', formatter: (v: number) => `${v.toFixed(0)}%`, minMove: 1 },
      // Pin the left % scale to 0–100 (50% centered). Computed on every autoscale
      // pass, so it's timing-independent — no autoScale:false race that could
      // freeze an empty range before data arrives and push the lines off-screen.
      autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }),
    })
    baseSeries.createPriceLine({
      price: 50,
      color: '#493E35',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
      title: '',
    })

    // token1 % — thin line (token1's base/quote color) on the same left scale so
    // both token lines show.
    const line1 = chart.addSeries(LineSeries, {
      ...commonNoLabels,
      priceScaleId: 'left',
      color: token1Color,
      lineWidth: 1,
    })

    // RIGHT scale — LP vs BH % (green, autoscaled). Omitted entirely (along with
    // its right axis) when showLpVsBh is false.
    const lpbh = showLpVsBh
      ? chart.addSeries(LineSeries, {
          ...commonNoLabels,
          priceScaleId: 'right',
          color: COLOR_LPBH,
          lineWidth: 1,
          priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, minMove: 0.01 },
        })
      : null

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
      const p0 = param.seriesData.get(baseSeries) as { value?: number } | undefined
      const p1 = param.seriesData.get(line1) as { value?: number } | undefined
      const pl = lpbh ? (param.seriesData.get(lpbh) as { value?: number } | undefined) : undefined
      const pp = param.seriesData.get(price0) as { value?: number } | undefined
      setHovered({
        pct0: typeof p0?.value === 'number' ? p0.value : undefined,
        pct1: typeof p1?.value === 'number' ? p1.value : undefined,
        lpVsBh: typeof pl?.value === 'number' ? pl.value : undefined,
        price0: typeof pp?.value === 'number' ? pp.value : undefined,
      })
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    // Scroll-to-load-more: when the left edge of the visible logical range nears
    // the start of the loaded data, page older txs. Fires on ANY timeframe — the
    // selector is now a zoom preset, not a data filter, so every range holds the
    // full set and can scroll past the loaded edge to extend it.
    const rangeChangeHandler = (logical: { from: number; to: number } | null) => {
      if (!logical) return
      if (logical.from < 10) loadMoreRef.current()
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeChangeHandler as any)

    baseSeriesRef.current = baseSeries
    line1Ref.current = line1
    lpbhRef.current = lpbh
    price0Ref.current = price0
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      baseSeriesRef.current = null
      line1Ref.current = null
      lpbhRef.current = null
      price0Ref.current = null
    }
  }, [showLpVsBh, reversed, token0Color, token1Color])

  // Push data into series. The left scale is pinned to 0–100 by the baseline's
  // autoscaleInfoProvider, so no scale juggling here — just fit the time axis.
  useEffect(() => {
    baseSeriesRef.current?.setData(seriesData.pct0)
    line1Ref.current?.setData(seriesData.pct1)
    lpbhRef.current?.setData(seriesData.lpVsBh)
    price0Ref.current?.setData(seriesData.price0)
    if (!seriesData.pct0.length) return
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
  }, [seriesData])

  // Re-zoom when the timeframe button changes (data unchanged).
  useEffect(() => {
    if (pendingRestoreRef.current) return
    applyRangePresetRef.current()
  }, [range])

  // Toggle visibility from the bottom legend.
  useEffect(() => {
    baseSeriesRef.current?.applyOptions({ visible: visible.t0 })
    line1Ref.current?.applyOptions({ visible: visible.t1 })
    lpbhRef.current?.applyOptions({ visible: visible.lpbh })
    price0Ref.current?.applyOptions({ visible: visible.price0 })
  }, [visible])

  return (
    <div>
      {/* Section title — sits OUTSIDE the chart card. */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>
          Pool Balance Over Time
        </div>
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
              Loading pool balance…
            </div>
          )}
          {!isLoading && allPoints.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}
            >
              No activity on this pool yet.
            </div>
          )}

          {/* Floating tooltip — TradingView style, anchored near the cursor and
              clamped inside the container. Mirrors PairChartTV's `tip` card. */}
          {tip && hovered && hovered.pct0 !== undefined && (() => {
            const containerW = containerRef.current?.clientWidth ?? 0
            const containerH = containerRef.current?.clientHeight ?? 0
            const TIP_W = 196
            const TIP_H_EST = 96
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
            const p0 = hovered.pct0 as number
            const p1 = hovered.pct1 !== undefined ? hovered.pct1 : 100 - p0
            // Each token keeps its own color; only row ORDER follows base/quote.
            const tokenRows = [
              { color: token0Color, label: symbol0, value: `${p0.toFixed(2)}%` },
              { color: token1Color, label: symbol1, value: `${p1.toFixed(2)}%` },
            ]
            const orderedRows = reversed ? [tokenRows[1], tokenRows[0]] : tokenRows
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
                <div style={{ color: '#978A80', marginBottom: 6 }}>{dateStr}</div>
                {orderedRows.map((row) => (
                  <div
                    key={row.label}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 16, lineHeight: '18px' }}
                  >
                    <span style={{ color: row.color }}>{row.label}</span>
                    <span style={{ color: '#FBFBFD' }}>{row.value}</span>
                  </div>
                ))}
                {hovered.lpVsBh !== undefined && (
                  <div
                    style={{
                      borderTop: '1px solid #2F2823',
                      marginTop: 6,
                      paddingTop: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <span style={{ color: COLOR_LPBH }}>LP vs BH</span>
                    <span style={{ color: '#FBFBFD' }}>
                      {hovered.lpVsBh >= 0 ? '+' : ''}
                      {hovered.lpVsBh.toFixed(2)}%
                    </span>
                  </div>
                )}
                {hovered.price0 !== undefined && (
                  <div
                    style={{
                      borderTop: '1px solid #2F2823',
                      marginTop: 6,
                      paddingTop: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <span style={{ color: COLOR_PRICE0 }}>{baseSymbol}/{quoteSymbol}</span>
                    <span style={{ color: '#FBFBFD' }}>{formatRel(hovered.price0)}</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Legend + per-series toggles (bottom, like the LP chart) — click to show/hide */}
        {legendItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3">
            {legendItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                style={{ background: 'transparent', border: 'none', padding: 0, opacity: visible[item.key] ? 1 : 0.4 }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: 'inline-block' }} />
                <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#FBFBFD' }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
