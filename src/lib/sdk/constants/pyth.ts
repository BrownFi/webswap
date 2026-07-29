import { ChainId } from './chainId'

// Off-chain Pyth price source, resolved PER CHAIN. Most chains fetch the public Pyth
// Hermes endpoint directly. Robinhood Chain uses BrownFi's BE proxy (Manh) which
// re-exposes the SAME `v2/updates/price/latest` response shape (binary.data hex +
// parsed[].price), so every caller parses the result identically regardless of source.
//
// NOTE the Robinhood path has `/v2/` in it (dev-api.brownfi.io/pyth/**v2**/updates/…) —
// the BE moved it under v2 (the old /pyth/updates/… path now 404s).
const HERMES_UPDATES = 'https://hermes.pyth.network/v2/updates/price/latest'
const ROBINHOOD_UPDATES = 'https://dev-api.brownfi.io/pyth/v2/updates/price/latest'

/** Base URL for the price-update-blob + parsed-price fetch, for the given chain. */
export function pythUpdatesBase(chainId?: number): string {
  return chainId === ChainId.ROBINHOOD_MAINNET ? ROBINHOOD_UPDATES : HERMES_UPDATES
}

/**
 * Build the `updates/price/latest` URL (encoding=hex + the feed ids) for a chain.
 * Returns a URL so callers can `.toString()` / fetch it. Same params + response on
 * every source, so the only per-chain difference is the host/path.
 */
export function buildPythUpdatesUrl(chainId: number | undefined, feedIds: string[]): URL {
  const url = new URL(`${pythUpdatesBase(chainId)}?encoding=hex`)
  feedIds.forEach((id) => url.searchParams.append('ids[]', id))
  return url
}
