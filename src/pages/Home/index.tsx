import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchProtocolStats, ProtocolStats, TvlPoint } from 'services/defillamaService'

type Range = '7d' | '30d' | '90d' | 'all'

const RANGE_DAYS: Record<Range, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

const formatValue = (val: number) => {
  const n = Number(val) || 0
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

const formatDate = (unix: number) =>
  new Date(unix * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function Home() {
  const { data, isLoading } = useQuery<ProtocolStats>({
    queryKey: ['protocolStats'],
    queryFn: fetchProtocolStats,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })

  const chains = data?.chains ?? []

  const [range, setRange] = useState<Range>('30d')

  const filteredHistory = useMemo(() => {
    const history = data?.tvlHistory ?? []
    const days = RANGE_DAYS[range]
    if (!days || history.length <= days) return history
    return history.slice(-days)
  }, [data?.tvlHistory, range])

  const stats: { label: string; value: string; sub: string }[] = [
    { label: 'Total Value Locked', value: formatValue(data?.currentTvl ?? 0), sub: 'Current TVL' },
    { label: 'Total Value Locked', value: formatValue(data?.athTvl ?? 0), sub: 'All-time high' },
    { label: 'All - Time Volume', value: formatValue(data?.volumeAllTime ?? 0), sub: 'Since launch' },
    { label: '24h Volume', value: formatValue(data?.volume24h ?? 0), sub: 'Across all chains' },
    { label: 'Total Fees', value: formatValue(data?.feesAllTime ?? 0), sub: 'Since launch' },
    { label: '24h Fees', value: formatValue(data?.fees24h ?? 0), sub: 'Distributed to Lps' },
  ]

  return (
    <div className="w-full flex flex-col justify-center" style={{ maxWidth: '1280px', padding: '0 16px', minHeight: 'calc(100vh - 280px)' }}>
      {/* Hero: tagline + CTA on left, TVL chart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col justify-between gap-5">
          <span
            className="text-[24px] sm:text-[32px] lg:text-[40px] leading-[32px] sm:leading-[42px] lg:leading-[46px]"
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#FBFBFD',
            }}
          >
            High Capital Efficiency with simple LP management and optimal returns for average LPers
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/add"
              className="inline-flex items-center justify-center no-underline"
              style={{
                background: '#985C2A',
                borderRadius: '12px',
                padding: '12px 24px',
                fontFamily: 'Inter',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
              }}
            >
              Add Liquidity Now
            </Link>
            <Link
              to="/pool"
              className="inline-flex items-center justify-center no-underline"
              style={{
                background: 'transparent',
                border: '1px solid #493E35',
                borderRadius: '12px',
                padding: '12px 24px',
                fontFamily: 'Inter',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FBFBFD',
              }}
            >
              Explore Pools
            </Link>
          </div>
          {chains.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>
                Live on
              </span>
              {chains.map((c) => (
                <span
                  key={c.name}
                  style={{
                    background: '#2F2823',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#FBFBFD',
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TVL chart */}
        <div
          className="p-[16px] sm:p-[20px]"
          style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '20px' }}
        >
          <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
            <div className="flex flex-col">
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>
                Total Value Locked
              </span>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em', color: '#FBFBFD' }}>
                {formatValue(data?.currentTvl ?? 0)}
              </span>
            </div>
            <div className="flex items-center gap-1" style={{ background: '#2F2823', borderRadius: '10px', padding: '3px' }}>
              {(['7d', '30d', '90d', 'all'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="cursor-pointer"
                  style={{
                    background: range === r ? '#985C2A' : 'transparent',
                    color: range === r ? '#FFFFFF' : '#978A80',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: 'none',
                    borderRadius: '7px',
                    padding: '5px 10px',
                  }}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={filteredHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D8A072" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D8A072" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={{ stroke: '#2F2823' }}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={formatValue}
                  tick={{ fill: '#978A80', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    background: '#120F0D',
                    border: '1px solid #2F2823',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#978A80' }}
                  itemStyle={{ color: '#D8A072' }}
                  labelFormatter={(label) => formatDate(Number(label))}
                  formatter={(value) => [formatValue(Number(value) || 0), 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="totalLiquidityUSD"
                  stroke="#D8A072"
                  strokeWidth={2}
                  fill="url(#tvlGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10 pb-5">
        {stats.map((stat, index) => (
          <div
            key={`${stat.label}-${index}`}
            className="relative overflow-hidden flex flex-col items-start gap-[2px] sm:gap-[4px] p-[10px] sm:p-[16px]"
            style={{ background: '#2F2823', borderRadius: '14px' }}
          >
            <span className="text-[11px] sm:text-[13px]" style={{ fontFamily: 'Inter', fontWeight: 500, lineHeight: '1.4', color: '#FBFBFD' }}>
              {stat.label}
            </span>
            {isLoading && !data ? (
              <span className="animate-pulse text-[16px] sm:text-[20px] leading-[22px] sm:leading-[26px]" style={{ fontFamily: 'Inter', fontWeight: 700, letterSpacing: '-0.02em', color: '#978A80' }}>
                --
              </span>
            ) : (
              <span className="text-[16px] sm:text-[20px] leading-[22px] sm:leading-[26px]" style={{ fontFamily: 'Inter', fontWeight: 700, letterSpacing: '-0.02em', color: '#D8A072' }}>
                {stat.value}
              </span>
            )}
            <span className="text-[10px] sm:text-[12px]" style={{ fontFamily: 'Inter', fontWeight: 400, lineHeight: '1.4', letterSpacing: '-0.02em', color: '#978A80' }}>
              {stat.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Keep TS happy about unused import when TvlPoint is only referenced as type elsewhere
export type { TvlPoint }
