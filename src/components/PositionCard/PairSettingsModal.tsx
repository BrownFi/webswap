import { Pair } from '@brownfi/sdk'
import { TransactionResponse } from '@ethersproject/providers'
import { useState } from 'react'
import { Text } from 'components/Rebass'

import { ButtonPrimary } from 'components/Button'
import { Modal } from 'components/Modal'
import { RowBetween } from 'components/Row'
import { useToast } from 'containers/ToastProvider'
import { useActiveWeb3React } from 'hooks'
import { useFactoryContract } from 'hooks/useContract'
import { useVersion } from 'hooks/useVersion'
import { useTransactionAdder } from 'state/transactions/hooks'
import { CloseIcon } from 'theme/components'

type FieldKey = 'k' | 'lambda' | 'fee' | 'protocolFee'

type Props = {
  isOpen: boolean
  onDismiss: () => void
  pair: Pair
  currentValues?: { lambda?: number; kappa?: number; fee?: number; protocolFee?: number; feeSplit?: number }
}

const sanitizeUintInput = (value: string) => value.trim()

export function PairSettingsModal({ isOpen, onDismiss, pair, currentValues }: Props) {
  const { account, chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const isV3 = version === 3
  const { createToast } = useToast()
  const factoryContract = useFactoryContract(true, { readonly: false })
  const addTransaction = useTransactionAdder()

  const [kInput, setKInput] = useState('')
  const [lambdaInput, setLambdaInput] = useState('')
  const [feeInput, setFeeInput] = useState('')
  const [protocolFeeInput, setProtocolFeeInput] = useState('')

  const protocolFeeValue = isV3 ? currentValues?.feeSplit : currentValues?.protocolFee

  // Pre-fill inputs with current on-chain values when modal opens
  const round = (v: number) => parseFloat((Math.round(v * 1e4) / 1e4).toFixed(4)).toString()
  const [initialized, setInitialized] = useState(false)
  if (isOpen && !initialized && currentValues) {
    if (currentValues.kappa !== undefined) setKInput(round(currentValues.kappa))
    if (currentValues.lambda !== undefined) setLambdaInput(round(currentValues.lambda))
    if (currentValues.fee !== undefined) setFeeInput(round(currentValues.fee))
    if (protocolFeeValue !== undefined) setProtocolFeeInput(round(protocolFeeValue))
    setInitialized(true)
  }
  if (!isOpen && initialized) setInitialized(false)

  const [submitting, setSubmitting] = useState<Record<FieldKey, boolean>>({
    k: false,
    lambda: false,
    fee: false,
    protocolFee: false,
  })

  const handleDismiss = () => {
    onDismiss()
  }

  const submitField = async (field: FieldKey) => {
    if (!factoryContract || !account) {
      createToast('Wallet not connected', 'error')
      return
    }

    const tokenA = pair.token0.address
    const tokenB = pair.token1.address
    const inputValue =
      field === 'k' ? kInput : field === 'lambda' ? lambdaInput : field === 'fee' ? feeInput : protocolFeeInput

    if (!inputValue) {
      createToast('Enter value before submit', 'error')
      return
    }

    setSubmitting((prev) => ({ ...prev, [field]: true }))
    try {
      let response: TransactionResponse
      if (field === 'k') {
        response = await factoryContract.setKOfPair(tokenA, tokenB, Math.floor(Number(inputValue) * 2 ** 64).toString())
        addTransaction(response, {
          summary: `Set K for ${pair.token0.symbol}/${pair.token1.symbol}`,
        })
      } else if (field === 'lambda') {
        response = await factoryContract.setLambdaOfPair(
          tokenA,
          tokenB,
          Math.floor(Number(inputValue) * 2 ** 64).toString(),
        )
        addTransaction(response, {
          summary: `Set Lambda for ${pair.token0.symbol}/${pair.token1.symbol}`,
        })
      } else if (field === 'fee') {
        response = await factoryContract.setFeeOfPair(
          tokenA,
          tokenB,
          Math.floor(Number(inputValue) * 10 ** 8).toString(),
        )
        addTransaction(response, {
          summary: `Set Fee for ${pair.token0.symbol}/${pair.token1.symbol}`,
        })
      } else {
        if (isV3) {
          const { createPublicClient, http } = await import('viem')
          const { RPC_URLS, FACTORY_ADDRESS_V3 } = await import('lib/sdk/constants/addresses')
          const client = createPublicClient({ transport: http(RPC_URLS[chainId!]) })
          const factoryAddr = FACTORY_ADDRESS_V3[chainId!]
          const configAddr = await client.readContract({
            address: factoryAddr as `0x${string}`,
            abi: [{ inputs: [], name: 'pairConfig', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'pairConfig',
          })
          const configTuple = [
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
          ] as const
          const current = await client.readContract({
            address: configAddr as `0x${string}`,
            abi: [{
              inputs: [{ type: 'address' }],
              name: 'getConfig',
              outputs: [{ components: configTuple, type: 'tuple' }],
              stateMutability: 'view',
              type: 'function',
            }] as const,
            functionName: 'getConfig',
            args: [pair.liquidityToken.address as `0x${string}`],
          })
          const nextConfig = {
            kB: current.kB,
            kQ: current.kQ,
            lambda: current.lambda,
            fee: current.fee,
            feeSplit: Math.floor(Number(inputValue) * 10 ** 8),
            compress: current.compress,
            sSell: current.sSell,
            sBuy: current.sBuy,
            fixS: current.fixS,
            disThreshold: current.disThreshold,
            sBound: current.sBound,
            pythWeight: current.pythWeight,
            gamma: current.gamma,
          }
          response = await factoryContract.setConfigOfPair(tokenA, tokenB, nextConfig)
          addTransaction(response, {
            summary: `Set FeeSplit for ${pair.token0.symbol}/${pair.token1.symbol}`,
          })
        } else {
          response = await factoryContract.setProtocolFeeOfPair(
            tokenA,
            tokenB,
            Math.floor(Number(inputValue) * 10 ** 8).toString(),
          )
          addTransaction(response, {
            summary: `Set Protocol Fee for ${pair.token0.symbol}/${pair.token1.symbol}`,
          })
        }
      }
    } catch (submitError) {
      console.error(submitError)
      const err = submitError as { code?: string | number; message?: string; reason?: string }
      const raw = `${err?.reason ?? ''} ${err?.message ?? ''}`.toLowerCase()
      const isReverted =
        err?.code === 'UNPREDICTABLE_GAS_LIMIT' ||
        raw.includes('execution reverted') ||
        raw.includes('unpredictable_gas_limit')
      const isRejected = err?.code === 4001 || raw.includes('user rejected') || raw.includes('user denied')
      if (isRejected) {
        createToast('Transaction rejected in wallet', 'error')
      } else if (isReverted) {
        createToast('Reverted — this wallet is not authorized (admin role required)', 'error')
      } else {
        createToast('Failed to send transaction', 'error')
      }
    } finally {
      setSubmitting((prev) => ({ ...prev, [field]: false }))
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss}>
      <div className="flex flex-col gap-6 p-4 text-white w-full">
        <RowBetween>
          <Text fontSize={18} fontWeight={600}>
            Pair settings
          </Text>
          <CloseIcon onClick={handleDismiss} />
        </RowBetween>

        <div className="space-y-3">
          <div>
            <Text fontSize={12} color="#b2ada9" className="mb-1">
              setKOfPair (uint256)
            </Text>
            <div className="flex gap-2">
              <input
                value={kInput}
                onChange={(event) => setKInput(sanitizeUintInput(event.target.value))}
                placeholder={currentValues?.kappa !== undefined ? `Current: ${round(currentValues.kappa)}` : 'K'}
                className="w-full bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <ButtonPrimary onClick={() => submitField('k')} disabled={submitting.k} className="!w-[100px] !py-2">
                {submitting.k ? '...' : 'Submit'}
              </ButtonPrimary>
            </div>
          </div>

          <div>
            <Text fontSize={12} color="#b2ada9" className="mb-1">
              setLambdaOfPair (uint64)
            </Text>
            <div className="flex gap-2">
              <input
                value={lambdaInput}
                onChange={(event) => setLambdaInput(sanitizeUintInput(event.target.value))}
                placeholder={currentValues?.lambda !== undefined ? `Current: ${round(currentValues.lambda)}` : 'Lambda'}
                className="w-full bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <ButtonPrimary
                onClick={() => submitField('lambda')}
                disabled={submitting.lambda}
                className="!w-[100px] !py-2"
              >
                {submitting.lambda ? '...' : 'Submit'}
              </ButtonPrimary>
            </div>
          </div>

          <div>
            <Text fontSize={12} color="#b2ada9" className="mb-1">
              setFeeOfPair (uint32)
            </Text>
            <div className="flex gap-2">
              <input
                value={feeInput}
                onChange={(event) => setFeeInput(sanitizeUintInput(event.target.value))}
                placeholder={currentValues?.fee !== undefined ? `Current: ${round(currentValues.fee)}` : 'Fee'}
                className="w-full bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <ButtonPrimary onClick={() => submitField('fee')} disabled={submitting.fee} className="!w-[100px] !py-2">
                {submitting.fee ? '...' : 'Submit'}
              </ButtonPrimary>
            </div>
          </div>

          <div>
            <Text fontSize={12} color="#b2ada9" className="mb-1">
              {isV3 ? 'feeSplit (uint32) — set via setConfigOfPair' : 'setProtocolFeeOfPair (uint32)'}
            </Text>
            <div className="flex gap-2">
              <input
                value={protocolFeeInput}
                onChange={(event) => setProtocolFeeInput(sanitizeUintInput(event.target.value))}
                placeholder={protocolFeeValue !== undefined ? `Current: ${round(protocolFeeValue)}` : 'Protocol Fee'}
                className="w-full bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <ButtonPrimary
                onClick={() => submitField('protocolFee')}
                disabled={submitting.protocolFee}
                className="!w-[100px] !py-2"
              >
                {submitting.protocolFee ? '...' : 'Submit'}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
