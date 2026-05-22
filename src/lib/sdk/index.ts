// Main barrel export for @brownfi/sdk local replacement
// This file must export everything that the old bundled SDK exported.

// Re-export JSBI as a named export (app imports: `import { JSBI } from '@brownfi/sdk'`)
export { default as JSBI } from 'jsbi'

// Constants
export * from './constants'

// Entities
export * from './entities'

// Errors
export * from './errors'

// currencyEquals is exported from both entities/token and utils
// The entities/index.ts already exports it from ./token
// Re-export here explicitly so both import paths work
export { currencyEquals } from './entities/token'

// Router
export * from './router'

// Contract helpers (swap, liquidity, etc.)
export * from './contract'

// Utility functions
export {
  getPriceFromUnsafe,
  getRouterAddress,
  getFactoryAddress,
  getInitCodeHash,
  getPythPrice,
  getPythPricesBatch,
  getPythPricePair,
  isContractWithPrice,
  validateAndParseAddress,
  parseBigintIsh,
  sortedInsert,
} from './utils'
