import { ChainId } from '@brownfi/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.SEPOLIA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.SN_SEPOLIA]: '',
  [ChainId.SN_MAIN]: '',
  [ChainId.BSC_TESTNET]: '0xe348b292e8eA5FAB54340656f3D374b259D658b8',
  [ChainId.VICTION_TESTNET]: '0xB2c198cCa3c7321A4Fa6C36CC35be6a6e70Ed590',
  [ChainId.VICTION_MAINNET]: '0x83A8D57634239a9e52197d34cbc74CD9455383d1',
  [ChainId.SONIC_TESTNET]: '0xca11bde05977b3631167028862be2a173976ca11',
  [ChainId.MINATO_SONEIUM]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.BASE_SEPOLIA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.UNICHAIN_SEPOLIA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.AURORA_TESTNET]: '0x4a5143B13C84DB00E6d8c19b9EA00f3b91416d20',
  [ChainId.METIS_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.TAIKO_TESTNET]: '0xcA11bde05977b3631167028862bE2a173976CA11'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
