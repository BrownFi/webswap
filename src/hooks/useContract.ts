import { useMemo } from 'react'

import { ChainId, PYTH_ADDRESS, WETH, getFactoryAddress } from '@brownfi/sdk'
import { Contract } from '@ethersproject/contracts'
import GOVERNANCE_ABI from '@uniswap/governance/build/GovernorAlpha.json'
import UNI_ABI from '@uniswap/governance/build/Uni.json'
import STAKING_REWARDS_ABI from '@uniswap/liquidity-staker/build/StakingRewards.json'
import MERKLE_DISTRIBUTOR_ABI from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import { availableChains } from 'connectors'
import { NetworkConnector } from 'connectors/NetworkConnector'

import IFactoryV2 from 'constants/abis/IBrownFiV2Factory.json'
import IPair from 'constants/abis/IPair.json'
import IPairV2 from 'constants/abis/IPairV2.json'
import IPythUpgradable from 'constants/abis/IPythUpgradable.json'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS,
} from 'constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from 'constants/abis/ens-public-resolver.json'
import ENS_ABI from 'constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from 'constants/abis/erc20'
import ERC20_ABI from 'constants/abis/erc20.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from 'constants/abis/migrator'
import UNISOCKS_ABI from 'constants/abis/unisocks.json'
import WETH_ABI from 'constants/abis/weth.json'
import { GOVERNANCE_ADDRESS, MERKLE_DISTRIBUTOR_ADDRESS } from 'constants/common'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from 'constants/v1'
import { getContract } from 'utils'

import { useActiveWeb3React } from './index'
import { useVersion } from './useVersion'

function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
  options?: { readonly?: boolean },
): Contract | null {
  const { library, account } = useActiveWeb3React()

  if (address && options?.readonly) {
    const contract = useReadContract(address, ABI)
    if (contract) return contract
  }

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

function useReadContract(address: string, ABI: any): Contract | null {
  const { chainId } = useActiveWeb3React()

  return useMemo(() => {
    const chain = availableChains.find((chain) => chain.id === chainId)
    if (chain) {
      const network = new NetworkConnector({
        urls: { [chain.id]: chain.rpcUrls.default.http as string[] },
        defaultChainId: chain.id,
      })
      try {
        return getContract(address, ABI, network.getEthersProvider())
      } catch (error) {
        console.error('Failed to get read contract', error)
        return null
      }
    }
    return null
  }, [chainId])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false,
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.SEPOLIA:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI.abi, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  let multicallAddress = chainId && MULTICALL_NETWORKS[chainId]
  if (!multicallAddress) {
    const chain = availableChains.find((chain) => chain.id === chainId)
    multicallAddress = chain?.contracts?.multicall3?.address
  }
  return useContract(multicallAddress, MULTICALL_ABI, false, { readonly: true })
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI.abi, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI.abi, true)
}

export function useUniContract(): Contract | null {
  return useContract(undefined, UNI_ABI.abi, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI.abi, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false,
  )
}

export function useFactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const factoryAddress = getFactoryAddress(chainId, version)
  return useContract(factoryAddress, IFactoryV2, false, { readonly: true })
}

export function usePythContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(PYTH_ADDRESS[chainId], IPythUpgradable, false, { readonly: true })
}

export function usePairV2Contract(pairAddress: string): Contract | null {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  return useContract(pairAddress, version === 2 ? IPairV2 : IPair, false, { readonly: true })
}
