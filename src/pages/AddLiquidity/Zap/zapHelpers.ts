import { ChainId, Currency, CurrencyAmount, Pair } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { kyberZapService } from 'services'
import { wrappedCurrency } from 'utils/wrappedCurrency'

export const SUPPORTED_ZAP_CHAIN_IDS = new Set<ChainId>([ChainId.BERA_MAINNET, ChainId.LINEA_MAINNET])

export const isZapSupportedOnChain = (chainId?: ChainId | null) =>
  chainId ? SUPPORTED_ZAP_CHAIN_IDS.has(chainId) : false

export type KyberZapRouteData = Awaited<ReturnType<typeof kyberZapService['getKyberZapInRoute']>>

type BuildKyberZapRouteParams = {
  chainId: ChainId
  pair: Pair
  account: string
  inputs: Array<{
    currency: Currency
    amount: CurrencyAmount
  }>
  allowedSlippage: number
}

export const getKyberZapRouteData = async ({
  chainId,
  pair,
  account,
  inputs,
  allowedSlippage,
}: BuildKyberZapRouteParams): Promise<KyberZapRouteData> => {
  const tokensIn = inputs.map(({ currency }) => {
    const address = wrappedCurrency(currency, chainId)?.address
    if (!address) {
      throw new Error('Missing address for zap route')
    }
    return address
  })

  const amountsIn = inputs.map(({ amount }) => amount.raw.toString())

  return kyberZapService.getKyberZapInRoute({
    chainId,
    poolId: pair.liquidityToken.address,
    poolToken0: pair.token0.address,
    poolToken1: pair.token1.address,
    positionId: account,
    tokensIn,
    amountsIn,
    slippage: allowedSlippage.toString(),
  })
}

type ExecuteKyberZapParams = {
  chainId: ChainId
  account: string
  routeData: KyberZapRouteData
  library: Web3Provider | (Web3Provider & { getSigner?: (account?: string) => any }) | any
}

export const executeKyberZapTransaction = async ({
  chainId,
  account,
  routeData,
  library,
}: ExecuteKyberZapParams): Promise<TransactionResponse> => {
  const buildData = await kyberZapService.buildKyberZapInRoute({
    chainId,
    sender: account,
    recipient: account,
    route: routeData.route,
  })

  const signer = typeof library?.getSigner === 'function' ? library.getSigner(account ?? undefined) : undefined

  if (!signer) {
    throw new Error('No signer available for zap transaction')
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
