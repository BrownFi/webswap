import { ChainId } from './chainId'

export const ROUTER_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.SEPOLIA]: '0x341b485D40c072B63eE2175f84f4514CF08447B9',
  [ChainId.SN_MAIN]: '',
  [ChainId.SN_SEPOLIA]: '0x07365f5f8f2f7748d31653133ba5a8be7501d5d90e9893e91372e44b4fe9c967',
  [ChainId.BSC_TESTNET]: '0xdbbF4542574a8c6e54e3F0e5f8F9Eea3e463F9B8',
  [ChainId.BSC_MAINNET]: '0xbCE4436BB4F0AdAcdAb3c9d3aEE44059cb9c371B',
  [ChainId.MINATO_SONEIUM]: '0x6D1f381cF674CeE888E61b088b78202559eCEEAB',
  [ChainId.VICTION_TESTNET]: '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8',
  [ChainId.VICTION_MAINNET]: '0x7932606E387479C9cc97efde08BDcaFC5A50ac5A',
  [ChainId.SONIC_TESTNET]: '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8',
  [ChainId.BASE_SEPOLIA]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.BASE_MAINNET]: '0x454d337F8afb2dF8168547ab85d937D2445Df47a',
  [ChainId.UNICHAIN_SEPOLIA]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.AURORA_TESTNET]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.METIS_MAINNET]: '0xcfdcAC1f0bb8a212990Ec408f0d27A7EC5384ac6',
  [ChainId.TAIKO_TESTNET]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.BOBA_TESTNET]: '0x782783378a9D3BCCC8d9A03F5ED452263758a571',
  [ChainId.NEOX_MAINNET]: '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4',
  [ChainId.U2U_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
  [ChainId.SCROLL_TESTNET]: '0x782783378a9D3BCCC8d9A03F5ED452263758a571',
  [ChainId.ARBITRUM_SEPOLIA]: '0xbfe20401749C65a6245A8f62b682626399e115E2',
  [ChainId.ARBITRUM_MAINNET]: '0x68F963E0CEC0360a003AB8c6D61FA3f39497c463',
  [ChainId.BERA_MAINNET]: '0xb91458408dc7bb0561da70ffd89903794eAcDDA7',
  [ChainId.HYPER_EVM]: '0x7D06f0ad977B3276da37f2Da4b3a7b2c639244aA',
  [ChainId.LINEA_MAINNET]: '0xf435c8a8b8FFB5236eFF9a955dee41564C84Aa62',
  [ChainId.SEI_MAINNET]: '0x0Ee7e388564f3efEe06eF9A6f43C6E854AeC027e',
  [ChainId.MONAD]: '0xFaed28e0ffb1C07A2Aa7A41Ae03536dfC12B0db7',
  [ChainId.OP_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
  [ChainId.BOBA_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
}

export const ROUTER_ADDRESS_V1: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
  [ChainId.VICTION_MAINNET]: '0x7932606E387479C9cc97efde08BDcaFC5A50ac5A',
  [ChainId.U2U_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
}

export const ROUTER_ADDRESS_WITH_PRICE: Record<number, string> = {
  [ChainId.VICTION_MAINNET]: '0x0194CcfC49C3ebc7457E0b41B9c6b840C22f5985',
  [ChainId.SONIC_TESTNET]: '0x0f97Ca4E6B118502f83DD3Ce836A14Cb4937ed2a',
  [ChainId.AURORA_TESTNET]: '0x83A8D57634239a9e52197d34cbc74CD9455383d1',
  [ChainId.TAIKO_TESTNET]: '0x68Ce9bf4De2E0f44f39d80611d21556665120b91',
  [ChainId.BOBA_TESTNET]: '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8',
  [ChainId.BOBA_MAINNET]: '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4',
  [ChainId.BERA_MAINNET]: '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4',
}

// ⚠️ Rollout contract: adding a chain here also enables V3 GraphQL queries
// (useVersion's enableGraphQL derives V3 support from this map). Do NOT add a
// chain until the V3 indexer is live at bf-v2-api-beta.brownfi.io/indexer/v3
// for it — otherwise the FE will throw HTTP 500 on every V3 pool query.
//
// 2026-06-04 (beta branch): swapped to the v3-final deployment. Architectural
// change vs the prior V3 deployment — zap entrypoints have been split out of
// the router into a separate BrownFiV3Zap contract (see ZAP_ADDRESS_V3_PILOT below).
// The router now only handles swap + add/remove liquidity. Library quotes are
// inventory-safe; the INVALID_INVENTORY reverts we saw on lopsided pools
// should be much rarer. develop/bera intentionally remain on the previous
// V3 deployment until contract team promotes v3-final to prod.
// ─── Two BrownFi "V3-generation" deployments, modeled as distinct versions ──
// There are two live V3-style deployments the user can swap between, treated
// as separate protocol versions so the swap router can quote BOTH and compare:
//   - version 3 = "V3 Pilot"   (pre-v3-final): Bera 0x83A329E9 only. Zap lives
//     on the router (no separate zap). Indexed by beta-api/indexer/v3.
//   - version 4 = "V3 Official" (v3-final): Bera 0x6Ccf36d3 + HyperEVM
//     0x6A4Bd897. Separate BrownFiV3Zap contract. Indexed by Goldsky (Bera) /
//     beta-api (HL).
// Both share the SAME FE call shape (quoteAmountsOutWithUpdate, factory.getPair
// registry, getV3ZapAddress router-fallback) — so behavior checks use
// `isV3Like(version)` while address/indexer resolution keys on the exact
// version. Pilot = 3 (unchanged) so existing beta users' persisted selection
// stays on pilot; Official is the new opt-in version 4.

/** Named protocol versions. V3_OFFICIAL (4) is the v3-final deployment shown
 *  to users as "V3 Official"; V3_PILOT (3) is the original pre-v3-final V3.
 *  Use these instead of bare magic numbers when resolving addresses/labels. */
export const VERSION = { V2: 2, V3_PILOT: 3, V3_OFFICIAL: 4 } as const

/** True for any V3-generation version (pilot=3 or official=4). Use this in
 *  place of `version === 3` for BEHAVIOR checks (both behave identically). */
export const isV3Like = (version: number | undefined | null): boolean =>
  version === VERSION.V3_PILOT || version === VERSION.V3_OFFICIAL

/** User-facing label for a protocol version. Internal version 4 (the OFFICIAL
 *  V3 deployment) shows as just "V3" — never "V4", and the "Official" suffix is
 *  dropped per design. The URL slug stays `v3-official` (see versionToSlug). */
export const versionLabel = (version: number | undefined | null): string =>
  version === VERSION.V3_OFFICIAL ? 'V3' : version === VERSION.V3_PILOT ? 'V3 Pilot' : `V${version ?? 2}`

/** URL slug for a version — keeps the raw internal number out of the address
 *  bar (users see `v3-official`, never `v=4`). */
export const versionToSlug = (version: number | undefined | null): string =>
  version === VERSION.V3_OFFICIAL ? 'v3-official' : version === VERSION.V3_PILOT ? 'v3-pilot' : 'v2'

/** Parse the `?v=` param back to a numeric version. Accepts the slug form;
 *  also tolerates a raw number (e.g. an already-open `v=4` tab) so nothing
 *  breaks mid-session. Returns undefined for anything else → caller falls
 *  back to the toggle. */
export const slugToVersion = (slug: string | null | undefined): number | undefined => {
  if (slug === 'v3-official') return VERSION.V3_OFFICIAL
  if (slug === 'v3-pilot') return VERSION.V3_PILOT
  if (slug === 'v2') return VERSION.V2
  const n = Number(slug)
  return n === VERSION.V2 || n === VERSION.V3_PILOT || n === VERSION.V3_OFFICIAL ? n : undefined
}

// version 3 — PILOT (pre-v3-final, Bera only; zap on router)
export const ROUTER_ADDRESS_V3_PILOT: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0xFB473aEAe9b0d03c6974BCf5f2B67dA4AF7F6043',
}
export const FACTORY_ADDRESS_V3_PILOT: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x83A329E93f7A36b9baAb5bF1EAFF319947387552',
}
export const ZAP_ADDRESS_V3_PILOT: Record<number, string> = {} // pilot: zap on router
export const V3_PILOT_USE_INDEXER: Record<number, boolean> = {
  [ChainId.BERA_MAINNET]: true,
}

