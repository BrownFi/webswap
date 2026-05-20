/**
 * Shared types for the zap aggregator pipeline.
 *
 * Mirrors the swap pipeline in ./types.ts: each zap source (native router or
 * external aggregator) implements ZapAggregatorAdapter, then orchestration
 * fans out quotes from every supported adapter and picks the winner by
 * LP-out (zap-in) or amount-out (zap-out).
 *
 * Adding a new zap aggregator means: implement ZapAggregatorAdapter under
 * its own folder, declare its chain × version matrix, push it into
 * ./zapRegistry. The zap UI imports nothing aggregator-specific — only the
 * registry + orchestration hook.
 */
import { ChainId, Currency, Pair } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import type { AggregatorId, BrownFiVersion } from './types'

/**
 * Identity space for zap adapters. `'native'` is the BrownFi-router path
 * (V2: addLiquidity + internal swap; V3: zapIn/zapOut on the V3 router).
 * External aggregators reuse their swap-side id so user preferences travel
 * coherently across pages (e.g. `'kyber'` here matches `'kyber'` in
 * ./types AggregatorId).
 */
export type ZapAggregatorId = 'native' | AggregatorId

export interface ZapInQuoteParams {
  chainId: ChainId
  version: BrownFiVersion
  pair: Pair
  account: string
  /** One or two input tokens. Two inputs lets the user zap an arbitrary mix
   *  (e.g. half WBERA + half DOLO) without first swapping to a single side. */
  inputs: Array<{ currency: Currency; amountRaw: string }>
  /** in basis points, e.g. 50 = 0.5% */
  slippageBps: number
  /** unix seconds */
  deadline: number
}

export interface ZapOutQuoteParams {
  chainId: ChainId
  version: BrownFiVersion
  pair: Pair
  account: string
  /** LP token amount to burn, in smallest units (string to preserve precision). */
  liquidityRaw: string
  /** Single token the user wants to receive after burning + swapping. */
  tokenOut: Currency
  slippageBps: number
  deadline: number
}

/**
 * Normalized zap-in quote. `routeSummary` is the adapter-specific blob each
 * adapter hands back into its own `buildZapIn`. Generic `R` keeps it strongly
 * typed inside the adapter while orchestration juggles multiple shapes as
 * `ZapInQuote<unknown>`.
 */
export interface ZapInQuote<R = unknown> {
  aggregatorId: ZapAggregatorId
  /** Estimated LP tokens minted, in smallest units. */
  lpOut: BigNumber
  /** Minimum LP enforced by the executing contract after applying slippage. */
  lpOutMin: BigNumber
  /** Percentage, e.g. 0.42 = 0.42%. Undefined when adapter doesn't compute it. */
  priceImpact?: number
  /** Raw gas units the adapter estimates; orchestration may compare against alternates. */
  gasEstimate?: BigNumber
  /** Where the user approves the input token(s). */
  routerAddress: string
  routeSummary: R
  /** Unix seconds. Quote is stale after this — orchestration must refetch
   *  before signing rather than build calldata from an expired route. */
  validUntil: number
}

export interface ZapOutQuote<R = unknown> {
  aggregatorId: ZapAggregatorId
  /** Estimated output token amount, in smallest units. */
  amountOut: BigNumber
  amountOutMin: BigNumber
  priceImpact?: number
  gasEstimate?: BigNumber
  /** Where the user approves the LP token. */
  routerAddress: string
  routeSummary: R
  validUntil: number
}

export interface BuildZapInParams<R = unknown> {
  chainId: ChainId
  account: string
  quote: ZapInQuote<R>
  slippageBps: number
  deadline: number
}

export interface BuildZapOutParams<R = unknown> {
  chainId: ChainId
  account: string
  quote: ZapOutQuote<R>
  slippageBps: number
  deadline: number
}

export interface BuildZapResult {
  to: string
  data: string
  value?: BigNumber
  gasLimit?: BigNumber
}

/**
 * `RIn` / `ROut` let an adapter use different raw shapes for the two
 * directions if its upstream API does. Most adapters use the same type
 * for both (Kyber does — same KyberZapRouteData struct).
 */
export interface ZapAggregatorAdapter<RIn = unknown, ROut = unknown> {
  id: ZapAggregatorId
  /** Display name for UI ("Native", "Kyber"). */
  name: string
  /** True when this adapter can quote on the given chain × BrownFi version. */
  isSupported(chainId: ChainId, version: BrownFiVersion): boolean
  /** Resolves null when no route is found (orchestration treats as "skip this adapter"). */
  quoteZapIn(params: ZapInQuoteParams): Promise<ZapInQuote<RIn> | null>
  quoteZapOut(params: ZapOutQuoteParams): Promise<ZapOutQuote<ROut> | null>
  buildZapIn(params: BuildZapInParams<RIn>): Promise<BuildZapResult>
  buildZapOut(params: BuildZapOutParams<ROut>): Promise<BuildZapResult>
}
