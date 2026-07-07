// Shared time-bucketing for the tx-based pool charts (Pool Balance, Oracle Spread).
//
// Why: lightweight-charts spaces points by LOGICAL INDEX (data-point count), not
// clock time — so plotting one point per swap makes a busy hour many times wider
// than a quiet hour, and a pool that hasn't traded in days still sits flush at the
// right edge (no visual "it's been quiet"). These helpers resample the per-swap
// points onto a fixed time grid per timeframe (like the LP timeframe chart), so
// the x-axis is linear in real time and recent inactivity shows as a flat stretch.
//
// The line series become per-bucket CLOSE values (last swap in the bucket), carried
// forward across empty buckets — balances/prices/spread don't change without a
// trade, so a flat line during a gap is correct. Volume is SUMMED per bucket.

export type RangeKey = '1D' | '7D' | '1M' | 'ALL'

// bucket = bar width (seconds); span = window length (seconds, null = full history).
// Sizes chosen so a window holds ~90–200 bars: enough detail, never so many that
// gap-filling to `now` blows up the point count.
export const RANGE_BUCKETS: Record<RangeKey, { bucket: number; span: number | null }> = {
  '1D': { bucket: 15 * 60, span: 86400 }, // 15-min bars, last 24h (96 bars)
  '7D': { bucket: 60 * 60, span: 7 * 86400 }, // 1-hour bars, last 7d (168 bars)
  '1M': { bucket: 4 * 60 * 60, span: 30 * 86400 }, // 4-hour bars, last 30d (180 bars)
  ALL: { bucket: 86400, span: null }, // daily bars, full loaded history
}

export const RANGE_KEYS: RangeKey[] = ['1D', '7D', '1M', 'ALL']

// Compute the [gridStart, gridEnd] bucket-aligned grid. gridEnd is always "now"
// (so the carried line reaches the present); gridStart follows the EARLIEST loaded
// swap. The grid holds the full loaded history at this bucket size — the timeframe
// is a zoom preset (visible window), NOT a data filter — so scrolling left reveals
// older bars and triggers load-more, matching the LP chart. null when no data.
export function bucketGrid(
  firstTs: number | null,
  bucket: number,
  nowSec: number,
): { gridStart: number; gridEnd: number } | null {
  if (firstTs == null) return null
  const gridEnd = Math.floor(nowSec / bucket) * bucket
  const gridStart = Math.floor(firstTs / bucket) * bucket
  return { gridStart, gridEnd }
}

// Carry-forward CLOSE series: one point per bucket in [gridStart, gridEnd].
//  - a bucket with swaps → the LAST swap's values (close);
//  - an empty bucket → the previous close carried forward (flat);
//  - buckets before the first datum → skipped (nothing to carry yet).
// The last point before gridStart seeds the carry so a windowed view opens at the
// right level instead of blank. Times are set to the bucket start (strictly
// ascending + unique, as lightweight-charts requires). Input MUST be ascending.
export function bucketClose<P extends { t: number }>(
  pointsAsc: P[],
  bucket: number,
  gridStart: number,
  gridEnd: number,
): P[] {
  const closeByBucket = new Map<number, P>()
  let seed: P | undefined
  for (const p of pointsAsc) {
    const b = Math.floor(p.t / bucket) * bucket
    if (b < gridStart) {
      seed = p // last pre-window point wins (ascending) → carry-in level
      continue
    }
    if (b > gridEnd) break
    closeByBucket.set(b, p) // ascending → last swap in the bucket wins
  }
  const out: P[] = []
  let last = seed
  for (let b = gridStart; b <= gridEnd; b += bucket) {
    const hit = closeByBucket.get(b)
    if (hit) last = hit
    if (last) out.push({ ...last, t: b })
  }
  return out
}

// Signed volume bars per bucket: height = Σ|vol| in the bucket, sign/color = the
// net direction (up = base net-bought, down = net-sold). Empty buckets emit no bar
// (a zero-height bar is invisible anyway). Input MUST be ascending.
export function bucketVolume(
  pointsAsc: { t: number; vol: number; volUp: boolean }[],
  bucket: number,
  gridStart: number,
  gridEnd: number,
  colorUp: string,
  colorDown: string,
): { time: any; value: number; color: string }[] {
  const byBucket = new Map<number, { gross: number; net: number }>()
  for (const p of pointsAsc) {
    if (!(p.vol > 0)) continue
    const b = Math.floor(p.t / bucket) * bucket
    if (b < gridStart || b > gridEnd) continue
    const agg = byBucket.get(b) ?? { gross: 0, net: 0 }
    agg.gross += p.vol
    agg.net += p.volUp ? p.vol : -p.vol
    byBucket.set(b, agg)
  }
  return [...byBucket.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, { gross, net }]) => {
      const up = net >= 0
      return { time: t as any, value: up ? gross : -gross, color: up ? colorUp : colorDown }
    })
}
