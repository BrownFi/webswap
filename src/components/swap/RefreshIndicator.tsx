/**
 * Refresh indicator for the swap route comparison card.
 *
 * Renders a refresh-arrows icon (react-feather, same family as the rest of
 * the app) wrapped in a thin progress ring. The ring fills over the
 * configured interval (default 20s) to mirror the auto-refetch cadence and
 * resets when a fresh quote lands. Clicking the icon spins once and
 * force-refetches.
 *
 * Raw SVG ring + react-feather icon stacked in the same box so the ring
 * animates without re-laying-out the icon.
 */
import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'react-feather'

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

const SIZE = 28
const STROKE = 1.5
const ICON_SIZE = 14
const RADIUS = SIZE / 2 - STROKE
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RefreshIndicator({ lastFetchedAt, intervalMs, onRefresh, visible = true }: Props) {
  // Tick once a second so the ring redraws. setInterval not requestAnimationFrame
  // because the visual change between frames is < 1px — RAF would burn battery
  // for nothing. Cleared on unmount.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!visible || lastFetchedAt === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [visible, lastFetchedAt])

  // Spin once when the user clicks the icon. Separate from the ring so an
  // auto-refetch (no user input) doesn't spin — that would be noisy. Tracks
  // the rotation count rather than a boolean so consecutive clicks restart
  // cleanly instead of stalling on the same animation instance.
  const [spinCount, setSpinCount] = useState(0)
  const lastClickedAt = useRef(0)

  if (!visible) return null

  // Progress 0 → 1 over the interval. Clamped so an overdue refresh doesn't
  // draw a negative-length arc; the ring just sits at "full" until the next
  // settle bumps lastFetchedAt forward.
  const elapsed = lastFetchedAt > 0 ? now - lastFetchedAt : 0
  const progress = Math.max(0, Math.min(1, elapsed / intervalMs))
  // strokeDashoffset trick: full circumference = empty, 0 = full ring.
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const handleClick = (e: React.MouseEvent) => {
    // Comparison card's outer button toggles the accordion — stop here so
    // a click on the refresh icon doesn't also expand/collapse the panel.
    e.stopPropagation()
    lastClickedAt.current = Date.now()
    setSpinCount((c) => c + 1)
    onRefresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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
        position: 'relative',
      }}
    >
      {/* Ring layer — absolute so the icon centers in the same box. */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Faint background ring — communicates "there's a cycle here" even
            before the user notices the fill animating. */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(151, 138, 128, 0.25)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc. Rotated -90° so it starts at 12 o'clock — feels
            natural for an "elapsing" metaphor (clockwise from top). */}
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
      </svg>

      {/* react-feather icon, centered inside the ring. `key={spinCount}`
          remounts the element on each click so the CSS rotation animation
          restarts cleanly. */}
      <RefreshCw
        key={spinCount}
        size={ICON_SIZE}
        color="#C4943A"
        strokeWidth={2.2}
        style={{
          animation: spinCount > 0 ? 'brownfiRefreshSpin 600ms ease-in-out' : undefined,
          position: 'relative',
          zIndex: 1,
        }}
      />
      {/* Inject the keyframes once. CSSinJS without a styled-components dep
          for what would be 4 lines of @keyframes. */}
      <style>{`
        @keyframes brownfiRefreshSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
