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

  // All params start undefined so the UI skips them on first load instead of
  // flashing zeros (the previous lambda:0 / kappa:0 / fee:0 placeholders
  // rendered as visible "3 values" before the RPC resolved, then jumped to
  // the full V3 set — looked broken). Consumers must guard each field.
  // cacheTime bumped to 5 min so navigations within that window are flicker-
  // free; a refetch still fires silently in the background past expiry.
  const { get: getDevStats, save: saveDevStats, isAvailable } = useStorageCache({
    key: ['devStats', 'v3shape', pair.liquidityToken.address, `v${version}`].join('-'),
    initValue: {
      lambda: undefined as number | undefined,
      kappa: undefined as number | undefined,
      fee: undefined as number | undefined,
      protocolFee: undefined as number | undefined,
      feeSplit: undefined as number | undefined,
      kB: undefined as number | undefined,
      kQ: undefined as number | undefined,
      compress: undefined as number | undefined,
      sSell: undefined as number | undefined,
      sBuy: undefined as number | undefined,
      fixS: undefined as number | undefined,
      disThreshold: undefined as number | undefined,
      sBound: undefined as number | undefined,
      pythWeight: undefined as number | undefined,
      gamma: undefined as number | undefined,
    },
    cacheTime: 5 * 60,
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
              { name: 'compress', type: 'uint32' },
              { name: 'sSell', type: 'uint32' },
              { name: 'sBuy', type: 'uint32' },
              { name: 'fixS', type: 'uint32' },
              { name: 'disThreshold', type: 'uint32' },
              { name: 'sBound', type: 'uint32' },
              { name: 'pythWeight', type: 'uint32' },
              { name: 'gamma', type: 'uint32' },
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
      const fromQ64 = (v: bigint) => Number((v * 1000000n) / Q64) / 1000000
      const fromPrec = (v: number | bigint) => Number(v) / Number(PREC)

      const kB = fromQ64(config.kB)
      const kQ = fromQ64(config.kQ)
      const lambda = fromQ64(config.lambda)
      const kappa = kB // legacy alias; existing UI reads `kappa`
      const fee = fromPrec(config.fee)
      const feeSplit = fromPrec(config.feeSplit)
      const compress = fromPrec(config.compress)
      const sSell = fromPrec(config.sSell)
      const sBuy = fromPrec(config.sBuy)
      const fixS = fromPrec(config.fixS)
      const disThreshold = fromPrec(config.disThreshold)
      const sBound = fromPrec(config.sBound)
      const pythWeight = fromPrec(config.pythWeight)
      const gamma = fromPrec(config.gamma)

      const next = {
        lambda, kappa, fee, protocolFee: 0, feeSplit,
        kB, kQ, compress, sSell, sBuy, fixS, disThreshold, sBound, pythWeight, gamma,
      }
      saveDevStats(next)
      return next
    },
    enabled: enabled && version === 3 && !hasCache,
    staleTime: 5 * 60 * 1000,
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
