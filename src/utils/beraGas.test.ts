import { describe, it, expect } from 'vitest'
import { Contract, Signer, BigNumber } from 'ethers'
import { beraFeeOverrides, withBeraFees } from './beraGas'

const BERA = 80094
const GWEI = BigNumber.from(10).pow(9)

// A minimal ethers-v5 signer that captures what reaches sendTransaction (the SEND), the
// call path (callStatic dry-run) and estimateGas — so we can assert each independently.
function makeCapturingSigner() {
  const captured: any = {} // sendTransaction tx
  const capturedCall: any = {} // callStatic / .call tx
  const counts = { estimateGas: 0, call: 0, send: 0 }
  const signer: any = {
    _isSigner: true,
    // ethers Contract resolves address args via provider.resolveName — return as-is.
    provider: { _isProvider: true, resolveName: async (n: string) => n, getNetwork: async () => ({ chainId: BERA }) },
    getAddress: async () => '0x1111111111111111111111111111111111111111',
    getChainId: async () => BERA,
    connect() {
      return signer
    },
    estimateGas: async () => {
      counts.estimateGas++
      return BigNumber.from(200000)
    },
    call: async (tx: any) => {
      counts.call++
      Object.assign(capturedCall, tx)
      return '0x' // void setter → empty return
    },
    sendTransaction: async (tx: any) => {
      counts.send++
      Object.assign(captured, tx)
      return { hash: '0xdeadbeef', wait: async () => ({}) }
    },
  }
  return { signer, captured, capturedCall, counts }
}

const A = '0x000000000000000000000000000000000000000A'
const B = '0x000000000000000000000000000000000000000b'

