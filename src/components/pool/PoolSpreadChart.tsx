import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { graphqlFetcher } from 'utils/graphql'

// "oSpread" = the oracle-vs-AMM price spread per SWAP, from the indexer
// Transaction entity: (pythPrice0/pythPrice1 − ammPriceRel) / adjPriceRel.
// It oscillates around 0 (positive = oracle above the AMM price, negative =
// below), so we plot it as a single line in % with a zero reference. Pool-wide.
// (Spec from Manh.)
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

function SpreadTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p: Point = payload[0].payload
  return (
    <div
      style={{
        background: '#15110E',
        border: '1px solid #2F2823',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: 'Inter',
        fontSize: 12,
        minWidth: 150,
      }}
    >
      <div style={{ color: '#978A80', marginBottom: 4 }}>{dayjs.unix(p.t).format('MMM D, YYYY HH:mm')}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: COLOR }}>oSpread</span>
        <span style={{ color: '#FBFBFD' }}>{p.s >= 0 ? '+' : ''}{p.s.toFixed(4)}%</span>
      </div>
    </div>
  )
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

  const latest = allPoints[allPoints.length - 1]

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

        {isLoading && allPoints.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            Loading oracle spread…
          </div>
        ) : allPoints.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            No swaps on this pool yet.
          </div>
        ) : points.length === 0 ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#978A80', fontFamily: 'Inter', fontSize: 13 }}>
            No swaps in the last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : '30 days'}.
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
                tickFormatter={(v) => `${v.toFixed(3)}%`}
                tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                stroke="#2F2823"
                width={60}
              />
              <ReferenceLine y={0} stroke="#493E35" strokeDasharray="4 4" />
              <Tooltip content={<SpreadTooltip />} />
              <Line type="monotone" dataKey="s" stroke={COLOR} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
