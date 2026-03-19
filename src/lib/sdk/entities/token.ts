import invariant from 'tiny-invariant'
import { ChainId } from '../constants/chainId'
import { Currency } from './currency'
import { validateAndParseAddress } from '../utils'

export class Token extends Currency {
  public readonly chainId: ChainId
  public readonly address: string

  constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string) {
    if (symbol === 'USD\u20b50') symbol = 'USDT'
    super(decimals, symbol, name)
    this.chainId = chainId
    this.address = validateAndParseAddress(address, chainId)
  }

  equals(other: Token): boolean {
    if (this === other) return true
    return this.chainId === other.chainId && this.address === other.address
  }

  sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
    invariant(this.address !== other.address, 'ADDRESSES')
    return this.address.toLowerCase() < other.address.toLowerCase()
  }
}

export function currencyEquals(currencyA: Currency, currencyB: Currency): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Token) {
    return false
  } else if (currencyB instanceof Token) {
    return false
  } else {
    return currencyA === currencyB
  }
}
