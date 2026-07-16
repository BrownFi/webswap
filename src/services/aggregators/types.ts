/**
 * Shared types for the multi-aggregator swap pipeline.
 *
 * Adding a new aggregator means: implement AggregatorAdapter, declare its
 * chain × version matrix, push it into the registry. The Swap page itself
 * doesn't import any specific aggregator — it consumes only the registry +
 * orchestration hook.
 */
import { ChainId, Currency } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'

export type AggregatorId = 'kyber' | '1inch' | 'paraswap' | 'okx'

/** Every route source the smart router can emit: BrownFi-native versions
 *  (each pool generation is a distinct source so the user can compare V2
 *  vs V3 quotes side-by-side) plus every registered external aggregator. */
// brownfi-v3-official = V3 Official (version 4) — the only BrownFi-native source.
export type RouteSource = 'brownfi-v3-official' | AggregatorId

/** The user's route preference. `auto` lets orchestration pick the best
 *  amountOut across all sources. Legacy `'native'` is still accepted from
 *  persisted state — the user reducer migrates it to `'auto'`. */
export type AggregatorChoice = 'auto' | RouteSource | 'native'

/** True when the source is a BrownFi-native pool quote (V3 Official). */
export function isBrownFiSource(source: RouteSource | undefined): boolean {
  return source === 'brownfi-v3-official'
}

/** BrownFi pool version. Only V3 Official (4) is supported. */
export type BrownFiVersion = 4

export interface QuoteParams {
  chainId: ChainId
  /** BrownFi pool version the user is interacting with, used to gate adapters. */
  version: BrownFiVersion
  tokenIn: Currency
  tokenOut: Currency
  amountIn: BigNumber
  /** wallet that signs + receives. The recipient defaults to this. */
  account: string
  /** in basis points, e.g. 50 = 0.5% */
  slippageBps: number
  /** unix seconds */
  deadline: number
}

/**
 * Normalized aggregator quote. `routeSummary` is the adapter-specific blob
 * each aggregator hands back to its own `buildSwap`. The generic `R` makes
 * it strongly-typed inside each adapter while still letting orchestration
 * juggle multiple types as `AggregatorQuote<unknown>`.
 */
export interface AggregatorQuote<R = unknown> {
  aggregatorId: AggregatorId
  amountOut: BigNumber
  amountOutMin: BigNumber
  /** raw gas units the adapter estimates; orchestration may compare with native. */
  gasEstimate?: BigNumber
  /** percentage, e.g. 0.42 = 0.42% */
  priceImpact?: number
  routerAddress: string
  routeSummary: R
  /**
   * Unix seconds. Quote is stale after this — orchestration must refetch
   * before signing rather than build calldata from an expired route.
   * Adapters that don't get an upstream TTL default to a conservative window.
   */
  validUntil: number
}

export interface BuildSwapParams<R = unknown> {
  chainId: ChainId
  account: string
  /** the quote previously returned by `quote()`. */
  quote: AggregatorQuote<R>
  slippageBps: number
  deadline: number
}

export interface BuildSwapResult {
  to: string
  data: string
  value?: BigNumber
  gasLimit?: BigNumber
}

export interface AggregatorAdapter<R = unknown> {
  id: AggregatorId
  /** Display name for UI ("Kyber", "1inch"). */
  name: string
  /** True when this aggregator can quote on the given chain × BrownFi version. */
  isSupported(chainId: ChainId, version: BrownFiVersion): boolean
  /** Resolves null when the aggregator has no route (treat as "skip this adapter"). */
  quote(params: QuoteParams): Promise<AggregatorQuote<R> | null>
  /** Builds the on-chain calldata for the previously-returned quote. */
  buildSwap(params: BuildSwapParams<R>): Promise<BuildSwapResult>
}
