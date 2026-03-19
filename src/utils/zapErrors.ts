/**
 * Parse Zap transaction errors into user-friendly messages.
 */

type ErrorLike = {
  code?: number | string
  reason?: string
  message?: string
  data?: { message?: string }
  error?: { message?: string }
}

const ERROR_MESSAGES: Record<string, string> = {
  // On-chain reverts
  'execution reverted': 'Transaction reverted. Price may have moved — try increasing slippage tolerance.',
  'INSUFFICIENT_OUTPUT_AMOUNT': 'Price moved too much. Increase slippage tolerance and try again.',
  'EXPIRED': 'Transaction expired. Please try again.',
  'TRANSFER_FAILED': 'Token transfer failed. Check your balance and approvals.',
  'STF': 'Token transfer failed. Check your balance and approvals.',

  // Gas issues
  'out of gas': 'Transaction ran out of gas. Please try again.',
  'intrinsic gas too low': 'Gas estimation failed. Please try again.',
  'gas required exceeds allowance': 'Insufficient gas. Make sure you have enough native token for gas.',

  // Network / API
  'network error': 'Network error. Check your connection and try again.',
  'timeout': 'Request timed out. Please try again.',
  'NETWORK_ERROR': 'Network error. Check your connection and try again.',
  'SERVER_ERROR': 'Kyber API error. Please try again later.',

  // Kyber specific
  'no route found': 'No route found for this zap. Try a different amount or token.',
  'insufficient liquidity': 'Insufficient liquidity for this route.',
}

/**
 * Returns true if the error is a user rejection (MetaMask cancel).
 */
export function isUserRejection(error: ErrorLike): boolean {
  return error?.code === 4001 || error?.code === 'ACTION_REJECTED'
}

/**
 * Parse any error into a human-readable message for toast display.
 */
export function parseZapError(error: unknown): string {
  const err = error as ErrorLike

  if (!err) return 'Unknown error. Please try again.'

  // Check reason field first (ethers provides this)
  if (err.reason) {
    const lower = err.reason.toLowerCase()
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (lower.includes(key.toLowerCase())) return message
    }
    return err.reason
  }

  // Check message field
  const message = err.message || err.data?.message || err.error?.message || ''
  if (message) {
    const lower = message.toLowerCase()
    for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
      if (lower.includes(key.toLowerCase())) return msg
    }

    // HTTP errors from API
    if (lower.includes('http 4')) return 'Kyber API request failed. Please try again.'
    if (lower.includes('http 5')) return 'Kyber API is temporarily unavailable. Please try again later.'
    if (lower.includes('aborted') || lower.includes('abort')) return 'Request timed out. Please try again.'

    // Return truncated message if nothing matched
    return message.length > 120 ? message.slice(0, 120) + '...' : message
  }

  return 'Transaction failed. Please try again.'
}

/**
 * Checks if route data is stale (older than maxAge seconds).
 */
export function isRouteStale(dataUpdatedAt: number, maxAgeMs = 60_000): boolean {
  return Date.now() - dataUpdatedAt > maxAgeMs
}