// version 4 — OFFICIAL (v3-final; Bera + HyperEVM + Base; separate zap)
export const ROUTER_ADDRESS_V3_OFFICIAL: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x63D8C045ebEc54c4C4bb3e24cA3bf7FD4fFd209a',
  [ChainId.HYPER_EVM]: '0xc0E55d0085266E9A33456610E08172f9c173F908',
  [ChainId.BASE_MAINNET]: '0x38c91c64169c7B5eBe02DcE39060B6180065C38d',
  [ChainId.LINEA_MAINNET]: '0xB3c31fDc0a22D5725C47B1fC430F5B87353D8C3e',
  [ChainId.ARBITRUM_MAINNET]: '0x96cE2973581C5bF362e0fc9f40e6B5f12AA59b61',
  [ChainId.ROBINHOOD_MAINNET]: '0x2A08Da7B6590ce5D217161F234069CfC54DBe554',
}
export const FACTORY_ADDRESS_V3_OFFICIAL: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x6Ccf36d3EaE84b2eB608704070B90f4419BBcD28',
  [ChainId.HYPER_EVM]: '0x6A4Bd89709b67eC846F02cF9E95A0dd2Fb515720',
  [ChainId.BASE_MAINNET]: '0x5c4B5b07AE5EaeC428C23DbC96564Bb5A3BE7aaa',
  [ChainId.LINEA_MAINNET]: '0xD9a702839510ee2859bCE697F51Aae49bF8949d7',
  [ChainId.ARBITRUM_MAINNET]: '0xe49805412EDFDF4C458B297e7C1534588Fa3F1F0',
  [ChainId.ROBINHOOD_MAINNET]: '0x831880Bd3b331249DF63bacC6e21495e5e8f1eAA',
}
export const ZAP_ADDRESS_V3_OFFICIAL: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x7a0f51fa7DDB5cF3ECE029004A2dA44CBCfc4438',
  [ChainId.HYPER_EVM]: '0xE5dEbF39457fa6e7FFcdDb5af40435AD2D52438b',
  [ChainId.BASE_MAINNET]: '0xb77197484d77340040cC9969bd475E4a082D3f4C',
  [ChainId.LINEA_MAINNET]: '0x92b2639F1BDd8eD5c359200Fb6CAe045CC71ca3b',
  [ChainId.ARBITRUM_MAINNET]: '0x0df2D3B2219aacfD87Dd7051ea9CB6382CA38B30',
  [ChainId.ROBINHOOD_MAINNET]: '0x92927Ff9420aF3347Ae25ad618Eb844E78EFe8E1',
}
export const V3_OFFICIAL_USE_INDEXER: Record<number, boolean> = {
  [ChainId.BERA_MAINNET]: true,
  [ChainId.HYPER_EVM]: true,
  // Base V3 deployed 2026-06-22 — on-chain reads (useV3PoolsOnChain) until the
  // BE /indexer/v3 indexes chainId 8453; flip to true once it's live.
  [ChainId.BASE_MAINNET]: false,
  // Linea V3 deployed 2026-06-22 — BE /indexer/v3 indexes chainId 59144 as of
  // 2026-07-01 (live + synced on both prod + beta APIs, head current, 1:1 vs
  // on-chain), so use the indexer (volume/TVL/fee-APR the on-chain path can't).
  [ChainId.LINEA_MAINNET]: true,
  // Arbitrum V3 deployed 2026-06-22 — BE /indexer/v3 indexes chainId 42161 as of
  // 2026-06-24 (live on both prod + beta APIs, validated 1:1 vs on-chain), so use
  // the indexer (gives volume/TVL/fee-APR/annualized-return the on-chain path can't).
  [ChainId.ARBITRUM_MAINNET]: true,
  // Robinhood Chain V3 deployed 2026-07-29 — BE /indexer/v3 indexes chainId 4663 as
  // of 2026-07-29 (live on api + beta-api, returns the WETH/USDG pool), so use the
  // indexer (pool list/detail + charts the on-chain path can't give).
  [ChainId.ROBINHOOD_MAINNET]: true,
}

