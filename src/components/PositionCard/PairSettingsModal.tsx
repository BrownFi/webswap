import { Pair } from '@brownfi/sdk'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { useMemo, useState } from 'react'
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
import { FACTORY_ADDRESS_V3 } from 'lib/sdk/constants/addresses'
import { decodeContractError } from 'utils/decodeContractError'
import { isUserRejection } from 'utils/zapErrors'

// V3 admin setters as exposed by the v3-final factory. The previous deploy
// shipped one setter per parameter (setKappaOfPair, setLambdaOfPair, etc.);
// v3-final consolidates them behind a single `setConfigOfPair(tokenA, tokenB,
// Config tuple)` plus two preserved partial setters (fee, disThreshold).
// Updating one field means reading the current Config, mutating it, and
// writing the whole tuple back — see `submitViaSetConfig` below.
const V3_FACTORY_SETTERS_ABI = [
  'function setConfigOfPair(address tokenA, address tokenB, (uint256 kB, uint256 kQ, uint64 lambda, uint32 fee, uint32 feeSplit, uint32 compress, uint32 sSell, uint32 sBuy, uint32 fixS, uint32 disThreshold, uint32 sBound, uint32 pythWeight, uint32 gamma) config)',
  'function setFeeOfPair(address tokenA, address tokenB, uint32 fee)',
  'function setDisThresholdOfPair(address tokenA, address tokenB, uint32 disThreshold)',
] as const

// Config field order matches IBrownFiV3PairConfig.Config — must align with
// the tuple in setConfigOfPair above and the layout of getConfig in useDev-
// Stats. Q64 scaling for the first three (kB/kQ/lambda); PRECISION (1e8) for
// the rest. Display numbers in `currentValues` are already in fraction form.
type ConfigOverride = Partial<Record<
  'kB' | 'kQ' | 'lambda' | 'fee' | 'feeSplit' | 'compress' | 'sSell' | 'sBuy' |
  'fixS' | 'disThreshold' | 'sBound' | 'pythWeight' | 'gamma',
  string
>>

const buildConfigTuple = (current: DevStatsLike | undefined, overrides: ConfigOverride) => {
  // `current` values are decoded fractions; convert back to chain units. Use
  // overrides where provided (already strings from the input field, also in
  // fraction form). Missing fields fall back to 0 — caller should guard so
  // that a single-field update doesn't silently zero out unset siblings on a
  // pool with no current values loaded yet.
  const q64 = (v: string | number | undefined) => v == null || v === '' ? '0' : Math.floor(Number(v) * 2 ** 64).toString()
  const prec = (v: string | number | undefined) => v == null || v === '' ? '0' : Math.floor(Number(v) * 1e8).toString()
  return [
    q64(overrides.kB ?? current?.kB),
    q64(overrides.kQ ?? current?.kQ),
    q64(overrides.lambda ?? current?.lambda),
    prec(overrides.fee ?? current?.fee),
    prec(overrides.feeSplit ?? current?.feeSplit),
    prec(overrides.compress ?? current?.compress),
    prec(overrides.sSell ?? current?.sSell),
    prec(overrides.sBuy ?? current?.sBuy),
    prec(overrides.fixS ?? current?.fixS),
    prec(overrides.disThreshold ?? current?.disThreshold),
    prec(overrides.sBound ?? current?.sBound),
    prec(overrides.pythWeight ?? current?.pythWeight),
    prec(overrides.gamma ?? current?.gamma),
  ] as const
}

// V2: 4 rows. V3: 11 rows. The V3-only rows live below the shared ones and
// each maps to one factory setter — see `submit*` handlers below.
type FieldKey =
  | 'k'
  | 'kappa' // V3 — sets kB + kQ together
  | 'lambda'
  | 'fee'
  | 'protocolFee'
  | 'spread' // V3 — compress + sSell + sBuy
  | 'fixS'
  | 'disThreshold'
  | 'sBound'
  | 'pythWeight'
  | 'gamma'

