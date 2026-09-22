import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Token } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { availableChains } from 'connectors'
import { AutoColumn } from 'components/Column'
import { EmptyProposals, PageWrapper } from 'pages/Pool/styleds'
import { fetchProtocolStats, type ProtocolStats } from 'services/protocolStatsService'
import { TYPE } from 'theme'
import { getTokenSymbol } from 'utils'
import { shouldReverseDisplay } from 'utils/pair'
import { VERSION } from 'lib/sdk/constants/addresses'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Circle, ExternalLink } from 'react-feather'
import { Link } from 'react-router-dom'
import { checksumAddress, type Address } from 'viem'
import hemiEtherLogo from 'assets/images/hemi-ether.svg'
import hemiUsdcLogo from 'assets/images/hemi-usdc.svg'
import hemiUsdtLogo from 'assets/images/hemi-usdt.png'
import hemiWbtcLogo from 'assets/images/hemi-wbtc.svg'
import {
  useRevenueDashboard,
  type RevenueChainRow,
  type RevenueStatsBreakdown,
  type RevenueVersionRow,
  type DashboardPeriod,
  type RevenueHistoryPoint,
} from './useRevenueDashboard'
import { useDashboardPairMetrics, type DashboardPairMetric } from './usePairMetrics'

const HEMI_ICON_URL = 'https://assets.coingecko.com/coins/images/68469/standard/hemi.png'
const HEMI_TOKEN_LOGOS: Record<string, string> = {
  '0x4200000000000000000000000000000000000006': hemiEtherLogo,
  '0x99e3de3817f6081b2568208337ef83295b7f591d': 'https://framerusercontent.com/images/n4PMW5jyEJaRcKYdx8zsaKQ1J9Q.svg?width=360&height=360',
  '0xaa40c0c7644e0b2b224509571e10ad20d9c4ef28': 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  '0x03c7054bcb39f7b2e5b2c7acb37583e32d70cfa3': hemiWbtcLogo,
  '0xad11a8beb98bbf61dbb1aa0f6d6f2ecd87b35afa': hemiUsdcLogo,
  '0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e': hemiUsdtLogo,
  '0xd3599ae62ee280709a22268a46d23164214e345b': '/VUSD_Favicon_192.png',
}

function fmtUsd(n: number) {
  if (!Number.isFinite(n) || n === 0) return '$0.00'
  const abs = Math.abs(n)
  const formatted =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
        ? `$${(abs / 1_000).toFixed(2)}K`
        : `$${abs.toFixed(2)}`
  return n < 0 ? `-${formatted}` : formatted
}

function fmtPercent(n: number) {
  return Number.isFinite(n) && n !== 0 ? `${n.toFixed(2)}%` : '0.00%'
}

