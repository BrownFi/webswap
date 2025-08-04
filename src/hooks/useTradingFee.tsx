import { Pair } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { usePairV2Contract } from './useContract'
import { useVersion } from './useVersion'

type Props = {
  pair: Pair
}

export const useTradingFee = ({ pair }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const pairContract = usePairV2Contract(pair.liquidityToken.address)

  const fee = (useSingleCallResult(pairContract, 'fee').result?.[0] || 0) * (version === 2 ? 1 : 2)
  const precision = version === 2 ? useSingleCallResult(pairContract, 'PRECISION').result?.[0] || 100000000 : 10000

  return (Number(fee) * 100) / precision
}
