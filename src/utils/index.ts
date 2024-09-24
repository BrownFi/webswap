import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import IRouter from '../constants/abis/IRouter.json'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from '@brownfi/sdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { ROUTER_ADDRESS } from '@brownfi/sdk'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function formatStringToNumber(value: any, maximumFractionDigits = 2) {
  if (!value && value !== 0) {
    return '-'
  }
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits
  })

  return formatter.format(value).replace(/,/g, ',')
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  let prefix: string

  switch (chainId) {
    case ChainId.SEPOLIA:
      prefix = 'https://sepolia.etherscan.io'
      break
    case ChainId.SN_MAIN:
      prefix = 'https://starkscan.co/'
      break
    case ChainId.SN_SEPOLIA:
      prefix = 'https://sepolia.starkscan.co/'
      break
    case ChainId.BSC_TESTNET:
      prefix = 'https://testnet.bscscan.com/'
      break
    case ChainId.VICTION_TESTNET:
      prefix = 'https://testnet.vicscan.xyz'
      break
    case ChainId.VICTION_MAINNET:
      prefix = 'https://vicscan.xyz'
      break
    case ChainId.SONIC_TESTNET:
      prefix = 'https://testnet.soniclabs.com'
      break
    default:
      prefix = 'https://etherscan.io'
      break
  }

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS[_], IRouter, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function getNativeToken(chainId: ChainId) {
  if (chainId === ChainId.BSC_TESTNET) {
    return 'BNB'
  }
  if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
    return 'VIC'
  }
  if (chainId === ChainId.SONIC_TESTNET) {
    return 'S'
  }
  return 'ETH'
}

export function getWrappedNativeToken(chainId: ChainId) {
  if (chainId === ChainId.BSC_TESTNET) {
    return 'WBNB'
  }
  if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
    return 'WVIC'
  }
  if (chainId === ChainId.SONIC_TESTNET) {
    return 'WS'
  }
  return 'WETH'
}

export function getTokenSymbol(currency: Currency | null | undefined, chainId: ChainId | undefined) {
  if (currency === ETHER) {
    if (chainId === ChainId.BSC_TESTNET) {
      return 'BNB'
    }
    if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
      return 'VIC'
    }
    if (chainId === ChainId.SONIC_TESTNET) {
      return 'S'
    }
    return 'ETH'
  }

  if (currency?.symbol === 'WETH' && chainId === ChainId.BSC_TESTNET) {
    return 'WBNB'
  }

  if (currency?.symbol === 'WETH' && (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET)) {
    return 'WVIC'
  }

  if (currency?.symbol === 'WETH' && chainId === ChainId.SONIC_TESTNET) {
    return 'WS'
  }

  return currency?.symbol
}

export function getTokenName(currency: Currency | null | undefined, chainId: ChainId | undefined) {
  if (currency === ETHER) {
    if (chainId === ChainId.BSC_TESTNET) {
      return 'BNB'
    }
    if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
      return 'Viction'
    }
    if (chainId === ChainId.SONIC_TESTNET) {
      return 'Sonic'
    }
    return 'Ethereum'
  }
  return currency?.name
}

export function getScanText(chainId: ChainId) {
  switch (chainId) {
    case ChainId.BSC_TESTNET:
      return 'Bscscan'
    case ChainId.VICTION_MAINNET:
    case ChainId.VICTION_TESTNET:
      return 'Vicscan'
    case ChainId.SONIC_TESTNET:
      return 'Soniclabs'
    default:
      return 'Etherscan'
  }
}

export function isNativeCurrency(symbol: string | undefined) {
  return symbol === 'WBNB' || symbol === 'WETH' || symbol === 'WVIC' || symbol === 'WS'
}
