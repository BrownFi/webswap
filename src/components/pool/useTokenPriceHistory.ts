import { ChainId } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PriceSample, buildPriceLookup } from './chartRepricing'

// Hourly off-chain price history, used to re-price a quiet pool's chart rows.
//
// Source: CoinGecko's public market_chart endpoint. It is picked over Pyth because
// Pyth's historical API needs an entitlement our key does not carry (benchmarks and
// hermes both answer 401, and app.pyth.com's chart route is token-gated), while this
// one answers 200 with `access-control-allow-origin: *` and no key at all.
//
// Called straight from the browser rather than through our own proxy, deliberately:
// CoinGecko rate-limits per IP, so direct calls spend each visitor's own budget,
// whereas proxying would funnel every visitor through one server IP and throttle.
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

/**
 * Token address (lowercase) -> CoinGecko coin id, per chain. Only the chains that
 * re-price need entries (see hasChartRepricing). A token that is missing here simply
 * doesn't get re-priced — its rows are read as-is — so an incomplete map degrades
 * to today's behaviour instead of showing a wrong price.
 */
// Every id below was matched to the token's OWN Pyth feed (factory.priceFeedIds →
// benchmarks.pyth.network), not guessed from the ticker: these are Backed xStocks,
// so the chain's "NVDA" tracks Crypto.NVDAX/USD, not the NVDA equity. All of them are
// 24/7 crypto feeds, so the re-priced lines keep moving at night and over weekends —
// which the underlying equity feeds would not.
const COIN_IDS: Record<number, Record<string, string>> = {
  [ChainId.ROBINHOOD_MAINNET]: {
    '0x5fc5360d0400a0fd4f2af552add042d716f1d168': 'global-dollar', // USDG     ← Crypto.USDG/USD
    '0x0bd7d308f8e1639fab988df18a8011f41eacad73': 'ethereum', // WETH          ← Crypto.ETH/USD
    '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec': 'nvidia-xstock', // NVDA     ← Crypto.NVDAX/USD
    '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea': 'spacex-xstocks', // SPCX    ← Crypto.SPCXX/USD
    '0xec262a75e413fafd0df80480274532c79d42da09': 'microstrategy-xstock', // MSTR ← Crypto.MSTRX/USD
    '0x117cc2133c37b721f49de2a7a74833232b3b4c0c': 'sp500-xstock', // SPY       ← Crypto.SPYX/USD
    '0xff080c8ce2e5feadaca0da81314ae59d232d4afd': 'micron-technology-xstock', // MU ← Crypto.MUX/USD
    '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3': 'alphabet-xstock', // GOOGL  ← Crypto.GOOGLX/USD
    '0x322f0929c4625ed5bad873c95208d54e1c003b2d': 'tesla-xstock', // TSLA      ← Crypto.TSLAX/USD
    '0xe93237c50d904957cf27e7b1133b510c669c2e74': 'microsoft-xstock', // MSFT   ← Crypto.MSFTX/USD
    // The two non-xStock tokens. CoinGecko lists each one's contract as
    // robinhood/<the address below>, so these are confirmed by address, not by feed.
    '0x020bfc650a365f8bb26819deaabf3e21291018b4': 'cash-cat', // CASHCAT       ← Crypto.CASHCAT/USD
    '0x39dbed3a2bd333467115de45665cc57f813c4571': 'pons', // PONS              ← Crypto.PONS/USD
  },
}

export const getCoinId = (chainId: number, address?: string | null): string | undefined =>
  address ? COIN_IDS[chainId]?.[address.toLowerCase()] : undefined

/**
 * CoinGecko serves hourly candles for a 2–90 day window (1 day switches to 5-minute,
 * past 90 days to daily). Clamp into that band so the series granularity always
 * matches the chart's one-hour floor.
 */
export function daysForWindow(spanSeconds: number): number {
  const days = Math.ceil(spanSeconds / 86_400) + 1
  return Math.min(90, Math.max(2, days))
}

async function fetchSeries(coinId: string, days: number): Promise<PriceSample[]> {
  const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`CoinGecko HTTP ${resp.status}`)
  const body = (await resp.json()) as { prices?: [number, number][] }
  return (body.prices ?? []).map(([ms, price]) => [Math.floor(ms / 1000), price] as PriceSample)
}

type Props = {
  chainId: number
  token0Address?: string
  token1Address?: string
  /** Seconds of history needed — normally now minus the last traded bucket. */
  spanSeconds: number
  enabled: boolean
}

/**
 * Step lookups for both of a pair's tokens, or null when either side has no usable
 * series. Both are required: a relative price needs both legs valued at the same
 * instant, and re-pricing one side only would skew every line.
 */
export function useTokenPriceHistory({ chainId, token0Address, token1Address, spanSeconds, enabled }: Props) {
  const coin0 = getCoinId(chainId, token0Address)
  const coin1 = getCoinId(chainId, token1Address)
  const days = daysForWindow(spanSeconds)
  const ready = enabled && !!coin0 && !!coin1

  const { data } = useQuery({
    // `days` is in the key: a longer quiet stretch needs a longer window, and the
    // response for a shorter one can't answer it.
    queryKey: ['coingeckoPriceHistory', coin0, coin1, days],
    queryFn: async () => {
      const [s0, s1] = await Promise.all([fetchSeries(coin0!, days), fetchSeries(coin1!, days)])
      return { s0, s1 }
    },
    enabled: ready,
    // Hourly data; refetching faster than that only burns the visitor's rate limit.
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  return useMemo(() => {
    if (!data?.s0.length || !data?.s1.length) return null
    return { at0: buildPriceLookup(data.s0), at1: buildPriceLookup(data.s1) }
  }, [data])
}
