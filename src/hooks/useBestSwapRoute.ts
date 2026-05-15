/**
 * Orchestration hook for the multi-aggregator swap pipeline.
 *
 * Takes the already-computed native BrownFi trade + a quote request, fans
 * out to every registered aggregator that supports the current chain ×
 * version, picks the winning route based on the user's selectedAggregator
 * preference, and returns a unified shape the Swap page can render and
 * execute against.
 *
 * Design notes:
 * - Native quote stays inside the existing useDerivedSwapInfo pipeline so
 *   we don't double-fetch or fight the SDK's caching. The Swap page
 *   passes `nativeTrade` in.
 * - Aggregator quotes go through React Query with a short refetchInterval
 *   so routes stay fresh (Kyber's TTL is ~30s).
 * - Stale-route protection: orchestration flags isStale when any chosen
 *   route's `validUntil` is in the past; the Swap page must refetch
 *   before signing.
 */
import { ChainId, Currency, ETHER, Token, Trade } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { useSelectedAggregator } from 'state/user/hooks'
import { getAggregatorsFor } from 'services/aggregators'
import type {
  AggregatorId,
  AggregatorQuote,
  BrownFiVersion,
  QuoteParams,
} from 'services/aggregators/types'

export type RouteSource = 'native' | AggregatorId

export interface UnifiedRoute {
  source: RouteSource
  /** Display name: "BrownFi" for native, aggregator's `name` otherwise. */
  sourceName: string
  amountOut: BigNumber
  amountOutMin: BigNumber
  gasEstimate?: BigNumber
  priceImpact?: number
  /** Populated when source === 'native'. */
  nativeTrade?: Trade
  /** Populated for aggregator routes; opaque to the orchestrator. */
  aggregatorQuote?: AggregatorQuote<unknown>
}

export interface UseBestSwapRouteParams {
  /** The BrownFi-native trade as already resolved by useDerivedSwapInfo. */
  nativeTrade: Trade | undefined
  tokenIn: Currency | undefined
  tokenOut: Currency | undefined
  amountIn: BigNumber | undefined
  account: string | undefined
  /** basis points — 50 = 0.5%. */
  slippageBps: number
  /** unix seconds. */
  deadline: number
}

export interface UseBestSwapRouteResult {
  /** The winning route under the current `selectedAggregator` preference. */
  best: UnifiedRoute | null
  /** All routes that returned a quote, sorted by amountOut desc. */
  candidates: UnifiedRoute[]
  /** Any aggregator query still in-flight. */
  isLoading: boolean
  /** True when the chosen route's validUntil has passed and we haven't refetched yet. */
  isStale: boolean
  refetchAll: () => void
}

function tokenAddress(c: Currency | undefined): string | undefined {
  if (!c) return undefined
  if (c === ETHER) return 'NATIVE'
  if (c instanceof Token) return c.address
  return undefined
}

function deriveAmountOutMin(amountOut: BigNumber, slippageBps: number): BigNumber {
  return amountOut.mul(10_000 - slippageBps).div(10_000)
}

function nativeRouteFromTrade(trade: Trade, slippageBps: number): UnifiedRoute | null {
  // BrownFi SDK's Trade exposes outputAmount as a CurrencyAmount. Use raw
  // (JSBI → string) so we can wrap it in BigNumber consistently with the
  // aggregator side. Defensive: SDK types outputAmount as possibly
  // undefined for partially-constructed trades.
  if (!trade.outputAmount) return null
  const amountOut = BigNumber.from(trade.outputAmount.raw.toString())
  return {
    source: 'native',
    sourceName: 'BrownFi',
    amountOut,
    amountOutMin: deriveAmountOutMin(amountOut, slippageBps),
    nativeTrade: trade,
  }
}

