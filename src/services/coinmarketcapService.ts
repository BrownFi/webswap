import axios from 'axios'
import { dexscreenerService } from './dexscreenerService'

const client = axios.create({
  baseURL: 'https://api.coinmarketcap.com/data-api/v3.3',
})

const CoinMarketCapMap: Record<string, number> = {
  C98: 10903,
  WVIC: 2570,
  HONEY: 35670,
  WBERA: 35608,
}

const getTokenPrice = (address: string, symbol?: string) => {
  const id = CoinMarketCapMap[symbol || '-']
  if (id) {
    return client.get(`/cryptocurrency/detail/chart`, { params: { id, interval: '1m' } }).then((data) => {
      const points = data.data.data.points
      return points[points.length - 1]['v'][0]
    })
  } else {
    return dexscreenerService.getTokenPrice(address, symbol)
  }
}

export const coinmarketcapService = {
  getTokenPrice,
}
