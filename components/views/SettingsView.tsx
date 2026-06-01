'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeProvider'
import { useAgent } from '@/context/AgentProvider'
import { ReferralCard } from '@/components/ReferralCard'
import type { Theme } from '@/lib/theme'
import type { AgentState } from '@/types'

const PREFS_KEY = 'pfo-prefs'
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } catch { return {} }
}

interface Props {
  agent: AgentState
  walletLabel?: string | null
}

export function SettingsView({ agent, walletLabel }: Props) {
  const { theme, setTheme } = useTheme()
  const { disconnect, settings } = useAgent()
  const saved = typeof window !== 'undefined' ? loadPrefs() : {}
  const [slippage, setSlippage] = useState<string>(saved.slippage ?? '0.5%')
  const [toggles, setToggles] = useState({ trade: true, recap: true, risk: true, telegram: false, ...saved.toggles })
  const [saved2, setSaved2] = useState(false)

  const agentId = agent.agentIdNumeric ? `#${agent.agentIdNumeric}` : agent.agentId

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Settings</h1>
          <p className="pro-page-sub">ERC-8004 identity, risk parameters, and execution preferences</p>
        </div>
        <button type="button" className="pro-btn" onClick={() => {
          const p = loadPrefs()
          setSlippage(p.slippage ?? '0.5%')
          setToggles({ trade: true, recap: true, risk: true, telegram: false, ...p.toggles })
        }}>Discard changes</button>
        <button type="button" className="pro-btn-primary" onClick={() => {
          localStorage.setItem(PREFS_KEY, JSON.stringify({ slippage, toggles }))
          setSaved2(true)
          setTimeout(() => setSaved2(false), 2000)
        }}>{saved2 ? '✓ Saved' : 'Save settings'}</button>
      </header>

      <div className="pro-scroll p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pro-card bg-[var(--pro-accent)] text-white border-[var(--pro-accent)]">
            <p className="pro-label text-white/50 mb-5">On-chain identity</p>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-3xl">
                🤖
              </div>
            </div>
            <p className="text-center text-[18px] font-semibold mb-1 font-[family-name:var(--font-display)]">
              CFO Agent {agentId}
            </p>
            <p className="text-center text-[12px] text-white/50 mb-5">ERC-8004 Agent Standard</p>
            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-white/50">Reputation score</span>
                <span className="text-[11px] font-semibold text-[var(--pro-positive)]">{agent.repScore}/100</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--pro-positive)] rounded-full" style={{ width: `${agent.repScore}%` }} />
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-[12px] gap-4">
                <span className="text-white/50 shrink-0">Mantle address</span>
                <span className="text-white/90 font-mono text-right truncate">{walletLabel || agent.agentId}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-white/50">Executions</span>
                <span className="text-white/90">{agent.totalExecutions}</span>
              </div>
            </div>
          </div>

          <div className="pro-card">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <h3 className="text-[15px] font-semibold text-[var(--pro-text)]">Risk & strategy</h3>
              <span className="pro-chip pro-chip--active capitalize">{agent.riskProfile}</span>
            </div>
            <p className="text-[12px] text-[var(--pro-text-muted)] mb-5">
              How aggressively the agent pursues yield vs. protection.
            </p>
            <div className="relative mb-5">
              <div className="h-1.5 rounded-full bg-[var(--pro-border)]" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[var(--pro-accent)] border-2 border-white shadow-sm"
                style={{ left: '45%' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Auto-deleverage', desc: 'Reduce size before liquidation' },
                { label: 'Yield harvesting', desc: 'Auto-compound rewards >$20' },
              ].map(opt => (
                <div key={opt.label} className="flex items-start gap-2.5 bg-[var(--pro-surface-muted)] rounded-md p-3 border border-[var(--pro-border)]">
                  <div className="w-5 h-5 rounded bg-[var(--pro-accent)] flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--pro-text)]">{opt.label}</p>
                    <p className="text-[11px] text-[var(--pro-text-muted)]">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card lg:col-span-2">
            <h3 className="text-[15px] font-semibold text-[var(--pro-text)] mb-4">Appearance</h3>
            <div className="pro-theme-row mb-6">
              <div>
                <p className="text-[13px] font-medium text-[var(--pro-text)]">Theme</p>
                <p className="text-[11px] text-[var(--pro-text-muted)] mt-0.5">
                  Light or dark interface
                </p>
              </div>
              <div className="pro-theme-options">
                {(['light', 'dark'] as Theme[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={cn('pro-theme-option capitalize', theme === t && 'pro-theme-option--active')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-[15px] font-semibold text-[var(--pro-text)] mb-5">Execution preferences</h3>
            <div className="mb-6">
              <p className="text-[13px] font-medium text-[var(--pro-text)] mb-2">Slippage tolerance</p>
              <div className="flex gap-2 max-w-sm">
                {['0.1%', '0.5%', '1.0%'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSlippage(v)}
                    className={cn(
                      'flex-1 py-2 rounded-md text-[12px] font-semibold border transition-colors',
                      slippage === v
                        ? 'pro-btn-primary justify-center'
                        : 'pro-btn justify-center',
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[13px] font-medium text-[var(--pro-text)] mb-3">Notifications</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              {(
                [
                  ['trade', 'Trade executions'],
                  ['recap', 'Daily recap'],
                  ['risk', 'Risk warnings'],
                  ['telegram', 'Telegram alerts'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--pro-text-secondary)]">{label}</span>
                  <button
                    type="button"
                    onClick={() => setToggles((p: typeof toggles) => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      'w-9 h-5 rounded-full relative transition-colors',
                      toggles[key] ? 'bg-[var(--pro-accent)]' : 'bg-[var(--pro-border)]',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        toggles[key] ? 'translate-x-4' : 'translate-x-0.5',
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {settings.walletAddress && (
            <div className="pro-card lg:col-span-2">
              <p className="text-[13px] font-semibold text-[var(--pro-text)] mb-3">Refer a Friend</p>
              <ReferralCard
                walletAddress={settings.walletAddress}
                referredBy={settings.referredBy}
              />
            </div>
          )}

          <div className="pro-card lg:col-span-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--pro-text)]">Disconnect &amp; reset</p>
              <p className="text-[11px] text-[var(--pro-text-muted)] mt-0.5">
                Clears all local settings and returns to onboarding.
              </p>
            </div>
            <button
              type="button"
              onClick={disconnect}
              className="pro-btn shrink-0"
              style={{ borderColor: 'var(--pro-negative)', color: 'var(--pro-negative)' }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
