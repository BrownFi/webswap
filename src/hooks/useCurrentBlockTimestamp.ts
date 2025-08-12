import { BigNumber } from 'ethers'

import { useSingleCallResult } from 'state/multicall/hooks'

import { useMulticallContract } from './useContract'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicallContract = useMulticallContract()
  return useSingleCallResult(multicallContract, 'getCurrentBlockTimestamp')?.result?.[0]
}
