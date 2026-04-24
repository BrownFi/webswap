/**
 * V3 Zap — direct contract calls to BrownFiV3Router02.
 * Replaces Kyber API for zap operations on V3 chains.
 */
import { ChainId, WETH } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { createPublicClient, http, encodeAbiParameters, parseAbiParameters } from 'viem'
import { getRouterAddress, getFactoryAddress } from 'lib/sdk/utils'
import { ROUTER_ADDRESS_V3, RPC_URLS } from 'lib/sdk/constants/addresses'

// V3 Router ABI — zap + quote functions only (updated for the new V3 router:
// zapIn/zapInETH added `minLiquidity`, zapOut/zapOutETH added `updateData`).
const V3_ZAP_ABI = [
  { inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }], name: 'quoteAmountsOutWithUpdate', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOther', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'amountOtherMin', type: 'uint256' }, { name: 'minLiquidity', type: 'uint256' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }, { name: 'updateData', type: 'bytes' }], name: 'zapIn', outputs: [{ name: 'liquidity', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'token', type: 'address' }, { name: 'amountTokenMin', type: 'uint256' }, { name: 'minLiquidity', type: 'uint256' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }, { name: 'updateData', type: 'bytes' }], name: 'zapInETH', outputs: [{ name: 'liquidity', type: 'uint256' }], stateMutability: 'payable', type: 'function' },
  { inputs: [{ name: 'tokenA', type: 'address' }, { name: 'tokenB', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'liquidity', type: 'uint256' }, { name: 'amountMin', type: 'uint256' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }, { name: 'updateData', type: 'bytes' }], name: 'zapOut', outputs: [{ name: 'amount', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'token', type: 'address' }, { name: 'liquidity', type: 'uint256' }, { name: 'amountMin', type: 'uint256' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }, { name: 'updateData', type: 'bytes' }], name: 'zapOutETH', outputs: [{ name: 'amountETH', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
] as const

/**
 * Check if V3 Zap is supported on a chain.
 */
export function isV3ZapSupported(chainId?: ChainId | null, version?: number): boolean {
  if (!chainId || version !== 3) return false
  return !!ROUTER_ADDRESS_V3[chainId]
}

/**
 * Get estimated output amount for half the zap input (for slippage calculation).
 * Uses quoteAmountsOutWithUpdate (simulate) so the router can apply a fresh Pyth
 * update — the legacy view getAmountOut reverts with StalePrice on the new V3
 * deployment.
 */
export async function getV3ZapEstimate(
  chainId: ChainId,
  tokenIn: string,
  tokenOther: string,
  amountIn: string,
  slippageBips: number,
): Promise<{ amountOut: bigint; amountOtherMin: bigint }> {
  const routerAddress = getRouterAddress(chainId, 3)
  if (!routerAddress) throw new Error('V3 router not deployed on this chain')

  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const halfAmount = BigInt(amountIn) / 2n

  const updateData = await buildV3UpdateData([tokenIn, tokenOther], chainId)

  const { result } = await client.simulateContract({
    address: routerAddress as `0x${string}`,
    abi: V3_ZAP_ABI,
    functionName: 'quoteAmountsOutWithUpdate',
    args: [halfAmount, [tokenIn as `0x${string}`, tokenOther as `0x${string}`], updateData as `0x${string}`],
  })

  const amountOut = result[result.length - 1]

  // Apply slippage: amountOtherMin = amountOut * (10000 - slippage) / 10000
  const amountOtherMin = (amountOut * BigInt(10000 - slippageBips)) / 10000n

  return { amountOut, amountOtherMin }
}

/**
 * Build Pyth updateData for V3 zap.
 * Fetches price feed IDs from factory, gets Pyth data from Hermes API.
 */
export async function buildV3UpdateData(
  tokenAddresses: string[],
  chainId: ChainId,
): Promise<string> {
  const factoryAddress = getFactoryAddress(chainId, 3)
  if (!factoryAddress) {
    // If no V3 factory, return empty encoded bytes
    return encodeAbiParameters(parseAbiParameters('bytes[]'), [[]])
  }

  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const factoryAbi = [{
    inputs: [{ name: 'token', type: 'address' }],
    name: 'priceFeedIds',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  }] as const

  const priceFeedIds = await Promise.all(
    tokenAddresses.map((addr) =>
      client.readContract({
        address: factoryAddress as `0x${string}`,
        abi: factoryAbi,
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

// Helper: get ethers signer
function getSigner(library: any, account: string) {
  return typeof library?.getSigner === 'function' ? library.getSigner(account) : undefined
}

// Helper: gas margin (30%)
function addGasMargin(gas: BigNumber): BigNumber {
  return gas.mul(130).div(100)
}

/**
 * Execute V3 Zap In transaction.
 */
export async function executeV3ZapIn({
  chainId,
  library,
  account,
  tokenIn,
  tokenOther,
  amountIn,
  amountOtherMin,
  deadline,
  updateData,
  isNativeETH,
  slippageBps = 50,
}: {
  chainId: ChainId
  library: any
  account: string
  tokenIn: string
  tokenOther: string
  amountIn: string
  amountOtherMin: string
  deadline: BigNumber
  updateData: string
  isNativeETH: boolean
  slippageBps?: number
}): Promise<TransactionResponse> {
  const routerAddress = getRouterAddress(chainId, 3)
  const signer = getSigner(library, account)
  if (!signer) throw new Error('No signer available')

  const router = new Contract(routerAddress, V3_ZAP_ABI, signer)
  const slippageSafe = Math.max(0, Math.min(10000, slippageBps))
  const applySlip = (expected: BigNumber) => expected.mul(10000 - slippageSafe).div(10000)

  if (isNativeETH) {
    // zapInETH(token, amountTokenMin, minLiquidity, to, deadline, updateData) payable
    // Simulate with minLiquidity=0 to learn the actual LP out, then enforce slippage.
    const simLp: BigNumber = await router.callStatic.zapInETH(
      tokenOther, amountOtherMin, '0', account, deadline.toHexString(), updateData,
      { value: amountIn },
    )
    const minLp = applySlip(BigNumber.from(simLp)).toString()
    const gas = await router.estimateGas.zapInETH(
      tokenOther, amountOtherMin, minLp, account, deadline.toHexString(), updateData,
      { value: amountIn }
    )
    return router.zapInETH(
      tokenOther, amountOtherMin, minLp, account, deadline.toHexString(), updateData,
      { value: amountIn, gasLimit: addGasMargin(gas) }
    )
  } else {
    // zapIn(tokenIn, tokenOther, amountIn, amountOtherMin, minLiquidity, to, deadline, updateData)
    const simLp: BigNumber = await router.callStatic.zapIn(
      tokenIn, tokenOther, amountIn, amountOtherMin, '0', account, deadline.toHexString(), updateData,
    )
    const minLp = applySlip(BigNumber.from(simLp)).toString()
    const gas = await router.estimateGas.zapIn(
      tokenIn, tokenOther, amountIn, amountOtherMin, minLp, account, deadline.toHexString(), updateData,
    )
    return router.zapIn(
      tokenIn, tokenOther, amountIn, amountOtherMin, minLp, account, deadline.toHexString(), updateData,
      { gasLimit: addGasMargin(gas) }
    )
  }
}

/**
 * Execute V3 Zap Out transaction.
 */
export async function executeV3ZapOut({
  chainId,
  library,
  account,
  tokenA,
  tokenB,
  tokenOut,
  liquidity,
  amountMin,
  deadline,
  isNativeETH,
}: {
  chainId: ChainId
  library: any
  account: string
  tokenA: string
  tokenB: string
  tokenOut: string
  liquidity: string
  amountMin: string
  deadline: BigNumber
  isNativeETH: boolean
}): Promise<TransactionResponse> {
  const routerAddress = getRouterAddress(chainId, 3)
  const signer = getSigner(library, account)
  if (!signer) throw new Error('No signer available')

  const router = new Contract(routerAddress, V3_ZAP_ABI, signer)

  // zapOut/zapOutETH now require Pyth updateData — build a fresh blob for both tokens.
  const updateData = await buildV3UpdateData([tokenA, tokenB], chainId)

  if (isNativeETH) {
    // zapOutETH(token, liquidity, amountMin, to, deadline, updateData)
    // token = the non-ETH token in the pair
    const token = tokenA === WETH[chainId]?.address ? tokenB : tokenA
    const gas = await router.estimateGas.zapOutETH(token, liquidity, amountMin, account, deadline.toHexString(), updateData)
    return router.zapOutETH(token, liquidity, amountMin, account, deadline.toHexString(), updateData, { gasLimit: addGasMargin(gas) })
  } else {
    // zapOut(tokenA, tokenB, tokenOut, liquidity, amountMin, to, deadline, updateData)
    const gas = await router.estimateGas.zapOut(tokenA, tokenB, tokenOut, liquidity, amountMin, account, deadline.toHexString(), updateData)
    return router.zapOut(tokenA, tokenB, tokenOut, liquidity, amountMin, account, deadline.toHexString(), updateData, { gasLimit: addGasMargin(gas) })
  }
}
