'use client'
import { useState, useEffect, useRef } from 'react'
import { riskLabel, saveSettings } from '@/lib/storage'
import { useAgent } from '@/context/AgentProvider'
import type { RiskProfile } from '@/types'

const STEPS = ['INIT', 'WALLET', 'RISK', 'GOALS', 'DEPLOY'] as const

const GOALS = [
  { id: 'grow',  label: 'Grow savings steadily',          tag: 'LOW RISK' },
  { id: 'yield', label: 'Maximize yield safely',           tag: 'MED RISK' },
  { id: 'defi',  label: 'Explore DeFi gradually',          tag: 'LEARNING' },
  { id: 'auto',  label: 'Auto-rebalance while I sleep',    tag: 'PASSIVE'  },
]

const RISKS: { id: RiskProfile; label: string; desc: string; color: string; pct: number }[] = [
  { id: 'conservative', label: 'CONSERVATIVE', desc: 'Stable yield, minimal perps exposure',              color: 'var(--pro-positive)', pct: 25 },
  { id: 'balanced',     label: 'BALANCED',     desc: 'Mix of LP, RWA, and limited directional risk',      color: 'var(--pro-accent)',   pct: 55 },
  { id: 'aggressive',   label: 'AGGRESSIVE',   desc: 'Higher yield targets, active position management',  color: 'var(--pro-negative)', pct: 85 },
]

/* ── Live ticker numbers on the left panel ── */
const TICKERS = [
  { sym: 'MNT/USDC', val: '0.7841', chg: '+1.24%', up: true  },
  { sym: 'ETH/USDC', val: '3,421',  chg: '+0.87%', up: true  },
  { sym: 'BTC/USDC', val: '67,204', chg: '-0.33%', up: false },
  { sym: 'USDT/MNT', val: '1.2742', chg: '+0.02%', up: true  },
]

/* tiny hook: counter animation */
function useCount(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return val
}

/* blinking cursor */
function Cursor() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 530)
    return () => clearInterval(id)
  }, [])
  return <span style={{ opacity: on ? 1 : 0, color: 'var(--pro-accent)' }}>▋</span>
}

