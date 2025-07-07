import { useLocation, useHistory } from 'react-router-dom'
import { useMemo } from 'react'
import queryString from 'query-string'
import { ChainId } from '@brownfi/sdk'

export function useVersion({ chainId }: { chainId: number | undefined | null }) {
  const location = useLocation()
  const history = useHistory()

  // Parse version from URL query string
  const version = useMemo(() => {
    if ([ChainId.VICTION_MAINNET, ChainId.U2U_MAINNET].includes(chainId as number)) {
      return 1
    }
    if ([ChainId.ARBITRUM_MAINNET, ChainId.BASE_MAINNET, ChainId.BSC_MAINNET].includes(chainId as number)) {
      return 2
    }
    const params = queryString.parse(location.search)
    const versionParam = params.version || params.v
    return versionParam ? Number(versionParam) : Number(process.env.REACT_APP_DEFAULT_VERSION || '2')
  }, [chainId, location.search])

  // Update version in URL
  const switchVersion = (newVersion: number) => {
    const params = queryString.parse(location.search)
    params.version = String(newVersion)
    const newSearch = queryString.stringify(params)
    history.push({
      pathname: location.pathname,
      search: newSearch
    })
  }

  return { version, switchVersion }
}
