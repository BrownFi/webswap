import { Pair, isV3Like } from '@brownfi/sdk'
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  LineStyle,
  TickMarkType,
  Time,
  createChart,
} from 'lightweight-charts'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { formatPrice } from 'utils/prices'
import { graphqlFetcher } from 'utils/graphql'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'
import { InfoTooltip } from 'components/pool/AnnualizedReturnInfo'
import { RANGE_BUCKETS, RANGE_KEYS, RangeKey, bucketGrid, bucketClose } from './chartTimeBuckets'
import { hasChartRepricing, hasUniV2Price } from './usePairTransactions'
import { AggPoint, AggRow, buildOverrideResolver, rowToPoint } from './chartRepricing'
import { useTokenPriceHistory } from './useTokenPriceHistory'

// LP chart (Pool Detail). Four lines only, per boss (2026-07-16):
//   • Relative Price  — BASE priced in QUOTE (e.g. WBERA/HONEY), RIGHT axis
//   • LP vs. HODL     — LP's % outperformance over BH3 buy&hold, LEFT % axis
//   • LP vs. UniV2    — LP's % outperformance over the UniV2 benchmark, LEFT % axis
//   • Volume          — per-bucket USD volume histogram, bottom
//
// EVERY series now comes from pairHour/DayData (bucketGrid + bucketClose +
// setVisibleRange zoom). Relative price and Volume used to be derived per swap from
// the `transactions` entity, which meant paging up to 20k rows to draw one chart
// while the per-swap detail was discarded by the bucketing anyway. The aggregate
// carries the same quantities per bucket, so the chart costs two requests. Note the
// granularity floor that follows from this: bars are clamped to >= 1 hour.
//
// The two % benchmark lines (LP vs. HODL / LP vs. UniV2) are computed from the
// reserve-based TVL math on pairDay/HourData — NOT the old per-swap price ratio.
// The price ratio (lpPrice/benchmarkPrice − 1) is only valid when the LP and
// benchmark token SUPPLIES match; for UniV2 they don't, so the ratio mis-states
// outperformance. The correct measure compares $ VALUES:
// (tvl − benchmarkValue)/benchmarkValue, where
//   bnhVal = bnhReserve0·token0Price + bnhReserve1·token1Price   (LP vs. HODL — the
//            SAME buy-and-hold benchmark the Pool Balance + Oracle Spread charts use)
//   uniVal = uniV2Reserve0·token0Price + uniV2Reserve1·token1Price   (LP vs. UniV2)
// Those reserve + price fields live ONLY on pairDay/HourData (the tx entity lacks
// them), so the % lines source the aggregate. 1D/7D/1M read hourly buckets (retained
// back to pool creation, ≤1000 pts within 30d); ALL reads daily — so only 1D's
// granularity changes (15-min → hourly); 7D/1M/ALL keep their resolution.

// AggRow/AggPoint and the row -> point reading live in chartRepricing.ts, which also
// handles valuing a quiet pool's rows at an off-chain price.
type ToggleKey = 'price0' | 'lpPrice' | 'lpVsHodl' | 'lpVsUniV2' | 'volume'

const COLOR_PRICE = '#EC4899' // relative price (pink) — matches Pool Balance's price line
const COLOR_LP_PRICE = '#D8A072'
const COLOR_HODL = '#83CF84' // LP vs. HODL (green)
const COLOR_UNIV2 = '#22D3EE' // LP vs. UniV2 (cyan)
const COLOR_VOLUME = '#16A34A' // volume (deep green histogram)

// Bars can never be finer than the data, and pairHour/DayData is hourly.
const AGG_BUCKET_FLOOR = 60 * 60

