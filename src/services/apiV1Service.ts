import axios, { AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
})

type UserRank = {
  rank?: number
  address: string
  volume: string
  lastTimestamp: string
  firstTimestamp: string
  createdAt: string
  updatedAt: string
}

const fetchLeaderboard = (params?: any) =>
  client.get(`/leaderboard-042025`, { params }).then((data: AxiosResponse<{ items: UserRank[]; total: number }>) => {
    return data.data
  })

const getUserRank = (address: string) =>
  client.get(`/leaderboard-042025/user/${address}`).then((data: AxiosResponse<UserRank>) => {
    return data.data
  })

export const apiV1Service = {
  fetchLeaderboard,
  getUserRank,
}
