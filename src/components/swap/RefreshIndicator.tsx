/**
 * Refresh indicator for the swap route comparison card.
 *
 * Renders a refresh icon wrapped in a thin progress ring. The ring fills
 * over the configured interval (default 20s) to mirror the auto-refetch
 * cadence, then resets when a fresh quote lands. Clicking the icon force-
 * refetches and resets the ring.
 *
 * Drawn with raw SVG instead of a styled component so the ring animation
 * can update on a 1s tick without re-laying-out the rest of the row.
 */
import { useEffect, useState } from 'react'

interface Props {
  /** Wall-clock ms of the most recent settled quote. 0 = indeterminate. */
  lastFetchedAt: number
  /** Auto-refetch cadence in ms — the ring fills over this duration. */
  intervalMs: number
  /** Force-refetch handler. Wired to useBestSwapRoute.refetchAll. */
  onRefresh: () => void
  /** Optional: hide when no quote exists yet (e.g. empty form). */
  visible?: boolean
}

const SIZE = 20
const STROKE = 1.5
const RADIUS = SIZE / 2 - STROKE
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RefreshIndicator({ lastFetchedAt, intervalMs, onRefresh, visible = true }: Props) {
  // Tick once a second so the ring redraws. setInterval not requestAnimationFrame
  // because the visual change between frames is < 1px — RAF would burn battery
  // for nothing. Cleared on unmount so the timer doesn't leak.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!visible || lastFetchedAt === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [visible, lastFetchedAt])

  if (!visible) return null

  // Progress 0 → 1 over the interval. Clamped so an overdue refresh doesn't
  // draw a negative-length arc; the ring just sits at "full" until the next
  // settle bumps lastFetchedAt forward.
  const elapsed = lastFetchedAt > 0 ? now - lastFetchedAt : 0
  const progress = Math.max(0, Math.min(1, elapsed / intervalMs))
  // strokeDashoffset trick: stroke-dasharray = full circumference, offset
  // shrinks from CIRCUMFERENCE (empty) to 0 (full) as progress climbs.
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <button
      type="button"
      onClick={(e) => {
        // Comparison card's outer button toggles the accordion — stop here
        // so a click on the refresh icon doesn't also expand/collapse the
        // panel by accident.
        e.stopPropagation()
        onRefresh()
      }}
      title="Auto-refreshes every 20s — click to refresh now"
      aria-label="Refresh quote"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
      }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none">
        {/* Background ring — very faint, gives the user a sense of the loop. */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(151, 138, 128, 0.25)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Filling ring. Rotated -90° so it starts at 12 o'clock instead of
            3 o'clock — feels more natural for a "time elapsing" metaphor. */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#C4943A"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        {/* Refresh glyph — two small arrows. Inline path so we don't pull
            an icon-library dep just for this one icon. */}
        <path
          d="M6 9 A4 4 0 0 1 14 9 M14 9 L14 6.5 M14 9 L11.5 9 M14 11 A4 4 0 0 1 6 11 M6 11 L6 13.5 M6 11 L8.5 11"
          stroke="#978A80"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </button>
  )
}
