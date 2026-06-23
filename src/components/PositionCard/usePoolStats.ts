import { isV3Like } from '@brownfi/sdk'
import { ChainId, JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useActiveWeb3React } from 'hooks'
import { useTradingFee } from 'hooks/useTradingFee'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { apiV2Service } from 'services'
import { graphqlFetcher } from 'utils/graphql'

type Token = {
  __typename?: 'token'
  id: string
  decimals: number
  name: string
  price: number
  priceFeedId?: string | null
  symbol: string
  totalSupply: number
}

export type PairStats = {
  __typename?: 'pair'
  id: string
  fee: number
  protocolFee: number
  feeDay: number
  totalSupply: number
  reserve0: number
  reserve1: number
  tvl: number
  apr: number
  volumeDay: number
  volume7Day: number
  updatedAt: number
  // V2 indexer ships `k` (single kappa). V3 indexer ships kB+kQ; we alias
  // kB → k below for backward compat with consumers that read `pairStats.k`.
  lambda?: number
  k?: number
  // V3-only extras (undefined on V2). Indexer queries select these for V3
  // pools so the FE can show all 13 config params + uni reference price
  // without an extra on-chain call.
  kB?: number
  kQ?: number
  feeSplit?: number
  compress?: number
  sSell?: number
  sBuy?: number
  fixS?: number
  disThreshold?: number
  sBound?: number
  pythWeight?: number
  gamma?: number
  uniV2Price?: number
  // V3-only: current LP-token price + pool creation unix-seconds. Used to
  // compute Fee APR as the annualized LP-vs-UniV2 outperformance since
  // inception. Indexer returns them as numeric strings.
  lpPrice?: number
  createdAt?: number
  // V3-only: which token is the quote (0 = token0, 1 = token1). The
  // authoritative base/quote designation — drives display order via
  // shouldReverseDisplay. Undefined on V2.
  quoteTokenIndex?: number
  token0?: Token | null
  token1?: Token | null
}

// Feature flag (Paven, 2026-06-18): toggles ALL the V3 LP-vs-UniV2 comparison
// UI together — the "Annualized Return" metric (V3 LP-vs-UniV2 math vs. the V2
// indexer apr fallback) and its (?) tooltip, plus the chart's "LP vs. UniV2"
// line + tooltip.
//
// Re-enabled on prod 2026-06-18 (Paven "enable it"): the V3 math can go briefly
// negative on thin/imbalanced pools (short-term noise that doesn't represent
// the pool's real performance — see Jason's HYPE/USDT 70/30 example). Rather
// than show a scary negative %, the render sites now display "--" for any
// non-positive Annualized Return (treated as "not yet reliable"), which makes
// it safe to surface on prod.
export const USE_V3_UNIV2_COMPARISON: boolean = true

/**
 * V3 Fee APR = annualized LP-vs-UniV2 outperformance since the pool was created:
 *   (lpPrice − uniV2Price) / uniV2Price / daysAlive × 360 × 100
 *   daysAlive = (now − createdAt) / 86400
 * lpPrice/uniV2Price are the indexer's ~1.0 performance indices (same units),
 * createdAt is unix-seconds. Returns 0 when inputs are missing/degenerate.
 * Single source of truth shared by the pool detail page, pool list rows, and
 * the list's APR sort.
 */
export function computeV3FeeApr(p?: {
  lpPrice?: number | string | null
  uniV2Price?: number | string | null
  createdAt?: number | string | null
} | null): number {
  if (!p) return 0
  const lp = Number(p.lpPrice)
  const uni = Number(p.uniV2Price)
  const createdAt = Number(p.createdAt)
  if (!lp || !uni || !createdAt) return 0
  const daysAlive = (Date.now() / 1000 - createdAt) / 86400
  if (daysAlive <= 0) return 0
  return ((lp - uni) / uni / daysAlive) * 360 * 100
}

const GET_PAIR_ACCOUNT = `
  query PairAccount($id: String!) {
    pairAccount(
      id: $id
    ) {
      lpPortfolio
      basePortfolio
      bnhPortfolio
      stakeLP
      netPnL
      netBnHPnL
      unrealizedPnL
      unrealizedBnHPnL
    }
  }
`

// Whitelist of Bera pools that have a BGT vault — i.e. pools the
// /igbt-vault-apr endpoint actually has data for. Exported so the pool list
// can gate its fan-out useQueries on the same set instead of firing one
// REST call per Bera pool (most of which return apr=0 today). Add a new
// pair address here whenever a fresh BGT vault is deployed.
//
// Keys are LOWERCASE — callers pass either a checksummed SDK address (detail
// page / position card) or a lowercase indexer id (pool list), so always look
// up via `getPairBgt()` which normalizes. (Checksummed keys here silently
// missed the lowercase indexer ids on the pool list → BGT column stayed blank.)
export const pairBGT: Record<string, string[]> = {
  // V2 pools — cutting board disposed 2026-06-23, but their reward vaults keep
  // emitting until the current period ends, so the API APR fades to 0 on its
  // own. Left untouched (kept showing per product call). Value = stake links.
  '0xd932c344e21ef6c3a94971bf4d4cc71304e2a66c': ['0x7488174f1f518caf2faae4f30cbba65ea57cf4f9'], // BERA/HONEY V2
  '0xd57da672354905b9e42df077df77e554dc5fd1cc': ['0xd57Da672354905B9E42Df077Df77E554dC5Fd1Cc'], // BERA/USDC.e V2
  // V3 pools — new cutting board allocation 2026-06-23. Whitelisting them makes
  // the UI call /igbt-vault-apr (getPoolBgt) so the BGT APR shows once Manh's BE
  // serves these vaults. Value[0] = the BeraHub stake link for the new vault.
  '0xc123bc9259d1a99add5a2c512498ac146dd2bade': ['https://hub.berachain.com/earn/0xa57d4c595a000e20f8ea8f82663a9c7b15d60168'], // WETH/USDC.e V3 (1.45%)
  '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26': ['https://hub.berachain.com/earn/0xd54ec45cca5d428c3aef05993195c389c0b82b4e'], // BERA/USDC.e V3 (1.94%)
  '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c': ['https://hub.berachain.com/earn/0x3f0cf0c62e5d7617c3f965bfefc656af650e459e'], // WBERA/HONEY V3 (3.00%)
}

