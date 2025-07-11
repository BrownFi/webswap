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

type UserRank = {
  rank?: number
  address: string
  volume: string
  lastTimestamp: string
  firstTimestamp: string
  createdAt: string
  updatedAt: string
}

const getPoolStats = (pair: Pair) =>
  client.get(`/pool-stats/v2/${pair.liquidityToken.address.toLowerCase()}`).then((data: AxiosResponse<PoolStat>) => {
    return data.data
  })

const fetchLeaderboard = (params?: any) =>
  client.get(`/leaderboard-042025`, { params }).then((data: AxiosResponse<{ items: UserRank[]; total: number }>) => {
    return data.data
  })

const getUserRank = (address: string) =>
  client.get(`/leaderboard-042025/user/${address}`).then((data: AxiosResponse<UserRank>) => {
    return data.data
  })

export const internalService = {
  getPoolStats,
  fetchLeaderboard,
  getUserRank
}
