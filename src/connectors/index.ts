import {
  sepolia as sepoliaChain,
  berachain as berachainChain,
  arbitrum as arbitrumChain,
  base as baseChain,
  bsc as bscChain,
  linea as lineaChain,
  sei as seiChain,
  monad as monadChain,
} from 'viem/chains'

import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

import hyperevmIcon from 'assets/images/hyperevm.png'
import ethereumIcon from 'assets/images/ethereum-logo.png'
import beraIcon from 'assets/images/w-bera.png'
import arbIcon from 'assets/images/arb.png'
import baseIcon from 'assets/images/base.png'
import bscIcon from 'assets/images/bsc.png'
import lineaIcon from 'assets/images/linea.webp'
import seiIcon from 'assets/images/sei.png'
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

const bsc = overrideChain({
  chain: bscChain,
  iconUrl: bscIcon,
  fallbackRpcs: [
    //
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.ninicoin.io',
  ],
})

const linea = overrideChain({
  chain: lineaChain,
  iconUrl: lineaIcon,
  fallbackRpcs: [
    //
    'https://1rpc.io/linea',
    'https://linea.therpc.io',
  ],
})

const sei = overrideChain({
  chain: seiChain,
  iconUrl: seiIcon,
  fallbackRpcs: [
    //
    'https://sei.drpc.org',
    'https://sei.therpc.io',
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

// Feature capability derived from the API URL, NOT the env name. The two are
// orthogonal:
//   - VITE_ENVIRONMENT controls deployment identity (mainnet/beta/testnet).
//     Used for dev-only UI gates (admin stats, edit-pool, etc.).
//   - VITE_API_URL controls which indexer the FE talks to. Only the beta API
//     currently exposes V3 schema + uniV2Price; production api.brownfi.io
//     doesn't.
// A beta-branded deployment can point at production API to mirror prod data,
// in which case V3 + uniV2Price must be disabled even though env !== 'mainnet'.
export const isBetaApi = (import.meta.env.VITE_API_URL ?? '').includes('bf-v2-api-beta')
// V3 indexer (/indexer/v3) and uniV2Price field only exist on beta API today.
export const isV3Enabled = isBetaApi

const mainChains: readonly [Chain, ...Chain[]] = [
  berachain,
  arbitrum,
  base,
  bsc,
  hyperEVM,
  linea,
  sei,
  monad,
]
const betaChains: readonly [Chain, ...Chain[]] = [
  berachain,
  arbitrum,
  base,
  bsc,
  hyperEVM,
  linea,
  sei,
  monad,
]
const testChains: readonly [Chain, ...Chain[]] = [berachain, sepolia]

export const availableChains = appEnv === 'mainnet' ? mainChains : appEnv === 'beta' ? betaChains : testChains
export const getDefaultChain = (index?: number): Chain => availableChains[index ?? 0]

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains,
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',
  ssr: false,
})
