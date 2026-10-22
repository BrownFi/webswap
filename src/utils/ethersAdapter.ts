import { BaseProvider, FallbackProvider, StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@brownfi/sdk'
import { WalletClient } from 'viem'
import { availableChains } from 'connectors'
import { rpcUrlsFor } from 'lib/sdk/rpc'

/**
 * Convert a viem WalletClient (from wagmi) to an ethers Web3Provider.
 * This bridges wagmi/viem to the ethers v5 interface required by @brownfi/sdk.
 */
export function walletClientToProvider(walletClient: WalletClient): Web3Provider {
  const { chain, transport } = walletClient
  const network = {
    chainId: chain!.id,
    name: chain!.name,
    ensAddress: chain!.contracts?.ensRegistry?.address,
  }
  return new Web3Provider(transport, network)
}

const readOnlyProviders: Record<number, BaseProvider> = {}

/** Give up on a node this slow and try the next one. */
const STALL_TIMEOUT_MS = 4_000

/**
 * Get a cached read-only provider for a given chain.
 * Used when no wallet is connected or for read-only contract calls.
 *
 * Spreads across EVERY RPC known for the chain (`rpcUrlsFor`, the same ordered
 * list `createReadClient` uses) instead of pinning the first URL. This provider
 * backs the multicall contract, so balances, allowances and reserves all used to
 * hang on one node with no retry and no rotation — and a hung read is invisible:
 * `useApproveCallback` reports ApprovalState.UNKNOWN, which renders a greyed-out
 * "Approve" button that does nothing when clicked, so the app merely looks broken.
 *
 * quorum 1 = first successful answer wins (these are plain reads; there is no
 * value in making N nodes agree), and `stallTimeout` moves on from a slow node
 * rather than waiting it out.
 */
export function getReadOnlyProvider(chainId: ChainId): BaseProvider {
  if (!readOnlyProviders[chainId]) {
    const chain = availableChains.find((c) => c.id === chainId)
    const urls = rpcUrlsFor(chainId)
    if (!urls.length) {
      const single = chain?.rpcUrls.default.http[0] ?? 'https://eth.llamarpc.com'
      urls.push(single)
    }
    const provider =
      urls.length === 1
        ? new StaticJsonRpcProvider(urls[0], chainId)
        : new FallbackProvider(
            urls.map((url, i) => ({
              provider: new StaticJsonRpcProvider(url, chainId),
              priority: i + 1, // keep the configured order as the preference order
              stallTimeout: STALL_TIMEOUT_MS,
              weight: 1,
            })),
            1,
          )
    provider.pollingInterval = 30_000 // Match production: poll every 30s, not 4s
    readOnlyProviders[chainId] = provider
  }
  return readOnlyProviders[chainId]
}
