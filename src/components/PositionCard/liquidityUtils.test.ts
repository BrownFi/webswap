import { JSBI, Token, TokenAmount, Pair } from '@brownfi/sdk'
import { parseStakeLpAmount, deriveLiquidityMetrics, formatLiquidityBreakdown } from './liquidityUtils'

const chainId = 80094
const TOKEN_A = new Token(chainId, '0x0000000000000000000000000000000000000001', 18, 'TKA', 'Token A')
const TOKEN_B = new Token(chainId, '0x0000000000000000000000000000000000000002', 18, 'TKB', 'Token B')
const LP_TOKEN = new Token(chainId, '0x0000000000000000000000000000000000000003', 18, 'LP', 'LP Token')

const pair = new Pair(
  new TokenAmount(TOKEN_A, JSBI.BigInt('1000000000000000000000')),
  new TokenAmount(TOKEN_B, JSBI.BigInt('2000000000000000000000')),
  2,
)
// Use the pair's actual LP token so getLiquidityValue doesn't throw
const pairLpToken = pair.liquidityToken

describe('parseStakeLpAmount', () => {
  it('returns undefined for null/undefined', () => {
    expect(parseStakeLpAmount(null, LP_TOKEN)).toBeUndefined()
    expect(parseStakeLpAmount(undefined, LP_TOKEN)).toBeUndefined()
  })

  it('parses a valid numeric stake', () => {
    const result = parseStakeLpAmount(1.5, LP_TOKEN)
    expect(result).toBeDefined()
    expect(result!.token.equals(LP_TOKEN)).toBe(true)
    expect(Number(result!.toSignificant(4))).toBeCloseTo(1.5, 1)
  })

  it('parses a valid string stake', () => {
    const result = parseStakeLpAmount('2.5', LP_TOKEN)
    expect(result).toBeDefined()
    expect(Number(result!.toSignificant(4))).toBeCloseTo(2.5, 1)
  })

  it('returns undefined for zero stake', () => {
    expect(parseStakeLpAmount(0, LP_TOKEN)).toBeUndefined()
    expect(parseStakeLpAmount('0', LP_TOKEN)).toBeUndefined()
  })

  it('handles scientific notation', () => {
    const result = parseStakeLpAmount(1.5e-10, LP_TOKEN)
    expect(result).toBeDefined()
  })
})

describe('formatLiquidityBreakdown', () => {
  it('returns undefined for zero/null balances', () => {
    const result = formatLiquidityBreakdown({
      walletBalance: undefined,
      stakedBalance: undefined,
      totalBalance: undefined,
    })
    expect(result.walletDisplay).toBeUndefined()
    expect(result.stakedDisplay).toBeUndefined()
    expect(result.totalDisplay).toBeUndefined()
  })

  it('formats wallet balance', () => {
    const balance = new TokenAmount(LP_TOKEN, JSBI.BigInt('1500000000000000000'))
    const result = formatLiquidityBreakdown({
      walletBalance: balance,
      stakedBalance: undefined,
      totalBalance: balance,
    })
    expect(result.walletDisplay).toBeDefined()
    expect(result.totalDisplay).toBeDefined()
  })
})

describe('deriveLiquidityMetrics', () => {
  const totalPoolTokens = new TokenAmount(pairLpToken, JSBI.BigInt('100000000000000000000'))

  it('returns zero share when user has no balance', () => {
    const result = deriveLiquidityMetrics({
      pair,
      totalPoolTokens,
      walletBalance: undefined,
      stakedBalance: undefined,
    })
    // sumTokenAmounts with fallback token returns a zero-amount TokenAmount
    expect(result.poolTokenPercentage?.toFixed(0)).toBe('0')
    // token deposits are zero-value TokenAmounts (not undefined)
    expect(JSBI.equal(result.token0Deposited?.raw ?? JSBI.BigInt(0), JSBI.BigInt(0))).toBe(true)
    expect(JSBI.equal(result.token1Deposited?.raw ?? JSBI.BigInt(0), JSBI.BigInt(0))).toBe(true)
  })

  it('computes correct metrics with wallet balance only', () => {
    const walletBalance = new TokenAmount(pairLpToken, JSBI.BigInt('10000000000000000000'))
    const result = deriveLiquidityMetrics({
      pair,
      totalPoolTokens,
      walletBalance,
      stakedBalance: undefined,
    })
    expect(result.userPoolBalance).toBeDefined()
    expect(result.poolTokenPercentage).toBeDefined()
    expect(result.poolTokenPercentage!.toFixed(0)).toBe('10')
    expect(result.token0Deposited).toBeDefined()
    expect(result.token1Deposited).toBeDefined()
  })

  it('combines wallet and staked balances', () => {
    const walletBalance = new TokenAmount(pairLpToken, JSBI.BigInt('5000000000000000000'))
    const stakedBalance = new TokenAmount(pairLpToken, JSBI.BigInt('5000000000000000000'))
    const result = deriveLiquidityMetrics({
      pair,
      totalPoolTokens,
      walletBalance,
      stakedBalance,
    })
    expect(result.poolTokenPercentage!.toFixed(0)).toBe('10')
  })
})
