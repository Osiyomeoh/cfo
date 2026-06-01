import type { Position } from '@/types'

/** First stat line for position cards — never shows "undefined" */
export function primaryMetric(pos: Position): {
  label: string
  value: string
  positive: boolean
} {
  if (pos.apr != null) {
    return { label: 'APR', value: `${Number(pos.apr).toFixed(1)}%`, positive: true }
  }
  if (pos.apy != null) {
    return { label: 'APY', value: `${Number(pos.apy).toFixed(1)}%`, positive: true }
  }
  if (pos.liqPrice != null) {
    return { label: 'Liq', value: `$${pos.liqPrice.toLocaleString()}`, positive: true }
  }
  if (pos.type === 'STABLE' || pos.name.toLowerCase().includes('gas')) {
    return { label: 'Role', value: 'Gas reserve', positive: true }
  }
  return { label: 'APR', value: '—', positive: true }
}
