import type { ExecutionType } from '@/types'

export type ChatIntent = 'yield' | 'risk' | 'gains' | 'compound' | 'portfolio' | 'confirm' | 'default'

export function parseChatIntent(text: string): ChatIntent {
  const t = text.toLowerCase().trim()
  if (t === 'confirm' || t === 'yes' || t === 'approve' || t === 'go ahead') return 'confirm'
  if (t.includes('yield') || t.includes('best') || t.includes('lp') || t.includes('move') && t.includes('%')) return 'yield'
  if (t.includes('risk') || t.includes('safe') || t.includes('reduce')) return 'risk'
  if (t.includes('gain') || t.includes('profit') || t.includes('return') || t.includes('p&l')) return 'gains'
  if (t.includes('compound')) return 'compound'
  if (t.includes('portfolio') || t.includes('balance') || t.includes('breakdown')) return 'portfolio'
  return 'default'
}

export function intentToExecution(intent: ChatIntent): ExecutionType | null {
  switch (intent) {
    case 'yield':
      return 'lp_open'
    case 'risk':
      return 'risk_reduce'
    case 'compound':
      return 'compound'
    case 'confirm':
      return null
    default:
      return null
  }
}
