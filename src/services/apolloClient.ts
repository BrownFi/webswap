import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { ChainId } from '@brownfi/sdk'

const hostALink = new HttpLink({ uri: `${process.env.REACT_APP_GRAPHQL_URL}/graphql` })
const hostBLink = new HttpLink({ uri: `${process.env.REACT_APP_GRAPHQL_URL_HYPE}/graphql` })

const routingLink = new ApolloLink((operation, forward) => {
  if (operation.getContext().chainId === ChainId.HYPER_EVM) {
    return hostBLink.request(operation, forward)
  }
  return hostALink.request(operation, forward)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: routingLink,
})
