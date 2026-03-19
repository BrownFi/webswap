import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { BigintIsh } from '../../constants/types'
import { Token } from '../token'
import { CurrencyAmount } from './currencyAmount'

export class TokenAmount extends CurrencyAmount {
  public readonly token: Token

  constructor(token: Token, amount: BigintIsh) {
    super(token, amount)
    this.token = token
  }

  add(other: TokenAmount): TokenAmount {
    invariant(this.token.equals(other.token), 'TOKEN')
    return new TokenAmount(this.token, JSBI.add(this.raw, other.raw))
  }

  subtract(other: TokenAmount): TokenAmount {
    invariant(this.token.equals(other.token), 'TOKEN')
    return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw))
  }
}
