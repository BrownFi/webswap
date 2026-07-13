import {
  sepolia as sepoliaChain,
  berachain as berachainChain,
  arbitrum as arbitrumChain,
  base as baseChain,
  linea as lineaChain,
  monad as monadChain,
} from 'viem/chains'

import { Chain, getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { rabbyWallet, safeWallet } from '@rainbow-me/rainbowkit/wallets'

import hyperevmIcon from 'assets/images/hyperevm.png'
import ethereumIcon from 'assets/images/ethereum-logo.png'
import beraIcon from 'assets/images/w-bera.png'
import arbIcon from 'assets/images/arb.png'
import baseIcon from 'assets/images/base.png'
import lineaIcon from 'assets/images/linea.webp'
import monadIcon from 'assets/images/monad.png'

const overrideChain = ({
  chain,
  iconUrl,
  fallbackRpcs,
}: {
  chain: Chain
  iconUrl?: string
  fallbackRpcs: string[]
}): Chain => ({
  ...chain,
  rpcUrls: {
    default: {
      http: chain.rpcUrls.default.http.concat(fallbackRpcs),
    },
  },
  iconUrl,
})

const hyperEVM: Chain = {
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: { decimals: 18, name: 'HYPE', symbol: 'HYPE' },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm', 'https://hyperliquid.drpc.org'],
    },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Scan', url: 'https://hyperevmscan.io' },
  },
  iconUrl: hyperevmIcon,
}

const sepolia: Chain = {
  ...sepoliaChain,
  iconUrl: ethereumIcon,
}

const berachain = overrideChain({
  chain: berachainChain,
  iconUrl: beraIcon,
  fallbackRpcs: [
    //
    'https://rpc.berachain-apis.com',
    'https://berachain.drpc.org',
  ],
})

const arbitrum = overrideChain({
  chain: arbitrumChain,
  iconUrl: arbIcon,
  fallbackRpcs: [
    //
    'https://arbitrum.drpc.org',
    'https://arbitrum.therpc.io',
  ],
})

const base = overrideChain({
  chain: baseChain,
  iconUrl: baseIcon,
  fallbackRpcs: [
    //
    'https://1rpc.io/base',
    'https://base.llamarpc.com',
  ],
})

const linea = overrideChain({
  chain: lineaChain,
  iconUrl: lineaIcon,
  fallbackRpcs: [
    //
    'https://1rpc.io/linea',
    'https://linea.drpc.org',
  ],
})

const monad = overrideChain({
  chain: monadChain,
  iconUrl: monadIcon,
  fallbackRpcs: [
    //
    'https://rpc3.monad.xyz',
  ],
})

export const appEnv = import.meta.env.VITE_ENVIRONMENT as 'mainnet' | 'beta' | 'testnet'
export const isMainnet = appEnv === 'mainnet'

// Display-only navbar badge label. Decoupled from `appEnv` (which selects
// chains/API) so a deployment can run beta-tier infra while still labeling
// itself per branch: develop → 'dev', beta → 'beta' (falls back to appEnv).
export const appEnvLabel = (import.meta.env.VITE_ENV_LABEL || appEnv) as string

// Feature capability derived from the API URL, NOT the env name. The two are
// orthogonal:
//   - VITE_ENVIRONMENT controls deployment identity (mainnet/beta/testnet).
//     Used for dev-only UI gates (admin stats, edit-pool, etc.).
//   - VITE_API_URL controls which indexer the FE talks to. The V3 indexer
//     (/indexer/v3) and the uniV2Price field landed on the non-prod APIs
//     first; production api.brownfi.io doesn't have them yet.
//
// Match all non-prod API aliases:
//   - bf-v2-api-beta.brownfi.io  (legacy)
//   - dev-api.brownfi.io          (current dev alias)
//   - beta-api.brownfi.io         (current beta alias — V3 + uniV2Price wired 2026-05-20)
// All three serve the V3 schema + uniV2Price. Only api.brownfi.io (true
// production) lacks them, so it's the only one that doesn't match.
//
// V3 contracts are still per-chain (currently Berachain-only via
// ROUTER_ADDRESS_V3_PILOT) so even with this flag true, useVersion + SwitchVersion
// only expose V3 on chains where the router is deployed. The flag here is
// only about API capability, not per-chain readiness.
export const isBetaApi = /(bf-v2-api-beta|dev-api\.brownfi|beta-api\.brownfi)/.test(
  import.meta.env.VITE_API_URL ?? '',
)
// V3 is enabled when the API serves /indexer/v3 + uniV2Price — the beta/dev
// APIs (isBetaApi) and, as of 2026-06-18, production api.brownfi.io too (Manh
// promoted V3 for Bera + HyperEVM, verified 1:1 with beta-api). The `//api.`
// anchor matches the prod host without also matching `beta-api`/`dev-api`.
export const isV3Enabled = isBetaApi || /\/\/api\.brownfi\.io/.test(import.meta.env.VITE_API_URL ?? '')

const mainChains: readonly [Chain, ...Chain[]] = [
  berachain,
  arbitrum,
  base,
  hyperEVM,
  linea,
  monad,
]
const betaChains: readonly [Chain, ...Chain[]] = [
  berachain,
  arbitrum,
  base,
  hyperEVM,
  linea,
  monad,
]
const testChains: readonly [Chain, ...Chain[]] = [berachain, sepolia]

export const availableChains = appEnv === 'mainnet' ? mainChains : appEnv === 'beta' ? betaChains : testChains
export const getDefaultChain = (index?: number): Chain => availableChains[index ?? 0]

// RainbowKit's default wallet groups (Rainbow, MetaMask, Coinbase, WalletConnect,
// plus EIP-6963 auto-detected injected wallets). We add Rabby into the "Popular"
// group so it sits alongside the main wallets — by name, with icon + install
// link — rather than in a separate section. Fall back to the first group if the
// "Popular" group is ever renamed upstream.
const { wallets: defaultWallets } = getDefaultWallets()
const popularIdx = Math.max(
  0,
  defaultWallets.findIndex((group) => group.groupName === 'Popular'),
)
// Inside a Safe App (BrownFi loaded in Safe's iframe), offer ONLY the Safe
// wallet — the user is already operating their Safe, so other EOA wallets must
// not be selectable (per team request). `window.parent !== window` is the same
// iframe check the Safe connector uses for `installed`. Outside the iframe, show
// the full list with Rabby in Popular (safeWallet self-hides there). Pairs with
// the Safe-App fields in public/manifest.json + the /manifest.json CORS header.
const inSafeApp = typeof window !== 'undefined' && window.parent !== window
const wallets = inSafeApp
  ? [{ groupName: 'Safe', wallets: [safeWallet] }]
  : defaultWallets.map((group, i) =>
      i === popularIdx ? { ...group, wallets: [...group.wallets, rabbyWallet, safeWallet] } : group,
    )

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains,
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',
  ssr: false,
  wallets,
})