type DevStatsLike = {
  lambda?: number
  kappa?: number
  fee?: number
  protocolFee?: number
  feeSplit?: number
  // V3 extras
  kB?: number
  kQ?: number
  compress?: number
  sSell?: number
  sBuy?: number
  fixS?: number
  disThreshold?: number
  sBound?: number
  pythWeight?: number
  gamma?: number
}

type Props = {
  isOpen: boolean
  onDismiss: () => void
  pair: Pair
  currentValues?: DevStatsLike
}

const sanitize = (value: string) => value.trim()
const round = (v: number) => parseFloat((Math.round(v * 1e6) / 1e6).toFixed(6)).toString()
const toQ64 = (v: string) => Math.floor(Number(v) * 2 ** 64).toString()
const toPREC = (v: string) => Math.floor(Number(v) * 10 ** 8).toString()

// Row component MUST live outside the parent — declaring it inside causes
// React to remount the <input> on every render (new function identity ⇒ new
// component type), which makes the input lose focus after each keystroke.
function SettingsRow({
  label,
  value,
  setValue,
  placeholder,
  onSubmit,
  busy,
}: {
  label: string
  value: string
  setValue: (v: string) => void
  placeholder?: string
  onSubmit: () => void
  busy: boolean
}) {
  return (
    <div>
      <Text fontSize={12} color="#b2ada9" className="mb-1">{label}</Text>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(sanitize(e.target.value))}
          placeholder={placeholder}
          className="w-full bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
          inputMode="decimal"
        />
        <ButtonPrimary onClick={onSubmit} disabled={busy} className="!w-[100px] !py-2 shrink-0">
          {busy ? '...' : 'Submit'}
        </ButtonPrimary>
      </div>
    </div>
  )
}

