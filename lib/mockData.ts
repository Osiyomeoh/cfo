import type { Position } from '@/types'

export const QUICK_ACTIONS = ['Best yield now?', 'Reduce risk', 'Show my gains', 'Auto-compound']

/** Map API position summary to full Position shape for preview building */
export function toPositions(
  rows: { name: string; type: string; value: number }[],
): Position[] {
  return rows.map((p, i) => ({
    id: `p-${i}`,
    name: p.name,
    type: p.type as Position['type'],
    icon: p.name.charAt(0),
    iconBg: '#1e3a5f',
    value: p.value,
    pnl: 0,
  }))
}
