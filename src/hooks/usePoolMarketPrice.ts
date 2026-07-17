import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchMarketRelativePrice } from 'services/pythBenchmarksService'

type Props = {
  // Pyth bytes32 feed ids for the BASE and QUOTE tokens (base priced in quote).
  baseFeedId?: string | null
  quoteFeedId?: string | null
  // Chart bucket size (seconds) — maps to the Benchmarks resolution.
  bucket: number
  // Window [from, to] in unix seconds (the chart's grid).
  from: number | null
  to: number | null
  enabled?: boolean
}

/**
 * Continuous market relative-price (base/quote) from Pyth Benchmarks, aligned to
 * the chart's time buckets. Used to draw the dashed "market" line that fills the
 * pool's no-trade gaps — where our own indexer has no observation, the underlying
 * crypto price still moved, and Pyth (the oracle our contract already uses) has it.
 *
 * Returns [] when either token has no resolvable Pyth feed, so the caller simply
 * omits the dashed line (the solid observed line still renders on its own).
 */
export function usePoolMarketPrice({ baseFeedId, quoteFeedId, bucket, from, to, enabled = true }: Props) {
  const { data } = useQuery<{ time: number; value: number }[]>({
    queryKey: ['poolMarketPrice', baseFeedId, quoteFeedId, bucket, from, to],
    queryFn: () => fetchMarketRelativePrice(baseFeedId, quoteFeedId, bucket, from!, to!),
    enabled: enabled && !!baseFeedId && !!quoteFeedId && from != null && to != null && to > from,
    // Benchmarks history is immutable for past buckets; only the latest bucket
    // moves. 5-min freshness is plenty for a reference overlay and keeps the
    // request count low as the user flips timeframes.
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
  })
  // Stabilize the reference: when the query is disabled (non-market pair, the
  // common case) `data` stays `undefined`, and a bare `data ?? []` would hand the
  // caller a NEW empty array every render. The PoolBalanceChart pushes this into a
  // lightweight-charts series via setData in an effect; an unstable ref makes that
  // effect fire every render, and on hover setData re-emits the crosshair
  // synchronously → setHovered → re-render → setData → "Maximum update depth
  // exceeded". Memoizing keeps the empty (and loaded) reference stable.
  return useMemo(() => data ?? [], [data])
}
