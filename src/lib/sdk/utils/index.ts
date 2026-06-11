import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import { getAddress } from '@ethersproject/address'
import { createPublicClient, http } from 'viem'
import {
  ChainId,
  SolidityType,
  SOLIDITY_TYPE_MAXIMA,
  ZERO,
  ONE,
  TWO,
  THREE,
  ROUTER_ADDRESS,
  ROUTER_ADDRESS_V1,
  ROUTER_ADDRESS_V3,
  ROUTER_ADDRESS_WITH_PRICE,
  FACTORY_ADDRESS,
  FACTORY_ADDRESS_V1,
  FACTORY_ADDRESS_V3,
  INIT_CODE_HASH,
  INIT_CODE_HASH_V1,
} from '../constants'
import type { BigintIsh } from '../constants'

export function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`)
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

export function validateAndParseAddress(address: string, chainId?: ChainId): string {
  try {
    if (chainId === ChainId.SN_MAIN || chainId === ChainId.SN_SEPOLIA) {
      return address
    }
    const checksummedAddress = getAddress(address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch {
    invariant(false, `${address} is not a valid address.`)
  }
}

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}

export function sqrt(y: JSBI): JSBI {
  validateSolidityTypeInstance(y, SolidityType.uint256)
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

export function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null {
  invariant(maxSize > 0, 'MAX_SIZE_ZERO')
  invariant(items.length <= maxSize, 'ITEMS_SIZE')
  if (items.length === 0) {
    items.push(add)
    return null
  } else {
    const isFull = items.length === maxSize
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add
    }
    let lo = 0
    let hi = items.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    items.splice(lo, 0, add)
    return isFull ? items.pop()! : null
  }
}

export function currencyEquals(currencyA: any, currencyB: any): boolean {
  if (currencyA instanceof Object && 'equals' in currencyA && currencyB instanceof Object && 'equals' in currencyB) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Object && 'equals' in currencyA) {
    return false
  } else if (currencyB instanceof Object && 'equals' in currencyB) {
    return false
  } else {
    return currencyA === currencyB
  }
}

export function getPriceFromUnsafe(priceUnsafe: any): number {
  // Handle both viem object format { price, conf, expo, publishTime } and legacy array format
  const price = priceUnsafe.price !== undefined ? priceUnsafe.price : priceUnsafe[0]
  const expo = priceUnsafe.expo !== undefined ? priceUnsafe.expo : priceUnsafe[2]
  return Number(price) * Math.pow(10, Number(expo))
}

export function isContractWithPrice(chainId: number, version: number): boolean {
  return version === 1 && !!ROUTER_ADDRESS_WITH_PRICE[chainId]
}

export function getRouterAddress(chainId: number, version: number): string {
  if (version === 3) return ROUTER_ADDRESS_V3[chainId] ?? ''
  return version === 2 ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS_V1[chainId]
}

export function getFactoryAddress(chainId: number, version: number): string {
  if (version === 3) return FACTORY_ADDRESS_V3[chainId] ?? ''
  return version === 2 ? FACTORY_ADDRESS[chainId] : FACTORY_ADDRESS_V1[chainId]
}

export function getInitCodeHash(chainId: number, version: number): string {
  // V3 pairs are deployed via factory.createPair (registry), not CREATE2.
  // Pair.getAddress's CREATE2 computation runs anyway during `new Pair(...)`
  // but the result is discarded — MemoizedPairList overrides liquidityToken
  // with the real registry address right after construction. So we just need
  // a non-undefined 32-byte hash to keep getCreate2Address from crashing on
  // chains that don't have a V1 entry (e.g. HyperEVM). Fall back to V2's
  // hash; if that's also missing, use zero hash — either way the value is
  // never read by anything that depends on its correctness.
  if (version === 3) {
    // Try V1's hash first so Bera (which already had this implicit behavior
    // pre-fix via `version === 2 ? ... : INIT_CODE_HASH_V1[chainId]`) keeps
    // computing the exact same dummy address it always did — no behavior
    // change there. New chains without a V1 entry (HyperEVM) fall through
    // to V2's hash, then to the zero hash. The CREATE2 result is discarded
    // for V3, so the specific value doesn't matter — only "non-undefined".
    return INIT_CODE_HASH_V1[chainId] ?? INIT_CODE_HASH[chainId] ?? '0x0000000000000000000000000000000000000000000000000000000000000000'
  }
  return version === 2 ? INIT_CODE_HASH[chainId] : INIT_CODE_HASH_V1[chainId]
}

/**
 * Fetches Pyth oracle price for a given token address.
 * Uses viem + Pyth on-chain contract to read the price feed.
 */
// ── Shared caches for Pyth data (used by getPythPrice and pair.ts) ────
// priceFeedId: never changes per (factory, token) — cache forever
const _feedIdCache = new Map<string, string>()
// Concurrent-call dedup for the priceFeedIds(token) lookup. Without this,
// when N callers (different candidate paths in trade discovery, parallel
// adapter quotes, etc.) ask for the same token's feedId simultaneously
// they all miss the cache before any writer settles and N RPC calls fire.
// Tracking the inflight promise per key collapses those into one read.
const _feedIdInflight = new Map<string, Promise<string>>()
// getPriceUnsafe: short TTL (prices update ~1/s but UI doesn't need sub-second)
const _priceCache = new Map<string, { value: number; ts: number }>()
const _PRICE_TTL = 5_000

/** Cached factory.priceFeedIds(token) — shared across all callers */
export async function getCachedPriceFeedId(client: any, factoryAddr: string, tokenAddr: string): Promise<string> {
  const key = `${factoryAddr}:${tokenAddr}`.toLowerCase()
  const cached = _feedIdCache.get(key)
  if (cached) return cached
  const inflight = _feedIdInflight.get(key)
  if (inflight) return inflight

  const promise = (async () => {
    const id = await client.readContract({
      address: factoryAddr as `0x${string}`,
      abi: [{
        inputs: [{ name: '', type: 'address' }],
        name: 'priceFeedIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view', type: 'function',
      }] as const,
      functionName: 'priceFeedIds',
      args: [tokenAddr as `0x${string}`],
    })
    _feedIdCache.set(key, id as string)
    return id as string
  })()

  _feedIdInflight.set(key, promise)
  try {
    return await promise
  } finally {
    _feedIdInflight.delete(key)
  }
}

export async function getPythPrice(address: string, chainId: number, version: number): Promise<number> {
  if (!address || !chainId) return 0
  try {
    const { RPC_URLS, PYTH_ADDRESS } = await import('../constants/addresses')

    const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
    const factoryAddr = getFactoryAddress(chainId, version)

    const priceFeedId = await getCachedPriceFeedId(client, factoryAddr, address)

    // Token isn't registered with a Pyth feed on this factory — return 0
    // instead of calling getPriceUnsafe(0x0…0), which guaranteed-reverts
    // and spams the console. Common case: zap into a pair where one
    // token lacks a feed, or a user-imported ERC20 the factory doesn't
    // know about. Callers already handle a 0 return as "no price."
    if (!priceFeedId || /^0x0+$/.test(priceFeedId)) return 0

    // Cached price lookup (5s TTL)
    const priceKey = `${chainId}:${priceFeedId}`
    const cached = _priceCache.get(priceKey)
    if (cached && Date.now() - cached.ts < _PRICE_TTL) return cached.value

    const priceUnsafe = await client.readContract({
      address: PYTH_ADDRESS[chainId] as `0x${string}`,
      abi: [{
        inputs: [{ name: 'id', type: 'bytes32' }],
        name: 'getPriceUnsafe',
        outputs: [{
          components: [
            { name: 'price', type: 'int64' },
            { name: 'conf', type: 'uint64' },
            { name: 'expo', type: 'int32' },
            { name: 'publishTime', type: 'uint256' },
          ],
          name: 'price', type: 'tuple',
        }],
        stateMutability: 'view', type: 'function',
      }] as const,
      functionName: 'getPriceUnsafe',
      args: [priceFeedId as `0x${string}`],
    })

    const price = getPriceFromUnsafe(priceUnsafe)
    _priceCache.set(priceKey, { value: price, ts: Date.now() })
    return price
  } catch (error) {
    console.warn('Cannot get Pyth price', error)
    return 0
  }
}

// ABI fragments used by both single + batch helpers below.
const PRICE_FEED_IDS_ABI = [{
  inputs: [{ name: '', type: 'address' }],
  name: 'priceFeedIds',
  outputs: [{ name: '', type: 'bytes32' }],
  stateMutability: 'view', type: 'function',
}] as const

const GET_PRICE_UNSAFE_ABI = [{
  inputs: [{ name: 'id', type: 'bytes32' }],
  name: 'getPriceUnsafe',
  outputs: [{
    components: [
      { name: 'price', type: 'int64' },
      { name: 'conf', type: 'uint64' },
      { name: 'expo', type: 'int32' },
      { name: 'publishTime', type: 'uint256' },
    ],
    name: 'price', type: 'tuple',
  }],
  stateMutability: 'view', type: 'function',
}] as const

/**
 * Batched version of getPythPrice. Combines N tokens' priceFeedId lookups
 * into one multicall, then N getPriceUnsafe lookups into a second multicall.
 *
 * Per N tokens, this is 2 RPC calls TOTAL instead of 2N. Used by the
 * token-select modal which renders prices for every token the user holds
 * — previously that was a `useQueries` fan-out of getPythPrice, causing
 * 20+ RPC calls per modal open with a typical wallet.
 *
 * Reads + writes the same shared _feedIdCache / _priceCache that
 * getPythPrice uses, so a follow-up single-token lookup hits the cache.
 * Returns a Record keyed by lowercase token address.
 */
export async function getPythPricesBatch(
  addresses: string[],
  chainId: number,
  version: number,
): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  if (!addresses.length || !chainId) return result

  const { RPC_URLS, PYTH_ADDRESS } = await import('../constants/addresses')
  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const factoryAddr = getFactoryAddress(chainId, version)
  if (!factoryAddr) return result

  // Dedup by lowercase address. Drop any token whose feedId we already have
  // cached so we don't pay for the multicall slot on cache hits.
  const lowered = addresses.map((a) => a.toLowerCase())
  const needFeedLookup: string[] = []
  const feedIdByAddress: Record<string, string> = {}
  for (const addr of lowered) {
    const cached = _feedIdCache.get(`${factoryAddr}:${addr}`.toLowerCase())
    if (cached) {
      feedIdByAddress[addr] = cached
    } else {
      needFeedLookup.push(addr)
    }
  }

  // Step 1: multicall the missing priceFeedIds. Falls back to single
  // readContract on multicall failure (e.g. Multicall3 not deployed) —
  // unlikely on supported chains but defensive.
  if (needFeedLookup.length > 0) {
    try {
      const feedResults = await client.multicall({
        contracts: needFeedLookup.map((addr) => ({
          address: factoryAddr as `0x${string}`,
          abi: PRICE_FEED_IDS_ABI,
          functionName: 'priceFeedIds',
          args: [addr as `0x${string}`],
        })),
        // createPublicClient here has no `chain` field; viem can't
        // auto-resolve Multicall3 from chain config. Universal canonical
        // Multicall3 address is deployed on every supported chain.
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        allowFailure: true,
      })
      feedResults.forEach((r, i) => {
        const addr = needFeedLookup[i]
        if (r.status === 'success' && r.result) {
          const id = r.result as string
          feedIdByAddress[addr] = id
          _feedIdCache.set(`${factoryAddr}:${addr}`.toLowerCase(), id)
        }
      })
    } catch (e) {
      console.warn('getPythPricesBatch: feedIds multicall failed', e)
      return result
    }
  }

  // Filter out tokens without a real feed (zero hash) — calling
  // getPriceUnsafe(0x0…0) reverts and pollutes the multicall failure rate.
  const priced: Array<{ addr: string; feedId: string }> = []
  for (const addr of lowered) {
    const feedId = feedIdByAddress[addr]
    if (!feedId || /^0x0+$/.test(feedId)) continue
    // Honor the 5s price TTL — if cached, skip the RPC slot entirely.
    const priceKey = `${chainId}:${feedId}`
    const cached = _priceCache.get(priceKey)
    if (cached && Date.now() - cached.ts < _PRICE_TTL) {
      result[addr] = cached.value
      continue
    }
    priced.push({ addr, feedId })
  }

  if (priced.length === 0) return result

  // Step 2: multicall the missing prices.
  try {
    const priceResults = await client.multicall({
      contracts: priced.map(({ feedId }) => ({
        address: PYTH_ADDRESS[chainId] as `0x${string}`,
        abi: GET_PRICE_UNSAFE_ABI,
        functionName: 'getPriceUnsafe',
        args: [feedId as `0x${string}`],
      })),
      multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      allowFailure: true,
    })
    priceResults.forEach((r, i) => {
      const { addr, feedId } = priced[i]
      if (r.status === 'success' && r.result) {
        const price = getPriceFromUnsafe(r.result as any)
        if (Number.isFinite(price) && price > 0) {
          result[addr] = price
          _priceCache.set(`${chainId}:${feedId}`, { value: price, ts: Date.now() })
        }
      }
    })
  } catch (e) {
    console.warn('getPythPricesBatch: prices multicall failed', e)
  }

  return result
}

/**
 * Fetches Pyth oracle prices for both tokens in a pair.
 */
export async function getPythPricePair(pair: any, chainId: number): Promise<[number, number]> {
  if (!pair || !chainId) return [0, 0]
  try {
    const { RPC_URLS, PYTH_ADDRESS } = await import('../constants/addresses')

    const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })

    const ABI_PAIR = [{
      inputs: [], name: 'priceFeed',
      outputs: [{ name: '', type: 'address' }],
      stateMutability: 'view', type: 'function',
    }, {
      inputs: [], name: 'qti',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view', type: 'function',
    }] as const

    const ABI_PYTH_PRICE_FEED = [{
      inputs: [], name: 'baseTokenPriceId',
      outputs: [{ name: '', type: 'bytes32' }],
      stateMutability: 'view', type: 'function',
    }, {
      inputs: [], name: 'quoteTokenPriceId',
      outputs: [{ name: '', type: 'bytes32' }],
      stateMutability: 'view', type: 'function',
    }, {
      inputs: [], name: 'latestRoundData',
      outputs: [
        { name: 'roundId', type: 'uint80' },
        { name: 'answer', type: 'int256' },
        { name: 'startedAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'answeredInRound', type: 'uint80' },
      ],
      stateMutability: 'view', type: 'function',
    }] as const

    const ABI_PYTH_UPGRADABLE = [{
      inputs: [{ name: 'id', type: 'bytes32' }],
      name: 'getPriceUnsafe',
      outputs: [{
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' },
        ],
        name: 'price', type: 'tuple',
      }],
      stateMutability: 'view', type: 'function',
    }] as const

    const pairAddress = pair.liquidityToken.address as `0x${string}`

    const [priceFeedAddress, qti] = await Promise.all([
      client.readContract({
        address: pairAddress,
        abi: ABI_PAIR,
        functionName: 'priceFeed',
      }),
      client.readContract({
        address: pairAddress,
        abi: ABI_PAIR,
        functionName: 'qti',
      }),
    ])

    // U2U special case: uses latestRoundData instead of Pyth
    if (chainId === ChainId.U2U_MAINNET) {
      const latestRoundData = await client.readContract({
        address: priceFeedAddress as `0x${string}`,
        abi: ABI_PYTH_PRICE_FEED,
        functionName: 'latestRoundData',
      })
      return [1, Number(latestRoundData[1]) / Math.pow(10, 18)]
    }

    const [basePriceId, quotePriceId] = await Promise.all([
      client.readContract({
        address: priceFeedAddress as `0x${string}`,
        abi: ABI_PYTH_PRICE_FEED,
        functionName: 'baseTokenPriceId',
      }),
      client.readContract({
        address: priceFeedAddress as `0x${string}`,
        abi: ABI_PYTH_PRICE_FEED,
        functionName: 'quoteTokenPriceId',
      }),
    ])

    // Either side may be the zero hash on pairs whose tokens aren't fully
    // registered with Pyth. Calling getPriceUnsafe(0x0…0) reverts and
    // pollutes the console. Return 0 for the missing side so callers can
    // gracefully fall back to indexer / API prices.
    const isZeroHash = (h: string) => !h || /^0x0+$/.test(h)
    const [priceUnsafe0, priceUnsafe1] = await Promise.all([
      isZeroHash(basePriceId as string)
        ? null
        : client.readContract({
            address: PYTH_ADDRESS[chainId] as `0x${string}`,
            abi: ABI_PYTH_UPGRADABLE,
            functionName: 'getPriceUnsafe',
            args: [basePriceId],
          }),
      isZeroHash(quotePriceId as string)
        ? null
        : client.readContract({
            address: PYTH_ADDRESS[chainId] as `0x${string}`,
            abi: ABI_PYTH_UPGRADABLE,
            functionName: 'getPriceUnsafe',
            args: [quotePriceId],
          }),
    ])
    if (!priceUnsafe0 || !priceUnsafe1) {
      const p0 = priceUnsafe0 ? getPriceFromUnsafe(priceUnsafe0) : 0
      const p1 = priceUnsafe1 ? getPriceFromUnsafe(priceUnsafe1) : 0
      return Number(qti) === 0 ? [p1, p0] : [p0, p1]
    }

    const prices: [number, number] = [getPriceFromUnsafe(priceUnsafe0), getPriceFromUnsafe(priceUnsafe1)]
    return Number(qti) === 0 ? (prices.reverse() as [number, number]) : prices
  } catch (error) {
    console.warn('Cannot get Pyth price', error)
    return [0, 0]
  }
}
