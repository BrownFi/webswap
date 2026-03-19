import { ChainId } from './chainId'
import { Token } from '../entities/token'

export const WETH: Record<number, Token> = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.SN_MAIN]: new Token(ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'),
  [ChainId.SN_SEPOLIA]: new Token(ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 18, 'WBNB', 'Wrapped BNB'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB'),
  [ChainId.VICTION_TESTNET]: new Token(ChainId.VICTION_TESTNET, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'WVIC', 'Wrapped VIC'),
  [ChainId.VICTION_MAINNET]: new Token(ChainId.VICTION_MAINNET, '0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', 18, 'WVIC', 'Wrapped VIC'),
  [ChainId.SONIC_TESTNET]: new Token(ChainId.SONIC_TESTNET, '0x782783378a9D3BCCC8d9A03F5ED452263758a571', 18, 'WS', 'Wrapped S'),
  [ChainId.MINATO_SONEIUM]: new Token(ChainId.MINATO_SONEIUM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.BASE_SEPOLIA]: new Token(ChainId.BASE_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.BASE_MAINNET]: new Token(ChainId.BASE_MAINNET, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.UNICHAIN_SEPOLIA]: new Token(ChainId.UNICHAIN_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'ETH', 'Wrapped Ether'),
  [ChainId.AURORA_TESTNET]: new Token(ChainId.AURORA_TESTNET, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.METIS_MAINNET]: new Token(ChainId.METIS_MAINNET, '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481', 18, 'WMETIS', 'Wrapped METIS'),
  [ChainId.TAIKO_TESTNET]: new Token(ChainId.TAIKO_TESTNET, '0xae2C46ddb314B9Ba743C6dEE4878F151881333D9', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.BOBA_TESTNET]: new Token(ChainId.BOBA_TESTNET, '0x0f97Ca4E6B118502f83DD3Ce836A14Cb4937ed2a', 18, 'WBOBA', 'Wrapped BOBA'),
  [ChainId.NEOX_MAINNET]: new Token(ChainId.NEOX_MAINNET, '0xdE41591ED1f8ED1484aC2CD8ca0876428de60EfF', 18, 'WGAS10', 'Wrapped GAS v10'),
  [ChainId.U2U_MAINNET]: new Token(ChainId.U2U_MAINNET, '0xA99cf32e9aAa700f9E881BA9BF2C57A211ae94df', 18, 'WU2U', 'Wrapped U2U'),
  [ChainId.SCROLL_TESTNET]: new Token(ChainId.SCROLL_TESTNET, '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.ARBITRUM_SEPOLIA]: new Token(ChainId.ARBITRUM_SEPOLIA, '0x3F0bBeEdEa5E5F63a14cBdA82718d4f25501fBeA', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.ARBITRUM_MAINNET]: new Token(ChainId.ARBITRUM_MAINNET, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.BERA_MAINNET]: new Token(ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA', 'Wrapped Bera'),
  [ChainId.HYPER_EVM]: new Token(ChainId.HYPER_EVM, '0x5555555555555555555555555555555555555555', 18, 'WHYPE', 'Wrapped HYPE'),
  [ChainId.LINEA_MAINNET]: new Token(ChainId.LINEA_MAINNET, '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.SEI_MAINNET]: new Token(ChainId.SEI_MAINNET, '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7', 18, 'WSEI', 'Wrapped SEI'),
  [ChainId.MONAD]: new Token(ChainId.MONAD, '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A', 18, 'WMON', 'Wrapped MON'),
  [ChainId.OP_MAINNET]: new Token(ChainId.OP_MAINNET, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'),
  [ChainId.BOBA_MAINNET]: new Token(ChainId.BOBA_MAINNET, '0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7', 18, 'ETH', 'Wrapped ETH'),
}

// Common tokens (mainnet)
export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')

// Chain-specific tokens
export const UNICHAIN_USDC = new Token(ChainId.UNICHAIN_SEPOLIA, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'USDC', 'USDC')
export const METIS_USDC = new Token(ChainId.METIS_MAINNET, '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', 6, 'USDC', 'USDC')

// WETH-only bases per chain
export const WETH_ONLY: Record<number, Token[]> = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.SEPOLIA]: [WETH[ChainId.SEPOLIA]],
  [ChainId.SN_MAIN]: [WETH[ChainId.SN_MAIN]],
  [ChainId.SN_SEPOLIA]: [WETH[ChainId.SN_SEPOLIA]],
  [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
  [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET]],
  [ChainId.VICTION_TESTNET]: [WETH[ChainId.VICTION_TESTNET]],
  [ChainId.VICTION_MAINNET]: [WETH[ChainId.VICTION_MAINNET]],
  [ChainId.SONIC_TESTNET]: [WETH[ChainId.SONIC_TESTNET]],
  [ChainId.MINATO_SONEIUM]: [WETH[ChainId.MINATO_SONEIUM]],
  [ChainId.BASE_SEPOLIA]: [WETH[ChainId.BASE_SEPOLIA]],
  [ChainId.BASE_MAINNET]: [WETH[ChainId.BASE_MAINNET]],
  [ChainId.UNICHAIN_SEPOLIA]: [WETH[ChainId.UNICHAIN_SEPOLIA]],
  [ChainId.AURORA_TESTNET]: [WETH[ChainId.AURORA_TESTNET]],
  [ChainId.METIS_MAINNET]: [WETH[ChainId.METIS_MAINNET]],
  [ChainId.TAIKO_TESTNET]: [WETH[ChainId.TAIKO_TESTNET]],
  [ChainId.BOBA_TESTNET]: [WETH[ChainId.BOBA_TESTNET]],
  [ChainId.NEOX_MAINNET]: [WETH[ChainId.NEOX_MAINNET]],
  [ChainId.U2U_MAINNET]: [WETH[ChainId.U2U_MAINNET]],
  [ChainId.SCROLL_TESTNET]: [WETH[ChainId.SCROLL_TESTNET]],
  [ChainId.ARBITRUM_SEPOLIA]: [WETH[ChainId.ARBITRUM_SEPOLIA]],
  [ChainId.ARBITRUM_MAINNET]: [WETH[ChainId.ARBITRUM_MAINNET]],
  [ChainId.BERA_MAINNET]: [WETH[ChainId.BERA_MAINNET]],
  [ChainId.HYPER_EVM]: [WETH[ChainId.HYPER_EVM]],
  [ChainId.LINEA_MAINNET]: [WETH[ChainId.LINEA_MAINNET]],
  [ChainId.SEI_MAINNET]: [WETH[ChainId.SEI_MAINNET]],
  [ChainId.MONAD]: [WETH[ChainId.MONAD]],
  [ChainId.OP_MAINNET]: [WETH[ChainId.OP_MAINNET]],
  [ChainId.BOBA_MAINNET]: [WETH[ChainId.BOBA_MAINNET]],
}

// Bases to track liquidity for
export const BASES_TO_TRACK_LIQUIDITY_FOR: Record<number, Token[]> = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC],
}

// Pinned pairs
export const PINNED_PAIRS: Record<number, [Token, Token][]> = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin'),
    ],
    [USDC, USDT],
    [DAI, USDT],
  ],
}

// Serialized types (used by redux state persistence)
export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}
