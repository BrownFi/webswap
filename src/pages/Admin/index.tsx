import { Token } from '@brownfi/sdk'
import { Contract } from '@ethersproject/contracts'
import type { TransactionResponse } from '@ethersproject/providers'
import type { PairStats } from 'components/PositionCard/usePoolStats'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { useQuery } from '@tanstack/react-query'
import { Modal } from 'components/Modal'
import { useActiveWeb3React } from 'hooks'
import { useV3PoolsOnChain } from 'hooks/useV3PoolsOnChain'
import { FACTORY_ADDRESS_V3_OFFICIAL, VERSION, v3UseIndexer } from 'lib/sdk/constants/addresses'
import { ChainId } from 'lib/sdk/constants/chainId'
import { checksumAddress, type Address } from 'viem'
import { ArrowRight, ExternalLink, Search, Settings as SettingsIcon, Sliders, X } from 'react-feather'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { getEtherscanLink } from 'utils'
import { graphqlFetcher } from 'utils/graphql'
import { formatCompactPrice } from 'utils/prices'
import { useToast } from 'containers/ToastProvider'
import { useTransactionAdder } from 'state/transactions/hooks'
import { decodeContractError } from 'utils/decodeContractError'
import { isUserRejection } from 'utils/zapErrors'

const SETTINGS_PAIR_METRICS = `
  query SettingsPairMetrics {
    pairs {
      id
      fee
      feeSplit
      tvl
      volumeDay
      apr
      lambda
      kB
      kQ
      compress
      sSell
      sBuy
      fixS
      disThreshold
      sBound
      pythWeight
      gamma
      token0 { id decimals name symbol }
      token1 { id decimals name symbol }
    }
  }
`

const V3_SETTERS_ABI = [
  'function setLambdaOfPair(address,address,uint64)',
  'function setKappaOfPair(address,address,uint256,uint256)',
  'function setFeeOfPair(address,address,uint32)',
  'function setFeeSplitOfPair(address,address,uint32)',
  'function setSpreadOfPair(address,address,uint32,uint32,uint32)',
  'function setFixSpreadOfPair(address,address,uint32)',
  'function setDisThresholdOfPair(address,address,uint32)',
  'function setSboundOfPair(address,address,uint32)',
  'function setPythWeightOfPair(address,address,uint32)',
  'function setGammaOfPair(address,address,uint32)',
] as const

const GAMMA_BATCH_ABI = ['function setGammasOfPairs(tuple(address tokenA,address tokenB,uint32 gamma)[] pairs)'] as const
const GAMMA_BATCH_CONTRACT = '0xcd2781588b27d663E3D3B6A08Bc96AAab2Fe3f87'

const toFixedPoint = (value: string, decimals: number) => {
  const trimmed = value.trim()
  if (!/^-?(?:\d+)(?:\.\d*)?$/.test(trimmed)) return '0'
  const negative = trimmed.startsWith('-')
  const clean = negative ? trimmed.slice(1) : trimmed
  const [whole = '0', fraction = ''] = clean.split('.')
  const result = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0').slice(0, decimals) || '0')
  return (negative ? -result : result).toString()
}

const toPrec = (value: string) => toFixedPoint(value, 8)
const toQ64 = (value: string) => ((BigInt(toFixedPoint(value, 18)) * (2n ** 64n)) / 10n ** 18n).toString()

const CHAIN_NAMES: Record<number, string> = {
  [ChainId.BERA_MAINNET]: 'Berachain',
  [ChainId.HYPER_EVM]: 'HyperEVM',
  [ChainId.BASE_MAINNET]: 'Base',
  [ChainId.LINEA_MAINNET]: 'Linea',
  [ChainId.ARBITRUM_MAINNET]: 'Arbitrum',
  [ChainId.ROBINHOOD_MAINNET]: 'Robinhood',
}

const Page = styled.main`
  width: min(1280px, 100%);
  padding: 0 12px 48px;
  font-family: Inter, sans-serif;
  color: #fbfbfd;
`

