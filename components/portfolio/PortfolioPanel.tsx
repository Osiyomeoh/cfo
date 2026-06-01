'use client'
import { LogOut } from 'lucide-react'
import { cn, formatUSD, formatDelta } from '@/lib/utils'
import { primaryMetric } from '@/lib/positionStats'
import { GetMntButton } from '@/components/portfolio/GetMntButton'
import type { PortfolioSnapshot, Position, Allocation } from '@/types'

interface Props {
  portfolio: PortfolioSnapshot
  positions: Position[]
  allocations: Allocation[]
  activePosition: string
  onSelectPosition: (id: string) => void
  walletLabel?: string | null
  portfolioLive?: boolean
  onDisconnect?: () => void
}

const BADGE: Record<string, string> = {
  LP: 'pro-badge pro-badge-lp',
  PERP: 'pro-badge pro-badge-perp',
  RWA: 'pro-badge pro-badge-rwa',
  STABLE: 'pro-badge',
}

export function PortfolioPanel({
  portfolio,
  positions,
  allocations,
  activePosition,
  onSelectPosition,
  walletLabel,
  portfolioLive = false,
  onDisconnect,
}: Props) {
  const isUp = portfolio.change7d >= 0

  return (
    <aside className="pro-sidebar">
      <div className="pro-section">
        <div className="flex items-center justify-between mb-2">
          <p className="pro-label">Account</p>
          {onDisconnect && walletLabel && (
            <button
              type="button"
              onClick={onDisconnect}
              title="Disconnect wallet"
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide"
              style={{ color: 'var(--pro-negative)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <LogOut size={10} strokeWidth={2.5} />
              Disconnect
            </button>
          )}
        </div>
        <p className="text-[13px] font-mono font-semibold text-[var(--pro-text)] truncate">
          {walletLabel ?? 'Not connected'}
        </p>
        <p className="text-[11px] font-mono text-[var(--pro-text-muted)] mt-1">
          {portfolioLive ? '● LIVE · Mantle' : '○ No balances'}
        </p>
      </div>

      <div className="pro-section">
        <p className="pro-label mb-3">Net Worth</p>
        <p className="pro-display">{formatUSD(portfolio.totalValue)}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className={cn('text-[13px] font-bold font-mono', isUp ? 'pro-positive' : 'pro-negative')}>
            {isUp ? '▲' : '▼'} {formatDelta(portfolio.change7d)}
          </span>
          <span className="text-[10px] font-mono text-[var(--pro-text-muted)] uppercase tracking-widest">7D</span>
        </div>
        <svg viewBox="0 0 200 36" className="w-full h-7 mt-3" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="proSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pro-chart)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--pro-chart)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,28 C30,24 60,18 100,14 C140,10 170,16 200,8" fill="none" stroke="var(--pro-chart)" strokeWidth="1.25" />
          <path d="M0,28 C30,24 60,18 100,14 C140,10 170,16 200,8 L200,36 L0,36Z" fill="url(#proSpark)" />
        </svg>
      </div>

      <div className="pro-section">
        <p className="pro-label mb-3">Allocation</p>
        <div className="pro-alloc-bar mb-4">
          {allocations.map(a => (
            <div key={a.name} className="pro-alloc-seg" style={{ width: `${a.pct}%`, background: a.color }} />
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {allocations.map(a => (
            <div key={a.name} className="flex items-center gap-2.5">
              <div className="w-2 h-2 shrink-0" style={{ background: a.color }} />
              <span className="flex-1 font-mono text-[12px] text-[var(--pro-text-secondary)] truncate">{a.name}</span>
              <span className="font-mono text-[12px] text-[var(--pro-text-muted)] w-8 text-right">{a.pct}%</span>
              <span className="font-mono text-[12px] font-semibold text-[var(--pro-text)] min-w-[56px] text-right">
                {formatUSD(a.value, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pro-section pro-scroll flex-1 min-h-0 border-b-0">
        <p className="pro-label mb-3">Positions</p>
        {positions.length === 0 ? (
          <div>
            <p className="font-mono text-[13px] text-[var(--pro-text-muted)] leading-relaxed">
              No balances detected on Mantle mainnet.
            </p>
            <GetMntButton />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {positions.map(pos => {
              const m = primaryMetric(pos)
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onSelectPosition(pos.id)}
                  className={cn('pro-pos-card', activePosition === pos.id && 'pro-pos-card--active')}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[13px] font-bold text-[var(--pro-text)] truncate">
                      {pos.name}
                    </span>
                    <span className={BADGE[pos.type] ?? 'pro-badge'}>{pos.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[var(--pro-text-muted)]">
                      {m.label} {m.value}
                    </span>
                    <span className={cn('font-mono text-[13px] font-bold', pos.pnl >= 0 ? 'pro-positive' : 'pro-negative')}>
                      {formatDelta(pos.pnl)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
