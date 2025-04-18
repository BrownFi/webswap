import { Pair } from '@brownfi/sdk'

export const shouldReverse = (pair: string) => {
  return ['USDC.e/BERA', 'BERA/iBGT', 'BERA/LBGT'].includes(pair)
}

export const shouldReversePair = (pair: Pair) => {
  const pairSymbols = [pair.token0.symbol, pair.token1.symbol].join('/')
  return ['USDC.e/WBERA', 'WBERA/iBGT', 'WBERA/LBGT'].includes(pairSymbols)
}
