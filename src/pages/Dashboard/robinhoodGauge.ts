export type RobinhoodGaugeHistory = {
  startedAt: number
  previousSplit: number
  timeline: Array<{ timestamp: number; split: number }>
}

// First swap observed after each current gauge was switched to feeSplit = 1.
// These timestamps are immutable historical boundaries used by the Dashboard.
export const ROBINHOOD_GAUGE_HISTORY: Record<string, RobinhoodGaugeHistory> = {
  '0x4533d55b88bb957cfd682cf4265e20e8a64f4479': {
    startedAt: 1789608881,
    previousSplit: 0.3,
    timeline: [
      { timestamp: 1788446865, split: 0 },
      { timestamp: 1788513377, split: 0.1 },
      { timestamp: 1789099444, split: 0.2 },
      { timestamp: 1789142719, split: 0.3 },
      { timestamp: 1789608881, split: 1 },
    ],
  },
  '0x8825edff851f6fc8f0d91d3942c946910d38771b': {
    startedAt: 1789499164,
    previousSplit: 0.2,
    timeline: [
      { timestamp: 1785471835, split: 0 },
      { timestamp: 1786611879, split: 0.2 },
      { timestamp: 1789499164, split: 1 },
    ],
  },
  '0x9fae770e44e64f22b4fd5c2974a78f067640c90b': {
    startedAt: 1788970345,
    previousSplit: 0.2,
    timeline: [
      { timestamp: 1785471876, split: 0 },
      { timestamp: 1786612041, split: 0.2 },
      { timestamp: 1788970345, split: 1 },
    ],
  },
}
