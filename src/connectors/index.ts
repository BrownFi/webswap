import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from './WalletConnector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'
import UNISWAP_LOGO_URL from '../assets/svg/logo.svg'
import { ChainId } from '@brownfi/sdk'

// const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
const NETWORK_URL = 'https://rpc.viction.xyz'
const SEPOLIA_URL = process.env.REACT_APP_SEPOLIA_URL
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID
const VICTION_TESTNET_URL = process.env.REACT_APP_VICTION_TESTNET_URL
const VICTION_MAINNET_URL = process.env.REACT_APP_VICTION_MAINNET_URL
const SONIC_TESTNET_URL = process.env.REACT_APP_SONIC_TESTNET_URL
const MINATO_SONEIUM_URL = process.env.REACT_APP_MINATO_SONEIUM_URL
const BASE_TESTNET_URL = process.env.REACT_APP_BASE_SEPOLIA_URL
const UNICHAIN_TESTNET_URL = process.env.REACT_APP_UNICHAIN_SEPOLIA_URL
const AURORA_TESTNET_URL = process.env.REACT_APP_AURORA_TESTNET_URL
const METIS_MAINNET_URL = process.env.REACT_APP_METIS_MAINNET_URL
const U2U_MAINNET_URL = process.env.REACT_APP_U2U_MAINNET_URL
const ARBITRUM_MAINNET_URL = process.env.REACT_APP_ARBITRUM_MAINNET_URL
const OP_MAINNET_URL = process.env.REACT_APP_OP_MAINNET_URL
const BOBA_MAINNET_URL = process.env.REACT_APP_BOBA_MAINNET_URL

// export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '88')
export const NETWORK_CHAIN_ID: number = ChainId.VICTION_MAINNET

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

export const networkSepolia = new NetworkConnector({
  urls: { [ChainId.SEPOLIA]: SEPOLIA_URL as string }
})

export const networkViction = new NetworkConnector({
  urls: { [ChainId.VICTION_TESTNET]: VICTION_TESTNET_URL as string }
})

export const networkMinato = new NetworkConnector({
  urls: { [ChainId.MINATO_SONEIUM]: MINATO_SONEIUM_URL as string }
})

export const networkVictionMainnet = new NetworkConnector({
  urls: { [ChainId.VICTION_MAINNET]: VICTION_MAINNET_URL as string }
})

export const networkSonic = new NetworkConnector({
  urls: { [ChainId.SONIC_TESTNET]: SONIC_TESTNET_URL as string }
})

export const networkBaseTestnet = new NetworkConnector({
  urls: { [ChainId.BASE_SEPOLIA]: BASE_TESTNET_URL as string }
})

export const networkUnichainTestnet = new NetworkConnector({
  urls: { [ChainId.UNICHAIN_SEPOLIA]: UNICHAIN_TESTNET_URL as string }
})

export const networkAuroraTestnet = new NetworkConnector({
  urls: { [ChainId.AURORA_TESTNET]: AURORA_TESTNET_URL as string }
})

export const networkMetisMainnet = new NetworkConnector({
  urls: { [ChainId.METIS_MAINNET]: METIS_MAINNET_URL as string }
})

export const networkU2UMainnet = new NetworkConnector({
  urls: { [ChainId.U2U_MAINNET]: U2U_MAINNET_URL as string }
})

export const networkArbitrumMainnet = new NetworkConnector({
  urls: { [ChainId.ARBITRUM_MAINNET]: ARBITRUM_MAINNET_URL as string }
})

export const networkOPMainnet = new NetworkConnector({
  urls: { [ChainId.OP_MAINNET]: OP_MAINNET_URL as string }
})

export const networkBobaMainnet = new NetworkConnector({
  urls: { [ChainId.BOBA_MAINNET]: BOBA_MAINNET_URL as string }
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [
    ChainId.VICTION_MAINNET,
    ChainId.METIS_MAINNET,
    ChainId.U2U_MAINNET,
    ChainId.ARBITRUM_MAINNET,
    ChainId.OP_MAINNET,
    ChainId.BOBA_MAINNET
  ]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  projectId: 'b64df0521d25ed5108cd242cfa8412e5',
  chains: [ChainId.MAINNET]
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 1
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [1]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Brownfi',
  appLogoUrl: UNISWAP_LOGO_URL
})
