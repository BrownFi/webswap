import { getTvlCap } from 'config/tvlGate'
import { clEnabled, concentrationLevel } from 'utils/concentration'

// Compact USD for the cap tag: $60k / $8.2k / $1.5m (lowercase suffix). Self-contained
// so this component doesn't depend on any util that may not exist on every branch.
const fmtCap = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(n)
    .toLowerCase()

type Props = {
  chainId?: number
  poolAddress?: string
  /** Pool kappa (base/quote) from the indexer (arrives as numeric strings). Drives the "CL <n>" tag. */
  kB?: number | string
  kQ?: number | string
  /** xs = compact pool-list row, sm = mobile header, md = desktop header (matches the Beta tag). */
  size?: 'xs' | 'sm' | 'md'
}

// Solid informational tags for a pool: its configured TVL cap ("Max Cap $N") and its
// Concentration Level ("CL <n>", auto-computed as 2 / min(kB, kQ)). Styled like the
// Beta tag (solid, 100% opacity) with on-brand palette colors — Max Cap a soft blue
// (#4A90E2), CL a warm amber-brown (#A67C3C, near theme primary3, vs Beta orange +
// Fee green). Renders nothing when the pool has neither.
export function PoolCapTags({ chainId, poolAddress, kB, kQ, size = 'sm' }: Props) {
  const cap = getTvlCap(chainId, poolAddress)
  // CL is rolled out per-chain (Berachain only for now) — off elsewhere even though
  // kappa is available, so the tag doesn't appear on chains that aren't configured yet.
  const cl = clEnabled(chainId) ? concentrationLevel(kB, kQ) : undefined
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
        <span style={tagStyle('#4A90E2')}>Max Cap {fmtCap(cap)}</span>
      )}
      {cl !== undefined && (
        <span style={tagStyle('#A67C3C')}>CL {cl}</span>
      )}
    </span>
  )
}
