import { BLOCKED_PRICE_IMPACT_NON_EXPERT } from '../constants'
import { CurrencyAmount, Fraction, JSBI, Percent, TokenAmount, Trade } from '@brownfi/sdk'
import { ALLOWED_PRICE_IMPACT_HIGH, ALLOWED_PRICE_IMPACT_LOW, ALLOWED_PRICE_IMPACT_MEDIUM } from '../constants'
import { Field } from '../state/swap/actions'
import { basisPointsToPercent, getTokenSymbol } from './index'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000)) // TODO: Liquidity Provider Fee
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: Trade | null
): { priceImpactWithoutFee: Percent | undefined; realizedLPFee: CurrencyAmount | undefined | null } {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
          ONE_HUNDRED_PERCENT
        )
      )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact?.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount?.raw || JSBI.BigInt(0)).quotient))

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct)
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function warningSeveritySlippage(slippage: number): 0 | 1 | 2 | 3 | 4 {
  if (slippage > 15) return 4
  if (slippage > 5) return 3
  if (slippage > 3) return 2
  if (slippage > 1) return 1
  return 0
}

export function formatExecutionPrice(trade?: Trade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice?.invert().toSignificant(6)} ${getTokenSymbol(
        trade.inputAmount?.currency,
        trade?.route?.chainId
      )} / ${getTokenSymbol(trade.outputAmount?.currency, trade?.route?.chainId)}`
    : `${trade.executionPrice?.toSignificant(6)} ${getTokenSymbol(
        trade.outputAmount?.currency,
        trade.route.chainId
      )} / ${getTokenSymbol(trade.inputAmount?.currency, trade.route.chainId)}`
}

const formatNumberString = (value: string) => value.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')

export function formatPrice(price: number) {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price > 1000 ? 0 : 2
  }).format(price)
  return formatNumberString(formattedNumber)
}

export function formatNumber(value: string | number | undefined | null, options?: Intl.NumberFormatOptions) {
  const number = Number(value || 0)
  const min = number > 1000 ? 1 : number > 1 ? 2 : 6
  if (options?.maximumFractionDigits && options.maximumFractionDigits < min) {
    options.maximumFractionDigits = min
  }
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: min,
    ...options
  }).format(number)
  return formatNumberString(formattedNumber)
}