/* ── Left panel content per step ── */
function LeftPanel({ step, risk }: { step: number; risk: RiskProfile }) {
  const tvl   = useCount(step >= 1 ? 2_847_391 : 0)
  const yield_ = useCount(step >= 2 ? 1247 : 0)

  return (
    <div style={{
      flex: '0 0 45%',
      background: 'var(--pro-surface)',
      borderRight: '1px solid var(--pro-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(var(--pro-border) 1px, transparent 1px),
                          linear-gradient(90deg, var(--pro-border) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.35,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--pro-accent)', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '-0.02em',
          }}>CFO</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--pro-text)', letterSpacing: '0.08em' }}>PERSONAL CFO AGENT</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--pro-text-muted)', letterSpacing: '0.06em' }}>MANTLE NETWORK · ERC-8004</div>
          </div>
        </div>

        {/* Step 0: Hero headline */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', marginBottom: 20, textTransform: 'uppercase' }}>
              Autonomous wealth management
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 900, lineHeight: 1.0, color: 'var(--pro-text)', letterSpacing: '-0.03em', marginBottom: 24 }}>
              Your<br />money.<br />24/7.
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--pro-text-secondary)', lineHeight: 1.7, maxWidth: 320 }}>
              On-chain CFO agent that monitors, rebalances, and grows your portfolio — autonomously, on Mantle.
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['YIELD FARMING', 'AUTO LP', 'RISK ENGINE', 'NL EXECUTION'].map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                  padding: '4px 8px', border: '1px solid var(--pro-border)', color: 'var(--pro-text-muted)',
                  borderRadius: 1,
                }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Wallet — live ticker feed */}
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-text-muted)', letterSpacing: '0.1em', marginBottom: 20 }}>
              LIVE MARKET · MANTLE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--pro-border)', borderRadius: 2, overflow: 'hidden' }}>
              {TICKERS.map((t, i) => (
                <div key={t.sym} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: i < TICKERS.length - 1 ? '1px solid var(--pro-border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--pro-text)' }}>{t.sym}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pro-text)' }}>{t.val}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: t.up ? 'var(--pro-positive)' : 'var(--pro-negative)' }}>{t.chg}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pro-text-muted)' }}>
              <Cursor /> Connecting to Mantle RPC…
            </div>
          </div>
        )}

        {/* Step 2: Risk — animated risk meter */}
        {step === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
              RISK / RETURN SPECTRUM
            </div>
            {RISKS.map(r => (
              <div key={r.id} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: r.color }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pro-text-muted)' }}>{r.pct}% exposure</span>
                </div>
                <div style={{ height: 4, background: 'var(--pro-border)', borderRadius: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${r.pct}%`, background: r.color,
                    transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '12px 14px', border: '1px solid var(--pro-border)', borderLeft: '3px solid var(--pro-accent)', borderRadius: 2, background: 'var(--pro-accent-dim)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--pro-text-muted)', marginBottom: 4 }}>PROJECTED APY</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 900, color: 'var(--pro-accent)', letterSpacing: '-0.02em' }}>
                {yield_ / 100}%
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals — portfolio allocation preview */}
        {step === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
              STRATEGY ALLOCATION
            </div>
            {[
              { label: 'Stable LP',     pct: 40, color: 'var(--pro-positive)' },
              { label: 'RWA Bonds',     pct: 25, color: 'var(--pro-accent)'   },
              { label: 'Perp Hedges',   pct: 20, color: '#6b9aff'             },
              { label: 'Cash Reserve',  pct: 15, color: 'var(--pro-text-dim)' },
            ].map(a => (
              <div key={a.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pro-text-secondary)' }}>{a.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: a.color }}>{a.pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--pro-border)' }}>
                  <div style={{ height: '100%', width: `${a.pct}%`, background: a.color, transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Deploy — TVL counter */}
        {step === 4 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-text-muted)', letterSpacing: '0.1em', marginBottom: 16 }}>
              PLATFORM STATS
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pro-text-muted)', marginBottom: 4 }}>TOTAL VALUE MANAGED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 900, color: 'var(--pro-accent)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                ${tvl.toLocaleString()}
              </div>
            </div>
            {[
              { label: 'ACTIVE AGENTS',  val: '1,247' },
              { label: 'AVG APY',        val: '12.4%' },
              { label: 'EXECUTIONS / DAY', val: '8,302' },
              { label: 'UPTIME',         val: '99.97%' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--pro-border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pro-text-muted)' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--pro-text)' }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom step dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 3, flex: i === step ? 3 : 1,
              background: i <= step ? 'var(--pro-accent)' : 'var(--pro-border)',
              borderRadius: 0, transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Animated step wrapper ── */
function StepPane({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const id = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(id)
  }, [stepKey])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {children}
    </div>
  )
}

/* ── Main export ── */
export function OnboardingFlow() {
  const { completeOnboarding, wallet, identityMinting } = useAgent()
  const [step, setStep]             = useState(0)
  const [risk, setRisk]             = useState<RiskProfile>('balanced')
  const [goals, setGoals]           = useState<string[]>(['grow'])
  const [autoExecute, setAutoExecute] = useState(false)

  const next   = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back   = () => setStep(s => Math.max(s - 1, 0))
  const finish = () => {
    void completeOnboarding({
      riskProfile: risk,
      goals: goals.map(id => GOALS.find(g => g.id === id)?.label ?? id),
      autoExecute,
      walletAddress: wallet.address || undefined,
    })
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--pro-bg)', color: 'var(--pro-text)', overflow: 'hidden' }}>
      <style>{`
        .ob-left { display: flex; flex: 0 0 45%; }
        .ob-form { padding: 48px 52px; }
        .ob-heading { font-size: 36px; }
        .ob-hero { font-size: 42px; }
        .ob-step-label { display: inline; }
        .ob-grid2 { grid-template-columns: 1fr 1fr; }
        @media (max-width: 767px) {
          .ob-left { display: none !important; }
          .ob-form { padding: clamp(20px, 5vw, 40px) clamp(16px, 5vw, 40px); }
          .ob-heading { font-size: clamp(22px, 6vw, 32px); }
          .ob-hero { font-size: clamp(24px, 7vw, 36px); }
          .ob-step-label { display: none; }
          .ob-grid2 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: '1px solid var(--pro-border)',
        background: 'var(--pro-surface)',
        height: 42, flexShrink: 0,
      }}>
        {/* Step breadcrumb fills the bar */}
        {STEPS.map((name, i) => (
          <div key={name} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: '100%', position: 'relative',
            borderRight: i < STEPS.length - 1 ? '1px solid var(--pro-border)' : 'none',
            background: i === step ? 'var(--pro-accent-dim)' : 'transparent',
            transition: 'background 0.25s ease',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              color: i === step ? 'var(--pro-accent)' : i < step ? 'var(--pro-positive)' : 'var(--pro-text-dim)',
            }}>
              {i < step ? '✓' : `${i + 1}`}
              <span className="ob-step-label"> {name}</span>
            </span>
            {/* Active underline */}
            {i === step && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: 'var(--pro-accent)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Body: left panel + right form ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div className="ob-left">
          <LeftPanel step={step} risk={risk} />
        </div>

        {/* Right: form area */}
        <div className="ob-form" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          background: 'var(--pro-bg)',
        }}>
          <StepPane stepKey={step}>

            {/* ── Step 0: Welcome ── */}
            {step === 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Step 1 of 5 · Welcome
                </div>
                <h1 className="ob-hero" style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, lineHeight: 1.05, color: 'var(--pro-text)', letterSpacing: '-0.025em', marginBottom: 20 }}>
                  Meet your<br />autonomous CFO.
                </h1>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--pro-text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
                  An on-chain agent that monitors risk, harvests yield, and executes trades — all without lifting a finger.
                </p>

                <div className="ob-grid2" style={{ display: 'grid', gap: 10, marginBottom: 40 }}>
                  {[
                    { icon: '⚡', title: 'Autonomous execution', desc: 'Trades fire on your behalf' },
                    { icon: '🛡', title: 'Risk guardrails',       desc: 'Hard limits, always enforced' },
                    { icon: '📈', title: 'Yield optimization',    desc: 'LP + farming, compounded' },
                    { icon: '🔗', title: 'On-chain identity',     desc: 'ERC-8004 agent passport' },
                  ].map(f => (
                    <div key={f.title} style={{
                      padding: '16px 18px',
                      border: '1px solid var(--pro-border)',
                      borderLeft: '2px solid var(--pro-accent)',
                      borderRadius: 2,
                      background: 'var(--pro-surface)',
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--pro-text)', marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pro-text-muted)' }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                <button onClick={next} style={btnPrimary}>
                  GET STARTED →
                </button>
              </div>
            )}

            {/* ── Step 1: Wallet ── */}
            {step === 1 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Step 2 of 5 · Wallet
                </div>
                <h2 className="ob-heading" style={heading}>Connect your wallet.</h2>
                <p style={sub}>MetaMask or WalletConnect on Mantle Network (chain ID 5000).</p>

                <div style={{ ...dataBlock, marginBottom: 28 }}>
                  {[
                    { label: 'STATUS',  val: wallet.shortAddress ? '● CONNECTED' : '○ DISCONNECTED', color: wallet.shortAddress ? 'var(--pro-positive)' : 'var(--pro-text-dim)' },
                    { label: 'ADDRESS', val: wallet.shortAddress || '—',    color: 'var(--pro-text)' },
                    { label: 'NETWORK', val: 'Mantle (5000)',                color: 'var(--pro-text)' },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--pro-border)' : 'none' }}>
                      <span style={dataLabel}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: row.color }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={async () => { const acc = await wallet.connect(); if (acc) saveSettings({ walletAddress: acc }); next() }}
                  disabled={wallet.connecting}
                  style={{ ...btnPrimary, opacity: wallet.connecting ? 0.6 : 1, marginBottom: 12 }}
                >
                  {wallet.connecting ? 'CONNECTING…' : wallet.shortAddress ? 'CONTINUE →' : 'CONNECT METAMASK'}
                </button>
                {wallet.error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pro-negative)', marginBottom: 8 }}>ERR: {wallet.error}</div>}
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={back}  style={btnGhost}>← Back</button>
                  <button onClick={next}  style={btnGhost}>Skip (demo mode)</button>
                </div>
              </div>
            )}

            {/* ── Step 2: Risk ── */}
            {step === 2 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Step 3 of 5 · Risk profile
                </div>
                <h2 className="ob-heading" style={heading}>How aggressive?</h2>
                <p style={sub}>Sets position size limits and strategy constraints. Adjustable later.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                  {RISKS.map(r => {
                    const on = risk === r.id
                    return (
                      <button key={r.id} onClick={() => setRisk(r.id)} style={{
                        textAlign: 'left', padding: '18px 20px', cursor: 'pointer',
                        border: `1px solid ${on ? r.color : 'var(--pro-border)'}`,
                        borderLeft: `4px solid ${on ? r.color : 'var(--pro-border)'}`,
                        borderRadius: 2,
                        background: on ? 'var(--pro-surface)' : 'transparent',
                        transition: 'all 0.18s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: on ? r.color : 'var(--pro-text)', letterSpacing: '0.04em' }}>{r.label}</span>
                          {on && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: r.color }}>● SELECTED</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--pro-text-muted)' }}>{r.desc}</div>
                      </button>
                    )
                  })}
                </div>

                <button onClick={next} style={{ ...btnPrimary, marginBottom: 12 }}>CONFIRM PROFILE →</button>
                <button onClick={back} style={btnGhost}>← Back</button>
              </div>
            )}

            {/* ── Step 3: Goals ── */}
            {step === 3 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Step 4 of 5 · Objectives
                </div>
                <h2 className="ob-heading" style={heading}>What are you optimizing for?</h2>
                <p style={sub}>Select all that apply. Informs how the agent weights strategies.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                  {GOALS.map(g => {
                    const on = goals.includes(g.id)
                    return (
                      <button key={g.id} onClick={() => setGoals(prev => on ? prev.filter(x => x !== g.id) : [...prev, g.id])} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        textAlign: 'left', padding: '16px 20px', cursor: 'pointer',
                        border: `1px solid ${on ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                        borderLeft: `4px solid ${on ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                        borderRadius: 2,
                        background: on ? 'var(--pro-surface)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}>
                        <div style={{
                          width: 18, height: 18, flexShrink: 0,
                          border: `1px solid ${on ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                          background: on ? 'var(--pro-accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900, color: '#000',
                          borderRadius: 1,
                        }}>{on ? '✓' : ''}</div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: on ? 'var(--pro-text)' : 'var(--pro-text-secondary)', flex: 1 }}>{g.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: on ? 'var(--pro-accent)' : 'var(--pro-text-dim)' }}>{g.tag}</span>
                      </button>
                    )
                  })}
                </div>

                <button onClick={next} style={{ ...btnPrimary, marginBottom: 12 }}>SET OBJECTIVES →</button>
                <button onClick={back} style={btnGhost}>← Back</button>
              </div>
            )}

            {/* ── Step 4: Deploy ── */}
            {step === 4 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--pro-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Step 5 of 5 · Deploy
                </div>
                <h2 className="ob-heading" style={heading}>Ready to deploy.</h2>
                <p style={sub}>Review your configuration then mint your ERC-8004 on-chain identity.</p>

                <div style={{ ...dataBlock, marginBottom: 24 }}>
                  {[
                    { label: 'WALLET',        val: wallet.shortAddress || 'Demo mode' },
                    { label: 'RISK PROFILE',  val: riskLabel(risk).toUpperCase() },
                    { label: 'OBJECTIVES',    val: `${goals.length} selected` },
                    { label: 'NETWORK',       val: 'Mantle (5000)' },
                    { label: 'STANDARD',      val: 'ERC-8004' },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--pro-border)' : 'none' }}>
                      <span style={dataLabel}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--pro-text)' }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setAutoExecute(p => !p)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', textAlign: 'left', padding: '16px 20px', cursor: 'pointer',
                  border: `1px solid ${autoExecute ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                  borderLeft: `4px solid ${autoExecute ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                  borderRadius: 2,
                  background: autoExecute ? 'var(--pro-surface)' : 'transparent',
                  marginBottom: 28, transition: 'all 0.15s ease',
                }}>
                  <div style={{
                    width: 18, height: 18, flexShrink: 0,
                    border: `1px solid ${autoExecute ? 'var(--pro-accent)' : 'var(--pro-border)'}`,
                    background: autoExecute ? 'var(--pro-accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900, color: '#000', borderRadius: 1,
                  }}>{autoExecute ? '✓' : ''}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pro-text)', marginBottom: 3 }}>Enable Auto Mode</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pro-text-muted)' }}>Autonomous execution without per-trade confirmation</div>
                  </div>
                </button>

                <button onClick={finish} disabled={identityMinting} style={{ ...btnPrimary, opacity: identityMinting ? 0.6 : 1, marginBottom: 12 }}>
                  {identityMinting ? 'MINTING IDENTITY…' : 'DEPLOY AGENT →'}
                </button>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={back} style={btnGhost}>← Back</button>
                  <button onClick={() => {
                    void completeOnboarding({ riskProfile: risk, goals: goals.map(id => GOALS.find(g => g.id === id)?.label ?? id), autoExecute, walletAddress: wallet.address || undefined, skipIdentity: true })
                  }} style={{ ...btnGhost, marginLeft: 'auto' }}>Skip NFT mint →</button>
                </div>
              </div>
            )}

          </StepPane>
        </div>
      </div>
    </div>
  )
}

/* ── Shared style tokens ── */
const heading: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontWeight: 900,
  lineHeight: 1.1, color: 'var(--pro-text)', letterSpacing: '-0.02em',
  marginBottom: 14,
}
const sub: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--pro-text-secondary)',
  lineHeight: 1.65, marginBottom: 32, maxWidth: 420,
}
const dataBlock: React.CSSProperties = {
  border: '1px solid var(--pro-border)', borderRadius: 2,
  background: 'var(--pro-surface)', padding: '0 18px',
}
const dataLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.08em', color: 'var(--pro-text-muted)',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', padding: '14px 24px',
  background: 'var(--pro-accent)', color: '#000',
  border: 'none', borderRadius: 2, cursor: 'pointer',
  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  transition: 'background 0.15s ease',
}
const btnGhost: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pro-text-muted)',
  padding: '6px 0', letterSpacing: '0.04em',
}
