import { ChainId } from '@brownfi/sdk'

// Manual per-pool TVL caps (USD). Adding liquidity is blocked when it would push a
// pool's TVL past its cap: the ADD is allowed only while `currentTvl + addValueUsd`
// stays within `cap × (1 + TVL_GATE_TOLERANCE)`. The tolerance absorbs client-side
// price/estimate error so users aren't blocked right at the boundary. Keyed by
// chainId → lowercased pool (liquidity-token) address → cap in USD.
export const TVL_GATE_CAPS: Record<number, Record<string, number>> = {
  [ChainId.BERA_MAINNET]: {
    // HONEY / USDC.e V3
    '0x7d4ae0d663567b8caa0f0f4bd2585da7394943d7': 20,
  },
}

// Over-cap tolerance: an add is allowed up to `cap × (1 + TOLERANCE)` to account for
// price deviation / the fact that addValueUsd + current TVL are client-side estimates.
export const TVL_GATE_TOLERANCE = 0.03

// User-facing notice (toast) shown when an add is blocked by the cap. Includes the
// concrete numbers (current TVL, cap, remaining headroom) so the user knows how much
// they can still add. `tolerance`-aware: "remaining" is measured to cap × (1+tol).
export function tvlGateMessage(cap?: number, currentTvl?: number): string {
  if (cap === undefined) return "Adding this amount would exceed the pool's TVL cap."
  const usd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const tvl = typeof currentTvl === 'number' && Number.isFinite(currentTvl) ? currentTvl : 0
  const remaining = Math.max(0, cap * (1 + TVL_GATE_TOLERANCE) - tvl)
  if (remaining <= 0) {
    return `Pool TVL ${usd(tvl)} has reached the ${usd(cap)} cap. Adding liquidity is unavailable.`
  }
  return `Pool TVL is ${usd(tvl)} of the ${usd(cap)} cap — you can add up to about ${usd(remaining)} more.`
}

// The configured cap for a pool, or undefined when the pool isn't gated.
export function getTvlCap(chainId?: number, poolAddress?: string): number | undefined {
  if (!chainId || !poolAddress) return undefined
  return TVL_GATE_CAPS[chainId]?.[poolAddress.toLowerCase()]
}

// Would adding `addValueUsd` (USD) push the pool past its cap (+ tolerance)? Also
// true when the pool is already over the limit and addValueUsd is 0. Un-gated pools
// (no cap) are never blocked.
export function isAddOverCap(cap: number | undefined, currentTvl: number | undefined, addValueUsd: number): boolean {
  if (cap === undefined) return false
  const tvl = typeof currentTvl === 'number' && Number.isFinite(currentTvl) ? currentTvl : 0
  const add = Number.isFinite(addValueUsd) && addValueUsd > 0 ? addValueUsd : 0
  return tvl + add > cap * (1 + TVL_GATE_TOLERANCE)
}
