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
      process.env.REACT_APP_GRAPHQL_URL!,
      {
        operationName,
        query,
        variables,
      },
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data.data)
}
