'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUICK_ACTIONS } from '@/lib/mockData'
import { riskBarPct, riskLabel } from '@/lib/storage'
import { riskDisplayLabel } from '@/lib/feedUtils'
import { AutonomyPanel } from '@/components/agent/AutonomyPanel'
import type { ChatMessage, RiskProfile } from '@/types'

interface Props {
  messages: ChatMessage[]
  input: string
  isTyping: boolean
  mode: 'Chat' | 'Auto'
  riskProfile: RiskProfile
  onInput: (v: string) => void
  onSend: (text?: string) => void
  onMode: (m: 'Chat' | 'Auto') => void
  onAction?: (action: string) => void
  onEditAmount?: (amountUsd: number) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderMd(text: string) {
  // Escape HTML first, then apply safe markdown transforms
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export function ChatPanel({
  messages,
  input,
  isTyping,
  mode,
  riskProfile,
  onInput,
  onSend,
  onMode,
  onAction,
  onEditAmount,
  inputRef,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  // Track which message is in "edit amount" mode + the draft value
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [amountDraft, setAmountDraft] = useState('')
  const amountInputRef = useRef<HTMLInputElement>(null)
  const riskPct = riskBarPct(riskProfile)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <aside className="pro-chat">
      <div className="pro-chat-header">
        <div className="pro-chat-avatar">AI</div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[13px] font-bold text-[var(--pro-text)]">CFO Agent</p>
          <p className="font-mono text-[11px] text-[var(--pro-text-muted)]">Byreal · Mantle</p>
        </div>
        <div className="pro-segment shrink-0">
          {(['Chat', 'Auto'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => onMode(m)}
              className={cn('pro-segment-btn', mode === m && 'pro-segment-btn--active')}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-[var(--pro-border)] shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="pro-label">Risk Profile</span>
          <span className="font-mono text-[11px] font-bold text-[var(--pro-accent)] uppercase tracking-wide">
            {riskDisplayLabel(riskProfile)}
          </span>
        </div>
        <div className="h-0.5 bg-[var(--pro-border)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--pro-accent)]"
            style={{ width: `${riskPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-[var(--pro-text-muted)]">{riskLabel('conservative')}</span>
          <span className="font-mono text-[10px] text-[var(--pro-text-muted)]">Aggressive</span>
        </div>
      </div>

      {mode === 'Auto' && (
        <div className="px-4 py-3 border-b border-[var(--pro-border)] shrink-0">
          <AutonomyPanel />
        </div>
      )}

      <div className="pro-scroll px-5 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
            <div
              className={cn(
                'shrink-0 flex items-center justify-center font-mono font-black mt-0.5',
                msg.role === 'agent'
                  ? 'bg-[var(--pro-accent)] text-black'
                  : 'bg-[var(--pro-surface-raised)] text-[var(--pro-text-secondary)]',
              )}
              style={{ width: 28, height: 28, borderRadius: 2, fontSize: 10 }}
            >
              {msg.role === 'agent' ? 'AI' : 'ME'}
            </div>
            <div className={msg.role === 'agent' ? 'pro-bubble-agent' : 'pro-bubble-user'}>
              <span dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }} />
              {msg.txCard && (
                <div className="mt-3 border border-[var(--pro-border)] bg-[var(--pro-bg)]" style={{ borderRadius: 2 }}>
                  <div className="px-3 py-2 border-b border-[var(--pro-border)]">
                    <p className="pro-label">Transaction Preview</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                  {msg.txCard.from && (
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">FROM</span>
                      <span className="font-mono text-[11px] font-semibold text-[var(--pro-text)] text-right">{msg.txCard.from}</span>
                    </div>
                  )}
                  {msg.txCard.amount && (
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">AMOUNT</span>
                      <span className="font-mono text-[11px] font-bold text-[var(--pro-accent)]">{msg.txCard.amount}</span>
                    </div>
                  )}
                  {msg.txCard.to && (
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">TO</span>
                      <span className="font-mono text-[11px] font-semibold text-[var(--pro-text)] text-right">{msg.txCard.to}</span>
                    </div>
                  )}
                  {msg.txCard.expectedApr && (
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">APR</span>
                      <span className="font-mono text-[11px] font-bold pro-positive">{msg.txCard.expectedApr}</span>
                    </div>
                  )}
                  {msg.txCard.gas && (
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">GAS</span>
                      <span className="font-mono text-[11px] text-[var(--pro-text)]">{msg.txCard.gas}</span>
                    </div>
                  )}
                  {msg.txCard.hash && (
                    <div className="flex justify-between gap-2 pt-1 border-t border-[var(--pro-border)]">
                      <span className="font-mono text-[11px] text-[var(--pro-text-muted)]">TX</span>
                      {msg.txCard.explorerUrl ? (
                        <a
                          href={msg.txCard.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-[var(--pro-accent)] hover:underline"
                        >
                          {msg.txCard.hash} ↗
                        </a>
                      ) : (
                        <span className="font-mono text-[11px] text-[var(--pro-text-dim)]">{msg.txCard.hash}</span>
                      )}
                    </div>
                  )}
                  </div>
                  {editingMsgId === msg.id && (
                    <div className="px-3 py-2.5 border-t border-[var(--pro-border)]" style={{ background: 'rgba(255,140,0,0.04)' }}>
                      <p className="font-mono text-[10px] text-[var(--pro-text-muted)] mb-1.5">ENTER NEW AMOUNT (USD)</p>
                      <div className="flex gap-2">
                        <div className="flex items-center flex-1 bg-[var(--pro-surface)] border border-[var(--pro-border)] rounded-sm px-2">
                          <span className="font-mono text-[12px] text-[var(--pro-text-muted)] mr-1">$</span>
                          <input
                            ref={amountInputRef}
                            type="number"
                            min="1"
                            step="1"
                            value={amountDraft}
                            onChange={e => setAmountDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseFloat(amountDraft)
                                if (!isNaN(val) && val > 0) {
                                  onEditAmount?.(val)
                                  setEditingMsgId(null)
                                  setAmountDraft('')
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingMsgId(null)
                                setAmountDraft('')
                              }
                            }}
                            placeholder="e.g. 500"
                            className="flex-1 bg-transparent outline-none font-mono text-[12px] text-[var(--pro-text)] py-1.5 w-full"
                            style={{ minWidth: 0 }}
                          />
                        </div>
                        <button
                          type="button"
                          className="pro-btn-primary text-[11px] px-3 py-1.5 shrink-0"
                          onClick={() => {
                            const val = parseFloat(amountDraft)
                            if (!isNaN(val) && val > 0) {
                              onEditAmount?.(val)
                              setEditingMsgId(null)
                              setAmountDraft('')
                            }
                          }}
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          className="pro-btn text-[11px] px-3 py-1.5 shrink-0"
                          onClick={() => { setEditingMsgId(null); setAmountDraft('') }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--pro-border)]">
                      {msg.actions.map(a => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            if (a === 'Edit amount') {
                              // Get current amount from txCard if available
                              const current = msg.txCard?.amount?.replace(/[^0-9.]/g, '') ?? ''
                              setAmountDraft(current)
                              setEditingMsgId(msg.id)
                              setTimeout(() => amountInputRef.current?.focus(), 50)
                            } else {
                              onAction?.(a)
                            }
                          }}
                          className={cn(
                            'flex-1 py-1.5 rounded-md text-[11px] font-semibold',
                            a === 'Confirm' ? 'pro-btn-primary' : 'pro-btn',
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {msg.actions && !msg.txCard && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {msg.actions.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => onAction?.(a)}
                      className="pro-chip text-[10px]"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="pro-chat-avatar">AI</div>
            <div className="pro-bubble-agent flex gap-1 items-center py-3">
              {[0, 0.12, 0.24].map((delay, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--pro-text-muted)] animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-3 flex gap-1.5 flex-wrap shrink-0">
        {QUICK_ACTIONS.map(p => (
          <button key={p} type="button" onClick={() => onSend(p)} className="pro-chip">
            {p}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-[var(--pro-border)] shrink-0">
        <div className="pro-input-wrap">
          <input
            ref={inputRef}
            value={input}
            onChange={e => onInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder="Ask your CFO agent…"
          />
          <button type="button" onClick={() => onSend()} className="pro-send" aria-label="Send">
            <Send size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  )
}