function fmtChartAxis(n: number) {
  if (!Number.isFinite(n)) return '0'
  const abs = Math.abs(n)
  const trim = (value: number) => value.toFixed(abs >= 1_000_000 ? 1 : 2).replace(/\.00$|(?<=\.[0-9])0$/, '')
  if (abs >= 1_000_000_000) return `${trim(n / 1_000_000_000)}b`
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}m`
  if (abs >= 1_000) return `${trim(n / 1_000)}k`
  return trim(n)
}

function periodLabel(period: DashboardPeriod) {
  return period === '7d' ? '7D' : period === '30d' ? '30D' : period === 'all' ? 'All' : '24h'
}

function VolumeMetric({
  volume,
  total,
  chainId,
  version,
  period,
  source = 'zeroX',
}: {
  volume: number
  total: number
  chainId: number
  version?: RevenueVersionRow['version']
  period?: DashboardPeriod
  source?: 'zeroX' | 'kyber'
}) {
  if (period !== undefined && period !== '24h') return <span>-</span>
  const supportedChains = source === 'kyber' ? [80094, 999, 42161, 59144, 4663] : [4663, 999]
  if (!supportedChains.includes(chainId) || (version !== undefined && version !== VERSION.V3_OFFICIAL))
    return <span>-</span>
  const share = total > 0 ? `${((volume / total) * 100).toFixed(1)}%` : '0.0%'
  return (
    <span>
      {fmtUsd(volume)} <span style={{ color: '#978A80', fontSize: '11px', fontWeight: 500 }}>({share})</span>
    </span>
  )
}

function RevenueValue({ value }: { value: number }) {
  return <span>{fmtUsd(value)}</span>
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = { '24h': '24h', '7d': '7D', '30d': '30D', all: 'All' }

function periodValues(row: RevenueChainRow | RevenueVersionRow, period: DashboardPeriod) {
  if (period === '7d') return { volume: row.totalVolume7d, fee: row.totalFee7d, revenue: row.totalRevenue7d }
  if (period === '30d') return { volume: row.totalVolume30d, fee: row.totalFee30d, revenue: row.totalRevenue30d }
  if (period === 'all') return { volume: row.totalVolumeAllTime, fee: row.totalFeeAllTime, revenue: row.totalRevenueAllTime }
  return { volume: row.totalVolume24h, fee: row.totalFee24h, revenue: row.totalRevenue24h }
}

function PeriodToggle({ period, onChange, vertical = false }: { period: DashboardPeriod; onChange: (period: DashboardPeriod) => void; vertical?: boolean }) {
  return (
    <div className={vertical ? 'flex flex-col items-center gap-1' : 'flex items-center gap-1'} role="group" aria-label="Dashboard period">
      {(['24h', '7d', '30d', 'all'] as DashboardPeriod[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            border: 'none',
            background: period === option ? '#2F2823' : 'transparent',
            color: period === option ? '#D8A072' : '#FBFBFD',
            borderRadius: 8,
            padding: '8px 12px',
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {PERIOD_LABELS[option]}
        </button>
      ))}
    </div>
  )
}

function MiniHistoryChart({ dataKey, label, color, history, stretch = false }: { dataKey: keyof RevenueHistoryPoint; label: string; color: string; history: RevenueHistoryPoint[]; stretch?: boolean }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const chartData = history.map((point) => ({
    ...point,
    label: new Date(point.timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))
  useEffect(() => {
    const element = chartContainerRef.current
    if (!element) return
    const updateWidth = () => setChartWidth(element.clientWidth)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div className={stretch ? 'h-full' : undefined} style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '12px 14px', minWidth: 0 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#FBFBFD' }}>{label}</span>
      </div>
      <div ref={chartContainerRef} className={stretch ? 'h-[calc(100%-28px)]' : undefined} style={{ width: '100%', height: stretch ? undefined : 150, minWidth: 1, minHeight: 150 }}>
        {chartWidth > 0 && <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={150}>
          <LineChart data={chartData} margin={{ top: 8, right: 10, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#2F2823" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#978A80', fontSize: 10 }} axisLine={{ stroke: '#493E35' }} tickLine={{ stroke: '#493E35' }} minTickGap={24} />
            <YAxis width={42} tick={{ fill: '#978A80', fontSize: 10 }} axisLine={{ stroke: '#493E35' }} tickLine={{ stroke: '#493E35' }} tickFormatter={fmtChartAxis} domain={['dataMin', 'dataMax']} />
            <Tooltip
              contentStyle={{ background: 'rgba(20, 16, 14, 0.95)', border: '1px solid #2F2823', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}
              formatter={(value) => [fmtUsd(Number(value)), label.startsWith('TVL') ? 'TVL' : label.startsWith('Volume') ? 'Vol.' : label.startsWith('Revenue') ? 'Rev.' : 'Fee']}
            />
            <Line type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </div>
  )
}

function DashboardHistoryChart({ history, period, stretch = false }: { history: RevenueHistoryPoint[]; period: DashboardPeriod; stretch?: boolean }) {
  // Exclude the incomplete current UTC-day bucket from the all-time series.
  const completed = history.slice(0, -1)
  const points = period === 'all' ? completed : completed.slice(-(period === '30d' ? 30 : 7))

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2${stretch ? ' h-full' : ''}`}>
      <MiniHistoryChart dataKey="tvl" label="TVL" color="#D8A072" history={points} stretch={stretch} />
      <MiniHistoryChart dataKey="volume" label="Volume" color="#D8A072" history={points} stretch={stretch} />
      <MiniHistoryChart dataKey="fee" label="Fee" color="#D8A072" history={points} stretch={stretch} />
      <MiniHistoryChart dataKey="revenue" label="Revenue" color="#D8A072" history={points} stretch={stretch} />
    </div>
  )
}

function PairHistoryCharts({ history, period }: { history: DashboardPairMetric['history']; period: DashboardPeriod }) {
  // Pair-day data arrives newest-first, while the shared chart removes the
  // last point as the incomplete current bucket.
  const ordered = [...history].sort((a, b) => a.timestamp - b.timestamp)
  return <DashboardHistoryChart history={ordered} period={period} stretch />
}

