'use client'
import { useEffect, useRef, useState } from 'react'
import { Zap, Shield, TrendingUp, Activity, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgent } from '@/context/AgentProvider'

interface LogLine {
  id: number
  text: string
  kind: 'scan' | 'exec' | 'ok' | 'warn'
}

function pulse(kind: LogLine['kind']) {
  if (kind === 'ok') return 'text-[var(--pro-positive)]'
  if (kind === 'exec') return 'text-[var(--pro-accent)]'
  if (kind === 'warn') return 'text-[#ffb347]'
  return 'text-[var(--pro-text-muted)]'
}

export function AutonomyPanel() {
  const { mode, setMode, portfolio, agent, actions } = useAgent()
  const active = mode === 'Auto'

  const [lines, setLines] = useState<LogLine[]>([])
  const [uptime, setUptime] = useState(0)
  const lastPriceRef = useRef<number | null>(null)
  const uptimeRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Uptime counter
  useEffect(() => {
    if (!active) {
      setUptime(0)
      if (uptimeRef.current) clearInterval(uptimeRef.current)
      return
    }
    uptimeRef.current = setInterval(() => setUptime(s => s + 1), 1000)
    return () => { if (uptimeRef.current) clearInterval(uptimeRef.current) }
  }, [active])

  // Price polling every 30s
  useEffect(() => {
    if (!active) return

    const addLog = (text: string, kind: LogLine['kind']) => {
      setLines(prev => [...prev.slice(-14), { id: Date.now() + Math.random(), text, kind }])
    }

    addLog(`Auto mode activated — monitoring portfolio ($${portfolio.totalValue.toFixed(2)})`, 'ok')

    const checkPrice = async () => {
      try {
        const res = await fetch('/api/prices')
        const data = await res.json() as Record<string, number>
        const mntPrice = data['MNT'] ?? null

        if (mntPrice === null) {
          addLog('Price feed unavailable — retrying…', 'warn')
          return
        }

        if (lastPriceRef.current !== null) {
          const changePct = ((mntPrice - lastPriceRef.current) / lastPriceRef.current) * 100
          if (Math.abs(changePct) >= 0.5) {
            const dir = changePct > 0 ? '+' : ''
            addLog(
              `MNT moved ${dir}${changePct.toFixed(2)}% — monitoring for rebalance trigger`,
              changePct > 0 ? 'ok' : 'warn',
            )
          } else {
            addLog(`MNT stable at $${mntPrice.toFixed(4)} — no action needed`, 'scan')
          }
        } else {
          addLog(`MNT price: $${mntPrice.toFixed(4)} — baseline set`, 'scan')
        }
        lastPriceRef.current = mntPrice
      } catch {
        addLog('Price check failed — network error', 'warn')
      }
    }

    checkPrice()
    const id = setInterval(checkPrice, 30_000)
    return () => clearInterval(id)
  }, [active, portfolio.totalValue])

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const execCount = agent.totalExecutions ?? portfolio.executions ?? 0

  return (
    <div
      className={cn(
        'flex flex-col gap-0 border border-[var(--pro-border)] bg-[var(--pro-surface)]',
        'transition-opacity duration-300',
        active ? 'opacity-100' : 'opacity-70',
      )}
      style={{ borderRadius: 3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--pro-border)]">
        <Activity
          size={13}
          strokeWidth={2}
          className={cn(active ? 'text-[var(--pro-positive)]' : 'text-[var(--pro-text-muted)]')}
        />
        <span className="font-mono text-[11px] font-bold text-[var(--pro-text)] flex-1 uppercase tracking-wide">
          Agent Brain
        </span>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={() => setMode(active ? 'Chat' : 'Auto')}
          title={active ? 'Switch to Chat mode' : 'Enable Auto mode'}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          <div
            className={cn(
              'relative w-8 h-4 rounded-full transition-colors duration-200',
              active ? 'bg-[var(--pro-positive)]' : 'bg-[var(--pro-border)]',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200',
                active ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </div>
          <span
            className={cn(
              'font-mono text-[10px] px-1.5 py-0.5 uppercase tracking-wider',
              active
                ? 'bg-[var(--pro-positive)] text-black'
                : 'bg-[var(--pro-border)] text-[var(--pro-text-muted)]',
            )}
            style={{ borderRadius: 2 }}
          >
            {active ? 'LIVE' : 'IDLE'}
          </span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-b border-[var(--pro-border)]">
        {[
          { icon: Zap, label: 'Executions', value: execCount },
          { icon: TrendingUp, label: 'Uptime', value: active ? fmt(uptime) : '--:--' },
          { icon: Shield, label: 'Actions', value: actions.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-2 gap-0.5 border-r border-[var(--pro-border)] last:border-r-0">
            <Icon size={11} strokeWidth={2} className="text-[var(--pro-text-muted)]" />
            <span className="font-mono text-[13px] font-black text-[var(--pro-accent)]">{value}</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--pro-text-muted)]">{label}</span>
          </div>
        ))}
      </div>

      {/* Log lines */}
      <div className="px-3 py-2 flex flex-col gap-1 min-h-[120px]">
        {lines.length === 0 && (
          <p className="font-mono text-[10px] text-[var(--pro-text-muted)] mt-2">
            {active ? 'Initializing agent…' : 'Toggle Auto mode to activate agent…'}
          </p>
        )}
        {lines.map((l, i) => (
          <div
            key={l.id}
            className={cn(
              'flex items-start gap-1.5 font-mono text-[10px] leading-relaxed transition-opacity duration-500',
              i === lines.length - 1 ? 'opacity-100' : 'opacity-60',
              pulse(l.kind),
            )}
          >
            {l.kind === 'ok' ? (
              <CheckCircle2 size={9} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--pro-positive)]" />
            ) : (
              <span className="mt-0.5 w-2 text-center shrink-0">›</span>
            )}
            <span>{l.text}</span>
            {i === lines.length - 1 && active && (
              <span className="animate-pulse text-[var(--pro-accent)]">█</span>
            )}
          </div>
        ))}
      </div>

      {/* Portfolio value footer */}
      {active && (
        <div className="px-3 py-2 border-t border-[var(--pro-border)] flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--pro-text-muted)] uppercase tracking-wider">Portfolio</span>
          <span className="font-mono text-[11px] font-bold text-[var(--pro-accent)]">
            ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  )
}
