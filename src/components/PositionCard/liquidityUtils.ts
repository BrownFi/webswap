import { JSBI, Pair, Percent, Token, TokenAmount } from '@brownfi/sdk'
import { parseUnits } from '@ethersproject/units'

import { BIG_INT_ZERO } from 'constants/common'
import { formatNumber } from 'utils/prices'

type StakeValue = number | string | null | undefined

const sumTokenAmounts = (a?: TokenAmount | null, b?: TokenAmount | null) => {
  if (a && b) {
    return a.add(b)
  }
  return a ?? b ?? undefined
}

const canUseBalance = (balance?: TokenAmount | null) => !!balance && JSBI.greaterThan(balance.raw, BIG_INT_ZERO)

export const parseStakeLpAmount = (stakeLP: StakeValue, liquidityToken: Token): TokenAmount | undefined => {
  if (stakeLP === undefined || stakeLP === null) {
    return undefined
  }

  const stakeString = typeof stakeLP === 'string' ? stakeLP : stakeLP.toString()
  let normalizedStakeString = stakeString

  if (/e/i.test(stakeString)) {
    const numericStake = Number(stakeString)
    if (!Number.isFinite(numericStake)) {
      return undefined
    }
    normalizedStakeString = numericStake.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: liquidityToken.decimals,
    })
  }

  try {
    const rawStake = JSBI.BigInt(parseUnits(normalizedStakeString, liquidityToken.decimals).toString())
    if (JSBI.lessThanOrEqual(rawStake, BIG_INT_ZERO)) {
      return undefined
    }
    return new TokenAmount(liquidityToken, rawStake)
  } catch {
    return undefined
  }
}

const computeTokenDeposits = (params: {
  pair: Pair
  totalPoolTokens?: TokenAmount | null
  liquidityAmount?: TokenAmount | null
}) => {
  const { pair, totalPoolTokens, liquidityAmount } = params

  if (
    !pair ||
    !totalPoolTokens ||
    !liquidityAmount ||
    JSBI.lessThanOrEqual(totalPoolTokens.raw, BIG_INT_ZERO) ||
    JSBI.lessThanOrEqual(liquidityAmount.raw, BIG_INT_ZERO) ||
    JSBI.greaterThan(liquidityAmount.raw, totalPoolTokens.raw)
  ) {
    return [undefined, undefined] as const
  }

  return [
    pair.getLiquidityValue(pair.token0, totalPoolTokens, liquidityAmount, false),
    pair.getLiquidityValue(pair.token1, totalPoolTokens, liquidityAmount, false),
  ] as const
}

export const deriveLiquidityMetrics = ({
  pair,
  totalPoolTokens,
  walletBalance,
  stakedBalance,
}: {
  pair: Pair
  totalPoolTokens?: TokenAmount | null
  walletBalance?: TokenAmount | null
  stakedBalance?: TokenAmount | null
}) => {
  const userPoolBalance = sumTokenAmounts(walletBalance, stakedBalance)

  const poolTokenPercentage =
    userPoolBalance &&
    totalPoolTokens &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [walletToken0Deposited, walletToken1Deposited] = computeTokenDeposits({
    pair,
    totalPoolTokens,
    liquidityAmount: walletBalance,
  })

  const [stakedToken0Deposited, stakedToken1Deposited] = computeTokenDeposits({
    pair,
    totalPoolTokens,
    liquidityAmount: stakedBalance,
  })

  const token0Deposited = sumTokenAmounts(walletToken0Deposited, stakedToken0Deposited)
  const token1Deposited = sumTokenAmounts(walletToken1Deposited, stakedToken1Deposited)

  return {
    userPoolBalance: userPoolBalance ?? undefined,
    poolTokenPercentage,
    token0Deposited,
    token1Deposited,
  }
}

export const formatLiquidityBreakdown = ({
  walletBalance,
  stakedBalance,
  totalBalance,
}: {
  walletBalance?: TokenAmount | null
  stakedBalance?: TokenAmount | null
  totalBalance?: TokenAmount | null
}) => {
  const formatBalance = (balance?: TokenAmount | null) =>
    canUseBalance(balance) ? formatNumber(Number(balance!.toSignificant(4)), { maximumFractionDigits: 4 }) : undefined

  return {
    walletDisplay: formatBalance(walletBalance),
    stakedDisplay: formatBalance(stakedBalance),
    totalDisplay: formatBalance(totalBalance),
  }
}
