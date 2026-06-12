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
  AggregatorQuote,
  BrownFiVersion,
  QuoteParams,
  RouteSource,
} from 'services/aggregators/types'

export type { RouteSource } from 'services/aggregators/types'

/**
 * Auto-refetch cadence for aggregator quotes. Sits just below Kyber's
 * ~30s upstream TTL so we always have a fresh route on hand before the
 * server-side one expires. Also drives the visual refresh countdown.
 */
const REFRESH_INTERVAL_MS = 20_000

export interface UnifiedRoute {
  source: RouteSource
  /** Display name: "BrownFi V2" / "BrownFi V3" for native, aggregator's `name` otherwise. */
  sourceName: string
  amountOut: BigNumber
  amountOutMin: BigNumber
  gasEstimate?: BigNumber
  priceImpact?: number
  /** Populated when source is BrownFi (v2 or v3). */
  nativeTrade?: Trade
  /** Populated for aggregator routes; opaque to the orchestrator. */
  aggregatorQuote?: AggregatorQuote<unknown>
  /** When set, the route exists (a quote returned) but can't be used —
   *  e.g., BrownFi V2 amount-out exceeds 90% pool reserve. The route
   *  still appears in the candidates list (so the picker can show it
   *  dimmed) but is never selected as `best`. */
  unavailable?: { reason: string }
}

