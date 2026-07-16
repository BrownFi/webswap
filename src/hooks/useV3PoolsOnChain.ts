/**
 * On-chain V3 pool enumeration — bypasses the GraphQL indexer.
 *
 * Why this exists: when the V3 factory address changes (v3-final on beta),
 * the indexer is still tracking the OLD factory. Pool list + detail pages
 * would show stale entries that can't actually be used. This hook reads
 * `factory.allPairs()` directly and rehydrates each pool's state via
 * Multicall3 so the FE shows what's actually on-chain on the new factory.
 *
 * Trade-off: time-series fields (tvl, apr, volumeDay, volume7Day) come back
 * as 0 because they require indexer history. The list renders, sorting is
 * weak, charts are blank. This is acceptable for testing during the
 * window between contract deploy and indexer catch-up.
 */
import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http } from 'viem'
import type { PairStats } from 'components/PositionCard/usePoolStats'
import { FACTORY_ADDRESS_V3_OFFICIAL, RPC_URLS, hasV3Official } from 'lib/sdk/constants/addresses'
import { GET_CONFIG_ABI, fromQ64, fromPrec } from 'utils/v3Config'

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

const FACTORY_ABI = [
  { inputs: [], name: 'allPairsLength', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ type: 'uint256' }], name: 'allPairs', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'pairConfig', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
] as const

