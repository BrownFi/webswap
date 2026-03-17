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
  const { chainId, ...restVar } = variables as { chainId: number }
  if (chainId !== ChainId.BERA_MAINNET) {
    query = query.replace(/stakeLP/g, '')
  }
  return axios
    .post(
      `${import.meta.env.VITE_API_URL}/indexer?chainId=${chainId}`,
      {
        operationName,
        query,
        variables: restVar,
      },
      {
        withCredentials: true,
        timeout: 10_000,
      },
    )
    .then((res) => res.data.data)
}
