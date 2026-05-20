/**
 * Orchestration hooks for the multi-aggregator zap pipeline.
 *
 * Mirrors useBestSwapRoute, with two endpoints (in / out) instead of one.
 * For each registered zap adapter that supports the current chain × version,
 * fires a useQuery, collects the responses, and picks the winning route by
 * lpOut (zap-in) or amountOut (zap-out). The Zap UI consumes the unified
 * shape — it doesn't need to know whether a route came from BrownFi or
 * Kyber.
 *
 * Design parity with useBestSwapRoute:
 * - Every supported adapter is always quoted, even when the user has
 *   pinned a specific one. That way the comparison card can show what the
 *   alternative would have been.
 * - Background refetch (20s) keeps quotes fresh; isLoading is initial-only
 *   so the UI doesn't pulse on every tick.
 * - validUntil flows through to isStale so consumers can refetch before
 *   signing rather than building tx calldata against an expired route.
 */
import { Currency, ETHER, Pair, Token } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { getZapAggregatorsFor } from 'services/aggregators/zapRegistry'
import type {
  ZapAggregatorId,
  ZapInQuote,
  ZapInQuoteParams,
  ZapOutQuote,
  ZapOutQuoteParams,
} from 'services/aggregators/zapTypes'
import type { BrownFiVersion } from 'services/aggregators/types'

/** Auto = pick best metric across all adapters. Explicit id pins that one. */
export type ZapChoice = 'auto' | ZapAggregatorId

export interface UnifiedZapInRoute {
  source: ZapAggregatorId
  sourceName: string
  lpOut: BigNumber
  lpOutMin: BigNumber
  routerAddress: string
  gasEstimate?: BigNumber
  priceImpact?: number
  /** Opaque to the orchestrator — passed back to `adapter.buildZapIn` at execute time. */
  quote: ZapInQuote<unknown>
}

export interface UnifiedZapOutRoute {
  source: ZapAggregatorId
  sourceName: string
  amountOut: BigNumber
  amountOutMin: BigNumber
  routerAddress: string
  gasEstimate?: BigNumber
  priceImpact?: number
  quote: ZapOutQuote<unknown>
}

export interface UseBestZapInRouteParams {
  pair: Pair | undefined
  /** One or two tokens, each with the smallest-unit string amount. */
  inputs: Array<{ currency: Currency; amountRaw: string }>
  account: string | undefined
  /** basis points — 50 = 0.5% */
  slippageBps: number
  /** unix seconds */
  deadline: number
  /** 'auto' picks the highest LP-out; explicit id pins that adapter. */
  selected?: ZapChoice
}

export interface UseBestZapInRouteResult {
  best: UnifiedZapInRoute | null
  /** Every adapter that returned a quote, sorted by lpOut desc (native tie-break). */
  candidates: UnifiedZapInRoute[]
  isLoading: boolean
  isStale: boolean
  refetchAll: () => void
}

export interface UseBestZapOutRouteParams {
  pair: Pair | undefined
  /** LP token amount to burn, in smallest units. */
  liquidityRaw: string | undefined
  /** Single token the user wants to receive. */
  tokenOut: Currency | undefined
  account: string | undefined
  slippageBps: number
  deadline: number
  selected?: ZapChoice
}

export interface UseBestZapOutRouteResult {
  best: UnifiedZapOutRoute | null
  candidates: UnifiedZapOutRoute[]
  isLoading: boolean
  isStale: boolean
  refetchAll: () => void
}

function tokenAddress(c: Currency | undefined): string | undefined {
  if (!c) return undefined
  if (c === ETHER) return 'NATIVE'
  if (c instanceof Token) return c.address
  return undefined
}

/** Sort native ahead on ties so the BrownFi router wins when adapters draw. */
function tieBreakNative(aSource: string, bSource: string): number {
  if (aSource === 'native' && bSource !== 'native') return -1
  if (bSource === 'native' && aSource !== 'native') return 1
  return 0
}

