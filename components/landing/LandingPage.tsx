'use client'
import { useState, useEffect, useRef } from 'react'

function useCounter(target: number, duration = 2000, start = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let s: number | null = null
    const tick = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration, start])
  return val
}

function Cursor() {
  const [on, setOn] = useState(true)
  useEffect(() => { const id = setInterval(() => setOn(v => !v), 500); return () => clearInterval(id) }, [])
  return <span style={{ opacity: on ? 1 : 0, color: 'var(--pro-accent)' }}>█</span>
}

const LOG_LINES = [
  '> agent.scan()  ·  monitoring 4 positions',
  '> pool.fetch()  ·  MNT-USDC 14.2% APY detected',
  '> risk.check()  ·  exposure within threshold',
  '> rebalance()   ·  moving $420 → MNT-USDC LP',
  '> tx.submit()   ·  0x4f2a...c8d1 confirmed',
  '> yield.harvest()  ·  +$12.40 compounded',
  '> agent.scan()  ·  monitoring 4 positions',
  '> alert.check() ·  no risk triggers',
  '> pool.fetch()  ·  fBTC-mETH 9.8% APY',
  '> compound()    ·  reinvesting $8.20 rewards',
]

function TerminalLog() {
  const [lines, setLines] = useState<string[]>([LOG_LINES[0]])
  const [idx, setIdx] = useState(1)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const id = setInterval(() => {
      setLines(prev => [...prev, LOG_LINES[idx % LOG_LINES.length]].slice(-8))
      setIdx(i => i + 1)
    }, 1400)
    return () => clearInterval(id)
  }, [idx])
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])
  return (
    <div ref={ref} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8, color: 'var(--pro-text-secondary)', overflow: 'hidden', height: 140 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: i === lines.length - 1 ? 'var(--pro-accent)' : 'var(--pro-text-secondary)', opacity: Math.max(0.3, (i + 1) / lines.length), transition: 'opacity 0.4s' }}>
          {l}{i === lines.length - 1 && <Cursor />}
        </div>
      ))}
    </div>
  )
}

interface Props { onLaunch: () => void; onDemo?: () => void }

