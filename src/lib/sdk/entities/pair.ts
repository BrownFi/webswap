import { isV3Like } from '../constants'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { createPublicClient, http, encodeAbiParameters, parseAbiParameters } from 'viem'
import { ChainId } from '../constants/chainId'
import {
  BigintIsh,
  ZERO,
  ONE,
  FIVE,
  _997,
  _1000,
  MINIMUM_LIQUIDITY,
} from '../constants/types'
import {
  parseBigintIsh,
  sqrt,
  getFactoryAddress,
  getInitCodeHash,
  isContractWithPrice,
  getRouterAddress,
} from '../utils'
import { RPC_URLS, ROUTER_ADDRESS_WITH_PRICE, PYTH_ADDRESS } from '../constants/addresses'

// ── Caches: reduce redundant RPC calls per quote ──────────────────────
// priceFeedId cache is shared with utils/index.ts — imported via getCachedPriceFeedId

// Hermes + encoded updateData: cache 5s (Pyth publishes ~1/s but we don't need sub-second freshness for quotes)
let hermesCache: { key: string; data: string; ts: number } | null = null
const HERMES_TTL = 5_000

// Concurrent-call dedup. The 5s TTL above only helps SEQUENTIAL callers —
// when trade discovery iterates several candidate paths in parallel (or
// useBestSwapRoute fans out across adapters), N callers all check the
// cache before the first writer settles, all miss, all fire the same
// Hermes request. Tracking the inflight promise per sorted-key collapses
// those N requests into one. Cleared after the promise settles so the
// next post-TTL refresh isn't blocked by a stale slot.
const hermesInflight = new Map<string, Promise<string>>()

async function getCachedUpdateData(feedIds: string[]): Promise<string> {
  const sortedKey = [...feedIds].sort().join(',')
  if (hermesCache && hermesCache.key === sortedKey && Date.now() - hermesCache.ts < HERMES_TTL) {
    return hermesCache.data
  }
  const inflight = hermesInflight.get(sortedKey)
  if (inflight) return inflight

  const promise = (async () => {
    const pythUrl = new URL('https://hermes.pyth.network/v2/updates/price/latest?encoding=hex')
    feedIds.forEach((id) => pythUrl.searchParams.append('ids[]', id))
    const resp = await fetch(pythUrl.toString())
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    const dataBytes = (json.binary.data as string[]).map((b: string) => `0x${b}`) as `0x${string}`[]
    const encoded = encodeAbiParameters(parseAbiParameters('bytes[]'), [dataBytes])
    hermesCache = { key: sortedKey, data: encoded, ts: Date.now() }
    return encoded
  })()

  hermesInflight.set(sortedKey, promise)
  try {
    return await promise
  } finally {
    hermesInflight.delete(sortedKey)
  }
}

// Helper: fetch Pyth price feed data and update fee for WithPrice router calls
async function getFeedPriceAndFee(pairs: Pair[], chainId: number): Promise<[string[], number]> {
  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })

  const allIds = (await Promise.all(pairs.map(async (pair) => {
    const priceFeedAddress = await client.readContract({
      address: pair.liquidityToken.address as `0x${string}`,
      abi: [{
        inputs: [], name: 'priceFeed',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view', type: 'function',
      }] as const,
      functionName: 'priceFeed',
    })
    const [base, quote] = await Promise.all([
      client.readContract({
        address: priceFeedAddress as `0x${string}`,
        abi: [{
          inputs: [], name: 'baseTokenPriceId',
          outputs: [{ name: '', type: 'bytes32' }],
          stateMutability: 'view', type: 'function',
        }] as const,
        functionName: 'baseTokenPriceId',
      }),
      client.readContract({
        address: priceFeedAddress as `0x${string}`,
        abi: [{
          inputs: [], name: 'quoteTokenPriceId',
          outputs: [{ name: '', type: 'bytes32' }],
          stateMutability: 'view', type: 'function',
        }] as const,
        functionName: 'quoteTokenPriceId',
      }),
    ])
    return [base, quote]
  }))).flat()

  const uniqueIds = allIds.filter((id, i, arr) => arr.indexOf(id) === i && id !== ZERO_ADDRESS)
  const pythUrl = new URL('https://hermes.pyth.network/api/latest_vaas')
  uniqueIds.forEach((id) => pythUrl.searchParams.append('ids[]', id))
  const pythResponse = await fetch(pythUrl.toString())
  if (!pythResponse.ok) throw new Error(`HTTP ${pythResponse.status}`)
  const data = await pythResponse.json()
  const priceUpdate = (data as string[]).map((vaa: string) => '0x' + Buffer.from(vaa, 'base64').toString('hex'))

  const updateFee = await client.readContract({
    address: PYTH_ADDRESS[chainId] as `0x${string}`,
    abi: [{
      inputs: [{ name: 'updateData', type: 'bytes[]' }],
      name: 'getUpdateFee',
      outputs: [{ name: 'feeAmount', type: 'uint256' }],
      stateMutability: 'view', type: 'function',
    }] as const,
    functionName: 'getUpdateFee',
    args: [priceUpdate as `0x${string}`[]],
  })
  return [priceUpdate, Number(updateFee)]
}

