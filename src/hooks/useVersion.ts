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
    // Pairs that have graduated out of "beta" — promoted production pools.
    // Addresses are normalized to lowercase for case-insensitive comparison;
    // pair addresses arrive in mixed casing depending on source (CREATE2,
    // checksum, indexer, URL param), and the previous `Array.includes` check
    // was silently case-sensitive — same pair was beta on the list but not on
    // the detail page (or vice-versa) depending on which path built it.
    const promoted = new Set([
      // Bera Mainnet
      '0xd932c344e21ef6c3a94971bf4d4cc71304e2a66c', // WBERA/HONEY
      '0xd57da672354905b9e42df077df77e554dc5fd1cc', // USDC.e/WBERA
      '0x8ad2af4375245a260ee13ad5ffa7a8cd14ecbb99', // WETH/HONEY
      '0x85061aa68f32b9176784dbd57a2a3d17e6f88ac9', // WETH/WBERA
      '0xdc33131c0ddfd4f551879fbf20449975f1be6f97', // WBTC/WETH
      '0xc118dfd4ceeea0a10c79aea77921baebe9b259a5', // WBTC/HONEY
      '0x1c84a73ed3918ea5ca18564a8206a28119082d9f', // WBTC/WBERA
      '0xfc5b86437a50e9b4ae0f20ef9b50f8d79b053121', // WBERA/LBGT
      // Base Mainnet
      '0xdc46421b43688fddbb6030aae761385782e84905', // WETH/USDC
      // Hyper EVM Mainnet
      '0x122524e1c403739bd33ec54d606ddc287117b0a6', // WHYPE/USDT
      '0x73f341882dba17841d268d10c968855672f99000', // WHYPE/UETH
      '0x4aec17532b4cb741b515e5bd4d031390a3d82318', // WHYPE/UBTC
      '0xcc920076d4dc3eea5ca173414ab9135963b00f67', // WHYPE/USDC
      // LINEA Mainnet
      '0xa87e2c65f2b79164bab690ec6808431d8c419598', // USDC/WETH
      '0xec029ced99314ff39d59a121b60adfd1fdde4604', // USDC/LINEA
      '0xafdbf57c83c55b1813a140b087c502d47fb469a4', // USDT/WETH
      '0xa3805eb1b8fad35c2cfc6c148073493f316e3489', // LINEA/WETH
      '0x679e84fb0b5f922aaaa9e1d06cb044110a603852', // WBTC/WETH
      '0x4ede02365c2564422ff3fc297000fab082453d7c', // USDC/USDT
      // Arbitrum Mainnet
      '0x9106eef158990574f13ff631b730d5bf16d99139', // WETH/USDC
      '0xca138f5755225d887655b30961e1e3d8c2010a0f', // WETH/USDT
    ])
    const pairAddr = pair?.liquidityToken.address?.toLowerCase()
    const isPromoted = pairAddr ? promoted.has(pairAddr) : false

    return (version === 2 || version === 3) && !isPromoted
  }, [pair?.liquidityToken.address, version])

  const enableGraphQL = useMemo(() => {
    // V2 indexer chains are listed explicitly because not every V2 deployment
    // also has an indexer. V3 follows a simpler rule: any chain with a V3
    // router has a V3 indexer (router + indexer ship together), so we derive
    // from the address map directly. Adding a chain to ROUTER_ADDRESS_V3
    // unlocks both contract calls and indexer queries.
    const v2Chains = [
      ChainId.BERA_MAINNET,
      ChainId.ARBITRUM_MAINNET,
      ChainId.BASE_MAINNET,
      ChainId.BSC_MAINNET,
      ChainId.HYPER_EVM,
      ChainId.LINEA_MAINNET,
      ChainId.SEI_MAINNET,
      ChainId.MONAD,
    ]
    if (version === 2) return v2Chains.includes(chainId as number)
    if (version === 3) return !!ROUTER_ADDRESS_V3[chainId as number]
    return false
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
