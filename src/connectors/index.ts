import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from './WalletConnector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import * as defaultChains from 'viem/chains'

import UNISWAP_LOGO_URL from 'assets/svg/logo.svg'
import { ChainId } from '@brownfi/sdk'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// mainnet only
export const walletconnect = new WalletConnectConnector({
  projectId: 'b64df0521d25ed5108cd242cfa8412e5',
  chains: [ChainId.MAINNET],
})

export const walletlink = new WalletLinkConnector({
  url: defaultChains.mainnet.rpcUrls.default.http[0],
  appName: 'Brownfi',
  appLogoUrl: UNISWAP_LOGO_URL,
})

const overrideChain = ({
  chain,
  iconUrl,
  fallbackRpcs,
}: {
  chain: Chain
  iconUrl: any
  fallbackRpcs: string[]
}): Chain => {
  // @ts-ignore
  return defineChain({
    ...chain,
    rpcUrls: {
      default: {
        http: chain.rpcUrls.default.http.concat(fallbackRpcs),
      },
    },
    iconUrl,
  })
}

// @ts-ignore
const u2uMainnet: Chain = defineChain({
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
})

const viction: Chain = overrideChain({
  chain: defaultChains.viction,
  iconUrl: require('assets/images/viction.png'),
  fallbackRpcs: [
    //
    'https://viction.drpc.org',
  ],
})

// @ts-ignore
const hyperEVM: Chain = defineChain({
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
})

// @ts-ignore
// eslint-disable-next-line
const sepolia = defineChain({
  ...defaultChains.sepolia,
  iconUrl: require('assets/images/ethereum-logo.png'),
})

const berachain = overrideChain({
  chain: defaultChains.berachain,
  iconUrl: require('assets/images/w-bera.png'),
  fallbackRpcs: [
    //
    'https://berachain.drpc.org',
    'https://rpc.berachain-apis.com',
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
    'https://base.drpc.org',
    'https://base.llamarpc.com',
  ],
})

const bsc = overrideChain({
  chain: defaultChains.bsc,
  iconUrl: require('assets/images/bsc.png'),
  fallbackRpcs: [
    //
    'https://bsc.drpc.org',
    'https://binance.llamarpc.com',
  ],
})

const env = process.env.REACT_APP_ENVIROMENT as 'mainnet' | 'beta' | 'testnet'
export const isProduction = env === 'mainnet'
console.log(`======== ENVIROMENT: "${env}" =========`, { isProduction })

const mainChains: Chain[] = [berachain, arbitrum, base, hyperEVM, viction, u2uMainnet]
const betaChains: Chain[] = [berachain, arbitrum, base, bsc, hyperEVM, viction, u2uMainnet]
const testChains: Chain[] = [berachain, arbitrum, base, bsc, hyperEVM, sepolia]

export const availableChains = env === 'mainnet' ? mainChains : env === 'beta' ? betaChains : testChains
export const getDefaultChain = (index?: number): Chain => availableChains[index ?? 0]

export const injected = new InjectedConnector({
  supportedChainIds: availableChains.map((chain) => chain.id),
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains as any,
  projectId: '3441811a50334d46eef9f2435cadee36',
  ssr: false,
})
