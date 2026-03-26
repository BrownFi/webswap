import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import JSBI from 'jsbi'
import { getRouterAddress } from '../utils'
import { ROUTER_ADDRESS_WITH_PRICE } from '../constants/addresses'
import { CurrencyAmount } from '../entities/fractions/currencyAmount'

// ABI stubs - Phase B will add real ABIs
const IRouterV1: any[] = []
const IRouterV2: any[] = []
const IRouterWithPrice: any[] = []

export function isZero(hexNumberString: string): boolean {
  return /^0x0*$/.test(hexNumberString)
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000))
}

function getSigner(library: any, account: string) {
  return library.getSigner(account).connectUnchecked()
}

function getProviderOrSigner(library: any, account?: string) {
  return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: any, library: any, account?: string): Contract {
  if (!getAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return new Contract(address, ABI, getProviderOrSigner(library, account))
}

export function getRouterContract(chainId: number, library: any, account: string, version: number): Contract {
  const IRouter = version >= 2 ? IRouterV2 : IRouterV1
  return getContract(getRouterAddress(chainId, version), IRouter, library, account)
}

export function getRouterContractWithPrice(chainId: number, library: any, account: string): Contract {
  return getContract(ROUTER_ADDRESS_WITH_PRICE[chainId], IRouterWithPrice, library, account)
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) throw Error(`Unexpected slippage value: ${slippage}`)
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}
