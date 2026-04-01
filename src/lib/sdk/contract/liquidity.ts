import JSBI from 'jsbi'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '../constants/chainId'
import { Field, ApprovalState } from '../constants/enums'
import { WETH } from '../constants/tokens'
import { Token } from '../entities/token'
import { Currency, ETHER } from '../entities/currency'
import { CurrencyAmount } from '../entities/fractions/currencyAmount'
import { TokenAmount } from '../entities/fractions/tokenAmount'
import {
  calculateGasMargin,
  calculateSlippageAmount,
  getRouterContract,
} from './helpers'
import { createPublicClient, http, encodeAbiParameters, parseAbiParameters } from 'viem'
import { RPC_URLS } from '../constants/addresses'
import { getFactoryAddress } from '../utils'

// Fetch Pyth price data from Hermes for the given tokens
async function fetchPythData(tokenAddresses: string[], chainId: number, version: number): Promise<`0x${string}`[]> {
  const factoryAddr = getFactoryAddress(chainId, version)
  if (!factoryAddr) return []

  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
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
  return (data.binary.data as string[]).map((b: string) => `0x${b}`) as `0x${string}`[]
}

// Wraps a currency for liquidity operations (returns undefined if not wrappable)
function wrappedCurrency(currency: Currency, chainId: number): Token | undefined {
  return chainId && currency === ETHER
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined
}

// Applies slippage to a BigNumber value
function applySlippageNumber(value: BigNumber, slippage: number): BigNumber {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  // Note: in the original bundle, slippage is zeroed out for safety
  slippage = 0
  const numerator = BigNumber.from(10000 + slippage)
  const denominator = BigNumber.from(10000)
  return value.mul(numerator).div(denominator)
}

// Applies slippage to a CurrencyAmount
function applySlippageCurrency(value: CurrencyAmount, slippage: number): TokenAmount {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  // Note: in the original bundle, slippage is zeroed out for safety
  slippage = 0
  const amount = parseFloat(value.toExact()) * (1 + slippage / 10000)
  return new TokenAmount(
    value.currency as Token,
    JSBI.BigInt(Math.round(amount * Math.pow(10, value.currency.decimals)))
  )
}

export interface SignatureData {
  v: number
  r: string
  s: string
  deadline: number
}

export interface ParsedAmounts {
  [Field.CURRENCY_A]?: CurrencyAmount
  [Field.CURRENCY_B]?: CurrencyAmount
  [Field.LIQUIDITY_PERCENT]?: any
  [Field.LIQUIDITY]?: TokenAmount
  currencyA?: Currency
  currencyB?: Currency
}

/**
 * Remove liquidity from a pair. Handles ETH pairs, permit-based removal,
 * and fee-on-transfer tokens.
 */
