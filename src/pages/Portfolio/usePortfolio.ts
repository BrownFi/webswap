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
import { useHermesPricesByFeed } from 'hooks/useHermesPricesByFeed'

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
      bnh0
      bnh1
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
        token0 { id symbol name decimals price priceFeedId }
        token1 { id symbol name decimals price priceFeedId }
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
  token0: { id: string; symbol: string; name: string; decimals: number; price: string | number; priceFeedId?: string | null }
  token1: { id: string; symbol: string; name: string; decimals: number; price: string | number; priceFeedId?: string | null }
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
  bnh0: number
  bnh1: number
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
    bnh0: asNumber(raw.bnh0),
    bnh1: asNumber(raw.bnh1),
    updatedAt: asNumber(raw.updatedAt),
    pair: raw.pair,
  }
}

// Re-price a position from fresh Hermes prices (by feed id), mirroring the position
// cards: LPing = current pooled amounts × price, HODL = bnh0/bnh1 × the SAME price,
// PnL = LP − basePortfolio. A pool with no recent swaps never refreshes the indexer
// token price, so the stored lpPortfolio/bnhPortfolio go stale; this recomputes them
// live.
//
// BOTH-OR-NEITHER: the page reads vsHodl = lpPortfolio − bnhPortfolio, so LP and HODL
// must share ONE price basis. We only reprice when the LP side is trustworthy —
// GUARD: the recompute AT THE INDEXER'S OWN PRICES must reconcile with the stored
// lpPortfolio (within 2%), which proves our share convention (incl. staked LP)
// matches the indexer's. On success we freshen LP *and* HODL with the same prices;
// on any miss (no feed/price, no reserves, closed, or share mismatch) we return the
// position UNTOUCHED so it stays on the indexer's self-consistent values — never a
// stale-LP-vs-fresh-HODL mix. Display-only (no tx reads these).
function repricePosition(p: PortfolioPosition, priceByFeed: Record<string, number>): PortfolioPosition {
  const f0 = p.pair?.token0?.priceFeedId?.toLowerCase()
  const f1 = p.pair?.token1?.priceFeedId?.toLowerCase()
  const p0 = f0 ? priceByFeed[f0] : undefined
  const p1 = f1 ? priceByFeed[f1] : undefined
  if (!(typeof p0 === 'number' && p0 > 0 && typeof p1 === 'number' && p1 > 0)) return p

  const ts = asNumber(p.pair?.totalSupply)
  const totalLp = p.lp + p.stakeLP
  if (!(ts > 0) || !(totalLp > 0)) return p

  const share = totalLp / ts
  const d0 = asNumber(p.pair?.reserve0) * share
  const d1 = asNumber(p.pair?.reserve1) * share
  const idx0 = asNumber(p.pair?.token0?.price)
  const idx1 = asNumber(p.pair?.token1?.price)
  const lpAtIdx = d0 * idx0 + d1 * idx1
  const lpReconciles = idx0 > 0 && idx1 > 0 && p.lpPortfolio > 0 && Math.abs(lpAtIdx - p.lpPortfolio) <= 0.02 * p.lpPortfolio
  if (!lpReconciles) return p

  // Trustworthy: freshen LP and HODL together on the same price basis.
  const lpPortfolio = d0 * p0 + d1 * p1
  const bnhPortfolio = p.bnh0 * p0 + p.bnh1 * p1
  return { ...p, lpPortfolio, bnhPortfolio, unrealizedPnL: lpPortfolio - p.basePortfolio }
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

  // First pass: merge the raw indexer rows from every (chain, version) query.
  const mergedRaw = useMemo(() => {
    const merged: PortfolioPosition[] = []
    queries.forEach((q, i) => {
      const { chainId, version } = tasks[i]
      const rows: any[] = (q.data as any)?.pairAccounts ?? []
      rows.forEach((row) => merged.push(rowToPosition(row, version, chainId)))
    })
    return merged
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries, tasks])

  // Unique Pyth feed ids across EVERY position's tokens. Feeds are chain-global, so
  // dedup collapses the same token on different chains → the whole page prices from
  // ONE batched Hermes request (on top of the existing GraphQL fan-out).
  const feedIds = useMemo(() => {
    const s = new Set<string>()
    for (const p of mergedRaw) {
      const f0 = p.pair?.token0?.priceFeedId
      const f1 = p.pair?.token1?.priceFeedId
      if (f0) s.add(f0.toLowerCase())
      if (f1) s.add(f1.toLowerCase())
    }
    return Array.from(s)
  }, [mergedRaw])

  const priceByFeed = useHermesPricesByFeed(feedIds)

  return useMemo<PortfolioResult>(() => {
    // Loading: at least one query has never returned yet AND is currently in flight.
    const isLoading = queries.some((q) => q.isLoading && q.isFetching)
    // Error: EVERY query failed. Per-chain failures shouldn't blank the
    // whole portfolio — we still surface positions from the queries that
    // did succeed.
    const isError = queries.every((q) => !!q.error)

    // Filter out indexer aggregate rows (where account === pair). These
    // show up for pool-level BGT staking aggregations and aren't the
    // user's own positions. Then re-price each surviving position from fresh
    // Hermes (per-position fallback to the indexer value when no live feed).
    const filtered = mergedRaw
      .filter((p) => {
        const [accPart, pairPart] = p.id.split('-').slice(1).join('-').split('-')
        return accPart !== pairPart
      })
      .map((p) => repricePosition(p, priceByFeed))

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
  }, [queries, mergedRaw, priceByFeed])
}
