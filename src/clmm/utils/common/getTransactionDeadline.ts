export function getTransactionDeadline(txDeadline: number, now = Date.now()) {
  return Math.floor(now / 1000) + txDeadline
}
