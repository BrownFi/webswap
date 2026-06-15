import { ChainId, JSBI, Percent, Token, WETH_ONLY } from '@brownfi/sdk'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]?: Token[]
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET]],
  [ChainId.HYPER_EVM]: [
    ...WETH_ONLY[ChainId.HYPER_EVM],
    // USD₮0 — 6 decimals on-chain (was wrongly 8 here; the token list + pinned
    // config already use 6). Wrong base decimals corrupt reserve math for any
    // multi-hop route that passes through USD₮0 (off by 100×).
    new Token(ChainId.HYPER_EVM, '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', 6, 'USDT', 'USDT'),
  ],
}

export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {}

// Featured chips shown above the full token list in the search modal.
// Per UX feedback (boss + reviewer): replace the BERA/WBERA-only chip row
// with the top-6 by 30d volume on each chain. Currently only defined for
// Bera; other chains fall back to WETH-only.
const BERA_HONEY  = new Token(ChainId.BERA_MAINNET, '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', 18, 'HONEY', 'Honey')
const BERA_USDCE  = new Token(ChainId.BERA_MAINNET, '0x549943e04f40284185054145c6E4e9568C1D3241', 6,  'USDC.e', 'Bridged USDC (Stargate)')
const BERA_WBTC   = new Token(ChainId.BERA_MAINNET, '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', 8,  'WBTC',  'Wrapped BTC')
const BERA_WETH   = new Token(ChainId.BERA_MAINNET, '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590', 18, 'WETH',  'WETH')

export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC],
  // WBERA is already in WETH_ONLY for Bera; native BERA is added via the
  // ETHER chip rendered separately by CommonBases. So the rendered chip row
  // becomes: BERA, WBERA, HONEY, USDC.e, WBTC, WETH.
  [ChainId.BERA_MAINNET]: [...WETH_ONLY[ChainId.BERA_MAINNET], BERA_HONEY, BERA_USDCE, BERA_WBTC, BERA_WETH],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin'),
    ],
    [USDC, USDT],
    [DAI, USDT],
  ],
}

// Default allowed slippage, in 1/10000 (1 = 0.01%). 50 = 0.5%.
// Was 1000 (10%), which is too permissive for new users — caused the kind of
// price-impact loss the reviewer flagged. CowSwap is at 0.56%, Kodiak 0.3%,
// Uniswap uses dynamic auto-slippage. 0.5% is a safe middle ground; advanced
// users can raise it explicitly.
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 10 minutes, denominated in seconds. Was 20 — long enough that stuck txns
// became a real complaint. Reduced to 10 to surface pending issues faster.
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 10

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C',
]
