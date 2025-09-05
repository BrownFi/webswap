import { Pair } from '@brownfi/sdk'

export const shouldReverse = (pair: string) => {
  return ['USDC.e/BERA', 'USDT/kHYPE', 'USD₮0/kHYPE'].includes(pair)
}

export const shouldReversePair = (pair: Pair) => {
  const pairSymbols = [pair.token0.symbol, pair.token1.symbol].join('/')
  return ['USDC.e/WBERA', 'USDT/kHYPE', 'USD₮0/kHYPE'].includes(pairSymbols)
}
