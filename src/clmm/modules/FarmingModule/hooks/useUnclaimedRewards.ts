import { useAccount } from "wagmi";
import { useClients } from "@clmm/hooks/graphql/useClients";
import { useUnclaimedRewardsQuery } from "@clmm/graphql/generated/graphql";
import { Address } from "viem";

export function useUnclaimedRewards() {
    const { address: account } = useAccount();

    const { farmingClient } = useClients();

    const { data: unclaimedRewards, loading } = useUnclaimedRewardsQuery({
        variables: {
            owner: account as Address,
        },
        client: farmingClient,
        skip: !account,
        pollInterval: 10_000,
    });

    return {
        unclaimedRewards,
        loading,
    };
}