/** Case-insensitive lookup into `pairBGT`. Use this instead of `pairBGT[addr]`
 *  — addresses reach us both checksummed (SDK) and lowercase (indexer ids). */
export const getPairBgt = (address?: string | null): string[] | undefined =>
  address ? pairBGT[address.toLowerCase()] : undefined

export const merklCampaignPool: string[] = [
  '0xA87E2c65F2b79164bab690Ec6808431D8c419598'.toLowerCase(), // WETH/USDC.e on LINEA
]

type Props = {
  pair: Pair
  pairStats?: PairStats
  enableFetchDetail?: boolean
}

export const usePoolStats = ({ pair, pairStats, enableFetchDetail }: Props) => {
  const { account } = useActiveWeb3React()

  const { data } = useQuery<{
    pairAccount: {
      lpPortfolio: number
      basePortfolio: number
      bnhPortfolio: number
      stakeLP: number
      netPnL: number
      netBnHPnL: number
      unrealizedPnL: number
      unrealizedBnHPnL: number
    }
  }>({
    queryKey: ['PairAccount', pair?.chainId, pair?.liquidityToken.address, account, pair?.version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairAccount',
        query: GET_PAIR_ACCOUNT,
        variables: {
          chainId: pair.chainId,
          version: pair.version,
          id: `${account!.toLowerCase()}-${pair.liquidityToken.address.toLowerCase()}`,
        },
      }),
    enabled: !!enableFetchDetail && !!account && !!pair?.chainId && !!pairStats,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const shouldUseIndexer =
    useMemo(() => {
      if (pairStats?.updatedAt) {
        const diffMinutes = dayjs().diff(dayjs.unix(pairStats.updatedAt), 'minute')
        return diffMinutes < 120 // 2 hours — fall back to RPC if indexer is stale
      }
      return !!pairStats
    }, [pairStats]) && !!pairStats

  // BGT APR
  const { data: poolApr } = useQuery({
    queryKey: ['getBgtApr', pair.liquidityToken.address],
    queryFn: () => {
      return apiV2Service.getPoolBgt({ address: pair.liquidityToken.address })
    },
    enabled: pair.chainId === ChainId.BERA_MAINNET && !!getPairBgt(pair.liquidityToken.address),
  })

  // Merkl Campaign APR
  const { data: merklCampaignApr } = useQuery({
    queryKey: ['getMerklCampaignApr', pair.liquidityToken.address],
    queryFn: () => {
      return apiV2Service.getMerklCampaignApr({ address: pair.liquidityToken.address })
    },
    enabled:
      pair.chainId === ChainId.LINEA_MAINNET && merklCampaignPool.includes(pair.liquidityToken.address.toLowerCase()),
  })

  const rpcTradingFee = useTradingFee({ pair })
  const rpcTotalSupply = useTotalSupply(shouldUseIndexer ? undefined : pair.liquidityToken)

  const tradingFee = shouldUseIndexer ? pairStats.fee * 100 : rpcTradingFee
  const totalSupply = shouldUseIndexer
    ? new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(Math.round(pairStats.totalSupply * 10 ** pair.liquidityToken.decimals)),
      )
    : rpcTotalSupply

  // V2: indexer's `apr` is the gross fee APR (volume × fee / tvl × 365). Apply
  // `1 − protocolFee` to surface the LP-side share.
  //
  // V3: every deployed pool today has feeSplit ≈ 1.0 (100% of trading fees
  // routed to factory.feeTo), which would zero the LP-share computation out
  // and the column would just show "--". Per product call, display the gross
  // pool APR for V3 instead — it represents the pool's earning activity even
  // though LPs aren't currently receiving a share. Revisit if/when feeSplit
  // is lowered and LPs start earning fees directly.
  const isV3 = isV3Like(pair.version)
  const feeAPR =
    shouldUseIndexer && pairStats
      ? pairStats.apr * (isV3 ? 1 : 1 - pairStats.protocolFee)
      : 0
  return {
    tradingFee,
    totalSupply,
    feeAPR: feeAPR || 0,
    bgtAPR: (poolApr?.apr || 0) * 100,
    volume24h: (shouldUseIndexer ? pairStats.volumeDay : 0) || 0,
    volume7d: (shouldUseIndexer ? pairStats.volume7Day : 0) || 0,
    shouldUseIndexer,
    pairAccount: data?.pairAccount,
    merklCampaignApr: merklCampaignApr?.apr || 0,
  }
}
