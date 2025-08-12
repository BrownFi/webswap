import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_GRAPHQL_URL}/graphql`,
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
  uri: `${process.env.REACT_APP_GRAPHQL_URL}/graphql`,
})
