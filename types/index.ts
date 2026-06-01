export type RiskProfile = 'conservative' | 'balanced' | 'aggressive'

export type PositionType = 'LP' | 'PERP' | 'RWA' | 'STABLE'

export interface Position {
  id: string
  name: string
  type: PositionType
  icon: string
  iconBg: string
  value: number
  pnl: number
  apr?: number
  apy?: number
  liqPrice?: number
}

export interface Allocation {
  name: string
  color: string
  pct: number
  value: number
}

export interface ActionEntry {
  id: string
  type: 'exec' | 'warn' | 'ok' | 'id'
  title: string
  desc: string
  time: string
  txHash: string
  txHashFull?: string
  explorerUrl?: string
  delta?: number
  category: 'swap' | 'lp' | 'perp' | 'rwa' | 'system'
}

export interface PortfolioSnapshot {
  totalValue: number
  change7d: number
  changePct7d: number
  executions: number
  avgYield: number
  history: { date: string; value: number }[]
}

export interface ChatMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  txCard?: TxCard
  actions?: string[]
}

export interface TxCard {
  from?: string
  to?: string
  amount?: string
  expectedApr?: string
  gas?: string
  status?: string
  hash?: string
  explorerUrl?: string
  erc8004?: string
}

export interface AgentState {
  isActive: boolean
  repScore: number
  totalExecutions: number
  agentId: string
  agentIdNumeric?: number
  riskProfile: RiskProfile
}

export type ExecutionType = 'swap' | 'lp_open' | 'rebalance' | 'compound' | 'risk_reduce'

export interface ExecutionPreview {
  id: string
  type: ExecutionType
  title: string
  from: string
  to: string
  expectedApr?: string
  gas: string
  amountUsd: number
  pool?: string
}

export interface ExecutionResult {
  success: boolean
  txHash: string
  txHashFull?: string
  explorerUrl?: string
  action: ActionEntry
  delta: number
  erc8004Updated: boolean
  erc8004TxHash?: string
  source: 'mock' | 'byreal-cli' | 'byreal-api' | 'mantle'
  sources?: Array<'mock' | 'byreal-cli' | 'byreal-api' | 'mantle'>
  message: string
  error?: string
}

export interface UserSettings {
  onboardingComplete: boolean
  riskProfile: RiskProfile
  goals: string[]
  walletAddress?: string
  autoExecute: boolean
  agentIdNumeric?: number
  referralCode?: string      // this user's own referral code
  referredBy?: string        // referral code used during signup
}

export interface AgentApiResponse {
  reply: string
  source: 'claude' | 'mock'
  preview?: ExecutionPreview
  needsConfirm?: boolean
  error?: string
}
