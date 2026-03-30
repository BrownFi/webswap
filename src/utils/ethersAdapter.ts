import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@brownfi/sdk'
import { WalletClient } from 'viem'
import { availableChains } from 'connectors'

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

const readOnlyProviders: Record<number, StaticJsonRpcProvider> = {}

/**
 * Get a cached read-only provider for a given chain.
 * Used when no wallet is connected or for read-only contract calls.
 */
export function getReadOnlyProvider(chainId: ChainId): StaticJsonRpcProvider {
  if (!readOnlyProviders[chainId]) {
    const chain = availableChains.find((c) => c.id === chainId)
    const rpcUrl = chain?.rpcUrls.default.http[0] ?? 'https://eth.llamarpc.com'
    const provider = new StaticJsonRpcProvider(rpcUrl, chainId)
    provider.pollingInterval = 30_000 // Match production: poll every 30s, not 4s
    readOnlyProviders[chainId] = provider
  }
  return readOnlyProviders[chainId]
}