/** Per-version address-map resolvers (used by the SDK getters + readers). */
export const routerV3Gen = (version: number): Record<number, string> =>
  version === VERSION.V3_OFFICIAL ? ROUTER_ADDRESS_V3_OFFICIAL : ROUTER_ADDRESS_V3_PILOT
export const factoryV3Gen = (version: number): Record<number, string> =>
  version === VERSION.V3_OFFICIAL ? FACTORY_ADDRESS_V3_OFFICIAL : FACTORY_ADDRESS_V3_PILOT
export const zapV3Gen = (version: number): Record<number, string> =>
  version === VERSION.V3_OFFICIAL ? ZAP_ADDRESS_V3_OFFICIAL : ZAP_ADDRESS_V3_PILOT

/** Indexer-source reader. Defaults false. Keyed on the exact V3-gen version.
 *  Not a React hook (pure map lookup) despite historically being named use*. */
export const v3UseIndexer = (chainId: number | undefined, version?: number): boolean => {
  if (chainId == null) return false
  const map = version === VERSION.V3_OFFICIAL ? V3_OFFICIAL_USE_INDEXER : V3_PILOT_USE_INDEXER
  return map[chainId] ?? false
}

// Availability checks for the version toggle (variant-agnostic).
// V3 Pilot is the pre-v3-final testbed — shown ONLY on the dev build; beta and
// mainnet HIDE it (users see just V2 / V3). beta and the dev build share the
// same VITE_ENVIRONMENT, so VITE_ENV_LABEL='dev' (set only on develop) is the
// reliable dev discriminator. Pilot addresses stay defined so dev can test it.
const IS_DEV_BUILD = import.meta.env.VITE_ENV_LABEL === 'dev'
export const hasV3Pilot = (chainId: number | undefined): boolean =>
  chainId != null && !!ROUTER_ADDRESS_V3_PILOT[chainId] && IS_DEV_BUILD