export function PairSettingsModal({ isOpen, onDismiss, pair, currentValues }: Props) {
  const { account, chainId, library } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const isV3 = version === 3
  const { createToast } = useToast()
  const factoryContract = useFactoryContract(true, { readonly: false })
  const addTransaction = useTransactionAdder()

  // V3 setters aren't in IBrownFiV2Factory.json — build a tiny Contract from
  // the inline ABI above so the V3 admin writes resolve at call time. V2
  // continues to use `factoryContract` from the shared hook (which has the
  // legacy V2 setter surface).
  const factoryV3 = useMemo(() => {
    if (!isV3 || !library || !account || !chainId) return null
    const addr = FACTORY_ADDRESS_V3[chainId]
    if (!addr) return null
    const signer = typeof library.getSigner === 'function' ? library.getSigner(account) : library
    return new Contract(addr, V3_FACTORY_SETTERS_ABI, signer)
  }, [isV3, library, account, chainId])

  // Inputs — one per row (kappa + spread are paired sub-inputs)
  const [kInput, setKInput] = useState('')
  const [kBInput, setKBInput] = useState('')
  const [kQInput, setKQInput] = useState('')
  const [lambdaInput, setLambdaInput] = useState('')
  const [feeInput, setFeeInput] = useState('')
  const [protocolFeeInput, setProtocolFeeInput] = useState('')
  const [compressInput, setCompressInput] = useState('')
  const [sSellInput, setSSellInput] = useState('')
  const [sBuyInput, setSBuyInput] = useState('')
  const [fixSInput, setFixSInput] = useState('')
  const [disThresholdInput, setDisThresholdInput] = useState('')
  const [sBoundInput, setSBoundInput] = useState('')
  const [pythWeightInput, setPythWeightInput] = useState('')
  const [gammaInput, setGammaInput] = useState('')

  const protocolFeeValue = isV3 ? currentValues?.feeSplit : currentValues?.protocolFee

  // Pre-fill on open (one-shot — wiping state on close)
  const [initialized, setInitialized] = useState(false)
  if (isOpen && !initialized && currentValues) {
    if (currentValues.kappa !== undefined) setKInput(round(currentValues.kappa))
    if (currentValues.kB !== undefined) setKBInput(round(currentValues.kB))
    if (currentValues.kQ !== undefined) setKQInput(round(currentValues.kQ))
    if (currentValues.lambda !== undefined) setLambdaInput(round(currentValues.lambda))
    if (currentValues.fee !== undefined) setFeeInput(round(currentValues.fee))
    if (protocolFeeValue !== undefined) setProtocolFeeInput(round(protocolFeeValue))
    if (currentValues.compress !== undefined) setCompressInput(round(currentValues.compress))
    if (currentValues.sSell !== undefined) setSSellInput(round(currentValues.sSell))
    if (currentValues.sBuy !== undefined) setSBuyInput(round(currentValues.sBuy))
    if (currentValues.fixS !== undefined) setFixSInput(round(currentValues.fixS))
    if (currentValues.disThreshold !== undefined) setDisThresholdInput(round(currentValues.disThreshold))
    if (currentValues.sBound !== undefined) setSBoundInput(round(currentValues.sBound))
    if (currentValues.pythWeight !== undefined) setPythWeightInput(round(currentValues.pythWeight))
    if (currentValues.gamma !== undefined) setGammaInput(round(currentValues.gamma))
    setInitialized(true)
  }
  if (!isOpen && initialized) setInitialized(false)

  const [submitting, setSubmitting] = useState<Record<FieldKey, boolean>>({
    k: false, kappa: false, lambda: false, fee: false, protocolFee: false,
    spread: false, fixS: false, disThreshold: false, sBound: false, pythWeight: false, gamma: false,
  })

  const handleDismiss = () => onDismiss()

  // Common error → toast mapper so each submitter doesn't re-do it. Routes
  // through the shared decoder so per-parameter bound names (e.g.
  // "Gamma out of range. Gamma exceeds MAX_GAMMA…") replace the previous
  // generic "value out of range" toast. Authorization reverts (caller lacks
  // the admin role) generally surface as UNPREDICTABLE_GAS_LIMIT during
  // estimateGas without a useful revert reason, so we keep the dedicated
  // authorization message for that case before falling back to the decoder.
  const handleSubmitError = (submitError: unknown) => {
    console.error(submitError)
    if (isUserRejection(submitError)) {
      createToast('Transaction rejected in wallet', 'error')
      return
    }
    const err = submitError as { code?: string | number; message?: string; reason?: string }
    const raw = `${err?.reason ?? ''} ${err?.message ?? ''}`.toLowerCase()
    const reasonText = typeof err?.reason === 'string' ? err.reason : ''
    const looksLikeContractBound = reasonText.startsWith('PairConfig:') || reasonText.startsWith('Factory:')
    const isAuthFailure =
      !looksLikeContractBound &&
      (err?.code === 'UNPREDICTABLE_GAS_LIMIT' ||
        raw.includes('unpredictable_gas_limit') ||
        (raw.includes('execution reverted') && !reasonText))
    if (isAuthFailure) {
      createToast('Reverted — this wallet is not authorized (admin role required)', 'error')
      return
    }
    const decoded = decodeContractError(submitError, 'Failed to send transaction')
    createToast(decoded ?? 'Failed to send transaction', 'error')
  }

  // Runs `op` with submitting state + toast handling. Centralizes the
  // common boilerplate so each field row stays a one-liner. `requireContract`
  // selects which contract is needed (V2 path uses `factoryContract`, V3 path
  // uses `factoryV3` for the dedicated setters).
  const runSubmit = async (
    field: FieldKey,
    summary: string,
    op: () => Promise<TransactionResponse>,
    needs: 'v2' | 'v3' = 'v2',
    // Optional eth_call dry-run. Ethers' default `.method(...)` runs
    // estimateGas first; when a Factory→PairConfig revert bubbles through
    // estimateGas, the inner `require(..., 'PairConfig: ...')` reason often
    // gets dropped on the way back — the FE then sees UNPREDICTABLE_GAS_LIMIT
    // with no reasonText and the auth heuristic mis-classifies it as
    // "not authorized". Passing the same call via `callStatic` (which uses
    // plain eth_call) preserves the inner string, so constraint violations
    // surface with the right "Lambda out of range" / "kB out of range"
    // toast instead. The dry-run runs first; on revert we short-circuit
    // and skip the real submit.
    simulate?: () => Promise<unknown>,
  ) => {
    const ctr = needs === 'v3' ? factoryV3 : factoryContract
    if (!ctr || !account) {
      createToast('Wallet not connected', 'error')
      return
    }
    setSubmitting((prev) => ({ ...prev, [field]: true }))
    try {
      if (simulate) {
        try {
          await simulate()
        } catch (simErr) {
          handleSubmitError(simErr)
          return
        }
      }
      const response = await op()
      addTransaction(response, { summary: `${summary} for ${pair.token0.symbol}/${pair.token1.symbol}` })
    } catch (err) {
      handleSubmitError(err)
    } finally {
      setSubmitting((prev) => ({ ...prev, [field]: false }))
    }
  }

  const tokenA = pair.token0.address
  const tokenB = pair.token1.address

  // Refuse to send a single-field update if `currentValues` hasn't loaded —
  // otherwise the unset siblings in the Config tuple would default to 0 and
  // silently overwrite the on-chain config. Caller is admin so a hard error
  // is preferable to a corrupted pool.
  const requireCurrent = (): boolean => {
    if (!currentValues || (currentValues.kB === undefined && currentValues.fee === undefined)) {
      createToast('Open this modal on an existing pool — current config has not loaded yet', 'error')
      return false
    }
    return true
  }

  const submitViaSetConfig = (field: FieldKey, summary: string, override: ConfigOverride) => {
    if (!requireCurrent()) return
    const tuple = buildConfigTuple(currentValues, override)
    return runSubmit(
      field, summary,
      () => factoryV3!.setConfigOfPair(tokenA, tokenB, tuple),
      'v3',
      () => factoryV3!.callStatic.setConfigOfPair(tokenA, tokenB, tuple),
    )
  }

  // ─── Submitters (one per row) ─────────────────────────────────────────────
  // V2 keeps its legacy per-field setters (factoryContract). V3 routes all
  // edits except `fee` and `disThreshold` through setConfigOfPair — those two
  // are still partial setters on the v3-final factory.
  const submitK = () =>
    runSubmit('k', 'Set K', () => factoryContract!.setKOfPair(tokenA, tokenB, toQ64(kInput)), 'v2')

  const submitKappa = () => {
    const kB = kBInput || (currentValues?.kB !== undefined ? round(currentValues.kB) : '')
    const kQ = kQInput || (currentValues?.kQ !== undefined ? round(currentValues.kQ) : '')
    if (!kB || !kQ) return createToast('Enter both kB and kQ (or open this modal on an existing pool to inherit)', 'error')
    return submitViaSetConfig('kappa', 'Set Kappa', { kB, kQ })
  }

  const submitLambda = () =>
    isV3
      ? submitViaSetConfig('lambda', 'Set Lambda', { lambda: lambdaInput })
      : runSubmit('lambda', 'Set Lambda', () => factoryContract!.setLambdaOfPair(tokenA, tokenB, toQ64(lambdaInput)), 'v2')

  // fee + disThreshold are the two preserved partial setters on v3-final, so
  // they keep their direct call path (one tx, no read-modify-write).
  const submitFee = () =>
    isV3
      ? runSubmit(
          'fee', 'Set Fee',
          () => factoryV3!.setFeeOfPair(tokenA, tokenB, toPREC(feeInput)),
          'v3',
          () => factoryV3!.callStatic.setFeeOfPair(tokenA, tokenB, toPREC(feeInput)),
        )
      : runSubmit('fee', 'Set Fee', () => factoryContract!.setFeeOfPair(tokenA, tokenB, toPREC(feeInput)), 'v2')

  const submitProtocolFee = () =>
    isV3
      ? submitViaSetConfig('protocolFee', 'Set FeeSplit', { feeSplit: protocolFeeInput })
      : runSubmit(
          'protocolFee', 'Set Protocol Fee',
          () => factoryContract!.setProtocolFeeOfPair(tokenA, tokenB, toPREC(protocolFeeInput)),
          'v2',
        )

  const submitSpread = () => {
    const compress = compressInput || (currentValues?.compress !== undefined ? round(currentValues.compress) : '')
    const sSell = sSellInput || (currentValues?.sSell !== undefined ? round(currentValues.sSell) : '')
    const sBuy = sBuyInput || (currentValues?.sBuy !== undefined ? round(currentValues.sBuy) : '')
    if (compress === '' || sSell === '' || sBuy === '') {
      return createToast('Spread requires compress, sSell and sBuy — fill all three (or inherit from current)', 'error')
    }
    return submitViaSetConfig('spread', 'Set Spread', { compress, sSell, sBuy })
  }

  const submitFixS = () => submitViaSetConfig('fixS', 'Set fixS', { fixS: fixSInput })
  const submitDisThreshold = () =>
    runSubmit(
      'disThreshold', 'Set disThreshold',
      () => factoryV3!.setDisThresholdOfPair(tokenA, tokenB, toPREC(disThresholdInput)),
      'v3',
      () => factoryV3!.callStatic.setDisThresholdOfPair(tokenA, tokenB, toPREC(disThresholdInput)),
    )
  const submitSBound = () => submitViaSetConfig('sBound', 'Set sBound', { sBound: sBoundInput })
  const submitPythWeight = () => submitViaSetConfig('pythWeight', 'Set pythWeight', { pythWeight: pythWeightInput })
  const submitGamma = () => submitViaSetConfig('gamma', 'Set gamma', { gamma: gammaInput })

  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss}>
      <div
        className="flex flex-col gap-4 p-4 text-white w-full max-h-[80vh] overflow-y-auto pair-settings-scroll"
        style={{
          // Hide scrollbar visually but keep scrolling functional. The list is
          // tall on V3 (11 rows) and the default scrollbar looked noisy.
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' as any, // legacy IE/Edge
        }}
      >
        <style>{`.pair-settings-scroll::-webkit-scrollbar { display: none; }`}</style>
        <RowBetween>
          <Text fontSize={18} fontWeight={600}>Pair settings</Text>
          <CloseIcon onClick={handleDismiss} />
        </RowBetween>

        <div className="space-y-3">
          {/* Kappa — single Q64 on V2, paired (kB + kQ) on V3 */}
          {isV3 ? (
            <div>
              <Text fontSize={12} color="#b2ada9" className="mb-1">setKappaOfPair (kB, kQ — Q64)</Text>
              <div className="flex gap-2">
                <input
                  value={kBInput}
                  onChange={(e) => setKBInput(sanitize(e.target.value))}
                  placeholder={currentValues?.kB !== undefined ? `kB: ${round(currentValues.kB)}` : 'kB'}
                  className="flex-1 min-w-0 bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                  inputMode="decimal"
                />
                <input
                  value={kQInput}
                  onChange={(e) => setKQInput(sanitize(e.target.value))}
                  placeholder={currentValues?.kQ !== undefined ? `kQ: ${round(currentValues.kQ)}` : 'kQ'}
                  className="flex-1 min-w-0 bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                  inputMode="decimal"
                />
                <ButtonPrimary onClick={submitKappa} disabled={submitting.kappa} className="!w-[100px] !py-2 shrink-0">
                  {submitting.kappa ? '...' : 'Submit'}
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <SettingsRow
              label="setKOfPair (uint256)"
              value={kInput}
              setValue={setKInput}
              placeholder={currentValues?.kappa !== undefined ? `Current: ${round(currentValues.kappa)}` : 'K'}
              onSubmit={submitK}
              busy={submitting.k}
            />
          )}

          <SettingsRow
            label="setLambdaOfPair (uint64)"
            value={lambdaInput}
            setValue={setLambdaInput}
            placeholder={currentValues?.lambda !== undefined ? `Current: ${round(currentValues.lambda)}` : 'Lambda'}
            onSubmit={submitLambda}
            busy={submitting.lambda}
          />

          <SettingsRow
            label="setFeeOfPair (uint32)"
            value={feeInput}
            setValue={setFeeInput}
            placeholder={currentValues?.fee !== undefined ? `Current: ${round(currentValues.fee)}` : 'Fee'}
            onSubmit={submitFee}
            busy={submitting.fee}
          />

          <SettingsRow
            label={isV3 ? 'setFeeSplitOfPair (uint32)' : 'setProtocolFeeOfPair (uint32)'}
            value={protocolFeeInput}
            setValue={setProtocolFeeInput}
            placeholder={protocolFeeValue !== undefined ? `Current: ${round(protocolFeeValue)}` : 'Protocol Fee'}
            onSubmit={submitProtocolFee}
            busy={submitting.protocolFee}
          />

          {/* V3-only rows */}
          {isV3 && (
            <>
              <div>
                <Text fontSize={12} color="#b2ada9" className="mb-1">setSpreadOfPair (compress, sSell, sBuy — uint32)</Text>
                <div className="flex gap-2">
                  <input
                    value={compressInput}
                    onChange={(e) => setCompressInput(sanitize(e.target.value))}
                    placeholder={currentValues?.compress !== undefined ? `${round(currentValues.compress)}` : 'compress'}
                    className="flex-1 min-w-0 bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                    inputMode="decimal"
                  />
                  <input
                    value={sSellInput}
                    onChange={(e) => setSSellInput(sanitize(e.target.value))}
                    placeholder={currentValues?.sSell !== undefined ? `${round(currentValues.sSell)}` : 'sSell'}
                    className="flex-1 min-w-0 bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                    inputMode="decimal"
                  />
                  <input
                    value={sBuyInput}
                    onChange={(e) => setSBuyInput(sanitize(e.target.value))}
                    placeholder={currentValues?.sBuy !== undefined ? `${round(currentValues.sBuy)}` : 'sBuy'}
                    className="flex-1 min-w-0 bg-[#1d1c21] text-white px-3 py-2 border border-[#3b3a41] focus:outline-none"
                    inputMode="decimal"
                  />
                  <ButtonPrimary onClick={submitSpread} disabled={submitting.spread} className="!w-[100px] !py-2 shrink-0">
                    {submitting.spread ? '...' : 'Submit'}
                  </ButtonPrimary>
                </div>
              </div>

              <SettingsRow
                label="setFixSpreadOfPair (fixS — uint32)"
                value={fixSInput}
                setValue={setFixSInput}
                placeholder={currentValues?.fixS !== undefined ? `Current: ${round(currentValues.fixS)}` : 'fixS'}
                onSubmit={submitFixS}
                busy={submitting.fixS}
              />

              <SettingsRow
                label="setDisThresholdOfPair (uint32)"
                value={disThresholdInput}
                setValue={setDisThresholdInput}
                placeholder={
                  currentValues?.disThreshold !== undefined
                    ? `Current: ${round(currentValues.disThreshold)}`
                    : 'disThreshold'
                }
                onSubmit={submitDisThreshold}
                busy={submitting.disThreshold}
              />

              <SettingsRow
                label="setSboundOfPair (uint32)"
                value={sBoundInput}
                setValue={setSBoundInput}
                placeholder={currentValues?.sBound !== undefined ? `Current: ${round(currentValues.sBound)}` : 'sBound'}
                onSubmit={submitSBound}
                busy={submitting.sBound}
              />

              <SettingsRow
                label="setPythWeightOfPair (uint32)"
                value={pythWeightInput}
                setValue={setPythWeightInput}
                placeholder={
                  currentValues?.pythWeight !== undefined ? `Current: ${round(currentValues.pythWeight)}` : 'pythWeight'
                }
                onSubmit={submitPythWeight}
                busy={submitting.pythWeight}
              />

              <SettingsRow
                label="setGammaOfPair (uint32)"
                value={gammaInput}
                setValue={setGammaInput}
                placeholder={currentValues?.gamma !== undefined ? `Current: ${round(currentValues.gamma)}` : 'gamma'}
                onSubmit={submitGamma}
                busy={submitting.gamma}
              />
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
