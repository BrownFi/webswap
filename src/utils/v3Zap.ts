import { isV3Like } from '@brownfi/sdk'
/**
 * V3 Zap primitives — quote estimate, Pyth updateData builder, and calldata
 * builders for the BrownFi V3 router. The execution layer is the native zap
 * adapter (services/aggregators/native/zapAdapter); these helpers stay here
 * because they're also useful standalone (zap estimate previews, etc.).
 */
import { ChainId, WETH } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { createPublicClient, http, encodeAbiParameters, parseAbiParameters } from 'viem'
import { getRouterAddress, getFactoryAddress } from 'lib/sdk/utils'
import { routerV3Gen, zapV3Gen, RPC_URLS } from 'lib/sdk/constants/addresses'

// On v3-final deployments zap entrypoints live on a separate BrownFiV3Zap
// contract. On older deployments the router still hosts them, so we fall
// back to the router address when no dedicated zap is registered. Exported
// because the zap aggregator adapter needs this same address to surface as
// the approval spender (callers approve the zap contract, not the router).
export function getV3ZapAddress(chainId: ChainId, version: number): string | undefined {
  // Pilot (v3) has no separate zap → falls back to its router. Official (v4)
  // has a dedicated zap contract.
  return zapV3Gen(version)[chainId] || routerV3Gen(version)[chainId]
}

// V3 Router/Zap ABI. Quote function is on the router; zap entrypoints are on
// the dedicated Zap contract (v3-final split — see getV3ZapAddress). The quote
// MUST be `quoteAmountsOutWithUpdate(uint, address[], bytes)`: the pool's
// priceOf() reverts StalePrice() if the on-chain Pyth price is older than the
// factory's minPriceAge (~60s), so a plain view-only getAmountsOut reverts at
// quote time on slow feeds (e.g. USDC). The WithUpdate variant applies a fresh
// Pyth update in-call (read-only via eth_call). (Regression note: commit
// 2362674 wrongly swapped this to plain getAmountsOut — restored here.)
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
  if (!chainId || !isV3Like(version)) return false
  return !!routerV3Gen(version as number)[chainId]
}

/**
 * Get estimated output amount for half the zap input (for slippage calculation).
 * Uses quoteAmountsOutWithUpdate so the router applies a fresh Pyth price in the
 * quote (priceOf reverts StalePrice past minPriceAge ~60s — a plain getAmountsOut
 * can't quote a slow feed like USDC). updateData = fresh Hermes blob; called
 * read-only via eth_call. Write-side zapIn still takes its own updateData.
 */
export async function getV3ZapEstimate(
  chainId: ChainId,
  tokenIn: string,
  tokenOther: string,
  amountIn: string,
  slippageBips: number,
  version: number,
): Promise<{ amountOut: bigint; amountOtherMin: bigint }> {
  const routerAddress = getRouterAddress(chainId, version)
  if (!routerAddress) throw new Error('V3 router not deployed on this chain')

  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const halfAmount = BigInt(amountIn) / 2n

  const updateData = await buildV3UpdateData([tokenIn, tokenOther], chainId, version)
  // quoteAmountsOutWithUpdate is nonpayable on-chain (it applies the Pyth
  // update), but we call it read-only via eth_call. viem types readContract's
  // return as `never` for non-view fns, so cast the decoded amounts array.
  const result = (await client.readContract({
    address: routerAddress as `0x${string}`,
    abi: V3_ZAP_ABI,
    functionName: 'quoteAmountsOutWithUpdate',
    args: [halfAmount, [tokenIn as `0x${string}`, tokenOther as `0x${string}`], updateData as `0x${string}`],
  })) as readonly bigint[]

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
  version: number,
): Promise<string> {
  const factoryAddress = getFactoryAddress(chainId, version)
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

  // Bail early if ANY token lacks a registered Pyth feed (factory returns
  // 0x0…0). Sending that to Pyth Hermes either 4xx's or returns malformed
  // data, which kicks React Query into a 30+ second retry loop before
  // silently giving up. Surface a typed error so the caller can show a
  // useful message instead of an indefinite spinner. Also note: even if
  // the FE worked around this, the on-chain V3 pool would still revert on
  // swap — the contract needs the Pyth feed to price every token.
  const missingIdx = priceFeedIds.findIndex((id) => !id || /^0x0+$/.test(id))
  if (missingIdx !== -1) {
    const err: any = new Error(
      `Token ${tokenAddresses[missingIdx]} has no Pyth price feed registered on the V3 factory. ` +
      `Admin must call setOracleOf(token, feedId) before this pool can be used.`,
    )
    err.code = 'V3_FEED_NOT_REGISTERED'
    err.tokenAddress = tokenAddresses[missingIdx]
    throw err
  }

  const pythUrl = new URL('https://hermes.pyth.network/v2/updates/price/latest?encoding=hex')
  priceFeedIds.forEach((id) => pythUrl.searchParams.append('ids[]', id))
  const response = await fetch(pythUrl.toString())
  if (!response.ok) throw new Error(`Pyth API error: HTTP ${response.status}`)
  const data = await response.json()
  const dataBytes = (data.binary.data as string[]).map((b: string) => `0x${b}`) as `0x${string}`[]
  return encodeAbiParameters(parseAbiParameters('bytes[]'), [dataBytes])
}