export function useBestZapInRoute(params: UseBestZapInRouteParams): UseBestZapInRouteResult {
  const { pair, inputs, account, slippageBps, deadline, selected = 'auto' } = params

  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const aggregators = useMemo(() => {
    if (!chainId) return []
    return getZapAggregatorsFor(chainId, version as BrownFiVersion)
  }, [chainId, version])

  // Stable cache key. Null = inputs incomplete, queries stay disabled.
  // Inputs are stringified preserving order — Kyber pairs tokensIn[] with
  // amountsIn[] positionally, so we can't sort them.
  const baseKey = useMemo(() => {
    if (!chainId || !account || !pair) return null
    if (inputs.length === 0) return null
    if (inputs.some((i) => !i.amountRaw || i.amountRaw === '0')) return null
    const inputsKey = inputs.map((i) => `${tokenAddress(i.currency) ?? '?'}:${i.amountRaw}`).join('|')
    return [chainId, version, account, pair.liquidityToken.address, slippageBps, inputsKey]
  }, [chainId, version, account, pair, inputs, slippageBps])

  const queries = useQueries({
    queries: aggregators.map((a) => ({
      queryKey: ['zap-in-quote', a.id, ...(baseKey ?? [])],
      queryFn: async () => {
        if (!baseKey || !chainId || !account || !pair) return null
        const quoteParams: ZapInQuoteParams = {
          chainId,
          version: version as BrownFiVersion,
          pair,
          account,
          inputs,
          slippageBps,
          deadline,
        }
        return a.quoteZapIn(quoteParams)
      },
      enabled: baseKey !== null,
      refetchInterval: 20_000,
      staleTime: 10_000,
    })),
  })

  return useMemo(() => {
    const candidates: UnifiedZapInRoute[] = []

    queries.forEach((q, i) => {
      const data = q.data
      if (!data) return
      const adapter = aggregators[i]
      candidates.push({
        source: adapter.id,
        sourceName: adapter.name,
        lpOut: data.lpOut,
        lpOutMin: data.lpOutMin,
        routerAddress: data.routerAddress,
        gasEstimate: data.gasEstimate,
        priceImpact: data.priceImpact,
        quote: data,
      })
    })

    const sorted = [...candidates].sort((a, b) => {
      if (a.lpOut.eq(b.lpOut)) return tieBreakNative(a.source, b.source)
      return b.lpOut.gt(a.lpOut) ? 1 : -1
    })

    let best: UnifiedZapInRoute | null = null
    if (selected === 'auto') {
      best = sorted[0] ?? null
    } else {
      best = sorted.find((r) => r.source === selected) ?? sorted.find((r) => r.source === 'native') ?? sorted[0] ?? null
    }

    const isLoading = queries.some((q) => q.isLoading)
    const now = Math.floor(Date.now() / 1000)
    const isStale = !!best && now > best.quote.validUntil

    const refetchAll = () => queries.forEach((q) => q.refetch())

    return { best, candidates: sorted, isLoading, isStale, refetchAll }
  }, [aggregators, queries, selected])
}

export function useBestZapOutRoute(params: UseBestZapOutRouteParams): UseBestZapOutRouteResult {
  const { pair, liquidityRaw, tokenOut, account, slippageBps, deadline, selected = 'auto' } = params

  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const aggregators = useMemo(() => {
    if (!chainId) return []
    return getZapAggregatorsFor(chainId, version as BrownFiVersion)
  }, [chainId, version])

  const baseKey = useMemo(() => {
    if (!chainId || !account || !pair || !tokenOut) return null
    if (!liquidityRaw || liquidityRaw === '0') return null
    return [
      chainId,
      version,
      account,
      pair.liquidityToken.address,
      tokenAddress(tokenOut),
      liquidityRaw,
      slippageBps,
    ]
  }, [chainId, version, account, pair, tokenOut, liquidityRaw, slippageBps])

  const queries = useQueries({
    queries: aggregators.map((a) => ({
      queryKey: ['zap-out-quote', a.id, ...(baseKey ?? [])],
      queryFn: async () => {
        if (!baseKey || !chainId || !account || !pair || !tokenOut || !liquidityRaw) return null
        const quoteParams: ZapOutQuoteParams = {
          chainId,
          version: version as BrownFiVersion,
          pair,
          account,
          liquidityRaw,
          tokenOut,
          slippageBps,
          deadline,
        }
        return a.quoteZapOut(quoteParams)
      },
      enabled: baseKey !== null,
      refetchInterval: 20_000,
      staleTime: 10_000,
    })),
  })

  return useMemo(() => {
    const candidates: UnifiedZapOutRoute[] = []

    queries.forEach((q, i) => {
      const data = q.data
      if (!data) return
      const adapter = aggregators[i]
      candidates.push({
        source: adapter.id,
        sourceName: adapter.name,
        amountOut: data.amountOut,
        amountOutMin: data.amountOutMin,
        routerAddress: data.routerAddress,
        gasEstimate: data.gasEstimate,
        priceImpact: data.priceImpact,
        quote: data,
      })
    })

    const sorted = [...candidates].sort((a, b) => {
      if (a.amountOut.eq(b.amountOut)) return tieBreakNative(a.source, b.source)
      return b.amountOut.gt(a.amountOut) ? 1 : -1
    })

    let best: UnifiedZapOutRoute | null = null
    if (selected === 'auto') {
      best = sorted[0] ?? null
    } else {
      best = sorted.find((r) => r.source === selected) ?? sorted.find((r) => r.source === 'native') ?? sorted[0] ?? null
    }

    const isLoading = queries.some((q) => q.isLoading)
    const now = Math.floor(Date.now() / 1000)
    const isStale = !!best && now > best.quote.validUntil

    const refetchAll = () => queries.forEach((q) => q.refetch())

    return { best, candidates: sorted, isLoading, isStale, refetchAll }
  }, [aggregators, queries, selected])
}