export const hasV3Official = (chainId: number | undefined): boolean =>
  chainId != null && !!ROUTER_ADDRESS_V3_OFFICIAL[chainId]

export const FACTORY_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0xD705B4e18055D8Fa1d099d0533163a9e8fA09E4A',
  [ChainId.SEPOLIA]: '0x43aFB543FdbcD0F00CeA9119819225F5Dc1Ec55d',
  [ChainId.SN_MAIN]: '',
  [ChainId.SN_SEPOLIA]: '0x05d789e22a62125d58773cd899e1b609b476b5daa0c86dccb32c72836dcec906',
  [ChainId.BSC_TESTNET]: '0xE780EEd4C1bADbdcbc702C7e6870Cab51005444A',
  [ChainId.BSC_MAINNET]: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
  [ChainId.VICTION_TESTNET]: '0x782783378a9D3BCCC8d9A03F5ED452263758a571',
  [ChainId.VICTION_MAINNET]: '0xa80258Eea4BA0865610eb239045737D08929c40b',
  [ChainId.SONIC_TESTNET]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.MINATO_SONEIUM]: '0x0e63FffdB5d9Db4a3595Dc9F87cB6BBc4789fF9e',
  [ChainId.BASE_SEPOLIA]: '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535',
  [ChainId.BASE_MAINNET]: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
  [ChainId.UNICHAIN_SEPOLIA]: '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535',
  [ChainId.AURORA_TESTNET]: '0x86d86dd68a2d7fd82de9760d447f1ef11644b535',
  [ChainId.METIS_MAINNET]: '0x797691C82093Fe9EfAD6ceAcB1FC3080C2a4F85A',
  [ChainId.TAIKO_TESTNET]: '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535',
  [ChainId.BOBA_TESTNET]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.NEOX_MAINNET]: '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5',
  [ChainId.U2U_MAINNET]: '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c',
  [ChainId.SCROLL_TESTNET]: '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D',
  [ChainId.ARBITRUM_SEPOLIA]: '0x8c9faEC6aED9BA0578f4C02cECb3cfE75DEf0856',
  [ChainId.ARBITRUM_MAINNET]: '0xD05395a6b6542020FBD38D31fe1377130b35592E',
  [ChainId.BERA_MAINNET]: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
  [ChainId.HYPER_EVM]: '0x3240853b71c89209ea8764CDDfA3b81766553E55',
  [ChainId.LINEA_MAINNET]: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
  [ChainId.SEI_MAINNET]: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
  [ChainId.MONAD]: '0x68bc42F886ddf6a4b0B90a9496493dA1f8304536',
  [ChainId.OP_MAINNET]: '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c',
  [ChainId.BOBA_MAINNET]: '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c',
}

export const FACTORY_ADDRESS_V1: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c',
  [ChainId.VICTION_MAINNET]: '0xa80258Eea4BA0865610eb239045737D08929c40b',
  [ChainId.U2U_MAINNET]: '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c',
}

