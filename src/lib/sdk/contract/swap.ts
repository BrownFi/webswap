import { isV3Like } from '../constants'
import JSBI from 'jsbi'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '../constants/chainId'
import { BIPS_BASE } from '../constants/types'
import { SwapCallbackState } from '../constants/enums'
import { Trade } from '../entities/trade'
import { Percent } from '../entities/fractions/percent'
import { Router } from '../router'
import { isContractWithPrice, getFactoryAddress } from '../utils'
import {
  isZero,
  calculateGasMargin,
  getRouterContract,
  getRouterContractWithPrice,
} from './helpers'
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { createReadClient } from '../rpc'

export { SwapCallbackState }

// Build Pyth updateData for V2/V3 swap calls (router pays Pyth from its own balance)
async function buildSwapUpdateData(tokenAddresses: string[], chainId: number, version: number): Promise<string> {
  const factoryAddr = getFactoryAddress(chainId, version)
  if (!factoryAddr) return encodeAbiParameters(parseAbiParameters('bytes[]'), [[]])

  const client = createReadClient(chainId)
  const priceFeedIds = await Promise.all(
    tokenAddresses.map((addr) =>
      client.readContract({
        address: factoryAddr as `0x${string}`,
        abi: [{ inputs: [{ name: 'token', type: 'address' }], name: 'priceFeedIds', outputs: [{ name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' }] as const,
        functionName: 'priceFeedIds',
        args: [addr as `0x${string}`],
      })
    )
  )
  const pythUrl = new URL('https://hermes.pyth.network/v2/updates/price/latest?encoding=hex')
  priceFeedIds.forEach((id) => pythUrl.searchParams.append('ids[]', id))
  const response = await fetch(pythUrl.toString())
  if (!response.ok) throw new Error(`Pyth API error: HTTP ${response.status}`)
  const data = await response.json()
  const dataBytes = (data.binary.data as string[]).map((b: string) => `0x${b}`) as `0x${string}`[]
  return encodeAbiParameters(parseAbiParameters('bytes[]'), [dataBytes])
}

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

      // Append Pyth updateData for V2/V3 swaps (router pays Pyth from its own balance)
      const version = trade.route.pairs[0].version
      if (version >= 2) {
        const path = trade.route.path.map((token) => token.address)
        const updateData = await buildSwapUpdateData(path, chainId, version)
        args.push(updateData)
      }

      const options = !value || isZero(value) ? {} : { value }

      // V3: compute the slippage bound from a live simulation instead of the
      // stale getAmountsOut quote used at trade construction time. The
      // simulation pushes the same Pyth updateData the real tx will push, so
      // the router/pair see matching oracle prices and the bound is tight
      // against the actual swap math (prevents INVALID_INVENTORY from a
      // cross-block Pyth drift).
      if (isV3Like(version)) {
        try {
          const isExactIn = methodName.startsWith('swapExact')
          const isETHIn = methodName.includes('ETHForTokens')
          const limitIdx = isExactIn ? (isETHIn ? 0 : 1) : 1
          const MAX_UINT256 =
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

          const simArgs = [...args]
          simArgs[limitIdx] = isExactIn ? '0' : MAX_UINT256

          const amounts: any = await contract.callStatic[methodName](...simArgs, options)
          const slippageBps = Math.max(0, Math.min(10000, allowedSlippage))

          if (isExactIn) {
            const expectedOut = BigNumber.from(amounts[amounts.length - 1])
            args[limitIdx] = expectedOut.mul(10000 - slippageBps).div(10000).toString()
          } else {
            const expectedIn = BigNumber.from(amounts[0])
            args[limitIdx] = expectedIn.mul(10000 + slippageBps).div(10000).toString()
          }
        } catch {
          // Pre-sim failed (transient RPC/Pyth blip, or a genuine revert).
          // `simArgs` was a throwaway COPY — `args[limitIdx]` still holds the
          // original slippage-protected bound from trade construction
          // (minimumAmountOut / maximumAmountIn), so it is safe to proceed; we
          // simply skip the tighter re-derived bound for this attempt. We
          // intentionally do NOT re-throw: a transient simulation failure must
          // not block a swap whose constructed bound is already valid. The
          // gas-estimation + callStatic below still surface any genuine revert
          // reason to the user.
        }
      }

      try {
        const gasEstimate = await contract.estimateGas[methodName](...args, options)
        return { call, gasEstimate }
      } catch (gasError) {
        try {
          await contract.callStatic[methodName](...args, options)
          return {
            call,
            error: new Error('Unexpected issue with estimating the gas. Please try again.'),
          }
        } catch (callError: any) {
          // Defer to the shared decoder so revert messages stay consistent
          // between the pre-simulation path (here) and the post-submission
          // catch in pages/Swap/index.tsx. Previously this branch duplicated
          // the registry inline and drifted out of sync — e.g. the
          // INVALID_INVENTORY hint said "try smaller amount" when the actual
          // cause is the trade direction worsening the pool's inventory skew
          // (a smaller amount in the same direction often still reverts).
          const { decodeContractError } = await import('../../../utils/decodeContractError')
          const decoded =
            decodeContractError(callError, 'The transaction cannot succeed. Try adjusting amount or slippage.') ??
            'The transaction cannot succeed. Try adjusting amount or slippage.'
          return { call, error: new Error(decoded) }
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