const PAIR_ABI = [
  { inputs: [], name: 'token0', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'token1', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getReserves', outputs: [{ type: 'uint112' }, { type: 'uint112' }, { type: 'uint32' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const


type ConfigStruct = {
  kB: bigint
  kQ: bigint
  lambda: bigint
  fee: number
  feeSplit: number
  compress: number
  sSell: number
  sBuy: number
  fixS: number
  disThreshold: number
  sBound: number
  pythWeight: number
  gamma: number
}

const decodeConfig = (cfg: ConfigStruct) => ({
  kB: fromQ64(cfg.kB),
  kQ: fromQ64(cfg.kQ),
  lambda: fromQ64(cfg.lambda),
  fee: fromPrec(cfg.fee),
  feeSplit: fromPrec(cfg.feeSplit),
  compress: fromPrec(cfg.compress),
  sSell: fromPrec(cfg.sSell),
  sBuy: fromPrec(cfg.sBuy),
  fixS: fromPrec(cfg.fixS),
  disThreshold: fromPrec(cfg.disThreshold),
  sBound: fromPrec(cfg.sBound),
  pythWeight: fromPrec(cfg.pythWeight),
  gamma: fromPrec(cfg.gamma),
})

const ERC20_ABI = [
  { inputs: [], name: 'symbol', outputs: [{ type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'name', outputs: [{ type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const

type FetchedToken = {
  id: string
  decimals: number
  symbol: string
  name: string
  price: number
  priceFeedId: string
  totalSupply: number
}

async function fetchV3PoolsOnChain(chainId: number): Promise<PairStats[]> {
  const factory = FACTORY_ADDRESS_V3_OFFICIAL[chainId]
  const rpc = RPC_URLS[chainId]
  if (!factory || !rpc) return []

  const client = createPublicClient({ transport: http(rpc) })

  // Resolve PairConfig + allPairsLength in parallel — both are factory-level
  // reads that don't depend on per-pool data.
  const [lengthBig, pairConfigAddr] = await Promise.all([
    client.readContract({ address: factory as `0x${string}`, abi: FACTORY_ABI, functionName: 'allPairsLength' }),
    client.readContract({ address: factory as `0x${string}`, abi: FACTORY_ABI, functionName: 'pairConfig' }),
  ])
  const length = Number(lengthBig)
  if (length === 0) return []

  // Step 1: pool addresses (one multicall, N reads).
  const addrCalls = Array.from({ length }, (_, i) => ({
    address: factory as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'allPairs' as const,
    args: [BigInt(i)],
  }))
  const addrResp = await client.multicall({
    contracts: addrCalls,
    multicallAddress: MULTICALL3,
    allowFailure: true,
  })
  const pairAddresses = addrResp
    .map((r) => (r.status === 'success' ? (r.result as string) : undefined))
    .filter((a): a is string => !!a && a !== '0x0000000000000000000000000000000000000000')

  if (pairAddresses.length === 0) return []

  // Step 2: per-pair core state (token0/1, reserves, supply) + per-pair
  // config (PairConfig.getConfig) in a single multicall — 5 calls per pool.
  const poolCalls = pairAddresses.flatMap((addr) => [
    { address: addr as `0x${string}`, abi: PAIR_ABI, functionName: 'token0' as const },
    { address: addr as `0x${string}`, abi: PAIR_ABI, functionName: 'token1' as const },
    { address: addr as `0x${string}`, abi: PAIR_ABI, functionName: 'getReserves' as const },
    { address: addr as `0x${string}`, abi: PAIR_ABI, functionName: 'totalSupply' as const },
    { address: pairConfigAddr as `0x${string}`, abi: GET_CONFIG_ABI, functionName: 'getConfig' as const, args: [addr as `0x${string}`] },
  ])
  const poolResp = await client.multicall({
    contracts: poolCalls,
    multicallAddress: MULTICALL3,
    allowFailure: true,
  })

  type PoolRaw = {
    id: string
    token0Addr: string
    token1Addr: string
    reserve0Raw: bigint
    reserve1Raw: bigint
    totalSupplyRaw: bigint
    config: ReturnType<typeof decodeConfig> | null
  }
  const pools: PoolRaw[] = []
  for (let i = 0; i < pairAddresses.length; i++) {
    const base = i * 5
    const r = poolResp.slice(base, base + 5)
    // token0/token1/reserves are required to render a row. totalSupply and
    // config are best-effort (config can revert if PairConfig lookup fails
    // for any reason — the row still renders with config fields blank).
    if (r[0].status !== 'success' || r[1].status !== 'success' || r[2].status !== 'success') continue
    const reserves = r[2].result as readonly [bigint, bigint, number]
    pools.push({
      id: pairAddresses[i],
      token0Addr: r[0].result as string,
      token1Addr: r[1].result as string,
      reserve0Raw: reserves[0],
      reserve1Raw: reserves[1],
      totalSupplyRaw: r[3].status === 'success' ? (r[3].result as bigint) : 0n,
      config: r[4].status === 'success' ? decodeConfig(r[4].result as ConfigStruct) : null,
    })
  }
  if (pools.length === 0) return []

  // Step 3: unique token metadata. Many pools share tokens; dedupe to keep
  // the multicall small.
  const uniqueTokens = Array.from(new Set(pools.flatMap((p) => [p.token0Addr, p.token1Addr]).map((a) => a.toLowerCase())))
  const tokenCalls = uniqueTokens.flatMap((addr) => [
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'name' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'totalSupply' as const },
  ])
  const tokenResp = await client.multicall({
    contracts: tokenCalls,
    multicallAddress: MULTICALL3,
    allowFailure: true,
  })
  const tokenMap: Record<string, FetchedToken> = {}
  for (let i = 0; i < uniqueTokens.length; i++) {
    const base = i * 4
    const r = tokenResp.slice(base, base + 4)
    const addr = uniqueTokens[i]
    const symbol = r[0].status === 'success' ? String(r[0].result) : '???'
    const name = r[1].status === 'success' ? String(r[1].result) : symbol
    const decimals = r[2].status === 'success' ? Number(r[2].result) : 18
    const totalSupplyRaw = r[3].status === 'success' ? (r[3].result as bigint) : 0n
    tokenMap[addr] = {
      id: addr,
      decimals,
      symbol,
      name,
      // price/priceFeedId would come from the indexer's price feed mapping.
      // Leave at 0/empty — TVL columns will read 0 until indexer catches up.
      price: 0,
      priceFeedId: '',
      totalSupply: Number(totalSupplyRaw) / 10 ** decimals,
    }
  }

  // Shape match: convert raw reserves → float in token units (the indexer
  // ships floats too), keep indexer-only fields at 0 so columns render.
  return pools.map((p): PairStats => {
    const t0 = tokenMap[p.token0Addr.toLowerCase()]
    const t1 = tokenMap[p.token1Addr.toLowerCase()]
    const reserve0 = Number(p.reserve0Raw) / 10 ** (t0?.decimals ?? 18)
    const reserve1 = Number(p.reserve1Raw) / 10 ** (t1?.decimals ?? 18)
    const totalSupply = Number(p.totalSupplyRaw) / 1e18
    return {
      __typename: 'pair',
      id: p.id,
      // Trading fee is a fraction (e.g. 0.003 = 0.3%); PairStats.fee is a
      // number with that interpretation per the indexer schema, so pass the
      // decoded fraction directly.
      fee: p.config?.fee ?? 0,
      protocolFee: 0,
      feeDay: 0,
      totalSupply,
      reserve0,
      reserve1,
      tvl: 0,
      apr: 0,
      volumeDay: 0,
      volume7Day: 0,
      updatedAt: Math.floor(Date.now() / 1000),
      lambda: p.config?.lambda,
      kB: p.config?.kB,
      kQ: p.config?.kQ,
      feeSplit: p.config?.feeSplit,
      compress: p.config?.compress,
      sSell: p.config?.sSell,
      sBuy: p.config?.sBuy,
      fixS: p.config?.fixS,
      disThreshold: p.config?.disThreshold,
      sBound: p.config?.sBound,
      pythWeight: p.config?.pythWeight,
      gamma: p.config?.gamma,
      uniV2Price: undefined,
      token0: t0 ?? null,
      token1: t1 ?? null,
    }
  })
}

export function useV3PoolsOnChain(chainId: number | undefined, enabled: boolean) {
  return useQuery<PairStats[]>({
    queryKey: ['v3PoolsOnChain', chainId],
    queryFn: () => fetchV3PoolsOnChain(chainId as number),
    enabled: enabled && hasV3Official(chainId), // env-gated: pilot pools hidden on mainnet
    // Reserves/supply move every block on an active pool — 30s keeps the
    // numbers reasonably fresh without hammering RPC.
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

async function fetchV3PoolOnChain(chainId: number, pairAddress: string): Promise<PairStats | null> {
  const factory = FACTORY_ADDRESS_V3_OFFICIAL[chainId]
  const rpc = RPC_URLS[chainId]
  if (!factory || !rpc) return null

  const client = createPublicClient({ transport: http(rpc) })
  // Need PairConfig address to fetch per-pair config. Read it in parallel with
  // pair state below; one extra factory hop avoids hardcoding the PairConfig
  // address (it can change via factory.setPairConfig).
  const pairConfigAddr = await client.readContract({
    address: factory as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'pairConfig',
  })
  const calls = [
    { address: pairAddress as `0x${string}`, abi: PAIR_ABI, functionName: 'token0' as const },
    { address: pairAddress as `0x${string}`, abi: PAIR_ABI, functionName: 'token1' as const },
    { address: pairAddress as `0x${string}`, abi: PAIR_ABI, functionName: 'getReserves' as const },
    { address: pairAddress as `0x${string}`, abi: PAIR_ABI, functionName: 'totalSupply' as const },
    { address: pairConfigAddr as `0x${string}`, abi: GET_CONFIG_ABI, functionName: 'getConfig' as const, args: [pairAddress as `0x${string}`] },
  ]
  const r = await client.multicall({ contracts: calls, multicallAddress: MULTICALL3, allowFailure: true })
  if (r[0].status !== 'success' || r[1].status !== 'success' || r[2].status !== 'success') return null

  const token0Addr = (r[0].result as string).toLowerCase()
  const token1Addr = (r[1].result as string).toLowerCase()
  const reserves = r[2].result as readonly [bigint, bigint, number]
  const totalSupplyRaw = r[3].status === 'success' ? (r[3].result as bigint) : 0n
  const config = r[4].status === 'success' ? decodeConfig(r[4].result as ConfigStruct) : null

  // Token metadata in a second multicall (skip if a single batch would have
  // bloated the first call; keeping these split mirrors the list-hook layout).
  const tokenCalls = [token0Addr, token1Addr].flatMap((addr) => [
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'name' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' as const },
    { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'totalSupply' as const },
  ])
  const tr = await client.multicall({ contracts: tokenCalls, multicallAddress: MULTICALL3, allowFailure: true })
  const readToken = (base: number, addr: string): FetchedToken => {
    const symbol = tr[base].status === 'success' ? String(tr[base].result) : '???'
    const name = tr[base + 1].status === 'success' ? String(tr[base + 1].result) : symbol
    const decimals = tr[base + 2].status === 'success' ? Number(tr[base + 2].result) : 18
    const ts = tr[base + 3].status === 'success' ? (tr[base + 3].result as bigint) : 0n
    return { id: addr, decimals, symbol, name, price: 0, priceFeedId: '', totalSupply: Number(ts) / 10 ** decimals }
  }
  const t0 = readToken(0, token0Addr)
  const t1 = readToken(4, token1Addr)

  return {
    __typename: 'pair',
    id: pairAddress,
    fee: config?.fee ?? 0,
    protocolFee: 0,
    feeDay: 0,
    totalSupply: Number(totalSupplyRaw) / 1e18,
    reserve0: Number(reserves[0]) / 10 ** t0.decimals,
    reserve1: Number(reserves[1]) / 10 ** t1.decimals,
    tvl: 0,
    apr: 0,
    volumeDay: 0,
    volume7Day: 0,
    updatedAt: Math.floor(Date.now() / 1000),
    lambda: config?.lambda,
    kB: config?.kB,
    kQ: config?.kQ,
    feeSplit: config?.feeSplit,
    compress: config?.compress,
    sSell: config?.sSell,
    sBuy: config?.sBuy,
    fixS: config?.fixS,
    disThreshold: config?.disThreshold,
    sBound: config?.sBound,
    pythWeight: config?.pythWeight,
    gamma: config?.gamma,
    uniV2Price: undefined,
    token0: t0,
    token1: t1,
  }
}

export function useV3PoolOnChain(chainId: number | undefined, pairAddress: string | undefined, enabled: boolean) {
  return useQuery<PairStats | null>({
    queryKey: ['v3PoolOnChain', chainId, pairAddress?.toLowerCase()],
    queryFn: () => fetchV3PoolOnChain(chainId as number, pairAddress as string),
    enabled: enabled && !!chainId && !!pairAddress && !!FACTORY_ADDRESS_V3_OFFICIAL[chainId as number],
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
