/**
 * Zap aggregator registry — the only place adapters are wired in.
 *
 * Adding a new zap aggregator: implement ZapAggregatorAdapter under its own
 * folder, then push it into the `zapAggregators` array below. No other code
 * change needed — the zap UI consumes only `getZapAggregatorsFor()` and the
 * orchestration hook (added in a later phase).
 *
 * Phase 2: Kyber-only. The native adapter (wraps our V2 router + v3Zap)
 * lands in Phase 3 and joins the array here.
 */
import { ChainId } from '@brownfi/sdk'
import { kyberZapAggregator } from './kyber/zapAdapter'
import type { ZapAggregatorAdapter, ZapAggregatorId } from './zapTypes'
import type { BrownFiVersion } from './types'

const zapAggregators: ZapAggregatorAdapter[] = [
  kyberZapAggregator,
  // Phase 3:
  // nativeZapAggregator,
]

export function getZapAggregatorsFor(chainId: ChainId, version: BrownFiVersion): ZapAggregatorAdapter[] {
  return zapAggregators.filter((a) => a.isSupported(chainId, version))
}

export function getZapAggregatorById(id: ZapAggregatorId): ZapAggregatorAdapter | undefined {
  return zapAggregators.find((a) => a.id === id)
}

/** All registered zap adapters regardless of chain — for Settings UI / debug. */
export function listAllZapAggregators(): readonly ZapAggregatorAdapter[] {
  return zapAggregators
}
