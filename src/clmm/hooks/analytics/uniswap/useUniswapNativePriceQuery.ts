import { useClients } from "@clmm/hooks/graphql/useClients";
import { gql } from "@apollo/client";
import useSWR from "swr";

export function useUniswapNativePriceQuery({ skip }: { skip: boolean }) {
    const { uniswapInfoClient } = useClients();

    return useSWR([`uniswapNativePriceQuery`, skip], () => {
        if (skip) return null;
        return uniswapInfoClient.query<any>({
            query: gql`
                query NativePrice {
                    bundles {
                        id
                        nativePriceUSD
                    }
                }
            `,
        });
    });
}
