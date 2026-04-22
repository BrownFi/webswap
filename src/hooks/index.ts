import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@brownfi/sdk'
import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { availableChains } from 'connectors'
import { useAccount, useWalletClient } from 'wagmi'
import { useDispatch, useSelector } from 'react-redux'
import { chainSelector, switchChain } from 'state/chainSlice'
import { isAddress } from 'utils'
import { walletClientToProvider, getReadOnlyProvider } from 'utils/ethersAdapter'

const mockAccounts: Record<string, string> =
  import.meta.env.MODE !== 'production'
    ? {
        neikop: '0x9fb15eD1b5eF911F4EB3046FACF3fF1c67aaAEB4',
        kane: '0xdE3EE2Bf6c04E2a4C8aaE988A191AF6f8Cbd9F76',
      }
    : {}

export function useActiveWeb3React(): { library: Web3Provider; account?: string | null; chainId: ChainId } {
  const { address, chainId: networkChainId, isConnected, status } = useAccount()
  const { data: walletClient } = useWalletClient()

  const { search } = useLocation()
  const mockAccount = useMemo(() => {
    if (import.meta.env.MODE === 'production') return undefined
    const searchParams = new URLSearchParams(search)
    const account = searchParams.get('account')
    if (account && mockAccounts[account]) return mockAccounts[account]
    const parsedAccount = account ? isAddress(account) : false
    return typeof parsedAccount === 'string' ? parsedAccount : undefined
  }, [search])

  const currentChain = useSelector(chainSelector)
  const dispatch = useDispatch()
  const isWrongNetwork = availableChains.every((chain) => chain.id !== networkChainId)
  // While wagmi is connecting/reconnecting, networkChainId may briefly be undefined.
  // Keep currentChain.id during that window so we don't flicker.
  const isSettling = status === 'connecting' || status === 'reconnecting'
  const chainId = (isConnected && !isWrongNetwork
    ? networkChainId
    : isSettling
    ? currentChain.id
    : currentChain.id) as ChainId

  // Keep Redux-selected chain in sync with the wallet's active chain
  // so disconnect doesn't fall back to a stale persisted chain.
  useEffect(() => {
    if (!isConnected || isWrongNetwork) return
    if (networkChainId && networkChainId !== currentChain.id) {
      const next = availableChains.find((c) => c.id === networkChainId)
      if (next) dispatch(switchChain(JSON.parse(JSON.stringify(next))))
    }
  }, [isConnected, isWrongNetwork, networkChainId, currentChain.id, dispatch])

  const library = useMemo(() => {
    if (walletClient && isConnected && !isWrongNetwork) {
      return walletClientToProvider(walletClient)
    }
    return (getReadOnlyProvider(chainId) as unknown) as Web3Provider
  }, [walletClient, chainId, isConnected, isWrongNetwork])

  return {
    library,
    account: mockAccount || address || undefined,
    chainId,
  }
}
