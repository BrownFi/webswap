const CAN_SET_PROTOTYPE = 'setPrototypeOf' in Object

export class InsufficientReservesError extends Error {
  public readonly isInsufficientReservesError = true
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'INSUFFICIENT_RESERVES_ERROR'
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(this, InsufficientReservesError.prototype)
  }
}

export class InsufficientInputAmountError extends Error {
  public readonly isInsufficientInputAmountError = true
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'INSUFFICIENT_INPUT_AMOUNT'
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(this, InsufficientInputAmountError.prototype)
  }
}
