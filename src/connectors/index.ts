import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from './WalletConnector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import { arbitrum, arbitrumSepolia, base, berachain, bsc, mainnet, sepolia, viction } from 'wagmi/chains'

import UNISWAP_LOGO_URL from '../assets/svg/logo.svg'
import { ChainId } from '@brownfi/sdk'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// mainnet only
export const walletconnect = new WalletConnectConnector({
  projectId: 'b64df0521d25ed5108cd242cfa8412e5',
  chains: [ChainId.MAINNET]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: mainnet.rpcUrls.default.http[0],
  appName: 'Brownfi',
  appLogoUrl: UNISWAP_LOGO_URL
})

// @ts-ignore
export const u2uMainnet: Chain = defineChain({
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
  },
  iconUrl: require('assets/images/u2u.jpg')
})

// @ts-ignore
berachain.iconUrl = require('assets/images/w-bera.png')
// @ts-ignore
viction.iconUrl = require('assets/images/viction.png')

// @ts-ignore
arbitrumSepolia.iconUrl = require('assets/images/arb.png')
// @ts-ignore
arbitrum.iconUrl = require('assets/images/arb.png')
// @ts-ignore
base.iconUrl = require('assets/images/base.png')
// @ts-ignore
bsc.iconUrl = require('assets/images/bsc.png')
// @ts-ignore
sepolia.iconUrl = require('assets/images/ethereum-logo.png')

const env = process.env.REACT_APP_ENV as 'testnet' | 'bera' | 'mainnet'
console.log(`======== ENV: "${env}" =========`)

const beraChains: Chain[] = [berachain, arbitrum, base, bsc, viction, u2uMainnet]
const mainnetChains: Chain[] = [arbitrum, base, bsc]
const testnetChains: Chain[] = [arbitrum, base, bsc, berachain, arbitrumSepolia]

export const availableChains = env === 'bera' ? beraChains : env === 'mainnet' ? mainnetChains : testnetChains
export const getDefaultChain = (index?: number): Chain => availableChains[index ?? 0]

export const injected = new InjectedConnector({
  supportedChainIds: availableChains.map(chain => chain.id)
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Brownfi',
  chains: availableChains as any,
  projectId: '3441811a50334d46eef9f2435cadee36',
  ssr: false
})