function ChainPairRevenueChart({ pairs, period }: { pairs: DashboardPairMetric[]; period: DashboardPeriod }) {
  const points = useMemo(() => {
    const byTimestamp = new Map<number, Record<string, number>>()
    pairs.forEach((pair, pairIndex) => {
      const key = `pair${pairIndex}`
      pair.history.forEach((point) => {
        const row = byTimestamp.get(point.timestamp) ?? { timestamp: point.timestamp }
        row[key] = point.revenue
        byTimestamp.set(point.timestamp, row)
      })
    })
    const completed = [...byTimestamp.values()].sort((a, b) => Number(a.timestamp) - Number(b.timestamp)).slice(0, -1)
    return period === 'all' ? completed : completed.slice(-(period === '30d' ? 30 : 7))
  }, [pairs, period])
  const colors = ['#D8A072', '#6FB3E6', '#A98BE8', '#76C893', '#E58C8C', '#D6C36A']
  return (
    <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '12px 14px', minWidth: 0, height: 460 }}>
      <div style={{ marginBottom: 8, fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#FBFBFD' }}>Revenue by pair</div>
      <div style={{ width: '100%', height: 390, minWidth: 1 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180}>
          <LineChart data={points} margin={{ top: 8, right: 10, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#2F2823" vertical={false} />
            <XAxis dataKey="timestamp" tick={{ fill: '#978A80', fontSize: 10 }} axisLine={{ stroke: '#493E35' }} tickLine={{ stroke: '#493E35' }} minTickGap={24} tickFormatter={(value) => new Date(Number(value) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
            <YAxis width={42} tick={{ fill: '#978A80', fontSize: 10 }} axisLine={{ stroke: '#493E35' }} tickLine={{ stroke: '#493E35' }} tickFormatter={fmtChartAxis} domain={['dataMin', 'dataMax']} />
            <Tooltip
              contentStyle={{ background: 'rgba(20, 16, 14, 0.95)', border: '1px solid #2F2823', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}
              labelFormatter={(value) => new Date(Number(value) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              formatter={(value, name) => {
                const index = Number(String(name).replace('pair', ''))
                const pair = pairs[index]
                return [fmtUsd(Number(value)), pair ? `${pair.token0.symbol} / ${pair.token1.symbol}` : String(name)]
              }}
            />
            <Legend formatter={(value) => {
              const index = Number(String(value).replace('pair', ''))
              const pair = pairs[index]
              return pair ? `${pair.token0.symbol} / ${pair.token1.symbol}` : value
            }} wrapperStyle={{ fontFamily: 'Inter', fontSize: 10, color: '#CFC7C1' }} />
            {pairs.map((pair, index) => <Line key={pair.id} type="monotone" dataKey={`pair${index}`} name={`pair${index}`} stroke={colors[index % colors.length]} strokeWidth={1.5} dot={false} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PairLabel({ pair, chainId }: { pair: DashboardPairMetric; chainId: number }) {
  const token0 = new Token(chainId, checksumAddress(pair.token0.id as Address), pair.token0.decimals, pair.token0.symbol, pair.token0.name)
  const token1 = new Token(chainId, checksumAddress(pair.token1.id as Address), pair.token1.decimals, pair.token1.symbol, pair.token1.name)
  const isReversed = shouldReverseDisplay(token0, token1, chainId, pair.quoteTokenIndex)
  const first = isReversed ? token1 : token0
  const second = isReversed ? token0 : token1
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 30, flexShrink: 0 }}>
        <div className="relative flex items-center">
          <PairTokenLogo token={isReversed ? token1 : token0} chainId={chainId} />
          <PairTokenLogo token={isReversed ? token0 : token1} chainId={chainId} overlap />
        </div>
      </div>
      <span>{getTokenSymbol(first, chainId)} / {getTokenSymbol(second, chainId)}</span>
    </div>
  )
}

function poolDetailHref(pair: DashboardPairMetric, chainId: number) {
  return `/pool/${chainId}/${pair.id}${pair.isHemi ? '' : '?v=v3-official'}`
}

function PairTokenLogo({ token, chainId, overlap = false }: { token: Token; chainId: number; overlap?: boolean }) {
  const fallback = chainId === 43111 ? HEMI_TOKEN_LOGOS[token.address.toLowerCase()] : undefined
  return fallback ? (
    <img
      src={fallback}
      alt={`${token.symbol} logo`}
      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', position: overlap ? 'absolute' : undefined, left: overlap ? 13 : undefined, zIndex: overlap ? 1 : 2 }}
    />
  ) : (
    <CurrencyLogo
      currency={token}
      size="22px"
      chainId={chainId}
      style={{ position: overlap ? 'absolute' : undefined, left: overlap ? 13 : undefined, zIndex: overlap ? 1 : 2 }}
    />
  )
}

function ChainPairMetrics({ row, period }: { row: RevenueChainRow; period: DashboardPeriod }) {
  const { pairs, isLoading, isError } = useDashboardPairMetrics(row, period, true)
  const [chartMode, setChartMode] = useState<'chain' | 'pair'>('chain')
  const [selectedPairId, setSelectedPairId] = useState('')
  const [pairMenuOpen, setPairMenuOpen] = useState(false)
  const selectedPair = pairs.find((pair) => pair.id === selectedPairId) ?? pairs[0]
  useEffect(() => {
    if (pairs.length && !pairs.some((pair) => pair.id === selectedPairId)) setSelectedPairId(pairs[0].id)
  }, [pairs, selectedPairId])
  return (
    <div style={{ marginTop: 16, minWidth: 0, width: '100%', maxWidth: '100%' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#CFC7C1' }}>Pair metrics</span>
        <span className="inline-flex items-center gap-1.5" style={{ fontFamily: 'Inter', fontSize: 11, color: '#FFFFFF' }}>{periodLabel(period)} <Circle size={7} fill="#5FB98A" strokeWidth={0} aria-hidden="true" /> Live {row.versions.some((version) => version.version === 'hemi') ? 'Hemi' : 'V3'} data</span>
      </div>
      {isLoading ? (
        <DashboardChartSkeleton />
      ) : isError ? (
        <div style={{ padding: '18px 0', color: '#FF7A95', fontFamily: 'Inter', fontSize: 12 }}>Pair metrics are temporarily unavailable.</div>
      ) : pairs.length === 0 ? (
        <div style={{ padding: '18px 0', color: '#978A80', fontFamily: 'Inter', fontSize: 12 }}>No live pair data found.</div>
      ) : (
        <>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 10 }}>
            <span style={{ color: '#978A80', fontFamily: 'Inter', fontSize: 11 }}>Performance inside this chain</span>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {chartMode === 'pair' && <div className="relative w-full sm:w-[210px]">
                <button type="button" onClick={() => setPairMenuOpen((open) => !open)} aria-haspopup="listbox" aria-expanded={pairMenuOpen} className="flex w-full items-center justify-between rounded-lg border border-[#493E35] bg-[#1E1915] px-3 py-1.5 text-left font-inter text-[11px] text-[#FBFBFD]">
                  <span className="truncate">{selectedPair ? `${selectedPair.token0.symbol} / ${selectedPair.token1.symbol}` : 'Select pair'}</span>
                  <span style={{ color: '#978A80', transform: pairMenuOpen ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}>⌄</span>
                </button>
                {pairMenuOpen && (
                  <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-[#493E35] bg-black p-1 shadow-xl">
                    {pairs.map((pair) => {
                      const active = pair.id === selectedPair?.id
                      return (
                        <button key={pair.id} type="button" role="option" aria-selected={active} onClick={() => { setSelectedPairId(pair.id); setPairMenuOpen(false) }} className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-inter text-[11px] transition-colors hover:bg-[#2F2823]" style={{ background: active ? '#2F2823' : 'transparent', color: active ? '#D8A072' : '#FBFBFD' }}>
                          <span>{pair.token0.symbol} / {pair.token1.symbol}</span>
                          {active && <span style={{ color: '#D8A072' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>}
              <div className="flex w-full rounded-lg border border-[#493E35] bg-[#1E1915] p-0.5 sm:w-auto" role="group" aria-label="Dashboard chart mode">
                <button type="button" onClick={() => setChartMode('chain')} aria-pressed={chartMode === 'chain'} className="flex-1 rounded-md px-3 py-1.5 font-inter text-[11px] font-semibold transition-colors sm:flex-none" style={{ background: chartMode === 'chain' ? '#985C2A' : 'transparent', color: chartMode === 'chain' ? '#FFFFFF' : '#978A80', cursor: 'pointer' }}>
                  Chain metrics
                </button>
                <button type="button" onClick={() => setChartMode('pair')} aria-pressed={chartMode === 'pair'} className="flex-1 rounded-md px-3 py-1.5 font-inter text-[11px] font-semibold transition-colors sm:flex-none" style={{ background: chartMode === 'pair' ? '#985C2A' : 'transparent', color: chartMode === 'pair' ? '#FFFFFF' : '#978A80', cursor: 'pointer' }}>
                  Pair metrics
                </button>
              </div>
            </div>
          </div>
          <div className="lg:h-[460px]" style={{ minHeight: 460 }}>
            {chartMode === 'chain' ? (
              <div className="grid grid-cols-1 items-start gap-3 lg:h-[460px] lg:grid-cols-2">
                <DashboardHistoryChart history={row.history} period={period} stretch />
                <ChainPairRevenueChart pairs={pairs} period={period} />
              </div>
            ) : selectedPair ? (
              <PairHistoryCharts history={selectedPair.history} period={period} />
            ) : null}
          </div>
          <div style={{ display: 'block', width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain', touchAction: 'pan-x', marginTop: 12 }}>
          <div className="w-[730px] md:w-full" style={{ background: '#000000' }}>
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]" style={{ padding: '10px 12px', background: '#1E1915', borderRadius: '10px', color: '#978A80', fontFamily: 'Inter', fontSize: 11, fontWeight: 600 }}>
              <span>Pair</span><span className="text-right">TVL</span><span className="text-right">Volume</span><span className="text-right">APR</span><span className="text-right">Fee</span><span className="text-right">Revenue</span>
            </div>
            {pairs.map((pair) => (
              <div key={pair.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center" onClick={() => { setSelectedPairId(pair.id); setChartMode('pair') }} style={{ padding: '12px', fontFamily: 'Inter', fontSize: 12, cursor: 'pointer' }}>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="truncate font-semibold" style={{ color: '#FBFBFD' }}><PairLabel pair={pair} chainId={row.chainId} /></div>
                  <Link to={poolDetailHref(pair, row.chainId)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`Open ${pair.token0.symbol} / ${pair.token1.symbol} pool`} title="Open pool detail in a new tab" style={{ color: '#978A80', display: 'inline-flex' }}><ExternalLink size={13} /></Link>
                  {pair.isGauge && <span style={{ color: '#D8A072', fontSize: 10, fontWeight: 600 }}>Gauge</span>}
                  {pair.revenueEstimated && <span style={{ color: '#6B6059', fontSize: 10 }}>est.</span>}
                </div>
                <span className="text-right" style={{ color: '#CFC7C1' }}>{fmtUsd(pair.tvl)}</span>
                <span className="text-right" style={{ color: '#CFC7C1' }}>{fmtUsd(pair.volume)}</span>
                <span className="text-right" style={{ color: '#D8A072' }}>{fmtPercent(pair.apr)}</span>
                <span className="text-right" style={{ color: '#CFC7C1' }}>{fmtUsd(pair.fee)}</span>
                <span className="text-right" style={{ color: '#D8A072' }}>{fmtUsd(pair.revenue)}</span>
              </div>
            ))}
          </div>
          </div>
        </>
      )}
    </div>
  )
}

function DashboardChartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:h-[460px] lg:grid-cols-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {['TVL', 'Volume', 'Fee', 'Revenue'].map((label) => (
          <div key={label} className="animate-pulse" style={{ minHeight: 150, border: '1px solid #2F2823', borderRadius: 12, background: '#1E1915', padding: '12px 14px' }}>
            <div style={{ width: '28%', height: 14, borderRadius: 4, background: '#493E35', marginBottom: 14 }} />
            <div style={{ height: 1, background: '#2F2823', boxShadow: '0 -42px 0 #2F2823, 0 -84px 0 #2F2823' }} />
            <div style={{ height: 72, marginTop: 18, borderRadius: 4, background: 'linear-gradient(135deg, transparent 0 25%, #493E35 25% 27%, transparent 27% 42%, #493E35 42% 44%, transparent 44% 61%, #493E35 61% 63%, transparent 63%)' }} />
            <span className="sr-only">Loading {label}</span>
          </div>
        ))}
      </div>
      <div className="animate-pulse" style={{ minHeight: 460, border: '1px solid #2F2823', borderRadius: 12, background: '#1E1915', padding: '12px 14px' }}>
        <div style={{ width: '30%', height: 14, borderRadius: 4, background: '#493E35', marginBottom: 18 }} />
        <div style={{ height: 1, background: '#2F2823', boxShadow: '0 72px 0 #2F2823, 0 144px 0 #2F2823, 0 216px 0 #2F2823' }} />
        <div style={{ height: 250, marginTop: 34, borderRadius: 4, background: 'linear-gradient(135deg, transparent 0 18%, #493E35 18% 19%, transparent 19% 35%, #493E35 35% 36%, transparent 36% 55%, #493E35 55% 56%, transparent 56% 75%, #493E35 75% 76%, transparent 76%)' }} />
      </div>
    </div>
  )
}

function DashboardStatsBar({
  stats,
  breakdown,
  period,
  isLoading,
}: {
  stats: { label: string; value: string; sub?: string; group: 'total' | '24h' }[]
  breakdown: RevenueStatsBreakdown[]
  period: DashboardPeriod
  isLoading?: boolean
}) {
  const totalStats = stats.filter((stat) => stat.group === 'total')
  const dailyStats = stats.filter((stat) => stat.group === '24h')
  const [showBreakdown, setShowBreakdown] = useState(false)

  const breakdownValueFor = (label: string, row: RevenueStatsBreakdown) => {
    switch (label) {
      case 'Total Fee All-time':
        return row.totalFeeAllTime
      case 'Total Revenue All-time':
        return row.totalRevenueAllTime
      case 'Total Value Locked':
        return row.totalValueLocked
      case 'All-time Volume':
        return row.totalVolumeAllTime
      case `Volume ${PERIOD_LABELS[period]}`:
        return period === '24h' ? row.totalVolume24h : period === '7d' ? row.totalVolume7d : row.totalVolume30d
      case `Fee ${PERIOD_LABELS[period]}`:
        return period === '24h' ? row.totalFee24h : period === '7d' ? row.totalFee7d : row.totalFee30d
      case `Revenue ${PERIOD_LABELS[period]}`:
        return period === '24h' ? row.totalRevenue24h : period === '7d' ? row.totalRevenue7d : row.totalRevenue30d
      default:
        return null
    }
  }

  const renderMetric = (stat: { label: string; value: string; sub?: string }) => (
    <div key={stat.label} className="flex flex-col gap-1 min-w-0">
      {isLoading ? (
        <>
          <div className="animate-pulse rounded h-[14px] w-[42%]" style={{ background: '#493E35' }} />
          <div className="animate-pulse rounded h-[20px] w-[34%]" style={{ background: '#493E35' }} />
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#CFC7C1', lineHeight: '19px' }}>
            {stat.label}
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '20px',
              fontWeight: 700,
              color: '#D8A072',
              whiteSpace: 'nowrap',
              lineHeight: '22px',
            }}
          >
            {stat.value}
          </div>
          {stat.sub && (
            <div
              style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 400, color: '#6B6059', lineHeight: '16px' }}
            >
              {stat.sub}
            </div>
          )}
          {showBreakdown && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {breakdown.map((row) => {
                const value = breakdownValueFor(stat.label, row)
                if (value === null) return null
                return (
                  <div
                    key={`${stat.label}-${row.label}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontFamily: 'Inter',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#978A80' }}>{row.label}</span>
                    <span style={{ color: '#FBFBFD' }}>{fmtUsd(value)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )

  const totalColumns = [totalStats.slice(0, 2), totalStats.slice(2, 4)]
  const dailyColumns = [dailyStats.slice(0, 2), dailyStats.slice(2)]

  const renderDesktopMetric = (stat: { label: string; value: string; sub?: string }) => (
    <div key={stat.label} className="flex flex-col gap-1 min-w-0">
      {isLoading ? (
        <>
          <div className="animate-pulse rounded h-[14px] w-[42%]" style={{ background: '#493E35' }} />
          <div className="animate-pulse rounded h-[20px] w-[34%]" style={{ background: '#493E35' }} />
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#CFC7C1', lineHeight: '19px' }}>
            {stat.label}
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '20px',
              fontWeight: 700,
              color: '#D8A072',
              whiteSpace: 'nowrap',
              lineHeight: '22px',
            }}
          >
            {stat.value}
          </div>
          {stat.sub && (
            <div
              style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 400, color: '#6B6059', lineHeight: '16px' }}
            >
              {stat.sub}
            </div>
          )}
          {showBreakdown && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {breakdown.map((row) => {
                const value = breakdownValueFor(stat.label, row)
                if (value === null) return null
                return (
                  <div
                    key={`${stat.label}-${row.label}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontFamily: 'Inter',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#978A80' }}>{row.label}</span>
                    <span style={{ color: '#FBFBFD' }}>{fmtUsd(value)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div style={{ background: '#1E1915', borderRadius: '16px', padding: '16px 20px' }}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, color: '#FBFBFD', letterSpacing: '-0.02em' }}>
          Dashboard
        </div>
        <button
          type="button"
          onClick={() => setShowBreakdown((value) => !value)}
          className="hidden md:block"
          style={{
            background: showBreakdown ? '#2F2823' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 600,
            color: showBreakdown ? '#D8A072' : '#FBFBFD',
            cursor: 'pointer',
          }}
        >
          {showBreakdown ? 'Hide Detail' : 'Detail'}
        </button>
      </div>

      <div className="md:hidden grid grid-cols-1 gap-y-6">
        <div className="flex flex-col gap-4">
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '20px',
              fontWeight: 600,
              color: '#FBFBFD',
              letterSpacing: '-0.02em',
            }}
          >
            Total
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {totalColumns.map((column, index) => (
              <div key={index} className="flex flex-col gap-3">
                {column.map(renderMetric)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '20px',
              fontWeight: 600,
              color: '#FBFBFD',
              letterSpacing: '-0.02em',
            }}
          >
            {PERIOD_LABELS[period]}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {dailyColumns.map((column, index) => (
              <div key={index} className="flex flex-col gap-3">
                {column.map(renderMetric)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-x-8 gap-y-4">
        <div
          className="col-span-2"
          style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, color: '#FBFBFD', letterSpacing: '-0.02em' }}
        >
          Total
        </div>
        <div
          className="col-span-2"
          style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, color: '#FBFBFD', letterSpacing: '-0.02em' }}
        >
          {PERIOD_LABELS[period]}
        </div>
        <div>{renderDesktopMetric(totalStats[0])}</div>
        <div>{renderDesktopMetric(totalStats[1])}</div>
        <div>{dailyStats[0] ? renderDesktopMetric(dailyStats[0]) : null}</div>
        <div>{dailyStats[1] ? renderDesktopMetric(dailyStats[1]) : null}</div>
        <div>{renderDesktopMetric(totalStats[2])}</div>
        <div>{renderDesktopMetric(totalStats[3])}</div>
        <div>{dailyStats[2] ? renderDesktopMetric(dailyStats[2]) : null}</div>
        <div />
      </div>
      <div className="mt-4 flex justify-end md:hidden">
        <button
          type="button"
          onClick={() => setShowBreakdown((value) => !value)}
          style={{
            background: showBreakdown ? '#2F2823' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 600,
            color: showBreakdown ? '#D8A072' : '#FBFBFD',
            cursor: 'pointer',
          }}
        >
          {showBreakdown ? 'Hide Detail' : 'Detail'}
        </button>
      </div>
    </div>
  )
}

function ChainRow({ row, period }: { row: RevenueChainRow; period: DashboardPeriod }) {
  const [expanded, setExpanded] = useState(false)
  const chainMeta = useMemo(() => availableChains.find((chain) => chain.id === row.chainId), [row.chainId])
  const isHemi = row.chainId === 43111
  const values = periodValues(row, period)

  return (
    <div style={{ background: 'transparent', borderRadius: 0, border: 'none', minWidth: 0 }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center max-md:flex-wrap max-md:gap-2 text-left p-4 sm:p-5"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div className="flex items-center gap-3 min-w-0 max-md:w-full" style={{ flex: 2 }}>
          {chainMeta?.iconUrl ? (
            <img
              src={chainMeta.iconUrl as string}
              alt={row.chainName}
              style={{ width: 28, height: 28, borderRadius: '50%' }}
            />
          ) : isHemi ? (
            <img src={HEMI_ICON_URL} alt="Hemi" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2F2823' }} />
          )}
          <div className="min-w-0 flex-1">
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>
              {row.chainName}
            </div>
          </div>
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#FBFBFD',
          }}
        >
          {fmtUsd(row.totalValueLocked)}
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '16px',
            color: '#FBFBFD',
          }}
        >
          {fmtUsd(row.totalFeeAllTime)}
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '16px',
            color: '#D8A072',
          }}
        >
          {fmtUsd(row.totalRevenueAllTime)}
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#FBFBFD',
          }}
        >
          {fmtUsd(values.volume)}
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#FBFBFD',
          }}
        >
          <VolumeMetric volume={row.zeroXVolume24h} total={values.volume} chainId={row.chainId} period={period} />
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#FBFBFD',
          }}
        >
           <VolumeMetric volume={row.kyberVolume24h} total={values.volume} chainId={row.chainId} period={period} source="kyber" />
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#FBFBFD',
          }}
        >
          {fmtUsd(values.fee)}
        </div>
        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14px',
            color: '#D8A072',
          }}
        >
          <RevenueValue value={values.revenue} />
        </div>
        <div className="hidden md:flex items-center justify-end" style={{ flex: 0.35 }}>
          <span
            style={{
              color: '#978A80',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms',
            }}
          >
            ⌄
          </span>
        </div>
        <div className="md:hidden w-full grid grid-cols-2 gap-2 mt-2">
          <MetricChip label="TVL" value={fmtUsd(row.totalValueLocked)} />
          <MetricChip label="Fee All-time" value={fmtUsd(row.totalFeeAllTime)} />
          <MetricChip label="Rev. All-time" value={fmtUsd(row.totalRevenueAllTime)} accent />
          <MetricChip label={`Volume ${PERIOD_LABELS[period]}`} value={fmtUsd(values.volume)} />
          <MetricChip
            label="0x Vol."
            value={<VolumeMetric volume={row.zeroXVolume24h} total={values.volume} chainId={row.chainId} period={period} />}
          />
          <MetricChip
            label="Kyber Vol."
             value={<VolumeMetric volume={row.kyberVolume24h} total={values.volume} chainId={row.chainId} period={period} source="kyber" />}
          />
          <MetricChip label={`Fee ${PERIOD_LABELS[period]}`} value={fmtUsd(values.fee)} />
          <MetricChip
            label={`Revenue ${PERIOD_LABELS[period]}`}
            value={<RevenueValue value={values.revenue} />}
            accent
          />
        </div>
      </button>
      {expanded && (
       <div style={{ background: '#000000', borderTop: 'none', borderRadius: '12px', padding: '12px 16px 16px', minWidth: 0 }}>
          <ChainPairMetrics row={row} period={period} />
        </div>
      )}
    </div>
  )
}

function MetricChip({ label, value, accent = false }: { label: ReactNode; value: ReactNode; accent?: boolean }) {
  return (
    <div style={{ background: '#1E1915', borderRadius: '8px', padding: '10px 12px', border: '1px solid #2F2823' }}>
      <div style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 500, color: '#978A80', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: accent ? '#D8A072' : '#FBFBFD' }}>
        {value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { chains, stats, breakdown, isLoading, isError } = useRevenueDashboard()
  const [period, setPeriod] = useState<DashboardPeriod>('24h')
  const periodVolume = period === '24h' ? stats.totalVolume24h : period === '7d' ? stats.totalVolume7d : period === '30d' ? stats.totalVolume30d : stats.totalVolumeAllTime
  const periodFee = period === '24h' ? stats.totalFee24h : period === '7d' ? stats.totalFee7d : period === '30d' ? stats.totalFee30d : stats.totalFeeAllTime
  const periodRevenue = period === '24h' ? stats.totalRevenue24h : period === '7d' ? stats.totalRevenue7d : period === '30d' ? stats.totalRevenue30d : stats.totalRevenueAllTime
  const { data: protocolStats, isLoading: isLoadingProtocolStats } = useQuery<ProtocolStats>({
    queryKey: ['protocolStats'],
    queryFn: fetchProtocolStats,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })
  const statCards = [
    {
      label: 'Total Value Locked',
      value: fmtUsd(protocolStats?.currentTvl ?? 0),
      sub: 'Current TVL',
      group: 'total' as const,
    },
    {
      label: 'Total Fee All-time',
      value: fmtUsd(stats.totalFeeAllTime),
      sub: 'Since launch',
      group: 'total' as const,
    },
    {
      label: 'Total Revenue All-time',
      value: fmtUsd(stats.totalRevenueAllTime),
      sub: 'Since launch',
      group: 'total' as const,
    },
    {
      label: 'All-time Volume',
      value: fmtUsd(protocolStats?.volumeAllTime ?? 0),
      sub: 'Since launch',
      group: 'total' as const,
    },
    {
      label: `Volume ${PERIOD_LABELS[period]}`,
      value: fmtUsd(periodVolume),
      sub: 'Across all chains',
      group: '24h' as const,
    },
    { label: `Fee ${PERIOD_LABELS[period]}`, value: fmtUsd(periodFee), sub: 'Across all chains', group: '24h' as const },
    { label: `Revenue ${PERIOD_LABELS[period]}`, value: fmtUsd(periodRevenue), sub: 'Across all chains', group: '24h' as const },
  ]

  return (
    <PageWrapper className="min-w-0" style={{ background: 'transparent', border: 'none', borderRadius: 0 }}>
      <AutoColumn gap="md" justify="center" className="min-w-0 p-[12px] pt-[16px] sm:pt-[24px] lg:p-[24px]">
        <AutoColumn className="min-w-0 gap-4 sm:gap-6" style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="fixed right-3 top-[86px] z-30 rounded-[10px] p-1 shadow-lg" style={{ background: '#1E1915', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)' }}>
            <PeriodToggle period={period} onChange={setPeriod} vertical />
          </div>

          <DashboardStatsBar
            stats={statCards}
            breakdown={breakdown}
            period={period}
            isLoading={isLoading || isLoadingProtocolStats}
          />
          <DashboardHistoryChart history={stats.history} period={period} />

          <div style={{ background: '#1E1915', borderRadius: '16px', overflow: 'hidden', padding: '12px 16px 16px' }}>
            <div
              className="hidden md:flex items-center"
              style={{
                padding: '8px 0',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
                color: '#978A80',
                gap: '8px',
              }}
            >
              <span style={{ flex: 2 }}>Chain</span>
              <span style={{ flex: 1, textAlign: 'right' }}>TVL</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Rev. All-time</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Vol. {PERIOD_LABELS[period]}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>0x Vol.</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Kyber Vol.</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Fee {PERIOD_LABELS[period]}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Revenue {PERIOD_LABELS[period]}</span>
              <span style={{ flex: 0.35 }} />
            </div>

            {isError ? (
              <EmptyProposals>
                <TYPE.body color={'#978A80'} textAlign="center">
                  Failed to load dashboard data.
                </TYPE.body>
              </EmptyProposals>
            ) : chains.length > 0 ? (
              <div className="flex flex-col gap-3">
                {chains.map((row) => (
                  <ChainRow key={row.chainId} row={row} period={period} />
                ))}
              </div>
            ) : (
              <EmptyProposals>
                <TYPE.body color={'#978A80'} textAlign="center">
                  No dashboard data found.
                </TYPE.body>
              </EmptyProposals>
            )}
          </div>
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
