import { Currency, Pair } from '@brownfi/sdk'
import { getTokenSymbol } from 'utils'
import { currencyId } from 'utils/currencyId'

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

// Returns [baseId, quoteId] in display order so /add and /remove URLs match
// the page title (which is base/quote). Callers pass currencies already
// unwrapped (ETHER vs Token) since that's what getTokenSymbol needs to match
// the whitelist's entries (e.g. 'USDC.e/BERA' uses BERA from ETHER unwrap).
export const orderedCurrencyIds = (
  currency0: Currency,
  currency1: Currency,
  chainId: number | undefined,
): [string, string] => {
  const pairSymbols = [getTokenSymbol(currency0, chainId), getTokenSymbol(currency1, chainId)].join('/')
  return shouldReverse(pairSymbols)
    ? [currencyId(currency1), currencyId(currency0)]
    : [currencyId(currency0), currencyId(currency1)]
}
