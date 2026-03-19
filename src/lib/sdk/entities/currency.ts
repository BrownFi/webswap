import JSBI from 'jsbi'
import { SolidityType } from '../constants/enums'
import { validateSolidityTypeInstance } from '../utils'

export class Currency {
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string

  public static readonly ETHER: Currency = new Currency(18, 'ETH', 'Ether')

  protected constructor(decimals: number, symbol?: string, name?: string) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8)
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }
}

export const ETHER = Currency.ETHER
