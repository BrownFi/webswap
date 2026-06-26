import { ChainId, Currency, Field, getHermesPrices } from '@brownfi/sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { wrappedCurrency } from 'utils/wrappedCurrency'

type Props = {
  chainId: ChainId
  currencyA?: Currency | null
  currencyB?: Currency | null
  version: number
  enabled?: boolean
}

/**
 * Live Hermes prices for add-liquidity sizing.
 *
 * The router self-updates the on-chain oracle from the fresh Hermes blob inside
 * the add tx, so the contract always executes at the live price. Reading that
 * same live price here makes the FE's sized amounts match what `mint()` computes
 * on EVERY chain — independent of any on-chain oracle's staleness or whether a
 * keeper is running. Returns `{ [CURRENCY_A], [CURRENCY_B] }`; a side is `0` when
 * Hermes is unavailable or the token has no feed, so callers can fall back to
 * the on-chain oracle read (`usePythPrices`).
 */
export const useHermesPrices = ({ chainId, currencyA, currencyB, version, enabled = true }: Props) => {
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const { data } = useQuery({
    queryKey: ['hermesPrices', chainId, tokenA?.address, tokenB?.address, version],
    queryFn: () => getHermesPrices([tokenA!.address, tokenB!.address], chainId, version),
    enabled: enabled && !!tokenA && !!tokenB && !!chainId && version >= 2,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  })

  return {
    [Field.CURRENCY_A]: tokenA ? data?.[tokenA.address.toLowerCase()] ?? 0 : 0,
    [Field.CURRENCY_B]: tokenB ? data?.[tokenB.address.toLowerCase()] ?? 0 : 0,
  }
}
