import { NONFUNGIBLE_POSITION_MANAGER, FARMING_CENTER } from "@clmm/config";
import { useChainId } from "wagmi";
import { useEffect } from "react";
import { useFarmCheckApprove } from "./useFarmCheckApprove";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";
import { useWriteNonfungiblePositionManagerApproveForFarming } from "@clmm/generated";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";

export function useFarmApprove(tokenId: bigint) {
    const chainId = useChainId();
    const APPROVE = true;

    const config = tokenId
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainId],
              args: [tokenId, APPROVE, FARMING_CENTER[chainId]] as const,
          }
        : undefined;

    const { data: data, writeContractAsync: onApprove, isPending } = useWriteNonfungiblePositionManagerApproveForFarming();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Approve Position #${tokenId}`,
        tokenId: tokenId.toString(),
        type: TransactionType.FARM,
    });

    const { handleCheckApprove } = useFarmCheckApprove(tokenId);

    useEffect(() => {
        if (isSuccess) {
            handleCheckApprove();
        }
    }, [isSuccess]);

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onApprove: () => config && onApprove(config),
    };
}
