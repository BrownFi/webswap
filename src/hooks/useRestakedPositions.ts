import { JSBI, Token, TokenAmount } from '@brownfi/sdk'
import { useMemo } from 'react'
import ERC20_INTERFACE from 'constants/abis/erc20'
import { getRestakers, RestakerConfig } from 'constants/restakers'
import { useMultipleContractSingleData } from 'state/multicall/hooks'

export type RestakedPosition = {
  config: RestakerConfig
  balance: TokenAmount | undefined
  loading: boolean
}

/**
 * Reads the user's LP balance across all configured restaking vaults for a pair.
 * Returns one entry per configured vault; callers can filter out zero balances.
 */
export function useRestakedPositions({
  chainId,
  pair,
  account,
}: {
  chainId: number | undefined
  pair: { liquidityToken: Token } | undefined
  account: string | null | undefined
}): RestakedPosition[] {
  const pairAddress = pair?.liquidityToken.address
  const configs = useMemo(() => getRestakers(chainId, pairAddress), [chainId, pairAddress])

  const vaultAddresses = useMemo(() => configs.map((c) => c.vaultAddress), [configs])

  const callStates = useMultipleContractSingleData(
    account ? vaultAddresses : [],
    ERC20_INTERFACE,
    'balanceOf',
    [account ?? undefined],
    // Staked positions change rarely (only on user stake/unstake), so polling
    // every block on a fast chain like Bera is wasteful. 20 blocks ≈ 40s on Bera.
    { blocksPerFetch: 20 },
  )

  return useMemo(() => {
    if (!pair || configs.length === 0) return []
    return configs.map((config, i) => {
      const state = callStates[i]
      const raw = state?.result?.[0]
      const balance =
        raw !== undefined && pair.liquidityToken
          ? new TokenAmount(pair.liquidityToken, JSBI.BigInt(raw.toString()))
          : undefined
      return {
        config,
        balance,
        loading: state?.loading ?? false,
      }
    })
  }, [callStates, configs, pair])
}
