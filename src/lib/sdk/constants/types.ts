import JSBI from 'jsbi'
import { SolidityType } from './enums'

export type BigintIsh = JSBI | bigint | string

export const SOLIDITY_TYPE_MAXIMA: Record<SolidityType, JSBI> = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}

export const MINIMUM_LIQUIDITY: JSBI = JSBI.BigInt(1000)
export const ZERO: JSBI = JSBI.BigInt(0)
export const ONE: JSBI = JSBI.BigInt(1)
export const TWO: JSBI = JSBI.BigInt(2)
export const THREE: JSBI = JSBI.BigInt(3)
export const FIVE: JSBI = JSBI.BigInt(5)
export const TEN: JSBI = JSBI.BigInt(10)
export const _100: JSBI = JSBI.BigInt(100)
export const _997: JSBI = JSBI.BigInt(997)
export const _1000: JSBI = JSBI.BigInt(1000)

export const BIPS_BASE: JSBI = JSBI.BigInt(10000)
export const INITIAL_ALLOWED_SLIPPAGE = 50
export const AddressZero = '0x0000000000000000000000000000000000000000'
