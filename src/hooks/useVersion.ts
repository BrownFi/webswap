import { useMemo, useState } from 'react'
import { ChainId, Pair } from '@brownfi/sdk'
import { useDispatch, useSelector } from 'react-redux'
import { switchVersion, versionSelector } from 'state/versionSlice'
import { useLocation } from 'react-router-dom'
import { isMainnet } from 'connectors'

export function useVersion({ chainId, pair }: { chainId: number | undefined | null; pair?: Pair | undefined | null }) {
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
        ChainId.LINEA_MAINNET,
        ChainId.SEI_MAINNET,
        ChainId.ARBITRUM_SEPOLIA,
        ChainId.SEPOLIA,
      ].includes(chainId as number)
    ) {
      return [2, true]
    }
    if (isMainnet) {
      return [2, false]
    }
    return [stableVersion, false]
  }, [isMainnet, chainId, stableVersion])

  const dispatchSwitchVersion = (version: number) => {
    dispatch(switchVersion(version))
  }

  const isBeta = useMemo(() => {
    const isChainBeta = [
      //
      ChainId.ARBITRUM_MAINNET,
      ChainId.BASE_MAINNET,
      ChainId.BSC_MAINNET,
      ChainId.SEI_MAINNET,
    ].includes(chainId as number)

    const isPairBeta = [
      //
      '0x46Ebd96e4a09b97AeFf54c123b9C34433682a238', // WBERA/iBGT
      '0xF943aF974Cb195107C915A0594dC69BfDdD5c712', // iBGT/HONEY
      '0x116e5e74eC5F7332075e96978CF44413f445540C', // WBERA/USDe
      '0x9aBE906bC272CBb317588D9D495bCc12FAf3ff92', // DOLO/BERA
      '0x67FBB8A61D6D6433f3428d1f10cfb09bABC1A4D5', // DOLO/HONEY
      '0x5E9B2Cd773d8283B578Df77754DFcC2894e36b4D', // LBGT/HONEY
    ].includes(pair?.liquidityToken.address as string)

    const isNotPairBeta = ([
      //
      '0xdC46421B43688FdDBB6030aaE761385782e84905', // ETH/USDC
    ] as string[]).includes(pair?.liquidityToken.address as string)

    return (isChainBeta || isPairBeta) && !isNotPairBeta && version === 2
  }, [chainId, pair?.liquidityToken.address, version])

  const enableGraphQL = useMemo(() => {
    return (
      [
        //
        ChainId.BERA_MAINNET,
        ChainId.ARBITRUM_MAINNET,
        ChainId.BASE_MAINNET,
        ChainId.BSC_MAINNET,
        ChainId.HYPER_EVM,
        ChainId.LINEA_MAINNET,
        ChainId.SEI_MAINNET,
      ].includes(chainId as number) && version === 2
    )
  }, [chainId, version])

  return {
    isTest,
    isBeta,
    enableGraphQL,
    version,
    appVersion,
    isDisabled,
    switchVersion: dispatchSwitchVersion,
  }
}
