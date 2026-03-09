import * as defaultChains from 'viem/chains'

import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

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

const u2uMainnet: Chain = {
  id: 39,
  name: 'U2U Network',
  nativeCurrency: { decimals: 18, name: 'U2U', symbol: 'U2U' },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.u2u.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'U2U Scan', url: 'https://u2uscan.xyz' },
  },
  iconUrl: require('assets/images/u2u.jpg'),
}

const viction = overrideChain({
  chain: defaultChains.viction,
  iconUrl: require('assets/images/viction.png'),
  fallbackRpcs: [
    //
    'https://viction.drpc.org',
  ],
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
  iconUrl: require('assets/images/hyperevm.png'),
}

const sepolia: Chain = {
  ...defaultChains.sepolia,
  iconUrl: require('assets/images/ethereum-logo.png'),
}

const berachain = overrideChain({
  chain: defaultChains.berachain,
  iconUrl: require('assets/images/w-bera.png'),
  fallbackRpcs: [
    //
    'https://rpc.berachain-apis.com',
    'https://berachain.drpc.org',
  ],
})

const arbitrum = overrideChain({
  chain: defaultChains.arbitrum,
  iconUrl: require('assets/images/arb.png'),
  fallbackRpcs: [
    //
    'https://arbitrum.drpc.org',
    'https://arbitrum.therpc.io',
  ],
})

const base = overrideChain({
  chain: defaultChains.base,
  iconUrl: require('assets/images/base.png'),
  fallbackRpcs: [
    //
    'https://1rpc.io/base',
    'https://base.llamarpc.com',
  ],
})

const bsc = overrideChain({
  chain: defaultChains.bsc,
  iconUrl: require('assets/images/bsc.png'),
  fallbackRpcs: [
    //
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.ninicoin.io',
  ],
})

const linea = overrideChain({
  chain: defaultChains.linea,
  iconUrl: require('assets/images/linea.webp'),
  fallbackRpcs: [
    //
    'https://1rpc.io/linea',
    'https://linea.therpc.io',
  ],
})

const sei = overrideChain({
  chain: defaultChains.sei,
  iconUrl: require('assets/images/sei.png'),
  fallbackRpcs: [
    //
    'https://sei.drpc.org',
    'https://sei.therpc.io',
  ],
})

const monad = overrideChain({
  chain: defaultChains.monad,
  iconUrl: require('assets/images/monad.png'),
  fallbackRpcs: [
    //
    'https://rpc3.monad.xyz',
  ],
})

export const appEnv = process.env.REACT_APP_ENVIRONMENT as
  | 'mainnet'
  | 'beta'
  | 'testnet'
export const isMainnet = appEnv === 'mainnet'

const mainChains: readonly [Chain, ...Chain[]] = [berachain, arbitrum, base, bsc, hyperEVM, linea, sei, monad, viction, u2uMainnet]
const betaChains: readonly [Chain, ...Chain[]] = [berachain, arbitrum, base, bsc, hyperEVM, linea, sei, monad, viction, u2uMainnet]
const testChains: readonly [Chain, ...Chain[]] = [berachain, sepolia]

export const availableChains = appEnv === 'mainnet' ? mainChains : appEnv === 'beta' ? betaChains : testChains
export const getDefaultChain = (index?: number): Chain => availableChains[index ?? 0]

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains,
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? '',
  ssr: false,
})
