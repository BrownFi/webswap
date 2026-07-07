// PILOT gate: pools that get the market-price reference lines (Pyth / TradingView)
// overlaid on the Pool Balance + Oracle Spread charts to compare pool price vs the
// real market. Gated to specific pairs while we evaluate it.
// Key = `${chainId}-${lowercasePairAddress}`.
const MARKET_REF_PAIRS = new Set<string>([
  '80094-0xc123bc9259d1a99add5a2c512498ac146dd2bade', // WETH/USDC.e (Bera)
])

export const isMarketRefPair = (chainId: number, pairAddress: string): boolean =>
  MARKET_REF_PAIRS.has(`${chainId}-${pairAddress.toLowerCase()}`)
