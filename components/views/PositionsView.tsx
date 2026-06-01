'use client'
import { useState } from 'react'
import { cn, formatUSD, formatDelta } from '@/lib/utils'
import { positionEmoji, positionSubtitle } from '@/lib/positionMeta'
import type { Position } from '@/types'

const TYPE_BADGE: Record<string, string> = {
  LP: 'pro-badge pro-badge-lp',
  PERP: 'pro-badge pro-badge-perp',
  RWA: 'pro-badge pro-badge-rwa',
  STABLE: 'pro-badge bg-[var(--pro-surface-muted)] text-[var(--pro-text-secondary)]',
}

interface Props {
  positions: Position[]
  onChat?: (msg: string) => void
}

export function PositionsView({ positions, onChat }: Props) {
  const [layout, setLayout] = useState<'Grid' | 'Table'>('Grid')
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Positions</h1>
          <p className="pro-page-sub">{positions.length} active positions on Mantle</p>
        </div>
        <div className="pro-segment">
          {(['Grid', 'Table'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setLayout(v)}
              className={cn('pro-segment-btn', layout === v && 'pro-segment-btn--active')}
            >
              {v}
            </button>
          ))}
        </div>
        <button type="button" className="pro-btn-primary" onClick={() => onChat?.('Open a new position for best yield')}>
          + Open position
        </button>
      </header>

      <div className="pro-metric-grid px-6 py-4 bg-[var(--pro-surface)] border-b border-[var(--pro-border)]">
        {[
          { label: 'Net PnL', value: formatDelta(totalPnl), up: totalPnl >= 0 },
          { label: '24h volume', value: '$4,201.50', up: false },
          { label: 'Health factor', value: '2.44', up: true },
          { label: 'Active alerts', value: '1 warning', up: false, warn: true },
        ].map(s => (
          <div key={s.label} className="pro-metric">
            <span className="pro-metric-label">{s.label}</span>
            <span className={cn('pro-metric-value', s.up && 'pro-metric-value--up', s.warn && 'text-[var(--pro-negative)]')}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="pro-scroll p-6">
        {positions.length === 0 ? (
          <div className="pro-card text-center py-12">
            <p className="text-[14px] font-semibold text-[var(--pro-text)]">No open positions</p>
            <p className="text-[12px] text-[var(--pro-text-muted)] mt-2">
              Balances and LP positions appear here when detected on Mantle or via Byreal CLI.
            </p>
          </div>
        ) : layout === 'Grid' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {positions.map(pos => (
              <PositionCard key={pos.id} pos={pos} onChat={onChat} />
            ))}
          </div>
        ) : (
          <div className="pro-card p-0 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--pro-border)]">
                  {['Position', 'Type', 'Value', 'APR/APY', 'PnL', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-[var(--pro-text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-b border-[var(--pro-border)] last:border-0 hover:bg-[var(--pro-surface-muted)] transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-[var(--pro-text)]">{pos.name}</td>
                    <td className="px-4 py-3"><span className={TYPE_BADGE[pos.type] ?? TYPE_BADGE.STABLE}>{pos.type}</span></td>
                    <td className="px-4 py-3 font-mono text-[var(--pro-text)]">{formatUSD(pos.value, 0)}</td>
                    <td className="px-4 py-3 font-mono pro-positive">{pos.apr ? `${pos.apr}%` : pos.apy ? `${pos.apy}%` : '—'}</td>
                    <td className={cn('px-4 py-3 font-mono font-semibold', pos.pnl >= 0 ? 'pro-positive' : 'pro-negative')}>{formatDelta(pos.pnl)}</td>
                    <td className="px-4 py-3 font-mono pro-positive text-[11px]">Active</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="pro-btn text-[10px] py-1 px-2"
                        onClick={() => onChat?.(`Manage my ${pos.name} position`)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

function PositionCard({ pos, onChat }: { pos: Position; onChat?: (msg: string) => void }) {
  return (
    <div className="pro-card">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-[var(--pro-surface-muted)] flex items-center justify-center text-lg shrink-0 border border-[var(--pro-border)]">
            {positionEmoji(pos)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[14px] font-semibold text-[var(--pro-text)]">{pos.name}</p>
              <span className={TYPE_BADGE[pos.type] ?? TYPE_BADGE.STABLE}>{pos.type}</span>
            </div>
            <p className="text-[11px] text-[var(--pro-text-muted)] mt-0.5 truncate">{positionSubtitle(pos)}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="pro-metric-label">Value</p>
          <p className="pro-metric-value text-[16px]">{formatUSD(pos.value, 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-[var(--pro-border)]">
        <div>
          <p className="pro-metric-label mb-1">{pos.apr ? 'APR' : pos.apy ? 'APY' : 'Liq'}</p>
          <p className="text-[13px] font-semibold font-mono pro-positive">
            {pos.apr ? `${pos.apr}%` : pos.apy ? `${pos.apy}%` : pos.liqPrice ? `$${pos.liqPrice.toLocaleString()}` : '—'}
          </p>
        </div>
        <div>
          <p className="pro-metric-label mb-1">PnL</p>
          <p className={cn('text-[13px] font-semibold font-mono', pos.pnl >= 0 ? 'pro-positive' : 'pro-negative')}>{formatDelta(pos.pnl)}</p>
        </div>
        <div>
          <p className="pro-metric-label mb-1">Status</p>
          <p className="text-[13px] font-semibold pro-positive">Active</p>
        </div>
      </div>

      <div className="flex gap-2">
        {pos.type === 'LP' && (
          <>
            <button type="button" className="pro-btn flex-1 justify-center" onClick={() => onChat?.(`Show me the range for my ${pos.name} position`)}>View range</button>
            <button type="button" className="pro-btn-primary flex-1 justify-center" onClick={() => onChat?.(`Auto-rebalance my ${pos.name} LP position`)}>Auto-rebalance</button>
          </>
        )}
        {pos.type === 'PERP' && (
          <>
            <button type="button" className="pro-btn flex-1 justify-center" style={{ color: 'var(--pro-negative)', borderColor: 'rgba(255,71,87,0.3)' }} onClick={() => onChat?.(`Reduce risk on my ${pos.name} position`)}>Reduce risk</button>
            <button type="button" className="pro-btn-primary flex-1 justify-center" onClick={() => onChat?.(`Close my ${pos.name} position`)}>Close</button>
          </>
        )}
        {pos.type === 'RWA' && (
          <>
            <button type="button" className="pro-btn flex-1 justify-center" onClick={() => onChat?.(`Add capital to my ${pos.name} RWA position`)}>Add capital</button>
            <button type="button" className="pro-btn flex-1 justify-center" onClick={() => onChat?.(`Redeem my ${pos.name} RWA position`)}>Redeem</button>
          </>
        )}
        {pos.type === 'STABLE' && (
          <>
            <button type="button" className="pro-btn flex-1 justify-center" onClick={() => onChat?.(`Compound rewards on my ${pos.name}`)}>Compound</button>
            <button type="button" className="pro-btn flex-1 justify-center" onClick={() => onChat?.(`Find better yield than my ${pos.name}`)}>Find better yield</button>
          </>
        )}
      </div>
    </div>
  )
}
