'use client'
import { Shield, ExternalLink, Award } from 'lucide-react'
import { useAgent } from '@/context/AgentProvider'
import { cn } from '@/lib/utils'

function truncateHash(hash?: string) {
  if (!hash) return '—'
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export function ReputationView() {
  const { agent, actions } = useAgent()

  const executions = agent.totalExecutions ?? 0
  const okActions = actions.filter(a => a.type === 'ok').length
  const totalActions = actions.length

  const repScore = Math.min(100, executions * 8 + okActions * 5)
  const winRate = totalActions === 0 ? 100 : Math.round((okActions / totalActions) * 100)

  const scoreBand =
    repScore >= 80 ? 'ELITE'
    : repScore >= 50 ? 'ESTABLISHED'
    : repScore >= 20 ? 'ACTIVE'
    : 'NASCENT'

  const scoreBandColor =
    repScore >= 80 ? 'var(--pro-positive)'
    : repScore >= 50 ? 'var(--pro-accent)'
    : repScore >= 20 ? '#60a5fa'
    : 'var(--pro-text-muted)'

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">On-Chain Reputation</h1>
          <p className="pro-page-sub">Agent identity · Execution history · Trust score</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(255,140,0,0.12)',
            border: '1px solid var(--pro-accent)',
            color: 'var(--pro-accent)',
            borderRadius: 3,
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--pro-accent)] animate-pulse" />
          LIVE ON MANTLE MAINNET
        </div>
      </header>

      <div className="pro-scroll p-5 flex flex-col gap-5">
        {/* Agent identity card */}
        <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-[var(--pro-border)] flex items-center gap-2">
            <Award size={13} strokeWidth={1.75} style={{ color: 'var(--pro-accent)' }} />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--pro-accent)]">
              ERC-8004 Agent Identity
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[var(--pro-border)]">
            {[
              { label: 'Agent ID', value: agent.agentId || '—' },
              { label: 'Executions', value: executions },
              { label: 'Win Rate', value: `${winRate}%` },
              { label: 'Risk Profile', value: agent.riskProfile || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <span className="font-mono text-[18px] font-black text-[var(--pro-accent)]">{value}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--pro-text-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reputation score */}
        <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-[var(--pro-border)] flex items-center gap-2">
            <Shield size={13} strokeWidth={1.75} style={{ color: scoreBandColor }} />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: scoreBandColor }}>
              Reputation Score
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="font-mono text-[48px] font-black leading-none" style={{ color: scoreBandColor }}>
                  {repScore}
                </span>
                <span className="font-mono text-[16px] text-[var(--pro-text-muted)] ml-1">/100</span>
              </div>
              <span
                className="font-mono text-[12px] font-bold px-2 py-1 uppercase tracking-widest"
                style={{
                  background: `${scoreBandColor}22`,
                  border: `1px solid ${scoreBandColor}`,
                  color: scoreBandColor,
                  borderRadius: 3,
                }}
              >
                {scoreBand}
              </span>
            </div>
            {/* Score bar */}
            <div className="w-full h-2 bg-[var(--pro-border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${repScore}%`, background: scoreBandColor }}
              />
            </div>
            <p className="font-mono text-[11px] text-[var(--pro-text-muted)] mt-3">
              Score = executions × 8 + confirmed actions × 5, capped at 100
            </p>
          </div>
        </div>

        {/* Action timeline */}
        <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-[var(--pro-border)] flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--pro-text-secondary)]">
              Execution Timeline
            </span>
            <span className="ml-auto font-mono text-[10px] text-[var(--pro-text-muted)]">{actions.length} entries</span>
          </div>
          {actions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-[12px] text-[var(--pro-text-muted)]">
                No on-chain actions recorded yet.<br />
                Confirm a swap or execution to build your reputation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--pro-border)]">
              {actions.map(action => {
                const dotColor =
                  action.type === 'ok' ? 'var(--pro-positive)'
                  : action.type === 'warn' ? '#ffb347'
                  : action.type === 'exec' ? 'var(--pro-accent)'
                  : 'var(--pro-text-muted)'

                return (
                  <div key={action.id} className="flex items-start gap-3 px-4 py-3">
                    <div
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ background: dotColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[13px] font-bold text-[var(--pro-text)] truncate">{action.title}</p>
                      <p className="font-mono text-[11px] text-[var(--pro-text-muted)] mt-0.5 truncate">{action.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-[10px] text-[var(--pro-text-muted)]">{action.time}</p>
                      {action.explorerUrl && action.txHash && action.txHash !== '—' ? (
                        <a
                          href={action.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-0.5 font-mono text-[10px] mt-0.5 hover:underline',
                            'text-[var(--pro-accent)]',
                          )}
                        >
                          <ExternalLink size={9} strokeWidth={2} />
                          {truncateHash(action.txHashFull ?? action.txHash)}
                        </a>
                      ) : (
                        <p className="font-mono text-[10px] text-[var(--pro-text-muted)] mt-0.5">
                          {truncateHash(action.txHash)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
