'use client'
import { useState } from 'react'
import { BookOpen, ChevronRight, ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  duration: string
  tag: string
  tagColor: string
  steps: { heading: string; body: string; tip?: string; command?: string }[]
}

const LESSONS: Lesson[] = [
  {
    id: 'what-is-swap',
    title: 'What is a swap and how do I make money?',
    duration: '3 min',
    tag: 'Beginner',
    tagColor: 'var(--pro-positive)',
    steps: [
      {
        heading: 'What is a token swap?',
        body: 'A swap exchanges one crypto token for another at the current market rate — like changing dollars to euros, but instantly and on-chain. On Mantle you can swap MNT ↔ USDC, MNT ↔ mETH, and more.',
      },
      {
        heading: 'How do you profit from swapping?',
        body: 'ROI from swaps comes in three ways:\n\n• **Buy low, sell high** — swap into MNT when the price dips, swap back to USDC when it rises\n• **Stablecoin safety** — swap into USDC to lock in profits before a market dip\n• **Yield farming** — swap into yield-bearing assets like mETH that earn passive interest',
      },
      {
        heading: 'Try your first swap',
        body: 'Tell the CFO Agent exactly what you want. It finds the best price automatically via OpenOcean, shows you the quote, and executes when you confirm.',
        tip: 'Start small — try $1–$5 to learn the flow before committing larger amounts.',
        command: 'Swap $5 of MNT to USDC',
      },
    ],
  },
  {
    id: 'buy-the-dip',
    title: 'Buy the dip strategy — timing your entries',
    duration: '4 min',
    tag: 'Strategy',
    tagColor: 'var(--pro-accent)',
    steps: [
      {
        heading: 'What is "buying the dip"?',
        body: 'When MNT (or any token) drops in price, that can be an opportunity to buy more at a discount — expecting the price to recover. This is one of the most common crypto trading strategies.',
      },
      {
        heading: 'How to execute it with your CFO Agent',
        body: 'Keep some USDC in your wallet as "dry powder" (spare cash). When MNT drops, swap USDC → MNT to buy more. When MNT recovers, swap MNT → USDC to lock in the gain.',
        tip: 'Never go 100% into one asset. Keep at least 30% in stablecoins so you can always buy a dip.',
        command: 'Swap $20 of USDC to MNT',
      },
      {
        heading: 'Taking profits',
        body: 'Profit only exists when you sell. After a price run-up, swap a portion back to USDC to "lock in" the gain. You don\'t have to sell everything — selling 50% is a common approach.',
        command: 'Swap $30 of MNT to USDC',
      },
      {
        heading: 'Risk management',
        body: 'Only invest what you can afford to lose. Crypto is volatile — a "dip" can become a much larger drop. The CFO Agent will show you your risk profile and help you stay balanced.',
        command: 'What is my current risk exposure?',
      },
    ],
  },
  {
    id: 'yield-farming',
    title: 'Earning passive income with yield',
    duration: '5 min',
    tag: 'Yield',
    tagColor: '#7c3aed',
    steps: [
      {
        heading: 'What is yield?',
        body: 'Yield is interest earned on your crypto — similar to a savings account, but usually much higher rates. On Mantle, assets like mETH (staked ETH) earn yield automatically just by holding them.',
      },
      {
        heading: 'mETH — staked ETH on Mantle',
        body: 'mETH is ETH that has been staked to help secure the Ethereum network. In return, holders earn staking rewards (~4–6% APR). You get rewards every day just for holding mETH in your wallet — no extra steps needed.',
        tip: 'mETH is generally considered lower risk than MNT because it\'s backed by ETH, a large-cap asset.',
        command: 'What is the current mETH yield?',
      },
      {
        heading: 'How to start earning yield',
        body: 'Simply swap some of your MNT or USDC into mETH. From that moment, your balance grows daily as staking rewards accrue. Swap back to USDC whenever you want to exit.',
        command: 'Swap $10 of MNT to mETH',
      },
      {
        heading: 'Compounding your yield',
        body: 'Compounding means reinvesting your earnings so they also earn yield. Over time this grows exponentially. Ask the CFO Agent to auto-compound your yield positions.',
        command: 'Auto-compound my yield positions',
      },
    ],
  },
  {
    id: 'rebalancing',
    title: 'Portfolio rebalancing — staying on target',
    duration: '4 min',
    tag: 'Strategy',
    tagColor: 'var(--pro-accent)',
    steps: [
      {
        heading: 'Why rebalance?',
        body: 'When markets move, your portfolio allocation drifts away from your target. For example, if MNT doubles in price, it may now be 80% of your portfolio when you only wanted 50%. Rebalancing brings it back to target.',
      },
      {
        heading: 'Your risk profile',
        body: 'During onboarding you chose a risk profile — Conservative, Balanced, or Aggressive. This defines your target allocation:\n\n• **Conservative** — mostly stablecoins (USDC/USDT), small MNT position\n• **Balanced** — 40% stablecoins, 40% MNT, 20% yield assets\n• **Aggressive** — mostly MNT and growth assets, minimal stablecoins',
        command: 'Show my current allocation vs target',
      },
      {
        heading: 'How to rebalance',
        body: 'Just ask the CFO Agent. It will analyse your current allocation, compare it to your target, and suggest the exact swaps needed to bring you back in line — then execute them on your approval.',
        command: 'Rebalance my portfolio to my risk profile',
      },
    ],
  },
  {
    id: 'reading-a-quote',
    title: 'How to read a swap quote',
    duration: '2 min',
    tag: 'Beginner',
    tagColor: 'var(--pro-positive)',
    steps: [
      {
        heading: 'What the CFO Agent shows you before a swap',
        body: 'Before any swap executes, you see a quote with these fields:\n\n• **Amount in** — how much you\'re sending\n• **Amount out** — how much you\'ll receive\n• **Min output** — the worst case (accounts for slippage)\n• **Fee** — 0.15% CFO Agent fee\n• **Gas** — small Mantle network fee (usually <$0.01)',
      },
      {
        heading: 'What is slippage?',
        body: 'Slippage is the difference between the quoted price and the actual price at execution. Prices move in milliseconds — slippage tolerance (set to 1%) means the swap will abort if you\'d receive more than 1% less than quoted. This protects you from bad fills.',
      },
      {
        heading: 'When to reject a quote',
        body: 'Reject if:\n• The "min output" is much lower than expected\n• The price impact warning is >2%\n• You changed your mind\n\nJust tap **Skip** — no transaction is sent, no gas is used.',
      },
    ],
  },
]

