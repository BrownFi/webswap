import { ChainId, isV3Like } from '@brownfi/sdk'
import { useInfiniteQuery } from '@tanstack/react-query'
import { isV3Enabled } from 'connectors'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'
import { useMemo } from 'react'
import { graphqlFetcher } from 'utils/graphql'

// Single source of truth for the per-pool `transactions` feed shared by the LP
// chart (PairChartTV) and the Pool Balance chart. Both mount on the same detail
// page and previously each fetched their own ~1000-tx batch of the SAME pair.
// This hook collapses that to ONE `useInfiniteQuery` keyed by (chain, pair,
// version): react-query dedupes by key, so both charts read from one cache and
// share load-more paging — one network request, guaranteed-identical data.
//
// The field set is the SUPERSET both charts need: reserves (Pool Balance's %
// split + both charts' relative price) plus lpPrice/bh3Price/uniV2Price and the
// swap amounts (LP chart's ROI % lines + volume). Consumers just ignore fields
// they don't use.

export type PairTxn = {
  timestamp: string
  reserve0: string
  reserve1: string
  reserve0USD: string
  reserve1USD: string
  lpPrice?: string
  bnhPrice?: string
  bh3Price?: string
  uniV2Price?: string
  amount0In?: string
  amount1In?: string
}

// `uniV2Price` follows the API's V3 capability (empty when talking to a prod API
// that lacks the field). Requesting it where unsupported is a GraphQL validation
// error that 500s the query, so keep an explicit allowlist.
const CHAINS_WITH_UNIV2_PRICE = !isV3Enabled
  ? new Set<number>()
  : new Set<number>([
      ChainId.BASE_MAINNET,
      ChainId.BERA_MAINNET,
      ChainId.BSC_MAINNET,
      ChainId.ARBITRUM_MAINNET,
      ChainId.LINEA_MAINNET,
      ChainId.SEI_MAINNET,
      ChainId.HYPER_EVM,
      ChainId.MONAD,
      ChainId.ROBINHOOD_MAINNET,
    ])
export const hasUniV2Price = (chainId: number) => CHAINS_WITH_UNIV2_PRICE.has(chainId)

const FIELDS = `
      timestamp
      reserve0
      reserve1
      reserve0USD
      reserve1USD
      lpPrice
      bnhPrice
      bh3Price
      uniV2Price
      amount0In
      amount1In`

// Strip uniV2Price when the chain doesn't expose it (else GraphQL rejects it).
const buildQuery = (keepUniV2: boolean, older: boolean): string => {
  const fields = keepUniV2 ? FIELDS : FIELDS.replace(/\s*uniV2Price\s*/g, '\n')
  return older
    ? `query PairTxnsOlder($pair: String, $before: BigInt) {
    transactions(first: 1000, where: { pair: $pair, timestamp_lt: $before }, orderBy: timestamp, orderDirection: desc) {${fields}
    }
  }`
    : `query PairTxns($pair: String) {
    transactions(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {${fields}
    }
  }`
}

const PAGE_SIZE = 1000
// Cap the paging loop: 20 pages = up to 20k swaps. Deep/busy pools keep the most
// recent 20k — far past the 1000-tx cap and enough for any timeframe.
const MAX_PAGES = 20

export type UsePairTransactions = {
  txns: PairTxn[]
  loadMore: () => void
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
}

export function usePairTransactions(chainId: number, pairAddress: string, version: number): UsePairTransactions {
  // Derived from (chainId, version) — both already in the query key — so both
  // charts compute the same value and share one cache entry.
  const keepUniV2 = hasUniV2Price(chainId) && isV3Like(version)
  const pair = pairAddress?.toLowerCase()

  const query = useInfiniteQuery<PairTxn[]>({
    queryKey: ['pairTxns', chainId, pair, version],
    queryFn: async ({ pageParam }) => {
      const before = pageParam as number | undefined
      const older = before != null
      const res = (await graphqlFetcher({
        operationName: older ? 'PairTxnsOlder' : 'PairTxns',
        query: withFirstActivityGte(buildQuery(keepUniV2, older), 'timestamp', chainId, pairAddress),
        variables: older ? { chainId, version, pair, before } : { chainId, version, pair },
      })) as { transactions?: PairTxn[] } | null
      return res?.transactions ?? []
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined // reached the start of history
      const oldest = lastPage[lastPage.length - 1]
      const before = oldest ? Number(oldest.timestamp) : undefined
      return before && Number.isFinite(before) ? before : undefined
    },
    enabled: !!pair && !!chainId,
    staleTime: 60_000,
  })

  // Flattened newest-first list (pages are appended oldest-ward, each newest-first).
  const txns = useMemo<PairTxn[]>(() => (query.data?.pages ?? []).flat(), [query.data])

  const pageCount = query.data?.pages.length ?? 0
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage && pageCount < MAX_PAGES) {
      query.fetchNextPage()
    }
  }

  return {
    txns,
    loadMore,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: !!query.hasNextPage && pageCount < MAX_PAGES,
  }
}