export const INIT_CODE_HASH: Record<number, string> = {
  [ChainId.MAINNET]: '0xa92e1262e78c2029fb68aa25cd33df22da5c26a36d5ca3e7f82777add081632c',
  [ChainId.SEPOLIA]: '0xbcc73a27bdc3b703355edcfc04a012b1f2429e8501166b39158c19d079d031d1',
  [ChainId.BSC_TESTNET]: '0x6b3b1d7e371199ab6de148d0ee63bc6809b9691d75ef9341bf6950bf4501702b',
  [ChainId.BSC_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.VICTION_TESTNET]: '0x711312ac9a4efcfb1916d57f2ec6e03f5e1299e46f449ac9400da95ffc6d5a42',
  [ChainId.VICTION_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.SONIC_TESTNET]: '0x114d0544828b902794dd44ecddc6d536315d4f8ef581de0fcac30677b2b9e26b',
  [ChainId.MINATO_SONEIUM]: '0xf2eab90754ebe4f7948efc0065f1fec022ffaed2fff5c5048776cf8ce4701a19',
  [ChainId.BASE_SEPOLIA]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.BASE_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.UNICHAIN_SEPOLIA]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.AURORA_TESTNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.METIS_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.TAIKO_TESTNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.BOBA_TESTNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.NEOX_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.U2U_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.SCROLL_TESTNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.ARBITRUM_SEPOLIA]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.ARBITRUM_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.BERA_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.HYPER_EVM]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.LINEA_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.SEI_MAINNET]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.MONAD]: '0xba3704b080a922b1d5cc299de67778312cff58ab8b1704742d9b0b19c359e228',
  [ChainId.OP_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.BOBA_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
}

export const INIT_CODE_HASH_V1: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.VICTION_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
  [ChainId.U2U_MAINNET]: '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af',
}

// OracleGateway (factory.priceOracle()) — holds the per-pair V3 oracle liquidity
// thresholds (minLiquidityInQuote / minPathLiquidityInBase, both WAD-scaled) and
// twapWindow(pair,pool). DISTINCT from PYTH_ADDRESS (the router's Pyth price source).
// Addresses from v3-core PairInfo.json `oracle` field (rarely change).
export const ORACLE_GATEWAY_ADDRESS: Record<number, string> = {
  [ChainId.HYPER_EVM]: '0x765A7EDd929AF3cDf85f5BE9cC35B7d53C6b3ED0',
  [ChainId.ROBINHOOD_MAINNET]: '0x3240853b71c89209ea8764CDDfA3b81766553E55',
  [ChainId.BASE_MAINNET]: '0xcd6B2E1a01DB2a03f81055d53E58523d65Cc4258',
  [ChainId.ARBITRUM_MAINNET]: '0xC2977cB679ddb708DBAFe600E4E6c951eBE180a6',
  [ChainId.LINEA_MAINNET]: '0x53981b24075B72790dd3931AE469B47155215c4A',
  [ChainId.BERA_MAINNET]: '0x315062EA5686289BCBe138424FD10591BeB37a75',
}

export const PYTH_ADDRESS: Record<number, string> = {
  [ChainId.SEPOLIA]: '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21',
  [ChainId.ARBITRUM_SEPOLIA]: '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF',
  [ChainId.ARBITRUM_MAINNET]: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
  // Robinhood: router.PYTH() custom oracle (getUpdateFee=0, keeper-fed like Bera/Linea).
  [ChainId.ROBINHOOD_MAINNET]: '0xa80258Eea4BA0865610eb239045737D08929c40b',
  [ChainId.BSC_MAINNET]: '0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594',
  [ChainId.BASE_MAINNET]: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a',
  [ChainId.BERA_MAINNET]: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  [ChainId.HYPER_EVM]: '0xe9d69CdD6Fe41e7B621B4A688C5D1a68cB5c8ADc',
  [ChainId.LINEA_MAINNET]: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729',
  [ChainId.SEI_MAINNET]: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  [ChainId.MONAD]: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  [ChainId.VICTION_MAINNET]: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729',
  [ChainId.SONIC_TESTNET]: '0x96124d1f6e44ffdf1fb5d6d74bb2de1b7fbe7376',
  [ChainId.AURORA_TESTNET]: '0x74f09cb3c7e2A01865f424FD14F6dc9A14E3e94E',
  [ChainId.TAIKO_TESTNET]: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  [ChainId.BOBA_TESTNET]: '0x8D254a21b3C86D32F7179855531CE99164721933',
  [ChainId.BOBA_MAINNET]: '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF',
}

// Keeper-fed BrownFi price oracle that the on-chain routers actually read for
// pricing (`router.PYTH()`). On Bera this is NOT the raw official Pyth
// (`PYTH_ADDRESS` = 0x2880…): the official feed leaves some listed tokens
// unmaintained (e.g. DOLO was frozen ~107 days at $0.033 while the real price
// was $0.023), whereas this oracle is kept fresh for every listed token. All
// price READS must hit this so the FE's preview/sizing matches what the
// contract computes — otherwise add-liquidity reverts with INSUFFICIENT_B_AMOUNT
// on tokens whose official feed has drifted. Absent an override it falls back
// to PYTH_ADDRESS (chains where the two are the same). Reads only — never use
// for getUpdateFee/updatePriceFeeds (those stay on PYTH_ADDRESS).
export const PRICE_ORACLE_ADDRESS: Record<number, string> = {
  [ChainId.BERA_MAINNET]: '0xB7EAADA6A64479E09E7B0F0b6D1C9d2a33c70Aeb',
}

