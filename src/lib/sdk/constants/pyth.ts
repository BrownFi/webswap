import { ChainId } from './chainId'

// Off-chain Pyth price source, resolved PER CHAIN. Most chains fetch the public Pyth
// Hermes endpoint directly. Robinhood Chain uses BrownFi's BE proxy (Manh) which
// re-exposes the SAME `pyth/v2/updates/price/latest` response shape (binary.data hex +
// parsed[].price), so every caller parses the result identically regardless of source.
//
// The BE proxy is served on the same host as the indexer (VITE_API_URL): api.brownfi.io
// on prod, beta-api on beta, dev-api on dev — all expose /pyth/v2/updates/price/latest.
// Deriving from VITE_API_URL keeps Robinhood on the right host per environment.
const HERMES_UPDATES = 'https://hermes.pyth.network/v2/updates/price/latest'
const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.brownfi.io').replace(/\/$/, '')
const ROBINHOOD_UPDATES = `${API_BASE}/pyth/v2/updates/price/latest`

/** Base URL for the price-update-blob + parsed-price fetch, for the given chain.
 *  Robinhood + Arbitrum use BrownFi's BE proxy (same response shape as Hermes). */
export function pythUpdatesBase(chainId?: number): string {
  return chainId === ChainId.ROBINHOOD_MAINNET || chainId === ChainId.ARBITRUM_MAINNET ? ROBINHOOD_UPDATES : HERMES_UPDATES
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
