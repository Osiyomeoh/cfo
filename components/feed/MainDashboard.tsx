'use client'
import { useState, useEffect } from 'react'
import {
  SlidersHorizontal,
  AlertTriangle,
  ArrowLeftRight,
  Award,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatUSD, formatDelta } from '@/lib/utils'
import { chartDays, actionFeedType, matchesFeedFilter } from '@/lib/feedUtils'
import type { PortfolioSnapshot, ActionEntry } from '@/types'

interface ByrealPool {
  id: string; name: string; tvl: number
  totalApr24h: number; tokenA: string; tokenB: string
}

interface Props {
  portfolio: PortfolioSnapshot
  actions: ActionEntry[]
  onStrategy?: () => void
  onCommand?: (msg: string) => void
}

const ICONS: Record<string, { icon: LucideIcon; cls: string }> = {
  swap: { icon: ArrowLeftRight, cls: 'pro-feed-icon--exec' },
  rebalance: { icon: ArrowLeftRight, cls: 'pro-feed-icon--ok' },
  identity: { icon: Award, cls: 'pro-feed-icon--id' },
  alert: { icon: AlertTriangle, cls: 'pro-feed-icon--warn' },
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--pro-tooltip-bg)] text-white px-3 py-2 rounded-md text-xs shadow-lg">
      <p className="text-white/60 mb-0.5">{label}</p>
      <p className="font-mono font-medium">{formatUSD(payload[0].value)}</p>
    </div>
  )
}

