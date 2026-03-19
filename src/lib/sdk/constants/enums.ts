export enum TradeType {
  EXACT_INPUT = 0,
  EXACT_OUTPUT = 1,
}

export enum Rounding {
  ROUND_DOWN = 0,
  ROUND_HALF_UP = 1,
  ROUND_UP = 2,
}

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
  LIQUIDITY_PERCENT = 'LIQUIDITY_PERCENT',
  LIQUIDITY = 'LIQUIDITY',
}

export enum ApprovalState {
  UNKNOWN = 0,
  NOT_APPROVED = 1,
  PENDING = 2,
  APPROVED = 3,
}

export enum SwapCallbackState {
  INVALID = 0,
  LOADING = 1,
  VALID = 2,
}