export async function removeLiquidity(
  chainId: number,
  library: any,
  account: string,
  parsedAmounts: ParsedAmounts,
  deadline: BigNumber,
  allowedSlippage: number,
  approval: ApprovalState,
  signatureData: SignatureData | null,
  version: number
): Promise<any> {
  if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies')

  const currencyAmountA = parsedAmounts[Field.CURRENCY_A]
  const currencyAmountB = parsedAmounts[Field.CURRENCY_B]
  const currencyA = parsedAmounts.currencyA
  const currencyB = parsedAmounts.currencyB
  const liquidityAmount = parsedAmounts[Field.LIQUIDITY]

  if (!liquidityAmount) throw new Error('missing liquidity amount')
  if (!currencyAmountA || !currencyAmountB) {
    throw new Error('missing currency amounts')
  }

  const tokenA = wrappedCurrency(currencyA!, chainId)
  const tokenB = wrappedCurrency(currencyB!, chainId)

  // Starknet path (Phase B)
  if (chainId === ChainId.SN_MAIN || chainId === ChainId.SN_SEPOLIA) {
    throw new Error('Starknet removeLiquidity not yet implemented in local SDK')
  }

  const router = getRouterContract(chainId, library, account, version)
  const amountsMin = {
    [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
    [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
  }

  if (!currencyA || !currencyB) throw new Error('missing tokens')
  const currencyBIsETH = currencyB === ETHER
  const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
  if (!tokenA || !tokenB) throw new Error('could not wrap')

  let methodNames: string[]
  let args: any[]

  if (approval === ApprovalState.APPROVED) {
    if (oneCurrencyIsETH) {
      methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
      args = [
        currencyBIsETH ? tokenA.address : tokenB.address,
        liquidityAmount.raw.toString(),
        amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
        amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
        account,
        deadline.toHexString(),
      ]
    } else {
      methodNames = ['removeLiquidity']
      args = [
        tokenA.address,
        tokenB.address,
        liquidityAmount.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ]
    }
  } else if (signatureData !== null) {
    if (oneCurrencyIsETH) {
      methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
      args = [
        currencyBIsETH ? tokenA.address : tokenB.address,
        liquidityAmount.raw.toString(),
        amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
        amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
        account,
        signatureData.deadline,
        false,
        signatureData.v,
        signatureData.r,
        signatureData.s,
      ]
    } else {
      methodNames = ['removeLiquidityWithPermit']
      args = [
        tokenA.address,
        tokenB.address,
        liquidityAmount.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        signatureData.deadline,
        false,
        signatureData.v,
        signatureData.r,
        signatureData.s,
      ]
    }
  } else {
    throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
  }

  const safeGasEstimates = await Promise.all(
    methodNames.map((methodName) =>
      router.estimateGas[methodName](...args)
        .then(calculateGasMargin)
        .catch((error: any) => {
          console.error('estimateGas failed', methodName, args, error)
          return undefined
        })
    )
  )

  const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
    (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate)
  )

  if (indexOfSuccessfulEstimation === -1) {
    console.error('This transaction would fail. Please contact support.')
    return undefined
  }

  const methodName = methodNames[indexOfSuccessfulEstimation]
  const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

  try {
    const response = await router[methodName](...args, { gasLimit: safeGasEstimate })
    return response
  } catch (e) {
    console.error('removeLiquidity transaction failed', e)
    return null
  }
}

/**
 * Add liquidity to a pair. Handles ETH pairs and V2 solidity pack.
 */
export async function addLiquidity(
  chainId: number,
  library: any,
  account: string,
  parsedAmountA: CurrencyAmount | undefined,
  parsedAmountB: CurrencyAmount | undefined,
  exactFieldInput: Field | undefined,
  deadline: BigNumber | undefined,
  noLiquidity: boolean,
  allowedSlippage: number,
  version: number
): Promise<any> {
  if (!chainId || !library || !account) return

  // Starknet path (Phase B)
  if (chainId === ChainId.SN_SEPOLIA || chainId === ChainId.SN_MAIN) {
    throw new Error('Starknet addLiquidity not yet implemented in local SDK')
  }

  const router = getRouterContract(chainId, library, account, version)
  const currencyA = parsedAmountA?.currency
  const currencyB = parsedAmountB?.currency

  if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
    return
  }

  const shouldExactAmountInput = false
  const amountsMin = {
    [Field.CURRENCY_A]: calculateSlippageAmount(
      parsedAmountA,
      noLiquidity || (shouldExactAmountInput && exactFieldInput === Field.CURRENCY_A) ? 0 : allowedSlippage
    )[0],
    [Field.CURRENCY_B]: calculateSlippageAmount(
      parsedAmountB,
      noLiquidity || (shouldExactAmountInput && exactFieldInput === Field.CURRENCY_B) ? 0 : allowedSlippage
    )[0],
  }

  let estimate: any
  let method: any
  let args: any[]
  let value: BigNumber | null

  if (currencyA === ETHER || currencyB === ETHER) {
    const tokenBIsETH = currencyB === ETHER
    estimate = router.estimateGas.addLiquidityETH
    method = router.addLiquidityETH
    value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())

    let amountMaxOther: CurrencyAmount = tokenBIsETH ? parsedAmountA : parsedAmountB

    if (exactFieldInput === Field.CURRENCY_A && currencyA === ETHER) {
      amountMaxOther = applySlippageCurrency(parsedAmountB, allowedSlippage)
    } else if (exactFieldInput === Field.CURRENCY_B && currencyB === ETHER) {
      amountMaxOther = applySlippageCurrency(parsedAmountA, allowedSlippage)
    } else if (exactFieldInput) {
      value = applySlippageNumber(value, Math.min(allowedSlippage, 500))
    }

    args = [
      wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '',
      amountMaxOther.raw.toString(),
      amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
      amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
      account,
      deadline.toHexString(),
    ]

    // Append Pyth updateData for V2/V3 (router pays Pyth fee from its own balance)
    if (version >= 2) {
      const tokenAAddr = wrappedCurrency(currencyA, chainId)?.address ?? ''
      const tokenBAddr = wrappedCurrency(currencyB, chainId)?.address ?? ''
      const dataBytes = await fetchPythData([tokenAAddr, tokenBAddr], chainId, version)
      const updateData = dataBytes.length > 0
        ? encodeAbiParameters(parseAbiParameters('bytes[]'), [dataBytes])
        : encodeAbiParameters(parseAbiParameters('bytes[]'), [[]])
      args.push(updateData)
    }
  } else {
    estimate = router.estimateGas.addLiquidity
    method = router.addLiquidity

    let amountMaxA: CurrencyAmount = parsedAmountA
    let amountMaxB: CurrencyAmount = parsedAmountB

    if (exactFieldInput === Field.CURRENCY_A) {
      amountMaxB = applySlippageCurrency(parsedAmountB, allowedSlippage)
    }
    if (exactFieldInput === Field.CURRENCY_B) {
      amountMaxA = applySlippageCurrency(parsedAmountA, allowedSlippage)
    }

    args = [
      wrappedCurrency(currencyA, chainId)?.address ?? '',
      wrappedCurrency(currencyB, chainId)?.address ?? '',
      amountMaxA.raw.toString(),
      amountMaxB.raw.toString(),
      amountsMin[Field.CURRENCY_A].toString(),
      amountsMin[Field.CURRENCY_B].toString(),
      account,
      deadline.toHexString(),
    ]

    // Append Pyth updateData for V2/V3 (router pays Pyth fee from its own balance)
    if (version >= 2) {
      const tokenAAddr = wrappedCurrency(currencyA, chainId)?.address ?? ''
      const tokenBAddr = wrappedCurrency(currencyB, chainId)?.address ?? ''
      const dataBytes = await fetchPythData([tokenAAddr, tokenBAddr], chainId, version)
      const updateData = dataBytes.length > 0
        ? encodeAbiParameters(parseAbiParameters('bytes[]'), [dataBytes])
        : encodeAbiParameters(parseAbiParameters('bytes[]'), [[]])
      args.push(updateData)
    }
    value = null
  }

  try {
    const estimatedGasLimit = await estimate(...args, ...(value ? [{ value }] : [{}]))
    const response = await method(...args, {
      ...(value ? { value } : {}),
      gasLimit: calculateGasMargin(estimatedGasLimit),
    })
    return response
  } catch (e) {
    console.error(e)
    throw e
  }
}
