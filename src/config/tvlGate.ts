import { ChainId } from '@brownfi/sdk'

// Manual per-pool TVL caps (USD). Adding liquidity is blocked when it would push a
// pool's TVL past its cap: the ADD is allowed only while `currentTvl + addValueUsd`
// stays within `cap × (1 + TVL_GATE_TOLERANCE)`. The tolerance absorbs client-side
// price/estimate error so users aren't blocked right at the boundary. Keyed by
// chainId → lowercased pool (liquidity-token) address → cap in USD.
export const TVL_GATE_CAPS: Record<number, Record<string, number>> = {
  [ChainId.BERA_MAINNET]: {
    '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c': 60000, // WBERA / HONEY
    '0xc123bc9259d1a99add5a2c512498ac146dd2bade': 20000, // WETH / USDC.e
    '0x77ccfa7fdb7510e9ea1417c0737f856d87b5215d': 20000, // WBTC / WETH
    '0x16b3a5e95db753fe5195244fa208301e38beae2a': 8000, // DOLO / HONEY
    '0xe96e91374ac86a544ff0f9dc4eb9be6c1e37807d': 8000, // WETH / WBERA
    '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26': 8000, // USDC.e / WBERA
    // HONEY / USDC.e (0x7d4ae0d6…) is handled off-UI by the team (reduce liquidity /
    // hide), so it is intentionally NOT capped here.
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

// Fresh pool TVL (USD) from on-chain reserves × live token prices. PREFER this over the
// indexer's `tvl` when gating: on-chain reserves reflect an add the instant it confirms,
// while the indexer lags a block or two — a lag that let a rapid second add slip past the
// cap. Inputs may be strings (indexer/SDK). Returns undefined when any input is unusable,
// so callers can fall back to the indexer TVL.
export function poolTvlFromReserves(
  reserve0?: number | string,
  price0?: number | string,
  reserve1?: number | string,
  price1?: number | string,
): number | undefined {
  const r0 = Number(reserve0)
  const p0 = Number(price0)
  const r1 = Number(reserve1)
  const p1 = Number(price1)
  if (![r0, p0, r1, p1].every((n) => Number.isFinite(n))) return undefined
  // Prices must be positive to trust the valuation; reserves may legitimately be 0.
  if (p0 <= 0 || p1 <= 0 || r0 < 0 || r1 < 0) return undefined
  return r0 * p0 + r1 * p1
}
