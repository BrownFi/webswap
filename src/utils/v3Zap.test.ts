import { ChainId, getRouterAddress, getFactoryAddress, ROUTER_ADDRESS, ROUTER_ADDRESS_V3 } from '@brownfi/sdk'
import { isV3ZapSupported } from './v3Zap'

describe('V3 Zap: isV3ZapSupported', () => {
  it('returns false when version is not 3', () => {
    expect(isV3ZapSupported(ChainId.BERA_MAINNET, 1)).toBe(false)
    expect(isV3ZapSupported(ChainId.BERA_MAINNET, 2)).toBe(false)
  })

  it('returns false when chainId is undefined', () => {
    expect(isV3ZapSupported(undefined, 3)).toBe(false)
    expect(isV3ZapSupported(null, 3)).toBe(false)
  })

  it('returns false when V3 router is not deployed (empty map)', () => {
    // ROUTER_ADDRESS_V3 is empty by default
    expect(isV3ZapSupported(ChainId.BERA_MAINNET, 3)).toBe(false)
  })
})

describe('V3 Zap: getRouterAddress version branching', () => {
  it('version 2 returns V2 address (unchanged)', () => {
    const v2Addr = getRouterAddress(ChainId.BERA_MAINNET, 2)
    expect(v2Addr).toBe(ROUTER_ADDRESS[ChainId.BERA_MAINNET])
    expect(v2Addr).toBe('0xb91458408dc7bb0561da70ffd89903794eAcDDA7')
  })

  it('version 1 returns V1 address (unchanged)', () => {
    const v1Addr = getRouterAddress(ChainId.BERA_MAINNET, 1)
    expect(v1Addr).toBeDefined()
  })

  it('version 3 returns empty string when not deployed', () => {
    const v3Addr = getRouterAddress(ChainId.BERA_MAINNET, 3)
    expect(v3Addr).toBe('')
  })

  it('version 3 does NOT affect version 2', () => {
    // Call V3 first, then V2 — V2 should still work
    getRouterAddress(ChainId.BERA_MAINNET, 3)
    const v2Addr = getRouterAddress(ChainId.BERA_MAINNET, 2)
    expect(v2Addr).toBe('0xb91458408dc7bb0561da70ffd89903794eAcDDA7')
  })
})

describe('V3 Zap: getFactoryAddress version branching', () => {
  it('version 2 returns V2 factory (unchanged)', () => {
    const addr = getFactoryAddress(ChainId.BERA_MAINNET, 2)
    expect(addr).toBe('0x43AB776770cC5c739adDf318Af712DD40918C42d')
  })

  it('version 3 returns empty string when not deployed', () => {
    const addr = getFactoryAddress(ChainId.BERA_MAINNET, 3)
    expect(addr).toBe('')
  })
})

describe('V3 Zap: ROUTER_ADDRESS_V3 is empty by default', () => {
  it('V3 map has no entries with non-empty values', () => {
    const nonEmpty = Object.values(ROUTER_ADDRESS_V3).filter(Boolean)
    expect(nonEmpty.length).toBe(0)
  })
})