function LessonCard({
  lesson,
  isOpen,
  onToggle,
  onCommand,
}: {
  lesson: Lesson
  isOpen: boolean
  onToggle: () => void
  onCommand?: (cmd: string) => void
}) {
  const [step, setStep] = useState(0)

  return (
    <div
      className="pro-card"
      style={{ padding: 0, transition: 'box-shadow 0.15s' }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => { onToggle(); setStep(0) }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <BookOpen size={16} strokeWidth={1.75} style={{ color: lesson.tagColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: 'var(--pro-text)', fontFamily: 'var(--font-mono)',
            }}>
              {lesson.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: lesson.tagColor, fontFamily: 'var(--font-mono)',
              border: `1px solid ${lesson.tagColor}40`, borderRadius: 3,
              padding: '1px 6px',
            }}>
              {lesson.tag}
            </span>
            <span style={{ fontSize: 11, color: 'var(--pro-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {lesson.duration} read
            </span>
          </div>
        </div>
        {isOpen
          ? <ChevronDown size={16} style={{ color: 'var(--pro-text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: 'var(--pro-text-muted)', flexShrink: 0 }} />}
      </button>

      {/* Expanded lesson content */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--pro-border)', padding: '18px 18px 20px' }}>
          <div>
          {/* Step progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {lesson.steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  background: i <= step ? lesson.tagColor : 'var(--pro-border)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>

          {/* Current step */}
          {(() => {
            const s = lesson.steps[step]
            return (
              <div>
                <h3 style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--pro-text)',
                  fontFamily: 'var(--font-mono)', marginBottom: 10,
                }}>
                  {s.heading}
                </h3>
                <p style={{
                  fontSize: 13, color: 'var(--pro-text-secondary)',
                  lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: s.tip || s.command ? 14 : 0,
                }}
                  dangerouslySetInnerHTML={{
                    __html: s.body
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {s.tip && (
                  <div style={{
                    background: 'var(--pro-accent-dim)',
                    border: '1px solid var(--pro-border-accent)',
                    borderRadius: 6, padding: '10px 14px', marginBottom: 14,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--pro-accent)',
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                    }}>
                      💡 TIP —{' '}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--pro-text-secondary)' }}>
                      {s.tip}
                    </span>
                  </div>
                )}

                {s.command && onCommand && (
                  <button
                    type="button"
                    onClick={() => onCommand(s.command!)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', marginBottom: 14,
                      background: 'var(--pro-accent-dim)',
                      border: '1px solid var(--pro-border-accent)',
                      borderRadius: 6, cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      color: 'var(--pro-accent)', fontWeight: 700,
                    }}
                  >
                    <ArrowRight size={13} strokeWidth={2} />
                    Try it: "{s.command}"
                  </button>
                )}
              </div>
            )
          })()}

          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 10 }}>
            <button
              type="button"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                padding: '7px 14px', borderRadius: 5, border: '1px solid var(--pro-border)',
                background: 'transparent', cursor: step === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: step === 0 ? 'var(--pro-text-muted)' : 'var(--pro-text-secondary)',
              }}
            >
              ← Back
            </button>
            {step < lesson.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                style={{
                  padding: '7px 16px', borderRadius: 5, border: 'none',
                  background: lesson.tagColor, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#000',
                }}
              >
                Next →
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} style={{ color: 'var(--pro-positive)' }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  color: 'var(--pro-positive)',
                }}>
                  Lesson complete
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  onCommand?: (cmd: string) => void
}

export function LearnView({ onCommand }: Props) {
  const [openId, setOpenId] = useState<string | null>(LESSONS[0].id)

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Learn</h1>
          <p className="pro-page-sub">Step-by-step guides to trading and earning ROI on Mantle</p>
        </div>
      </header>

      <div className="pro-scroll p-6 flex flex-col gap-4">
        {/* Intro banner */}
        <div
          className="pro-card"
          style={{
            background: 'var(--pro-accent-dim)',
            border: '1px solid var(--pro-border-accent)',
            padding: '14px 18px',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--pro-text-secondary)', lineHeight: 1.6 }}>
            📚 Each lesson ends with a <strong style={{ color: 'var(--pro-accent)' }}>Try it</strong> button
            that sends the command directly to your CFO Agent — so you can learn and act at the same time.
          </p>
        </div>

        {/* Lesson list */}
        {LESSONS.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isOpen={openId === lesson.id}
            onToggle={() => setOpenId(prev => prev === lesson.id ? null : lesson.id)}
            onCommand={onCommand}
          />
        ))}
      </div>
    </>
  )
}
