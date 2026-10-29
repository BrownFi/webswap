import { ChainId } from '@brownfi/sdk'
import { isV3Enabled } from 'connectors'

// Per-chain capabilities of the Pool Detail charts.

// `uniV2Reserve0/1` follow the API's V3 capability (absent when talking to a prod API
// that lacks them). Requesting a field the indexer doesn't have is a GraphQL
// validation error that 500s the whole query, so keep an explicit allowlist.
const CHAINS_WITH_UNIV2_PRICE = !isV3Enabled
  ? new Set<number>()
  : new Set<number>([
      ChainId.BASE_MAINNET,
      ChainId.BERA_MAINNET,
      ChainId.BSC_MAINNET,
      ChainId.ARBITRUM_MAINNET,
      ChainId.LINEA_MAINNET,
      ChainId.SEI_MAINNET,
      ChainId.HYPER_EVM,
      ChainId.MONAD,
      ChainId.ROBINHOOD_MAINNET,
    ])
export const hasUniV2Price = (chainId: number) => CHAINS_WITH_UNIV2_PRICE.has(chainId)
