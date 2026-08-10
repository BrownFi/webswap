import { useSendTransaction } from "wagmi";
import { Address } from "viem";
import { NordsternQuote } from "@clmm/config/nordstern";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";

/**
 * Executes a Nordstern route by submitting its pre-built calldata (tx.to/data/value).
 * The input token must already be approved to the Nordstern router (see NORDSTERN_ROUTER);
 * approval is handled separately in the swap button via useApprove.
 */
export function useNordsternSwapCallback(quote: NordsternQuote | null | undefined, title: string, onSuccess?: () => void) {
    const { data: hash, sendTransactionAsync, isPending } = useSendTransaction();

    const { isLoading } = useTransactionAwait(
        hash,
        { title, tokenA: (quote?.tx.to ?? "0x0000000000000000000000000000000000000000") as Address, type: TransactionType.SWAP, callback: onSuccess },
        undefined
    );

    const execute = async () => {
        if (!quote) return;
        await sendTransactionAsync({ to: quote.tx.to, data: quote.tx.data, value: quote.tx.value });
    };

    return { execute, isLoading: isPending || isLoading };
}
