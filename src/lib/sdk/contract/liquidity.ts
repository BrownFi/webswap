import { isV3Like } from '../constants'
import JSBI from 'jsbi'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '../constants/chainId'
import { beraFeeOverrides } from 'utils/beraGas'
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
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { createReadClient } from '../rpc'
import { getFactoryAddress } from '../utils'

// Fetch Pyth price data from Hermes for the given tokens. Returns BOTH the blob
// the router self-updates the oracle with AND the parsed prices from the same
// response (lowercase-address -> USD price), so the caller can size the tx's
// slippage floors from the exact prices the contract will execute at.
async function fetchPythData(
  tokenAddresses: string[],
  chainId: number,
  version: number,
): Promise<{ updateData: `0x${string}`[]; prices: Record<string, number> }> {
  const empty = { updateData: [] as `0x${string}`[], prices: {} as Record<string, number> }
  const factoryAddr = getFactoryAddress(chainId, version)
  if (!factoryAddr) return empty

  const client = createReadClient(chainId)
  // token address (lowercase) -> Pyth feed id (lowercase, 0x-prefixed)
  const feedByAddr: Record<string, string> = {}
  const priceFeedIds = await Promise.all(
    tokenAddresses.map(async (addr) => {
      const id = (await client.readContract({
        address: factoryAddr as `0x${string}`,
        abi: [{ inputs: [{ name: 'token', type: 'address' }], name: 'priceFeedIds', outputs: [{ name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' }] as const,
        functionName: 'priceFeedIds',
        args: [addr as `0x${string}`],
      })) as string
      feedByAddr[addr.toLowerCase()] = id.toLowerCase()
      return id
    })
  )
  const pythUrl = new URL('https://hermes.pyth.network/v2/updates/price/latest?encoding=hex')
  priceFeedIds.forEach((id) => pythUrl.searchParams.append('ids[]', id))
  const response = await fetch(pythUrl.toString())
  if (!response.ok) throw new Error(`Pyth API error: HTTP ${response.status}`)
  const data = await response.json()

  const updateData = (data.binary.data as string[]).map((b: string) => `0x${b}`) as `0x${string}`[]

  // parsed prices (same response) -> feed id (0x, lowercase) -> price, then map to address
  const priceByFeed: Record<string, number> = {}
  for (const p of (data.parsed ?? []) as Array<{ id: string; price: { price: string; expo: number } }>) {
    const id = (p.id.startsWith('0x') ? p.id : `0x${p.id}`).toLowerCase()
    priceByFeed[id] = Number(p.price.price) * Math.pow(10, Number(p.price.expo))
  }
  const prices: Record<string, number> = {}
  for (const [addr, feed] of Object.entries(feedByAddr)) {
    if (priceByFeed[feed] > 0) prices[addr] = priceByFeed[feed]
  }
  return { updateData, prices }
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
    const response = await router[methodName](...args, { gasLimit: safeGasEstimate, ...beraFeeOverrides(chainId) })
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

  // (b) Same-snapshot pricing: fetch the live Hermes blob + parsed prices ONCE.
  // The router self-updates the on-chain oracle from THIS exact blob, so the
  // slippage floors below are derived from the SAME prices the contract will
  // execute at — eliminating preview-vs-execution drift. Only the MINS use these
  // prices; the desired/approved amounts are untouched, so the router can never
  // pull more than the user approved.
  const tokenAWrapped = (wrappedCurrency(currencyA, chainId)?.address ?? '').toLowerCase()
  const tokenBWrapped = (wrappedCurrency(currencyB, chainId)?.address ?? '').toLowerCase()
  let pythUpdateEncoded: `0x${string}` | null = null
  let hermesPrices: Record<string, number> = {}
  if (version >= 2) {
    const { updateData, prices } = await fetchPythData([tokenAWrapped, tokenBWrapped], chainId, version)
    hermesPrices = prices
    pythUpdateEncoded =
      updateData.length > 0
        ? encodeAbiParameters(parseAbiParameters('bytes[]'), [updateData])
        : encodeAbiParameters(parseAbiParameters('bytes[]'), [[]])
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

  // (b) Override the floors with the fresh-price optimal amounts so they track
  // what `mint()`/`_addLiquidity` computes from the blob: optimalB = amountA·pA/pB,
  // optimalA = amountB·pB/pA, then apply the slippage haircut. Skipped on the
  // first add (noLiquidity sets the price) or when a feed price is missing.
  const pA = hermesPrices[tokenAWrapped]
  const pB = hermesPrices[tokenBWrapped]
  if (!noLiquidity && version >= 2 && pA > 0 && pB > 0) {
    const slipNum = JSBI.BigInt(Math.max(0, 10000 - allowedSlippage))
    const TEN_K = JSBI.BigInt(10000)
    const optimalA = parseFloat(parsedAmountB.toExact()) * (pB / pA)
    const optimalB = parseFloat(parsedAmountA.toExact()) * (pA / pB)
    const rawA = JSBI.BigInt(Math.round(optimalA * 10 ** currencyA.decimals))
    const rawB = JSBI.BigInt(Math.round(optimalB * 10 ** currencyB.decimals))
    amountsMin[Field.CURRENCY_A] = JSBI.divide(JSBI.multiply(rawA, slipNum), TEN_K)
    amountsMin[Field.CURRENCY_B] = JSBI.divide(JSBI.multiply(rawB, slipNum), TEN_K)
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
      // V3 router takes an extra minLiquidity before `to`. We don't expose
      // a minimum LP value yet, so pass 0 to match the "no minimum" semantics.
      ...(isV3Like(version) ? ['0'] : []),
      account,
      deadline.toHexString(),
    ]

    // Append the Pyth updateData fetched once above (router pays the Pyth fee).
    if (version >= 2 && pythUpdateEncoded) {
      args.push(pythUpdateEncoded)
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

    // Router quirk: addLiquidity() runs a wrap-from-msg.value path when the
    // wrapped-native token (WETH[chainId]) is passed as tokenB — which reverts for
    // a token/token add (msg.value = 0, so the router can't fund the wrap). It
    // handles the wrapped token fine in the tokenA slot (plain transferFrom). So if
    // the wrapped token is currencyB, swap the two sides (token + its desired amount
    // + its min) so it lands in tokenA. The pair is identical either way — the router
    // sorts to token0/token1 internally. Verified on-chain: WETH-as-tokenB reverts,
    // WETH-as-tokenA succeeds. Fixes every chain (Bera/Linea/Arbitrum/Hyper).
    let tokenA = wrappedCurrency(currencyA, chainId)?.address ?? ''
    let tokenB = wrappedCurrency(currencyB, chainId)?.address ?? ''
    let desiredA = amountMaxA.raw.toString()
    let desiredB = amountMaxB.raw.toString()
    let minA = amountsMin[Field.CURRENCY_A].toString()
    let minB = amountsMin[Field.CURRENCY_B].toString()
    const wrappedNative = chainId ? WETH[chainId]?.address : undefined
    if (wrappedNative && tokenB.toLowerCase() === wrappedNative.toLowerCase()) {
      ;[tokenA, tokenB] = [tokenB, tokenA]
      ;[desiredA, desiredB] = [desiredB, desiredA]
      ;[minA, minB] = [minB, minA]
    }

    args = [
      tokenA,
      tokenB,
      desiredA,
      desiredB,
      minA,
      minB,
      // V3 router takes an extra minLiquidity before `to`; see note above.
      ...(isV3Like(version) ? ['0'] : []),
      account,
      deadline.toHexString(),
    ]

    // Append the Pyth updateData fetched once above (router pays the Pyth fee).
    if (version >= 2 && pythUpdateEncoded) {
      args.push(pythUpdateEncoded)
    }
    value = null
  }

  // V3 slippage protection on the LP output. Simulate with minLiquidity=0
  // (the slot we just reserved in args), read the expected LP, then enforce
  // `(1 - allowedSlippage)` on it. Pyth prices move between simulation and
  // inclusion, so this prevents the user from receiving fewer LP tokens than
  // they bargained for — same model `amountAMin` uses for the inputs.
  if (isV3Like(version)) {
    const isEthPair = currencyA === ETHER || currencyB === ETHER
    const methodName = isEthPair ? 'addLiquidityETH' : 'addLiquidity'
    // Slot of minLiquidity in args (right before `to`).
    const minLpIndex = isEthPair ? 4 : 6
    try {
      const sim = await router.callStatic[methodName](
        ...args,
        ...(value ? [{ value }] : [{}]),
      )
      // Return tuple: [amountA/Token, amountB/ETH, liquidity]
      const expectedLp: BigNumber = BigNumber.from(sim?.liquidity ?? sim?.[2] ?? 0)
      const slippageBpsSafe = Math.max(0, Math.min(10000, allowedSlippage))
      const minLp = expectedLp.mul(10000 - slippageBpsSafe).div(10000)
      args[minLpIndex] = minLp.toString()
    } catch (e) {
      // If simulation fails, the real tx will too — surface the same error
      // rather than silently shipping a 0-minimum tx that might mint bad LP.
      console.error('addLiquidity simulation failed:', e)
      throw e
    }
  }

  try {
    const estimatedGasLimit = await estimate(...args, ...(value ? [{ value }] : [{}]))
    const response = await method(...args, {
      ...(value ? { value } : {}),
      gasLimit: calculateGasMargin(estimatedGasLimit),
      ...beraFeeOverrides(chainId),
    })
    return response
  } catch (e) {
    console.error(e)
    throw e
  }
}
