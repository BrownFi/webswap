import axios, { AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: 'https://infrared.finance',
})

type BgtApr = {
  [key: string]: {
    aprBreakdown: {
      infrared: {
        [key: string]: {
          apr: number
          apr7dMovingAverage: number
        }
      }
      operator: {
        [key: string]: {
          apr: number
          apr7dMovingAverage: number
        }
      }
    }
    pointsMultiplier: number
    tvlBreakdown: {
      infrared: number
      operator: number
    }
  }
}

const getBgtApr = (options: { chainId: number; addresses: string[] }) =>
  client
    .post(`/api/backend-vaults`, { addresses: options.addresses }, { params: { chainId: options.chainId } })
    .then((data: AxiosResponse<BgtApr>) => {
      return data.data
    })

export const bgtService = {
  getBgtApr,
}
