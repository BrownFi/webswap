import { CurrencyAmount, ETHER, TokenAmount } from '@brownfi/sdk'
import JSBI from 'jsbi'

const BASIS_POINTS = JSBI.BigInt(10000)
const BASIS_POINTS_MINUS_ONE = JSBI.subtract(BASIS_POINTS, JSBI.BigInt(1))

export const getApprovalBuffer = (amount?: CurrencyAmount, allowedSlippage = 100): CurrencyAmount | undefined => {
  if (!amount) {
    return undefined
  }

  if (amount.currency === ETHER || !(amount instanceof TokenAmount)) {
    return amount
  }

  const raw = amount.raw
  if (JSBI.equal(raw, JSBI.BigInt(0))) {
    return amount
  }

  const slippageBps = JSBI.BigInt(Math.max(allowedSlippage ?? 0, 0))
  const multiplier = JSBI.add(BASIS_POINTS, slippageBps)
  const scaledRaw = JSBI.multiply(raw, multiplier)
  const bufferedRaw = JSBI.divide(JSBI.add(scaledRaw, BASIS_POINTS_MINUS_ONE), BASIS_POINTS)

  return new TokenAmount(amount.token, bufferedRaw)
}