// Shape returned by the build* helpers below. Matches the swap aggregator's
// BuildSwapResult so a future zap orchestration hook can send either kind of
// tx with the same code path (`signer.sendTransaction({to, data, value, gasLimit})`).
export type V3ZapTxRequest = {
  to: string
  data: string
  value?: BigNumber
  gasLimit?: BigNumber
}

/**
 * Build calldata for a V3 zap-in WITHOUT submitting. The aggregator-adapter
 * path (services/aggregators/native/zapAdapter) uses this so the orchestration
 * hook can call signer.sendTransaction itself, matching how the swap path
 * routes through useAggregatorSwapCallback.
 *
 * Gas estimation is intentionally skipped: estimateGas requires the user's
 * approval + balance to already be in place. The wallet's own estimate at
 * sign time covers this. Callers that need a deterministic gas can simulate
 * via callStatic separately and merge the result.
 */
export async function buildV3ZapInTx({
  chainId,
  version,
  tokenIn,
  tokenOther,
  amountIn,
  amountOtherMin,
  minLiquidity,
  account,
  deadline,
  updateData,
  isNativeETH,
}: {
  chainId: ChainId
  version: number
  tokenIn: string
  tokenOther: string
  amountIn: string
  amountOtherMin: string
  minLiquidity: string
  account: string
  deadline: BigNumber
  updateData: string
  isNativeETH: boolean
}): Promise<V3ZapTxRequest> {
  const zapAddress = getV3ZapAddress(chainId, version)
  if (!zapAddress) throw new Error('V3 zap not deployed on this chain')

  // Use a no-signer Contract instance just to encode calldata via populateTransaction.
  const zap = new Contract(zapAddress, V3_ZAP_ABI)
  if (isNativeETH) {
    const populated = await zap.populateTransaction.zapInETH(
      tokenOther, amountOtherMin, minLiquidity, account, deadline.toHexString(), updateData,
      { value: amountIn },
    )
    return {
      to: populated.to ?? zapAddress,
      data: populated.data ?? '0x',
      value: populated.value ?? BigNumber.from(amountIn),
    }
  }

  const populated = await zap.populateTransaction.zapIn(
    tokenIn, tokenOther, amountIn, amountOtherMin, minLiquidity, account, deadline.toHexString(), updateData,
  )
  return {
    to: populated.to ?? zapAddress,
    data: populated.data ?? '0x',
  }
}

/**
 * Build calldata for a V3 zap-out WITHOUT submitting. Mirrors buildV3ZapInTx
 * — same rationale for skipping estimateGas. updateData is built fresh here
 * so callers don't need to repeat the Pyth fetch they already did at quote.
 * Pass it in if you have it cached; otherwise this builds it.
 */
export async function buildV3ZapOutTx({
  chainId,
  version,
  tokenA,
  tokenB,
  tokenOut,
  liquidity,
  amountMin,
  account,
  deadline,
  updateData: maybeUpdateData,
  isNativeETH,
}: {
  chainId: ChainId
  version: number
  tokenA: string
  tokenB: string
  tokenOut: string
  liquidity: string
  amountMin: string
  account: string
  deadline: BigNumber
  updateData?: string
  isNativeETH: boolean
}): Promise<V3ZapTxRequest> {
  const zapAddress = getV3ZapAddress(chainId, version)
  if (!zapAddress) throw new Error('V3 zap not deployed on this chain')

  const updateData = maybeUpdateData ?? (await buildV3UpdateData([tokenA, tokenB], chainId, version))
  const zap = new Contract(zapAddress, V3_ZAP_ABI)

  if (isNativeETH) {
    const token = tokenA === WETH[chainId]?.address ? tokenB : tokenA
    const populated = await zap.populateTransaction.zapOutETH(
      token, liquidity, amountMin, account, deadline.toHexString(), updateData,
    )
    return { to: populated.to ?? zapAddress, data: populated.data ?? '0x' }
  }

  const populated = await zap.populateTransaction.zapOut(
    tokenA, tokenB, tokenOut, liquidity, amountMin, account, deadline.toHexString(), updateData,
  )
  return { to: populated.to ?? zapAddress, data: populated.data ?? '0x' }
}
