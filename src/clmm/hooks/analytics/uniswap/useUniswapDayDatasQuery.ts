import { useClients } from "@clmm/hooks/graphql/useClients";
import { gql } from "@apollo/client";
import useSWR from "swr";

// export function useUniswapDayDatasQuery({ variables, skip }: { variables: { from: number; to: number }; skip: boolean }) {
//     const { uniswapInfoClient } = useClients();

//     return useSWR(["uniswapDayDatas", variables, skip], () => {
//         if (skip) return null;
//         return uniswapInfoClient.query<any>({
//             query: gql`
//                 query UniswapDayDatas($from: Int!, $to: Int!) {
//                     uniswapDayDatas(orderBy: date, orderDirection: desc, where: { date_gt: $from, date_lt: $to }) {
//                         tvlUSD
//                         txCount
//                         volumeUSD
//                         id
//                         feesUSD
//                         date
//                     }
//                 }
//             `,
//             variables,
//         });
//     });
// }

// Thena BSC Fusion Mainnet
export function useUniswapDayDatasQuery({ variables, skip }: { variables: { from: number; to: number }; skip: boolean }) {
    const { uniswapInfoClient } = useClients();

    return useSWR(["uniswapDayDatas", variables, skip], () => {
        if (skip) return null;
        return uniswapInfoClient.query<any>({
            query: gql`
                query FusionDayDatas($from: Int!, $to: Int!) {
                    fusionDayDatas(orderBy: date, orderDirection: desc, where: { date_gt: $from, date_lt: $to }) {
                        tvlUSD
                        txCount
                        volumeUSD
                        id
                        feesUSD
                        date
                    }
                }
            `,
            variables,
        });
    });
}
