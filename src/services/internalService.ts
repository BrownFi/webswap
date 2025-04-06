import axios, { AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

type PoolStat = {
  amountToken0: string
  amountToken1: string
  apr: string
  revenue: string
  tvlAll: string
  volume24h: string
  volume30d: string
  volume7d: string
  volumeAll: string
}

const getPoolStats = (poolAddress: string) =>
  client.get(`/pool-stats/${poolAddress}`).then((data: AxiosResponse<PoolStat>) => {
    return data.data
  })

export default {
  getPoolStats
}
