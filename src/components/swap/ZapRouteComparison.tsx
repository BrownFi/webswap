/**
 * Zap route picker — visual mirror of ./RouteComparison for the swap card,
 * adapted for ZapInQuote's `lpOut` metric (LP tokens minted) instead of
 * the swap's `amountOut`.
 *
 * Collapsed: a single row card showing the active route + Best badge +
 * chevron. Expanded: all candidates as a list with radio dots; click a row
 * to pin that source, click the currently-Best row to drop the pin and go
 * back to auto-track.
 *
 * Rendered from `attempts` (every supported adapter, including
 * status==='no-route' ones) so unavailable engines show as dimmed rows
 * with a status badge — discoverability without footguns.
 */
import { useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import type { ZapAdapterStatus, ZapInAdapterAttempt, ZapChoice } from 'hooks/useBestZapRoute'
import type { ZapAggregatorId } from 'services/aggregators/zapTypes'

interface Props {
  /** Every adapter that ran, regardless of outcome. Rendered as rows. */
  attempts: ZapInAdapterAttempt[]
  /** User pin ('auto' = pick best). */
  selected: ZapChoice
  onSelect: (next: ZapChoice) => void
  /** True while any adapter quote is still in-flight on the initial fetch. */
  isLoading?: boolean
}

const LP_DECIMALS = 18

function formatLp(lp: BigNumber | undefined): string {
  if (!lp || lp.isZero()) return '-'
  const num = Number(lp.toString()) / 10 ** LP_DECIMALS
  if (!isFinite(num) || num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  return Number(num.toPrecision(6)).toString()
}

function ChevronIcon({ open, dim = false }: { open: boolean; dim?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
        flexShrink: 0,
        opacity: dim ? 0.3 : 1,
      }}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#978A80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Skel({ w, h }: { w: number | string; h: number }) {
  const width = typeof w === 'number' ? `${w}px` : w
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        height: `${h}px`,
        borderRadius: '4px',
        background: '#2F2823',
        opacity: 0.45,
        animation: 'bf-pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

export function ZapRouteComparison({ attempts, selected, onSelect, isLoading = false }: Props) {
  const [open, setOpen] = useState(false)

  // Winner = first attempt that returned a route. Mirrors swap's "first
  // selectable" logic; here "selectable" = status==='success'.
  const winnerKey = attempts.find((a) => a.status === 'success')?.source ?? attempts[0]?.source
  const activeKey: ZapChoice =
    selected === 'auto' ? ((winnerKey ?? 'native') as ZapChoice) : selected

  const rows = useMemo(() => {
    const successful = attempts.filter((a) => a.status === 'success')
    const winner = successful[0]
    const bestLp = winner?.candidate?.lpOut
    const deltaBpsFor = (a: ZapInAdapterAttempt): number | undefined => {
      if (!bestLp || !a.candidate || a.source === winner?.source) return undefined
      if (bestLp.isZero()) return undefined
      return Number(a.candidate.lpOut.sub(bestLp).mul(10000).div(bestLp).toString())
    }
    return attempts.map((a) => ({
      key: a.source as ZapChoice,
      label: a.sourceName,
      lpOut: a.candidate?.lpOut,
      deltaBps: deltaBpsFor(a),
      isBest: a.source === winner?.source,
      status: a.status as ZapAdapterStatus,
    }))
  }, [attempts])

  if (rows.length < 1) return null
  const activeRow = rows.find((r) => r.key === activeKey) ?? rows[0]
  const hasMultiple = rows.length > 1

  const handleSelect = (key: ZapChoice, status: ZapAdapterStatus) => {
    // Don't let users pin to a 'no-route' source — that would leave them
    // stuck with no executable route. Visual is also disabled.
    if (status === 'no-route') return
    // Clicking the currently-Best row → drop the pin and return to auto.
    // Matches swap's UX so users can escape an accidental pin without a
    // separate Reset button.
    if (key === winnerKey) {
      onSelect('auto')
    } else {
      onSelect(key as ZapChoice)
    }
  }

  return (
    <div
      style={{
        marginTop: '8px',
        background: '#1E1915',
        border: '1px solid #2F2823',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <style>{`@keyframes bf-pulse {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 0.55; }
      }`}</style>

      {/* Trigger row — collapsed view. */}
      <button
        type="button"
        onClick={() => hasMultiple && !isLoading && setOpen((v) => !v)}
        disabled={!hasMultiple || isLoading}
        aria-expanded={open && !isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          minHeight: 46,
          background: 'transparent',
          border: 'none',
          cursor: hasMultiple && !isLoading ? 'pointer' : 'default',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 600,
              color: '#978A80',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Route
          </span>
          {isLoading ? (
            <>
              <Skel w={86} h={14} />
              <Skel w={36} h={14} />
            </>
          ) : (
            <>
              <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#FBFBFD' }}>
                {activeRow.label}
              </span>
              {activeRow.isBest && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(131, 207, 132, 0.12)',
                    border: '1px solid rgba(131, 207, 132, 0.35)',
                    fontFamily: 'Inter',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#83CF84',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Best
                </span>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isLoading ? (
            <Skel w={84} h={14} />
          ) : activeRow.lpOut ? (
            <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#FBFBFD' }}>
              {formatLp(activeRow.lpOut)} LP
            </span>
          ) : (
            <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#978A80' }}>
              No route
            </span>
          )}
          {hasMultiple && <ChevronIcon open={open && !isLoading} dim={isLoading} />}
        </div>
      </button>

      {/* Accordion body. */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open && hasMultiple && !isLoading ? '1fr' : '0fr',
          transition: 'grid-template-rows 220ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              borderTop: '1px solid #2F2823',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {rows.map((row) => {
              const active = activeKey === row.key
              const disabled = row.status === 'no-route'
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => handleSelect(row.key, row.status)}
                  disabled={disabled}
                  title={disabled ? 'No route available from this source' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${active ? '#985C2A' : 'transparent'}`,
                    background: active ? 'rgba(152, 92, 42, 0.10)' : 'transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                    transition: 'background 150ms, border-color 150ms',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!active && !disabled) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active && !disabled) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `1.5px solid ${active ? '#D8A072' : '#493E35'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {active && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D8A072' }} />
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: active ? '#FBFBFD' : '#CFC7C1',
                      }}
                    >
                      {row.label}
                    </span>
                    {row.status === 'no-route' && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'rgba(255, 59, 106, 0.10)',
                          border: '1px solid rgba(255, 59, 106, 0.30)',
                          fontFamily: 'Inter',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#FF7A95',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        No route
                      </span>
                    )}
                    {row.isBest && row.status === 'success' && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'rgba(131, 207, 132, 0.12)',
                          border: '1px solid rgba(131, 207, 132, 0.35)',
                          fontFamily: 'Inter',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#83CF84',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Best
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: active ? '#FBFBFD' : '#CFC7C1',
                      }}
                    >
                      {row.lpOut ? `${formatLp(row.lpOut)} LP` : '-'}
                    </span>
                    {row.deltaBps !== undefined && (
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: row.deltaBps < 0 ? '#D8A072' : '#83CF84',
                        }}
                      >
                        {row.deltaBps > 0 ? '+' : ''}
                        {(row.deltaBps / 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Re-export ZapAggregatorId so consumers don't need both imports for typing.
export type { ZapAggregatorId }
