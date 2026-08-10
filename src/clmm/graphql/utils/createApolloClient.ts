import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

/* Build the client with an explicit HttpLink (uri/headers on the link, not the
 * ApolloClient constructor) — Apollo 3.14 deprecates passing uri/headers directly.
 * Empty uri (disabled-module clients that are never queried) falls back to the
 * HttpLink default so it doesn't warn about a missing uri/link. */
export const createApolloClient = (uri: string, apiKey?: string) =>
    new ApolloClient({
        link: new HttpLink({
            uri: uri || undefined,
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        }),
        cache: new InMemoryCache(),
    });
