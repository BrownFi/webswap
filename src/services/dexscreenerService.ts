import { ChainId } from '@brownfi/sdk'
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.dexscreener.com/latest/dex',
})

const getBerascan = async (address: string) => {
  const data = await axios.get(`https://cdn.routescan.io/api/evm/all/erc20/search`, {
    params: {
      query: address,
    },
  })
  return data.data.items[0]?.price
}

const getVicscan = async (address: string) => {
  const data = await axios.get(`https://www.vicscan.xyz/api/token/${address}`)
  return data.data.price
}

const getTokenPrice = async (address: string, symbol?: string, chainId?: ChainId) => {
  if (chainId === ChainId.BERA_MAINNET) {
    return getBerascan(address)
  }
  if (chainId === ChainId.VICTION_MAINNET) {
    return getVicscan(address)
  }

  return await client.get(`/tokens/${address}`).then((data) => {
    const pair = data.data.pairs.find((pair: any) => {
      if (symbol === 'HONEY') {
        return pair.baseToken.symbol.includes('NECT')
      } else {
        return pair.baseToken.symbol.includes('USD') || pair.quoteToken.symbol.includes('USD')
      }
    })
    return Number(pair?.priceUsd) || 0
  })
}

export const dexscreenerService = {
  getTokenPrice,
}