// Helper: fetch Pyth price update data and encode for V2/V3 router
async function solidityPackHelper(addresses: string[], chainId: number, version: number = 2): Promise<string> {
  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const { getFactoryAddress: getFactory, getCachedPriceFeedId } = await import('../utils')
  const factoryAddr = getFactory(chainId, version)
  const priceFeedIds = await Promise.all(
    addresses.map((addr) => getCachedPriceFeedId(client, factoryAddr, addr))
  )
  return getCachedUpdateData(priceFeedIds)
}
import { Token } from './token'
import { Price } from './fractions/price'
import { TokenAmount } from './fractions/tokenAmount'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'

// Viem ABI constants
const ABI_ROUTER_V2 = [{
  inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }],
  name: 'getAmountsOut', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function',
}] as const
const ABI_ROUTER_V1 = [{
  inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }],
  name: 'getAmountsOut', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'view', type: 'function',
}] as const
const ABI_ROUTER_WITH_PRICE = [{
  inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'priceUpdate', type: 'bytes[]' }],
  name: 'getAmountsOutWithPrice', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'payable', type: 'function',
}] as const
const ABI_ROUTER_V2_IN = [{
  inputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }],
  name: 'getAmountsIn', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function',
}] as const
const ABI_ROUTER_V1_IN = [{
  inputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'path', type: 'address[]' }],
  name: 'getAmountsIn', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'view', type: 'function',
}] as const
const ABI_ROUTER_WITH_PRICE_IN = [{
  inputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'priceUpdate', type: 'bytes[]' }],
  name: 'getAmountsInWithPrice', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'payable', type: 'function',
}] as const
// V3 quote functions on the v3-final router. These MUST be the WithUpdate
// variants: the pool's priceOf() reverts StalePrice() if the on-chain Pyth
// price is older than the factory's minPriceAge (~60s). Plain view-only
// getAmountsOut/In can't satisfy that at quote time on a slow-moving feed
// (e.g. USDC drifts >60s), so the quote reverts and the V3 route silently
// disappears from the UI. quoteAmountsOut/InWithUpdate applies a fresh Pyth
// update in-call (read-only via eth_call) so the quote sees a fresh price.
// (Regression note: commit 2362674 wrongly swapped these to plain getAmounts*
// on a false "v3-final reads cached Pyth" assumption — this restores the
// correct calls originally added in ac59a1a.)
const ABI_V3_QUOTE_OUT = [{
  inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }],
  name: 'quoteAmountsOutWithUpdate', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function',
}] as const
const ABI_V3_QUOTE_IN = [{
  inputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }],
  name: 'quoteAmountsInWithUpdate', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function',
}] as const

class InsufficientReservesError extends Error {
  public readonly isInsufficientReservesError = true
  constructor() {
    super('INSUFFICIENT_RESERVES')
    this.name = 'InsufficientReservesError'
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, InsufficientReservesError.prototype)
    }
  }
}

