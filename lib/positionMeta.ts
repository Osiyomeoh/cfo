import type { Position } from '@/types'

export const POSITION_META: Record<
  string,
  { protocol: string; icon: string; entry?: number }
> = {
  p1: { protocol: 'Agni Finance · V3', icon: '💧' },
  p2: { protocol: 'Ondo Finance · RWA', icon: '🏛' },
  p3: { protocol: 'Vertex Protocol · 2x', icon: '⚡', entry: 62440 },
  p4: { protocol: 'Merchant Moe · Standard', icon: '💎' },
}

export function positionSubtitle(pos: Position): string {
  const m = POSITION_META[pos.id]
  return m?.protocol ?? 'Mantle Network'
}

export function positionEmoji(pos: Position): string {
  return POSITION_META[pos.id]?.icon ?? pos.icon
}
