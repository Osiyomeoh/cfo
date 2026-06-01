import type { PortfolioSnapshot, Position, Allocation, ActionEntry, AgentState } from '@/types'
import { buildHistoryDays } from './emptyDefaults'

export const DEMO_PORTFOLIO: PortfolioSnapshot = {
  totalValue: 84_320.48,
  change7d: 2_140.22,
  changePct7d: 2.61,
  executions: 47,
  avgYield: 12.4,
  history: (() => {
    const vals = [82000, 81400, 83100, 82700, 84000, 83500, 85200, 84320]
    const days = buildHistoryDays(84320, 8)
    return days.map((d, i) => ({ ...d, value: vals[i] ?? 82000 }))
  })(),
}

export const DEMO_POSITIONS: Position[] = [
  {
    id: 'demo-1',
    name: 'USDC/MNT LP',
    type: 'LP',
    icon: 'U',
    iconBg: '#1e3a5f',
    value: 34_200,
    pnl: 820.40,
    apr: 14.2,
  },
  {
    id: 'demo-2',
    name: 'ETH Perp Long',
    type: 'PERP',
    icon: 'E',
    iconBg: '#1a2e1a',
    value: 22_100,
    pnl: 1_140.80,
  },
  {
    id: 'demo-3',
    name: 'Lendle USDC',
    type: 'STABLE',
    icon: 'L',
    iconBg: '#2a1a3e',
    value: 18_020.48,
    pnl: 179.02,
    apy: 8.9,
  },
  {
    id: 'demo-4',
    name: 'RWA T-Bill',
    type: 'RWA',
    icon: 'R',
    iconBg: '#2a2010',
    value: 10_000,
    pnl: 0,
    apy: 5.1,
  },
]

export const DEMO_ALLOCATIONS: Allocation[] = [
  { name: 'LP', pct: 41, value: 34_200, color: '#ff8c00' },
  { name: 'Perps', pct: 26, value: 22_100, color: '#00c47a' },
  { name: 'Stable', pct: 21, value: 18_020, color: '#3a8ef6' },
  { name: 'RWA', pct: 12, value: 10_000, color: '#9b59b6' },
]

export const DEMO_ACTIONS: ActionEntry[] = [
  {
    id: 'da-1',
    type: 'exec',
    title: 'Auto-swap USDC → MNT',
    desc: 'Rebalanced LP ratio · Merchant Moe',
    time: '2m ago',
    txHash: '0x4f2a…d81c',
    category: 'swap',
    delta: 142.80,
  },
  {
    id: 'da-2',
    type: 'ok',
    title: 'LP Rebalance',
    desc: 'USDC/MNT range adjusted · iZUMi',
    time: '18m ago',
    txHash: '0x7b1c…9e34',
    category: 'lp',
    delta: 0,
  },
  {
    id: 'da-3',
    type: 'id',
    title: 'ERC-8004 Rep Updated',
    desc: 'Agent #1,247 · score 88/100',
    time: '1h ago',
    txHash: '0x2d9f…a120',
    category: 'system',
    delta: 0,
  },
  {
    id: 'da-4',
    type: 'exec',
    title: 'Compound Yield',
    desc: 'Staking rewards → USDC · Lendle',
    time: '3h ago',
    txHash: '0x8c3e…f490',
    category: 'swap',
    delta: 312.40,
  },
  {
    id: 'da-5',
    type: 'warn',
    title: 'Perp Funding Warning',
    desc: 'ETH funding rate: +0.08% — held',
    time: '5h ago',
    txHash: '—',
    category: 'perp',
    delta: 0,
  },
]

export const DEMO_AGENT: AgentState = {
  isActive: true,
  repScore: 88,
  totalExecutions: 47,
  agentId: '#1,247',
  agentIdNumeric: 1247,
  riskProfile: 'balanced',
}

export const DEMO_MESSAGES = [
  {
    id: 'dm-1',
    role: 'agent' as const,
    content: `**Demo mode active.** Portfolio value: **$84,320.48** · 4 positions on Mantle.\n\nI'm running autonomously — I just rebalanced your USDC/MNT LP and compounded $312 in yield. Ask me anything or switch to **Auto** mode to watch the agent brain.`,
    timestamp: new Date(),
    actions: ['Best yield now?', 'Reduce risk', 'Show my gains'],
  },
]
