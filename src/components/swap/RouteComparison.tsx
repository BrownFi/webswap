/**
 * Inline route picker shown above the price row on the Swap page.
 *
 * Lets the user see every available route side-by-side (BrownFi native +
 * each aggregator that returned a quote) and click to pin a specific
 * source. No "Auto" row — the Best badge already encodes the winner.
 *
 * Selection semantics:
 * - selectedAggregator === 'auto' (initial state) → the row with the
 *   Best badge is visually active. Quotes refresh, badge + active row
 *   follow the new winner automatically.
 * - User clicks any row → selectedAggregator is pinned to that source.
 *   Subsequent quote refreshes don't change the selection.
 *
 * Rendering rules:
 * - Hidden when there are fewer than 2 candidates (no choice to make).
 * - Each row's amountOut is formatted by the output token's decimals.
 * - The winning candidate gets a "Best" badge.
 * - Active row has a radio-style filled dot + copper border.
 */
import { Currency, Token } from '@brownfi/sdk'
import { useMemo } from 'react'
import type { UnifiedRoute } from 'hooks/useBestSwapRoute'
import type { AggregatorChoice } from 'services/aggregators/types'

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

export function RouteComparison({ candidates, selected, onSelect, outputCurrency, outputSymbol }: Props) {
  // Sort already done upstream (highest amountOut first). Hide when there's
  // nothing to compare.
  const winnerKey = candidates[0]?.source

  // When the user hasn't pinned a source yet (selectedAggregator === 'auto'),
  // the active row is whichever currently has the highest amountOut. This
  // lets the highlight track the winner as quotes refresh.
  const activeKey: AggregatorChoice = selected === 'auto' ? (winnerKey ?? 'native') : selected

  const rows = useMemo(() => {
    return candidates.map((c) => ({
      key: c.source === 'native' ? ('native' as AggregatorChoice) : (c.source as AggregatorChoice),
      label: c.sourceName,
      amountOut: formatAmount(c.amountOut, outputCurrency),
      isBest: c.source === winnerKey,
    }))
  }, [candidates, outputCurrency, winnerKey])

  // Show whenever we have at least one candidate. Even with a single
  // source (e.g., aggregator returned no route for this pair) the user
  // sees which source is active and can verify why no comparison is
  // available — better UX than the card silently disappearing.
  if (candidates.length < 1) return null

  return (
    <div
      style={{
        background: '#1E1915',
        border: '1px solid #2F2823',
        borderRadius: '16px',
        padding: '16px',
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div
        style={{
          fontFamily: 'Inter',
          fontSize: '13px',
          fontWeight: 600,
          color: '#978A80',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        Route
      </div>

      {rows.map((row) => {
        const active = activeKey === row.key
        return (
          <button
            key={row.key}
            type="button"
            onClick={() => onSelect(row.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
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
              {/* Radio indicator */}
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
  )
}