const Panel = styled.section`
  overflow: hidden;
  background: #1e1915;
  border: 1px solid #2f2823;
  border-radius: 20px;
`

const ActionButton = styled.button<{ $secondary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid ${({ $secondary }) => ($secondary ? '#493e35' : '#985c2a')};
  border-radius: 10px;
  background: ${({ $secondary }) => ($secondary ? '#251f1a' : '#985c2a')};
  color: #fff;
  font: 600 14px/20px Inter, sans-serif;
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;

  &:hover {
    background: ${({ $secondary }) => ($secondary ? '#302820' : '#a86630')};
    border-color: ${({ $secondary }) => ($secondary ? '#655446' : '#a86630')};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`

const PoolGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 2fr) minmax(110px, 0.7fr) repeat(3, minmax(120px, 0.85fr)) 132px;
  align-items: center;
  column-gap: 16px;
`

const TableHeader = styled(PoolGrid)`
  min-height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid #2f2823;
  color: #978a80;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;

  @media (max-width: 920px) {
    display: none;
  }
`

const PoolRow = styled(PoolGrid)`
  min-height: 92px;
  padding: 16px 20px;
  border-bottom: 1px solid #2f2823;
  transition: background 150ms ease;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: #251f1a;
  }

  @media (max-width: 920px) {
    grid-template-columns: 1fr auto;
    gap: 16px;
  }
`

const ModalShell = styled.div`
  width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #493e35 transparent;
`

const Input = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #3b322b;
  border-radius: 8px;
  background: #120f0d;
  color: #fbfbfd;
  font: 500 14px/20px Inter, sans-serif;
  outline: none;

  &::placeholder {
    color: #71665d;
  }

  &:focus {
    border-color: #985c2a;
    box-shadow: 0 0 0 3px rgba(152, 92, 42, 0.15);
  }
`

const labelForPair = (pair: PairStats) => `${pair.token0?.symbol ?? '???'} / ${pair.token1?.symbol ?? '???'}`
const compactAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
const displayConfig = (value: number | string | undefined) => {
  const numericValue = Number(value)
  return value == null || !Number.isFinite(numericValue) ? '--' : Number(numericValue.toFixed(8)).toString()
}
const displayMetric = (value: number | string | undefined, kind: 'usd' | 'percent') => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue === 0) return '--'
  return kind === 'usd' ? formatCompactPrice(numericValue) : `${Number(numericValue.toFixed(2))}%`
}

function PairLogo({ pair, chainId, size = 26 }: { pair: PairStats; chainId: number; size?: number }) {
  const currencies = useMemo(() => {
    if (!pair.token0?.id || !pair.token1?.id) return {}
    return {
      token0: new Token(chainId, checksumAddress(pair.token0.id as Address), pair.token0.decimals, pair.token0.symbol, pair.token0.name),
      token1: new Token(chainId, checksumAddress(pair.token1.id as Address), pair.token1.decimals, pair.token1.symbol, pair.token1.name),
    }
  }, [chainId, pair.token0?.decimals, pair.token0?.id, pair.token0?.name, pair.token0?.symbol, pair.token1?.decimals, pair.token1?.id, pair.token1?.name, pair.token1?.symbol])

  return <DoubleCurrencyLogo currency0={currencies.token0} currency1={currencies.token1} chainId={chainId} size={size} margin quoteTokenIndex={pair.quoteTokenIndex} />
}

function PairSymbols({ pair, chainId }: { pair: PairStats; chainId: number }) {
  const currencies = useMemo(() => {
    if (!pair.token0?.id || !pair.token1?.id) return {}
    return {
      token0: new Token(chainId, checksumAddress(pair.token0.id as Address), pair.token0.decimals, pair.token0.symbol, pair.token0.name),
      token1: new Token(chainId, checksumAddress(pair.token1.id as Address), pair.token1.decimals, pair.token1.symbol, pair.token1.name),
    }
  }, [chainId, pair.token0?.decimals, pair.token0?.id, pair.token0?.name, pair.token0?.symbol, pair.token1?.decimals, pair.token1?.id, pair.token1?.name, pair.token1?.symbol])

  return <DoubleCurrencySymbol currency0={currencies.token0} currency1={currencies.token1} chainId={chainId} quoteTokenIndex={pair.quoteTokenIndex} />
}

type ManageModalProps = {
  pair: PairStats | null
  chainId: number
  factory?: string
  onDismiss: () => void
  onChanged: () => void
}

function ManageModal({ pair, chainId, factory, onDismiss, onChanged }: ManageModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const { account, library } = useActiveWeb3React()
  const { createToast } = useToast()
  const addTransaction = useTransactionAdder()

  useEffect(() => {
    if (!pair) return
    setValues({
      lambda: displayConfig(pair.lambda),
      kB: displayConfig(pair.kB),
      kQ: displayConfig(pair.kQ),
      fee: displayConfig(pair.fee),
      feeSplit: displayConfig(pair.feeSplit),
      compress: displayConfig(pair.compress),
      sSell: displayConfig(pair.sSell),
      sBuy: displayConfig(pair.sBuy),
      fixS: displayConfig(pair.fixS),
      disThreshold: displayConfig(pair.disThreshold),
      sBound: displayConfig(pair.sBound),
      pythWeight: displayConfig(pair.pythWeight),
      gamma: displayConfig(pair.gamma),
    })
  }, [pair])

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }))

  const submit = async (label: string, method: string, rawArgs: string[]) => {
    if (!factory || !account || !library || !pair) {
      createToast('Connect an authorized wallet to update pool settings', 'error')
      return
    }
    setBusy(true)
    try {
      const contract = new Contract(factory, V3_SETTERS_ABI, library.getSigner(account))
      const args = [pair.token0!.id, pair.token1!.id, ...rawArgs]
      await contract.callStatic[method](...args)
      const response = (await contract[method](...args)) as TransactionResponse
      addTransaction(response, { summary: `${label} ${labelForPair(pair)}` })
      createToast(`${label} transaction submitted`)
      await response.wait()
      onChanged()
    } catch (submitError) {
      if (isUserRejection(submitError)) createToast('Transaction rejected in wallet', 'error')
      else createToast(decodeContractError(submitError, `Failed to ${label.toLowerCase()}`) ?? `Failed to ${label.toLowerCase()}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal isOpen={!!pair} onDismiss={onDismiss} maxWidth={600} maxHeight={90}>
      {pair && (
        <ModalShell>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-[#1A1510] px-4 pb-2 pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-[18px] font-semibold text-[#FBFBFD]">Pair settings — <PairSymbols pair={pair} chainId={chainId} /></span>
            </div>
            <button onClick={onDismiss} className="rounded-lg p-2 text-[#978A80] hover:bg-[#2F2823] hover:text-white" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 px-4 pb-4">
            <PreviewSettingsRow label="setLambdaOfPair (uint64)" value={values.lambda} onChange={(value) => setValue('lambda', value)} busy={busy} onSubmit={() => submit('Set lambda', 'setLambdaOfPair', [toQ64(values.lambda)])} />
            <div>
              <div className="mb-1 text-[12px] font-medium text-[#B2ADA9]">setKappaOfPair (kB, kQ — Q64)</div>
              <div className="flex gap-2">
                <Input value={values.kB ?? ''} onChange={(event) => setValue('kB', event.target.value)} placeholder="kB" inputMode="decimal" />
                <Input value={values.kQ ?? ''} onChange={(event) => setValue('kQ', event.target.value)} placeholder="kQ" inputMode="decimal" />
                <ActionButton disabled={busy} onClick={() => submit('Set kappa', 'setKappaOfPair', [toQ64(values.kB), toQ64(values.kQ)])} className="!min-h-[44px] !w-[100px] shrink-0 !px-3">{busy ? '...' : 'Submit'}</ActionButton>
              </div>
            </div>
            <PreviewSettingsRow label="setFeeOfPair (uint32)" value={values.fee} onChange={(value) => setValue('fee', value)} busy={busy} onSubmit={() => submit('Set fee', 'setFeeOfPair', [toPrec(values.fee)])} />
            <PreviewSettingsRow label="setFeeSplitOfPair (uint32)" value={values.feeSplit} onChange={(value) => setValue('feeSplit', value)} busy={busy} onSubmit={() => submit('Set fee split', 'setFeeSplitOfPair', [toPrec(values.feeSplit)])} />
            <div>
              <div className="mb-1 text-[12px] font-medium text-[#B2ADA9]">setSpreadOfPair (compress, sSell, sBuy — uint32)</div>
              <div className="flex gap-2 max-sm:flex-wrap">
                <Input value={values.compress ?? ''} onChange={(event) => setValue('compress', event.target.value)} placeholder="compress" inputMode="decimal" />
                <Input value={values.sSell ?? ''} onChange={(event) => setValue('sSell', event.target.value)} placeholder="sSell" inputMode="decimal" />
                <Input value={values.sBuy ?? ''} onChange={(event) => setValue('sBuy', event.target.value)} placeholder="sBuy" inputMode="decimal" />
                <ActionButton disabled={busy} onClick={() => submit('Set spread', 'setSpreadOfPair', [toPrec(values.compress), toPrec(values.sSell), toPrec(values.sBuy)])} className="!min-h-[44px] !w-[100px] shrink-0 !px-3 max-sm:!w-full">{busy ? '...' : 'Submit'}</ActionButton>
              </div>
            </div>
            <PreviewSettingsRow label="setFixSpreadOfPair (fixS — uint32)" value={values.fixS} onChange={(value) => setValue('fixS', value)} busy={busy} onSubmit={() => submit('Set fix spread', 'setFixSpreadOfPair', [toPrec(values.fixS)])} />
            <PreviewSettingsRow label="setDisThresholdOfPair (uint32)" value={values.disThreshold} onChange={(value) => setValue('disThreshold', value)} busy={busy} onSubmit={() => submit('Set distance threshold', 'setDisThresholdOfPair', [toPrec(values.disThreshold)])} />
            <PreviewSettingsRow label="setSboundOfPair (uint32)" value={values.sBound} onChange={(value) => setValue('sBound', value)} busy={busy} onSubmit={() => submit('Set sBound', 'setSboundOfPair', [toPrec(values.sBound)])} />
            <PreviewSettingsRow label="setPythWeightOfPair (uint32)" value={values.pythWeight} onChange={(value) => setValue('pythWeight', value)} busy={busy} onSubmit={() => submit('Set Pyth weight', 'setPythWeightOfPair', [toPrec(values.pythWeight)])} />
            <PreviewSettingsRow label="setGammaOfPair (uint32)" value={values.gamma} onChange={(value) => setValue('gamma', value)} busy={busy} onSubmit={() => submit('Set gamma', 'setGammaOfPair', [toPrec(values.gamma)])} />
          </div>
        </ModalShell>
      )}
    </Modal>
  )
}

function PreviewSettingsRow({ label, value, onChange, onSubmit, busy }: {
  label: string
  value?: string
  onChange: (value: string) => void
  onSubmit: () => void
  busy: boolean
}) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-medium text-[#B2ADA9]">{label}</div>
      <div className="flex gap-2">
        <Input value={value ?? ''} onChange={(event) => onChange(event.target.value)} inputMode="decimal" />
        <ActionButton disabled={busy} onClick={onSubmit} className="!min-h-[44px] !w-[100px] shrink-0 !px-3">{busy ? '...' : 'Submit'}</ActionButton>
      </div>
    </div>
  )
}

