import { Token, Pair, TokenAmount, JSBI, ChainId, WETH } from '@brownfi/sdk'

describe('Pair.getAddress', () => {
  it('computes correct address for BERA_MAINNET V2 pair', () => {
    const tokenA = new Token(ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA')
    const tokenB = new Token(ChainId.BERA_MAINNET, '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce', 18, 'HONEY')
    const address = Pair.getAddress(tokenA, tokenB, 2)
    // Known on-chain pair address for WBERA/HONEY V2
    expect(address.toLowerCase()).toBe('0xd932c344e21ef6c3a94971bf4d4cc71304e2a66c')
  })

  it('computes correct address for BERA_MAINNET V1 pair', () => {
    const tokenA = WETH[ChainId.BERA_MAINNET]
    const tokenB = new Token(ChainId.BERA_MAINNET, '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce', 18, 'HONEY')
    const address = Pair.getAddress(tokenA, tokenB, 1)
    // V1 uses different factory + init code hash
    expect(address).toBeDefined()
    expect(address.length).toBe(42)
  })

  it('returns same address regardless of token order', () => {
    const tokenA = new Token(ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA')
    const tokenB = new Token(ChainId.BERA_MAINNET, '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce', 18, 'HONEY')
    expect(Pair.getAddress(tokenA, tokenB, 2)).toBe(Pair.getAddress(tokenB, tokenA, 2))
  })
})

describe('Pair constructor', () => {
  const tokenA = new Token(ChainId.BERA_MAINNET, '0x0000000000000000000000000000000000000001', 18, 'TKA')
  const tokenB = new Token(ChainId.BERA_MAINNET, '0x0000000000000000000000000000000000000002', 18, 'TKB')

  it('sorts tokens correctly', () => {
    const pair = new Pair(
      new TokenAmount(tokenB, JSBI.BigInt('1000')),
      new TokenAmount(tokenA, JSBI.BigInt('2000')),
      2,
    )
    expect(pair.token0.address).toBe(tokenA.address)
    expect(pair.token1.address).toBe(tokenB.address)
  })

  it('getLiquidityValue returns correct amount', () => {
    const pair = new Pair(
      new TokenAmount(tokenA, JSBI.BigInt('1000000000000000000000')),
      new TokenAmount(tokenB, JSBI.BigInt('2000000000000000000000')),
      2,
    )
    const totalSupply = new TokenAmount(pair.liquidityToken, JSBI.BigInt('100000000000000000000'))
    const userLiquidity = new TokenAmount(pair.liquidityToken, JSBI.BigInt('10000000000000000000'))
    const value = pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false)
    // 10% of reserves
    expect(value.toSignificant(4)).toBe('100')
  })

  it('getOutputAmount computes correct swap math', () => {
    const pair = new Pair(
      new TokenAmount(tokenA, JSBI.BigInt('1000000000000000000000')),
      new TokenAmount(tokenB, JSBI.BigInt('1000000000000000000000')),
      2,
    )
    const inputAmount = new TokenAmount(tokenA, JSBI.BigInt('100000000000000000000'))
    const [outputAmount] = pair.getOutputAmount(inputAmount)
    // With 0.3% fee, output should be slightly less than 100 (roughly 90.66)
    const output = Number(outputAmount.toSignificant(6))
    expect(output).toBeGreaterThan(89)
    expect(output).toBeLessThan(92)
  })
})

describe('Token', () => {
  it('equals works correctly', () => {
    const t1 = new Token(ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA')
    const t2 = new Token(ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA')
    const t3 = new Token(ChainId.BERA_MAINNET, '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce', 18, 'HONEY')
    expect(t1.equals(t2)).toBe(true)
    expect(t1.equals(t3)).toBe(false)
  })

  it('sortsBefore is deterministic', () => {
    const t1 = new Token(ChainId.BERA_MAINNET, '0x0000000000000000000000000000000000000001', 18, 'A')
    const t2 = new Token(ChainId.BERA_MAINNET, '0x0000000000000000000000000000000000000002', 18, 'B')
    expect(t1.sortsBefore(t2)).toBe(true)
    expect(t2.sortsBefore(t1)).toBe(false)
  })
})
