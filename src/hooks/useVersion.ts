import { useMemo } from 'react'
import { ChainId } from '@brownfi/sdk'
import { useDispatch, useSelector } from 'react-redux'
import { switchVersion, versionSelector } from 'state/versionSlice'

export function useVersion({ chainId }: { chainId: number | undefined | null }) {
  const dispatch = useDispatch()
  const { version: appVersion } = useSelector(versionSelector)

  const [version, isDisabled] = useMemo(() => {
    if ([ChainId.VICTION_MAINNET, ChainId.U2U_MAINNET].includes(chainId as number)) {
      return [1, true]
    }
    if (
      [
        ChainId.ARBITRUM_MAINNET,
        ChainId.BASE_MAINNET,
        ChainId.BSC_MAINNET,
        ChainId.ARBITRUM_SEPOLIA,
        ChainId.SEPOLIA
      ].includes(chainId as number)
    ) {
      return [2, true]
    }
    return [appVersion, false]
  }, [chainId, appVersion])

  const dispatchSwitchVersion = (version: number) => {
    dispatch(switchVersion(version))
  }

  return {
    version,
    isDisabled,
    switchVersion: dispatchSwitchVersion
  }
}
