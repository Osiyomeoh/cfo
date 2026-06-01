import type { ActionEntry } from '@/types'

export type FeedDisplayType = 'swap' | 'rebalance' | 'identity' | 'alert'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

export function chartDays(
  history: { date: string; value: number }[],
  range = '7D',
) {
  const sliced = range === '1D' ? history.slice(-1)
    : range === '7D' ? history.slice(-7)
    : range === '1M' ? history.slice(-30)
    : history
  return sliced.map((h, i) => ({
    day: DAYS[i % 7] ?? h.date.slice(0, 3).toUpperCase(),
    value: h.value,
  }))
}

export function actionFeedType(action: ActionEntry): FeedDisplayType {
  if (action.type === 'id') return 'identity'
  if (action.type === 'warn') return 'alert'
  if (action.type === 'ok' || action.category === 'lp') return 'rebalance'
  if (action.category === 'swap') return 'swap'
  return 'swap'
}

export function matchesFeedFilter(filter: string, action: ActionEntry): boolean {
  if (filter === 'All') return true
  if (filter === 'Swaps') return action.category === 'swap'
  if (filter === 'LP') return action.category === 'lp'
  if (filter === 'Perps') return action.category === 'perp'
  return true
}

export function riskDisplayLabel(profile: string): string {
  if (profile === 'conservative') return 'SAFE'
  if (profile === 'aggressive') return 'HIGH'
  return 'MODERATE'
}