export const getPriceOracleAddress = (chainId: number): string =>
  PRICE_ORACLE_ADDRESS[chainId] ?? PYTH_ADDRESS[chainId]

export const RPC_URLS: Record<number, string> = {
  [ChainId.SEPOLIA]: 'https://sepolia.drpc.org',
  [ChainId.BSC_TESTNET]: 'https://bsc-testnet.drpc.org',
  [ChainId.BSC_MAINNET]: 'https://bsc-dataseed1.defibit.io',
  [ChainId.VICTION_TESTNET]: 'https://rpc-testnet.viction.xyz',
  [ChainId.VICTION_MAINNET]: 'https://rpc.viction.xyz',
  [ChainId.BASE_SEPOLIA]: 'https://base-sepolia-rpc.publicnode.com',
  [ChainId.BASE_MAINNET]: 'https://mainnet.base.org',
  [ChainId.BOBA_TESTNET]: 'https://sepolia.boba.network',
  [ChainId.U2U_MAINNET]: 'https://rpc-mainnet.u2u.xyz',
  [ChainId.ARBITRUM_SEPOLIA]: 'https://sepolia-rollup.arbitrum.io/rpc',
  [ChainId.ARBITRUM_MAINNET]: 'https://arb1.arbitrum.io/rpc',
  [ChainId.ROBINHOOD_MAINNET]: 'https://rpc.mainnet.chain.robinhood.com',
  [ChainId.BERA_MAINNET]: 'https://rpc.berachain.com',
  [ChainId.HYPER_EVM]: 'https://rpc.hyperliquid.xyz/evm',
  [ChainId.LINEA_MAINNET]: 'https://rpc.linea.build',
  [ChainId.SEI_MAINNET]: 'https://evm-rpc.sei-apis.com',
  [ChainId.MONAD]: 'https://rpc.monad.xyz',
  [ChainId.OP_MAINNET]: 'https://optimism.llamarpc.com',
  [ChainId.BOBA_MAINNET]: 'https://mainnet.boba.network',
}

// Per-chain RPC endpoints to try in order. Single public RPCs rate-limit (429),
// 500, or go down under the on-chain read burst (pool list, quotes, reserves),
// so reads go through a viem `fallback()` that rotates to the next endpoint on
// failure (see lib/sdk/rpc.ts). First entry is the primary (mirrors RPC_URLS);
// the rest are fallbacks. Chains absent here fall back to their single RPC_URLS
// entry. (Base list verified reliable 2026-06-22 — drpc/llama/meow/blockpi were
// flaky/blocked; the rest reuse the connectors' wallet fallbackRpcs.)
export const RPC_FALLBACKS: Record<number, string[]> = {
  [ChainId.BERA_MAINNET]: ['https://rpc.berachain.com', 'https://rpc.berachain-apis.com', 'https://berachain.drpc.org'],
  [ChainId.HYPER_EVM]: ['https://rpc.hyperliquid.xyz/evm', 'https://hyperliquid.drpc.org'],
  [ChainId.BASE_MAINNET]: [
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://1rpc.io/base',
    'https://developer-access-mainnet.base.org',
  ],
  [ChainId.ARBITRUM_MAINNET]: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum.drpc.org', 'https://arbitrum.therpc.io'],
  [ChainId.ROBINHOOD_MAINNET]: ['https://rpc.mainnet.chain.robinhood.com'],
  [ChainId.BSC_MAINNET]: ['https://bsc-dataseed1.defibit.io', 'https://bsc-dataseed1.ninicoin.io', 'https://bsc.drpc.org'],
  [ChainId.LINEA_MAINNET]: ['https://rpc.linea.build', 'https://1rpc.io/linea', 'https://linea.drpc.org'],
  [ChainId.SEI_MAINNET]: ['https://evm-rpc.sei-apis.com', 'https://sei.drpc.org', 'https://sei-evm-rpc.publicnode.com'],
  [ChainId.MONAD]: ['https://rpc.monad.xyz', 'https://rpc3.monad.xyz'],
}