// Relative-price formatter (no $/%): base priced in the quote token, adaptive
// decimals. Mirrors the Pool Balance chart's formatRel.
const formatRel = (v: number): string => {
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs === 0) return '0'
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8
  return `${sign}${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits })}`
}
const formatPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`

const LEARN_MORE_URL = 'https://brownfi.gitbook.io/brownfi-docs/brownfi-v3/benchmark'
const BENCHMARK_HINT =
  "The UniV2 constant-product curve serves as the benchmark for measuring BrownFi pool performance. The LP line should sit above the UniV2 line, with the gap widening over time, reflecting BrownFi V3's lower IL and higher fee yield compared to UniV2."

type Props = {
  pair: Pair
  // Base/quote signal (= shouldReverseDisplay) — drives which token is priced in
  // which for the relative-price line + its label. Matches the Pool Balance chart.
  reversed?: boolean
  symbol0?: string
  symbol1?: string
  // Token addresses in the INDEXER's token0/token1 order — see PoolBalanceChart for
  // why the SDK pair's own (sorted) order must not be assumed to match.
  token0Address?: string
  token1Address?: string
}

const PairChartTVInner = ({ pair, reversed = false, symbol0, symbol1, token0Address, token1Address }: Props) => {
  const chainId = pair.chainId
  const version = pair.version
  const pairAddress = pair.liquidityToken.address
  const isV3 = isV3Like(version)
  const supportsUniV2 = hasUniV2Price(chainId)
  const keepUniV2 = supportsUniV2 && isV3

  // BASE priced in QUOTE; base/quote from `reversed` (single source of truth).
  const baseIdx = reversed ? 1 : 0
  const sym0 = symbol0 ?? pair.token0.symbol ?? '?'
  const sym1 = symbol1 ?? pair.token1.symbol ?? '?'
  const baseSymbol = baseIdx === 0 ? sym0 : sym1
  const quoteSymbol = baseIdx === 0 ? sym1 : sym0
  const relPriceLabel = `${baseSymbol}/${quoteSymbol}`
  const iskHYPEUSDT = pairAddress === '0xBb78f5ad054CAC4274813b6A4BBcC47D75a18BC3'

  const [range, setRange] = useState<RangeKey>('7D')
  const [visible, setVisible] = useState<Record<ToggleKey, boolean>>({
    price0: true,
    lpPrice: true,
    lpVsHodl: true,
    lpVsUniV2: true,
    volume: true,
  })

  // No tx feed any more: price and volume used to be derived per swap, which meant
  // paging `transactions` 1000 at a time (up to 20k rows) just to draw this chart.
  // pairHour/DayData carries the same quantities per bucket, and the chart already
  // resampled everything onto a bucket grid, so the per-swap detail was discarded
  // anyway. Costs one aggregate request per tier instead.

  // ── Benchmark % lines (LP vs. HODL / LP vs. UniV2) from reserve-based TVL math ──
  // Sourced from the aggregate (the tx entity lacks tvl + benchmark reserves). Fetch
  // BOTH tiers, range-independent (stable query keys, no refetch on range switch):
  //   • hourly (pairHourDatas) → fine resolution for the recent ~41d (≤1000 pts);
  //   • daily  (pairDayDatas)  → full pool history (≤1000 days).
  // They're merged (daily for the old part, hourly for the recent part) so the %
  // lines cover the WHOLE range the tx feed can scroll-load back to — otherwise a
  // single hourly query capped the lines at ~41d and they stopped extending on
  // scroll while price/volume kept loading older.
  const uniAggFields = keepUniV2 ? '\n            uniV2Reserve0\n            uniV2Reserve1' : ''
  // A stale row can only be re-priced with its OWN liquidity, so the re-pricing
  // chains need the per-row reserves. Requested per chain because the field only
  // exists where the indexer ships the wider schema — asking elsewhere fails the
  // whole query with `Type 'PairHourData' has no field 'reserve0'`.
  const reserveAggFields = hasChartRepricing(chainId) ? '\n            reserve0\n            reserve1' : ''
  const makeAggQuery = (entity: string, timeKey: 'hourStartUnix' | 'dayStartUnix') =>
    withFirstActivityGte(
      `query PairBenchAgg($pair: String!) {
        rows: ${entity}(first: 1000, orderBy: ${timeKey}, orderDirection: desc, where: { pair: $pair }) {
          t: ${timeKey}
          tvl
          totalVolume
          lpPrice
          bnhReserve0
          bnhReserve1
          token0Price
          token1Price${uniAggFields}${reserveAggFields}
        }
      }`,
      timeKey,
      chainId,
      pairAddress,
    )
  const aggQueryFn = (entity: string, timeKey: 'hourStartUnix' | 'dayStartUnix') => () =>
    graphqlFetcher({
      operationName: 'PairBenchAgg',
      query: makeAggQuery(entity, timeKey),
      variables: { chainId, version, pair: pairAddress.toLowerCase() },
    })
  const { data: hourResp, isLoading: hourLoading, dataUpdatedAt: hourUpdatedAt } = useQuery<{ rows: AggRow[] }>({
    queryKey: ['pairBenchAggHour', chainId, pairAddress, version, keepUniV2],
    queryFn: aggQueryFn('pairHourDatas', 'hourStartUnix'),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
  const { data: dayResp, isLoading: dayLoading } = useQuery<{ rows: AggRow[] }>({
    queryKey: ['pairBenchAggDay', chainId, pairAddress, version, keepUniV2],
    queryFn: aggQueryFn('pairDayDatas', 'dayStartUnix'),
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  // ── Re-pricing frozen buckets ──────────────────────────────────────────────
  // A bucket without volume carries the last swap's price, so its lines sit still
  // even while the market moves. See chartRepricing.ts — this covers interior gaps,
  // not just the stretch after the pool's last trade.
  const earliestHourT = useMemo(() => {
    const ts = (hourResp?.rows ?? []).map((r) => Number(r.t)).filter(Number.isFinite)
    return ts.length ? Math.min(...ts) : null
  }, [hourResp])
  // Wall-clock "now" from the query's own fetch stamp rather than Date.now(): it
  // refreshes with the 60s refetch, and reading it keeps render pure.
  const nowSec = Math.floor(hourUpdatedAt / 1000)
  const priceHistory = useTokenPriceHistory({
    chainId,
    token0Address: token0Address ?? pair.token0.address,
    token1Address: token1Address ?? pair.token1.address,
    // Cover the whole hourly window the chart can show, not just the trailing gap.
    spanSeconds: earliestHourT != null ? nowSec - earliestHourT : 0,
    enabled: hasChartRepricing(chainId) && earliestHourT != null,
  })

  const aggPoints = useMemo<AggPoint[]>(() => {
    // Anchors are per tier, so a daily row is valued against daily anchors and an
    // hourly row against hourly ones — never mixed.
    const asc = (rows: AggRow[] | undefined) => {
      const list = rows ?? []
      const resolve = priceHistory ? buildOverrideResolver(list, priceHistory.at0, priceHistory.at1) : null
      return list
        .map((row) =>
          rowToPoint({
            row,
            baseIdx,
            keepUniV2,
            scaleLpPriceDown: iskHYPEUSDT,
            // A bucket that traded is already priced by the chain — leave it.
            override: resolve && !(Number(row.totalVolume) > 0) ? resolve(Number(row.t)) : null,
          }),
        )
        .filter((p) => Number.isFinite(p.t))
        .sort((a, b) => a.t - b.t)
    }
    const hourly = asc(hourResp?.rows)
    const daily = asc(dayResp?.rows)
    // Daily for the old part (before the hourly window begins) + hourly for the
    // recent part → full-history coverage with fine recent resolution, no overlap.
    const earliestHourly = hourly.length ? hourly[0].t : Infinity
    return [...daily.filter((d) => d.t < earliestHourly), ...hourly]
  }, [hourResp, dayResp, keepUniV2, baseIdx, iskHYPEUSDT, priceHistory])

  const isLoading = hourLoading || dayLoading

  // Price/LP-price/volume share one source with the % lines, so the former
  // "tx points" are simply the aggregate points.
  const allPoints = aggPoints

  // Resample onto a linear time grid (bucketClose = carry-forward close, so lines
  // stay continuous across quiet buckets).
  // Bars can never be finer than the data. pairHourData is hourly, so the shared
  // 1D preset's 15-minute bars left 3 of every 4 buckets empty and the carry-forward
  // turned the lines into visible stair-steps. Clamp to the source granularity —
  // 1D becomes 24 hourly bars. The shared RANGE_BUCKETS stays as-is because Pool
  // Balance still reads the per-swap tx feed, where 15-minute bars are real.
  const bucket = Math.max(RANGE_BUCKETS[range].bucket, AGG_BUCKET_FLOOR)
  // Seed from the first bucket with real activity, NOT allPoints[0]: pairHour/DayData
  // has buckets from pool CREATION, which can predate the first trade, and seeding
  // there would stretch every line left into a flat dead zone. A bucket counts as
  // active once it has volume or a benchmark value (benchmark reserves only exist
  // once the pool has liquidity).
  const firstActiveT = useMemo(() => {
    const first = allPoints.find((p) => p.vol > 0 || p.lpVsHodl != null)
    return first ? first.t : allPoints.length ? allPoints[0].t : null
  }, [allPoints])
  const grid = useMemo(
    () => bucketGrid(firstActiveT, bucket, Math.floor(Date.now() / 1000)),
    [firstActiveT, bucket],
  )
  const seriesData = useMemo(() => {
    if (!grid) return { price0: [], lpPrice: [], lpVsHodl: [], lpVsUniV2: [], volume: [] as { time: any; value: number; color: string }[] }
    const txClosed = bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd)
    const lpClosed = bucketClose(
      allPoints.filter((p) => Number.isFinite(p.lpPrice)),
      bucket,
      grid.gridStart,
      grid.gridEnd,
    )
    const aggClosed = bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd)
    // Aggregate rows are already per-bucket sums. They still need summing when the
    // chart bucket is COARSER than the source bucket (e.g. a 1d chart bucket over
    // hourly rows), which is exactly what this accumulate does.
    const volMap = new Map<number, number>()
    for (const p of allPoints) {
      if (!(p.vol > 0)) continue
      const b = Math.floor(p.t / bucket) * bucket
      if (b < grid.gridStart || b > grid.gridEnd) continue
      volMap.set(b, (volMap.get(b) ?? 0) + p.vol)
    }
    return {
      price0: txClosed
        .filter((p) => Number.isFinite(p.price0))
        .map((p) => ({ time: p.t as any, value: p.price0 })),
      lpPrice: lpClosed
        .filter((p) => Number.isFinite(p.lpPrice))
        .map((p) => ({ time: p.t as any, value: p.lpPrice as number })),
      lpVsHodl: aggClosed
        .filter((p) => p.lpVsHodl != null && Number.isFinite(p.lpVsHodl))
        .map((p) => ({ time: p.t as any, value: p.lpVsHodl as number })),
      lpVsUniV2: aggClosed
        .filter((p) => p.lpVsUniV2 != null && Number.isFinite(p.lpVsUniV2))
        .map((p) => ({ time: p.t as any, value: p.lpVsUniV2 as number })),
      volume: [...volMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([t, v]) => ({ time: t as any, value: v, color: `${COLOR_VOLUME}88` })),
    }
  }, [allPoints, bucket, grid])

  const hasData = allPoints.length > 0
  const latest = allPoints[allPoints.length - 1]
  const legendItems: { key: ToggleKey; label: string; color: string }[] = !hasData
    ? []
    : [
        ...(latest && Number.isFinite(latest.price0) ? [{ key: 'price0' as const, label: relPriceLabel, color: COLOR_PRICE }] : []),
        ...(seriesData.lpPrice.length ? [{ key: 'lpPrice' as const, label: 'LP Price', color: COLOR_LP_PRICE }] : []),
        { key: 'lpVsHodl' as const, label: 'LP vs. HODL', color: COLOR_HODL },
        ...(keepUniV2 ? [{ key: 'lpVsUniV2' as const, label: 'LP vs. UniV2', color: COLOR_UNIV2 }] : []),
        { key: 'volume' as const, label: 'Volume', color: COLOR_VOLUME },
      ]

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const price0Ref = useRef<ISeriesApi<'Area'> | null>(null)
  const lpPriceRef = useRef<ISeriesApi<'Line'> | null>(null)
  const lpVsHodlRef = useRef<ISeriesApi<'Line'> | null>(null)
  const lpVsUniV2Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const [hovered, setHovered] = useState<Partial<Record<ToggleKey, number>> | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

  // Apply the timeframe as a VISIBLE-RANGE (zoom) preset — the chart always holds
  // the full loaded data. 'ALL' = fit everything; bounded ranges = the last N
  // seconds up to the newest point (lightweight-charts clamps to data start).
  const applyRangePreset = useCallback(() => {
    const ts = chartRef.current?.timeScale()
    if (!ts) return
    const span = RANGE_BUCKETS[range].span
    const last = seriesData.price0.length ? (seriesData.price0[seriesData.price0.length - 1].time as number) : null
    if (span == null || last == null) {
      ts.fitContent()
      return
    }
    ts.setVisibleRange({ from: (last - span) as Time, to: last as Time })
  }, [range, seriesData])
  const applyRangePresetRef = useRef(applyRangePreset)
  applyRangePresetRef.current = applyRangePreset

  // Create chart + series once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
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
        // LEFT = the ROI % lines.
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      rightPriceScale: {
        // RIGHT = relative price.
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.22 },
      },
      timeScale: {
        borderColor: '#493E35',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: any, tickMarkType: TickMarkType) => {
          const d = new Date(Number(time) * 1000)
          switch (tickMarkType) {
            case TickMarkType.Year:
              return d.toLocaleDateString(undefined, { year: 'numeric' })
            case TickMarkType.Month:
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
      height: container.clientHeight || 320,
      autoSize: true,
    })

    const commonNoLabels = { lastValueVisible: false, priceLineVisible: false }

    // Relative price — RIGHT axis, drawn as a subtle pink AREA (matches the Pool
    // Balance chart's price line). Created FIRST so it renders behind the % lines.
    const price0 = chart.addSeries(AreaSeries, {
      ...commonNoLabels,
      priceScaleId: 'right',
      lineColor: COLOR_PRICE,
      lineWidth: 1,
      topColor: 'rgba(236, 72, 153, 0.18)',
      bottomColor: 'rgba(236, 72, 153, 0.00)',
      priceFormat: { type: 'custom', formatter: (v: number) => formatRel(v), minMove: 0.00000001 },
    })
    price0.priceScale().applyOptions({ scaleMargins: { top: 0.15, bottom: 0.15 } })
    // LP Price — separate right-side overlay scale because it is denominated in
    // LP-token USD value, unlike the relative token price above.
    const lpPrice = chart.addSeries(LineSeries, {
      ...commonNoLabels,
      priceScaleId: 'lpPrice',
      color: COLOR_LP_PRICE,
      lineWidth: 1,
      priceFormat: { type: 'custom', formatter: (v: number) => formatPrice(v, { maximumFractionDigits: 4 }), minMove: 0.0001 },
    })
    lpPrice.priceScale().applyOptions({ scaleMargins: { top: 0.15, bottom: 0.15 } })
    // LP vs. HODL — LEFT % axis.
    const lpVsHodl = chart.addSeries(LineSeries, {
      ...commonNoLabels,
      priceScaleId: 'left',
      color: COLOR_HODL,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, minMove: 0.01 },
    })
    // LP vs. UniV2 — LEFT % axis (omitted when the chain lacks uniV2Price).
    const lpVsUniV2 = keepUniV2
      ? chart.addSeries(LineSeries, {
          ...commonNoLabels,
          priceScaleId: 'left',
          color: COLOR_UNIV2,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          priceFormat: { type: 'custom', formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, minMove: 0.01 },
        })
      : null
    // Volume — bottom 20%.
    const volume = chart.addSeries(HistogramSeries, {
      ...commonNoLabels,
      priceScaleId: 'volume',
      color: COLOR_VOLUME,
      priceFormat: { type: 'volume' },
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

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
      const read = (s: ISeriesApi<any> | null) => {
        if (!s) return undefined
        const p = param.seriesData.get(s) as { value?: number } | undefined
        return typeof p?.value === 'number' ? p.value : undefined
      }
      setHovered({
        price0: read(price0),
        lpPrice: read(lpPrice),
        lpVsHodl: read(lpVsHodl),
        lpVsUniV2: read(lpVsUniV2),
        volume: read(volume),
      })
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    // No scroll-to-load-more: the hourly + daily tiers already cover the pool's
    // whole history in the one fetch, so there is nothing left to page in.

    price0Ref.current = price0
    lpPriceRef.current = lpPrice
    lpVsHodlRef.current = lpVsHodl
    lpVsUniV2Ref.current = lpVsUniV2
    volumeRef.current = volume
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      price0Ref.current = null
      lpPriceRef.current = null
      lpVsHodlRef.current = null
      lpVsUniV2Ref.current = null
      volumeRef.current = null
    }
  }, [keepUniV2])

  // Push data into series + manage the visible range.
  //  • first data / timeframe change → zoom to the preset;
  //  • data GREW (load-more — possibly triggered by the shared Pool Balance
  //    chart) → keep THIS chart's current window so older bars slide in off-screen
  //    instead of yanking the view.
  const prevLenRef = useRef(0)
  const lastRangeRef = useRef<RangeKey>(range)
  useEffect(() => {
    const ts = chartRef.current?.timeScale()
    const rangeChanged = lastRangeRef.current !== range
    const savedRange = ts?.getVisibleRange() ?? null
    price0Ref.current?.setData(seriesData.price0)
    lpPriceRef.current?.setData(seriesData.lpPrice)
    lpVsHodlRef.current?.setData(seriesData.lpVsHodl)
    lpVsUniV2Ref.current?.setData(seriesData.lpVsUniV2)
    volumeRef.current?.setData(seriesData.volume)
    const len = seriesData.price0.length
    if (len) {
      if (prevLenRef.current === 0 || rangeChanged) {
        applyRangePresetRef.current()
      } else if (len !== prevLenRef.current && savedRange) {
        ts?.setVisibleRange(savedRange)
      }
    }
    prevLenRef.current = len
    lastRangeRef.current = range
  }, [seriesData, range])

  // Toggle visibility from the bottom legend.
  useEffect(() => {
    price0Ref.current?.applyOptions({ visible: visible.price0 })
    lpPriceRef.current?.applyOptions({ visible: visible.lpPrice })
    lpVsHodlRef.current?.applyOptions({ visible: visible.lpVsHodl })
    lpVsUniV2Ref.current?.applyOptions({ visible: visible.lpVsUniV2 })
    volumeRef.current?.applyOptions({ visible: visible.volume })
  }, [visible])

  return (
    <div
      className="p-[12px] sm:p-[16px]"
      style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px' }}
    >
      {/* Range selector */}
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

      {/* Chart container */}
      <div className="h-[220px] sm:h-[260px] lg:h-[320px]" style={{ width: '100%', position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {isLoading && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#978A80', fontFamily: 'Inter' }}>
            Loading chart…
          </div>
        )}
        {!isLoading && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#978A80', fontFamily: 'Inter' }}>
            No activity on this pool yet.
          </div>
        )}

        {/* Floating tooltip — anchored diagonally near the cursor, flipping at edges. */}
        {tip && hovered && (() => {
          const containerW = containerRef.current?.clientWidth ?? 0
          const containerH = containerRef.current?.clientHeight ?? 0
          const TIP_W = 200
          const TIP_H_EST = 124
          const HGAP = 14
          const VGAP = 14
          const wantsRight = tip.x + HGAP + TIP_W <= containerW
          const left = wantsRight ? tip.x + HGAP : Math.max(8, tip.x - HGAP - TIP_W)
          const wantsAbove = tip.y - VGAP - TIP_H_EST >= 8
          const top = wantsAbove ? tip.y - VGAP - TIP_H_EST : Math.min(tip.y + VGAP, containerH - TIP_H_EST - 8)
          const date = new Date(tip.time * 1000)
          const dateStr = date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
          const rows: { key: ToggleKey; label: string; color: string; text: string }[] = []
          if (visible.price0 && hovered.price0 !== undefined) rows.push({ key: 'price0', label: relPriceLabel, color: COLOR_PRICE, text: formatRel(hovered.price0) })
          if (visible.lpPrice && hovered.lpPrice !== undefined) rows.push({ key: 'lpPrice', label: 'LP Price', color: COLOR_LP_PRICE, text: formatPrice(hovered.lpPrice, { maximumFractionDigits: 4 }) })
          if (visible.lpVsHodl && hovered.lpVsHodl !== undefined) rows.push({ key: 'lpVsHodl', label: 'LP vs. HODL', color: COLOR_HODL, text: formatPct(hovered.lpVsHodl) })
          if (keepUniV2 && visible.lpVsUniV2 && hovered.lpVsUniV2 !== undefined) rows.push({ key: 'lpVsUniV2', label: 'LP vs. UniV2', color: COLOR_UNIV2, text: formatPct(hovered.lpVsUniV2) })
          if (visible.volume && hovered.volume !== undefined) rows.push({ key: 'volume', label: 'Volume', color: COLOR_VOLUME, text: formatPrice(hovered.volume, { maximumFractionDigits: 0 }) })
          if (!rows.length) return null
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
              {rows.map((row) => (
                <div
                  key={row.key}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 11, lineHeight: '16px' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#CFC7C1' }}>
                    <span style={{ width: 7, height: 7, background: row.color, borderRadius: 2, display: 'inline-block' }} />
                    {row.label}
                  </span>
                  <span style={{ color: '#FBFBFD', fontWeight: 600 }}>{row.text}</span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Legend + toggles (bottom) */}
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
              <span style={{ width: 10, height: 10, background: item.color, borderRadius: 3, display: 'inline-block' }} />
              <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#FBFBFD' }}>
                {item.label}
              </span>
              {item.key === 'lpVsUniV2' && <InfoTooltip text={BENCHMARK_HINT} learnMoreUrl={LEARN_MORE_URL} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const PairChartTV = memo(PairChartTVInner, (prev, next) => {
  return (
    prev.pair.liquidityToken.address === next.pair.liquidityToken.address &&
    prev.pair.chainId === next.pair.chainId &&
    prev.reversed === next.reversed
  )
})
