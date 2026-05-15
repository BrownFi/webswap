/**
 * Route picker shown above the price row on the Swap page.
 *
 * Collapsed by default — the trigger shows the currently-active route
 * (Best by default; user's pin if they clicked one). Click the trigger
 * to expand the comparison panel with all candidates. Click any row to
 * pin that source and auto-collapse.
 *
 * Selection semantics:
 * - selectedAggregator === 'auto' (initial state) → the active row is
 *   whichever currently has the highest amountOut. Quote refreshes track
 *   the winner automatically.
 * - User clicks a row → selectedAggregator is pinned to that source.
 *   Subsequent quote refreshes don't change the selection.
 *
 * Rendering rules:
 * - Hidden when there are zero candidates (no route at all).
 * - When there's only one candidate the trigger renders but is
 *   non-interactive (nothing to compare).
 * - The winning candidate gets a "Best" badge in the expanded panel.
 */
import { Currency, Token } from '@brownfi/sdk'
import { useMemo, useRef, useState } from 'react'
import type { UnifiedRoute } from 'hooks/useBestSwapRoute'
import type { AggregatorChoice } from 'services/aggregators/types'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

interface Props {
  candidates: UnifiedRoute[]
  selected: AggregatorChoice
  onSelect: (next: AggregatorChoice) => void
  outputCurrency: Currency | undefined
  /** Symbol of the output token for the row labels. */
  outputSymbol: string
}

function formatAmount(rawBig: { toString(): string }, currency: Currency | undefined): string {
  const decimals = currency instanceof Token ? currency.decimals : 18
  const num = Number(rawBig.toString()) / 10 ** decimals
  if (!isFinite(num) || num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  return Number(num.toPrecision(6)).toString()
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 150ms',
        flexShrink: 0,
      }}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#978A80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RouteComparison({ candidates, selected, onSelect, outputCurrency, outputSymbol }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(ref, () => setOpen(false))

  const winnerKey = candidates[0]?.source
  const activeKey: AggregatorChoice =
    selected === 'auto' ? ((winnerKey ?? 'brownfi-v2') as AggregatorChoice) : selected

  const rows = useMemo(() => {
    return candidates.map((c) => ({
      key: c.source as AggregatorChoice,
      label: c.sourceName,
      amountOut: formatAmount(c.amountOut, outputCurrency),
      isBest: c.source === winnerKey,
    }))
  }, [candidates, outputCurrency, winnerKey])

  if (candidates.length < 1) return null
  const activeRow = rows.find((r) => r.key === activeKey) ?? rows[0]
  const hasMultiple = candidates.length > 1
  const isAuto = selected === 'auto'

  const handleSelect = (key: AggregatorChoice) => {
    // Clicking the currently-Best row means "stay on best" — drop the
    // pin and re-enter auto-track mode. Clicking any other row pins
    // explicitly to that source. This is how users escape an accidental
    // pin without needing a separate "Auto" row or "Reset" affordance.
    if (key === winnerKey) {
      onSelect('auto')
    } else {
      onSelect(key)
    }
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        marginTop: '8px',
      }}
    >
      {/* Trigger — always renders; click to expand if there's more than
          one candidate. With a single candidate the chevron is hidden
          and click is a no-op (nothing to compare to). */}
      <button
        type="button"
        onClick={() => hasMultiple && setOpen((v) => !v)}
        disabled={!hasMultiple}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '14px',
          background: '#1E1915',
          border: '1px solid #2F2823',
          cursor: hasMultiple ? 'pointer' : 'default',
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
          <span
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FBFBFD',
            }}
          >
            {activeRow.label}
          </span>
          {isAuto ? (
            // Auto-track mode: highlight tracks the winner as quotes
            // refresh. Show this instead of Best so users can tell at a
            // glance "the system is picking for me" vs "I pinned this".
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(216, 160, 114, 0.12)',
                border: '1px solid rgba(216, 160, 114, 0.35)',
                fontFamily: 'Inter',
                fontSize: '10px',
                fontWeight: 600,
                color: '#D8A072',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Auto
            </span>
          ) : activeRow.isBest ? (
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
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FBFBFD',
            }}
          >
            {activeRow.amountOut} {outputSymbol}
          </span>
          {hasMultiple && <ChevronIcon open={open} />}
        </div>
      </button>

      {/* Expanded panel — absolute-positioned below the trigger so it
          doesn't push the swap button down. Slight margin-top so the
          drop animation reads as a panel, not a tooltip. */}
      {open && hasMultiple && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#1E1915',
            border: '1px solid #2F2823',
            borderRadius: '14px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 20,
          }}
        >
          {rows.map((row) => {
            const active = activeKey === row.key
            return (
              <button
                key={row.key}
                type="button"
                onClick={() => handleSelect(row.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${active ? '#985C2A' : 'transparent'}`,
                  background: active ? 'rgba(152, 92, 42, 0.10)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 150ms, border-color 150ms',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
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
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#D8A072',
                        }}
                      />
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
                  {row.isBest && (
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
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: active ? '#FBFBFD' : '#CFC7C1',
                  }}
                >
                  {row.amountOut} {outputSymbol}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
