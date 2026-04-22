import { Pair } from '@brownfi/sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { isMainnet } from 'connectors'
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
}

type SeriesKey = 'lpPrice' | 'bnhPrice' | 'tvl' | 'netPnL' | 'volume'

type SeriesMeta = {
  key: SeriesKey
  label: string
  color: string
  type: 'line' | 'area' | 'histogram'
  priceScaleId: string
  yAxis: 'left' | 'right' | 'hidden'
}

// LP+HODL share the right y-axis (same unit: token price).
// TVL+PnL share the left y-axis (same unit: USD).
// Volume occupies the bottom 20% as an overlay histogram.
// Colors pulled from the BrownFi palette (warm brown/gold + accents).
const SERIES_ALL: SeriesMeta[] = [
  { key: 'lpPrice',  label: 'LP Price',   color: '#D8A072', type: 'line',      priceScaleId: 'right',  yAxis: 'right' },
  { key: 'bnhPrice', label: 'HODL Price', color: '#6FB3E6', type: 'line',      priceScaleId: 'right',  yAxis: 'right' },
  { key: 'tvl',      label: 'TVL',        color: '#B47AAE', type: 'line',      priceScaleId: 'left',   yAxis: 'left'  },
  { key: 'netPnL',   label: 'Net PnL',    color: '#E57373', type: 'line',      priceScaleId: 'left',   yAxis: 'left'  },
  { key: 'volume',   label: 'Volume',     color: '#83CF84', type: 'histogram', priceScaleId: 'volume', yAxis: 'hidden' },
]

type Props = {
  pair: Pair
}

const PairChartTVInner = ({ pair }: Props) => {
  const showExtendedMetrics = !isMainnet
  const availableSeries = useMemo(
    () => (showExtendedMetrics ? SERIES_ALL : SERIES_ALL.filter((s) => s.key === 'lpPrice' || s.key === 'volume')),
    [showExtendedMetrics],
  )

  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>(() => ({
    lpPrice: true,
    bnhPrice: showExtendedMetrics,
    tvl: showExtendedMetrics,
    netPnL: showExtendedMetrics,
    volume: true,
  }))

  type Range = '7d' | '1m' | '3m' | '1y' | 'all'
  const RANGE_DAYS: Record<Range, number | null> = { '7d': 7, '1m': 30, '3m': 90, '1y': 365, all: null }
  const [range, setRange] = useState<Range>('1m')

  const iskHYPEUSDT = pair.liquidityToken.address === '0xBb78f5ad054CAC4274813b6A4BBcC47D75a18BC3'

  const { data, isPending } = useQuery<{ pairDayDatas: DayData[] }>({
    queryKey: ['pairStats', pair.chainId, pair.liquidityToken.address],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairStats',
        query: GET_PAIR_STATS,
        variables: { chainId: pair.chainId, pair: pair.liquidityToken.address.toLowerCase() },
      }),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  const fullChartData = useMemo(() => {
    if (!data?.pairDayDatas) return []
    return data.pairDayDatas.map((d) => {
      const lpRaw = Number(d.lpPrice) || 0
      const bnhRaw = Number(d.bnhPrice) || 0
      const tvlRaw = Number(d.tvl) || 0
      const volRaw = Number(d.totalVolume) || 0
      return {
        time: Number(d.dayStartUnix),
        lpPrice: iskHYPEUSDT ? lpRaw / 1e9 : lpRaw,
        bnhPrice: iskHYPEUSDT ? bnhRaw / 1e9 : bnhRaw,
        tvl: tvlRaw,
        netPnL: tvlRaw - (bnhRaw * tvlRaw) / (lpRaw || 1),
        volume: volRaw,
      }
    })
  }, [data, iskHYPEUSDT])

  const chartData = useMemo(() => {
    const days = RANGE_DAYS[range]
    if (!days || fullChartData.length <= days) return fullChartData
    return fullChartData.slice(-days)
  }, [fullChartData, range])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRefs = useRef<Partial<Record<SeriesKey, ISeriesApi<any>>>>({})
  const [hovered, setHovered] = useState<Partial<Record<SeriesKey, number>> | null>(null)

  // Create chart once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
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
        vertLine: { color: '#978A80', style: LineStyle.Dashed, labelBackgroundColor: '#985C2A' },
        horzLine: { color: '#978A80', style: LineStyle.Dashed, labelBackgroundColor: '#985C2A' },
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
          priceFormat: { type: 'volume' },
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
          lineWidth: 2,
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

    // Live-update legend as the user hovers the chart
    const crosshairHandler = (param: {
      seriesData: Map<ISeriesApi<any>, { value?: number } | undefined>
      point?: { x: number; y: number }
    }) => {
      if (!param.point) {
        setHovered(null)
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
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRefs.current = {}
    }
  }, [availableSeries])

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
          ...(meta.key === 'volume' ? { color: '#83CF8488' } : {}),
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

  const last = chartData[chartData.length - 1]
  const getLegendValue = (key: SeriesKey) => {
    if (hovered && hovered[key] !== undefined) return hovered[key] as number
    return last ? (last[key] as number) : undefined
  }

  return (
    <div
      className="p-[12px] sm:p-[16px]"
      style={{
        background: '#1E1915',
        border: '1px solid #2F2823',
        borderRadius: '16px',
      }}
    >
      
      {/* Range selector */}
      <div className="flex items-center justify-end mb-3">
        <div
          className="inline-flex items-center gap-0.5 sm:gap-1"
          style={{ background: '#2F2823', border: '1px solid #493E35', borderRadius: 10, padding: 2 }}
        >
          {(['7d', '1m', '3m', '1y', 'all'] as Range[]).map((r) => (
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
        className="h-[260px] sm:h-[320px] lg:h-[400px]"
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
            {visible[meta.key] && getLegendValue(meta.key) !== undefined && (
              <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#978A80' }}>
                {meta.key === 'volume'
                  ? formatPrice(getLegendValue(meta.key) ?? 0, { maximumFractionDigits: 0 })
                  : formatPrice(getLegendValue(meta.key) ?? 0, { maximumFractionDigits: isMainnet ? 2 : 5 })}
              </span>
            )}
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