class InsufficientInputAmountError extends Error {
  public readonly isInsufficientInputAmountError = true
  constructor() {
    super('INSUFFICIENT_INPUT_AMOUNT')
    this.name = 'InsufficientInputAmountError'
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, InsufficientInputAmountError.prototype)
    }
  }
}

/**
 * The V3 router caps how much can be swapped through a pool in a single
 * trade (an oracle-AMM curve limit, not an empty pool). On small pools this
 * reverts even though liquidity exists — so we surface it distinctly from
 * InsufficientReservesError, letting the UI say "reduce the amount" instead
 * of the misleading "insufficient liquidity".
 */
class MaxAmountOutExceededError extends Error {
  public readonly isMaxAmountOutExceededError = true
  // Treated as an expected, business-as-usual rejection by isExpectedTradeError.
  public readonly isInsufficientReservesError = true
  /** Max input the pool accepts (raw, input-token units), decoded from the
   *  exact-in cap revert (0xc64511c2 params: amountIn, maxIn). Lets the UI show
   *  "Max X" so the user knows how far to reduce. Undefined for the exact-out
   *  cutoff revert or when decoding fails. */
  public readonly maxIn?: string
  constructor(maxIn?: string) {
    super('EXCEEDS_MAX_OUTPUT')
    this.name = 'MaxAmountOutExceededError'
    this.maxIn = maxIn
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, MaxAmountOutExceededError.prototype)
    }
  }
}

// V3 router custom-error selectors that mean "this trade exceeds the pool's
// per-swap cap" (vs a genuinely empty pool). Keep lowercased.
//   0xc64511c2 — exact-in: input exceeds max accepted (params: amountIn, maxIn)
//   0xf1ac6cc5 — exact-out: requested output exceeds max achievable ("cutoff")
//   0xd0915224 — ExceedsMaxOut (max quotable output)
const MAX_CAP_SELECTORS = new Set<string>(['0xc64511c2', '0xf1ac6cc5', '0xd0915224'])

/**
 * Best-effort extraction of the 4-byte revert selector from an ethers/viem
 * error. Walks the cause chain (viem nests the raw revert under .cause.data /
 * .raw) and falls back to scanning the message.
 */
function extractRevertSelector(err: any): string | undefined {
  let e = err
  for (let i = 0; i < 8 && e; i++) {
    const hex = (typeof e?.data === 'string' && e.data) || (typeof e?.raw === 'string' && e.raw) || ''
    if (/^0x[0-9a-fA-F]{8}/.test(hex)) return hex.slice(0, 10).toLowerCase()
    e = e?.cause
  }
  const m = (err?.message ?? '').match(/0x[0-9a-fA-F]{8}/)
  return m ? m[0].toLowerCase() : undefined
}

/**
 * Full revert data hex (selector + abi-encoded args) from an ethers/viem error,
 * walking the cause chain. Used to decode the exact-in cap revert's `maxIn`.
 */
function extractRevertData(err: any): string | undefined {
  let e = err
  for (let i = 0; i < 8 && e; i++) {
    const hex = (typeof e?.data === 'string' && e.data) || (typeof e?.raw === 'string' && e.raw) || ''
    if (/^0x[0-9a-fA-F]{10,}$/.test(hex)) return hex.toLowerCase()
    e = e?.cause
  }
  return undefined
}

/** Map a caught V3 quote revert to the right error type. */
function v3QuoteError(err: any): Error {
  const sel = extractRevertSelector(err)
  if (sel && MAX_CAP_SELECTORS.has(sel)) {
    // The exact-in cap revert (0xc64511c2) encodes (amountIn, maxIn) — decode
    // the 2nd 32-byte word (maxIn) so the UI can show the max swappable input.
    // Defensive: any decode hiccup just yields no number (generic message).
    let maxIn: string | undefined
    if (sel === '0xc64511c2') {
      const data = extractRevertData(err)
      if (data && data.length >= 10 + 128) {
        try {
          const v = BigInt('0x' + data.slice(10 + 64, 10 + 128))
          if (v > 0n) maxIn = v.toString()
        } catch {
          // leave maxIn undefined
        }
      }
    }
    return new MaxAmountOutExceededError(maxIn)
  }
  // Non-cap revert (insufficient reserves, oracle guard, stale price, …). The
  // SDK stays decoupled from the app's error registry, so we only ATTACH the
  // raw revert bytes/message here; the hook layer (decodeContractErrorLabel)
  // turns them into a user-facing reason for the route comparison.
  const e = new InsufficientReservesError()
  ;(e as any).revertSelector = sel
  ;(e as any).revertData = extractRevertData(err)
  ;(e as any).revertMessage =
    (typeof err?.shortMessage === 'string' && err.shortMessage) ||
    (typeof err?.message === 'string' && err.message) ||
    undefined
  return e
}

