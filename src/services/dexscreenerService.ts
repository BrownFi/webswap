import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.dexscreener.com/latest/dex'
})

const getTokenPrice = (address: string) =>
  client.get(`/tokens/${address}`).then(data => {
    const pair = data.data.pairs.find(
      (pair: any) => pair.baseToken.name.includes('USD') || pair.quoteToken.name.includes('USD')
    )
    return Number(pair?.priceUsd) || 0
  })

export const dexscreenerService = {
  getTokenPrice
}
