import { BigNumber } from '@ethersproject/bignumber'

/**
 * Resolve a gas limit for an aggregator (Kyber) transaction.
 *
 * Kyber's reported gas under-estimates multi-hop routes badly (observed ~1.7×
 * short on a Linea LINEA→ETH swap: reported ~569k, true need ~969k). Its
 * MetaAggregationRouter executor `.call{gas}`s each inner DEX, so a too-low
 * limit starves the sub-call via the 63/64 rule and the router reverts with the
 * opaque "Call failed" — not an out-of-gas at the top level, so wallets don't
 * flag it.
 *
 * Strategy: estimate on-chain at SEND time (approval/permit is mined by then,
 * unlike at quote time) and use the larger of (estimate × 1.7) and the
 * adapter's buffered hint. The 70% margin is generous on purpose — gas limit is
 * only a ceiling (you pay for gas USED, not the limit), and Kyber's executor
 * starves inner `.call{gas}`s on a tight limit. If estimateGas itself reverts (transient RPC,
 * allowance not yet visible), fall back to the hint and let the wallet do its
 * own check.
 *
 * `signer` is an ethers v5 Signer (JsonRpcSigner). Typed loosely so callers can
 * pass `library.getSigner(account)` without importing the provider types.
 */
export async function estimateGasWithMargin(
  signer: { estimateGas: (tx: { to: string; data: string; value?: BigNumber }) => Promise<BigNumber> },
  tx: { to: string; data: string; value?: BigNumber },
  fallbackHint?: BigNumber,
): Promise<BigNumber | undefined> {
  try {
    const est = await signer.estimateGas(tx)
    const withMargin = est.mul(170).div(100)
    return fallbackHint && fallbackHint.gt(withMargin) ? fallbackHint : withMargin
  } catch {
    return fallbackHint
  }
}