let PAIR_ADDRESS_CACHE: Record<string, Record<string, string>> = {}

export class Pair {
  public readonly liquidityToken: Token
  public readonly tokenAmounts: [TokenAmount, TokenAmount]
  public readonly version: number

  static getAddress(tokenA: Token, tokenB: Token, version: number): string {
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

    if (PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined) {
      PAIR_ADDRESS_CACHE = {
        ...PAIR_ADDRESS_CACHE,
        [tokens[0].address]: {
          ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
          [tokens[1].address]: getCreate2Address(
            getFactoryAddress(tokenA.chainId, version),
            keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
            getInitCodeHash(tokenA.chainId, version)
          ),
        },
      }
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address]
  }

  constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount, version: number) {
    const tokenAmounts: [TokenAmount, TokenAmount] = tokenAmountA.token.sortsBefore(tokenAmountB.token)
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    const symbol = version >= 2 ? (isV3Like(version) ? 'BF-V3' : 'BF-V2') : 'BRF-V1'
    const name = version >= 2 ? (isV3Like(version) ? 'BrownFi V3' : 'BrownFi V2') : 'BrownFi V1'
    this.liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, version),
      18,
      symbol,
      name
    )
    this.tokenAmounts = tokenAmounts
    this.version = version
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  get token0Price(): Price {
    return new Price(this.token0, this.token1, this.tokenAmounts[0].raw, this.tokenAmounts[1].raw)
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  get token1Price(): Price {
    return new Price(this.token1, this.token0, this.tokenAmounts[1].raw, this.tokenAmounts[0].raw)
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  priceOf(token: Token): Price {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.token0Price : this.token1Price
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  get chainId(): ChainId {
    return this.token0.chainId
  }

  get token0(): Token {
    return this.tokenAmounts[0].token
  }

  get token1(): Token {
    return this.tokenAmounts[1].token
  }

  get reserve0(): TokenAmount {
    return this.tokenAmounts[0]
  }

  get reserve1(): TokenAmount {
    return this.tokenAmounts[1]
  }

  reserveOf(token: Token): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.reserve0 : this.reserve1
  }

  getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }

    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const inputAmountWithFee = JSBI.multiply(inputAmount.raw, _997)
    const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw)
    const denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _1000), inputAmountWithFee)

    const outputAmount = new TokenAmount(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.divide(numerator, denominator)
    )

    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.version)]
  }

  getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (
      JSBI.equal(this.reserve0.raw, ZERO) ||
      JSBI.equal(this.reserve1.raw, ZERO) ||
      JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)
    ) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _1000)
    const denominator = JSBI.multiply(JSBI.subtract(outputReserve.raw, outputAmount.raw), _997)

    const inputAmount = new TokenAmount(
      outputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.add(JSBI.divide(numerator, denominator), ONE)
    )

    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.version)]
  }

  async getOutputAmountAsync(
    inputAmount: TokenAmount,
    pairs: Pair[],
    path: Token[],
    chainId: ChainId,
    account: string
  ): Promise<[TokenAmount, Pair, string[], number, number]> {
    const version = pairs[0].version
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }

    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
    const pathAddresses = path.map((t: Token) => t.address) as `0x${string}`[]

    let priceUpdate: string[] = []
    let updateFee = 0
    let amountOuts: readonly bigint[]
    // Hoisted so the marginal-reference price-impact probe below can reuse the
    // same Pyth update blob without re-fetching.
    let updateData: string | undefined

    if (isContractWithPrice(chainId, version)) {
      const feedResult = await getFeedPriceAndFee(pairs, chainId)
      priceUpdate = feedResult[0]
      updateFee = feedResult[1]
      const { result } = await client.simulateContract({
        address: ROUTER_ADDRESS_WITH_PRICE[chainId] as `0x${string}`,
        abi: ABI_ROUTER_WITH_PRICE,
        functionName: 'getAmountsOutWithPrice',
        args: [BigInt(inputAmount.raw.toString()), pathAddresses, priceUpdate as `0x${string}`[]],
        value: BigInt(updateFee),
        account: account as `0x${string}`,
      })
      amountOuts = result
    } else if (version === 2) {
      updateData = await solidityPackHelper(pathAddresses as string[], chainId, version)
      amountOuts = await client.readContract({
        address: getRouterAddress(chainId, version) as `0x${string}`,
        abi: ABI_ROUTER_V2,
        functionName: 'getAmountsOut',
        args: [BigInt(inputAmount.raw.toString()), pathAddresses, updateData as `0x${string}`],
        account: account as `0x${string}`,
      })
    } else if (isV3Like(version)) {
      // V3 (v3-final): quoteAmountsOutWithUpdate applies a fresh Pyth update
      // in-call so priceOf() doesn't revert StalePrice() at quote time (the
      // on-chain price can be >minPriceAge old for slow feeds like USDC).
      // updateData is the cached Hermes blob (solidityPackHelper). Called
      // read-only (eth_call). Keep the revert→InsufficientReservesError mapping
      // so genuine no-route reverts (ExceedsMaxOut, InvalidPrice, SearchItera-
      // tionLimitReached, …) surface as "Insufficient liquidity".
      try {
        updateData = await solidityPackHelper(pathAddresses as string[], chainId, version)
        amountOuts = await client.readContract({
          address: getRouterAddress(chainId, version) as `0x${string}`,
          abi: ABI_V3_QUOTE_OUT,
          functionName: 'quoteAmountsOutWithUpdate',
          args: [BigInt(inputAmount.raw.toString()), pathAddresses, updateData as `0x${string}`],
          account: account as `0x${string}`,
        })
      } catch (err: any) {
        throw v3QuoteError(err)
      }
    } else {
      amountOuts = await client.readContract({
        address: getRouterAddress(chainId, version) as `0x${string}`,
        abi: ABI_ROUTER_V1,
        functionName: 'getAmountsOut',
        args: [BigInt(inputAmount.raw.toString()), pathAddresses],
      })
    }

    const outputAmount = new TokenAmount(outputReserve.token, amountOuts[amountOuts.length - 1].toString())
    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    // Price impact = the slippage caused by THIS trade's size, measured
    // against a near-marginal quote (same path/method/updateData, 1/1000 the
    // size). This isolates true size-impact: the LP fee and the AMM's baseline
    // spread cancel (both quotes pay them equally) and no external oracle is
    // read (no stale-price noise). ~0 for small trades, growing with size —
    // correct for V2 (constant product) and V3 (oracle AMM) alike. The old
    // formulas conflated fee + spread + (V3) a stale-oracle delta, which made
    // a $0.13 swap read ~0.65%.
    let priceImpactK = 0
    try {
      const inputRaw = BigInt(inputAmount.raw.toString())
      const marginalRaw = inputRaw / 1000n
      if (marginalRaw > 0n) {
        let marginalOuts: readonly bigint[]
        if (isContractWithPrice(chainId, version)) {
          const { result } = await client.simulateContract({
            address: ROUTER_ADDRESS_WITH_PRICE[chainId] as `0x${string}`,
            abi: ABI_ROUTER_WITH_PRICE,
            functionName: 'getAmountsOutWithPrice',
            args: [marginalRaw, pathAddresses, priceUpdate as `0x${string}`[]],
            value: BigInt(updateFee),
            account: account as `0x${string}`,
          })
          marginalOuts = result
        } else if (version === 2) {
          marginalOuts = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_ROUTER_V2,
            functionName: 'getAmountsOut',
            args: [marginalRaw, pathAddresses, (updateData ?? '0x') as `0x${string}`],
            account: account as `0x${string}`,
          })
        } else if (isV3Like(version)) {
          marginalOuts = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_V3_QUOTE_OUT,
            functionName: 'quoteAmountsOutWithUpdate',
            args: [marginalRaw, pathAddresses, (updateData ?? '0x') as `0x${string}`],
            account: account as `0x${string}`,
          })
        } else {
          marginalOuts = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_ROUTER_V1,
            functionName: 'getAmountsOut',
            args: [marginalRaw, pathAddresses],
          })
        }
        const marginalOut = marginalOuts[marginalOuts.length - 1]
        // exec = out/in; the out/in decimal factor is identical for both
        // quotes, so it cancels in the ratio below.
        const sizedExec = Number(amountOuts[amountOuts.length - 1]) / Number(inputRaw)
        const marginalExec = Number(marginalOut) / Number(marginalRaw)
        if (marginalExec > 0) priceImpactK = Math.max(0, ((marginalExec - sizedExec) / marginalExec) * 100)
      }
    } catch {
      // Marginal probe failed — price impact is a display metric, never block
      // the trade on it. Leave at 0.
      priceImpactK = 0
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), version), priceUpdate, updateFee, priceImpactK]
  }

  async getInputAmountAsync(
    outputAmount: TokenAmount,
    pairs: Pair[],
    path: Token[],
    chainId: ChainId,
    account: string
  ): Promise<[TokenAmount, Pair, string[], number, number]> {
    const version = pairs[0].version
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO) ||
        JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
    const pathAddresses = path.map((t: Token) => t.address) as `0x${string}`[]

    let priceUpdate: string[] = []
    let updateFee = 0
    let amountIns: readonly bigint[]
    // Hoisted so the marginal-reference price-impact probe below can reuse it.
    let updateData: string | undefined

    if (isContractWithPrice(chainId, version)) {
      const feedResult = await getFeedPriceAndFee(pairs, chainId)
      priceUpdate = feedResult[0]
      updateFee = feedResult[1]
      const { result } = await client.simulateContract({
        address: ROUTER_ADDRESS_WITH_PRICE[chainId] as `0x${string}`,
        abi: ABI_ROUTER_WITH_PRICE_IN,
        functionName: 'getAmountsInWithPrice',
        args: [BigInt(outputAmount.raw.toString()), pathAddresses, priceUpdate as `0x${string}`[]],
        value: BigInt(updateFee),
        account: account as `0x${string}`,
      })
      amountIns = result
    } else if (version === 2) {
      updateData = await solidityPackHelper(pathAddresses as string[], chainId, version)
      amountIns = await client.readContract({
        address: getRouterAddress(chainId, version) as `0x${string}`,
        abi: ABI_ROUTER_V2_IN,
        functionName: 'getAmountsIn',
        args: [BigInt(outputAmount.raw.toString()), pathAddresses, updateData as `0x${string}`],
        account: account as `0x${string}`,
      })
    } else if (isV3Like(version)) {
      // V3 (v3-final): quoteAmountsInWithUpdate — applies a fresh Pyth update
      // in-call so priceOf() doesn't revert StalePrice() at quote time. Mirrors
      // the out-side. updateData = cached Hermes blob; revert→Insufficient.
      try {
        updateData = await solidityPackHelper(pathAddresses as string[], chainId, version)
        amountIns = await client.readContract({
          address: getRouterAddress(chainId, version) as `0x${string}`,
          abi: ABI_V3_QUOTE_IN,
          functionName: 'quoteAmountsInWithUpdate',
          args: [BigInt(outputAmount.raw.toString()), pathAddresses, updateData as `0x${string}`],
          account: account as `0x${string}`,
        })
      } catch (err: any) {
        throw v3QuoteError(err)
      }
    } else {
      amountIns = await client.readContract({
        address: getRouterAddress(chainId, version) as `0x${string}`,
        abi: ABI_ROUTER_V1_IN,
        functionName: 'getAmountsIn',
        args: [BigInt(outputAmount.raw.toString()), pathAddresses],
      })
    }

    const inputAmountResult = new TokenAmount(inputReserve.token, amountIns[0].toString())

    // Price impact via marginal reference (exact-out): quote a tiny output
    // (1/1000) and compare the execution price. Same rationale as the exact-in
    // path — fee + baseline spread cancel, no oracle read, ~0 for small trades.
    let priceImpactK = 0
    try {
      const outputRaw = BigInt(outputAmount.raw.toString())
      const marginalOutRaw = outputRaw / 1000n
      if (marginalOutRaw > 0n) {
        let marginalIns: readonly bigint[]
        if (isContractWithPrice(chainId, version)) {
          const { result } = await client.simulateContract({
            address: ROUTER_ADDRESS_WITH_PRICE[chainId] as `0x${string}`,
            abi: ABI_ROUTER_WITH_PRICE_IN,
            functionName: 'getAmountsInWithPrice',
            args: [marginalOutRaw, pathAddresses, priceUpdate as `0x${string}`[]],
            value: BigInt(updateFee),
            account: account as `0x${string}`,
          })
          marginalIns = result
        } else if (version === 2) {
          marginalIns = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_ROUTER_V2_IN,
            functionName: 'getAmountsIn',
            args: [marginalOutRaw, pathAddresses, (updateData ?? '0x') as `0x${string}`],
            account: account as `0x${string}`,
          })
        } else if (isV3Like(version)) {
          marginalIns = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_V3_QUOTE_IN,
            functionName: 'quoteAmountsInWithUpdate',
            args: [marginalOutRaw, pathAddresses, (updateData ?? '0x') as `0x${string}`],
            account: account as `0x${string}`,
          })
        } else {
          marginalIns = await client.readContract({
            address: getRouterAddress(chainId, version) as `0x${string}`,
            abi: ABI_ROUTER_V1_IN,
            functionName: 'getAmountsIn',
            args: [marginalOutRaw, pathAddresses],
          })
        }
        const marginalIn = marginalIns[0]
        // exec = out/in; decimal factor cancels in the ratio.
        const sizedExec = Number(outputRaw) / Number(amountIns[0])
        const marginalExec = Number(marginalOutRaw) / Number(marginalIn)
        if (marginalExec > 0) priceImpactK = Math.max(0, ((marginalExec - sizedExec) / marginalExec) * 100)
      }
    } catch {
      priceImpactK = 0
    }

    return [inputAmountResult, new Pair(inputReserve.add(inputAmountResult), outputReserve.subtract(outputAmount), version), priceUpdate, updateFee, priceImpactK]
  }

  getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount {
    invariant(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY')
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token)
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    invariant(
      tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1),
      'TOKEN'
    )

    let liquidity: JSBI
    if (JSBI.equal(totalSupply.raw, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), MINIMUM_LIQUIDITY)
    } else {
      const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw)
      const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw)
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
    }

    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    return new TokenAmount(this.liquidityToken, liquidity)
  }

  getLiquidityValue(
    token: Token,
    totalSupply: TokenAmount,
    liquidity: TokenAmount,
    feeOn: boolean = false,
    kLast?: BigintIsh
  ): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    invariant(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY')
    invariant(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY')
    invariant(JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw), 'LIQUIDITY')

    let totalSupplyAdjusted: TokenAmount
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply
    } else {
      invariant(!!kLast, 'K_LAST')
      const kLastParsed = parseBigintIsh(kLast!)
      if (!JSBI.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(JSBI.multiply(this.reserve0.raw, this.reserve1.raw))
        const rootKLast = sqrt(kLastParsed)
        if (JSBI.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast))
          const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast)
          const feeLiquidity = JSBI.divide(numerator, denominator)
          totalSupplyAdjusted = totalSupply.add(new TokenAmount(this.liquidityToken, feeLiquidity))
        } else {
          totalSupplyAdjusted = totalSupply
        }
      } else {
        totalSupplyAdjusted = totalSupply
      }
    }

    return new TokenAmount(
      token,
      JSBI.divide(JSBI.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw)
    )
  }
}
