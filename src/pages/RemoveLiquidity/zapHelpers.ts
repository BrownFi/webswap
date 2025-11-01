import { ChainId, Currency, Pair } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { kyberZapService } from 'services'
import { wrappedCurrency } from 'utils/wrappedCurrency'

export type KyberZapOutRouteData = Awaited<ReturnType<typeof kyberZapService['getKyberZapOutRoute']>>

type GetKyberZapOutRouteParams = {
  chainId: ChainId
  pair: Pair
  account: string
  tokenOut: Currency
}

export const getKyberZapOutRouteData = async ({
  chainId,
  pair,
  account,
  tokenOut,
}: GetKyberZapOutRouteParams): Promise<KyberZapOutRouteData> => {
  const tokenOutAddress = wrappedCurrency(tokenOut, chainId)?.address

  if (!tokenOutAddress) {
    throw new Error('Missing token address for zap out route')
  }

  return kyberZapService.getKyberZapOutRoute({
    chainId,
    poolId: pair.liquidityToken.address,
    positionId: account,
    tokenOut: tokenOutAddress,
  })
}

type ExecuteKyberZapOutParams = {
  chainId: ChainId
  account: string
  routeData: KyberZapOutRouteData
  library: Web3Provider | (Web3Provider & { getSigner?: (account?: string) => any }) | any
}

export const executeKyberZapOutTransaction = async ({
  chainId,
  account,
  routeData,
  library,
}: ExecuteKyberZapOutParams): Promise<TransactionResponse> => {
  const buildData = await kyberZapService.buildKyberZapOutRoute({
    chainId,
    sender: account,
    recipient: account,
    route: routeData.route,
  })

  const signer = typeof library?.getSigner === 'function' ? library.getSigner(account ?? undefined) : undefined

  if (!signer) {
    throw new Error('No signer available for zap out transaction')
  }

  const txRequest: { to: string; data: string; value?: BigNumber } = {
    to: routeData.routerAddress,
    data: buildData.callData,
  }

  if (buildData.value) {
    const value = BigNumber.from(buildData.value)
    if (!value.isZero()) {
      txRequest.value = value
    }
  }

  return signer.sendTransaction(txRequest)
}