export interface UseBestSwapRouteParams {
  /** BrownFi V2 trade from useDerivedSwapInfo. */
  v2Trade: Trade | undefined
  /** BrownFi V3 PILOT trade (version 3). Optional. */
  v3PilotTrade: Trade | undefined
  /** BrownFi V3 OFFICIAL trade (version 4). Optional. Surfaced as its own
   *  candidate so the picker compares pilot vs official side-by-side. */
  v3OfficialTrade: Trade | undefined
  /** V2 trade exists but amount-out exceeds 90% pool reserve. Surfaced
   *  as a candidate (dimmed) but excluded from `best` selection so
   *  swaps don't route through a pool that can't fulfill them. */
  v2Unavailable?: boolean
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
  /** Wall-clock timestamp (ms) of the most recent aggregator quote that
   *  settled — successful OR failed. Drives the refresh countdown UI; the
   *  next auto-refetch fires at `lastFetchedAt + refreshIntervalMs`. */
  lastFetchedAt: number
  /** Configured auto-refetch cadence in ms, so the UI can render an accurate
   *  progress ring without hardcoding the value in two places. */
  refreshIntervalMs: number
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

function brownfiRouteFromTrade(
  trade: Trade,
  source: 'brownfi-v2' | 'brownfi-v3-pilot' | 'brownfi-v3-official',
  sourceName: string,
  slippageBps: number,
): UnifiedRoute | null {
  // BrownFi SDK's Trade exposes outputAmount as a CurrencyAmount. Use raw
  // (JSBI → string) so we can wrap it in BigNumber consistently with the
  // aggregator side. Defensive: SDK types outputAmount as possibly
  // undefined for partially-constructed trades.
  if (!trade.outputAmount) return null
  const amountOut = BigNumber.from(trade.outputAmount.raw.toString())
  return {
    source,
    sourceName,
    amountOut,
    amountOutMin: deriveAmountOutMin(amountOut, slippageBps),
    nativeTrade: trade,
  }
}

export function useBestSwapRoute(params: UseBestSwapRouteParams): UseBestSwapRouteResult {
  const {
    v2Trade,
    v3PilotTrade,
    v3OfficialTrade,
    v2Unavailable,
    tokenIn,
    tokenOut,
    amountIn,
    account,
    slippageBps,
    deadline,
  } = params

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
      refetchInterval: REFRESH_INTERVAL_MS,
      staleTime: 10_000,
    })),
  })

  return useMemo(() => {
    const candidates: UnifiedRoute[] = []

    // BrownFi V2 + V3 — surfaced as separate candidates so the user can
    // compare them side-by-side in RouteComparison. The user's `selected`
    // choice is honored at pick time, not by hiding candidates. V2 with
    // a reserve issue is included but marked `unavailable` so the picker
    // can dim it; selection logic skips unavailable routes.
    if (v2Trade) {
      const r = brownfiRouteFromTrade(v2Trade, 'brownfi-v2', 'BrownFi V2', slippageBps)
      if (r) {
        if (v2Unavailable) {
          r.unavailable = { reason: 'Amount exceeds 90% of pool reserve' }
        }
        candidates.push(r)
      }
    }
    // V3 Official (version 4) and V3 Pilot (version 3) are surfaced as separate
    // rows so the picker compares both deployments side-by-side and auto-picks
    // best amountOut. Each carries its trade (version 3/4), so the swap callback
    // executes against the right deployment's router.
    if (v3OfficialTrade) {
      const r = brownfiRouteFromTrade(v3OfficialTrade, 'brownfi-v3-official', 'BrownFi V3 Official', slippageBps)
      if (r) candidates.push(r)
    }
    if (v3PilotTrade) {
      const r = brownfiRouteFromTrade(v3PilotTrade, 'brownfi-v3-pilot', 'BrownFi V3 Pilot', slippageBps)
      if (r) candidates.push(r)
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
    // Tie-break: BrownFi-native first (no external router hop, lower gas).
    const isBrownFi = (s: string) => s === 'brownfi-v2' || s === 'brownfi-v3-pilot' || s === 'brownfi-v3-official'
    const sorted = [...candidates].sort((a, b) => {
      if (a.amountOut.eq(b.amountOut)) {
        if (isBrownFi(a.source) && !isBrownFi(b.source)) return -1
        if (isBrownFi(b.source) && !isBrownFi(a.source)) return 1
        return 0
      }
      return b.amountOut.gt(a.amountOut) ? 1 : -1
    })
    // Selection ignores unavailable routes — the picker still shows
    // them (dimmed) but `best` is always something executable.
    const selectable = sorted.filter((r) => !r.unavailable)

    // Pick the winning route based on user preference.
    let best: UnifiedRoute | null = null
    if (selected === 'auto' || selected === 'native') {
      // 'native' is a legacy persisted value — the reducer migrates it on
      // boot but we belt-and-suspenders the runtime path too. Either way
      // it means "best amountOut among all sources".
      best = selectable[0] ?? null
    } else {
      // Specific source selected. Prefer it (must be selectable);
      // fall back to the best available BrownFi candidate if that
      // source has no route OR is unavailable (e.g., user pinned V2
      // but V2 hit the 90%-reserve cap → fall through to the best
      // working route).
      best =
        selectable.find((r) => r.source === selected) ??
        selectable.find((r) => isBrownFi(r.source)) ??
        selectable[0] ?? null
    }

    // Use `isLoading` (initial fetch only) — NOT `isFetching` (any
    // in-flight). Background refetches every 20s keep the quote fresh
    // without flipping this flag, so the UI doesn't pulse on every
    // refresh tick. If a refetch changes the amountOut the next render
    // picks it up silently; that's fine because the pulse is meant to
    // signal "you triggered a recalculation", not "data is refreshing
    // in the background."
    const isLoading = queries.some((q) => q.isLoading)
    // Aggregator stale-quote protection. BrownFi-native has no TTL; only
    // aggregator routes get a `validUntil`. If the chosen route has
    // expired we let the UI flag it and refetch.
    const now = Math.floor(Date.now() / 1000)
    const isStale = !!best?.aggregatorQuote && now > best.aggregatorQuote.validUntil

    const refetchAll = () => queries.forEach((q) => q.refetch())

    // React Query records `dataUpdatedAt` whenever a query settles (success
    // or error). Take the max across adapters so the countdown reflects
    // "time since the last aggregator response", regardless of which
    // adapter answered last. Falls back to 0 when nothing has fetched yet
    // — UI treats that as "indeterminate, no ring".
    const lastFetchedAt = queries.reduce((acc, q) => {
      const t = (q as { dataUpdatedAt?: number; errorUpdatedAt?: number }).dataUpdatedAt ?? 0
      const e = (q as { dataUpdatedAt?: number; errorUpdatedAt?: number }).errorUpdatedAt ?? 0
      return Math.max(acc, t, e)
    }, 0)

    return {
      best,
      candidates: sorted,
      isLoading,
      isStale,
      refetchAll,
      lastFetchedAt,
      refreshIntervalMs: REFRESH_INTERVAL_MS,
    }
  }, [aggregators, v2Trade, v3PilotTrade, v3OfficialTrade, v2Unavailable, queries, selected, slippageBps])
}
