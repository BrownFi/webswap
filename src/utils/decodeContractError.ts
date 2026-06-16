import { isUserRejection } from './zapErrors'

/**
 * Decode revert data from BrownFi V2/V3 router + library custom errors into
 * a human-readable message we can show in a toast.
 *
 * Why this exists: ethers v5 leaves `error.reason = null` whenever the revert
 * is a Solidity custom error whose selector is not in the contract ABI
 * (`error.data` carries the raw 4-byte selector instead). Same for viem —
 * `BaseError.data` ends up as a hex string. The catch blocks in
 * AddLiquidity / RemoveLiquidity / Swap previously rendered nothing in that
 * case, so users hit "silent failure" UX on every router-side slippage or
 * Pyth-driven revert.
 *
 * Each entry pairs the 4-byte selector with two strings: a short LABEL
 * (used as the title of the toast) and a longer HINT explaining the likely
 * fix. Keep selectors lowercased — extraction strips the 0x prefix and
 * lowercases, so the lookup is case-insensitive.
 */

/** Pairs a short label with a longer remediation hint. */
interface ErrorEntry {
  label: string
  hint: string
}

/**
 * String-revert → human-readable mapping. Solidity `require(cond, "...")`
 * surfaces as `error.reason = "BrownFiV3: ..."`. Show a friendlier message
 * instead of the raw enum, indexed by exact `reason` match (case sensitive).
 *
 * Keep entries factual about what triggered the revert. The user typically
 * needs to either change input amounts or wait — don't suggest config edits
 * we don't expect users to know how to make.
 */
