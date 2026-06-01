'use client'
import { useState } from 'react'
import type { PortfolioSnapshot, Position, Allocation, ActionEntry, AgentState } from '@/types'
import { EMPTY_PORTFOLIO, EMPTY_POSITIONS, EMPTY_ALLOCATIONS, EMPTY_ACTIONS, EMPTY_AGENT } from '@/lib/emptyDefaults'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot>(EMPTY_PORTFOLIO)
  const [positions, setPositions] = useState<Position[]>(EMPTY_POSITIONS)
  const [allocations] = useState<Allocation[]>(EMPTY_ALLOCATIONS)
  const [actions, setActions] = useState<ActionEntry[]>(EMPTY_ACTIONS)
  const [agent] = useState<AgentState>(EMPTY_AGENT)
  const [activePosition, setActivePosition] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'All'>('1W')

  return {
    portfolio,
    setPortfolio,
    positions,
    allocations,
    actions,
    agent,
    activePosition,
    setActivePosition,
    timeRange,
    setTimeRange,
  }
}
