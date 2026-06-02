/**
 * My Portfolio page — single-chain view of the connected user's LP
 * positions, with aggregate stats up top and a sortable per-position
 * table below. Closed positions (lp = 0 but historical PnL exists) live
 * in a collapsed section underneath the active list.
 *
 * Data comes from `usePortfolio`, which fans out V2 + V3 indexer queries
 * and merges by descending USD value. Each row carries its version
 * badge so the unified list still tells the user where each position
 * lives.
 *
 * Multi-chain aggregation is intentionally out of scope — the indexer
 * is per-chain and most users LP on one chain. Adding cross-chain would
 * require fanning the query out to every available chain + a chain
 * column in the table; deferred until product asks for it.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AutoColumn } from 'components/Column'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { Token } from '@brownfi/sdk'
import { Address, checksumAddress } from 'viem'
import { useActiveWeb3React } from 'hooks'
import { availableChains } from 'connectors'
import ConnectWallet from 'components/ConnectWallet'
import { EmptyProposals, PageWrapper, TitleRow } from 'pages/Pool/styleds'
import { TYPE } from 'theme'
import { Flex } from 'components/Rebass'
import { usePortfolio, type PortfolioPosition } from './usePortfolio'
import { formatNumber } from 'utils/prices'

const labelStyle = { fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#978A80' } as const

function fmtUsd(n: number, opts?: { showSign?: boolean }) {
  if (!Number.isFinite(n) || n === 0) return '$0.00'
  const sign = opts?.showSign && n > 0 ? '+' : ''
  const abs = Math.abs(n)
  const formatted =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
        ? `$${(abs / 1_000).toFixed(2)}K`
        : abs >= 1
          ? `$${abs.toFixed(2)}`
          : `$${abs.toFixed(4)}`
  return n < 0 ? `-${formatted}` : `${sign}${formatted}`
}

function fmtPct(n: number) {
  if (!Number.isFinite(n)) return '0.00%'
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)}%`
}

function pnlColor(n: number) {
  if (n > 0) return '#83CF84'
  if (n < 0) return '#FF7A95'
  return '#978A80'
}

// Stats bar mirroring pages/Pool/index.tsx's PoolStatsBar — same chassis
// (dark brown solid card, orange value, white label, grey sub) so the
// Portfolio page reads as a sibling of Pool rather than its own visual
// dialect. First card spans 2 cols on mobile so the primary stat (Total
// Value) gets prominence in the narrow viewport.
//
// `subColor` lets PnL / vs-HODL cards tint their sub text green or red
// without breaking the uniform orange-value language — the value itself
// stays neutral, the sub line carries the sign signal.
function PortfolioStatsBar({
  stats,
  isLoading,
}: {
  stats: {
    label: string
    value: string
    sub?: string
    subColor?: string
  }[]
  isLoading?: boolean
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`relative overflow-hidden flex flex-col gap-[4px] sm:gap-[8px] p-[12px] sm:p-[20px] items-center md:items-start text-center md:text-left ${
            index === 0 ? 'col-span-2 md:col-span-1' : ''
          }`}
          style={{
            background: '#2F2823',
            borderRadius: '12px',
          }}
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
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#D8A072',
                }}
              >
                {stat.value}
              </span>
              {stat.sub && (
                <span
                  className="text-[10px] sm:text-[13px]"
                  style={{ fontFamily: 'Inter', fontWeight: 400, lineHeight: '1.4', letterSpacing: '-0.02em', color: stat.subColor ?? '#978A80' }}
                >
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

// Version pill rendered next to each position. Distinct from BrownFi's
// V2/V3 toggle elsewhere — this is a read-only badge so the user knows
// which contract surface holds the position.
function VersionBadge({ version }: { version: 2 | 3 }) {
  const v3 = version === 3
  return (
    <span
      style={{
        padding: '2px 6px',
        borderRadius: '6px',
        background: v3 ? 'rgba(196, 148, 58, 0.12)' : 'rgba(151, 138, 128, 0.12)',
        border: `1px solid ${v3 ? 'rgba(196, 148, 58, 0.35)' : 'rgba(151, 138, 128, 0.35)'}`,
        fontFamily: 'Inter',
        fontSize: '10px',
        fontWeight: 600,
        color: v3 ? '#C4943A' : '#CFC7C1',
        letterSpacing: '0.04em',
      }}
    >
      V{version}
    </span>
  )
}

function PositionRow({ position }: { position: PortfolioPosition }) {
  const navigate = useNavigate()
  // chainId is per-position now — the position lives on whichever chain
  // the indexer query returned it from, NOT the currently-active wallet
  // chain. The route below also uses position.chainId so the pool detail
  // page lands on the right network without forcing the user to switch
  // wallets first.
  const positionChainId = position.chainId

  // Look up the chain metadata (icon + name) from connectors. availableChains
  // is the same registry the header chain selector renders from, so the
  // icons stay visually consistent with the rest of the app.
  const chainMeta = useMemo(() => availableChains.find((c) => c.id === positionChainId), [positionChainId])

  // The pair token entities from the indexer are raw shapes — wrap them in
  // SDK Token objects so DoubleCurrencyLogo gets a normalized currency
  // input (it uses currency.symbol + addresses for icon resolution).
  const { token0, token1 } = position.pair
  const c0 = useMemo(
    () => new Token(positionChainId, checksumAddress(token0.id as Address), token0.decimals, token0.symbol, token0.name),
    [token0, positionChainId],
  )
  const c1 = useMemo(
    () => new Token(positionChainId, checksumAddress(token1.id as Address), token1.decimals, token1.symbol, token1.name),
    [token1, positionChainId],
  )

  const handleClick = () => navigate(`/pool/${positionChainId}/${position.pair.id}`)

  const pnlPct = position.basePortfolio > 0 ? position.unrealizedPnL / position.basePortfolio : 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      className="flex items-center max-md:flex-wrap max-md:gap-2 cursor-pointer hover:!bg-[#252019]"
      style={{
        padding: '16px',
        gap: '8px',
        minHeight: '60px',
        background: '#1E1915',
        borderRadius: '8px',
        marginBottom: '8px',
        transition: 'background 150ms',
      }}
    >
      <div className="flex items-center gap-3 min-w-0 max-md:w-full" style={{ flex: 2 }}>
        <DoubleCurrencyLogo currency0={c0} currency1={c1} size={32} />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FBFBFD' }}>
              {c0.symbol}/{c1.symbol}
            </span>
            <VersionBadge version={position.version} />
            {chainMeta && (
              <span
                title={chainMeta.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                }}
              >
                {chainMeta.iconUrl && (
                  <img
                    src={chainMeta.iconUrl as string}
                    alt={chainMeta.name}
                    style={{ width: 12, height: 12, borderRadius: '50%' }}
                  />
                )}
                <span style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: 600, color: '#CFC7C1', letterSpacing: '0.02em' }}>
                  {chainMeta.name}
                </span>
              </span>
            )}
          </div>
          {position.stakeLP > 0 && (
            <span style={{ ...labelStyle, marginTop: '2px' }}>
              {formatNumber(position.stakeLP, { maximumFractionDigits: 4 })} staked
            </span>
          )}
        </div>
      </div>
      <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right' }}>
        <span style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FBFBFD' }}>
          {fmtUsd(position.lpPortfolio)}
        </span>
      </div>
      <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right' }}>
        <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: pnlColor(position.unrealizedPnL) }}>
          {fmtUsd(position.unrealizedPnL, { showSign: true })}
        </span>
      </div>
      <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right' }}>
        <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: pnlColor(position.unrealizedPnL) }}>
          {fmtPct(pnlPct)}
        </span>
      </div>
      <div className="max-md:hidden" style={{ flex: 1, textAlign: 'right' }}>
        <span
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            fontWeight: 500,
            color: pnlColor(position.lpPortfolio - position.bnhPortfolio),
          }}
        >
          {fmtUsd(position.lpPortfolio - position.bnhPortfolio, { showSign: true })}
        </span>
      </div>
    </div>
  )
}

function TableHeader() {
  return (
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
      <span style={{ flex: 2 }}>Pool</span>
      <span style={{ flex: 1, textAlign: 'right' }}>Value</span>
      <span style={{ flex: 1, textAlign: 'right' }}>PnL</span>
      <span style={{ flex: 1, textAlign: 'right' }}>ROI</span>
      <span style={{ flex: 1, textAlign: 'right' }}>vs HODL</span>
    </div>
  )
}

export default function Portfolio() {
  const { account } = useActiveWeb3React()
  const { active, closed, stats, isLoading, isError } = usePortfolio()
  const [showClosed, setShowClosed] = useState(false)

  // Hero stats row computed inside the hook; this just renders.
  const heroPnLPct = stats.totalBasePortfolio > 0 ? stats.totalPnL / stats.totalBasePortfolio : 0

  return (
    <PageWrapper>
      <AutoColumn gap="md" justify="center" className="p-[12px] pt-[16px] sm:pt-[24px] lg:p-[24px]">
        <AutoColumn className="gap-4 sm:gap-6" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <TitleRow padding={'0'}>
            <Flex alignItems="center" className="gap-4">
              <span
                className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FBFBFD',
                }}
              >
                My Portfolio
              </span>
            </Flex>
          </TitleRow>

          {!account ? (
            <EmptyProposals style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <TYPE.body color="#978A80" textAlign="center">
                Connect your wallet to view your liquidity positions.
              </TYPE.body>
              <ConnectWallet />
            </EmptyProposals>
          ) : (
            <>
              {/* Hero stats — same chassis as Pool page's PoolStatsBar. The
                  sub-text under Total Value reflects cross-chain aggregation
                  so the user sees both position count AND distinct chains. */}
              <PortfolioStatsBar
                isLoading={isLoading && active.length === 0}
                stats={[
                  {
                    label: 'Total Value',
                    value: fmtUsd(stats.totalValue),
                    sub:
                      stats.activeChainCount > 1
                        ? `${stats.activeCount} positions · ${stats.activeChainCount} chains`
                        : `${stats.activeCount} active`,
                  },
                  {
                    label: 'Total PnL',
                    value: fmtUsd(stats.totalPnL, { showSign: true }),
                    sub: fmtPct(heroPnLPct),
                    subColor: pnlColor(stats.totalPnL),
                  },
                  {
                    label: 'vs HODL',
                    value: fmtUsd(stats.vsHodl, { showSign: true }),
                    sub: stats.vsHodl > 0 ? 'LPing winning' : stats.vsHodl < 0 ? 'HODL winning' : 'Tied',
                    subColor: pnlColor(stats.vsHodl),
                  },
                  {
                    label: 'Cost Basis',
                    value: fmtUsd(stats.totalBasePortfolio),
                    sub: 'Total invested',
                  },
                ]}
              />

              {isLoading ? (
                <EmptyProposals>
                  <TYPE.body color="#978A80" textAlign="center">
                    Loading positions…
                  </TYPE.body>
                </EmptyProposals>
              ) : isError ? (
                <EmptyProposals>
                  <TYPE.body color="#FF7A95" textAlign="center">
                    Indexer query failed. Try again in a moment.
                  </TYPE.body>
                </EmptyProposals>
              ) : active.length === 0 ? (
                <EmptyProposals>
                  <TYPE.body color="#978A80" textAlign="center">
                    You don&apos;t have any active liquidity positions on any supported chain.
                    <br />
                    Open the Pool page to start LPing.
                  </TYPE.body>
                </EmptyProposals>
              ) : (
                <>
                  <TableHeader />
                  {active.map((p) => (
                    <PositionRow key={p.id} position={p} />
                  ))}
                </>
              )}

              {/* Closed positions — collapsed by default. Useful for users who
                  want to see PnL history from positions they've fully exited. */}
              {closed.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowClosed((s) => !s)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#978A80',
                    }}
                  >
                    Closed positions ({closed.length})
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ transform: showClosed ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}
                    >
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#978A80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showClosed && (
                    <>
                      <TableHeader />
                      {closed.map((p) => (
                        <PositionRow key={p.id} position={p} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
