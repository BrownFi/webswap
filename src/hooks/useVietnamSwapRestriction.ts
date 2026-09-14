import { useEffect, useState } from 'react'
import { isMainnet } from 'connectors'

type GeoResponse = { country?: string | null }

// Swap restrictions are production-only. VITE_GEO_COUNTRY is a local test
// override so beta/development work remains unaffected.
export function useVietnamSwapRestriction() {
  const testCountry = import.meta.env.VITE_GEO_COUNTRY?.toUpperCase()
  const [country, setCountry] = useState<string | null | undefined>(() => {
    if (!isMainnet) return null
    return testCountry || undefined
  })

  useEffect(() => {
    if (!isMainnet || testCountry) return

    let active = true
    fetch('/geo', { headers: { accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() as Promise<GeoResponse> : null))
      .then((geo) => {
        if (active) setCountry(geo?.country?.toUpperCase() ?? null)
      })
      .catch(() => {
        // Fail open when geo detection is unavailable; only VN is restricted.
        if (active) setCountry(null)
      })

    return () => {
      active = false
    }
  }, [testCountry])

  return {
    loading: isMainnet && country === undefined,
    restricted: country === 'VN',
  }
}
