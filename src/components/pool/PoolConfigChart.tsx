import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  ColorType,
  CrosshairMode,
  IChartApi,
  IRange,
  ISeriesApi,
  LineSeries,
  LineStyle,
  LineType,
  TickMarkType,
  Time,
  createChart,
} from 'lightweight-charts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { graphqlFetcher } from 'utils/graphql'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'
import { RANGE_BUCKETS, RANGE_KEYS, RangeKey, bucketClose, bucketGrid } from './chartTimeBuckets'

// Pool oracle CONFIG over time — lambda / kB / kQ / compress / sSell / sBuy. These
// are recorded on the indexer's Transaction entity (already decoded), so every swap
// is a config snapshot. Config only changes when an admin retunes the pool, so the
// lines are STEP functions (flat, jumping at each change) — this chart is a config
// history / audit view. Each param sits in its OWN horizontal lane (own auto-scaled
// hidden axis) because their magnitudes span ~1000× (sSell ~1e-4 vs compress ~0.1).
const CONFIG_FIELDS = 'lambda\n      kB\n      kQ\n      compress\n      sSell\n      sBuy'
const GET_POOL_CONFIG = `
  query PoolConfig($pair: String) {
    transactions(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      ${CONFIG_FIELDS}
    }
  }
`
const GET_POOL_CONFIG_OLDER = `
  query PoolConfigOlder($pair: String, $before: BigInt) {
    transactions(first: 1000, where: { pair: $pair, timestamp_lt: $before }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      ${CONFIG_FIELDS}
    }
  }
`

// Config fields are a V3-schema addition — strip them if a chain's indexer lacks
// them (the query would otherwise 4xx), so the chart just shows empty there.
const buildConfigQuery = (template: string, keep: boolean) =>
  keep ? template : template.replace(/\s*(lambda|kB|kQ|compress|sSell|sBuy)\s*/g, (m, name) => (name ? '\n' : m))

async function fetchConfigWithFallback(operationName: string, template: string, variables: Record<string, unknown>) {
  try {
    const full = await graphqlFetcher({ operationName, query: template, variables })
    if (full) return full
  } catch {
    // fall through
  }
  return graphqlFetcher({ operationName, query: buildConfigQuery(template, false), variables })
}

type Range = RangeKey
type ParamKey = 'lambda' | 'kB' | 'kQ' | 'compress' | 'sSell' | 'sBuy'

const PARAMS: { key: ParamKey; label: string; color: string }[] = [
  { key: 'lambda', label: 'lambda', color: '#D8A072' },
  { key: 'kB', label: 'kB (κ base)', color: '#4DA3FF' },
  { key: 'kQ', label: 'kQ (κ quote)', color: '#22D3EE' },
  { key: 'compress', label: 'compress', color: '#EC4899' },
  { key: 'sSell', label: 'sSell', color: '#EF5350' },
  { key: 'sBuy', label: 'sBuy', color: '#16A34A' },
]

type Txn = { timestamp: number | string } & Record<ParamKey, number | string | null | undefined>
type Point = { t: number } & Record<ParamKey, number>

// Compact formatter — config values are small (1e-4 … 0.2). Significant digits keep
// them readable without a fixed decimal count.
const fmtCfg = (v: number): string => {
  if (!Number.isFinite(v)) return '—'
  if (v === 0) return '0'
  return v.toLocaleString(undefined, { maximumSignificantDigits: 4 })
}

type Props = {
  pairAddress: string
  chainId: number
  version: number
}

