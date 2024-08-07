import { ChainId } from '@brownfi/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.SEPOLIA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.SN_SEPOLIA]: '',
  [ChainId.SN_MAIN]: ''
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
