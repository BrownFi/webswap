import { ROUTER_ADDRESS_V3_OFFICIAL } from 'lib/sdk/constants/addresses'

// The CL tag is shown on every chain with a live V3 (Official) deployment — the
// same chains the pool list serves (Bera, HyperEVM, Base, Linea, Arbitrum,
// Robinhood on beta). Derived from ROUTER_ADDRESS_V3_OFFICIAL so a chain added
// there automatically gets CL. CL auto-computes from on-chain kappa (kB/kQ) on
// every chain, indexer or on-chain reads. `clEnabled(chainId)` is the single
// gate the UI checks. (The MaxCap tag stays gated separately in config/tvlGate.)
export function clEnabled(chainId?: number): boolean {
  return chainId !== undefined && !!ROUTER_ADDRESS_V3_OFFICIAL[chainId]
}

// Concentration Level (CE vs V2) for a BrownFi pool.
//
// Per Paven's reference table, the concentration efficiency relative to a Uniswap V2
// constant-product pool at the same TVL is exactly CE = 2 / K, where K is the pool's
// kappa. Verified against every row of the sheet (K=0.001 → 2000, K=0.003 → 667,
// K=0.013 → 154, K=0.047 → 43, K=0.1 → 20 ...).
//
// Rules from Paven / Jason:
//   - use the SMALLER of kB / kQ (the binding, most-concentrated side)
//   - round CL to the nearest INTEGER
//
// kB/kQ arrive from the indexer as numeric STRINGS ("0.001") — coerce before use.
export function concentrationLevel(kB?: number | string, kQ?: number | string): number | undefined {
  const ks = [kB, kQ]
    .map((k) => Number(k))
    .filter((k) => Number.isFinite(k) && k > 0)
  if (ks.length === 0) return undefined
  const k = Math.min(...ks)
  const ce = 2 / k
  if (!Number.isFinite(ce) || ce <= 0) return undefined
  return Math.round(ce)
}
