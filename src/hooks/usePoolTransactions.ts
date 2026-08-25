import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
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
// LP-vs-BH / LP-vs-BH3 benchmarks (Pool Balance + Oracle Spread).
const BENCHMARK_BH3 = 'lpPrice\n      bnhPrice\n      bh3Price'
const BENCHMARK = 'lpPrice\n      bnhPrice'
// Oracle spread inputs (Oracle Spread) + config (Pool Config) — V3 oracle pools.
const ORACLE = 'pythPrice0\n      pythPrice1\n      ammPriceRel\n      adjPriceRel'
const CONFIG = 'lambda\n      kB\n      kQ\n      compress\n      sSell\n      sBuy\n      pythWeight'

// Field tiers, richest first. First one the indexer accepts wins.
const FIELD_TIERS = [
  `${CORE}\n      ${BENCHMARK_BH3}\n      ${ORACLE}\n      ${CONFIG}`,
  `${CORE}\n      ${BENCHMARK}\n      ${ORACLE}\n      ${CONFIG}`,
  `${CORE}\n      ${BENCHMARK_BH3}`,
  `${CORE}\n      ${BENCHMARK}`,
  CORE,
]

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
  bh3Price?: number | string
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
  pythWeight?: number | string
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
 * Shared newest-1000 transactions for a pool. All charts call this with the same
 * key, so react-query fires exactly ONE request and hands the rows to each.
 * Charts still page OLDER rows on scroll via fetchPoolTxnsPage(before) themselves.
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
  // Stabilize the empty fallback so a still-loading pool doesn't hand the charts a
  // fresh [] every render (which would make their setData effects re-fire and, on
  // hover, spin the crosshair into a "Maximum update depth exceeded" loop — same
  // reason as usePoolMarketPrice).
  const txns = useMemo(() => data ?? [], [data])
  return { txns, isLoading, isError }
}
