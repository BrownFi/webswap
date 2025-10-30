import axios, { AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: process.env.REACT_APP_API_V2_URL,
  withCredentials: true,
})

type PoolPrices = {
  chainId: number
  price0: string
  price1: string
  timestamp: number
  tokenA: string
  tokenB: string
}

const getPoolPrices = (options?: { chainId: number; tokenA: string; tokenB: string }) =>
  client
    .get(`/prices`, {
      params: options,
    })
    .then((data: AxiosResponse<PoolPrices>) => {
      return data.data
    })

const getPoolBgt = (options: { address: string }) =>
  client
    .get(`/igbt-vault-apr`, {
      params: { pool: options.address },
    })
    .then((data: AxiosResponse<{ apr: number }>) => {
      return data.data
    })

export const apiV2Service = {
  getPoolPrices,
  getPoolBgt,
}
