import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from './WalletConnector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import { arbitrumSepolia, berachain, boba, sepolia, viction } from 'wagmi/chains'

import { NetworkConnector } from './NetworkConnector'
import UNISWAP_LOGO_URL from '../assets/svg/logo.svg'
import { ChainId } from '@brownfi/sdk'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

const ARBITRUM_SEPOLIA_URL = process.env.REACT_APP_ARBITRUM_SEPOLIA_URL

/** @deprecated */
export const NETWORK_CHAIN_ID: number = ChainId.ARBITRUM_SEPOLIA

/** @deprecated */
export const NETWORK_URL = ARBITRUM_SEPOLIA_URL

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

/** @deprecated */
export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

// mainnet only
export const walletconnect = new WalletConnectConnector({
  projectId: 'b64df0521d25ed5108cd242cfa8412e5',
  chains: [ChainId.MAINNET]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Brownfi',
  appLogoUrl: UNISWAP_LOGO_URL
})

// @ts-ignore
const u2uMainnet: Chain = defineChain({
  id: 39,
  name: 'U2U Network',
  nativeCurrency: { decimals: 18, name: 'U2U', symbol: 'U2U' },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.u2u.xyz']
    }
  },
  blockExplorers: {
    default: { name: 'U2U Scan', url: 'https://u2uscan.xyz' }
  }
})

// @ts-ignore
berachain.iconUrl = require('assets/images/w-bera.png')
// @ts-ignore
boba.iconUrl = require('assets/images/boba.svg').default
// @ts-ignore
viction.iconUrl = require('assets/images/viction.png')
// @ts-ignore
u2uMainnet.iconUrl = require('assets/images/u2u.jpg')
// @ts-ignore
arbitrumSepolia.iconUrl = require('assets/images/arb.png')
// @ts-ignore
sepolia.iconUrl = require('assets/images/ethereum-logo.png')

export const availableChains: Chain[] = [arbitrumSepolia, sepolia]

export const injected = new InjectedConnector({
  supportedChainIds: availableChains.map(chain => chain.id)
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains as any,
  projectId: '3441811a50334d46eef9f2435cadee36',
  ssr: false
})
