import { Pair } from '@brownfi/sdk'
import { useEffect, useState } from 'react'
import { useVersion } from './useVersion'
import { useActiveWeb3React } from 'hooks'

type Props = {
  pair: Pair
}

export const useTradingFee = ({ pair }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const [tradingFee, setTradingFee] = useState(0)

  useEffect(() => {
    const getTradingFee = async () => {
      setTradingFee((await pair.getTradingFee()) * (version === 1 ? 2 : 1))
    }
    getTradingFee()
  }, [pair.liquidityToken.address])

  return tradingFee
}
