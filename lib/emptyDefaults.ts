import type { AgentState, Allocation, PortfolioSnapshot, Position, ActionEntry } from '@/types'

export function buildHistoryDays(totalValue: number, days = 8): PortfolioSnapshot['history'] {
  const out: PortfolioSnapshot['history'] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: totalValue,
    })
  }
  return out
}

export const EMPTY_PORTFOLIO: PortfolioSnapshot = {
  totalValue: 0,
  change7d: 0,
  changePct7d: 0,
  executions: 0,
  avgYield: 0,
  history: buildHistoryDays(0),
}

export const EMPTY_ALLOCATIONS: Allocation[] = []
export const EMPTY_POSITIONS: Position[] = []
export const EMPTY_ACTIONS: ActionEntry[] = []

export const EMPTY_AGENT: AgentState = {
  isActive: false,
  repScore: 0,
  totalExecutions: 0,
  agentId: '—',
  riskProfile: 'balanced',
}
