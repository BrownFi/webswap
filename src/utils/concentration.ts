// Concentration Level (CE vs V2) for a BrownFi pool.
//
// From the pool's equivalence table, the concentration efficiency relative to a
// Uniswap V2 constant-product pool at the same TVL is exactly CE = 2 / K, where K
// is the pool's kappa (verified against every row of the table: K=0.001 → 2000×,
// K=0.01 → 200×, K=2 → 1×, etc).
//
// Jason: use the SMALLER of kB / kQ — the binding, most-concentrated side.
//
// The value is rounded to 2 significant figures so it lands on the clean numbers
// from the table. kB/kQ are stored on-chain as Q64.64 and decode with tiny error
// (e.g. a nominal 0.001 reads back as 0.000999 → 2/K = 2002), which the rounding
// cleans up to "2000".

function roundToSignificant(n: number, sig: number): number {
  if (n === 0) return 0
  const digits = Math.ceil(Math.log10(Math.abs(n)))
  const power = sig - digits
  const mag = Math.pow(10, power)
  return Math.round(n * mag) / mag
}

// Concentration Level for a pool, or undefined when kB/kQ aren't available yet.
// kB/kQ arrive from the indexer as numeric STRINGS ("0.001") — coerce before use.
export function concentrationLevel(kB?: number | string, kQ?: number | string): number | undefined {
  const ks = [kB, kQ]
    .map((k) => Number(k))
    .filter((k) => Number.isFinite(k) && k > 0)
  if (ks.length === 0) return undefined
  const k = Math.min(...ks)
  const ce = 2 / k
  if (!Number.isFinite(ce) || ce <= 0) return undefined
  return roundToSignificant(ce, 2)
}
