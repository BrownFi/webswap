import { Pair } from '@brownfi/sdk'
import axios, { AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

type PoolStat = {
  amountToken0: string
  amountToken1: string
  apy: string
  revenue: string
  tvlAll: string
  volume24h: string
  volume30d: string
  volume7d: string
  volumeAll: string
}

const getPoolStats = (pair: Pair) =>
  client.get(`/pool-stats/${pair.token0.address}-${pair.token1.address}`).then((data: AxiosResponse<PoolStat>) => {
    return data.data
  })

export const internalService = {
  getPoolStats
}
