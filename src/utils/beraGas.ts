import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '@brownfi/sdk'

// Berachain (80094) fee-market workaround.
//
// Bera's base fee is ~0 (a few wei, flat), so the whole tx cost is the priority fee
// (tip). The tip blocks actually accept swings wildly block-to-block (~0 ↔ 35 Gwei),
// and `eth_maxPriorityFeePerGas` — what wallets/viem estimate from — returns a mid
// value (~7 Gwei) that's often BELOW what a busy block demands. So wallet-estimated
// txs land intermittently and otherwise sit pending, which users experience as the
// RPC/chain being "unstable" or "can't send tx".
//
// Since the base fee is ~0, a generous FLAT tip costs almost nothing in BERA terms but
// guarantees inclusion. We set an explicit floor on Bera and leave every other chain
// to the wallet's own estimation (return {} → no override). Tune the two constants if
// inclusion still lags on congested blocks.
const BERA_PRIORITY_FEE_GWEI = 30
const BERA_MAX_FEE_GWEI = 40 // priority + headroom for the (~0) base fee

const gwei = (n: number) => BigNumber.from(n).mul(BigNumber.from(10).pow(9))

/**
 * EIP-1559 fee overrides to spread into an ethers tx / contract-call overrides object.
 * Non-empty ONLY on Berachain; `{}` elsewhere so other chains keep wallet estimation.
 * Usage: `contract.method(...args, { gasLimit, ...beraFeeOverrides(chainId) })`.
 */
export function beraFeeOverrides(chainId?: number): {
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
} {
  if (chainId !== ChainId.BERA_MAINNET) return {}
  return {
    maxPriorityFeePerGas: gwei(BERA_PRIORITY_FEE_GWEI),
    maxFeePerGas: gwei(BERA_MAX_FEE_GWEI),
  }
}

// Minimal ethers-v5 signer shape we need to wrap.
type SignerLike = { sendTransaction: (tx: any) => Promise<any> }

/**
 * Wrap an ethers v5 signer so every write tx it sends gets the Bera fee floor merged
 * in — use for contracts with many setter methods (e.g. the dev-stats config modal)
 * instead of appending overrides to each call. Contract write methods call
 * `signer.sendTransaction`; `callStatic` (eth_call) and `estimateGas` do NOT, so
 * dry-runs and estimates are unaffected. No-op on non-Bera chains. An explicit fee on
 * the tx still wins (spread last).
 */
export function withBeraFees<S extends SignerLike>(signer: S, chainId?: number): S {
  const ov = beraFeeOverrides(chainId)
  if (!('maxFeePerGas' in ov)) return signer
  // Prototype-inherit so isSigner / provider / getAddress / connect all still resolve
  // to the real signer; only sendTransaction is shadowed.
  const wrapped: any = Object.create(signer)
  const send = signer.sendTransaction.bind(signer)
  wrapped.sendTransaction = (tx: any) => send({ ...ov, ...tx })
  return wrapped as S
}