export function MainDashboard({ portfolio, actions, onStrategy, onCommand }: Props) {
  const [range, setRange] = useState('7D')
  const [filter, setFilter] = useState('All')
  const [byrealPools, setByrealPools] = useState<ByrealPool[]>([])
  const [byrealTvl, setByrealTvl] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/byreal/pools')
      .then(r => r.json())
      .then((d: { pools?: ByrealPool[]; overview?: { tvl?: number } }) => {
        if (d.pools) setByrealPools(d.pools.slice(0, 4))
        if (d.overview?.tvl) setByrealTvl(d.overview.tvl)
      })
      .catch(() => {/* silent — data is enhancement only */})
  }, [])

  const chartData = chartDays(portfolio.history, range)
  const filtered = actions.filter(a => matchesFeedFilter(filter, a))

  return (
    <div className="pro-main">
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Portfolio Overview</h1>
          <p className="pro-page-sub">Performance · Activity · Risk</p>
        </div>

        <div className="pro-status">
          <span className="pro-status__dot" />
          Agent active
        </div>
        <button type="button" className="pro-btn" onClick={onStrategy}>
          <SlidersHorizontal size={14} strokeWidth={1.75} />
          Strategy
        </button>
      </header>

      <div className="pro-scroll">
        <div className="p-5 space-y-5">
          <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--pro-border)] flex-wrap">
              <div>
                <p className="pro-metric-label">7-Day Return</p>
                <p className="pro-metric-value pro-metric-value--up">
                  {formatDelta(portfolio.change7d)}&nbsp;
                  <span className="text-[14px] font-mono font-semibold">+{portfolio.changePct7d.toFixed(1)}%</span>
                </p>
              </div>
              <div className="pro-segment">
                {['1D', '7D', '1M', 'ALL'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRange(t)}
                    className={cn('pro-segment-btn', range === t && 'pro-segment-btn--active')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 180 }} className="px-1 pt-2">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="proChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--pro-chart)" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="var(--pro-chart)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: 'var(--pro-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--pro-chart)"
                    strokeWidth={1.75}
                    fill="url(#proChart)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pro-metric-grid mt-4">
              {[
                { label: 'Portfolio Value', value: formatUSD(portfolio.totalValue, 0), up: false },
                { label: 'Avg Yield',       value: `${portfolio.avgYield}% APY`,      up: true  },
                { label: 'Executions',      value: `${portfolio.executions}`,          up: false },
                { label: 'Network',         value: 'Mantle',                           up: false },
              ].map(m => (
                <div key={m.label} className="pro-metric">
                  <span className="pro-metric-label">{m.label}</span>
                  <span className={cn('pro-metric-value', m.up && 'pro-metric-value--up')}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Byreal Live Yield Intel ─────────────────────────────────── */}
          <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--pro-border)]">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} strokeWidth={1.75} style={{ color: 'var(--pro-accent)' }} />
                <span className="pro-label" style={{ color: 'var(--pro-accent)', fontSize: 11 }}>
                  BYREAL LIVE YIELD INTEL
                </span>
              </div>
              <div className="flex items-center gap-2">
                {byrealTvl ? (
                  <span className="font-mono text-[10px] text-[var(--pro-text-muted)]">
                    TVL ${(byrealTvl / 1e6).toFixed(1)}M
                  </span>
                ) : null}
                <span className="pro-status">
                  <span className="pro-status__dot" />
                  Byreal DEX
                </span>
              </div>
            </div>

            {byrealPools.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="font-mono text-[11px] text-[var(--pro-text-muted)] animate-pulse">
                  Fetching live pool data from Byreal…
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--pro-border)]">
                {byrealPools.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)' }}>
                        <span className="font-mono font-bold text-[9px]" style={{ color: 'var(--pro-accent)' }}>LP</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-[12px] text-[var(--pro-text)] truncate">{pool.name}</p>
                        <p className="font-mono text-[10px] text-[var(--pro-text-muted)]">
                          TVL ${pool.tvl > 1e6 ? `${(pool.tvl / 1e6).toFixed(1)}M` : `${(pool.tvl / 1e3).toFixed(0)}K`} · Byreal CLMM
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-[14px] pro-positive">
                        {pool.totalApr24h > 0 ? `${pool.totalApr24h.toFixed(1)}%` : '—'}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--pro-text-muted)]">APR 24h</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-2.5 border-t border-[var(--pro-border)]"
              style={{ background: 'rgba(255,140,0,0.03)' }}>
              <p className="font-mono text-[10px] text-[var(--pro-text-muted)]">
                Powered by{' '}
                <a href="https://byreal.io" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--pro-accent)] hover:underline">Byreal Agent Skills</a>
                {' '}· Live CLMM data · Updated on page load
              </p>
            </div>
          </div>

          {/* ── What-If Simulation Card ─────────────────────────────────── */}
          {portfolio.totalValue > 1 && (() => {
            const halfValue = portfolio.totalValue * 0.5
            const monthlyYield = halfValue * (0.05 / 12)
            return (
              <div
                className="pro-card flex flex-col gap-3"
                style={{
                  borderColor: 'var(--pro-positive)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  background: 'rgba(0,200,100,0.04)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={13} strokeWidth={1.75} style={{ color: 'var(--pro-positive)' }} />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--pro-positive)' }}>
                    What If Simulation
                  </span>
                </div>
                <p className="font-mono text-[13px] text-[var(--pro-text)] leading-relaxed">
                  If you had put <strong>50%</strong> of your portfolio into <strong>mETH</strong> 30 days ago at <strong>5% APR</strong>, you&apos;d have earned{' '}
                  <span style={{ color: 'var(--pro-positive)', fontWeight: 700 }}>
                    ${monthlyYield.toFixed(2)}
                  </span>{' '}
                  in yield by now.
                </p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] text-[var(--pro-text-muted)]">
                    Based on ${halfValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} at 5% APR/12 months
                  </p>
                  <button
                    type="button"
                    className="font-mono text-[12px] font-bold px-3 py-1.5"
                    style={{
                      background: 'rgba(0,200,100,0.12)',
                      border: '1px solid var(--pro-positive)',
                      color: 'var(--pro-positive)',
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                    onClick={() => onCommand
                      ? onCommand('Allocate 50% of my portfolio to mETH for yield')
                      : onStrategy?.()
                    }
                  >
                    Try it now →
                  </button>
                </div>
              </div>
            )
          })()}

          <div>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="pro-label" style={{ color: 'var(--pro-accent)', fontSize: 11 }}>Activity Feed</h2>
              <div className="flex gap-1.5 flex-wrap">
                {['All', 'Swaps', 'LP', 'Perps'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn('pro-chip', filter === f && 'pro-chip--active')}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="pro-card text-center py-10">
                  <p className="font-mono font-bold text-[14px] text-[var(--pro-text-secondary)]">No executions yet</p>
                  <p className="font-mono text-[12px] text-[var(--pro-text-muted)] mt-2">
                    Confirm a trade in chat to record on-chain activity
                  </p>
                </div>
              ) : filtered.map(action => {
                const kind = actionFeedType(action)
                const { icon: Icon, cls } = ICONS[kind] ?? ICONS.swap
                return (
                  <div key={action.id} className="pro-feed-row">
                    <div className={cn('pro-feed-icon', cls)}>
                      <Icon size={15} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold font-mono text-[var(--pro-text)] truncate">{action.title}</p>
                      <p className="text-[12px] font-mono text-[var(--pro-text-muted)] mt-1 truncate">
                        {action.desc}
                      </p>
                    </div>
                    <div className="text-right shrink-0 min-w-[80px]">
                      <p className="text-[11px] font-mono text-[var(--pro-text-muted)]">{action.time}</p>
                      {action.explorerUrl && action.txHash !== '—' ? (
                        <a
                          href={action.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-[var(--pro-accent)] mt-0.5 hover:underline block"
                        >
                          {action.txHash} ↗
                        </a>
                      ) : (
                        <p className="text-[10px] font-mono text-[var(--pro-text-dim)] mt-0.5">{action.txHash}</p>
                      )}
                      {action.delta !== undefined && action.delta !== 0 && (
                        <p className={cn('text-[13px] font-bold font-mono mt-1', action.delta > 0 ? 'pro-positive' : 'pro-negative')}>
                          {formatDelta(action.delta)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
