import { Currency } from '@brownfi/sdk'
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
    // HyperEVM — kHYPE is a liquid-staking HYPE derivative (Kinetiq), so
    // the conventional display is "kHYPE per HYPE" (LST priced in
    // underlying). V3 subgraph confirms quoteTokenIndex=0 → kHYPE is
    // base, HYPE is quote. Token0 of the pair is WHYPE which
    // getTokenSymbol unwraps to "HYPE" on HL, so the raw label here is
    // "HYPE/kHYPE".
    'HYPE/kHYPE',
    // Sei — WSEI doesn't unwrap to a friendly display symbol in
    // getTokenSymbol, so match the raw wrapped form here.
    'USDC/WSEI',
  ].includes(pairSymbols)
}

/**
 * Display order (base/quote) for a pair. V3 pools carry the AUTHORITATIVE
 * `quoteTokenIndex` from the indexer — 0 means token0 is the quote, so we
 * reverse to show base (token1) first; 1 means token0 is the base (no
 * reverse). When it's absent (V2 constant-product pools have no oracle
 * base/quote, or the data didn't load) we fall back to the symbol whitelist.
 * This is the robust source of truth — the whitelist can't keep up with new
 * pools (e.g. WBTC/WETH official = WETH/WBTC, USDC.e/HONEY = HONEY/USDC.e).
 */
export const shouldReverseDisplay = (
  currency0: Currency | undefined,
  currency1: Currency | undefined,
  chainId: number | undefined,
  quoteTokenIndex?: number | null,
): boolean => {
  if (quoteTokenIndex === 0) return true
  if (quoteTokenIndex === 1) return false
  const pairSymbols = [getTokenSymbol(currency0, chainId), getTokenSymbol(currency1, chainId)].join('/')
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
  quoteTokenIndex?: number | null,
): [string, string] => {
  // Same base/quote rule as the display (quoteTokenIndex for V3, whitelist
  // fallback) so /add and /remove URLs match the pool name + balance bar.
  return shouldReverseDisplay(currency0, currency1, chainId, quoteTokenIndex)
    ? [currencyId(currency1), currencyId(currency0)]
    : [currencyId(currency0), currencyId(currency1)]
}
