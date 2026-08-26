import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { availableChains } from 'connectors'
import { AutoColumn } from 'components/Column'
import { Flex } from 'components/Rebass'
import { EmptyProposals, PageWrapper, TitleRow } from 'pages/Pool/styleds'
import { fetchProtocolStats, type ProtocolStats } from 'services/protocolStatsService'
import { TYPE } from 'theme'
import { VERSION, versionLabel } from 'lib/sdk/constants/addresses'
import { useRevenueDashboard, type RevenueChainRow, type RevenueVersionRow } from './useRevenueDashboard'

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

function DashboardStatsBar({ stats, isLoading }: { stats: { label: string; value: string; sub?: string }[]; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`relative overflow-hidden flex flex-col gap-[4px] sm:gap-[8px] p-[12px] sm:p-[20px] items-center md:items-start text-center md:text-left ${
            index === 0 ? 'col-span-2 md:col-span-1' : ''
          }`}
          style={{ background: '#2F2823', borderRadius: '12px' }}
        >
          {isLoading ? (
            <>
              <div className="animate-pulse rounded h-[16px] sm:h-[20px] w-[60%]" style={{ background: '#493E35' }} />
              <div className="animate-pulse rounded h-[22px] sm:h-[28px] w-[80%]" style={{ background: '#493E35' }} />
              <div className="animate-pulse rounded h-[14px] sm:h-[18px] w-[50%]" style={{ background: '#493E35' }} />
            </>
          ) : (
            <>
              <span className="text-[11px] sm:text-[14px]" style={{ fontFamily: 'Inter', fontWeight: 500, lineHeight: '1.4', color: '#FBFBFD' }}>
                {stat.label}
              </span>
              <span
                className="text-[16px] sm:text-[22px] leading-[22px] sm:leading-[28px]"
                style={{ fontFamily: 'Inter', fontWeight: 700, letterSpacing: '-0.02em', color: '#D8A072' }}
              >
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-[10px] sm:text-[13px]" style={{ fontFamily: 'Inter', fontWeight: 400, lineHeight: '1.4', letterSpacing: '-0.02em', color: '#978A80' }}>
                  {stat.sub}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function VersionBadge({ row }: { row: RevenueVersionRow }) {
  const isV2 = row.version === VERSION.V2
  const isHemi = row.version === 'hemi'
  const label = isHemi ? 'Hemi' : versionLabel(row.version)
  return (
    <div className="inline-flex items-center gap-2">
      <span
        style={{
          padding: '2px 6px',
          borderRadius: '6px',
          background: isHemi ? 'rgba(111, 179, 230, 0.12)' : isV2 ? 'rgba(151, 138, 128, 0.12)' : 'rgba(196, 148, 58, 0.12)',
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

function ChainRow({ row }: { row: RevenueChainRow }) {
  const [expanded, setExpanded] = useState(false)
  const chainMeta = useMemo(() => availableChains.find((chain) => chain.id === row.chainId), [row.chainId])
  const isHemi = row.chainId === 43111

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
            <img src={chainMeta.iconUrl as string} alt={row.chainName} style={{ width: 28, height: 28, borderRadius: '50%' }} />
          ) : isHemi ? (
            <img src={HEMI_ICON_URL} alt="Hemi" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2F2823' }} />
          )}
          <div className="min-w-0 flex-1">
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>{row.chainName}</div>
          </div>
        </div>
        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 600, fontSize: '16px', color: '#FBFBFD' }}>{fmtUsd(row.totalFeeAllTime)}</div>
        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 600, fontSize: '16px', color: '#D8A072' }}>{fmtUsd(row.totalRevenueAllTime)}</div>
        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#FBFBFD' }}>{fmtUsd(row.totalFee24h)}</div>
        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#D8A072' }}>{fmtUsd(row.totalRevenue24h)}</div>
        <div className="hidden md:flex items-center justify-end" style={{ flex: 0.35 }}>
          <span style={{ color: '#978A80', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}>⌄</span>
        </div>
        <div className="md:hidden w-full grid grid-cols-2 gap-2 mt-2">
          <MetricChip label="Fee All-time" value={fmtUsd(row.totalFeeAllTime)} />
          <MetricChip label="Revenue All-time" value={fmtUsd(row.totalRevenueAllTime)} accent />
          <MetricChip label="Fee 24h" value={fmtUsd(row.totalFee24h)} />
          <MetricChip label="Revenue 24h" value={fmtUsd(row.totalRevenue24h)} accent />
        </div>
      </button>
      {expanded && (
        <div style={{ borderTop: '1px solid #2F2823', padding: '12px 16px 16px' }}>
          <div className="hidden md:flex items-center" style={{ gap: '8px', paddingBottom: '8px', fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>
            <span style={{ flex: 1.4 }}>Source</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee 24h</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue 24h</span>
          </div>
          <div className="flex flex-col gap-2">
            {row.versions.map((versionRow) => (
              <div key={`${row.chainId}-${versionRow.version}`} className="flex items-center max-md:flex-wrap max-md:gap-2" style={{ gap: '8px', background: '#15110E', borderRadius: '10px', padding: '12px' }}>
                <div className="max-md:w-full" style={{ flex: 1.4 }}>
                  <VersionBadge row={versionRow} />
                </div>
                <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}>{fmtUsd(versionRow.totalFeeAllTime)}</div>
                <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#D8A072' }}>{fmtUsd(versionRow.totalRevenueAllTime)}</div>
                <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}>{fmtUsd(versionRow.totalFee24h)}</div>
                <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#D8A072' }}>{fmtUsd(versionRow.totalRevenue24h)}</div>
                <div className="md:hidden w-full grid grid-cols-2 gap-2 mt-1">
                  <MetricChip label="Fee All-time" value={fmtUsd(versionRow.totalFeeAllTime)} />
                  <MetricChip label="Revenue All-time" value={fmtUsd(versionRow.totalRevenueAllTime)} accent />
                  <MetricChip label="Fee 24h" value={fmtUsd(versionRow.totalFee24h)} />
                  <MetricChip label="Revenue 24h" value={fmtUsd(versionRow.totalRevenue24h)} accent />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricChip({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: '#1E1915', borderRadius: '8px', padding: '10px 12px', border: '1px solid #2F2823' }}>
      <div style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 500, color: '#978A80', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: accent ? '#D8A072' : '#FBFBFD' }}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { chains, archivedV2, stats, isLoading, isError } = useRevenueDashboard()
  const { data: protocolStats, isLoading: isLoadingProtocolStats } = useQuery<ProtocolStats>({
    queryKey: ['protocolStats'],
    queryFn: fetchProtocolStats,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })

  const statCards = [
    { label: 'Total Value Locked', value: fmtUsd(protocolStats?.currentTvl ?? 0), sub: 'Current TVL' },
    { label: 'All-time Volume', value: fmtUsd(protocolStats?.volumeAllTime ?? 0), sub: 'Since launch' },
    { label: '24h Volume', value: fmtUsd(protocolStats?.volume24h ?? 0), sub: 'Across all chains' },
    { label: 'Total Fee All-time', value: fmtUsd(protocolStats?.feesAllTime ?? 0), sub: 'Since launch' },
    { label: 'Total Revenue All-time', value: fmtUsd(stats.totalRevenueAllTime), sub: 'Since launch' },
    { label: 'Total Fee 24h', value: fmtUsd(protocolStats?.fees24h ?? 0), sub: 'Across all chains' },
    { label: 'Total Revenue 24h', value: fmtUsd(stats.totalRevenue24h), sub: 'Across all chains' },
  ]

  return (
    <PageWrapper>
      <AutoColumn gap="md" justify="center" className="p-[12px] pt-[16px] sm:pt-[24px] lg:p-[24px]">
        <AutoColumn className="gap-4 sm:gap-6" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <TitleRow padding={'0'}>
            <Flex alignItems="center" className="gap-4 flex-wrap">
              <span className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]" style={{ fontFamily: 'Inter', fontWeight: 600, letterSpacing: '-0.02em', color: '#FBFBFD' }}>
                Revenue Dashboard
              </span>
            </Flex>
          </TitleRow>

          <DashboardStatsBar stats={statCards} isLoading={isLoading || isLoadingProtocolStats} />

          <div className="hidden md:flex items-center" style={{ padding: '8px 16px', fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80', gap: '8px' }}>
            <span style={{ flex: 2 }}>Chain</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue All-time</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Fee 24h</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Revenue 24h</span>
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
                <ChainRow key={row.chainId} row={row} />
              ))}
            </div>
          ) : (
            <EmptyProposals>
              <TYPE.body color={'#978A80'} textAlign="center">
                No dashboard data found.
              </TYPE.body>
            </EmptyProposals>
          )}

          {archivedV2.length > 0 && (
            <div className="flex flex-col gap-3">
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD' }}>V2 Archived</div>
              <div style={{ background: '#1E1915', borderRadius: '12px', border: '1px solid #2F2823', padding: '16px' }}>
                <div className="hidden md:flex items-center" style={{ gap: '8px', paddingBottom: '8px', fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>
                  <span style={{ flex: 1.4 }}>Chain</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Fee All-time</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Revenue All-time</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Fee 24h</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Revenue 24h</span>
                </div>
                <div className="flex flex-col gap-2">
                  {archivedV2.map((row) => {
                    const chainMeta = availableChains.find((chain) => chain.id === row.chainId)
                    return (
                      <div key={`archived-${row.chainId}`} className="flex items-center max-md:flex-wrap max-md:gap-2" style={{ gap: '8px', background: '#15110E', borderRadius: '10px', padding: '12px' }}>
                        <div className="flex items-center gap-3 min-w-0 max-md:w-full" style={{ flex: 1.4 }}>
                          {chainMeta?.iconUrl ? (
                            <img src={chainMeta.iconUrl as string} alt={row.chainName} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2F2823' }} />
                          )}
                          <div className="min-w-0 flex-1">
                            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '16px', color: '#FBFBFD' }}>{row.chainName}</div>
                            <div style={{ marginTop: 4 }}><VersionBadge row={row} /></div>
                          </div>
                        </div>
                        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#FBFBFD' }}>{fmtUsd(row.totalFeeAllTime)}</div>
                        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#D8A072' }}>{fmtUsd(row.totalRevenueAllTime)}</div>
                        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#978A80' }}>{fmtUsd(row.totalFee24h)}</div>
                        <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', color: '#978A80' }}>{fmtUsd(row.totalRevenue24h)}</div>
                        <div className="md:hidden w-full grid grid-cols-2 gap-2 mt-1">
                          <MetricChip label="Fee All-time" value={fmtUsd(row.totalFeeAllTime)} />
                          <MetricChip label="Revenue All-time" value={fmtUsd(row.totalRevenueAllTime)} accent />
                          <MetricChip label="Fee 24h" value={fmtUsd(row.totalFee24h)} />
                          <MetricChip label="Revenue 24h" value={fmtUsd(row.totalRevenue24h)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
