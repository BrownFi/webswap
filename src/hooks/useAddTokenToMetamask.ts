import { wrappedCurrency } from 'utils/wrappedCurrency'
import { Currency, Token } from '@brownfi/sdk'
import { useCallback, useState } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useWalletClient } from 'wagmi'

export default function useAddTokenToMetamask(
  currencyToAdd: Currency | undefined,
): { addToken: () => void; success: boolean | undefined } {
  const { library, chainId } = useActiveWeb3React()
  const { data: walletClient } = useWalletClient()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)

  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (token) {
      ;(walletClient || library?.provider)
        ?.request?.({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          } as any,
        })
        .then((success) => {
          setSuccess(success)
        })
        .catch((error) => {
          console.warn(error)
          setSuccess(false)
        })
    } else {
      setSuccess(false)
    }
  }, [library, token])

  return { addToken, success }
}
