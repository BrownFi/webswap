import invariant from 'tiny-invariant'
import { TradeType } from './constants/enums'
import { ETHER } from './entities/currency'
import { Trade } from './entities/trade'
import { Percent } from './entities/fractions/percent'
import { CurrencyAmount } from './entities/fractions/currencyAmount'
import { validateAndParseAddress } from './utils'
import { isContractWithPrice } from './utils'

function toHex(currencyAmount: CurrencyAmount): string {
  return '0x' + currencyAmount.raw.toString(16)
}

const ZERO_HEX = '0x0'

export interface SwapParameters {
  methodName: string
  args: (string | string[])[]
  value: string
}

export interface TradeOptions {
  allowedSlippage: Percent
  recipient: string
  feeOnTransfer?: boolean
  ttl?: number
  deadline?: number
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  deadline: number
}

export class Router {
  private constructor() {}

  static swapCallParameters(trade: Trade, options: TradeOptions | TradeOptionsDeadline, chainId?: number): SwapParameters {
    const version = trade.route.pairs[0].version
    const etherIn = trade?.inputAmount?.currency === ETHER
    const etherOut = trade?.outputAmount?.currency === ETHER
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(!('ttl' in options) || (options as any).ttl > 0, 'TTL')

    const to = validateAndParseAddress(options.recipient, chainId as any)
    const amountIn = trade?.inputAmount
      ? toHex(trade.maximumAmountIn(options.allowedSlippage))
      : '0'
    const amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage))
    const path = trade.route.path.map((token) => token.address)
    const deadline =
      'ttl' in options
        ? '0x' + (Math.floor(new Date().getTime() / 1000) + (options as any).ttl).toString(16)
        : '0x' + (options as TradeOptionsDeadline).deadline.toString(16)
    const useFeeOnTransfer = Boolean(options.feeOnTransfer)
    const priceUpdate = trade.priceUpdate
    const updateFee = +trade.updateFee

    let methodName: string
    let args: (string | string[])[]
    let value: string

    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (isContractWithPrice(chainId!, version)) {
          if (etherIn) {
            methodName = useFeeOnTransfer
              ? 'swapExactETHForTokensSupportingFeeOnTransferTokensWithPrice'
              : 'swapExactETHForTokensWithPrice'
            args = [amountOut, path, to, deadline, priceUpdate]
            value = trade?.inputAmount
              ? '0x' + (+trade.maximumAmountIn(options.allowedSlippage).raw + updateFee).toString(16)
              : '0'
          } else if (etherOut) {
            methodName = useFeeOnTransfer
              ? 'swapExactTokensForETHSupportingFeeOnTransferTokensWithPrice'
              : 'swapExactTokensForETHWithPrice'
            args = [amountIn, amountOut, path, to, deadline, priceUpdate]
            value = '0x' + updateFee.toString(16)
          } else {
            methodName = useFeeOnTransfer
              ? 'swapExactTokensForTokensSupportingFeeOnTransferTokensWithPrice'
              : 'swapExactTokensForTokensWithPrice'
            args = [amountIn, amountOut, path, to, deadline, priceUpdate]
            value = '' + updateFee
          }
        } else {
          if (etherIn) {
            methodName = useFeeOnTransfer
              ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
              : 'swapExactETHForTokens'
            args = [amountOut, path, to, deadline]
            value = amountIn
          } else if (etherOut) {
            methodName = useFeeOnTransfer
              ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
              : 'swapExactTokensForETH'
            args = [amountIn, amountOut, path, to, deadline]
            value = ZERO_HEX
          } else {
            methodName = useFeeOnTransfer
              ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
              : 'swapExactTokensForTokens'
            args = [amountIn, amountOut, path, to, deadline]
            value = ZERO_HEX
          }
        }
        break

      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (isContractWithPrice(chainId!, version)) {
          if (etherIn) {
            methodName = 'swapETHForExactTokensWithPrice'
            args = [amountOut, path, to, deadline, priceUpdate]
            value = trade?.inputAmount
              ? '0x' + (+trade.maximumAmountIn(options.allowedSlippage).raw + updateFee).toString(16)
              : '0'
          } else if (etherOut) {
            methodName = 'swapTokensForExactETHWithPrice'
            args = [amountOut, amountIn, path, to, deadline, priceUpdate]
            value = '' + updateFee
          } else {
            methodName = 'swapTokensForExactTokensWithPrice'
            args = [amountOut, amountIn, path, to, deadline, priceUpdate]
            value = '' + updateFee
          }
        } else {
          if (etherIn) {
            methodName = 'swapETHForExactTokens'
            args = [amountOut, path, to, deadline]
            value = amountIn
          } else if (etherOut) {
            methodName = 'swapTokensForExactETH'
            args = [amountOut, amountIn, path, to, deadline]
            value = ZERO_HEX
          } else {
            methodName = 'swapTokensForExactTokens'
            args = [amountOut, amountIn, path, to, deadline]
            value = ZERO_HEX
          }
        }
        break

      default:
        methodName = ''
        args = []
        value = ZERO_HEX
    }

    return { methodName, args, value }
  }
}
