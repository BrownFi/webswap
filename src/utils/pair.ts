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
  ].includes(pairSymbols)
}

export const shouldReversePair = (pair: Pair) => {
  const pairSymbols = [pair.token0.symbol, pair.token1.symbol].join('/')
  return shouldReverse(pairSymbols)
}
