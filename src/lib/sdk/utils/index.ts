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
  ROUTER_ADDRESS_WITH_PRICE,
  FACTORY_ADDRESS,
  FACTORY_ADDRESS_V1,
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
  } catch (error) {
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
  return +price * Math.pow(10, +expo)
}

export function isContractWithPrice(chainId: number, version: number): boolean {
  return version === 1 && !!ROUTER_ADDRESS_WITH_PRICE[chainId]
}

export function getRouterAddress(chainId: number, version: number): string {
  return version === 2 ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS_V1[chainId]
}

export function getFactoryAddress(chainId: number, version: number): string {
  return version === 2 ? FACTORY_ADDRESS[chainId] : FACTORY_ADDRESS_V1[chainId]
}

export function getInitCodeHash(chainId: number, version: number): string {
  return version === 2 ? INIT_CODE_HASH[chainId] : INIT_CODE_HASH_V1[chainId]
}

/**
 * Fetches Pyth oracle price for a given token address.
 * Uses viem + Pyth on-chain contract to read the price feed.
 */
export async function getPythPrice(address: string, chainId: number, version: number): Promise<number> {
  if (!address || !chainId) return 0
  try {
    const { RPC_URLS, PYTH_ADDRESS } = await import('../constants/addresses')

    const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })

    const priceFeedId = await client.readContract({
      address: getFactoryAddress(chainId, version) as `0x${string}`,
      abi: [{
        inputs: [{ name: '', type: 'address' }],
        name: 'priceFeedIds',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view', type: 'function',
      }] as const,
      functionName: 'priceFeedIds',
      args: [address as `0x${string}`],
    })

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
      args: [priceFeedId],
    })

    return getPriceFromUnsafe(priceUnsafe)
  } catch (error) {
    console.warn('Cannot get Pyth price', error)
    return 0
  }
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

    const [priceUnsafe0, priceUnsafe1] = await Promise.all([
      client.readContract({
        address: PYTH_ADDRESS[chainId] as `0x${string}`,
        abi: ABI_PYTH_UPGRADABLE,
        functionName: 'getPriceUnsafe',
        args: [basePriceId],
      }),
      client.readContract({
        address: PYTH_ADDRESS[chainId] as `0x${string}`,
        abi: ABI_PYTH_UPGRADABLE,
        functionName: 'getPriceUnsafe',
        args: [quotePriceId],
      }),
    ])

    const prices: [number, number] = [getPriceFromUnsafe(priceUnsafe0), getPriceFromUnsafe(priceUnsafe1)]
    return Number(qti) === 0 ? (prices.reverse() as [number, number]) : prices
  } catch (error) {
    console.warn('Cannot get Pyth price', error)
    return [0, 0]
  }
}