describe('beraFeeOverrides', () => {
  it('returns a 1/2 Gwei EIP-1559 floor on Berachain', () => {
    const ov = beraFeeOverrides(BERA) as any
    expect(ov.maxPriorityFeePerGas.eq(GWEI.mul(1))).toBe(true)
    expect(ov.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
  })

  it('is a no-op ({}) on every other chain', () => {
    expect(beraFeeOverrides(1)).toEqual({})
    expect(beraFeeOverrides(8453)).toEqual({})
    expect(beraFeeOverrides(undefined)).toEqual({})
  })
})

describe('withBeraFees signer wrap', () => {
  it('keeps ethers Signer semantics (isSigner / provider / getAddress)', async () => {
    const { signer } = makeCapturingSigner()
    const wrapped = withBeraFees(signer, BERA)
    expect(Signer.isSigner(wrapped)).toBe(true) // ethers must still accept it
    expect(wrapped.provider).toBe(signer.provider) // provider resolves via prototype
    expect(await wrapped.getAddress()).toBe('0x1111111111111111111111111111111111111111')
  })

  it('merges the Bera fee floor into sendTransaction', async () => {
    const { signer, captured } = makeCapturingSigner()
    const wrapped = withBeraFees(signer, BERA)
    await wrapped.sendTransaction({ to: A, data: '0x1234' })
    expect(captured.to).toBe(A)
    expect(captured.data).toBe('0x1234')
    expect(captured.maxPriorityFeePerGas.eq(GWEI.mul(1))).toBe(true)
    expect(captured.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
  })

  it('returns the signer UNCHANGED off Bera (no override)', async () => {
    const { signer, captured } = makeCapturingSigner()
    const wrapped = withBeraFees(signer, 1)
    expect(wrapped).toBe(signer)
    await wrapped.sendTransaction({ to: A, data: '0x1234' })
    expect(captured.maxFeePerGas).toBeUndefined()
  })
})

describe('real ethers Contract tx-build path', () => {
  const ABI = ['function setGammaOfPair(address tokenA, address tokenB, uint32 gamma)']

  it('a Contract on a withBeraFees signer sends the fee floor (dev-stats config modal path)', async () => {
    const { signer, captured } = makeCapturingSigner()
    const factory = new Contract('0x00000000000000000000000000000000000000Ff', ABI, withBeraFees(signer, BERA))
    await factory.setGammaOfPair(A, B, 40000000)
    // Contract encoded the call AND our floor rode along to the signer.
    expect(captured.to?.toLowerCase()).toBe('0x00000000000000000000000000000000000000ff')
    expect(typeof captured.data).toBe('string')
    expect(captured.maxPriorityFeePerGas.eq(GWEI.mul(1))).toBe(true)
    expect(captured.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
  })

  it('spreading beraFeeOverrides into call overrides works too (swap/liquidity path)', async () => {
    const { signer, captured } = makeCapturingSigner()
    const factory = new Contract('0x00000000000000000000000000000000000000Ff', ABI, signer)
    await factory.setGammaOfPair(A, B, 40000000, { gasLimit: 300000, ...beraFeeOverrides(BERA) })
    expect(captured.gasLimit.eq(300000)).toBe(true)
    expect(captured.maxPriorityFeePerGas.eq(GWEI.mul(1))).toBe(true)
    expect(captured.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
  })

  it('off Bera the same paths add NO fee fields', async () => {
    const { signer, captured } = makeCapturingSigner()
    const factory = new Contract('0x00000000000000000000000000000000000000Ff', ABI, withBeraFees(signer, 8453))
    await factory.setGammaOfPair(A, B, 40000000, { gasLimit: 300000, ...beraFeeOverrides(8453) })
    expect(captured.gasLimit.eq(300000)).toBe(true)
    expect(captured.maxFeePerGas).toBeUndefined()
    expect(captured.maxPriorityFeePerGas).toBeUndefined()
  })
})

// The dev-stats config modal (PairSettingsModal) is the team's daily tool. It runs a
// callStatic DRY-RUN, then the real send — both through the withBeraFees-wrapped factory
// (V3) / a .connect()-wrapped factory (V2). These assert the wrap doesn't break the
// dry-run/estimate and only touches the send, on Bera AND other chains.
describe('dev-stats config modal (PairSettingsModal) path', () => {
  const ABI = ['function setGammaOfPair(address tokenA, address tokenB, uint32 gamma)']
  const ADDR = '0x00000000000000000000000000000000000000Ff'

  it('Bera: callStatic dry-run works and carries NO fee override (uses .call, not send)', async () => {
    const { signer, capturedCall, counts } = makeCapturingSigner()
    const factory = new Contract(ADDR, ABI, withBeraFees(signer, BERA))
    await factory.callStatic.setGammaOfPair(A, B, 40000000) // the runSubmit `simulate` step
    expect(counts.call).toBe(1)
    expect(counts.send).toBe(0)
    expect(capturedCall.maxFeePerGas).toBeUndefined() // dry-run must NOT be polluted with fees
    expect(capturedCall.maxPriorityFeePerGas).toBeUndefined()
  })

  it('Bera: dry-run THEN send — dry-run clean, send gets the floor (full runSubmit flow)', async () => {
    const { signer, captured, capturedCall, counts } = makeCapturingSigner()
    const factory = new Contract(ADDR, ABI, withBeraFees(signer, BERA))
    await factory.callStatic.setGammaOfPair(A, B, 40000000)
    await factory.setGammaOfPair(A, B, 40000000)
    expect(counts.call).toBe(1)
    expect(counts.send).toBe(1)
    expect(capturedCall.maxFeePerGas).toBeUndefined()
    expect(captured.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
    expect(captured.maxPriorityFeePerGas.eq(GWEI.mul(1))).toBe(true)
  })

  it('Bera V2: .connect(withBeraFees(signer)) sends the floor (feeFactory path)', async () => {
    const { signer, captured } = makeCapturingSigner()
    const base = new Contract(ADDR, ABI, signer)
    const feeFactory = base.connect(withBeraFees(signer, BERA)) // mirrors PairSettingsModal feeFactory
    await feeFactory.setGammaOfPair(A, B, 40000000)
    expect(captured.maxFeePerGas.eq(GWEI.mul(2))).toBe(true)
  })

  it('OTHER CHAIN: send is UNCHANGED (no fee) and callStatic still works — nothing broken', async () => {
    const { signer, captured, capturedCall, counts } = makeCapturingSigner()
    // withBeraFees returns the signer identity off Bera → identical behavior to before.
    const factory = new Contract(ADDR, ABI, withBeraFees(signer, 8453))
    await factory.callStatic.setGammaOfPair(A, B, 40000000)
    await factory.setGammaOfPair(A, B, 40000000)
    expect(counts.call).toBe(1)
    expect(counts.send).toBe(1)
    expect(captured.maxFeePerGas).toBeUndefined()
    expect(captured.maxPriorityFeePerGas).toBeUndefined()
    expect(capturedCall.maxFeePerGas).toBeUndefined()
  })

  it('OTHER CHAIN V2: .connect(withBeraFees(signer)) is identity — send has no fee', async () => {
    const { signer, captured } = makeCapturingSigner()
    const base = new Contract(ADDR, ABI, signer)
    // Off Bera withBeraFees returns the same signer → connect re-binds the same signer.
    expect(withBeraFees(signer, 8453)).toBe(signer)
    const feeFactory = base.connect(withBeraFees(signer, 8453))
    await feeFactory.setGammaOfPair(A, B, 40000000)
    expect(captured.maxFeePerGas).toBeUndefined()
  })
})
