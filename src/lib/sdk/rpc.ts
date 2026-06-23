import { createPublicClient, fallback, http } from 'viem'
import { RPC_FALLBACKS, RPC_URLS } from './constants/addresses'

// Centralized RPC layer for all on-chain reads.
//
// Public RPCs are unreliable — they rate-limit (429), 500, or go down, and a
// single flaky endpoint used to break a whole page of reads (pool list, swap
// quotes, reserves). Every read client is built from a viem `fallback()`
// transport that rotates to the next endpoint on failure, so one bad RPC no
// longer takes a chain down. Endpoints come from RPC_FALLBACKS (multi-RPC list)
// when defined, else the single RPC_URLS entry.

/** Ordered RPC endpoints to try for a chain. */
export function rpcUrlsFor(chainId: number): string[] {
  const fb = RPC_FALLBACKS[chainId]
  if (fb && fb.length) return fb
  const single = RPC_URLS[chainId]
  return single ? [single] : []
}

/** viem fallback transport across all known RPCs for the chain (rotates on failure). */
export function rpcTransport(chainId: number) {
  return fallback(rpcUrlsFor(chainId).map((u) => http(u)))
}

/**
 * Standard read-only viem client for on-chain reads. Use this everywhere
 * instead of `createPublicClient({ transport: http(RPC_URLS[chainId]) })` so all
 * reads get the multi-RPC fallback. No `chain` field, matching existing call
 * sites (callers pass explicit addresses/ABIs).
 */
export function createReadClient(chainId: number) {
  return createPublicClient({ transport: rpcTransport(chainId) })
}
