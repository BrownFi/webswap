import { getTvlCap } from 'config/tvlGate'
import { formatNumber } from 'utils/prices'

type Props = {
  chainId?: number
  poolAddress?: string
  /** Larger padding/radius for the desktop header row (matches the Beta tag there). */
  size?: 'sm' | 'md'
}

// Solid tag marking a TVL-capped pool with its configured max cap. Styled like the
// Beta tag (solid, 100% opacity) using a distinct palette color (theme blue1, vs
// Beta orange and Fee green). Renders nothing for pools without a configured cap.
export function PoolCapTags({ chainId, poolAddress, size = 'sm' }: Props) {
  const cap = getTvlCap(chainId, poolAddress)
  if (cap === undefined) return null

  return (
    <span
      style={{
        background: '#2172E5', // theme blue1 — distinct from Beta (orange) + Fee (green)
        borderRadius: size === 'md' ? '999px' : '6px',
        padding: size === 'md' ? '3px 10px' : '2px 8px',
        fontFamily: 'Inter',
        fontSize: '11px',
        fontWeight: 500,
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      Max Cap ${formatNumber(cap)}
    </span>
  )
}
