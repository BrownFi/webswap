import { Pair } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from 'hooks'
import { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSingleCallResult } from 'state/multicall/hooks'
import { usePairV2Contract } from './useContract'
import { useStorageCache } from './useStorageCache'
import { useVersion } from './useVersion'

const Q64_DENOMINATOR = BigNumber.from(2).pow(64)
const PROTOCOL_FEE_DENOMINATOR = BigNumber.from(10).pow(8)
const NORMALIZE_SCALE = BigNumber.from(10).pow(6)

const normalizeByDenominator = (value: BigNumber | number | undefined, denominator: BigNumber) => {
  if (value === undefined || value === null) return undefined
  const bn = typeof value === 'number' ? BigNumber.from(value) : value
  const scaled = bn.mul(NORMALIZE_SCALE).div(denominator)
  return scaled.toNumber() / NORMALIZE_SCALE.toNumber()
}

type Props = {
  pair: Pair
  enabled?: boolean
}

export const useDevStats = ({ pair, enabled = true }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const { get: getDevStats, save: saveDevStats, isAvailable } = useStorageCache({
    key: ['devStats', 'v2shape', pair.liquidityToken.address, `v${version}`].join('-'),
    initValue: { lambda: 0, kappa: 0, fee: 0, protocolFee: 0, feeSplit: 0 },
    cacheTime: 2 * 60,
  })

  // V2: read from pair contract directly
  const pairContract = usePairV2Contract(pair.liquidityToken.address)
  const v2Contract = enabled && version === 2 ? pairContract : null
  const hasCache = isAvailable()
  const shouldSkipV2 = hasCache || !v2Contract

  const lambdaCall = useSingleCallResult(v2Contract, 'lambda', undefined, { disabled: shouldSkipV2 })
  const kappaCall = useSingleCallResult(v2Contract, 'k', undefined, { disabled: shouldSkipV2 })
  const feeCall = useSingleCallResult(v2Contract, 'fee', undefined, { disabled: shouldSkipV2 })
  const protocolFeeCall = useSingleCallResult(v2Contract, 'protocolFee', undefined, { disabled: shouldSkipV2 })

  // V3: read from PairConfig contract via viem
  useQuery({
    queryKey: ['v3DevStats', chainId, pair.liquidityToken.address],
    queryFn: async () => {
      const { createPublicClient, http } = await import('viem')
      const { RPC_URLS, FACTORY_ADDRESS_V3 } = await import('lib/sdk/constants/addresses')
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
      const factoryAddr = FACTORY_ADDRESS_V3[chainId]
      if (!factoryAddr) return null

      const configAddr = await client.readContract({
        address: factoryAddr as `0x${string}`,
        abi: [{ inputs: [], name: 'pairConfig', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }] as const,
        functionName: 'pairConfig',
      })

      const config = await client.readContract({
        address: configAddr as `0x${string}`,
        abi: [{
          inputs: [{ type: 'address' }],
          name: 'getConfig',
          outputs: [{
            components: [
              { name: 'kB', type: 'uint256' },
              { name: 'kQ', type: 'uint256' },
              { name: 'lambda', type: 'uint64' },
              { name: 'fee', type: 'uint32' },
              { name: 'feeSplit', type: 'uint32' },
              { name: 'maxOut', type: 'uint8' },
              { name: 'compress', type: 'uint32' },
              { name: 'sSell', type: 'uint32' },
              { name: 'sBuy', type: 'uint32' },
              { name: 'fixS', type: 'uint32' },
              { name: 'disThreshold', type: 'uint32' },
            ],
            type: 'tuple',
          }],
          stateMutability: 'view',
          type: 'function',
        }] as const,
        functionName: 'getConfig',
        args: [pair.liquidityToken.address as `0x${string}`],
      })

      const Q64 = 2n ** 64n
      const PREC = 100000000n
      const lambda = Number(config.lambda * 1000000n / Q64) / 1000000
      const kappa = Number(config.kB * 1000000n / Q64) / 1000000
      const fee = Number(config.fee) / Number(PREC)
      const feeSplit = Number(config.feeSplit) / Number(PREC)

      saveDevStats({ lambda, kappa, fee, protocolFee: 0, feeSplit })
      return { lambda, kappa, fee, feeSplit }
    },
    enabled: enabled && version === 3 && !hasCache,
    staleTime: 2 * 60 * 1000,
  })

  const stableSave = useCallback(
    (data: { lambda: number; kappa: number; fee: number; protocolFee: number; feeSplit: number }) => saveDevStats(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pair.liquidityToken.address],
  )

  // V2 effect: save when multicall results arrive
  useEffect(() => {
    if (shouldSkipV2 || version !== 2) return

    const lambda = normalizeByDenominator(lambdaCall.result?.[0], Q64_DENOMINATOR)
    const kappa = normalizeByDenominator(kappaCall.result?.[0], Q64_DENOMINATOR)
    const fee = normalizeByDenominator(feeCall.result?.[0], PROTOCOL_FEE_DENOMINATOR)
    const protocolFee = normalizeByDenominator(protocolFeeCall.result?.[0], PROTOCOL_FEE_DENOMINATOR)

    if (lambda === undefined || kappa === undefined || fee === undefined || protocolFee === undefined) return

    stableSave({ lambda, kappa, fee, protocolFee, feeSplit: 0 })
  }, [shouldSkipV2, version, lambdaCall.result, kappaCall.result, feeCall.result, protocolFeeCall.result, stableSave])

  return getDevStats()
}
