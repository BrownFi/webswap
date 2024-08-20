import { ChainId } from '@brownfi/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.SEPOLIA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.SN_SEPOLIA]: '',
  [ChainId.SN_MAIN]: '',
  [ChainId.BSC_TESTNET]: '0xe348b292e8eA5FAB54340656f3D374b259D658b8'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
