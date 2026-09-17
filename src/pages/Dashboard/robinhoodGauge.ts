export type RobinhoodGaugeHistory = {
  startedAt: number
  previousSplit: number
}

// First swap observed after each current gauge was switched to feeSplit = 1.
// These timestamps are immutable historical boundaries used by the Dashboard.
export const ROBINHOOD_GAUGE_HISTORY: Record<string, RobinhoodGaugeHistory> = {
  '0x4533d55b88bb957cfd682cf4265e20e8a64f4479': { startedAt: 1789608881, previousSplit: 0.1 },
  '0x8825edff851f6fc8f0d91d3942c946910d38771b': { startedAt: 1789499164, previousSplit: 0.2 },
  '0x9fae770e44e64f22b4fd5c2974a78f067640c90b': { startedAt: 1788970345, previousSplit: 0.1 },
}
