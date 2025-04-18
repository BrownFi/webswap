import { Pair } from '@brownfi/sdk'
import { useEffect, useState } from 'react'

type Props = {
  pair: Pair
}

export const useTradingFee = ({ pair }: Props) => {
  const [tradingFee, setTradingFee] = useState(0)

  useEffect(() => {
    const getTradingFee = async () => {
      setTradingFee(await pair.getTradingFee())
    }
    getTradingFee()
  }, [pair.liquidityToken.address])

  return tradingFee
}
