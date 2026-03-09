import { ChainId, ETHER, Token } from '@brownfi/sdk'
import {
  formatStringToNumber,
  getEtherscanLink,
  escapeRegExp,
  isTokenOnList,
  getNativeToken,
  getTokenSymbol,
  getTokenName,
  getScanText,
  isNativeCurrency,
} from '.'

describe('extended utils', () => {
  describe('#formatStringToNumber', () => {
    it('formats number with default 2 decimal places', () => {
      expect(formatStringToNumber(1234.567)).toBe('1,234.57')
    })

    it('formats integer without decimals', () => {
      expect(formatStringToNumber(1000)).toBe('1,000')
    })

    it('returns dash for null/undefined', () => {
      expect(formatStringToNumber(null)).toBe('-')
      expect(formatStringToNumber(undefined)).toBe('-')
    })

    it('handles zero', () => {
      expect(formatStringToNumber(0)).toBe('0')
    })

    it('respects custom maximumFractionDigits', () => {
      expect(formatStringToNumber(1.23456, 4)).toBe('1.2346')
    })
  })

  describe('#getEtherscanLink chain support', () => {
    it('BSC mainnet', () => {
      expect(getEtherscanLink(ChainId.BSC_MAINNET, '0xabc', 'address')).toBe('https://bscscan.com/address/0xabc')
    })

    it('Base mainnet', () => {
      expect(getEtherscanLink(ChainId.BASE_MAINNET, '0xabc', 'transaction')).toBe(
        'https://basescan.org/tx/0xabc',
      )
    })

    it('Bera mainnet', () => {
      expect(getEtherscanLink(ChainId.BERA_MAINNET, '0xabc', 'token')).toBe(
        'https://berascan.com/token/0xabc',
      )
    })

    it('Linea mainnet', () => {
      expect(getEtherscanLink(ChainId.LINEA_MAINNET, '0xabc', 'block')).toBe(
        'https://lineascan.build/block/0xabc',
      )
    })

    it('Arbitrum mainnet', () => {
      expect(getEtherscanLink(ChainId.ARBITRUM_MAINNET, '0xabc', 'address')).toBe(
        'https://arbiscan.io/address/0xabc',
      )
    })
  })

  describe('#escapeRegExp', () => {
    it('escapes special regex characters', () => {
      expect(escapeRegExp('test.value')).toBe('test\\.value')
      expect(escapeRegExp('a*b+c?')).toBe('a\\*b\\+c\\?')
      expect(escapeRegExp('(foo)[bar]')).toBe('\\(foo\\)\\[bar\\]')
      expect(escapeRegExp('$100')).toBe('\\$100')
    })

    it('returns unchanged string without special chars', () => {
      expect(escapeRegExp('hello')).toBe('hello')
    })

    it('escapes all OWASP special chars', () => {
      expect(escapeRegExp('.*+?^${}()|[]\\')).toBe(
        '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\',
      )
    })
  })

  describe('#isTokenOnList', () => {
    const token = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'TEST', 'Test')

    it('returns true for ETHER', () => {
      expect(isTokenOnList({} as any, ETHER)).toBe(true)
    })

    it('returns true for token in list', () => {
      const tokenMap = {
        [ChainId.MAINNET]: {
          '0x0000000000000000000000000000000000000001': { token, list: {} },
        },
      } as any
      expect(isTokenOnList(tokenMap, token)).toBe(true)
    })

    it('returns false for token not in list', () => {
      expect(isTokenOnList({} as any, token)).toBe(false)
    })

    it('returns false for undefined currency', () => {
      expect(isTokenOnList({} as any, undefined)).toBe(false)
    })
  })

  describe('#getNativeToken', () => {
    it('returns BNB for BSC', () => {
      expect(getNativeToken(ChainId.BSC_MAINNET)).toBe('BNB')
      expect(getNativeToken(ChainId.BSC_TESTNET)).toBe('BNB')
    })

    it('returns BERA for Berachain', () => {
      expect(getNativeToken(ChainId.BERA_MAINNET)).toBe('BERA')
    })

    it('returns HYPE for HyperEVM', () => {
      expect(getNativeToken(ChainId.HYPER_EVM)).toBe('HYPE')
    })

    it('returns SEI for Sei', () => {
      expect(getNativeToken(ChainId.SEI_MAINNET)).toBe('SEI')
    })

    it('returns MON for Monad', () => {
      expect(getNativeToken(ChainId.MONAD)).toBe('MON')
    })

    it('returns ETH as default', () => {
      expect(getNativeToken(ChainId.MAINNET)).toBe('ETH')
      expect(getNativeToken(ChainId.BASE_MAINNET)).toBe('ETH')
      expect(getNativeToken(ChainId.LINEA_MAINNET)).toBe('ETH')
    })
  })

  describe('#getTokenSymbol', () => {
    it('returns native token symbol for ETHER on each chain', () => {
      expect(getTokenSymbol(ETHER, ChainId.BSC_MAINNET)).toBe('BNB')
      expect(getTokenSymbol(ETHER, ChainId.BERA_MAINNET)).toBe('BERA')
      expect(getTokenSymbol(ETHER, ChainId.HYPER_EVM)).toBe('HYPE')
      expect(getTokenSymbol(ETHER, ChainId.MAINNET)).toBe('ETH')
    })

    it('returns wrapped symbol for WETH on BSC', () => {
      const weth = new Token(ChainId.BSC_MAINNET, '0x0000000000000000000000000000000000000001', 18, 'WETH')
      expect(getTokenSymbol(weth, ChainId.BSC_MAINNET)).toBe('WBNB')
    })

    it('returns wrapped symbol for WETH on HyperEVM', () => {
      const weth = new Token(ChainId.HYPER_EVM, '0x0000000000000000000000000000000000000001', 18, 'WETH')
      expect(getTokenSymbol(weth, ChainId.HYPER_EVM)).toBe('WHYPE')
    })

    it('returns token symbol for regular token', () => {
      const usdc = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 6, 'USDC')
      expect(getTokenSymbol(usdc, ChainId.MAINNET)).toBe('USDC')
    })

    it('handles null/undefined currency', () => {
      expect(getTokenSymbol(null, ChainId.MAINNET)).toBeUndefined()
      expect(getTokenSymbol(undefined, ChainId.MAINNET)).toBeUndefined()
    })
  })

  describe('#getTokenName', () => {
    it('returns native name for ETHER on each chain', () => {
      expect(getTokenName(ETHER, ChainId.BSC_MAINNET)).toBe('BNB')
      expect(getTokenName(ETHER, ChainId.BERA_MAINNET)).toBe('BERA')
      expect(getTokenName(ETHER, ChainId.MAINNET)).toBe('Ethereum')
    })

    it('returns token name for regular token', () => {
      const usdc = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 6, 'USDC', 'USD Coin')
      expect(getTokenName(usdc, ChainId.MAINNET)).toBe('USD Coin')
    })

    it('handles null/undefined currency', () => {
      expect(getTokenName(null, ChainId.MAINNET)).toBeUndefined()
      expect(getTokenName(undefined, ChainId.MAINNET)).toBeUndefined()
    })
  })

  describe('#getScanText', () => {
    it('returns correct scanner name per chain', () => {
      expect(getScanText(ChainId.BSC_MAINNET)).toBe('Bscscan')
      expect(getScanText(ChainId.BASE_MAINNET)).toBe('Basescan')
      expect(getScanText(ChainId.BERA_MAINNET)).toBe('Berascan')
      expect(getScanText(ChainId.ARBITRUM_MAINNET)).toBe('ARBscan')
      expect(getScanText(ChainId.HYPER_EVM)).toBe('Hyperscan')
      expect(getScanText(ChainId.LINEA_MAINNET)).toBe('Lineascan')
      expect(getScanText(ChainId.SEI_MAINNET)).toBe('Seiscan')
      expect(getScanText(ChainId.MONAD)).toBe('Monadscan')
    })

    it('defaults to Etherscan', () => {
      expect(getScanText(ChainId.MAINNET)).toBe('Etherscan')
    })
  })

  describe('#isNativeCurrency', () => {
    it('returns true for wrapped native symbols', () => {
      expect(isNativeCurrency('WETH')).toBe(true)
      expect(isNativeCurrency('WBNB')).toBe(true)
      expect(isNativeCurrency('WBERA')).toBe(true)
      expect(isNativeCurrency('WHYPE')).toBe(true)
      expect(isNativeCurrency('WSEI')).toBe(true)
      expect(isNativeCurrency('WMON')).toBe(true)
      expect(isNativeCurrency('WVIC')).toBe(true)
      expect(isNativeCurrency('WU2U')).toBe(true)
    })

    it('returns false for non-wrapped symbols', () => {
      expect(isNativeCurrency('ETH')).toBe(false)
      expect(isNativeCurrency('BNB')).toBe(false)
      expect(isNativeCurrency('USDC')).toBe(false)
      expect(isNativeCurrency(undefined)).toBe(false)
    })
  })
})
