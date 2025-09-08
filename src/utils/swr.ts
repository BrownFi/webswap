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
  return axios
    .post(process.env.REACT_APP_GRAPHQL_URL ?? 'https://bf-indexer-proxy.vietcha.in', {
      operationName,
      query,
      variables,
    })
    .then((res) => res.data.data)
}
