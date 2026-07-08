import { IChartApi, ISeriesApi } from 'lightweight-charts'

// A gapped line is rendered as a POOL of series — one per contiguous no-trade segment
// (lightweight-charts connects across whitespace, so a single series can't gap). These
// helpers keep such a pool in sync and read values back at the crosshair.

type SeriesDataMap = Map<ISeriesApi<any>, { value?: number } | undefined>
type LineDatum = { time: any; value: number }

// Resize `pool` to EXACTLY segments.length (grow with `make`, shrink with removeSeries
// so it can't grow unbounded across scroll/timeframe changes — removed series free
// memory + drop out of the crosshair scan), then setData each segment. New series get
// the current `visible`.
export function syncSegmentPool<T extends ISeriesApi<any>>(
  chart: IChartApi,
  pool: T[],
  make: () => T,
  segments: LineDatum[][],
  visible: boolean,
): void {
  while (pool.length < segments.length) {
    const s = make()
    s.applyOptions({ visible })
    pool.push(s)
  }
  while (pool.length > segments.length) {
    const s = pool.pop()
    if (s) chart.removeSeries(s)
  }
  pool.forEach((s, i) => s.setData(segments[i]))
}

// Value at the crosshair from whichever pool segment holds it (segments are disjoint in
// time, so at most one matches). undefined = the cursor is over a no-trade gap.
export function poolValueAt(map: SeriesDataMap, pool: ISeriesApi<any>[]): number | undefined {
  for (const s of pool) {
    const v = map.get(s)
    if (v && typeof v.value === 'number') return v.value
  }
  return undefined
}
