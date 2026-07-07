import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { graphqlFetcher } from 'utils/graphql'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'

// Shared per-pool transactions fetch. The Pool Balance, Oracle Spread and Pool
// Config charts each used to fire their own `transactions(first:1000)` query (same
// rows, different columns) — 3 separate calls on every pool page. This hook fetches
// the UNION of their columns ONCE under a single react-query key, so all three share
// one call. It's smaller than the 3 combined (overlapping columns fetched once).
//
// Column availability varies by chain/version (benchmark, oracle and config fields
// are partial rollouts), so we try tiers full → core+benchmark → core and use the
// first that the indexer accepts — a stripped field just reads back as null on the
// consuming chart.

// Always present.
const CORE =
  'timestamp\n      type\n      reserve0\n      reserve1\n      reserve0USD\n      reserve1USD\n      amount0In\n      amount0Out\n      amount1In\n      amount1Out'
// LP-vs-BH benchmark (Pool Balance + Oracle Spread).
const BENCHMARK = 'lpPrice\n      bnhPrice'
// Oracle spread inputs (Oracle Spread) + config (Pool Config) — V3 oracle pools.
const ORACLE = 'pythPrice0\n      pythPrice1\n      ammPriceRel\n      adjPriceRel'
const CONFIG = 'lambda\n      kB\n      kQ\n      compress\n      sSell\n      sBuy'

// Field tiers, richest first. First one the indexer accepts wins.
const FIELD_TIERS = [
  `${CORE}\n      ${BENCHMARK}\n      ${ORACLE}\n      ${CONFIG}`,
  `${CORE}\n      ${BENCHMARK}`,
  CORE,
]

// Stable empty ref (see usePoolTransactions return) — avoids a fresh [] per render.
const EMPTY_TXNS: PoolTxn[] = []

export type PoolTxn = {
  timestamp: number | string
  type?: string
  reserve0?: number | string
  reserve1?: number | string
  reserve0USD?: number | string
  reserve1USD?: number | string
  amount0In?: number | string
  amount0Out?: number | string
  amount1In?: number | string
  amount1Out?: number | string
  lpPrice?: number | string
  bnhPrice?: number | string
  pythPrice0?: number | string
  pythPrice1?: number | string
  ammPriceRel?: number | string
  adjPriceRel?: number | string
  lambda?: number | string
  kB?: number | string
  kQ?: number | string
  compress?: number | string
  sSell?: number | string
  sBuy?: number | string
}

const buildQuery = (fields: string, operationName: string, cursorArg: boolean) => `
  query ${operationName}($pair: String${cursorArg ? ', $before: BigInt' : ''}) {
    transactions(first: 1000, where: { pair: $pair${cursorArg ? ', timestamp_lt: $before' : ''} }, orderBy: timestamp, orderDirection: desc) {
      ${fields}
    }
  }
`

// Fetch one page (newest, or older via `before`), trying each field tier until one
// is accepted by the indexer.
export async function fetchPoolTxnsPage(
  chainId: number,
  version: number,
  pairAddress: string,
  before?: number,
): Promise<PoolTxn[]> {
  const operationName = before ? 'PoolTxnsOlder' : 'PoolTxns'
  for (const fields of FIELD_TIERS) {
    try {
      const query = withFirstActivityGte(buildQuery(fields, operationName, !!before), 'timestamp', chainId, pairAddress)
      const variables: Record<string, unknown> = { chainId, version, pair: pairAddress.toLowerCase() }
      if (before) variables.before = before
      const res = (await graphqlFetcher({ operationName, query, variables })) as { transactions?: PoolTxn[] } | null
      if (res?.transactions) return res.transactions
    } catch {
      // tier rejected (missing field) — try the next, leaner one
    }
  }
  return []
}

/**
 * Cached older-page fetcher, shared across the pool charts. All three charts page
 * older history from the SAME newest-1000 base, so their `before` cursors line up
 * exactly (oldest-of-baseTxns, then oldest-of-page1, …). Keying the fetch by
 * (pool, before) means whichever chart scrolls back first pays the network cost
 * and the others reuse the cached page instead of re-fetching the same ~650 kB.
 * Older tx pages are immutable history, so a long staleTime is safe.
 *
 * Concurrent calls with the same key (e.g. all three charts auto-loading on first
 * render) share one in-flight request — react-query coalesces them.
 */
export function useFetchPoolTxnsPage() {
  const queryClient = useQueryClient()
  return useCallback(
    (chainId: number, version: number, pairAddress: string, before?: number) =>
      queryClient.fetchQuery({
        queryKey: ['poolTxnsPage', chainId, version, pairAddress?.toLowerCase(), before ?? 'newest'],
        queryFn: () => fetchPoolTxnsPage(chainId, version, pairAddress, before),
        staleTime: 10 * 60_000,
      }),
    [queryClient],
  )
}

/**
 * Shared newest-1000 transactions for a pool. All charts call this with the same
 * key, so react-query fires exactly ONE request and hands the rows to each.
 * Charts still page OLDER rows on scroll via useFetchPoolTxnsPage (also shared).
 */
export function usePoolTransactions({
  pairAddress,
  chainId,
  version,
  enabled = true,
}: {
  pairAddress: string
  chainId: number
  version: number
  enabled?: boolean
}) {
  const { data, isLoading, isError } = useQuery<PoolTxn[]>({
    queryKey: ['poolTxns', chainId, pairAddress?.toLowerCase(), version],
    queryFn: () => fetchPoolTxnsPage(chainId, version, pairAddress),
    enabled: enabled && !!pairAddress && !!chainId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
  // Stable empty ref while loading — a fresh [] each render would cascade through
  // combinedTxs → allPoints → grid → setData every render (crosshair re-fire loop).
  return { txns: data ?? EMPTY_TXNS, isLoading, isError }
}
