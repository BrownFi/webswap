import { createPublicClient, http, parseAbiItem } from 'viem'

export type OnchainTxn = {
  id: string
  from: string
  kind: 'Swap' | 'Mint' | 'Burn'
  amount0In: number
  amount1In: number
  amount0Out: number
  amount1Out: number
  lpMint: number
  lpBurn: number
  blockNumber: number
  secondsAgo: number // approximation based on avg block time
  transactionHash: string
}

const swapEvent = parseAbiItem(
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, uint256 price0, uint256 price1, address indexed to)',
)
const mintEvent = parseAbiItem(
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 price0, uint256 price1, address indexed to)',
)
const burnEvent = parseAbiItem(
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)',
)

// Average block time per chain (seconds). Used to approximate tx "time ago"
// without spending one RPC call per unique block.
const AVG_BLOCK_TIME: Record<number, number> = {
  80094: 2,   // Berachain
  42161: 0.25, // Arbitrum
  8453: 2,    // Base
  56: 3,      // BSC
  999: 1,     // Hyperliquid
  59144: 2,   // Linea
  143: 1,     // Monad
}

/**
 * Fetch the most recent Swap / Mint / Burn transactions for a pair directly from RPC.
 * Minimal footprint: 2 RPC calls total (getBlockNumber + combined getLogs).
 * Timestamps are approximated from block delta × average block time.
 *
 * Optional `user` filters events where sender === user OR to === user.
 */
export async function fetchOnchainPairTransactions({
  chainId,
  pairAddress,
  decimals0,
  decimals1,
  user,
  lookbackBlocks = 1000,
  limit = 10,
}: {
  chainId: number
  pairAddress: string
  decimals0: number
  decimals1: number
  user?: string
  lookbackBlocks?: number
  limit?: number
}): Promise<OnchainTxn[]> {
  const { RPC_URLS } = await import('lib/sdk/constants/addresses')
  const rpc = RPC_URLS[chainId]
  if (!rpc) return []
  const client = createPublicClient({ transport: http(rpc) })

  const currentBlock = await client.getBlockNumber()
  const fromBlock = currentBlock > BigInt(lookbackBlocks) ? currentBlock - BigInt(lookbackBlocks) : 0n

  const logs = await client
    .getLogs({
      address: pairAddress as `0x${string}`,
      events: [swapEvent, mintEvent, burnEvent],
      fromBlock,
      toBlock: currentBlock,
    })
    .catch(() => [] as any[])

  const unit0 = 10 ** decimals0
  const unit1 = 10 ** decimals1
  const avgBlockTime = AVG_BLOCK_TIME[chainId] ?? 2
  const currentBlockNum = Number(currentBlock)
  const userLower = user ? user.toLowerCase() : null

  const mapped: OnchainTxn[] = []
  for (const l of logs as any[]) {
    const a = l.args as Record<string, any>
    const sender = (a.sender as string | undefined)?.toLowerCase()
    const to = (a.to as string | undefined)?.toLowerCase()
    if (userLower && sender !== userLower && to !== userLower) continue

    const bn = Number(l.blockNumber)
    const secondsAgo = Math.max(0, (currentBlockNum - bn) * avgBlockTime)
    const base = {
      id: `${l.transactionHash}-${l.logIndex}`,
      transactionHash: l.transactionHash as string,
      blockNumber: bn,
      secondsAgo,
      from: (a.to as string) ?? (a.sender as string) ?? '',
    }

    if (l.eventName === 'Swap') {
      mapped.push({
        ...base,
        kind: 'Swap',
        amount0In: Number(a.amount0In ?? 0n) / unit0,
        amount1In: Number(a.amount1In ?? 0n) / unit1,
        amount0Out: Number(a.amount0Out ?? 0n) / unit0,
        amount1Out: Number(a.amount1Out ?? 0n) / unit1,
        lpMint: 0,
        lpBurn: 0,
      })
    } else if (l.eventName === 'Mint') {
      mapped.push({
        ...base,
        kind: 'Mint',
        amount0In: Number(a.amount0 ?? 0n) / unit0,
        amount1In: Number(a.amount1 ?? 0n) / unit1,
        amount0Out: 0,
        amount1Out: 0,
        lpMint: 1,
        lpBurn: 0,
      })
    } else {
      mapped.push({
        ...base,
        kind: 'Burn',
        amount0In: 0,
        amount1In: 0,
        amount0Out: Number(a.amount0 ?? 0n) / unit0,
        amount1Out: Number(a.amount1 ?? 0n) / unit1,
        lpMint: 0,
        lpBurn: 1,
      })
    }
  }

  mapped.sort((a, b) => b.blockNumber - a.blockNumber)
  return mapped.slice(0, limit)
}
