import { Currency, ETHER, Token } from '@brownfi/sdk'
import { useCallback, useEffect, useState } from 'react'

/**
 * Recent-token tracker for the swap currency selector. Persists the last N
 * tokens the user picked, scoped per chain, in localStorage. Returns
 * addresses (string sentinel `'NATIVE'` for ETHER) so the consumer can map
 * back to Token / Currency via the existing token list.
 *
 * Why a custom hook and not a Redux slice: this is read by exactly one
 * surface (CurrencySearch) and never needs to round-trip through other
 * pieces of app state. Keeping it in localStorage + a small hook avoids
 * burdening the store with UI-affinity state.
 */
const MAX_RECENTS = 6
const STORAGE_PREFIX = 'brownfi:recent-tokens:'
const NATIVE_SENTINEL = 'NATIVE'

function storageKey(chainId: number | undefined): string | undefined {
  if (!chainId) return undefined
  return `${STORAGE_PREFIX}${chainId}`
}

function read(chainId: number | undefined): string[] {
  const key = storageKey(chainId)
  if (!key) return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

function write(chainId: number | undefined, addrs: string[]): void {
  const key = storageKey(chainId)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(addrs.slice(0, MAX_RECENTS)))
  } catch {
    // localStorage can throw on quota / private mode — silent failure is
    // fine since recents is a nice-to-have, not load-bearing.
  }
}

function addressOf(currency: Currency): string | undefined {
  if (currency === ETHER) return NATIVE_SENTINEL
  if (currency instanceof Token) return currency.address
  return undefined
}

export function useRecentTokens(chainId: number | undefined) {
  const [recent, setRecent] = useState<string[]>(() => read(chainId))

  // Reload when chain changes — recents are per-chain.
  useEffect(() => {
    setRecent(read(chainId))
  }, [chainId])

  const trackSelection = useCallback(
    (currency: Currency) => {
      const addr = addressOf(currency)
      if (!addr) return
      setRecent((prev) => {
        const next = [addr, ...prev.filter((a) => a !== addr)].slice(0, MAX_RECENTS)
        write(chainId, next)
        return next
      })
    },
    [chainId],
  )

  return { recent, trackSelection, NATIVE_SENTINEL }
}
