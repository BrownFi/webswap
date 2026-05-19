import { ChainId, Pair } from '@brownfi/sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { isMainnet, isV3Enabled } from 'connectors'
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  LineStyle,
  createChart,
} from 'lightweight-charts'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
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
const buildQuery = (template: string, chainId: number) =>
  hasUniV2Price(chainId) ? template : template.replace(/\s*uniV2Price\s*/g, '\n')

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

type SeriesKey = 'lpPrice' | 'bnhPrice' | 'uniV2Price' | 'tvl' | 'netPnL' | 'volume'

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
// 1px + dotted (LineStyle.Dotted) AND at ~20% opacity (alpha `33` ≈ 0.2)
// so they read as very faint references vs LP Price's default 2px solid.
// UniV2 uses red to distinguish it from HODL's blue.
//
// Net PnL and Volume are both green but in clearly different shades:
// Net PnL = #83CF84 (light pastel green, line) and Volume = #16A34A
// (deep saturated green, histogram). The hue distance + render-type
// difference keeps them visually separable on the same chart.
const SERIES_ALL: SeriesMeta[] = [
  { key: 'lpPrice',    label: 'LP Price',    color: '#D8A072',   type: 'line',      priceScaleId: 'right',  yAxis: 'right' },
  { key: 'bnhPrice',   label: 'HODL Price',  color: '#6FB3E633', type: 'line',      priceScaleId: 'right',  yAxis: 'right', lineWidth: 1, lineStyle: LineStyle.Dotted },
  { key: 'uniV2Price', label: 'UniV2 Price', color: '#E0484833', type: 'line',      priceScaleId: 'right',  yAxis: 'right', lineWidth: 1, lineStyle: LineStyle.Dotted },
  { key: 'tvl',        label: 'TVL',         color: '#B47AAE', type: 'line',      priceScaleId: 'left',   yAxis: 'left'  },
  { key: 'netPnL',     label: 'Net PnL',     color: '#83CF84', type: 'line',      priceScaleId: 'left',   yAxis: 'left'  },
  { key: 'volume',     label: 'Volume',      color: '#16A34A', type: 'histogram', priceScaleId: 'volume', yAxis: 'hidden' },
]

type Props = {
  pair: Pair
}

const PairChartTVInner = ({ pair }: Props) => {
  const showExtendedMetrics = !isMainnet
  const supportsUniV2 = hasUniV2Price(pair.chainId)
  const availableSeries = useMemo(() => {
    if (!showExtendedMetrics) return SERIES_ALL.filter((s) => s.key === 'lpPrice' || s.key === 'volume')
    return supportsUniV2 ? SERIES_ALL : SERIES_ALL.filter((s) => s.key !== 'uniV2Price')
  }, [showExtendedMetrics, supportsUniV2])

  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>(() => ({
    lpPrice: true,
    bnhPrice: showExtendedMetrics,
    uniV2Price: showExtendedMetrics,
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
        query: buildQuery(GET_PAIR_STATS, pair.chainId),
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
        query: buildQuery(GET_PAIR_STATS_HOUR, pair.chainId),
        variables: { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase() },
      }),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled: isHourly,
  })

  const isPending = isHourly ? isPendingHour : isPendingDay
  const data = isHourly ? hourResp : dayResp

  const fullChartData = useMemo(() => {
    const toPoint = (lpRaw: number, bnhRaw: number, uniRaw: number, tvlRaw: number, volRaw: number, time: number) => ({
      time,
      lpPrice: iskHYPEUSDT ? lpRaw / 1e9 : lpRaw,
      bnhPrice: iskHYPEUSDT ? bnhRaw / 1e9 : bnhRaw,
      uniV2Price: iskHYPEUSDT ? uniRaw / 1e9 : uniRaw,
      tvl: tvlRaw,
      netPnL: tvlRaw - (bnhRaw * tvlRaw) / (lpRaw || 1),
      volume: volRaw,
    })
    if (isHourly) {
      const rows = (data as { pairHourDatas?: HourData[] } | undefined)?.pairHourDatas
      if (!rows) return []
      // Hourly query is desc — flip to asc so the chart renders left→right.
      return [...rows]
        .sort((a, b) => Number(a.hourStartUnix) - Number(b.hourStartUnix))
        .map((d) => toPoint(Number(d.lpPrice) || 0, Number(d.bnhPrice) || 0, Number(d.uniV2Price) || 0, Number(d.tvl) || 0, Number(d.totalVolume) || 0, Number(d.hourStartUnix)))
    }
    const rows = (data as { pairDayDatas?: DayData[] } | undefined)?.pairDayDatas
    if (!rows) return []
    return rows.map((d) =>
      toPoint(Number(d.lpPrice) || 0, Number(d.bnhPrice) || 0, Number(d.uniV2Price) || 0, Number(d.tvl) || 0, Number(d.totalVolume) || 0, Number(d.dayStartUnix)),
    )
  }, [data, isHourly, iskHYPEUSDT])

  const chartData = useMemo(() => {
    if (isHourly) return fullChartData // already capped to 24 by the query
    const days = RANGE_DAYS[range as Exclude<Range, '1h'>]
    if (!days || fullChartData.length <= days) return fullChartData
    return fullChartData.slice(-days)
  }, [fullChartData, range, isHourly])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRefs = useRef<Partial<Record<SeriesKey, ISeriesApi<any>>>>({})
  const [hovered, setHovered] = useState<Partial<Record<SeriesKey, number>> | null>(null)
  // Floating tooltip state — anchor x/y in container-relative pixels.
  // null when cursor is outside the plot area.
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

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
      localization: { priceFormatter },
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
      const next: Partial<Record<SeriesKey, number>> = {}
      ;(Object.keys(seriesRefs.current) as SeriesKey[]).forEach((k) => {
        const s = seriesRefs.current[k]
        if (!s) return
        const point = param.seriesData.get(s) as { value?: number } | undefined
        if (point && typeof point.value === 'number') {
          next[k] = point.value
        }
      })
      setHovered(next)
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRefs.current = {}
    }
  }, [availableSeries])

  // Toggle x-axis time labels when switching between hourly and daily modes.
  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: { timeVisible: isHourly, secondsVisible: false },
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
      const mapped = chartData
        .map((p) => ({
          time: p.time as any,
          value: p[meta.key] as number,
          // Volume bars get a per-point color so we can fade them via alpha
          // independently of the series-level color. Derived from meta.color
          // + 88 alpha so changing the palette entry propagates here.
          ...(meta.key === 'volume' ? { color: `${meta.color}88` } : {}),
        }))
        .filter((p) => Number.isFinite(p.value))
      s.setData(mapped)
    })
    chartRef.current?.timeScale().fitContent()
  }, [chartData, availableSeries])

  // Toggle visibility
  useEffect(() => {
    const refs = seriesRefs.current
    availableSeries.forEach((meta) => {
      refs[meta.key]?.applyOptions({ visible: !!visible[meta.key] })
    })
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
                    meta.key === 'tvl' || meta.key === 'netPnL' || meta.key === 'volume'
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
            </div>
          )
        })()}
      </div>

      {/* Legend + toggles (bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3">
        {availableSeries.map((meta) => (
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
