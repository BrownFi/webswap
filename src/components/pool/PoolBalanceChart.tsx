import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { graphqlFetcher } from 'utils/graphql'

// Pool balance over time as a PERCENTAGE split, sourced from the indexer's
// `Transaction` entity (reserve0USD/reserve1USD snapshot at every tx). Two lines
// — each token's % of pool value — with a 50% reference line: 50% = perfectly
// balanced, drift away from it = imbalance. Shows the composition %, NOT the TVL.
// Pool-wide (not per-wallet).
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

type Txn = { timestamp: number | string; reserve0USD: number | string; reserve1USD: number | string }
type Point = { t: number; pct0: number; pct1: number } // each token's % of pool value

const COLOR0 = '#D8A072' // token0 (app orange/tan)
const COLOR1 = '#4DA3FF' // token1 (blue)

type Props = {
  pairAddress: string
  chainId: number
  version: number
  symbol0: string
  symbol1: string
}

function BalanceTooltip({ active, payload, symbol0, symbol1 }: any) {
  if (!active || !payload?.length) return null
  const p: Point = payload[0].payload
  const row = (color: string, label: string, pct: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color }}>{label}</span>
      <span style={{ color: '#FBFBFD' }}>{pct.toFixed(2)}%</span>
    </div>
  )
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
      {row(COLOR0, symbol0, p.pct0)}
      {row(COLOR1, symbol1, p.pct1)}
    </div>
  )
}

export function PoolBalanceChart({ pairAddress, chainId, version, symbol0, symbol1 }: Props) {
  const [range, setRange] = useState<Range>('ALL')

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
  const allPoints = useMemo<Point[]>(() => {
    const txs = data?.transactions ?? []
    return [...txs]
      .reverse()
      .map((t) => {
        const r0 = Number(t.reserve0USD)
        const r1 = Number(t.reserve1USD)
        const total = r0 + r1
        const pct0 = total > 0 ? (r0 / total) * 100 : NaN
        return { t: Number(t.timestamp), pct0, pct1: 100 - pct0 }
      })
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.pct0))
  }, [data])

  // Apply the selected timeframe (client-side).
  const points = useMemo<Point[]>(() => {
    const span = RANGES[range]
    if (span == null) return allPoints
    const cutoff = Math.floor(Date.now() / 1000) - span
    return allPoints.filter((p) => p.t >= cutoff)
  }, [allPoints, range])

  // The "now" split is always the latest trade, independent of the zoom level.
  const latest = allPoints[allPoints.length - 1]
  const pct0 = latest ? latest.pct0 : null

  return (
    <div>
      {/* Section title — sits OUTSIDE the chart card */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>Pool Balance Over Time</div>
        {pct0 != null && (
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#978A80' }}>
            now <span style={{ color: COLOR0 }}>{pct0.toFixed(2)}% {symbol0}</span> /{' '}
            <span style={{ color: COLOR1 }}>{(100 - pct0).toFixed(2)}% {symbol1}</span>
          </div>
        )}
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

        {isLoading && allPoints.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            Loading pool balance…
          </div>
        ) : allPoints.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            No activity on this pool yet.
          </div>
        ) : points.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            No trades in the last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : '30 days'}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={points} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
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
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                stroke="#2F2823"
                width={44}
              />
              {/* 50% = perfectly balanced */}
              <ReferenceLine y={50} stroke="#493E35" strokeDasharray="4 4" />
              <Tooltip content={<BalanceTooltip symbol0={symbol0} symbol1={symbol1} />} />
              <Line type="monotone" dataKey="pct0" stroke={COLOR0} strokeWidth={1.5} dot={false} name={symbol0} isAnimationActive={false} />
              <Line type="monotone" dataKey="pct1" stroke={COLOR1} strokeWidth={1.5} dot={false} name={symbol1} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
