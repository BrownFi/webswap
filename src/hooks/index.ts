import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@brownfi/sdk'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { availableChains } from 'connectors'
import { useAccount, useWalletClient } from 'wagmi'
import { useSelector } from 'react-redux'
import { chainSelector } from 'state/chainSlice'
import { isAddress } from 'utils'
import { walletClientToProvider, getReadOnlyProvider } from 'utils/ethersAdapter'

const mockAccounts: Record<string, string> =
  process.env.NODE_ENV !== 'production'
    ? {
        neikop: '0x9fb15eD1b5eF911F4EB3046FACF3fF1c67aaAEB4',
        kane: '0xdE3EE2Bf6c04E2a4C8aaE988A191AF6f8Cbd9F76',
      }
    : {}

export function useActiveWeb3React(): { library: Web3Provider; account?: string | null; chainId: ChainId } {
  const { address, chainId: networkChainId, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const { search } = useLocation()
  const mockAccount = useMemo(() => {
    if (process.env.NODE_ENV === 'production') return undefined
    const searchParams = new URLSearchParams(search)
    const account = searchParams.get('account')
    if (account && mockAccounts[account]) return mockAccounts[account]
    const parsedAccount = account ? isAddress(account) : false
    return typeof parsedAccount === 'string' ? parsedAccount : undefined
  }, [search])

  const currentChain = useSelector(chainSelector)
  const isWrongNetwork = availableChains.every((chain) => chain.id !== networkChainId)
  const chainId = (isConnected && !isWrongNetwork ? networkChainId : currentChain.id) as ChainId

  const library = useMemo(() => {
    if (walletClient && isConnected && !isWrongNetwork) {
      return walletClientToProvider(walletClient)
    }
    return getReadOnlyProvider(chainId) as unknown as Web3Provider
  }, [walletClient, chainId, isConnected, isWrongNetwork])

  return {
    library,
    account: mockAccount || address || undefined,
    chainId,
  }
}
