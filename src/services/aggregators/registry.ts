/**
 * Aggregator registry — the only place adapters are wired in.
 *
 * Adding a new aggregator: implement AggregatorAdapter under `./<id>/`, then
 * push it into the `aggregators` array below. No other code change needed —
 * the Swap page consumes only `getAggregatorsFor()` and the orchestration hook.
 */
import { ChainId } from '@brownfi/sdk'
import { kyberAggregator } from './kyber/adapter'
import type { AggregatorAdapter, AggregatorId, BrownFiVersion } from './types'

const aggregators: AggregatorAdapter[] = [
  kyberAggregator,
  // Future:
  // oneInchAggregator,
  // paraswapAggregator,
  // okxAggregator,
]

export function getAggregatorsFor(chainId: ChainId, version: BrownFiVersion): AggregatorAdapter[] {
  return aggregators.filter((a) => a.isSupported(chainId, version))
}

export function getAggregatorById(id: AggregatorId): AggregatorAdapter | undefined {
  return aggregators.find((a) => a.id === id)
}

/** All registered adapters, regardless of chain — used by the Settings selector to render the full list. */
export function listAllAggregators(): readonly AggregatorAdapter[] {
  return aggregators
}