export function PoolConfigChart({ pairAddress, chainId, version }: Props) {
  const [range, setRange] = useState<Range>('7D')
  const [visible, setVisible] = useState<Record<ParamKey, boolean>>({
    lambda: true,
    kB: true,
    kQ: true,
    compress: true,
    sSell: true,
    sBuy: true,
  })

  const { data, isLoading } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['poolConfig', chainId, pairAddress, version],
    queryFn: () =>
      fetchConfigWithFallback(
        'PoolConfig',
        withFirstActivityGte(GET_POOL_CONFIG, 'timestamp', chainId, pairAddress),
        { chainId, version, pair: pairAddress.toLowerCase() },
      ) as Promise<{ transactions: Txn[] }>,
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  const [olderTxs, setOlderTxs] = useState<Txn[]>([])
  const loadingRef = useRef(false)
  const exhaustedRef = useRef(false)
  const pendingRestoreRef = useRef(false)
  const savedRangeRef = useRef<IRange<Time> | null>(null)
  const loadMoreRef = useRef<() => void>(() => {})

  useEffect(() => {
    setOlderTxs([])
    loadingRef.current = false
    exhaustedRef.current = false
    pendingRestoreRef.current = false
    savedRangeRef.current = null
  }, [pairAddress, chainId, version])

  const combinedTxs = useMemo<Txn[]>(() => [...(data?.transactions ?? []), ...olderTxs], [data, olderTxs])

  const allPoints = useMemo<Point[]>(() => {
    const futureCutoff = Math.floor(Date.now() / 1000) + 3600
    return [...combinedTxs]
      .reverse()
      .map((t) => {
        const p = { t: Number(t.timestamp) } as Point
        for (const { key } of PARAMS) p[key] = Number(t[key])
        return p
      })
      .filter((p) => Number.isFinite(p.t) && p.t <= futureCutoff && PARAMS.some(({ key }) => Number.isFinite(p[key])))
  }, [combinedTxs])

  const { bucket } = RANGE_BUCKETS[range]
  const grid = useMemo(
    () => bucketGrid(allPoints.length ? allPoints[0].t : null, bucket, Math.floor(Date.now() / 1000)),
    [allPoints, bucket],
  )

  // Per-param bucketed close series (carried — config persists between trades).
  const seriesData = useMemo(() => {
    const out = {} as Record<ParamKey, { time: any; value: number }[]>
    if (!grid) {
      for (const { key } of PARAMS) out[key] = []
      return out
    }
    const bucketed = bucketClose(allPoints, bucket, grid.gridStart, grid.gridEnd)
    for (const { key } of PARAMS) {
      out[key] = bucketed.filter((b) => Number.isFinite(b[key])).map((b) => ({ time: b.t as any, value: b[key] }))
    }
    return out
  }, [allPoints, bucket, grid])

  const latest = allPoints[allPoints.length - 1]

  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) return
    const oldest = combinedTxs[combinedTxs.length - 1]
    if (!oldest) return
    const before = Number(oldest.timestamp)
    if (!Number.isFinite(before)) return
    loadingRef.current = true
    try {
      const res = (await fetchConfigWithFallback(
        'PoolConfigOlder',
        withFirstActivityGte(GET_POOL_CONFIG_OLDER, 'timestamp', chainId, pairAddress),
        { chainId, version, pair: pairAddress.toLowerCase(), before },
      )) as { transactions?: Txn[] } | null
      const batch = res?.transactions ?? []
      if (batch.length < 1000) exhaustedRef.current = true
      if (batch.length > 0) {
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
  const seriesRefs = useRef<Partial<Record<ParamKey, ISeriesApi<'Line'>>>>({})

  const [hovered, setHovered] = useState<Partial<Record<ParamKey, number>> | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number; time: number } | null>(null)

  const applyRangePreset = useCallback(() => {
    const ts = chartRef.current?.timeScale()
    if (!ts) return
    const rangeSpan = RANGE_BUCKETS[range].span
    const anchor = seriesData.lambda.length ? seriesData.lambda : PARAMS.map((p) => seriesData[p.key]).find((s) => s.length)
    const last = anchor && anchor.length ? (anchor[anchor.length - 1].time as number) : null
    if (rangeSpan == null || last == null) {
      ts.fitContent()
      return
    }
    ts.setVisibleRange({ from: (last - rangeSpan) as Time, to: last as Time })
  }, [range, seriesData])
  const applyRangePresetRef = useRef(applyRangePreset)
  applyRangePresetRef.current = applyRangePreset

  // Create chart + one series per param (each in its own horizontal lane).
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
      grid: { vertLines: { color: '#2F2823' }, horzLines: { color: 'transparent' } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        borderColor: '#493E35',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
        fixRightEdge: true,
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
      height: container.clientHeight || 300,
      autoSize: true,
    })

    const n = PARAMS.length
    PARAMS.forEach((p, i) => {
      const s = chart.addSeries(LineSeries, {
        lastValueVisible: false,
        priceLineVisible: false,
        priceScaleId: p.key,
        color: p.color,
        lineWidth: 1,
        lineType: LineType.WithSteps, // config is a step function
      })
      // Each param gets its own ~1/n horizontal lane so all 6 are readable despite
      // the ~1000× magnitude spread.
      s.priceScale().applyOptions({ scaleMargins: { top: i / n + 0.02, bottom: (n - 1 - i) / n + 0.02 } })
      seriesRefs.current[p.key] = s
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
      const next: Partial<Record<ParamKey, number>> = {}
      for (const p of PARAMS) {
        const s = seriesRefs.current[p.key]
        if (!s) continue
        const pt = param.seriesData.get(s) as { value?: number } | undefined
        if (pt && typeof pt.value === 'number') next[p.key] = pt.value
      }
      setHovered(next)
      setTip({ x: param.point.x, y: param.point.y, time: Number(param.time) })
    }
    chart.subscribeCrosshairMove(crosshairHandler as any)

    const rangeChangeHandler = (logical: { from: number; to: number } | null) => {
      if (!logical) return
      if (logical.from < 10) loadMoreRef.current()
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeChangeHandler as any)

    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
      seriesRefs.current = {}
    }
  }, [])

  // Push data.
  useEffect(() => {
    let any = false
    for (const p of PARAMS) {
      seriesRefs.current[p.key]?.setData(seriesData[p.key])
      if (seriesData[p.key].length) any = true
    }
    if (!any) return
    if (pendingRestoreRef.current) {
      const saved = savedRangeRef.current
      if (saved) chartRef.current?.timeScale().setVisibleRange(saved)
      pendingRestoreRef.current = false
      savedRangeRef.current = null
    } else {
      applyRangePresetRef.current()
    }
  }, [seriesData])

  useEffect(() => {
    if (pendingRestoreRef.current) return
    applyRangePresetRef.current()
  }, [range])

  useEffect(() => {
    for (const p of PARAMS) seriesRefs.current[p.key]?.applyOptions({ visible: visible[p.key] })
  }, [visible])

  const hasData = PARAMS.some((p) => seriesData[p.key].length > 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>Pool Config</div>
        {latest && (
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
            now λ {fmtCfg(latest.lambda)} · κ {fmtCfg(latest.kB)}/{fmtCfg(latest.kQ)}
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#978A80', marginBottom: 10, lineHeight: 1.5 }}>
        Oracle config over time — each parameter in its own lane; a step = an admin config change.
      </div>

      <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '20px' }}>
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

        <div style={{ position: 'relative', width: '100%', height: 300 }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
          {isLoading && !hasData && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
              Loading config…
            </div>
          )}
          {!isLoading && !hasData && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
              No config data for this pool.
            </div>
          )}

          {tip && hovered && (() => {
            const containerW = containerRef.current?.clientWidth ?? 0
            const containerH = containerRef.current?.clientHeight ?? 0
            const TIP_W = 184
            const TIP_H_EST = 150
            const HGAP = 14
            const VGAP = 14
            const wantsRight = tip.x + HGAP + TIP_W <= containerW
            const left = wantsRight ? tip.x + HGAP : Math.max(8, tip.x - HGAP - TIP_W)
            const wantsAbove = tip.y - VGAP - TIP_H_EST >= 8
            const top = wantsAbove ? tip.y - VGAP - TIP_H_EST : Math.min(tip.y + VGAP, containerH - TIP_H_EST - 8)
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
                <div style={{ color: '#978A80', marginBottom: 6 }}>{dateStr}</div>
                {PARAMS.filter((p) => visible[p.key] && hovered[p.key] !== undefined).map((p) => (
                  <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, lineHeight: '18px' }}>
                    <span style={{ color: p.color }}>{p.label}</span>
                    <span style={{ color: '#FBFBFD' }}>{fmtCfg(hovered[p.key] as number)}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {hasData && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3">
            {PARAMS.filter((p) => seriesData[p.key].length > 0).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                style={{ background: 'transparent', border: 'none', padding: 0, opacity: visible[p.key] ? 1 : 0.4 }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, display: 'inline-block' }} />
                <span className="text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', color: '#FBFBFD' }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
