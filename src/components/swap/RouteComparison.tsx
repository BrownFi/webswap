/**
 * Route picker — inline accordion.
 *
 * Collapsed: a single row card showing the active route, a Best badge
 * (only when the active row is the best), the amountOut, and a chevron.
 * Click anywhere on the row to
 * expand; the comparison panel slides down inline (pushing the swap
 * button below it). Click the chevron again to collapse.
 *
 * Selection semantics:
 * - selectedAggregator === 'auto' (initial state) → active row is the
 *   winner (highest amountOut). Quote refreshes track the winner.
 * - User clicks the Best-badged row inside the panel → re-enters
 *   `auto` mode (drops any pin).
 * - User clicks any other row → pins to that source explicitly.
 *
 * Rendering rules:
 * - Hidden when there are zero candidates.
 * - With one candidate the trigger renders but the chevron is hidden
 *   and clicking is a no-op (nothing to compare).
 *
 * Why inline (not floating dropdown): an inline accordion reads as part
 * of the swap form rather than a floating overlay. The expanded panel
 * uses a CSS grid `grid-template-rows: 0fr → 1fr` animation so the
 * slide-down is smooth without hardcoding panel height.
 */
import { Currency, Token } from '@brownfi/sdk'
import { useMemo, useState } from 'react'
import type { UnifiedRoute } from 'hooks/useBestSwapRoute'
import type { AggregatorChoice } from 'services/aggregators/types'
import { RefreshIndicator } from './RefreshIndicator'

interface Props {
  candidates: UnifiedRoute[]
  selected: AggregatorChoice
  onSelect: (next: AggregatorChoice) => void
  outputCurrency: Currency | undefined
  /** Symbol of the output token for the row labels. */
  outputSymbol: string
  /** USD price of the OUTPUT token (1 token = $X). When present, each row
   *  renders `≈ $Y` next to its amountOut. Single price applies to all
   *  rows since they all output the same token. Undefined when Pyth +
   *  indexer both fail — display falls back to token-only. */
  outputUsdPrice?: number
  /** True while any quote source (native multicall or aggregator HTTP)
   *  is still in-flight. The picker renders a loading state in its
   *  trigger so the "Best" winner isn't shown until every source has
   *  reported — matches the OUTPUT field's same gating. */
  isLoading?: boolean
  /** Wall-clock ms of the most recent settled aggregator quote. Drives
   *  the refresh-countdown ring; 0 = nothing fetched yet (ring hidden). */
  lastFetchedAt?: number
  /** Auto-refetch cadence in ms. Hook owns the canonical value; we just
   *  render the ring against it. */
  refreshIntervalMs?: number
  /** Force-refetch handler. When omitted, the refresh icon is hidden. */
  onRefresh?: () => void
}

