import { ChainId } from '@brownfi/sdk'

// Manual per-pool TVL caps (USD). Adding liquidity to a pool is blocked once its
// current indexer TVL reaches the configured cap. Binary gate: `tvl >= cap` → the
// Add action is blocked (a toast is shown on click); below the cap → normal add
// (no per-amount limit). Keyed by chainId → lowercased pool (liquidity-token)
// address → cap in USD. Add pools here by hand as needed.
export const TVL_GATE_CAPS: Record<number, Record<string, number>> = {
  [ChainId.BERA_MAINNET]: {
    // HONEY / USDC.e V3
    '0x7d4ae0d663567b8caa0f0f4bd2585da7394943d7': 15,
  },
}

// User-facing notice shown (toast) when an add is blocked by the cap. Shared by
// every add path so the wording stays consistent.
export const TVL_GATE_MESSAGE = 'This pool has reached its TVL limit — adding liquidity is temporarily unavailable.'

// The configured cap for a pool, or undefined when the pool isn't gated.
export function getTvlCap(chainId?: number, poolAddress?: string): number | undefined {
  if (!chainId || !poolAddress) return undefined
  return TVL_GATE_CAPS[chainId]?.[poolAddress.toLowerCase()]
}
