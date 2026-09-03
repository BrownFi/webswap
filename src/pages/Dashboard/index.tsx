import { useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { availableChains } from 'connectors'
import { AutoColumn } from 'components/Column'
import { Flex } from 'components/Rebass'
import { EmptyProposals, PageWrapper, TitleRow } from 'pages/Pool/styleds'
import { fetchProtocolStats, type ProtocolStats } from 'services/protocolStatsService'
import { TYPE } from 'theme'
import { VERSION, versionLabel } from 'lib/sdk/constants/addresses'
import {
  useRevenueDashboard,
  type RevenueChainRow,
  type RevenueStatsBreakdown,
  type RevenueVersionRow,
  type DashboardPeriod,
} from './useRevenueDashboard'

const HEMI_ICON_URL = 'https://assets.coingecko.com/coins/images/68469/standard/hemi.png'

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

function VolumeMetric({
  volume,
  total,
  chainId,
  version,
  period,
}: {
  volume: number
  total: number
  chainId: number
  version?: RevenueVersionRow['version']
  period?: DashboardPeriod
}) {
  if (period !== undefined && period !== '24h') return <span>-</span>
  if ((chainId !== 4663 && chainId !== 999) || (version !== undefined && version !== VERSION.V3_OFFICIAL))
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

const PERIOD_LABELS: Record<DashboardPeriod, string> = { '24h': '24h', '7d': '7D', '30d': '30D' }

function periodValues(row: RevenueChainRow | RevenueVersionRow, period: DashboardPeriod) {
  if (period === '7d') return { volume: row.totalVolume7d, fee: row.totalFee7d, revenue: row.totalRevenue7d }
  if (period === '30d') return { volume: row.totalVolume30d, fee: row.totalFee30d, revenue: row.totalRevenue30d }
  return { volume: row.totalVolume24h, fee: row.totalFee24h, revenue: row.totalRevenue24h }
}

function PeriodToggle({ period, onChange }: { period: DashboardPeriod; onChange: (period: DashboardPeriod) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Dashboard period">
      {(['24h', '7d', '30d'] as DashboardPeriod[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            border: `1px solid ${period === option ? '#D8A072' : '#493E35'}`,
            background: period === option ? '#2F2823' : '#1E1915',
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

function DashboardStatsBar({
  stats,
  breakdown,
  period,
  onPeriodChange,
  isLoading,
}: {
  stats: { label: string; value: string; sub?: string; group: 'total' | '24h' }[]
  breakdown: RevenueStatsBreakdown[]
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
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
    <div style={{ background: '#2F2823', borderRadius: '16px', padding: '16px 20px' }}>
      <div className="flex items-center justify-end gap-2 mb-4">
        <PeriodToggle period={period} onChange={onPeriodChange} />
        <button
          type="button"
          onClick={() => setShowBreakdown((value) => !value)}
          style={{
            background: '#1E1915',
            border: '1px solid #493E35',
            borderRadius: '8px',
            padding: '8px 12px',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 600,
            color: '#FBFBFD',
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
    </div>
  )
}

function VersionBadge({ row }: { row: RevenueVersionRow }) {
  const isV2 = row.version === VERSION.V2
  const isHemi = row.version === 'hemi'
  const label = isHemi ? 'Hemi' : versionLabel(row.version as typeof VERSION.V2 | typeof VERSION.V3_OFFICIAL)
  return (
    <div className="inline-flex items-center gap-2">
      <span
        style={{
          padding: '2px 6px',
          borderRadius: '6px',
          background: isHemi
            ? 'rgba(111, 179, 230, 0.12)'
            : isV2
              ? 'rgba(151, 138, 128, 0.12)'
              : 'rgba(196, 148, 58, 0.12)',
          border: `1px solid ${isHemi ? 'rgba(111, 179, 230, 0.35)' : isV2 ? 'rgba(151, 138, 128, 0.35)' : 'rgba(196, 148, 58, 0.35)'}`,
          fontFamily: 'Inter',
          fontSize: '10px',
          fontWeight: 600,
          color: isHemi ? '#6FB3E6' : isV2 ? '#CFC7C1' : '#C4943A',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      {row.isArchived && (
        <span style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: 500, color: '#978A80' }}>Archived</span>
      )}
    </div>
  )
}

function ChainRow({ row, period }: { row: RevenueChainRow; period: DashboardPeriod }) {
  const [expanded, setExpanded] = useState(false)
  const chainMeta = useMemo(() => availableChains.find((chain) => chain.id === row.chainId), [row.chainId])
  const isRobinhood = row.chainId === 4663
  const isHemi = row.chainId === 43111
  const values = periodValues(row, period)

  return (
    <div style={{ background: '#1E1915', borderRadius: '12px', border: '1px solid #2F2823' }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center max-md:flex-wrap max-md:gap-2 text-left"
        style={{ background: 'transparent', border: 'none', padding: '16px' }}
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
              {isRobinhood && <span style={{ marginLeft: 6, color: '#D8A072' }}>(Simulation)</span>}
            </div>
          </div>
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
          <VolumeMetric volume={row.kyberVolume24h} total={values.volume} chainId={row.chainId} period={period} />
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
          <MetricChip label="Fee All-time" value={fmtUsd(row.totalFeeAllTime)} />
          <MetricChip label="Revenue All-time" value={fmtUsd(row.totalRevenueAllTime)} accent />
          <MetricChip label={`Volume ${PERIOD_LABELS[period]}`} value={fmtUsd(values.volume)} />
          <MetricChip
            label="0x Volume"
            value={<VolumeMetric volume={row.zeroXVolume24h} total={values.volume} chainId={row.chainId} period={period} />}
          />
          <MetricChip
            label="Kyber Volume"
            value={<VolumeMetric volume={row.kyberVolume24h} total={values.volume} chainId={row.chainId} period={period} />}
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
        <div style={{ borderTop: '1px solid #2F2823', padding: '12px 16px 16px', overflowX: 'auto' }}>
          <div
            className="hidden md:grid items-center"
            style={{
              gap: '8px',
              paddingBottom: '8px',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '13px',
              color: '#978A80',
              minWidth: '900px',
              gridTemplateColumns: '1.4fr repeat(7, minmax(0, 1fr))',
            }}
          >
            <span style={{ flex: 1.4 }}>Source</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue All-time</span>
             <span style={{ flex: 1, textAlign: 'right' }}>Volume {PERIOD_LABELS[period]}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>0x Volume</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Kyber Volume</span>
             <span style={{ flex: 1, textAlign: 'right' }}>Fee {PERIOD_LABELS[period]}</span>
             <span style={{ flex: 1, textAlign: 'right' }}>Revenue {PERIOD_LABELS[period]}</span>
          </div>
          <div className="flex flex-col gap-2">
            {row.versions.map((versionRow) => (
              <div
                key={`${row.chainId}-${versionRow.version}`}
                className="flex md:grid items-center max-md:flex-wrap max-md:gap-2"
                style={{
                  gap: '8px',
                  background: '#15110E',
                  borderRadius: '10px',
                  padding: '12px',
                  minWidth: '900px',
                  gridTemplateColumns: '1.4fr repeat(7, minmax(0, 1fr))',
                }}
              >
                <div className="max-md:w-full" style={{ flex: 1.4 }}>
                  <VersionBadge row={versionRow} />
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}
                >
                  {fmtUsd(versionRow.totalFeeAllTime)}
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#D8A072' }}
                >
                  {fmtUsd(versionRow.totalRevenueAllTime)}
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}
                >
                   {fmtUsd(periodValues(versionRow, period).volume)}
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}
                >
                  <VolumeMetric
                     volume={period === '24h' ? versionRow.zeroXVolume24h : 0}
                     total={periodValues(versionRow, period).volume}
                   chainId={versionRow.chainId}
                   version={versionRow.version}
                   period={period}
                  />
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}
                >
                  <VolumeMetric
                     volume={period === '24h' ? versionRow.kyberVolume24h : 0}
                     total={periodValues(versionRow, period).volume}
                   chainId={versionRow.chainId}
                   version={versionRow.version}
                   period={period}
                  />
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}
                >
                   {fmtUsd(periodValues(versionRow, period).fee)}
                </div>
                <div
                  className="max-md:hidden"
                  style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#D8A072' }}
                >
                   {fmtUsd(periodValues(versionRow, period).revenue)}
                </div>
                <div className="md:hidden w-full grid grid-cols-2 gap-2 mt-1">
                  <MetricChip label="Fee All-time" value={fmtUsd(versionRow.totalFeeAllTime)} />
                  <MetricChip label="Revenue All-time" value={fmtUsd(versionRow.totalRevenueAllTime)} accent />
                   <MetricChip label={`Volume ${PERIOD_LABELS[period]}`} value={fmtUsd(periodValues(versionRow, period).volume)} />
                  <MetricChip
                    label="0x Volume"
                    value={
                      <VolumeMetric
                         volume={period === '24h' ? versionRow.zeroXVolume24h : 0}
                         total={periodValues(versionRow, period).volume}
                        chainId={versionRow.chainId}
                        version={versionRow.version}
                        period={period}
                      />
                    }
                  />
                  <MetricChip
                    label="Kyber Volume"
                    value={
                      <VolumeMetric
                         volume={period === '24h' ? versionRow.kyberVolume24h : 0}
                         total={periodValues(versionRow, period).volume}
                        chainId={versionRow.chainId}
                        version={versionRow.version}
                        period={period}
                      />
                    }
                  />
                   <MetricChip label={`Fee ${PERIOD_LABELS[period]}`} value={fmtUsd(periodValues(versionRow, period).fee)} />
                  <MetricChip
                     label={`Revenue ${PERIOD_LABELS[period]}`}
                     value={<RevenueValue value={periodValues(versionRow, period).revenue} />}
                    accent
                  />
                </div>
              </div>
            ))}
          </div>
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
  const [period, setPeriod] = useState<DashboardPeriod>('7d')
  const periodVolume = period === '24h' ? stats.totalVolume24h : period === '7d' ? stats.totalVolume7d : stats.totalVolume30d
  const periodFee = period === '24h' ? stats.totalFee24h : period === '7d' ? stats.totalFee7d : stats.totalFee30d
  const periodRevenue = period === '24h' ? stats.totalRevenue24h : period === '7d' ? stats.totalRevenue7d : stats.totalRevenue30d
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
      value: fmtUsd(protocolStats?.feesAllTime ?? 0),
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
    <PageWrapper>
      <AutoColumn gap="md" justify="center" className="p-[12px] pt-[16px] sm:pt-[24px] lg:p-[24px]">
        <AutoColumn className="gap-4 sm:gap-6" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <TitleRow padding={'0'}>
            <Flex alignItems="center" className="gap-4 flex-wrap">
              <span
                className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]"
                style={{ fontFamily: 'Inter', fontWeight: 600, letterSpacing: '-0.02em', color: '#FBFBFD' }}
              >
                Dashboard
              </span>
            </Flex>
          </TitleRow>

          <DashboardStatsBar
            stats={statCards}
            breakdown={breakdown}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={isLoading || isLoadingProtocolStats}
          />

          <div
            className="hidden md:flex items-center"
            style={{
              padding: '8px 16px',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '14px',
              color: '#978A80',
              gap: '8px',
            }}
          >
            <span style={{ flex: 2 }}>Chain</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue All-time</span>
             <span style={{ flex: 1, textAlign: 'right' }}>Volume {PERIOD_LABELS[period]}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>0x Volume</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Kyber Volume</span>
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
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
