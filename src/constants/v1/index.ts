import { Interface } from '@ethersproject/abi'
import { ChainId } from '@brownfi/sdk'
import V1_EXCHANGE_ABI from './v1_exchange.json'
import V1_FACTORY_ABI from './v1_factory.json'

const V1_FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  [ChainId.SEPOLIA]: '',
  [ChainId.SN_MAIN]: '',
  [ChainId.SN_SEPOLIA]: '',
  [ChainId.SCROLL_TESTNET]: '',
  [ChainId.BSC_TESTNET]: '',
  [ChainId.VICTION_TESTNET]: '',
  [ChainId.VICTION_MAINNET]: '',
  [ChainId.SONIC_TESTNET]: '',
  [ChainId.MINATO_SONEIUM]: '',
  [ChainId.BASE_SEPOLIA]: '',
  [ChainId.UNICHAIN_SEPOLIA]: '',
  [ChainId.AURORA_TESTNET]: '',
  [ChainId.METIS_MAINNET]: '',
  [ChainId.TAIKO_TESTNET]: '',
  [ChainId.BOBA_TESTNET]: '',
  [ChainId.NEOX_MAINNET]: '',
  [ChainId.U2U_MAINNET]: '',
  [ChainId.ARBITRUM_SEPOLIA]: '',
  [ChainId.ARBITRUM_MAINNET]: '',
  [ChainId.OP_MAINNET]: '',
  [ChainId.BOBA_MAINNET]: '',
  [ChainId.BERA_MAINNET]: ''
}

const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

export { V1_FACTORY_ADDRESSES, V1_FACTORY_INTERFACE, V1_FACTORY_ABI, V1_EXCHANGE_INTERFACE, V1_EXCHANGE_ABI }
