import { ApolloClient, ApolloLink, from, InMemoryCache, HttpLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

/* Build the client with an explicit HttpLink (uri/headers on the link, not the
 * ApolloClient constructor) — Apollo 3.14 deprecates passing uri/headers directly.
 * Empty uri (disabled-module clients that are never queried) falls back to the
 * HttpLink default so it doesn't warn about a missing uri/link. */
export const createApolloClient = (uri: string, apiKey?: string, fallbackUri?: string) => {
    const primary = new HttpLink({
        uri: uri || undefined,
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
    const fallback = fallbackUri ? new HttpLink({ uri: fallbackUri }) : undefined;
    const fallbackLink = fallback
        ? onError(({ graphQLErrors, networkError, operation }) => {
              if (!graphQLErrors?.length && !networkError) return;
              return fallback.request(operation);
          })
        : null;

    return new ApolloClient({
        link: fallbackLink ? from([fallbackLink, primary]) : (primary as ApolloLink),
        cache: new InMemoryCache(),
    });
};
