/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_KYBERSWAP_ZAP_API_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ENVIRONMENT: 'mainnet' | 'beta' | 'testnet'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Modules without type declarations
declare module 'jazzicon' {
  export default function jazzicon(diameter: number, seed: number): HTMLElement
}

// Legacy modules (dead code, kept for compatibility)
declare module '@web3-react/abstract-connector' {
  export class AbstractConnector {
    constructor(kwargs?: any)
  }
}

declare module '@web3-react/core' {
  export function useWeb3React<T = any>(key?: string): {
    connector: any
    library: T
    chainId?: number
    account?: string | null
    active: boolean
    error?: Error
    activate: (connector: any, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>
    deactivate: () => void
    setError: (error: Error) => void
  }
}

declare module 'hooks/useSocksBalance' {
  export function useHasSocks(): boolean | undefined
}

declare module 'utils/useUSDCPrice' {
  import { Currency, CurrencyAmount, Price } from '@brownfi/sdk'
  export default function useUSDCPrice(currency?: Currency): Price | undefined
  export function useUSDCValue(currencyAmount: CurrencyAmount | undefined | null): CurrencyAmount | null
}

declare module 'rebass/styled-components' {
  import { StyledComponent } from 'styled-components'
  export const Text: StyledComponent<'div', any, any>
  export const Box: StyledComponent<'div', any, any>
}

declare module '@starknet-react/core' {
  export function StarknetConfig(props: any): any
  export function publicProvider(): any
  export function argent(): any
  export function braavos(): any
}

declare module '@starknet-react/chains' {
  export const mainnet: any
}

declare module '@uniswap/governance/build/GovernorAlpha.json' {
  const value: any
  export default value
}

declare module 'luxon' {
  export class DateTime {
    static local(): DateTime
    static fromSeconds(seconds: number): DateTime
    toLocaleString(preset: any): string
    static DATE_FULL: any
  }
}
