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
 * V2 chains = the app's supported set (availableChains) so the list can't
 * drift out of sync. V3 (Official; pilot retired) = the chains where the V3
 * indexer is live (V3_OFFICIAL_USE_INDEXER). Per-chain failures are tolerated.
 *
 * Sui is excluded — different account model, different indexer (when
 * it ships), and zero positions exist there today. Added separately
 * once Sui contracts deploy.
 *
 * Bucketing: rows where lp = 0 and stakeLP = 0 are "closed". Open rows are
 * split by USD value — "active" (≥ $1) go front-and-center, "small" dust
 * (< $1) into their own bucket. Closed + small each live in a collapsible
 * section. Headline stat sums span all OPEN positions (active + small) so
 * the totals don't drop when dust is bucketed out.
 */
import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useActiveWeb3React } from 'hooks'
import { ChainId } from '@brownfi/sdk'
import { V3_OFFICIAL_USE_INDEXER, VERSION } from 'lib/sdk/constants/addresses'
import { availableChains } from 'connectors'
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

// V2 positions are queried on every SUPPORTED chain (availableChains), so this
// tracks the live chain set automatically — no hardcoded list to drift (that's
// how BSC/SEI lingered after being turned off). Per-chain query failures are
// handled gracefully, so a chain without a V2 indexer just adds nothing.
const V2_INDEXER_CHAINS: ChainId[] = availableChains.map((c) => c.id as ChainId)

// V3 (Official) indexer chains — where V3_OFFICIAL_USE_INDEXER is on (the BE /
// Goldsky V3 indexer is live). Pilot is retired, so the portfolio reads Official
// only. Currently Bera + HyperEVM + Arbitrum.
const V3_INDEXER_CHAINS: ChainId[] = (Object.keys(V3_OFFICIAL_USE_INDEXER) as unknown as ChainId[])
  .map((k) => Number(k) as ChainId)
  .filter((id) => V3_OFFICIAL_USE_INDEXER[id])

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
  /** Source indexer version. UI shows "V2" / "V3" badge from this. */
  version: 2 | 4
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
  /** Count of MAIN-LIST open positions (lpPortfolio ≥ $1). */
  activeCount: number
  /** Count of dust open positions (lpPortfolio < $1) in the small bucket. */
  smallCount: number
  closedCount: number
  /** Distinct chains that contributed at least one OPEN position (active + small). */
  activeChainCount: number
}

interface PortfolioResult {
  active: PortfolioPosition[]
  /** Open positions worth < $1 — dust, shown in a collapsible section. */
  small: PortfolioPosition[]
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

function rowToPosition(raw: any, version: 2 | 4, chainId: ChainId): PortfolioPosition {
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
  version: 2 | 4
}

export function usePortfolio(): PortfolioResult {
  const { account } = useActiveWeb3React()
  const accountLower = account?.toLowerCase()

  // Build the full fan-out: every V2 indexer chain + every V3 indexer chain.
  // The same wallet address works across all EVM chains, so we fire one
  // query per (chain, version) combo unconditionally — staleTime keeps the
  // network cost reasonable.
  const tasks: FetchTask[] = useMemo(
    () => [
      ...V2_INDEXER_CHAINS.map((chainId) => ({ chainId, version: VERSION.V2 })),
      ...V3_INDEXER_CHAINS.map((chainId) => ({ chainId, version: VERSION.V3_OFFICIAL })),
    ],
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
      // ~6 V2 + ~3 V3 = ~9 parallel HTTP requests (one per chain × version,
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

    // Open = LP balance OR staked LP > 0. Split by USD value so dust (< $1)
    // doesn't clutter the main list.
    const open = filtered.filter((p) => p.lp > 0 || p.stakeLP > 0)
    // Active = the MAIN list: open positions worth ≥ $1. Sort by USD value desc.
    const active = open
      .filter((p) => p.lpPortfolio >= 1)
      .sort((a, b) => b.lpPortfolio - a.lpPortfolio)
    // Small = dust: open positions worth < $1. Same sort, shown collapsed.
    const small = open
      .filter((p) => p.lpPortfolio < 1)
      .sort((a, b) => b.lpPortfolio - a.lpPortfolio)
    // Closed = previously held but now empty. Keeps PnL history visible.
    const closed = filtered
      .filter((p) => p.lp === 0 && p.stakeLP === 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)

    // Headline sums span ALL open positions (active + small), so moving dust to
    // its own bucket doesn't drop the totals. activeCount stays the main-list count.
    const totalValue = open.reduce((acc, p) => acc + p.lpPortfolio, 0)
    const totalBasePortfolio = open.reduce((acc, p) => acc + p.basePortfolio, 0)
    const totalPnL = open.reduce((acc, p) => acc + p.unrealizedPnL, 0)
    const vsHodl = open.reduce((acc, p) => acc + (p.lpPortfolio - p.bnhPortfolio), 0)
    const activeChainCount = new Set(open.map((p) => p.chainId)).size

    return {
      active,
      small,
      closed,
      stats: {
        totalValue,
        totalBasePortfolio,
        totalPnL,
        vsHodl,
        activeCount: active.length,
        smallCount: small.length,
        closedCount: closed.length,
        activeChainCount,
      },
      isLoading,
      isError,
    }
  }, [queries, tasks])
}