function formatAmount(rawBig: { toString(): string }, currency: Currency | undefined): string {
  const decimals = currency instanceof Token ? currency.decimals : 18
  const num = Number(rawBig.toString()) / 10 ** decimals
  if (!isFinite(num) || num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  return Number(num.toPrecision(6)).toString()
}

function formatUsd(amount: number): string {
  if (!isFinite(amount) || amount <= 0) return ''
  if (amount < 0.01) return '< $0.01'
  if (amount < 1) return `$${amount.toFixed(3)}`
  if (amount < 1000) return `$${amount.toFixed(2)}`
  if (amount < 1_000_000) return `$${(amount / 1000).toFixed(2)}K`
  return `$${(amount / 1_000_000).toFixed(2)}M`
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

/**
 * Skeleton block — a softly-pulsing gray bar used as a placeholder so the
 * trigger has the same height + horizontal footprint while loading as it
 * does once quotes settle (no layout shift on settle).
 */
function Skel({ w, h = 14, opacity = 0.5 }: { w: number; h?: number; opacity?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: 4,
        background: '#2F2823',
        opacity,
        animation: 'bf-pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

export function RouteComparison({
  candidates,
  selected,
  onSelect,
  outputCurrency,
  outputSymbol,
  outputUsdPrice,
  isLoading = false,
  lastFetchedAt,
  refreshIntervalMs,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false)

  // Winner = first SELECTABLE candidate (skip unavailable routes when
  // determining the Best/Auto target).
  const winnerKey = candidates.find((c) => !c.unavailable)?.source ?? candidates[0]?.source
  const activeKey: AggregatorChoice =
    selected === 'auto' ? ((winnerKey ?? 'brownfi-v2') as AggregatorChoice) : selected

  const rows = useMemo(() => {
    // The winner badge tracks the best USABLE candidate — an unavailable
    // route (e.g., V2 with the 90%-reserve issue) might top the sorted
    // list by amountOut but it can't be the "Best" since you can't use
    // it. Shift the Best badge to the first selectable row.
    const firstSelectable = candidates.find((c) => !c.unavailable)
    const bestAmount = firstSelectable?.amountOut
    // Per-row delta vs best. Pure BigNumber arithmetic on data we
    // already have — no extra queries, no hooks. Expressed in bps
    // (basis points, 1/100 of a percent) so a -21 means -0.21%.
    const deltaBpsFor = (c: UnifiedRoute): number | undefined => {
      if (!bestAmount || c.source === firstSelectable?.source) return undefined
      if (c.unavailable) return undefined
      if (bestAmount.isZero()) return undefined
      return Number(c.amountOut.sub(bestAmount).mul(10000).div(bestAmount).toString())
    }
    return candidates.map((c) => {
      const decimals = outputCurrency instanceof Token ? outputCurrency.decimals : 18
      const numeric = Number(c.amountOut.toString()) / 10 ** decimals
      const usd =
        outputUsdPrice && isFinite(numeric) && numeric > 0
          ? formatUsd(numeric * outputUsdPrice)
          : ''
      return {
        key: c.source as AggregatorChoice,
        label: c.sourceName,
        amountOut: formatAmount(c.amountOut, outputCurrency),
        usd,
        deltaBps: deltaBpsFor(c),
        isBest: c.source === firstSelectable?.source,
        unavailable: c.unavailable,
      }
    })
  }, [candidates, outputCurrency, outputUsdPrice])

  if (candidates.length < 1) return null
  const activeRow = rows.find((r) => r.key === activeKey) ?? rows[0]
  const hasMultiple = candidates.length > 1

  const handleSelect = (key: AggregatorChoice) => {
    // Clicking the currently-Best row means "stay on best" — drop the
    // pin and re-enter auto-track mode. Clicking any other row pins
    // explicitly. This is how users escape an accidental pin without
    // needing a separate "Auto" row or "Reset" affordance.
    //
    // Don't auto-close the accordion — users want to see the result of
    // their choice (which row is now active, the new delta highlights)
    // without re-expanding. Closing only happens via the chevron click
    // on the trigger row.
    if (key === winnerKey) {
      onSelect('auto')
    } else {
      onSelect(key)
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
      {/* Pulse animation for the skeleton placeholders. Inlined so the
          component is self-contained — no Tailwind keyframes needed. */}
      <style>{`@keyframes bf-pulse {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 0.55; }
      }`}</style>
      {/* Trigger row — always visible. Whole row clickable when there's
          more than one candidate AND no quote is loading. During load
          we render a placeholder so the trigger doesn't flash whichever
          source happens to settle first. */}
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
          // Lock minimum row height so the trigger doesn't shrink/grow
          // when content switches between skeleton (14px tall) and real
          // text + badge (~18-20px once line-height + pill padding are
          // factored in). 46px ≈ 12px top + 22px content + 12px bottom.
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
            // Skeleton replaces the source label + badge so the trigger
            // keeps its full height + horizontal rhythm during loading.
            // No layout shift when the real labels pop in.
            <>
              <Skel w={86} h={14} />
              <Skel w={36} h={14} />
            </>
          ) : (
            <>
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
          ) : (
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FBFBFD',
              }}
            >
              {activeRow.amountOut} {outputSymbol}
              {activeRow.usd && (
                <span style={{ color: '#978A80', fontWeight: 500, marginLeft: '6px' }}>
                  ≈ {activeRow.usd}
                </span>
              )}
            </span>
          )}
          {onRefresh && refreshIntervalMs && (
            <RefreshIndicator
              lastFetchedAt={lastFetchedAt ?? 0}
              intervalMs={refreshIntervalMs}
              onRefresh={onRefresh}
              visible={!isLoading}
            />
          )}
          {hasMultiple && <ChevronIcon open={open && !isLoading} dim={isLoading} />}
        </div>
      </button>

      {/* Accordion body — CSS grid trick: animate grid-template-rows
          between 0fr (collapsed) and 1fr (expanded). Inner div has
          overflow:hidden so children are clipped during the transition.
          Smooth without needing to measure or hardcode panel height. */}
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
              const disabled = !!row.unavailable
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => !disabled && handleSelect(row.key)}
                  disabled={disabled}
                  title={row.unavailable?.reason}
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
                    {row.unavailable && (
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
                        Unavailable
                      </span>
                    )}
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: active ? '#FBFBFD' : '#CFC7C1',
                      }}
                    >
                      {row.amountOut} {outputSymbol}
                      {row.usd && (
                        <span style={{ color: '#978A80', fontWeight: 500, marginLeft: '6px' }}>
                          ≈ {row.usd}
                        </span>
                      )}
                    </span>
                    {row.deltaBps !== undefined && (
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          fontWeight: 500,
                          // Negative delta is the typical case (worse than
                          // best). Use muted amber so it reads as "info,
                          // not error" — a pinned non-best route is a
                          // valid choice, not a problem.
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
