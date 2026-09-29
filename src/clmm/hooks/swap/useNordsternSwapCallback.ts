import { useSendTransaction } from 'wagmi'
import { Address } from 'viem'
import { NordsternQuote, isValidNordsternTransaction } from '@clmm/config/nordstern'
import { useTransactionAwait } from '@clmm/hooks/common/useTransactionAwait'
import { TransactionType } from '@clmm/state/pendingTransactionsStore'
import { useToast } from '@clmm/components/ui/use-toast'

/**
 * Executes a Nordstern route by submitting its pre-built calldata (tx.to/data/value).
 * The input token must already be approved to the Nordstern router (see NORDSTERN_ROUTER);
 * approval is handled separately in the swap button via useApprove.
 */
export function useNordsternSwapCallback(
  quote: NordsternQuote | null | undefined,
  title: string,
  onSuccess?: () => void,
) {
  const { data: hash, sendTransactionAsync, isPending } = useSendTransaction()
  const { toast } = useToast()

  const { isLoading } = useTransactionAwait(
    hash,
    {
      title,
      tokenA: (quote?.tx.to ?? '0x0000000000000000000000000000000000000000') as Address,
      type: TransactionType.SWAP,
      callback: onSuccess,
    },
    undefined,
  )

  const execute = async (quoteToExecute: NordsternQuote | null | undefined) => {
    try {
      if (!quoteToExecute || !isValidNordsternTransaction(quoteToExecute)) {
        throw new Error('The Nordstern quote is invalid or expired')
      }
      await sendTransactionAsync({
        chainId: quoteToExecute.chainId,
        to: quoteToExecute.tx.to,
        data: quoteToExecute.tx.data,
        value: quoteToExecute.tx.value,
      })
    } catch (error) {
      toast({
        title: 'Nordstern swap failed',
        description: error instanceof Error ? error.message : 'Unable to submit the transaction',
      })
    }
  }

  return { execute, isLoading: isPending || isLoading }
}
