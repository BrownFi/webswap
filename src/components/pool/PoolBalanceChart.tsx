import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ZoomIn, ZoomOut } from 'react-feather'
import { graphqlFetcher } from 'utils/graphql'

// Pool balance over time as a PERCENTAGE split, sourced from the indexer's
// `Transaction` entity (reserve0USD/reserve1USD snapshot at every tx). Two lines
// — each token's % of pool value — with a 50% reference line: 50% = perfectly
// balanced, drift away from it = imbalance. Shows the composition %, NOT the TVL.
// Pool-wide (not per-wallet).
//
// Colors stay tied to each RAW token (token0 → orange, token1 → blue); the
// `reversed` prop only flips DISPLAY ORDER (badge + tooltip rows) so the base
// token lists first, matching the pool's base/quote display rule. (Same approach
// as the "Pool balances" stat on the detail page.)
//
// Fetches the most recent 1000 trades once; the timeframe selector filters
// client-side (instant, no refetch). 'All' = the full fetched window.
const GET_POOL_BALANCES = `
  query PoolBalances($pair: String) {
    transactions(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      reserve0USD
      reserve1USD
    }
  }
`

const RANGES = { '1D': 86400, '7D': 7 * 86400, '1M': 30 * 86400, ALL: null } as const
type Range = keyof typeof RANGES
const RANGE_KEYS: Range[] = ['1D', '7D', '1M', 'ALL']

// Y-axis is a zoomable [lo, hi] % window centered on the 50% midline. The −/+
// buttons step ±5% per edge; double-click the chart to reset. Default 20–80%,
// tightest [45, 55].
const Y_DEFAULT: [number, number] = [20, 80]
const Y_MIN_RANGE = 10 // tightest window = [45, 55] (5% each side of the midline)
function yTicks([lo, hi]: [number, number]): number[] {
  const range = hi - lo
  const step = range > 70 ? 20 : range > 35 ? 10 : range > 16 ? 5 : 2
  const ticks: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Math.round(v))
  if (lo <= 50 && hi >= 50 && !ticks.includes(50)) ticks.push(50)
  return ticks.sort((a, b) => a - b)
}
// Step each edge by ±delta% — the −/+ buttons (round 5% jumps). Clamped.
const stepWindow = ([lo, hi]: [number, number], delta: number): [number, number] => {
  const h = Math.min(50, Math.max(Y_MIN_RANGE / 2, (hi - lo) / 2 + delta))
  return [50 - h, 50 + h]
}

type Txn = { timestamp: number | string; reserve0USD: number | string; reserve1USD: number | string }
// pct0/pct1 = each token's % of pool value. The gap between them is shaded with
// the dominant token's color: band0 (token0 ≥50%) vs band1 (token1 ≥50%); the
// inactive one is null so each Area only paints its own segments. Zero-width at 50/50.
type Point = {
  t: number
  pct0: number
  pct1: number
  band0: [number, number] | null
  band1: [number, number] | null
}

const COLOR0 = '#D8A072' // token0 (app orange/tan)
const COLOR1 = '#4DA3FF' // token1 (blue)

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

function BalanceTooltip({ active, payload, symbol0, symbol1, reversed }: any) {
  if (!active || !payload?.length) return null
  const p: Point = payload[0].payload
  const row = (color: string, label: string, pct: number) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color }}>{label}</span>
      <span style={{ color: '#FBFBFD' }}>{pct.toFixed(2)}%</span>
    </div>
  )
  // Each token keeps its own color; only the row order follows base/quote.
  const rows = [row(COLOR0, symbol0, p.pct0), row(COLOR1, symbol1, p.pct1)]
  return (
    <div
      style={{
        background: '#15110E',
        border: '1px solid #2F2823',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: 'Inter',
        fontSize: 12,
        minWidth: 160,
      }}
    >
      <div style={{ color: '#978A80', marginBottom: 6 }}>{dayjs.unix(p.t).format('MMM D, YYYY HH:mm')}</div>
      {reversed ? [rows[1], rows[0]] : rows}
    </div>
  )
}

