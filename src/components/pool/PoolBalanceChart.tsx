import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  BaselineSeries,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineSeries,
  LineStyle,
  TickMarkType,
  createChart,
} from 'lightweight-charts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { graphqlFetcher } from 'utils/graphql'

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
// Colors stay tied to each RAW token (token0 → orange, token1 → blue); the
// `reversed` prop only flips DISPLAY ORDER of the legend rows so the base token
// lists first, matching the pool's base/quote display rule.
const GET_POOL_BALANCES = `
  query PoolBalances($pair: String) {
    transactions(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {
      timestamp
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

type Txn = { timestamp: number | string; reserve0USD: number | string; reserve1USD: number | string }
type DayRow = { dayStartUnix: number | string; lpPrice: number | string; bnhPrice: number | string }
// pct0/pct1 = each token's % of pool value; lpVsBh = LP-vs-buy&hold % (right
// axis), step-attached from daily data.
type Point = {
  t: number
  pct0: number
  pct1: number
  lpVsBh: number | null
}

const COLOR0 = '#D8A072' // token0 (app orange/tan)
const COLOR1 = '#4DA3FF' // token1 (blue)
const COLOR_LPBH = '#83CF84' // LP vs BH (green)

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
  // Pool base/quote display order (shouldReverseDisplay). When true the base is
  // raw token1, so list it first — colors stay attached to their raw token.
  reversed?: boolean
}

type ToggleKey = 't0' | 't1' | 'lpbh'

export function PoolBalanceChart({ pairAddress, chainId, version, symbol0, symbol1, reversed = false }: Props) {
  const [range, setRange] = useState<Range>('ALL')
  // Per-series visibility, toggled by the bottom legend (like PairChartTV).
  const [visible, setVisible] = useState<Record<ToggleKey, boolean>>({ t0: true, t1: true, lpbh: true })

  const { data, isLoading } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['poolBalances', chainId, pairAddress, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PoolBalances',
        query: GET_POOL_BALANCES,
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
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

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

  // Full fetched series as a % split, chronological (indexer returns newest-first).
  // Kept in RAW token order — colors/lines are tied to each raw token. Each point
  // also carries the LP-vs-BH value from the latest daily bucket ≤ its timestamp.
  const allPoints = useMemo<Point[]>(() => {
    const txs = data?.transactions ?? []
    const base = [...txs]
      .reverse()
      .map((t) => {
        const r0 = Number(t.reserve0USD)
        const r1 = Number(t.reserve1USD)
        const total = r0 + r1
        const pct0 = total > 0 ? (r0 / total) * 100 : NaN
        const pct1 = 100 - pct0
        return { t: Number(t.timestamp), pct0, pct1 }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.pct0))
    // Step-attach LP-vs-BH: both arrays are ascending, so walk a pointer.
    let di = 0
    let last: number | null = null
    return base.map((p) => {
      while (di < dailyLpBh.length && dailyLpBh[di].t <= p.t) last = dailyLpBh[di++].lpVsBh
      return { ...p, lpVsBh: last }
    })
  }, [data, dailyLpBh])

  // Apply the selected timeframe (client-side).
  const points = useMemo<Point[]>(() => {
    const span = RANGES[range]
    if (span == null) return allPoints
    const cutoff = Math.floor(Date.now() / 1000) - span
    return allPoints.filter((p) => p.t >= cutoff)
  }, [allPoints, range])

  // De-duplicate timestamps (lightweight-charts requires strictly-ascending,
  // unique time values; two trades can share a second). Keep the latest reserve
  // snapshot for a given second by overwriting as we walk ascending.
  const seriesData = useMemo(() => {
    const byTime = new Map<number, Point>()
    points.forEach((p) => byTime.set(p.t, p))
    const sorted = [...byTime.values()].sort((a, b) => a.t - b.t)
    return {
      pct0: sorted.map((p) => ({ time: p.t as any, value: p.pct0 })),
      pct1: sorted.map((p) => ({ time: p.t as any, value: p.pct1 })),
      lpVsBh: sorted
        .filter((p) => p.lpVsBh != null && Number.isFinite(p.lpVsBh))
        .map((p) => ({ time: p.t as any, value: p.lpVsBh as number })),
    }
  }, [points])

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
                { key: 't1' as const, label: symbol1, color: COLOR1 },
                { key: 't0' as const, label: symbol0, color: COLOR0 },
              ]
            : [
                { key: 't0' as const, label: symbol0, color: COLOR0 },
                { key: 't1' as const, label: symbol1, color: COLOR1 },
              ]),
          ...(latest?.lpVsBh != null ? [{ key: 'lpbh' as const, label: 'LP vs BH', color: COLOR_LPBH }] : []),
        ]

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  // The token0 % BaselineSeries (drives the dominant-token shading).
  const baseSeriesRef = useRef<ISeriesApi<'Baseline'> | null>(null)
  // The thin token1 % LineSeries.
  const line1Ref = useRef<ISeriesApi<'Line'> | null>(null)
  // The green LP-vs-BH LineSeries (right scale).
  const lpbhRef = useRef<ISeriesApi<'Line'> | null>(null)

  // Hovered values for the floating tooltip (set while the crosshair moves).
  const [hovered, setHovered] = useState<{ pct0?: number; pct1?: number; lpVsBh?: number } | null>(null)
  // Floating tooltip anchor — container-relative pixels + the hovered time.
  // null when the cursor is outside the plot area. Mirrors PairChartTV's `tip`.
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

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
              return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
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

    // LEFT scale — balance %. token0 % as a Baseline pinned at 50: ABOVE 50 fills
    // orange (token0-heavy), BELOW 50 fills blue (token1-heavy). This single
    // series replaces recharts' two band Areas. The baseline's own line is the
    // token0 line.
    const baseSeries = chart.addSeries(BaselineSeries, {
      ...commonNoLabels,
      priceScaleId: 'left',
      baseValue: { type: 'price', price: 50 },
      relativeGradient: false,
      // token0's LINE stays orange on both sides of 50% (its own color); only the
      // FILL is two-tone — orange above 50% (token0-heavy) / blue below (token1-heavy).
      topLineColor: COLOR0,
      topFillColor1: COLOR0_FILL_NEAR,
      topFillColor2: COLOR0_FILL_FAR,
      bottomLineColor: COLOR0,
      bottomFillColor1: COLOR1_FILL_FAR,
      bottomFillColor2: COLOR1_FILL_NEAR,
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

    // token1 % — thin blue line on the same left scale so both token lines show.
    const line1 = chart.addSeries(LineSeries, {
      ...commonNoLabels,
      priceScaleId: 'left',
      color: COLOR1,
      lineWidth: 1,
    })

    // RIGHT scale — LP vs BH % (green, autoscaled).
    const lpbh = chart.addSeries(LineSeries, {
      ...commonNoLabels,
      priceScaleId: 'right',
      color: COLOR_LPBH,
      lineWidth: 1,
      priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, minMove: 0.01 },
    })

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
      const pl = param.seriesData.get(lpbh) as { value?: number } | undefined
      setHovered({
        pct0: typeof p0?.value === 'number' ? p0.value : undefined,
        pct1: typeof p1?.value === 'number' ? p1.value : undefined,
        lpVsBh: typeof pl?.value === 'number' ? pl.value : undefined,
      })
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    baseSeriesRef.current = baseSeries
    line1Ref.current = line1
    lpbhRef.current = lpbh
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      baseSeriesRef.current = null
      line1Ref.current = null
      lpbhRef.current = null
    }
  }, [])

  // Push data into series. The left scale is pinned to 0–100 by the baseline's
  // autoscaleInfoProvider, so no scale juggling here — just fit the time axis.
  useEffect(() => {
    baseSeriesRef.current?.setData(seriesData.pct0)
    line1Ref.current?.setData(seriesData.pct1)
    lpbhRef.current?.setData(seriesData.lpVsBh)
    if (seriesData.pct0.length) {
      chartRef.current?.timeScale().fitContent()
    }
  }, [seriesData])

  // Toggle visibility from the bottom legend.
  useEffect(() => {
    baseSeriesRef.current?.applyOptions({ visible: visible.t0 })
    line1Ref.current?.applyOptions({ visible: visible.t1 })
    lpbhRef.current?.applyOptions({ visible: visible.lpbh })
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
          {allPoints.length > 0 && points.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}
            >
              No trades in the last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : '30 days'}.
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
                ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            const p0 = hovered.pct0 as number
            const p1 = hovered.pct1 !== undefined ? hovered.pct1 : 100 - p0
            // Each token keeps its own color; only row ORDER follows base/quote.
            const tokenRows = [
              { color: COLOR0, label: symbol0, value: `${p0.toFixed(2)}%` },
              { color: COLOR1, label: symbol1, value: `${p1.toFixed(2)}%` },
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
