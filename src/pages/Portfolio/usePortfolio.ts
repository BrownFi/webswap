/**
 * Hook backing the Portfolio page. Fetches the connected user's LP
 * positions across EVERY supported EVM chain × every indexed version,
 * merges them into a unified shape tagged with chainId + version, and
 * returns derived aggregate stats (total value, total PnL, etc.).
 *
 * Why multi-chain: the user's wallet address is the same across every
 * EVM chain — there's no UX reason to make them switch chains to see
 * their positions on another network. We fan out one GraphQL query per
 * (chain, version) combo that has an indexer endpoint deployed, then
 * merge by descending USD value. Each row carries its chainId so the
 * UI badge can show the chain icon.
 *
 * V3 (Official, version 3) indexer chains derive from ROUTER_ADDRESS_V3_OFFICIAL
 * — that map is the source of truth. V2/V1/Pilot were removed.
 *
 * Sui is excluded — different account model, different indexer (when
 * it ships), and zero positions exist there today. Added separately
 * once Sui contracts deploy.
 *
 * Closed-position split: rows where lp = 0 and stakeLP = 0 are filtered
 * into a separate bucket. Active positions go front-and-center; closed
 * ones live in a collapsible section.
 */
import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useActiveWeb3React } from 'hooks'
import { ChainId } from '@brownfi/sdk'
import { ROUTER_ADDRESS_V3_OFFICIAL, VERSION } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'

const PAIR_ACCOUNTS_QUERY = `
  query PairAccountsByUser($account: String!) {
    pairAccounts(
      where: { account: $account }
      orderBy: lpPortfolio
      orderDirection: desc
      first: 100
    ) {
      id
      lp
      stakeLP
      lpPortfolio
      basePortfolio
      bnhPortfolio
      unrealizedPnL
      unrealizedBnHPnL
      bnhROI
      lpROI
      updatedAt
      pair {
        id
        fee
        tvl
        apr
        volumeDay
        reserve0
        reserve1
        totalSupply
        token0 { id symbol name decimals price }
        token1 { id symbol name decimals price }
      }
    }
  }
`

// V3 Official indexer chains, derived directly from ROUTER_ADDRESS_V3_OFFICIAL —
// V3 router and V3 indexer ship together, so the address map is the source of
// truth. This is the ONLY version the app supports (V2 / V3-Pilot removed).
const V3_INDEXER_CHAINS: ChainId[] = (Object.keys(ROUTER_ADDRESS_V3_OFFICIAL) as unknown as ChainId[])
  .map((k) => Number(k) as ChainId)
  .filter((id) => !!ROUTER_ADDRESS_V3_OFFICIAL[id])

export interface PortfolioPair {
  id: string
  fee: string | number
  tvl: string | number
  apr: string | number
  volumeDay: string | number
  reserve0: string | number
  reserve1: string | number
  totalSupply: string | number
  token0: { id: string; symbol: string; name: string; decimals: number; price: string | number }
  token1: { id: string; symbol: string; name: string; decimals: number; price: string | number }
}

export interface PortfolioPosition {
  id: string
  /** Source indexer version. Always V3 (Official = version 3). */
  version: 3
  /** EVM chainId this position lives on. UI shows chain icon from this. */
  chainId: ChainId
  lp: number
  stakeLP: number
  lpPortfolio: number
  basePortfolio: number
  bnhPortfolio: number
  unrealizedPnL: number
  unrealizedBnHPnL: number
  bnhROI: number
  lpROI: number
  updatedAt: number
  pair: PortfolioPair
}

export interface PortfolioStats {
  totalValue: number
  totalPnL: number
  totalBasePortfolio: number
  /** lpPortfolio − bnhPortfolio, summed. Positive = LPing beat HODL. */
  vsHodl: number
  /** Count of positions where lp > 0 OR stakeLP > 0. */
  activeCount: number
  closedCount: number
  /** Distinct chains that contributed at least one active position. */
  activeChainCount: number
}

interface PortfolioResult {
  active: PortfolioPosition[]
  closed: PortfolioPosition[]
  stats: PortfolioStats
  isLoading: boolean
  isError: boolean
}

function asNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function rowToPosition(raw: any, version: 3, chainId: ChainId): PortfolioPosition {
  return {
    id: `${chainId}-${raw.id}`,
    version,
    chainId,
    lp: asNumber(raw.lp),
    stakeLP: asNumber(raw.stakeLP),
    lpPortfolio: asNumber(raw.lpPortfolio),
    basePortfolio: asNumber(raw.basePortfolio),
    bnhPortfolio: asNumber(raw.bnhPortfolio),
    unrealizedPnL: asNumber(raw.unrealizedPnL),
    unrealizedBnHPnL: asNumber(raw.unrealizedBnHPnL),
    bnhROI: asNumber(raw.bnhROI),
    lpROI: asNumber(raw.lpROI),
    updatedAt: asNumber(raw.updatedAt),
    pair: raw.pair,
  }
}