export function useBestSwapRoute(params: UseBestSwapRouteParams): UseBestSwapRouteResult {
  const { nativeTrade, tokenIn, tokenOut, amountIn, account, slippageBps, deadline } = params

  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const [selected] = useSelectedAggregator()

  // Aggregators that can quote on this chain × version. Memoized by the
  // chainId/version pair only — adapters themselves are module singletons.
  const aggregators = useMemo(() => {
    if (!chainId) return []
    return getAggregatorsFor(chainId, version as BrownFiVersion)
  }, [chainId, version])

  // Stable cache key — null when we shouldn't fire (missing inputs). We
  // ALWAYS quote every supported aggregator (even when the user has pinned
  // 'native') so the route picker can always show the full comparison.
  // Skipping queries based on the user's pinned selection would make the
  // picker disappear once they click BrownFi.
  const baseKey = useMemo(() => {
    if (!chainId || !account) return null
    if (!tokenIn || !tokenOut) return null
    if (!amountIn || amountIn.lte(0)) return null
    return [chainId, tokenAddress(tokenIn), tokenAddress(tokenOut), amountIn.toString(), slippageBps]
  }, [chainId, account, tokenIn, tokenOut, amountIn, slippageBps])

  // One useQueries call quotes every supported aggregator in parallel.
  const queries = useQueries({
    queries: aggregators.map((a) => ({
      queryKey: ['agg-quote', a.id, ...(baseKey ?? [])],
      queryFn: async () => {
        if (!baseKey || !chainId || !account || !tokenIn || !tokenOut || !amountIn) return null
        const quoteParams: QuoteParams = {
          chainId: chainId as ChainId,
          version: version as BrownFiVersion,
          tokenIn,
          tokenOut,
          amountIn,
          account,
          slippageBps,
          deadline,
        }
        return a.quote(quoteParams)
      },
      enabled: baseKey !== null,
      // Keep quotes fresh. Kyber's TTL is ~30s; refetch a bit before that.
      refetchInterval: 20_000,
      staleTime: 10_000,
    })),
  })

  return useMemo(() => {
    const candidates: UnifiedRoute[] = []

    // Native (BrownFi) — always a candidate. The user's `selected` choice
    // is honored at pick time, not by hiding the candidate. This way a
    // forced-aggregator selection can transparently fall back to native if
    // the chosen aggregator has no route for this pair.
    if (nativeTrade) {
      const native = nativeRouteFromTrade(nativeTrade, slippageBps)
      if (native) candidates.push(native)
    }

    // Each aggregator that returned a quote.
    queries.forEach((q, i) => {
      const data = q.data
      if (!data) return
      const adapter = aggregators[i]
      candidates.push({
        source: adapter.id,
        sourceName: adapter.name,
        amountOut: data.amountOut,
        amountOutMin: data.amountOutMin,
        gasEstimate: data.gasEstimate,
        priceImpact: data.priceImpact,
        aggregatorQuote: data,
      })
    })

    // Sort by amountOut desc so the UI gets a "best on top" comparison.
    // Tie-break: native first (it's cheaper gas — no external router hop).
    const sorted = [...candidates].sort((a, b) => {
      if (a.amountOut.eq(b.amountOut)) {
        if (a.source === 'native') return -1
        if (b.source === 'native') return 1
        return 0
      }
      return b.amountOut.gt(a.amountOut) ? 1 : -1
    })

    // Pick the winning route based on user preference.
    let best: UnifiedRoute | null = null
    if (selected === 'native') {
      best = sorted.find((r) => r.source === 'native') ?? null
    } else if (selected !== 'auto') {
      // Specific aggregator selected. Prefer it; fall back to native if it
      // has no route (e.g., user is on a chain Kyber doesn't cover today).
      best =
        sorted.find((r) => r.source === selected) ??
        sorted.find((r) => r.source === 'native') ??
        null
    } else {
      // Auto — best amountOut wins (sorted[0]).
      best = sorted[0] ?? null
    }

    const isLoading = queries.some((q) => q.isFetching)
    // Aggregator stale-quote protection. Native has no TTL; only aggregator
    // routes get a `validUntil`. If the chosen route has expired we let the
    // UI flag it and refetch.
    const now = Math.floor(Date.now() / 1000)
    const isStale = !!best?.aggregatorQuote && now > best.aggregatorQuote.validUntil

    const refetchAll = () => queries.forEach((q) => q.refetch())

    return { best, candidates: sorted, isLoading, isStale, refetchAll }
  }, [aggregators, nativeTrade, queries, selected, slippageBps])
}
