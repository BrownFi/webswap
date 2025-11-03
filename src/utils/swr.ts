import { ChainId } from '@brownfi/sdk'
import axios from 'axios'

export const graphqlFetcher = ({
  operationName,
  query,
  variables,
}: {
  operationName: string
  query: string
  variables: object
}) => {
  const { chainId } = variables as { chainId: number }
  if (chainId !== ChainId.BERA_MAINNET) {
    query = query.replace(/stakeLP/g, '')
  }
  return axios
    .post(
      `${process.env.REACT_APP_API_V2_URL!}/indexer`,
      {
        operationName,
        query,
        variables,
      },
      {
        withCredentials: true,
        timeout: 2_000,
      },
    )
    .then((res) => res.data.data)
}
