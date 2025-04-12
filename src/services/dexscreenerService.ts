import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.dexscreener.com/latest/dex'
})

const getTokenPrice = (address: string, symbol?: string) =>
  client.get(`/tokens/${address}`).then(data => {
    const pair = data.data.pairs.find((pair: any) => {
      if (symbol === 'HONEY') {
        return pair.baseToken.symbol.includes('NECT')
      } else {
        return pair.baseToken.symbol.includes('USD') || pair.quoteToken.symbol.includes('USD')
      }
    })
    return Number(pair?.priceUsd) || 0
  })

export const dexscreenerService = {
  getTokenPrice
}
