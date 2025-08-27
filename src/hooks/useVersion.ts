import { useMemo, useState } from 'react'
import { ChainId } from '@brownfi/sdk'
import { useDispatch, useSelector } from 'react-redux'
import { switchVersion, versionSelector } from 'state/versionSlice'
import { useLocation } from 'react-router-dom'
import { isMainnet } from 'connectors'

export function useVersion({ chainId }: { chainId: number | undefined | null }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const { version: appVersion } = useSelector(versionSelector)

  const [stableVersion] = useState(() => appVersion)

  const isTest = useMemo(() => {
    const data: { test?: string } = Object.fromEntries(new URLSearchParams(location.search).entries())
    return !!data.test
  }, [location.search])

  const [version, isDisabled] = useMemo(() => {
    if ([ChainId.VICTION_MAINNET, ChainId.U2U_MAINNET].includes(chainId as number)) {
      return [1, true]
    }
    if (
      [
        ChainId.ARBITRUM_MAINNET,
        ChainId.BASE_MAINNET,
        ChainId.BSC_MAINNET,
        ChainId.HYPER_EVM,
        ChainId.ARBITRUM_SEPOLIA,
        ChainId.SEPOLIA,
      ].includes(chainId as number)
    ) {
      return [2, true]
    }
    return [stableVersion, false]
  }, [chainId])

  const dispatchSwitchVersion = (version: number) => {
    dispatch(switchVersion(version))
  }

  const isBeta = useMemo(() => {
    return (
      [
        //
        ChainId.ARBITRUM_MAINNET,
        ChainId.BASE_MAINNET,
        ChainId.HYPER_EVM,
        ChainId.BSC_MAINNET,
      ].includes(chainId as number) && version === 2
    )
  }, [chainId, version])

  const enableGraphQL = useMemo(() => {
    return (
      [
        //
        ChainId.BERA_MAINNET,
        ChainId.ARBITRUM_MAINNET,
        ChainId.BASE_MAINNET,
        ChainId.BSC_MAINNET,
      ].includes(chainId as number) && version === 2
    )
  }, [chainId, version])

  return {
    isTest,
    isBeta,
    enableGraphQL,
    version: isMainnet ? 2 : version,
    appVersion: isMainnet ? 2 : version,
    isDisabled,
    switchVersion: dispatchSwitchVersion,
  }
}
