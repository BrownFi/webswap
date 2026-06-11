import { isV3Like } from '@brownfi/sdk'
import { Pair } from '@brownfi/sdk'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { useEffect, useMemo, useState } from 'react'
import { Text } from 'components/Rebass'

import { ButtonPrimary } from 'components/Button'
import { Modal } from 'components/Modal'
import { RowBetween } from 'components/Row'
import { useToast } from 'containers/ToastProvider'
import { useActiveWeb3React } from 'hooks'
import { useFactoryContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { CloseIcon } from 'theme/components'
import { factoryV3Gen } from 'lib/sdk/constants/addresses'
import { decodeContractError } from 'utils/decodeContractError'
import { isUserRejection } from 'utils/zapErrors'

// V3 admin setters as exposed by the v3-final factory. The PairConfig
// restructure REPLACED the old struct-based `setConfigOfPair(tokenA, tokenB,
// Config tuple)` with one granular setter per parameter — each forwards to the
// matching BrownFiV3PairConfig per-field setter. Calling the removed bulk
// setter (selector 0x692ef4d2) hits a non-existent function on the deployed
// factory and reverts with no reason string (data="0x"), which is what broke
// every admin write. Each `submit*` handler below calls its own setter.
const V3_FACTORY_SETTERS_ABI = [
  'function setKappaOfPair(address tokenA, address tokenB, uint256 kB, uint256 kQ)',
  'function setLambdaOfPair(address tokenA, address tokenB, uint64 lambda)',
  'function setFeeOfPair(address tokenA, address tokenB, uint32 fee)',
  'function setFeeSplitOfPair(address tokenA, address tokenB, uint32 feeSplit)',
  'function setSpreadOfPair(address tokenA, address tokenB, uint32 compress, uint32 sSell, uint32 sBuy)',
  'function setFixSpreadOfPair(address tokenA, address tokenB, uint32 fixS)',
  'function setDisThresholdOfPair(address tokenA, address tokenB, uint32 disThreshold)',
  'function setSboundOfPair(address tokenA, address tokenB, uint32 sBound)',
  'function setPythWeightOfPair(address tokenA, address tokenB, uint32 pythWeight)',
  'function setGammaOfPair(address tokenA, address tokenB, uint32 gamma)',
] as const

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
// BigInt-based Q64 conversion. The naive `Math.floor(Number(v) * 2**64)`
// overshoots by 1–2 ulp for small inputs because IEEE 754 doubles can't
// represent integers exactly past 2^53. Concrete repro that prompted the
// fix: toQ64('0.0005') = 9223372036854776 (off by 1), so 2×lambda came out
// to 18446744073709552 — exceeding the on-chain minK (18446744073709550)
// by 2 wei and reverting with 'PairConfig: LAMBDA_TOO_HIGH' even at the
// nominal max allowed input. The BigInt path multiplies the integer +
// fractional digits separately so no float multiplication happens at the
// Q64 scale.
const toQ64 = (v: string): string => {
  const trimmed = (v ?? '').trim()
  if (!trimmed || isNaN(Number(trimmed))) return '0'
  const negative = trimmed.startsWith('-')
  const cleaned = negative ? trimmed.slice(1) : trimmed
  const [intPart = '0', fracRaw = ''] = cleaned.split('.')
  // Pad/truncate fractional part to 18 digits — enough precision for any
  // realistic kappa/lambda input without overflowing intermediate BigInts.
  const fracPart = fracRaw.padEnd(18, '0').slice(0, 18)
  const SCALE = 10n ** 18n
  const Q64 = 2n ** 64n
  const scaled = BigInt(intPart) * SCALE + BigInt(fracPart)
  const result = (scaled * Q64) / SCALE
  return (negative ? -result : result).toString()
}
// BigInt-based PRECISION (1e8) conversion. Same motivation as toQ64: the naive
// `Math.floor(Number(v) * 1e8)` loses a ulp on values like 0.29 (→ 28999999)
// because the float product lands just under the integer. String-splitting the
// integer and fractional digits keeps it exact, so a nominally-valid input
// can't revert on an off-by-one bound (e.g. gamma 0.4 → exactly 40000000).
const toPREC = (v: string): string => {
  const trimmed = (v ?? '').trim()
  if (!trimmed || isNaN(Number(trimmed))) return '0'
  const negative = trimmed.startsWith('-')
  const cleaned = negative ? trimmed.slice(1) : trimmed
  const [intPart = '0', fracRaw = ''] = cleaned.split('.')
  const fracPart = fracRaw.padEnd(8, '0').slice(0, 8) // PRECISION = 1e8 → 8 decimals
  const result = BigInt(intPart) * 10n ** 8n + BigInt(fracPart)
  return (negative ? -result : result).toString()
}

// Q64 value to send for a kappa/lambda field. When the input still equals the
// pre-filled display (i.e. the admin didn't touch this field), send the EXACT
// on-chain raw Q64 instead of re-encoding the decimal. The round-trip
// raw → "0.005" → toQ64 is NOT identity for values written by the old
// float-based toQ64 (off by 1–2 wei), so on a pool sitting at the
// 2*lambda == min(kB,kQ) boundary, re-sending an "unchanged" kB silently
// dropped it a couple wei and reverted 'PairConfig: LAMBDA_TOO_HIGH'.
const q64Field = (input: string, displayVal: number | undefined, raw: string | undefined): string => {
  if (raw !== undefined && displayVal !== undefined && input.trim() === round(displayVal)) return raw
  return toQ64(input)
}

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
  // Key off the POOL's version, NOT the global useVersion toggle. The toggle
  // is the user's default-version preference and can differ from the pool
  // being edited (e.g. once the list shows both V3 Official + Pilot pools).
  // Resolving the factory from the toggle could send admin writes to the
  // wrong deployment. Same fix already applied in useTradingFee.
  const version = pair.version ?? 2
  const isV3 = isV3Like(version)
  const { createToast } = useToast()
  const factoryContract = useFactoryContract(true, { readonly: false })
  const addTransaction = useTransactionAdder()

  // V3 setters aren't in IBrownFiV2Factory.json — build a tiny Contract from
  // the inline ABI above so the V3 admin writes resolve at call time. V2
  // continues to use `factoryContract` from the shared hook (which has the
  // legacy V2 setter surface).
  const factoryV3 = useMemo(() => {
    if (!isV3 || !library || !account || !chainId) return null
    // Resolve the factory for the pool's version (4 = V3 Official, 3 = V3
    // Pilot). Hardcoding the pilot map sent v4 admin writes (setGammaOfPair
    // etc.) to the wrong factory.
    const addr = factoryV3Gen(version)[chainId]
    if (!addr) return null
    const signer = typeof library.getSigner === 'function' ? library.getSigner(account) : library
    return new Contract(addr, V3_FACTORY_SETTERS_ABI, signer)
  }, [isV3, version, library, account, chainId])

  // Exact on-chain raw Q64 config (kB/kQ/lambda), read once when the modal
  // opens. Used to preserve fields the admin didn't change — see q64Field.
  const [rawConfig, setRawConfig] = useState<{ kB?: string; kQ?: string; lambda?: string }>({})
  useEffect(() => {
    if (!isOpen || !isV3 || !chainId) return
    let stale = false
    ;(async () => {
      try {
        const { createPublicClient, http } = await import('viem')
        const { RPC_URLS } = await import('lib/sdk/constants/addresses')
        const factoryAddr = factoryV3Gen(version)[chainId]
        if (!factoryAddr) return
        const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
        const cfgAddr = await client.readContract({
          address: factoryAddr as `0x${string}`,
          abi: [{ inputs: [], name: 'pairConfig', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }] as const,
          functionName: 'pairConfig',
        })
        const c = (await client.readContract({
          address: cfgAddr as `0x${string}`,
          abi: [{
            inputs: [{ type: 'address' }],
            name: 'getConfig',
            outputs: [{
              components: [
                { name: 'kB', type: 'uint256' }, { name: 'kQ', type: 'uint256' }, { name: 'lambda', type: 'uint64' },
                { name: 'fee', type: 'uint32' }, { name: 'feeSplit', type: 'uint32' }, { name: 'compress', type: 'uint32' },
                { name: 'sSell', type: 'uint32' }, { name: 'sBuy', type: 'uint32' }, { name: 'fixS', type: 'uint32' },
                { name: 'disThreshold', type: 'uint32' }, { name: 'sBound', type: 'uint32' }, { name: 'pythWeight', type: 'uint32' },
                { name: 'gamma', type: 'uint32' },
              ],
              type: 'tuple',
            }],
            stateMutability: 'view', type: 'function',
          }] as const,
          functionName: 'getConfig',
          args: [pair.liquidityToken.address as `0x${string}`],
        })) as { kB: bigint; kQ: bigint; lambda: bigint }
        if (!stale) setRawConfig({ kB: c.kB.toString(), kQ: c.kQ.toString(), lambda: c.lambda.toString() })
      } catch {
        // No raw config (pool not yet created, RPC error) — q64Field falls
        // back to re-encoding the input, same as before.
        if (!stale) setRawConfig({})
      }
    })()
    return () => {
      stale = true
    }
  }, [isOpen, isV3, chainId, version, pair.liquidityToken.address])

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

  // ─── Submitters (one per row) ─────────────────────────────────────────────
  // V2 keeps its legacy per-field setters (factoryContract). V3 calls the
  // granular per-field factory setters directly — one tx touches exactly one
  // field, so there's no read-modify-write of the whole Config and no risk of
  // an unrelated stale/zeroed field clobbering on-chain state. Each V3 call
  // passes a `callStatic` dry-run so Factory→PairConfig revert reasons (e.g.
  // 'PairConfig: GAMMA_TOO_LOW') survive to the toast instead of being dropped
  // by estimateGas as a bare UNPREDICTABLE_GAS_LIMIT.
  const submitK = () =>
    runSubmit('k', 'Set K', () => factoryContract!.setKOfPair(tokenA, tokenB, toQ64(kInput)), 'v2')

  const submitKappa = () => {
    const kB = kBInput || (currentValues?.kB !== undefined ? round(currentValues.kB) : '')
    const kQ = kQInput || (currentValues?.kQ !== undefined ? round(currentValues.kQ) : '')
    if (!kB || !kQ) return createToast('Enter both kB and kQ (or open this modal on an existing pool to inherit)', 'error')
    // setKappaOfPair sets BOTH kB and kQ, so changing one re-sends the other.
    // Preserve the exact stored raw Q64 for the unchanged side so it doesn't
    // drift below 2*lambda at the boundary (see q64Field).
    const kBq = q64Field(kB, currentValues?.kB, rawConfig.kB)
    const kQq = q64Field(kQ, currentValues?.kQ, rawConfig.kQ)
    return runSubmit(
      'kappa', 'Set Kappa',
      () => factoryV3!.setKappaOfPair(tokenA, tokenB, kBq, kQq),
      'v3',
      () => factoryV3!.callStatic.setKappaOfPair(tokenA, tokenB, kBq, kQq),
    )
  }

  const submitLambda = () =>
    isV3
      ? runSubmit(
          'lambda', 'Set Lambda',
          () => factoryV3!.setLambdaOfPair(tokenA, tokenB, q64Field(lambdaInput, currentValues?.lambda, rawConfig.lambda)),
          'v3',
          () => factoryV3!.callStatic.setLambdaOfPair(tokenA, tokenB, q64Field(lambdaInput, currentValues?.lambda, rawConfig.lambda)),
        )
      : runSubmit('lambda', 'Set Lambda', () => factoryContract!.setLambdaOfPair(tokenA, tokenB, toQ64(lambdaInput)), 'v2')

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
      ? runSubmit(
          'protocolFee', 'Set FeeSplit',
          () => factoryV3!.setFeeSplitOfPair(tokenA, tokenB, toPREC(protocolFeeInput)),
          'v3',
          () => factoryV3!.callStatic.setFeeSplitOfPair(tokenA, tokenB, toPREC(protocolFeeInput)),
        )
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
    return runSubmit(
      'spread', 'Set Spread',
      () => factoryV3!.setSpreadOfPair(tokenA, tokenB, toPREC(compress), toPREC(sSell), toPREC(sBuy)),
      'v3',
      () => factoryV3!.callStatic.setSpreadOfPair(tokenA, tokenB, toPREC(compress), toPREC(sSell), toPREC(sBuy)),
    )
  }

  const submitFixS = () =>
    runSubmit(
      'fixS', 'Set fixS',
      () => factoryV3!.setFixSpreadOfPair(tokenA, tokenB, toPREC(fixSInput)),
      'v3',
      () => factoryV3!.callStatic.setFixSpreadOfPair(tokenA, tokenB, toPREC(fixSInput)),
    )
  const submitDisThreshold = () =>
    runSubmit(
      'disThreshold', 'Set disThreshold',
      () => factoryV3!.setDisThresholdOfPair(tokenA, tokenB, toPREC(disThresholdInput)),
      'v3',
      () => factoryV3!.callStatic.setDisThresholdOfPair(tokenA, tokenB, toPREC(disThresholdInput)),
    )
  const submitSBound = () =>
    runSubmit(
      'sBound', 'Set sBound',
      () => factoryV3!.setSboundOfPair(tokenA, tokenB, toPREC(sBoundInput)),
      'v3',
      () => factoryV3!.callStatic.setSboundOfPair(tokenA, tokenB, toPREC(sBoundInput)),
    )
  const submitPythWeight = () =>
    runSubmit(
      'pythWeight', 'Set pythWeight',
      () => factoryV3!.setPythWeightOfPair(tokenA, tokenB, toPREC(pythWeightInput)),
      'v3',
      () => factoryV3!.callStatic.setPythWeightOfPair(tokenA, tokenB, toPREC(pythWeightInput)),
    )
  const submitGamma = () =>
    runSubmit(
      'gamma', 'Set gamma',
      () => factoryV3!.setGammaOfPair(tokenA, tokenB, toPREC(gammaInput)),
      'v3',
      () => factoryV3!.callStatic.setGammaOfPair(tokenA, tokenB, toPREC(gammaInput)),
    )

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
          <Text fontSize={18} fontWeight={600}>
            Pair settings — {pair.token0.symbol}/{pair.token1.symbol}
          </Text>
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
