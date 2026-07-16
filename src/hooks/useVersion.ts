import { useMemo } from 'react'
import { Pair } from '@brownfi/sdk'
import { useLocation } from 'react-router-dom'
import { routerV3Gen, hasV3Official, VERSION } from 'lib/sdk/constants/addresses'

// Single-version app: V3 Official (version 4) is the ONLY supported version.
// The legacy V1 / V2 / V3-Pilot selection system was removed — `version` is now
// always VERSION.V3_OFFICIAL. `switchVersion` is a no-op kept for call-site
// compatibility while the version toggle is being torn out.
export function useVersion({ chainId, pair }: { chainId: number | undefined | null; pair?: Pair | undefined | null }) {
  const location = useLocation()

  const isTest = useMemo(() => {
    const data: { test?: string } = Object.fromEntries(new URLSearchParams(location.search).entries())
    return !!data.test
  }, [location.search])

  // Always V3 Official; "disabled" now just means the chain has no V3 Official
  // deployment (nothing to show).
  const version = VERSION.V3_OFFICIAL
  const isDisabled = !hasV3Official(chainId ?? undefined)

  const isBeta = useMemo(() => {
    // Pairs that have graduated out of "beta" — promoted production pools.
    // Addresses normalized to lowercase for case-insensitive comparison.
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
    return pairAddr ? !promoted.has(pairAddr) : true
  }, [pair?.liquidityToken.address])

  const enableGraphQL = useMemo(() => !!routerV3Gen(version)[chainId as number], [chainId, version])

  return {
    isTest,
    isBeta,
    enableGraphQL,
    version,
    appVersion: version,
    isDisabled,
    switchVersion: (_v?: number) => {},
  }
}
