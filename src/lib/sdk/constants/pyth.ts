import { ChainId } from './chainId'

// Off-chain Pyth price source, resolved per chain. Arbitrum, Linea, HyperEVM,
// Robinhood, and Berachain use BrownFi's BE proxy, which returns the same
// response shape as Hermes and feeds the keeper-backed V3 oracle used by those routers.
const HERMES_UPDATES = 'https://hermes.pyth.network/v2/updates/price/latest'
const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.brownfi.io').replace(/\/$/, '')
const PROXY_UPDATES = `${API_BASE}/pyth/v2/updates/price/latest`

/** Base URL for the price-update blob and parsed-price fetch for a chain. */
export function pythUpdatesBase(chainId?: number): string {
  return chainId === ChainId.BERA_MAINNET ||
    chainId === ChainId.ARBITRUM_MAINNET ||
    chainId === ChainId.LINEA_MAINNET ||
    chainId === ChainId.HYPER_EVM ||
    chainId === ChainId.ROBINHOOD_MAINNET
    ? PROXY_UPDATES
    : HERMES_UPDATES
}

/** Build the updates/price/latest URL for the requested Pyth feeds. */
export function buildPythUpdatesUrl(chainId: number | undefined, feedIds: string[]): URL {
  const url = new URL(`${pythUpdatesBase(chainId)}?encoding=hex`)
  feedIds.forEach((id) => url.searchParams.append('ids[]', id))
  return url
}

/** Normalize BE/Hermes hex payloads and discard feeds with no update payload. */
export function normalizePythUpdateData(data: unknown): `0x${string}`[] {
  if (!Array.isArray(data)) return []
  return data
    .filter((value): value is string => typeof value === 'string' && value.replace(/^0x/i, '').length > 0)
    .map((value) => `0x${value.replace(/^0x/i, '')}` as `0x${string}`)
}