function GlobalSettingsModal({
  isOpen,
  onDismiss,
  chainId,
  pools,
  onChanged,
}: {
  isOpen: boolean
  onDismiss: () => void
  chainId: number
  pools: PairStats[]
  onChanged: () => void
}) {
  const [gamma, setGamma] = useState('')
  const [selectedPairIds, setSelectedPairIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const { account, library } = useActiveWeb3React()
  const { createToast } = useToast()
  const addTransaction = useTransactionAdder()
  const isRobinhood = chainId === ChainId.ROBINHOOD_MAINNET
  const selectedCount = selectedPairIds.size
  const allSelected = pools.length > 0 && selectedCount === pools.length

  const closeModal = () => {
    setGamma('')
    setSelectedPairIds(new Set())
    onDismiss()
  }

  const togglePair = (pairId: string) => {
    const normalizedId = pairId.toLowerCase()
    setSelectedPairIds((current) => {
      const next = new Set(current)
      if (next.has(normalizedId)) next.delete(normalizedId)
      else next.add(normalizedId)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedPairIds(allSelected ? new Set() : new Set(pools.map((pair) => pair.id.toLowerCase())))
  }

  const submitBatch = async () => {
    if (!account || !library) {
      createToast('Connect an authorized wallet to update gamma', 'error')
      return
    }
    if (selectedCount === 0) {
      createToast('Select at least one pool', 'error')
      return
    }
    if (!gamma.trim()) {
      createToast('Enter a gamma value', 'error')
      return
    }
    setBusy(true)
    try {
      const scaledGamma = toPrec(gamma)
      const selectedPools = pools.filter((pair) => selectedPairIds.has(pair.id.toLowerCase()))
      const updates = selectedPools.map((pair) => [pair.token0!.id, pair.token1!.id, scaledGamma])
      const contract = new Contract(GAMMA_BATCH_CONTRACT, GAMMA_BATCH_ABI, library.getSigner(account))
      await contract.callStatic.setGammasOfPairs(updates)
      const response = (await contract.setGammasOfPairs(updates)) as TransactionResponse
      addTransaction(response, { summary: `Set gamma for ${selectedCount} pools` })
      createToast('Gamma transaction submitted')
      await response.wait()
      onChanged()
      closeModal()
    } catch (submitError) {
      if (isUserRejection(submitError)) createToast('Transaction rejected in wallet', 'error')
      else createToast(decodeContractError(submitError, 'Failed to update gamma') ?? 'Failed to update gamma', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={closeModal} maxWidth={600}>
      <div className="w-full p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sliders size={19} color="#C98B55" />
              <h2 className="text-[18px] font-semibold text-[#FBFBFD]">Batch Settings</h2>
            </div>
            <p className="text-[13px] text-[#978A80]">{CHAIN_NAMES[chainId] ?? `Chain ${chainId}`} · {pools.length} pools</p>
          </div>
          <button onClick={closeModal} className="rounded-lg p-2 text-[#978A80] hover:bg-[#2F2823] hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {isRobinhood ? (
          <>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#978A80]">Pools</label>
            <div className="mb-5 overflow-hidden rounded-xl border border-[#2F2823] bg-[#18130F]">
              <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#2F2823] px-4">
                <label className="flex cursor-pointer items-center gap-3 text-[13px] font-semibold text-[#FBFBFD]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer accent-[#985C2A]"
                  />
                  Select all pools
                </label>
                <span className="text-[12px] font-medium text-[#C98B55]">{selectedCount} selected</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {pools.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[13px] text-[#71665D]">No pools available on this chain.</div>
                ) : (
                  pools.map((pair) => {
                    const normalizedId = pair.id.toLowerCase()
                    const selected = selectedPairIds.has(normalizedId)
                    return (
                      <label
                        key={pair.id}
                        className={`flex cursor-pointer items-center gap-3 border-b border-[#2F2823] px-4 py-3 last:border-b-0 hover:bg-[#251F1A] ${
                          selected ? 'bg-[#21170F]' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePair(pair.id)}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-[#985C2A]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-[#FBFBFD]"><PairSymbols pair={pair} chainId={chainId} /></span>
                          <span className="block text-[11px] text-[#71665D]">{compactAddress(pair.id)}</span>
                        </span>
                        <span className="hidden shrink-0 grid-cols-2 gap-5 text-right text-[11px] text-[#978A80] sm:grid">
                          <span>
                            TVL <b className="block font-semibold text-[#D9D0C8]">{displayMetric(pair.tvl, 'usd')}</b>
                          </span>
                          <span>
                            Gamma <b className="block font-semibold text-[#D9D0C8]">{displayConfig(pair.gamma)}</b>
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-[11px] text-[#978A80] sm:hidden">
                          <b className="block font-semibold text-[#D9D0C8]">{displayMetric(pair.tvl, 'usd')}</b>
                          γ {displayConfig(pair.gamma)}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#978A80]">New gamma</label>
            <Input value={gamma} onChange={(event) => setGamma(event.target.value)} placeholder="0.4" inputMode="decimal" />
            <div className="mt-2 flex justify-between text-[12px] text-[#71665D]">
              <span>Minimum 0.00000001</span>
              <span>Maximum 1</span>
            </div>
            <div className="mt-6 flex gap-2">
              <ActionButton $secondary onClick={closeModal}>Cancel</ActionButton>
              <ActionButton disabled={busy || selectedCount === 0} onClick={submitBatch}>{busy ? 'Updating...' : `Update ${selectedCount} ${selectedCount === 1 ? 'pool' : 'pools'}`}</ActionButton>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[#493E35] bg-[#251F1A] p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#302820] text-[#C98B55]">
              <SettingsIcon size={19} />
            </div>
            <div className="mb-1 text-[15px] font-semibold text-[#FBFBFD]">Batch settings are not available yet</div>
            <p className="text-[13px] leading-5 text-[#978A80]">Batch gamma updates are currently available on Robinhood only.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function SettingsPage() {
  const { chainId = ChainId.ROBINHOOD_MAINNET } = useActiveWeb3React()
  const factory = FACTORY_ADDRESS_V3_OFFICIAL[chainId]
  const useIndexer = v3UseIndexer(chainId, VERSION.V3_OFFICIAL)
  const { data: onChainPools = [], isLoading: isLoadingOnChain, error: onChainError, refetch: refetchPools } = useV3PoolsOnChain(
    chainId,
    VERSION.V3_OFFICIAL,
    !!factory && !useIndexer,
  )
  const { data: metricData, isLoading: isLoadingIndexer, error: indexerError, refetch: refetchMetrics } = useQuery<{
    pairs: PairStats[]
  }>({
    queryKey: ['settingsPairMetrics', chainId],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'SettingsPairMetrics',
        query: SETTINGS_PAIR_METRICS,
        variables: { chainId, version: VERSION.V3_OFFICIAL },
      }),
    enabled: !!factory && useIndexer,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
  const pools = useMemo(() => {
    const source = useIndexer ? metricData?.pairs ?? [] : onChainPools
    return source
      .slice()
      .sort((a, b) => Number(b.tvl || 0) - Number(a.tvl || 0))
  }, [metricData?.pairs, onChainPools, useIndexer])
  const isLoading = useIndexer ? isLoadingIndexer : isLoadingOnChain
  const error = useIndexer ? indexerError : onChainError
  const refreshPools = () => {
    void refetchPools()
    void refetchMetrics()
  }
  const [query, setQuery] = useState('')
  const [managedPair, setManagedPair] = useState<PairStats | null>(null)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)

  const filteredPools = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return pools
    return pools.filter((pair) =>
      `${labelForPair(pair)} ${pair.id} ${pair.token0?.id ?? ''} ${pair.token1?.id ?? ''}`.toLowerCase().includes(normalized),
    )
  }, [pools, query])

  const chainName = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#FBFBFD] sm:text-[38px]">Pool Settings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#2F2823] bg-[#1E1915] px-4 text-[13px] font-semibold text-[#C9A987]">
            <span className="h-2 w-2 rounded-full bg-[#5FB98A]" /> {chainName}
          </div>
          <ActionButton onClick={() => setShowGlobalSettings(true)}>
            <SettingsIcon size={17} /> Batch Settings
          </ActionButton>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[340px]">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71665D]" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pool or address" className="!pl-10" />
        </div>
        <span className="text-[13px] text-[#978A80]">{filteredPools.length} of {pools.length} pools</span>
      </div>

      <Panel>
        <TableHeader>
          <span>Pool</span>
          <span>Gamma</span>
          <span>TVL</span>
          <span>Volume 24h</span>
          <span>APR</span>
          <span />
        </TableHeader>

        {!factory ? (
          <EmptyState title="V3 Official is not available" description={`There is no V3 Official deployment configured on ${chainName}.`} />
        ) : isLoading ? (
          <div className="divide-y divide-[#2F2823]">
            {Array.from({ length: 5 }, (_, index) => <PoolSkeleton key={index} />)}
          </div>
        ) : error ? (
          <EmptyState title="Unable to load pools" description="The chain RPC did not return the current pool configuration." />
        ) : filteredPools.length === 0 ? (
          <EmptyState title={query ? 'No matching pools' : 'No pools found'} description={query ? 'Try another token symbol or address.' : `No V3 Official pools were found on ${chainName}.`} />
        ) : (
          filteredPools.map((pair) => (
            <PoolRow key={pair.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <PairLogo pair={pair} chainId={chainId} />
                  <span className="truncate text-[15px] font-semibold text-[#FBFBFD] sm:text-[16px]"><PairSymbols pair={pair} chainId={chainId} /></span>
                  <span className="rounded-md border border-[#493E35] bg-[#2F2823] px-2 py-1 text-[11px] font-semibold text-[#D8A072]">
                    {(pair.fee * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}% fee
                  </span>
                </div>
                <a
                  href={getEtherscanLink(chainId, pair.id, 'address')}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#71665D] hover:text-[#C9A987]"
                >
                  {compactAddress(pair.id)} <ExternalLink size={11} />
                </a>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[#978A80] min-[921px]:hidden">
                  <span>Gamma <b className="font-semibold text-[#D8A072]">{displayConfig(pair.gamma)}</b></span>
                  <span>TVL <b className="font-semibold text-[#CFC7C1]">{displayMetric(pair.tvl, 'usd')}</b></span>
                  <span>24h <b className="font-semibold text-[#CFC7C1]">{displayMetric(pair.volumeDay, 'usd')}</b></span>
                </div>
              </div>
              <span className="hidden text-[14px] font-semibold text-[#D8A072] min-[921px]:block">{displayConfig(pair.gamma)}</span>
              <span className="hidden text-[14px] text-[#CFC7C1] min-[921px]:block">{displayMetric(pair.tvl, 'usd')}</span>
              <span className="hidden text-[14px] text-[#CFC7C1] min-[921px]:block">{displayMetric(pair.volumeDay, 'usd')}</span>
              <span className="hidden text-[14px] text-[#CFC7C1] min-[921px]:block">{displayMetric(pair.apr, 'percent')}</span>
              <ActionButton onClick={() => setManagedPair(pair)}>
                Manage <ArrowRight size={16} />
              </ActionButton>
            </PoolRow>
          ))
        )}
      </Panel>

      <ManageModal
        pair={managedPair}
        chainId={chainId}
        factory={factory}
        onDismiss={() => setManagedPair(null)}
        onChanged={() => {
          refreshPools()
        }}
      />
      <GlobalSettingsModal
        isOpen={showGlobalSettings}
        onDismiss={() => setShowGlobalSettings(false)}
        chainId={chainId}
        pools={pools}
        onChanged={() => {
          refreshPools()
        }}
      />
    </Page>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#493E35] bg-[#251F1A] text-[#C98B55]">
        <Sliders size={20} />
      </div>
      <div className="mb-1 text-[16px] font-semibold text-[#FBFBFD]">{title}</div>
      <p className="max-w-[420px] text-[13px] leading-5 text-[#978A80]">{description}</p>
    </div>
  )
}

function PoolSkeleton() {
  return (
    <div className="grid min-h-[92px] grid-cols-[2fr_0.7fr_0.85fr_0.85fr_0.85fr_132px] items-center gap-4 px-5 max-[920px]:grid-cols-[1fr_120px]">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className={`h-4 animate-pulse rounded bg-[#302820] ${index > 1 ? 'max-[920px]:hidden' : ''}`} />
      ))}
    </div>
  )
}