const STRING_REVERT_REGISTRY: Record<string, ErrorEntry> = {
  // Pool initiation (Section 4.1) — first LP must seed at least $10 of value.
  'BrownFiV3: INSUFFICIENT_INITIAL_VALUE': {
    label: 'Initial liquidity too low',
    hint: 'The first deposit into a new BrownFi V3 pool must be worth at least $10 in total value (both tokens combined, priced via Pyth). Increase deposit amounts.',
  },
  'BrownFiV3: INSUFFICIENT_INPUT_AMOUNT': {
    label: 'Insufficient input',
    hint: 'Input amount is too small for this pool. Try a larger amount.',
  },
  'BrownFiV3: INSUFFICIENT_OUTPUT_AMOUNT': {
    label: 'Insufficient output',
    hint: 'Output falls below your minimum. Increase slippage tolerance.',
  },
  'BrownFiV3: INSUFFICIENT_LIQUIDITY': {
    label: 'Insufficient pool liquidity',
    hint: 'Pool does not have enough liquidity for this trade.',
  },
  'BrownFiV3: INSUFFICIENT_LIQUIDITY_BURNED': {
    label: 'Burn amount too small',
    hint: 'You are trying to burn too little LP. Increase amount.',
  },
  'BrownFiV3: INSUFFICIENT_LIQUIDITY_MINTED': {
    label: 'Mint amount too small',
    hint: 'Deposit is too small to mint LP. Increase amounts.',
  },
  'BrownFiV3: INVALID_INVENTORY': {
    label: 'Pool inventory too skewed',
    hint: 'This trade would push the pool further from its oracle-balanced state. The opposite direction (selling the other token) usually works. Otherwise wait for arbitrage to rebalance the pool, or try a smaller size.',
  },
  'BrownFiV3: INVALID_PRICE': {
    label: 'Oracle price unavailable',
    hint: 'Pyth oracle has no fresh price for one of the tokens. Try again in a few seconds.',
  },
  'BrownFiV3: EXPIRED': {
    label: 'Transaction expired',
    hint: 'Transaction took too long. Refresh quote and try again.',
  },
  'BrownFiV3: LOCKED': {
    label: 'Pool busy',
    hint: 'Pool is processing another transaction. Try again in a moment.',
  },
  'BrownFiV3: PAUSED': {
    label: 'Pool paused',
    hint: 'This pool is currently paused by admin. Try a different pair or wait.',
  },
  'BrownFiV3: PAIR_NOT_EXISTS': {
    label: 'Pool does not exist',
    hint: 'No BrownFi V3 pool exists for this pair yet. Ask the team to deploy one.',
  },
  'BrownFiV3: PAIR_EXISTS': {
    label: 'Pool already exists',
    hint: 'A BrownFi V3 pool already exists for this pair.',
  },
  'BrownFiV3: FORBIDDEN': {
    label: 'Not authorized',
    hint: 'Your wallet is not authorized for this action.',
  },
  'BrownFiV3: SKEW_LIMIT': {
    label: 'Trade exceeds inventory skew limit',
    hint: 'Trade size would push pool inventory past its skew limit. Try a smaller size.',
  },
  'BrownFiV3: EMPTY_POOL': {
    label: 'Empty pool',
    hint: 'Pool has zero reserves. Wait for an initial liquidity deposit.',
  },
  'BrownFiV3: ZERO_ORACLE': {
    label: 'No oracle for token',
    hint: 'No Pyth oracle is configured for one of the tokens.',
  },
  'BrownFiV3: TRANSFER_FAILED': {
    label: 'Token transfer failed',
    hint: 'A token transfer reverted. Check your balance and approvals.',
  },

  // OracleGateway guard (custom Pyth gateway, e.g. HyperEVM). Fires when the
  // oracle's price for a token diverges from its safe band (spot vs EMA /
  // confidence) beyond the gateway threshold. Swaps are blocked for ALL sizes
  // until the feed settles — this is unrelated to pool depth, so "reduce the
  // amount" does NOT help.
  'Oracle: DISCREPANCY_TOO_HIGH': {
    label: 'Price feed unstable',
    hint: 'The oracle price for one of these tokens is moving beyond its safe range right now, so the pool has paused swaps until it settles. This is temporary and unrelated to pool size — changing the amount won’t help. Try again shortly.',
  },
  'Oracle: STALE_PRICE': {
    label: 'Oracle price stale',
    hint: 'The oracle has no fresh price for one of these tokens. Try again in a few seconds.',
  },
  'Oracle: INVALID_PRICE': {
    label: 'Oracle price unavailable',
    hint: 'The oracle returned an invalid price for one of these tokens. Try again shortly.',
  },

  // BrownFi V2 string reverts. Same pattern as V3 but a separate prefix
  // ("BrownFi:" without the V3 suffix) and a different error vocabulary.
  // The 80/90% reserve caps are V2-only and the most common slippage-style
  // revert users hit on aggregator-bypass V2 trades.
  'BrownFi: MAX_90_PERCENT_OF_RESERVE': {
    label: 'Trade exceeds 90% of pool reserve',
    hint: 'BrownFi V2 caps single trades at 90% of pool reserves. Reduce trade size.',
  },
  'BrownFi: MAX_80_PERCENT_OF_RESERVE': {
    label: 'Trade exceeds 80% of pool reserve',
    hint: 'BrownFi V2 caps single trades at 80% of pool reserves. Reduce trade size.',
  },
  'BrownFi: INSUFFICIENT_OUTPUT_AMOUNT': {
    label: 'Insufficient output',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  'BrownFi: EXCESSIVE_INPUT_AMOUNT': {
    label: 'Excessive input',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  'BrownFi: INVALID_INVENTORY': {
    label: 'Trade too large for pool',
    hint: 'BrownFi V2 rejects trades that would deplete the curve’s slack. Try a smaller amount.',
  },
  'BrownFi: INSUFFICIENT_LIQUIDITY': {
    label: 'Insufficient pool liquidity',
    hint: 'Pool does not have enough liquidity for this trade.',
  },
  'BrownFi: INSUFFICIENT_INPUT_AMOUNT': {
    label: 'Insufficient input',
    hint: 'Input amount is too small for the pool. Increase the amount.',
  },
  'BrownFi: EXPIRED': {
    label: 'Transaction expired',
    hint: 'Quote was older than the deadline. Refresh the quote and retry.',
  },
  'BrownFi: LOCKED': {
    label: 'Pool busy',
    hint: 'Pool is processing another transaction. Try again in a moment.',
  },

  // UniswapV2 string reverts — vanilla Uniswap V2 router/pair messages
  // surface from forks the FE routes through (and through the BrownFi V2
  // router itself, which inherits some of these). Useful for V2-deployed
  // chains where BrownFi shares the V2 contract surface.
  'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT': {
    label: 'Insufficient output',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  'UniswapV2: EXCESSIVE_INPUT_AMOUNT': {
    label: 'Excessive input',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  'UniswapV2: INSUFFICIENT_LIQUIDITY': {
    label: 'Insufficient pool liquidity',
    hint: 'Pool does not have enough liquidity for this trade.',
  },
  'UniswapV2: INSUFFICIENT_INPUT_AMOUNT': {
    label: 'Insufficient input',
    hint: 'Input amount is too small for the pool.',
  },
  'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED': {
    label: 'Mint amount too small',
    hint: 'Deposit is too small to mint LP. Increase amounts.',
  },
  'UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED': {
    label: 'Burn amount too small',
    hint: 'You are trying to burn too little LP. Increase amount.',
  },
  'UniswapV2: K': {
    label: 'Invariant violated',
    hint: 'Trade math failed the pool invariant. Try a smaller amount or refresh the quote.',
  },
  'UniswapV2: EXPIRED': {
    label: 'Transaction expired',
    hint: 'Quote was older than the deadline. Refresh the quote and retry.',
  },
  'UniswapV2: LOCKED': {
    label: 'Pool busy',
    hint: 'Pool is processing another transaction. Try again in a moment.',
  },
  'UniswapV2: TRANSFER_FAILED': {
    label: 'Token transfer failed',
    hint: 'A token transfer reverted. Check your balance and approvals.',
  },
  'UniswapV2: INVALID_TO': {
    label: 'Invalid recipient',
    hint: 'Router rejected the recipient address.',
  },

  // BrownFi V3 pair-config setters — admin/dev modal (PairSettingsModal).
  // Contract enforces hard min/max bounds; each revert reason identifies
  // the exact parameter so the admin knows which input is out of range.
  'PairConfig: KB_TOO_HIGH': { label: 'kB out of range', hint: 'kB exceeds MAX_K. Lower the value.' },
  'PairConfig: KB_TOO_LOW': { label: 'kB out of range', hint: 'kB is below MIN_K. Raise the value.' },
  'PairConfig: KQ_TOO_HIGH': { label: 'kQ out of range', hint: 'kQ exceeds MAX_K. Lower the value.' },
  'PairConfig: KQ_TOO_LOW': { label: 'kQ out of range', hint: 'kQ is below MIN_K. Raise the value.' },
  'PairConfig: LAMBDA_TOO_HIGH': {
    label: 'Lambda out of range',
    hint: 'Lambda × 2 must be ≤ min(kB, kQ). Lower lambda or raise kappa first.',
  },
  'PairConfig: GAMMA_TOO_HIGH': { label: 'Gamma out of range', hint: 'Gamma exceeds MAX_GAMMA. Lower the value.' },
  'PairConfig: GAMMA_TOO_LOW': { label: 'Gamma out of range', hint: 'Gamma is below MIN_GAMMA. Raise the value.' },
  'PairConfig: FEE_TOO_HIGH': { label: 'Fee out of range', hint: 'Fee exceeds MAX_FEE. Lower the value.' },
  'PairConfig: FEE_TOO_LOW': { label: 'Fee out of range', hint: 'Fee is below MIN_FEE. Raise the value.' },
  'PairConfig: FEE_SPLIT_TOO_HIGH': {
    label: 'Fee split out of range',
    hint: 'Protocol fee split exceeds MAX_FEE_SPLIT. Lower the value.',
  },
  'PairConfig: FEE_TO_UNSET': {
    label: 'Fee recipient not set',
    hint: 'Set the protocol feeTo address on the factory before splitting protocol fee.',
  },
  'PairConfig: FIX_S_TOO_HIGH': { label: 'fixS out of range', hint: 'fixS exceeds MAX_FIX_S. Lower the value.' },
  'PairConfig: COMPRESS_TOO_HIGH': {
    label: 'Compress out of range',
    hint: 'Compress exceeds MAX_COMPRESS. Lower the value.',
  },
  'PairConfig: S_SPREAD_TOO_HIGH': {
    label: 'Spread out of range',
    hint: 'Spread s exceeds MAX_S_SPREAD. Lower the value.',
  },
  'PairConfig: S_BOUND_TOO_HIGH': {
    label: 'sBound out of range',
    hint: 'sBound exceeds MAX_S_BOUND. Lower the value.',
  },
  'PairConfig: DIS_THRESHOLD_TOO_HIGH': {
    label: 'disThreshold out of range',
    hint: 'disThreshold exceeds MAX_DIS_THRESHOLD. Lower the value.',
  },
  'PairConfig: DIS_THRESHOLD_ZERO': {
    label: 'disThreshold cannot be zero',
    hint: 'Set disThreshold to a non-zero value.',
  },
  'PairConfig: INVALID_PYTH_WEIGHT': {
    label: 'Pyth weight out of range',
    hint: 'Pyth weight must be ≤ PRECISION (1e8). Lower the value.',
  },
  'PairConfig: CONSTRAINT2_VIOLATED': {
    label: 'Parameter constraint violated',
    hint: 'Combined parameters violate the contract’s second-order constraint. Adjust kappa, lambda, or gamma together.',
  },
  'PairConfig: ZERO_ADDRESS': {
    label: 'Zero pair address',
    hint: 'Pair address cannot be zero — open the modal on an existing pool.',
  },

  // Generic ERC-20 failures (router-bubbled). Often the surface for fee-on-
  // transfer tokens that V2/V3 routers don't support out of the box.
  'TransferHelper::safeTransferFrom: transferFrom failed': {
    label: 'Token transfer failed',
    hint: 'Token rejected the transfer. Check balance, approval, or token compatibility (fee-on-transfer tokens are unsupported).',
  },
  'TransferHelper::safeTransfer: transfer failed': {
    label: 'Token transfer failed',
    hint: 'Token rejected the transfer. Check balance or token compatibility.',
  },
  'TransferHelper::safeApprove: approve failed': {
    label: 'Approval failed',
    hint: 'Token rejected the approve call. Some tokens require approve(0) before re-approving.',
  },
}

/**
 * Selector → human-readable mapping. Selectors are keccak256(signature) sliced
 * to 4 bytes. Generated once and pinned here so we don't import keccak at
 * runtime just to decode a fixed set.
 */
const ERROR_REGISTRY: Record<string, ErrorEntry> = {
  // BrownFiV3Router custom errors
  '0xee90c468': { label: 'Forbidden', hint: 'You are not allowed to perform this action.' },
  '0x203d82d8': { label: 'Transaction expired', hint: 'Transaction took too long. Try again with a fresh quote.' },
  '0x8dc525d1': {
    label: 'Insufficient token A amount',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  '0xef71d091': {
    label: 'Insufficient token B amount',
    hint: 'Price moved past your slippage tolerance. Increase slippage and try again.',
  },
  '0x38aa5c15': {
    label: 'Price moved',
    hint: 'Oracle price moved during execution. Try again with a fresh quote.',
  },
  '0x20db8267': { label: 'Invalid path', hint: 'Routing path is not supported.' },
  '0xe1b0da4f': {
    label: 'Excessive input amount',
    hint: 'Input exceeds your maximum. Increase slippage and try again.',
  },
  '0x42301c23': {
    label: 'Insufficient output amount',
    hint: 'Output below your minimum. Increase slippage and try again.',
  },
  '0x1b6d1fa0': { label: 'Invalid output token', hint: 'The output token is not valid for this pool.' },
  '0x33340886': { label: 'Pool not initialized', hint: 'This pool has not been initialized yet.' },
  '0xf1ac6cc5': {
    label: 'Cutoff limit reached',
    hint: 'Requested output exceeds the maximum achievable for this pool. Reduce amount.',
  },
  // BrownFiV3 oracle-AMM inventory guard (PoolPastGamma(bool)). The trade would
  // push the pool past its gamma (inventory) bound — the custom-error cousin of
  // 'BrownFiV3: INVALID_INVENTORY'. The opposite direction usually works.
  '0xf40f860e': {
    label: 'Pool inventory limit — try reverse direction',
    hint: 'This trade would push the BrownFi V3 pool past its gamma (inventory) bound. The opposite direction usually works — otherwise reduce the size or wait for the pool to rebalance.',
  },

  // BrownFiV3Library custom errors
  '0xbd969eb0': { label: 'Identical addresses', hint: 'Token A and token B must differ.' },
  '0xd92e233d': { label: 'Zero address', hint: 'Token address cannot be zero.' },
  '0x0022d46a': { label: 'Pair does not exist', hint: 'No pool exists for this pair on V3 yet.' },
  '0x5945ea56': { label: 'Insufficient amount', hint: 'Amount provided is too low.' },
  '0x098fb561': { label: 'Insufficient input', hint: 'Input amount is too low for the pool.' },
  '0xbb55fd27': { label: 'Insufficient liquidity', hint: 'Pool does not have enough liquidity for this trade.' },
  '0xf93ad2c0': { label: 'Math underflow', hint: 'Internal math error. Try smaller amounts.' },
  '0x1d1e6f5b': { label: 'Zero denominator', hint: 'Internal math error. Try a different pair.' },
  '0x2d4d2155': { label: 'Zero output', hint: 'Trade would produce zero output. Increase input.' },
  '0x70754b17': { label: 'Duplicate token in path', hint: 'Path contains the same token twice.' },

  // Pyth / oracle related errors that surface as named V2 errors
  '0xdefb3ff2': {
    label: 'Trade exceeds 80% of pool reserve',
    hint: 'Reduce trade size. BrownFi V2 caps single trades at 80% of pool reserves.',
  },
  '0x1f854e37': {
    label: 'Trade exceeds 90% of pool reserve',
    hint: 'Reduce trade size. BrownFi V2 caps single trades at 90% of pool reserves.',
  },
  '0xd0915224': {
    label: 'Exceeds maximum out',
    hint: 'Trade exceeds the pool’s maximum quotable output. Reduce amount.',
  },
  // V3 router: input exceeds the max the pool will accept for one swap
  // (params: amountIn, maxIn). Common on small pools — the curve caps a
  // single trade well below total TVL.
  '0xc64511c2': {
    label: 'Amount exceeds pool limit',
    hint: 'This pool caps how much can be swapped in a single trade. Reduce the input amount.',
  },
  '0x19abf40e': { label: 'Stale Pyth price', hint: 'Oracle price is stale. Try again in a few seconds.' },

  // Legacy V2 string-style errors (kept for completeness; mostly already
  // decoded by ethers via the V2 ABI but listed for safety).
  '0x827e7b7f': { label: 'Insufficient liquidity', hint: 'Pool does not have enough liquidity for this trade.' },
  '0x27dc822c': { label: 'Insufficient output', hint: 'Output below minimum. Increase slippage and try again.' },
  '0x44df3332': { label: 'Insufficient reserves', hint: 'Pool reserves are too low for this trade.' },

  // Kyber MetaAggregationRouterV2 custom errors. Selectors derived from
  // `keccak256(signature).slice(0,10)`; kept in sync with Kyber's docs so
  // aggregator-route swaps surface meaningful messages instead of raw 4-byte
  // codes. `Forbidden()` shares its selector with BrownFiV3 (same signature,
  // same hash) — labelled in BrownFi terms above; the meaning is equivalent.
  '0x064a4ec6': {
    label: 'Aggregator slippage exceeded',
    hint: 'Kyber received less output than your minimum. Refresh the route and try again, or raise slippage.',
  },
  '0x1841b4e1': {
    label: 'Wrong native amount',
    hint: 'msg.value mismatch on the aggregator call. Refresh the quote and retry.',
  },
  '0xd70f29d2': {
    label: 'Wrong input token',
    hint: 'Aggregator detected a token mismatch. Refresh the quote and retry.',
  },
  '0x00c227aa': {
    label: 'ETH withdraw failed',
    hint: 'Aggregator could not transfer native ETH back. Try again or pick a different route.',
  },
  '0xddd117cb': {
    label: 'Token withdraw failed',
    hint: 'Aggregator could not transfer output token. Check token compatibility or pick a different route.',
  },
  '0x1e4ec46b': {
    label: 'Invalid receiver',
    hint: 'Aggregator rejected the receiver address. Refresh the quote and retry.',
  },
  '0x710c9497': {
    label: 'Invalid executor',
    hint: 'Aggregator route uses an executor the router rejected. Refresh the quote.',
  },
}

/**
 * Pull the first 4-byte selector out of whatever error shape ethers v5,
 * viem, or wagmi handed us. Returns lowercase `0x` + 8 hex chars when found.
 *
 * Search order matters: viem nests revert data on `cause.data`, ethers v5
 * exposes it as `data` directly. Some RPCs put it inside `error.message` as
 * `"... reverted with 0xef71d091"` which we regex-extract as a last resort.
 */
function extractSelector(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined
  const e = err as Record<string, any>

  const candidates: unknown[] = [
    e.data,
    e?.error?.data,
    e?.cause?.data,
    e?.cause?.cause?.data,
    e?.info?.error?.data,
    e?.data?.data,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('0x') && c.length >= 10) {
      return c.slice(0, 10).toLowerCase()
    }
  }
  // Last resort: message string sometimes embeds the selector.
  const msg = typeof e.message === 'string' ? e.message : ''
  const match = msg.match(/0x[0-9a-fA-F]{8}/)
  if (match) return match[0].toLowerCase()
  return undefined
}

/**
 * Decode an ABI-encoded `Error(string)` revert (selector 0x08c379a0) back to
 * its message. Solidity `require(cond, "msg")` and `revert("msg")` encode as
 * 0x08c379a0 + offset(32) + length(32) + utf8 bytes. viem/ethers don't always
 * surface this as `.reason`, so we decode the raw data ourselves when present.
 */
function decodeErrorString(dataHex: unknown): string | undefined {
  if (typeof dataHex !== 'string' || !dataHex.toLowerCase().startsWith('0x08c379a0')) return undefined
  try {
    const body = dataHex.slice(10)
    const len = parseInt(body.slice(64, 128), 16)
    if (!len || len > 2000) return undefined
    const hex = body.slice(128, 128 + len * 2)
    let s = ''
    for (let i = 0; i + 1 < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
    return s.replace(/\0+$/, '').trim() || undefined
  } catch {
    return undefined
  }
}

/**
 * Best-effort pull of a Solidity string-revert message out of whatever shape
 * ethers/viem/wagmi (or our own raw-revert carrier `{selector,data,message}`)
 * handed us. Covers explicit `.reason`, viem's decoded `cause.data.args[0]`,
 * raw `Error(string)` data, and a "Prefix: REASON" token embedded in a message.
 */
function extractStringReason(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined
  const o = input as Record<string, any>
  // 1) explicit reason fields (ethers / our carrier)
  for (const v of [o.reason, o.revertReason, o.cause?.reason, o.cause?.cause?.reason]) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  // 2) viem decoded Error(string) args
  const args = o.cause?.data?.args ?? o.data?.args
  if (Array.isArray(args) && typeof args[0] === 'string' && args[0].trim()) return args[0].trim()
  // 3) raw Error(string) data hex
  for (const v of [o.data, o.revertData, o.error?.data, o.cause?.data, o.cause?.cause?.data, o.data?.data]) {
    const s = decodeErrorString(v)
    if (s) return s
  }
  // 4) a "<KnownNamespace>: SCREAMING_SNAKE" token embedded in any message
  // field. Restricted to our contract namespaces so we never mis-grab a token
  // out of generic RPC noise (e.g. "Internal JSON-RPC error: FOO").
  for (const v of [o.revertMessage, o.shortMessage, o.details, o.message]) {
    if (typeof v !== 'string') continue
    const m = v.match(/\b(BrownFiV3|BrownFi|UniswapV2|Oracle|PairConfig)\s*:\s*([A-Z][A-Z0-9_]+)/)
    if (m) return `${m[1]}: ${m[2]}`
  }
  return undefined
}

/**
 * Short, row-friendly label for a contract revert — the same registry as
 * `decodeContractError` but returns just the LABEL (no hint), for compact
 * surfaces like the route-comparison rows. Accepts either an error object or
 * our raw-revert carrier `{ selector, data, message }`. Returns undefined when
 * nothing maps (callers fall back to their generic copy).
 */
export function decodeContractErrorLabel(input: unknown): string | undefined {
  if (isUserRejection(input)) return undefined
  if (!input || typeof input !== 'object') return undefined
  const o = input as Record<string, any>
  const selector =
    (typeof o.selector === 'string' && o.selector.toLowerCase()) ||
    (typeof o.revertSelector === 'string' && o.revertSelector.toLowerCase()) ||
    extractSelector(input)
  // Error(string) selector carries its message in the data — handle via the
  // string path below, not the selector registry.
  if (selector && selector !== '0x08c379a0' && ERROR_REGISTRY[selector]) return ERROR_REGISTRY[selector].label
  const reason = extractStringReason(input)
  if (reason) {
    const friendly = STRING_REVERT_REGISTRY[reason]
    // Known → friendly label; unknown but parseable → show the contract's own
    // words (honest "the rest show like this" fallback) rather than hiding it.
    return friendly ? friendly.label : reason
  }
  return undefined
}

/**
 * Raw contract error code, verbatim — the string the contract actually
 * reverted with (e.g. "Oracle: DISCREPANCY_TOO_HIGH") or, failing a decodable
 * string, the 4-byte selector. Intended for dev/beta surfaces so the team can
 * grep the exact code; production prefers `decodeContractErrorLabel`.
 */
export function decodeContractErrorCode(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined
  const reason = extractStringReason(input)
  if (reason) return reason
  const o = input as Record<string, any>
  return (
    (typeof o.selector === 'string' && o.selector.toLowerCase()) ||
    (typeof o.revertSelector === 'string' && o.revertSelector.toLowerCase()) ||
    extractSelector(input) ||
    undefined
  )
}

/**
 * Decode an error from a contract call into a user-friendly string.
 *
 * Resolution order:
 *  1. User rejection → returns undefined; callers should bail out silently.
 *  2. Known custom-error selector → "<label>. <hint>"
 *  3. ethers populated `reason` (string revert) → that string
 *  4. Generic message fallback with the raw selector so the user can report
 *     the problem with something identifiable.
 *
 * Returns undefined for user rejection so callers can `if (!msg) return`.
 */
export function decodeContractError(err: unknown, fallback = 'Transaction failed. Please try again.'): string | undefined {
  if (isUserRejection(err)) return undefined
  if (!err) return fallback

  const e = err as Record<string, any>

  const selector = extractSelector(err)
  if (selector && ERROR_REGISTRY[selector]) {
    const entry = ERROR_REGISTRY[selector]
    return `${entry.label}. ${entry.hint}`
  }

  // String-revert path: `require(cond, "BrownFiV3: ...")` surfaces either as
  // ethers `error.reason`, viem's decoded args, or raw Error(string) data —
  // extractStringReason covers all three. Prefer the friendly remap when we
  // have one, fall through to the raw reason otherwise so users still see
  // SOMETHING identifiable.
  const stringReason = extractStringReason(err)
  if (stringReason) {
    const friendly = STRING_REVERT_REGISTRY[stringReason]
    if (friendly) return `${friendly.label}. ${friendly.hint}`
    return stringReason
  }

  if (typeof e?.shortMessage === 'string' && e.shortMessage.length > 0) {
    return e.shortMessage
  }

  if (typeof e?.message === 'string' && e.message.length > 0) {
    // Strip the giant ethers stack-style wrapping when possible.
    const lead = e.message.split('\n')[0]
    if (selector) return `${lead} (selector ${selector})`
    return lead
  }

  return selector ? `${fallback} (selector ${selector})` : fallback
}
