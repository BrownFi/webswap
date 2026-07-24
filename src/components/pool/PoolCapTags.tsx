import { getTvlCap, getConcentrationLevel } from 'config/tvlGate'
import { formatNumber } from 'utils/prices'

type Props = {
  chainId?: number
  poolAddress?: string
  /** xs = compact pool-list row, sm = mobile header, md = desktop header (matches the Beta tag). */
  size?: 'xs' | 'sm' | 'md'
}

// Solid informational tags for a pool: its configured TVL cap ("Max Cap $N") and its
// Concentration Level ("CL <n>"). Styled like the Beta tag (solid, 100% opacity) with
// distinct palette colors — Max Cap blue, CL violet (vs Beta orange + Fee green).
// Renders nothing when the pool has neither a cap nor a concentration level configured.
export function PoolCapTags({ chainId, poolAddress, size = 'sm' }: Props) {
  const cap = getTvlCap(chainId, poolAddress)
  const cl = getConcentrationLevel(chainId, poolAddress)
  if (cap === undefined && cl === undefined) return null

  const tagStyle = (bg: string) => ({
    background: bg,
    borderRadius: size === 'md' ? '999px' : ('6px' as const),
    padding: size === 'md' ? '3px 10px' : size === 'xs' ? '1px 6px' : ('2px 8px' as const),
    fontFamily: 'Inter',
    fontSize: size === 'xs' ? '10px' : '11px',
    fontWeight: 500,
    color: '#fff',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'xs' ? '4px' : '6px' }}>
      {cap !== undefined && (
        <span style={tagStyle('#2172E5')}>Max Cap ${formatNumber(cap)}</span>
      )}
      {cl !== undefined && (
        <span style={tagStyle('#8B5CF6')}>CL {cl}</span>
      )}
    </span>
  )
}
