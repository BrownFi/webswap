import { Pair } from '@brownfi/sdk'

export const shouldReverse = (pairSymbols: string) => {
  return [
    //
    'USDC.e/BERA',
    'USDC/cbBTC',
    'USDT/kHYPE',
    'USDC/ETH',
    'USDC/LINEA',
    'USDe/BERA',
    // BSC
    'USDC/BNB',
    'USDT/BNB',
    'ASTER/BNB',
    'USDT/BTCB',
    // BASE
    'USDC/KAITO',
    // LINEA
    'USDT/ETH',
    // MONAD
    'AUSD/MON',
    // BERA V3
    'USD₮0/HONEY',
    // HyperEVM — symbol updated from USDT to USD₮0 (the old USDT/kHYPE
    // entry above stays for any legacy positions on the old token).
    'USD₮0/kHYPE',
    // Sei — WSEI doesn't unwrap to a friendly display symbol in
    // getTokenSymbol, so match the raw wrapped form here.
    'USDC/WSEI',
  ].includes(pairSymbols)
}

export const shouldReversePair = (pair: Pair) => {
  const pairSymbols = [pair.token0.symbol, pair.token1.symbol].join('/')
  return shouldReverse(pairSymbols)
}