interface FetchTask {
  chainId: ChainId
  version: 3
}

export function usePortfolio(): PortfolioResult {
  const { account } = useActiveWeb3React()
  const accountLower = account?.toLowerCase()

  // Build the full fan-out: every V2 indexer chain + every V3 indexer chain.
  // The same wallet address works across all EVM chains, so we fire one
  // query per (chain, version) combo unconditionally — staleTime keeps the
  // network cost reasonable.
  const tasks: FetchTask[] = useMemo(
    () => V3_INDEXER_CHAINS.map((chainId) => ({ chainId, version: VERSION.V3_OFFICIAL })),
    [],
  )

  const queries = useQueries({
    queries: tasks.map(({ chainId, version }) => ({
      queryKey: ['portfolio', version, chainId, accountLower],
      queryFn: () =>
        graphqlFetcher({
          operationName: 'PairAccountsByUser',
          query: PAIR_ACCOUNTS_QUERY,
          variables: { account: accountLower!, chainId, version },
        }),
      enabled: !!accountLower,
      // Aggressive cache lifetime. The portfolio query fan-out is currently
      // 8 V2 + 1 V3 = 9 parallel HTTP requests (one per chain × version,
      // since the indexer is sharded by chainId in the URL). Without a
      // backend batch endpoint we can't reduce request count, but we CAN
      // reduce request frequency. With staleTime = 5 min, navigating
      // away from Portfolio and back within 5 min hits the cache instead
      // of re-firing all 9 calls. Positions don't change between user
      // actions, so freshness loss is negligible.
      staleTime: 5 * 60_000,
      // Keep the cached results around for 30 min after last subscriber
      // unmounts. Bounces between Swap → Portfolio → Pool → Portfolio
      // stay instant.
      gcTime: 30 * 60_000,
      // No background polling. Portfolio data is event-driven (the user
      // adds/removes liquidity → they expect to see the change next time
      // they look). A 30-second poll would mean ~18 requests/min for a
      // user who leaves the tab open — wasteful for non-real-time data.
      refetchInterval: false as const,
      // Re-fetch when the tab regains focus (cheap signal that the user
      // is back). This catches the "I did a remove-liquidity in another
      // tab, switched back" case without a constant background poll.
      refetchOnWindowFocus: true,
    })),
  })

  return useMemo<PortfolioResult>(() => {
    // Loading: at least one query has never returned yet AND is currently in flight.
    const isLoading = queries.some((q) => q.isLoading && q.isFetching)
    // Error: EVERY query failed. Per-chain failures shouldn't blank the
    // whole portfolio — we still surface positions from the queries that
    // did succeed.
    const isError = queries.every((q) => !!q.error)

    const merged: PortfolioPosition[] = []
    queries.forEach((q, i) => {
      const { chainId, version } = tasks[i]
      const rows: any[] = (q.data as any)?.pairAccounts ?? []
      rows.forEach((row) => merged.push(rowToPosition(row, version, chainId)))
    })

    // Filter out indexer aggregate rows (where account === pair). These
    // show up for pool-level BGT staking aggregations and aren't the
    // user's own positions.
    const filtered = merged.filter((p) => {
      const [accPart, pairPart] = p.id.split('-').slice(1).join('-').split('-')
      return accPart !== pairPart
    })

    // Active = LP balance OR staked LP > 0. Sort by current USD value desc.
    const active = filtered
      .filter((p) => p.lp > 0 || p.stakeLP > 0)
      .sort((a, b) => b.lpPortfolio - a.lpPortfolio)
    // Closed = previously held but now empty. Keeps PnL history visible.
    const closed = filtered
      .filter((p) => p.lp === 0 && p.stakeLP === 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)

    const totalValue = active.reduce((acc, p) => acc + p.lpPortfolio, 0)
    const totalBasePortfolio = active.reduce((acc, p) => acc + p.basePortfolio, 0)
    const totalPnL = active.reduce((acc, p) => acc + p.unrealizedPnL, 0)
    const vsHodl = active.reduce((acc, p) => acc + (p.lpPortfolio - p.bnhPortfolio), 0)
    const activeChainCount = new Set(active.map((p) => p.chainId)).size

    return {
      active,
      closed,
      stats: {
        totalValue,
        totalBasePortfolio,
        totalPnL,
        vsHodl,
        activeCount: active.length,
        closedCount: closed.length,
        activeChainCount,
      },
      isLoading,
      isError,
    }
  }, [queries, tasks])
}
