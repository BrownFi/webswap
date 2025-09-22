import { Pair } from '@brownfi/sdk'

export const shouldReverse = (pairSymbols: string) => {
  return ['USDC.e/BERA', 'USDC/cbBTC', 'USDT/kHYPE', 'USDC/ETH', 'USDC/LINEA'].includes(pairSymbols)
}

export const shouldReversePair = (pair: Pair) => {
  const pairSymbols = [pair.token0.symbol, pair.token1.symbol].join('/')
  return shouldReverse(pairSymbols)
}
