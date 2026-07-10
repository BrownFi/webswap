import { useDepositsQuery } from "@clmm/graphql/generated/graphql";
import { useClients } from "@clmm/hooks/graphql/useClients";
import { usePosition } from "@clmm/hooks/positions/usePositions";
import { useAccount } from "wagmi";

export function usePositionInFarming(tokenId: string | number | undefined) {
    const { farmingClient } = useClients();
    const { position } = usePosition(tokenId);

    const { address: account } = useAccount();

    const { data: deposits } = useDepositsQuery({
        variables: {
            owner: account ? account : undefined,
            pool: position?.pool,
        },
        client: farmingClient,
    });

    if (!deposits) return;
    const openedPositions = deposits.deposits.filter((deposit) => deposit.eternalFarming !== null);

    const positionInFarming = openedPositions.find((deposit) => Number(deposit.id) === Number(tokenId));

    if (!positionInFarming) return;
    return positionInFarming;
}
