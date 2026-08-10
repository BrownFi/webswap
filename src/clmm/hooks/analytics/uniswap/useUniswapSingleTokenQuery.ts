import { useClients } from "@clmm/hooks/graphql/useClients";
import { gql } from "@apollo/client";
import useSWR from "swr";
import { uniswapPlaceholderTokens } from "./uniswap-addresses";

export function useUniswapSingleTokenQuery({ variables, skip }: { variables: { tokenId: string }; skip: boolean }) {
    const { uniswapInfoClient } = useClients();

    return useSWR([`uniswapSingleTokenQuery`, variables, skip], () => {
        if (skip) return null;
        return uniswapInfoClient.query<any>({
            query: gql`
                query SingleToken($tokenId: ID!) {
                    token(id: $tokenId) {
                        id
                        symbol
                        name
                        decimals
                        derivedNative
                        volumeUSD
                        totalValueLockedUSD
                        feesUSD
                        txCount
                    }
                }
            `,
            variables: {
                ...variables,
                tokenId: uniswapPlaceholderTokens[variables.tokenId],
            },
        });
    });
}
