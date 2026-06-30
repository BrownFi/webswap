import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
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
    }
  }
`

const RANGES = { '1D': 86400, '7D': 7 * 86400, '1M': 30 * 86400, ALL: null } as const
type Range = keyof typeof RANGES
const RANGE_KEYS: Range[] = ['1D', '7D', '1M', 'ALL']

type Txn = {
  timestamp: number | string
  pythPrice0: number | string
  pythPrice1: number | string
  ammPriceRel: number | string
  adjPriceRel: number | string
}
type Point = { t: number; s: number } // s = oSpread in %

const COLOR = '#D8A072'

type Props = {
  pairAddress: string
  chainId: number
  version: number
}

export function PoolSpreadChart({ pairAddress, chainId, version }: Props) {
  const [range, setRange] = useState<Range>('ALL')

  const { data, isLoading } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['poolSpread', chainId, pairAddress, version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PoolSpread',
        query: GET_POOL_SPREAD,
        variables: { chainId, version, pair: pairAddress.toLowerCase() },
      }),
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  // oSpread per swap (× 100 for %), chronological (indexer returns newest-first).
  const allPoints = useMemo<Point[]>(() => {
    const txs = data?.transactions ?? []
    return [...txs]
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
        return { t: Number(t.timestamp), s }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.s))
  }, [data])

  const points = useMemo<Point[]>(() => {
    const span = RANGES[range]
    if (span == null) return allPoints
    // eslint-disable-next-line react-hooks/purity -- time-window filter; sub-second drift across renders is harmless
    const cutoff = Math.floor(Date.now() / 1000) - span
    return allPoints.filter((p) => p.t >= cutoff)
  }, [allPoints, range])

  // De-duplicate timestamps (lightweight-charts requires strictly-ascending,
  // unique time values; two swaps can share a second). Keep the latest spread
  // for a given second by overwriting as we walk ascending.
  const seriesData = useMemo(() => {
    const byTime = new Map<number, Point>()
    points.forEach((p) => byTime.set(p.t, p))
    return [...byTime.values()]
      .sort((a, b) => a.t - b.t)
      .map((p) => ({ time: p.t as any, value: p.s }))
  }, [points])

  // The "now" spread is always the latest swap, independent of the timeframe.
  const latest = allPoints[allPoints.length - 1]

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  // Floating tooltip anchor — container-relative pixels + the hovered time +
  // value. null when the cursor is outside the plot area.
  const [tip, setTip] = useState<{ x: number; y: number; time: number; value: number } | null>(null)

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
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      leftPriceScale: { visible: false },
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
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time), value: pt.value })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    seriesRef.current = series
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // Push data into the series.
  useEffect(() => {
    seriesRef.current?.setData(seriesData)
    if (seriesData.length) chartRef.current?.timeScale().fitContent()
  }, [seriesData])

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
          {allPoints.length > 0 && points.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}
            >
              No swaps in the last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : '30 days'}.
            </div>
          )}

          {/* Floating tooltip — TradingView style, anchored near the cursor and
              clamped inside the container (mirrors PoolBalanceChart's `tip` card). */}
          {tip && (() => {
            const containerW = containerRef.current?.clientWidth ?? 0
            const containerH = containerRef.current?.clientHeight ?? 0
            const TIP_W = 168
            const TIP_H_EST = 60
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
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