export function PoolBalanceChart({ pairAddress, chainId, version, symbol0, symbol1, reversed = false }: Props) {
  const [range, setRange] = useState<Range>('ALL')
  const [yDomain, setYDomain] = useState<[number, number]>(Y_DEFAULT)
  const yRange = yDomain[1] - yDomain[0]

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

  // Full fetched series as a % split, chronological (indexer returns newest-first).
  // Kept in RAW token order — colors/lines are tied to each raw token.
  const allPoints = useMemo<Point[]>(() => {
    const txs = data?.transactions ?? []
    return [...txs]
      .reverse()
      .map((t) => {
        const r0 = Number(t.reserve0USD)
        const r1 = Number(t.reserve1USD)
        const total = r0 + r1
        const pct0 = total > 0 ? (r0 / total) * 100 : NaN
        const pct1 = 100 - pct0
        const span = [Math.min(pct0, pct1), Math.max(pct0, pct1)] as [number, number]
        return {
          t: Number(t.timestamp),
          pct0,
          pct1,
          band0: pct0 >= pct1 ? span : null, // token0 over-weighted → orange
          band1: pct1 >= pct0 ? span : null, // token1 over-weighted → blue
        }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.pct0))
  }, [data])

  // Apply the selected timeframe (client-side).
  const points = useMemo<Point[]>(() => {
    const span = RANGES[range]
    if (span == null) return allPoints
    // eslint-disable-next-line react-hooks/purity -- time-window filter; sub-second drift across renders is harmless
    const cutoff = Math.floor(Date.now() / 1000) - span
    return allPoints.filter((p) => p.t >= cutoff)
  }, [allPoints, range])

  // The "now" split is always the latest trade, independent of the zoom level.
  const latest = allPoints[allPoints.length - 1]
  const pct0 = latest ? latest.pct0 : null
  // Badge sides — base first (display order); each side keeps its raw color.
  const sides =
    pct0 == null
      ? null
      : reversed
      ? [{ pct: 100 - pct0, sym: symbol1, color: COLOR1 }, { pct: pct0, sym: symbol0, color: COLOR0 }]
      : [{ pct: pct0, sym: symbol0, color: COLOR0 }, { pct: 100 - pct0, sym: symbol1, color: COLOR1 }]

  return (
    <div>
      {/* Section title — sits OUTSIDE the chart card */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>Pool Balance Over Time</div>
        {sides && (
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
            now <span style={{ color: sides[0].color }}>{sides[0].pct.toFixed(2)}% {sides[0].sym}</span> /{' '}
            <span style={{ color: sides[1].color }}>{sides[1].pct.toFixed(2)}% {sides[1].sym}</span>
          </div>
        )}
      </div>

      <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '20px' }}>
        {/* Y-axis zoom (left) + timeframe selector (right) */}
        <div className="flex items-center justify-between mb-3">
          {/* Y-axis zoom — zoom-out / zoom-in icons; hover for the current window + reset hint */}
          <div
            className="inline-flex items-center gap-1"
            title={`Zoom Y axis · ${Math.round(yDomain[0])}–${Math.round(yDomain[1])}% · ±5% per click · double-click chart to reset`}
          >
            <button
              type="button"
              onClick={() => setYDomain((d) => stepWindow(d, 5))}
              disabled={yRange >= 100}
              className="inline-flex items-center justify-center px-[9px] py-[6px] rounded-[7px] bg-transparent enabled:hover:bg-[#493E35] enabled:cursor-pointer disabled:cursor-default transition-colors"
              style={{ color: yRange >= 100 ? '#5B524A' : '#978A80', border: 'none' }}
              aria-label="Zoom out Y axis"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setYDomain((d) => stepWindow(d, -5))}
              disabled={yRange <= Y_MIN_RANGE}
              className="inline-flex items-center justify-center px-[9px] py-[6px] rounded-[7px] bg-transparent enabled:hover:bg-[#493E35] enabled:cursor-pointer disabled:cursor-default transition-colors"
              style={{ color: yRange <= Y_MIN_RANGE ? '#5B524A' : '#978A80', border: 'none' }}
              aria-label="Zoom in Y axis"
            >
              <ZoomIn size={15} />
            </button>
          </div>
          {/* Timeframe selector — matches the LP chart's segmented control */}
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

        {/* Double-click the chart to reset the Y zoom to default. */}
        <div onDoubleClick={() => setYDomain(Y_DEFAULT)}>
          {isLoading && allPoints.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13, cursor: 'default' }}>
              Loading pool balance…
            </div>
          ) : allPoints.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13, cursor: 'default' }}>
              No activity on this pool yet.
            </div>
          ) : points.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13, cursor: 'default' }}>
              No trades in the last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : '30 days'}.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={points} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F2823" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(t) => dayjs.unix(t).format(range === '1D' ? 'HH:mm' : 'MMM D')}
                  tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                  stroke="#2F2823"
                  minTickGap={40}
                />
                <YAxis
                  domain={yDomain}
                  ticks={yTicks(yDomain)}
                  allowDataOverflow
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                  stroke="#2F2823"
                  width={44}
                />
                {/* Shaded gap between the two %s, colored by the dominant token —
                    widens with imbalance, ~0 at 50/50 */}
                <Area type="monotone" dataKey="band0" stroke="none" fill={COLOR0} fillOpacity={0.18} connectNulls={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="band1" stroke="none" fill={COLOR1} fillOpacity={0.18} connectNulls={false} isAnimationActive={false} />
                {/* 50% = perfectly balanced */}
                <ReferenceLine y={50} stroke="#493E35" strokeDasharray="4 4" />
                <Tooltip content={<BalanceTooltip symbol0={symbol0} symbol1={symbol1} reversed={reversed} />} />
                <Line type="monotone" dataKey="pct0" stroke={COLOR0} strokeWidth={1.5} dot={false} name={symbol0} isAnimationActive={false} />
                <Line type="monotone" dataKey="pct1" stroke={COLOR1} strokeWidth={1.5} dot={false} name={symbol1} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
