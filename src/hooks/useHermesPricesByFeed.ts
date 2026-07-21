import { keepPreviousData, useQuery } from '@tanstack/react-query'

// Batched Hermes prices keyed by Pyth FEED ID (not token address). The Portfolio
// page holds many positions across many chains; Pyth feed ids are chain-global (a
// token's feed is the same on every chain), so we collect the unique feed-id set
// once and price them ALL in a single Hermes request — no per-pair calls and no
// on-chain feed-id resolution (the indexer already hands us token.priceFeedId).
//
// Contrast with useHermesPrices (per-pair): that resolves feed ids via an on-chain
// factory read and is scoped to one chain. This one takes feed ids directly.

const HERMES_URL = 'https://hermes.pyth.network/v2/updates/price/latest'
// Stable empty reference so `data ?? EMPTY` never hands consumers a fresh object
// each render (which would spin dependent effects/memos).
const EMPTY: Record<string, number> = {}
// Each id is a 66-char hex string; keep the URL well under practical limits by
// chunking. Typical users hold far fewer than one chunk's worth of unique feeds.
const CHUNK = 40

async function fetchByFeed(feedIds: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  if (!feedIds.length) return out
  for (let i = 0; i < feedIds.length; i += CHUNK) {
    const chunk = feedIds.slice(i, i + CHUNK)
    const url = new URL(`${HERMES_URL}?encoding=hex`)
    chunk.forEach((f) => url.searchParams.append('ids[]', f))
    const resp = await fetch(url.toString())
    if (!resp.ok) throw new Error(`Hermes HTTP ${resp.status}`)
    const data = await resp.json()
    for (const p of (data.parsed ?? []) as Array<{ id: string; price: { price: string; expo: number } }>) {
      const id = (p.id.startsWith('0x') ? p.id : `0x${p.id}`).toLowerCase()
      out[id] = Number(p.price.price) * Math.pow(10, Number(p.price.expo))
    }
  }
  return out
}

/**
 * Live Hermes prices for a set of Pyth feed ids, returned as `{ [feedId]: price }`.
 * Feed ids are normalized (lowercased, deduped, zero/invalid dropped) and sorted so
 * the react-query key is stable for the same set — one shared 15s-poll request.
 */
export function useHermesPricesByFeed(feedIds: string[]): Record<string, number> {
  const ids = Array.from(
    new Set(feedIds.map((f) => f?.toLowerCase()).filter((f) => /^0x[0-9a-f]+$/.test(f) && !/^0x0+$/.test(f))),
  ).sort()

  const { data } = useQuery({
    queryKey: ['hermesPricesByFeed', ids],
    queryFn: () => fetchByFeed(ids),
    enabled: ids.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  })

  return data ?? EMPTY
}
