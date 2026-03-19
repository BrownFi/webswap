import JSBI from 'jsbi'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '../constants/chainId'
import { BIPS_BASE } from '../constants/types'
import { SwapCallbackState } from '../constants/enums'
import { Trade } from '../entities/trade'
import { Percent } from '../entities/fractions/percent'
import { Router } from '../router'
import { isContractWithPrice } from '../utils'
import {
  isZero,
  calculateGasMargin,
  getRouterContract,
  getRouterContractWithPrice,
} from './helpers'

export { SwapCallbackState }

/**
 * Builds the swap call arguments for a given trade.
 */
export function getSwapCallArguments(
  trade: Trade,
  account: string,
  allowedSlippage: number,
  recipient: string,
  chainId: number,
  library: any,
  deadline: BigNumber
): Array<{ parameters: { methodName: string; args: any[]; value: string }; contract: any }> {
  const version = trade.route.pairs[0].version
  const contract = isContractWithPrice(chainId, version)
    ? getRouterContractWithPrice(chainId, library, account)
    : getRouterContract(chainId, library, account, version)

  if (!contract) {
    return []
  }

  const swapMethods: any[] = []
  swapMethods.push(
    Router.swapCallParameters(
      trade,
      {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient: recipient,
        deadline: deadline.toNumber(),
      },
      chainId
    )
  )

  return swapMethods.map((parameters) => ({
    parameters,
    contract,
  }))
}

/**
 * Executes a swap contract call with gas estimation and error handling.
 */
export async function callSwapContract(
  trade: Trade,
  account: string,
  allowedSlippage: number,
  recipient: string,
  chainId: number,
  library: any,
  deadline: BigNumber
): Promise<any> {
  // Starknet swap path (not supported)
  if (chainId === ChainId.SN_SEPOLIA || chainId === ChainId.SN_MAIN) {
    throw new Error('Starknet swap not yet implemented in local SDK')
  }

  const swapCalls = getSwapCallArguments(trade, account, allowedSlippage, recipient, chainId, library, deadline)

  const estimatedCalls = await Promise.all(
    swapCalls.map(async (call, index) => {
      const { methodName, args, value } = call.parameters
      const { contract } = call

      // For V2, solidity pack would be appended here (Phase B)

      const options = !value || isZero(value) ? {} : { value }

      try {
        const gasEstimate = await contract.estimateGas[methodName](...args, options)
        return { call, gasEstimate }
      } catch (gasError) {
        // console.debug('Gas estimate failed, trying eth_call to extract error', call)
        try {
          await contract.callStatic[methodName](...args, options)
          // console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
          return {
            call,
            error: new Error('Unexpected issue with estimating the gas. Please try again.'),
          }
        } catch (callError: any) {
          // console.debug('Call threw error', call, callError)
          let errorMessage: string
          switch (callError.reason) {
            case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
            case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
              errorMessage =
                'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
              break
            default:
              errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
          }
          return { call, error: new Error(errorMessage) }
        }
      }
    })
  )

  const successfulEstimation = estimatedCalls.find(
    (el: any) => el?.gasEstimate
  ) as any

  if (!successfulEstimation) {
    const errorCalls = estimatedCalls.filter((call: any) => 'error' in call)
    if (errorCalls.length > 0) throw (errorCalls[errorCalls.length - 1] as any).error
    throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
  }

  const {
    call: { contract, parameters: { methodName, args, value } },
    gasEstimate,
  } = successfulEstimation

  try {
    const response = await contract[methodName](...args, {
      gasLimit: calculateGasMargin(gasEstimate),
      ...(value && !isZero(value) ? { value, from: account } : { from: account }),
    })
    return response
  } catch (error: any) {
    if (error?.code === 4001) {
      throw new Error('Transaction rejected.', { cause: error })
    } else {
      console.error('Swap failed', error, methodName, args, value)
      throw new Error(`Swap failed: ${error.message}`, { cause: error })
    }
  }
}
