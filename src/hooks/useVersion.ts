import { useMemo, useState } from 'react'
import { ChainId, Pair } from '@brownfi/sdk'
import { useDispatch, useSelector } from 'react-redux'
import { switchVersion, versionSelector } from 'state/versionSlice'
import { useLocation } from 'react-router-dom'
import { isMainnet } from 'connectors'
import { ROUTER_ADDRESS_V1, ROUTER_ADDRESS_V3 } from 'lib/sdk/constants/addresses'

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
    // Mainnet: lock specific chains to their version
    if (isMainnet) {
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
          ChainId.MONAD,
          ChainId.ARBITRUM_SEPOLIA,
          ChainId.SEPOLIA,
        ].includes(chainId as number)
      ) {
        return [2, true]
      }
      return [2, false]
    }
    // Beta/testnet: allow version switching, but validate stored version has a router
    const selectedVersion = stableVersion
    if (selectedVersion === 1 && !ROUTER_ADDRESS_V1[chainId as number]) return [2, false]
    if (selectedVersion === 3 && !ROUTER_ADDRESS_V3[chainId as number]) return [2, false]
    return [selectedVersion, false]
  }, [isMainnet, chainId, stableVersion])

  const dispatchSwitchVersion = (version: number) => {
    dispatch(switchVersion(version))
  }

  const isBeta = useMemo(() => {
    const isNotPairBeta = ([
      // Bera Mainnet
      '0xd932c344e21ef6C3a94971bf4D4cC71304E2a66C', // WBERA/HONEY
      '0xd57Da672354905B9E42Df077Df77E554dC5Fd1Cc', // USDC.e/WBERA
      '0x8AD2af4375245A260EE13aD5FfA7A8cD14ecBB99', // WETH/HONEY
      '0x85061AA68F32B9176784dbD57a2A3d17e6F88Ac9', // WETH/WBERA
      '0xdc33131c0DDfD4f551879fBF20449975f1BE6f97', // WBTC/WETH
      '0xC118dFd4ceEea0A10C79AeA77921BAebe9B259A5', // WBTC/HONEY
      '0x1C84a73ed3918EA5Ca18564A8206a28119082d9F', // WBTC/WBERA
      '0xFC5b86437A50e9B4ae0f20Ef9B50f8D79B053121', // WBERA/LBGT
      // Base Mainnet
      '0xdC46421B43688FdDBB6030aaE761385782e84905', // WETH/USDC
      // Hyper EVM Mainnet
      '0x122524E1c403739bd33Ec54d606DDc287117B0A6', // WHYPE/USDT
      '0x73F341882dba17841d268D10c968855672F99000', // WHYPE/UETH
      '0x4AEc17532B4Cb741B515E5bD4D031390A3d82318', // WHYPE/UBTC
      '0xcc920076d4DC3EEA5CA173414AB9135963b00F67', // WHYPE/USDC
      // LINEA Mainnet
      '0xA87E2c65F2b79164bab690Ec6808431D8c419598', // USDC/WETH
      '0xeC029CED99314ff39d59a121b60aDfd1FDde4604', // USDC/LINEA
      '0xaFDbF57C83c55B1813a140b087C502d47fb469A4', // USDT/WETH
      '0xA3805eb1b8FAD35c2cFc6C148073493F316e3489', // LINEA/WETH
      '0x679e84FB0b5F922AaaA9e1d06cb044110A603852', // WBTC/WETH
      '0x4EDE02365c2564422Ff3Fc297000fAb082453D7c', // USDC/USDT
      // Arbritrum Mainnet
      '0x9106eeF158990574f13fF631b730D5Bf16d99139', // WETH/USDC
      '0xcA138f5755225d887655B30961e1E3D8C2010A0f', // WETH/USDT
    ] as string[]).includes(pair?.liquidityToken.address as string)

    return (version === 2 || version === 3) && !isNotPairBeta
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
        ChainId.MONAD,
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