export function LandingPage({ onLaunch, onDemo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [counted, setCounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function scrollTo(id: string) {
    setMenuOpen(false)
    const container = containerRef.current
    const target = document.getElementById(id)
    if (!container || !target) return
    container.scrollTo({ top: target.offsetTop - 56, behavior: 'smooth' })
  }

  const tvl       = useCounter(2_847_391, 2200, counted)
  const agents    = useCounter(1_247, 1800, counted)
  const execs     = useCounter(8_302, 2000, counted)
  const yieldApy  = useCounter(1240, 1600, counted)

  useEffect(() => { const id = setTimeout(() => setCounted(true), 300); return () => clearTimeout(id) }, [])

  const NAV_LINKS = [
    { label: 'Features', id: 'features' },
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Why Mantle', id: 'why-mantle' },
  ]

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--pro-bg)', color: 'var(--pro-text)',
      fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', zIndex: 10,
    }}>
      {/* Grid bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(var(--pro-border) 1px,transparent 1px),linear-gradient(90deg,var(--pro-border) 1px,transparent 1px)`, backgroundSize: '48px 48px', opacity: 0.25, zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '20%', right: '10%', width: '40vw', height: '40vw', maxWidth: 600, maxHeight: 600, background: 'radial-gradient(circle,rgba(255,140,0,0.07) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,15,20,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--pro-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 clamp(16px,4vw,48px)', height: 56 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: 'var(--pro-accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#000' }}>CFO</div>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--pro-text)', whiteSpace: 'nowrap' }}>Personal CFO Agent</span>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }} className="landing-nav-links">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} style={{ fontSize: 12, color: 'var(--pro-text-muted)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', padding: 0, whiteSpace: 'nowrap' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} className="landing-nav-spacer" />

          {/* Hackathon badge — hidden on small screens */}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pro-accent)', border: '1px solid var(--pro-border-accent)', padding: '3px 8px', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }} className="landing-nav-badge">
            TURING TEST 2026
          </div>

          <button onClick={onLaunch} style={{ background: 'var(--pro-accent)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Launch →
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="landing-hamburger"
            onClick={() => setMenuOpen(v => !v)}
            style={{ background: 'none', border: '1px solid var(--pro-border)', borderRadius: 2, padding: '6px 10px', color: 'var(--pro-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, flexShrink: 0 }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--pro-border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', color: 'var(--pro-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, padding: '10px 8px', textAlign: 'left', cursor: 'pointer', borderRadius: 2 }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(48px,8vw,100px) clamp(16px,6vw,48px) clamp(40px,6vw,80px)', flex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: '1px solid var(--pro-border-accent)', borderRadius: 2, marginBottom: 28, background: 'var(--pro-accent-dim)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pro-positive)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pro-accent)' }}>LIVE ON MANTLE NETWORK · ERC-8004</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,7vw,88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--pro-text)', marginBottom: 20, maxWidth: 900 }}>
          The autonomous CFO<br />
          <span style={{ color: 'var(--pro-accent)' }}>for the next billion.</span>
        </h1>

        <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: 'var(--pro-text-secondary)', lineHeight: 1.7, maxWidth: 560, marginBottom: 40, fontWeight: 400, padding: '0 8px' }}>
          On-chain wealth management that works while you sleep. No DeFi expertise required. Powered by Byreal on Mantle Network.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 60, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px', width: '100%' }}>
          <button onClick={onLaunch} style={{ background: 'var(--pro-accent)', color: '#000', border: 'none', padding: 'clamp(10px,2vw,14px) clamp(20px,4vw,36px)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px,1.5vw,14px)', fontWeight: 800, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase', flex: '1 1 auto', maxWidth: 240 }}>
            Launch App →
          </button>
          <button onClick={onDemo ?? onLaunch} style={{ background: 'transparent', color: 'var(--pro-text-secondary)', border: '1px solid var(--pro-border-strong)', padding: 'clamp(10px,2vw,14px) clamp(20px,4vw,36px)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px,1.5vw,14px)', fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', flex: '1 1 auto', maxWidth: 240 }}>
            ⚡ Try Demo
          </button>
        </div>

        {/* Stats grid — 2 col on mobile, 4 col on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, width: '100%', maxWidth: 800, border: '1px solid var(--pro-border)', borderRadius: 2, overflow: 'hidden', background: 'var(--pro-border)' }}>
          {[
            { label: 'TVL MANAGED',      value: `$${tvl.toLocaleString()}`,         accent: true },
            { label: 'AGENTS ACTIVE',    value: agents.toLocaleString(),             accent: false },
            { label: 'EXECUTIONS TODAY', value: execs.toLocaleString(),              accent: false },
            { label: 'AVG APY',          value: `${(yieldApy / 100).toFixed(1)}%`,  accent: true },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--pro-surface)', padding: 'clamp(16px,3vw,24px) clamp(12px,2vw,20px)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pro-text-muted)', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, letterSpacing: '-0.03em', color: s.accent ? 'var(--pro-accent)' : 'var(--pro-text)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Terminal preview — hidden on mobile to save space ── */}
      <section id="how-it-works" className="landing-terminal-section" style={{ position: 'relative', zIndex: 1, padding: '0 clamp(16px,4vw,48px) clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', border: '1px solid var(--pro-border)', borderRadius: 3, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--pro-surface)', borderBottom: '1px solid var(--pro-border)' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--pro-text-muted)' }}>personal-cfo-agent · dashboard</span>
          </div>
          <div style={{ display: 'flex', height: 380, background: 'var(--pro-bg)', overflowX: 'auto' }}>
            <div style={{ width: 52, flexShrink: 0, background: 'var(--pro-surface)', borderRight: '1px solid var(--pro-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: 'var(--pro-accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#000', marginBottom: 8 }}>CFO</div>
              {['▦','◉','∿','⬡','⚙'].map((icon, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: i === 0 ? 'var(--pro-accent)' : 'var(--pro-text-dim)', background: i === 0 ? 'var(--pro-accent-dim)' : 'transparent', borderLeft: i === 0 ? '2px solid var(--pro-accent)' : 'none' }}>{icon}</div>
              ))}
            </div>
            <div style={{ width: 200, flexShrink: 0, background: 'var(--pro-surface)', borderRight: '1px solid var(--pro-border)', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pro-accent)', marginBottom: 4 }}>NET WORTH</div>
                <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--pro-text)' }}>$48,291</div>
                <div style={{ fontSize: 11, color: 'var(--pro-positive)', fontWeight: 700, marginTop: 3 }}>▲ +$1,240 · 7D</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pro-accent)', marginBottom: 6 }}>POSITIONS</div>
                {[['MNT-USDC LP','+12.4%'],['mETH Vault','+8.1%'],['BTC Perp','+3.2%']].map(([n,p]) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', marginBottom: 3, border: '1px solid var(--pro-border)', borderRadius: 2, background: 'var(--pro-bg)' }}>
                    <span style={{ fontSize: 10, color: 'var(--pro-text)' }}>{n}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pro-positive)' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 200 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--pro-border)', background: 'var(--pro-surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--pro-text)' }}>Portfolio Overview</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pro-positive)', padding: '2px 6px', border: '1px solid rgba(0,196,122,0.2)', borderRadius: 2, background: 'var(--pro-positive-soft)' }}>● ACTIVE</span>
              </div>
              <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ flex: 1, border: '1px solid var(--pro-border)', borderRadius: 2, background: 'var(--pro-surface)', padding: '10px 14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pro-text-muted)', marginBottom: 2 }}>7-DAY RETURN</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--pro-positive)', letterSpacing: '-0.02em' }}>+$1,240 <span style={{ fontSize: 13 }}>+2.6%</span></div>
                  <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }} preserveAspectRatio="none" viewBox="0 0 400 50">
                    <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--pro-accent)" stopOpacity="0.2" /><stop offset="100%" stopColor="var(--pro-accent)" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0,40 C60,36 100,28 150,22 C200,16 250,24 300,14 C350,6 380,9 400,3" fill="none" stroke="var(--pro-accent)" strokeWidth="1.5" />
                    <path d="M0,40 C60,36 100,28 150,22 C200,16 250,24 300,14 C350,6 380,9 400,3 L400,50 L0,50Z" fill="url(#lg2)" />
                  </svg>
                </div>
              </div>
            </div>
            <div style={{ width: 220, flexShrink: 0, background: 'var(--pro-surface)', borderLeft: '1px solid var(--pro-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--pro-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, background: 'var(--pro-accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#000' }}>AI</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pro-text)' }}>CFO Agent</span>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', overflow: 'hidden' }}><TerminalLog /></div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--pro-border)' }}>
                <div style={{ display: 'flex', gap: 5, padding: '7px 10px', border: '1px solid var(--pro-border)', borderRadius: 2, background: 'var(--pro-bg)' }}>
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--pro-text-muted)' }}>Ask your CFO agent…</span>
                  <div style={{ width: 20, height: 20, background: 'var(--pro-accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000' }}>▶</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '0 clamp(16px,4vw,48px) clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pro-accent)', marginBottom: 10 }}>BUILT FOR HUMANS, POWERED BY DEFI</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--pro-text)' }}>Everything a CFO does,<br />running autonomously on-chain.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { tag: 'EXECUTE', icon: '⚡', title: 'Autonomous Execution', desc: 'Swap, LP, and perp positions executed via Byreal Skills on Mantle. Natural language in, on-chain transaction out.', items: ['Swap execution', 'CLMM LP management', 'Perpetual futures', 'Auto-compounding'] },
              { tag: 'PROTECT', icon: '🛡', title: 'Risk Intelligence', desc: 'Conservative, balanced, or aggressive profiles. Hard position limits. Automatic deleveraging before liquidation.', items: ['Position size limits', 'Liquidation prevention', 'Exposure monitoring', 'Self-correction loops'] },
              { tag: 'IDENTITY', icon: '🔗', title: 'On-Chain Reputation', desc: 'ERC-8004 agent NFT minted on deploy. Every execution updates your verifiable track record — permanently on Mantle.', items: ['ERC-8004 standard', 'Verifiable history', 'Performance score', 'Reputation as collateral'] },
            ].map(f => (
              <div key={f.tag} style={{ border: '1px solid var(--pro-border)', borderTop: '3px solid var(--pro-accent)', borderRadius: 2, padding: 'clamp(20px,3vw,28px) clamp(16px,3vw,24px)', background: 'var(--pro-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pro-accent)', marginBottom: 2 }}>{f.tag}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--pro-text)' }}>{f.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--pro-text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>{f.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {f.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--pro-text-muted)' }}>
                      <span style={{ color: 'var(--pro-accent)', fontWeight: 900 }}>·</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="why-mantle" style={{ position: 'relative', zIndex: 1, margin: '0 clamp(16px,4vw,48px) clamp(48px,6vw,80px)', border: '1px solid var(--pro-border-accent)', borderLeft: '4px solid var(--pro-accent)', borderRadius: 2, padding: 'clamp(24px,4vw,40px) clamp(20px,4vw,48px)', background: 'var(--pro-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pro-accent)', marginBottom: 8 }}>TURING TEST HACKATHON 2026 · AGENTIC ECONOMY TRACK</div>
          <h3 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--pro-text)', marginBottom: 6 }}>Start in 60 seconds.</h3>
          <p style={{ fontSize: 14, color: 'var(--pro-text-secondary)', lineHeight: 1.6 }}>No DeFi knowledge needed. No minimum deposit. Works with or without a wallet.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onLaunch} style={{ background: 'var(--pro-accent)', color: '#000', border: 'none', padding: '14px 32px', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Launch App →
          </button>
          <button onClick={onDemo ?? onLaunch} style={{ background: 'transparent', color: 'var(--pro-text-secondary)', border: '1px solid var(--pro-border-strong)', padding: '14px 28px', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ⚡ Try Demo
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--pro-border)', padding: 'clamp(16px,3vw,20px) clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'var(--pro-accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#000' }}>CFO</div>
          <span style={{ fontSize: 12, color: 'var(--pro-text-muted)' }}>Personal CFO Agent · v1.0</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['Mantle Network', 'Byreal', 'ERC-8004', 'Gemini AI'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--pro-text-dim)' }}>{t}</span>
          ))}
        </div>
      </footer>

      {/* ── Landing page responsive styles ── */}
      <style>{`
        .landing-hamburger { display: none; }
        @media (max-width: 767px) {
          .landing-nav-links { display: none !important; }
          .landing-nav-badge { display: none !important; }
          .landing-nav-spacer { display: none !important; }
          .landing-hamburger { display: block !important; }
          .landing-terminal-section { display: none; }
        }
        @media (min-width: 768px) {
          .landing-hamburger { display: none !important; }
        }
      `}</style>
    </div>
  )
}
