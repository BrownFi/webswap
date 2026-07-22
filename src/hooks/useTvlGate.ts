import { Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { graphqlFetcher } from 'utils/graphql'
import { getTvlCap } from 'config/tvlGate'

const PAIR_TVL_QUERY = `query PairTvlGate($id: String) { pair(id: $id) { tvl } }`

export type TvlGate = {
  /** Configured max TVL (USD). undefined when this pool isn't gated. */
  cap?: number
  /** Current pool TVL (USD) from the indexer. undefined until fetched. */
  tvl?: number
  /** true when a cap is configured AND current TVL >= cap. */
  gated: boolean
  loading: boolean
}

/**
 * Per-pool TVL cap gate for adding liquidity. Only pools present in TVL_GATE_CAPS
 * fetch their TVL — every other pool short-circuits to `{ gated: false }` with no
 * network cost (the query is `enabled` only when a cap is configured). Polls every
 * 30s so the gate flips as soon as an add pushes TVL across the cap. Display-only:
 * callers use `gated` to show a notice / block the Add action, never to size a tx.
 */
export function useTvlGate(pair?: Pair): TvlGate {
  const chainId = pair?.chainId
  const version = pair?.version
  const poolAddress = pair?.liquidityToken?.address
  const cap = getTvlCap(chainId, poolAddress)

  const { data, isLoading } = useQuery<number | undefined>({
    queryKey: ['tvlGate', chainId, poolAddress?.toLowerCase(), version],
    queryFn: async () => {
      const res = (await graphqlFetcher({
        operationName: 'PairTvlGate',
        query: PAIR_TVL_QUERY,
        variables: { chainId, version, id: poolAddress!.toLowerCase() },
      })) as { pair?: { tvl?: number | string } } | null
      const t = res?.pair?.tvl
      return t == null ? undefined : Number(t)
    },
    enabled: cap !== undefined && !!chainId && !!poolAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const tvl = typeof data === 'number' && Number.isFinite(data) ? data : undefined
  const gated = cap !== undefined && typeof tvl === 'number' && tvl >= cap
  return { cap, tvl, gated, loading: isLoading }
}
