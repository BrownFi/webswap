import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { graphqlFetcher } from 'utils/graphql'
import { formatNumber } from 'utils/prices'

// Pool balance / imbalance over time, sourced from the indexer's `Transaction`
// entity which snapshots reserve0USD/reserve1USD at EVERY tx (swap/add/remove).
// Stacked area: total height = TVL, the split = the pool's balance composition,
// so you can watch it drift (imbalance) trade by trade. Pool-wide (not
// per-wallet) — replaces the old per-wallet "Your recent activity" table.
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
type Point = { t: number; r0: number; r1: number; total: number }

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
  const pct0 = p.total > 0 ? (p.r0 / p.total) * 100 : 0
  const row = (color: string, label: string, usd: number, pct: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color }}>{label}</span>
      <span style={{ color: '#FBFBFD' }}>
        ${formatNumber(usd, { maximumFractionDigits: 2 })} <span style={{ color: '#978A80' }}>({pct.toFixed(2)}%)</span>
      </span>
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
        minWidth: 180,
      }}
    >
      <div style={{ color: '#978A80', marginBottom: 6 }}>{dayjs.unix(p.t).format('MMM D, YYYY HH:mm')}</div>
      {row(COLOR0, symbol0, p.r0, pct0)}
      {row(COLOR1, symbol1, p.r1, 100 - pct0)}
      <div style={{ borderTop: '1px solid #2F2823', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#978A80' }}>TVL</span>
        <span style={{ color: '#FBFBFD' }}>${formatNumber(p.total, { maximumFractionDigits: 2 })}</span>
      </div>
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

  // Full fetched series, chronological (indexer returns newest-first).
  const allPoints = useMemo<Point[]>(() => {
    const txs = data?.transactions ?? []
    return [...txs]
      .reverse()
      .map((t) => {
        const r0 = Number(t.reserve0USD)
        const r1 = Number(t.reserve1USD)
        return { t: Number(t.timestamp), r0, r1, total: r0 + r1 }
      })
      .filter((p) => p.total > 0 && Number.isFinite(p.t))
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
  const pct0 = latest && latest.total > 0 ? (latest.r0 / latest.total) * 100 : null

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
            <AreaChart data={points} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="bal0" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR0} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={COLOR0} stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="bal1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR1} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={COLOR1} stopOpacity={0.15} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => '$' + formatNumber(v, { maximumFractionDigits: 2 })}
                tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                stroke="#2F2823"
                width={56}
              />
              <Tooltip content={<BalanceTooltip symbol0={symbol0} symbol1={symbol1} />} />
              <Area type="monotone" dataKey="r0" stackId="1" stroke={COLOR0} fill="url(#bal0)" name={symbol0} isAnimationActive={false} />
              <Area type="monotone" dataKey="r1" stackId="1" stroke={COLOR1} fill="url(#bal1)" name={symbol1} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
