'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { QUICK_ACTIONS } from '@/lib/mockData'
import {
  EMPTY_PORTFOLIO,
  EMPTY_POSITIONS,
  EMPTY_ALLOCATIONS,
  EMPTY_ACTIONS,
  EMPTY_AGENT,
} from '@/lib/emptyDefaults'
import {
  DEMO_PORTFOLIO,
  DEMO_POSITIONS,
  DEMO_ALLOCATIONS,
  DEMO_ACTIONS,
  DEMO_AGENT,
  DEMO_MESSAGES,
} from '@/lib/demoData'
import {
  appendExecutionHistory,
  loadExecutionHistory,
  mergeActionFeeds,
} from '@/lib/executionHistory'
import { recordPortfolioSnapshot, compute7dChange } from '@/lib/portfolioSnapshots'
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/storage'
import { useWallet } from '@/hooks/useWallet'
import { useAgentIdentity } from '@/hooks/useAgentIdentity'
import { shortHash, formatUSD } from '@/lib/utils'
import type {
  PortfolioSnapshot,
  Position,
  Allocation,
  ActionEntry,
  AgentState,
  ChatMessage,
  ExecutionPreview,
  UserSettings,
  AgentApiResponse,
  ExecutionResult,
} from '@/types'

const REGISTRY = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS

function txCardFromResult(result: ExecutionResult) {
  return {
    status: result.source === 'mock' ? 'Simulated' : 'Confirmed ✓',
    hash: result.txHash,
    explorerUrl: result.explorerUrl,
    erc8004: result.erc8004Updated ? 'Updated' : undefined,
  }
}

function welcomeMessages(portfolio: PortfolioSnapshot, agentId?: number): ChatMessage[] {
  const value = formatUSD(portfolio.totalValue)
  const agentNote = agentId ? ` Your on-chain identity is registered as ERC-8004 agent **#${agentId}**.` : ''
  const now = new Date()

  const portfolioLine = portfolio.totalValue > 0
    ? `I can see your Mantle portfolio — current value: **${value}**.${agentNote}`
    : `Your wallet is connected to Mantle.${agentNote} I don't see any balances yet — fund it with MNT or USDC to get started.`

  return [
    // ── Step 1: greeting + portfolio status ──────────────────────────────────
    {
      id: 'welcome-1',
      role: 'agent',
      content: `👋 Welcome to your **Personal CFO Agent** — your AI-powered financial manager on the Mantle blockchain.\n\n${portfolioLine}`,
      timestamp: new Date(now.getTime()),
    },
    // ── Step 2: capabilities overview ────────────────────────────────────────
    {
      id: 'welcome-2',
      role: 'agent',
      content: `Here's what I can do for you:\n\n💱 **Swap tokens** — instantly swap MNT, USDC, USDT, mETH on Mantle\n📊 **Analyse your portfolio** — risk exposure, allocation breakdown, P&L\n🌾 **Find yield** — discover the best yield opportunities available right now\n⚖️ **Rebalance** — adjust your positions to match your risk profile\n\nJust type naturally — I'll understand and act on your behalf.`,
      timestamp: new Date(now.getTime() + 100),
    },
    // ── Step 3: how swaps work ───────────────────────────────────────────────
    {
      id: 'welcome-3',
      role: 'agent',
      content: `**How a swap works, step by step:**\n\n1️⃣ Tell me what you want — e.g. *"Swap $5 of MNT to USDC"*\n2️⃣ I fetch the best route via OpenOcean DEX aggregator\n3️⃣ I show you the quote — amount out, price impact, and my 0.15% fee\n4️⃣ You tap **Confirm** — MetaMask opens for your approval\n5️⃣ Transaction executes live on Mantle mainnet ✅\n\nYour funds never leave your wallet until you approve.`,
      timestamp: new Date(now.getTime() + 200),
    },
    // ── Step 4: wizard — pick your first action ───────────────────────────────
    {
      id: 'welcome-wizard',
      role: 'agent',
      content: `🚀 **Let's get started!** What would you like to do first?\n\nPick one below or just type your own request:`,
      timestamp: new Date(now.getTime() + 300),
      actions: [
        'Swap $5 of MNT to USDC',
        'What is my portfolio worth?',
        'Where can I earn the best yield?',
        'Explain my risk profile',
      ],
    },
  ]
}

interface AgentContextValue {
  demo: boolean
  settings: UserSettings
  completeOnboarding: (partial: Partial<UserSettings> & { skipIdentity?: boolean }) => Promise<void>
  portfolio: PortfolioSnapshot
  portfolioLive: boolean
  positions: Position[]
  allocations: Allocation[]
  actions: ActionEntry[]
  agent: AgentState
  activePosition: string
  setActivePosition: (id: string) => void
  timeRange: '1W' | '1M' | '3M' | 'All'
  setTimeRange: (t: '1W' | '1M' | '3M' | 'All') => void
  messages: ChatMessage[]
  input: string
  setInput: (v: string) => void
  isTyping: boolean
  mode: 'Chat' | 'Auto'
  setMode: (m: 'Chat' | 'Auto') => void
  sendMessage: (text?: string) => Promise<void>
  confirmExecution: (preview: ExecutionPreview) => Promise<void>
  cancelPreview: () => void
  updatePreviewAmount: (amountUsd: number) => void
  pendingPreview: ExecutionPreview | null
  wallet: ReturnType<typeof useWallet>
  identityMinting: boolean
  refreshPortfolio: (walletAddr?: string) => Promise<{ portfolio: PortfolioSnapshot; agentId?: number } | null>
  disconnect: () => void
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children, demo = false }: { children: ReactNode; demo?: boolean }) {
  const wallet = useWallet()
  const identity = useAgentIdentity(REGISTRY)
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (demo) return { ...DEFAULT_SETTINGS, onboardingComplete: true, riskProfile: 'balanced' }
    // Load synchronously so first render already knows onboardingComplete
    return loadSettings()
  })
  const [portfolio, setPortfolio] = useState(demo ? DEMO_PORTFOLIO : EMPTY_PORTFOLIO)
  const [portfolioLive, setPortfolioLive] = useState(demo)
  const [positions, setPositions] = useState<Position[]>(demo ? DEMO_POSITIONS : EMPTY_POSITIONS)
  const [allocations, setAllocations] = useState<Allocation[]>(demo ? DEMO_ALLOCATIONS : EMPTY_ALLOCATIONS)
  const [actions, setActions] = useState<ActionEntry[]>(demo ? DEMO_ACTIONS : EMPTY_ACTIONS)
  const [agent, setAgent] = useState<AgentState>(demo ? DEMO_AGENT : EMPTY_AGENT)
  const [activePosition, setActivePosition] = useState('')
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'All'>('1W')
  const [messages, setMessages] = useState<ChatMessage[]>(demo ? DEMO_MESSAGES : [])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'Chat' | 'Auto'>('Chat')
  const [pendingPreview, setPendingPreview] = useState<ExecutionPreview | null>(null)

  const agentIdNumeric = settings.agentIdNumeric ?? null

  // ── Read referral code from URL on first load ────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref && !settings.referredBy) {
      saveSettings({ referredBy: ref })
      setSettings(s => ({ ...s, referredBy: ref }))
    }
  }, [])

  const refreshPortfolio = useCallback(async (walletAddr?: string) => {
    const addr = walletAddr || wallet.address || settings.walletAddress
    if (!addr) return null

    try {
      const res = await fetch(`/api/portfolio?wallet=${addr}`)
      const data = await res.json()
      if (data.error) return null

      const localActions = loadExecutionHistory(addr)
      const mergedActions = mergeActionFeeds(data.actions ?? [], localActions)

      recordPortfolioSnapshot(addr, data.portfolio.totalValue)
      const { change7d, changePct7d } = compute7dChange(addr, data.portfolio.totalValue)

      const nextPortfolio = {
        ...data.portfolio,
        change7d,
        changePct7d,
      }

      setPortfolio(nextPortfolio)
      setPositions(data.positions ?? [])
      setAllocations(data.allocations ?? [])
      setActions(mergedActions)
      setPortfolioLive(!!data.live)

      setActivePosition(prev => prev || data.positions?.[0]?.id || '')

      if (data.agent?.agentId) {
        const id = data.agent.agentId as number
        setAgent(prev => ({
          ...prev,
          agentIdNumeric: id,
          agentId: `#${id}`,
          totalExecutions: data.agent.executions ?? 0,
          repScore: data.agent.repScore ?? 0,
          isActive: true,
        }))
        saveSettings({ agentIdNumeric: id })
      } else {
        setAgent(prev => ({
          ...prev,
          agentId: shortHash(addr),
          totalExecutions: 0,
          repScore: 0,
        }))
      }

      return { portfolio: nextPortfolio, agentId: data.agent?.agentId as number | undefined }
    } catch {
      return null
    }
  }, [wallet.address, settings.walletAddress])

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    if (s.walletAddress) {
      wallet.setAddress(s.walletAddress)
    }
    setAgent(prev => ({
      ...prev,
      riskProfile: s.riskProfile,
      isActive: s.onboardingComplete,
      agentIdNumeric: s.agentIdNumeric,
      agentId: s.agentIdNumeric ? `#${s.agentIdNumeric}` : (s.walletAddress ? shortHash(s.walletAddress) : prev.agentId),
    }))
    if (s.onboardingComplete && s.walletAddress) {
      void refreshPortfolio(s.walletAddress)
    }
  }, [refreshPortfolio])

  useEffect(() => {
    if (!settings.onboardingComplete || !wallet.address) return
    const id = setInterval(() => void refreshPortfolio(), 30_000)
    return () => clearInterval(id)
  }, [settings.onboardingComplete, wallet.address, refreshPortfolio])

  const completeOnboarding = useCallback(async (partial: Partial<UserSettings> & { skipIdentity?: boolean }) => {
    const walletAddr = partial.walletAddress || wallet.address
    if (!walletAddr) return

    let agentIdNumeric = partial.agentIdNumeric

    if (REGISTRY && !partial.skipIdentity) {
      const minted = await identity.prepareAndMint(
        walletAddr,
        partial.riskProfile || 'balanced',
        partial.goals || [],
      )
      if (minted) agentIdNumeric = minted
    }

    // Generate referral code from wallet address
    const { generateReferralCode } = await import('@/lib/referral')
    const referralCode = generateReferralCode(walletAddr)

    const next = saveSettings({
      ...partial,
      onboardingComplete: true,
      walletAddress: walletAddr,
      agentIdNumeric,
      referralCode,
    })
    setSettings(next)

    const refreshed = await refreshPortfolio(walletAddr)

    setAgent(prev => ({
      ...prev,
      riskProfile: next.riskProfile,
      isActive: true,
      agentIdNumeric,
      agentId: agentIdNumeric ? `#${agentIdNumeric}` : shortHash(walletAddr),
    }))

    // Drip welcome messages one by one with typing indicator — feels like the agent is alive
    const msgs = welcomeMessages(refreshed?.portfolio ?? EMPTY_PORTFOLIO, agentIdNumeric ?? refreshed?.agentId)
    setMessages([msgs[0]])
    const delays = [1800, 3400, 5200]
    msgs.slice(1).forEach((msg, i) => {
      const showAt = delays[i] ?? (i + 1) * 1800
      // Show typing indicator 800ms before message arrives
      setTimeout(() => setIsTyping(true), showAt - 800)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, msg])
      }, showAt)
    })
  }, [wallet.address, identity, refreshPortfolio])

  const applyExecution = useCallback((result: ExecutionResult, walletAddr: string) => {
    appendExecutionHistory(walletAddr, result.action)
    setActions(prev => [result.action, ...prev.filter(a => a.id !== result.action.id)])
    setPendingPreview(null)
    void refreshPortfolio(walletAddr)
  }, [refreshPortfolio])

  const confirmExecution = useCallback(async (preview: ExecutionPreview) => {
    const walletAddr = wallet.address || settings.walletAddress
    if (!walletAddr) return

    setIsTyping(true)
    setPendingPreview(null)

    try {
      // ── Try real on-chain swap via ODOS + MetaMask ──
      const isMainnet = process.env.NEXT_PUBLIC_MANTLE_TESTNET !== 'true'
      const canSwap = !!wallet.address && !!wallet.sendSwap && isMainnet

      // Only attempt real swap for explicit swap-type previews
      if (canSwap && preview.type === 'swap') {
        // Determine token pair — check specific tokens before generic ones
        // Order matters: mETH before USDC (since "mETH/USDC" contains both)
        const tokenIn  = preview.from?.includes('USDT') ? 'USDT'
          : preview.from?.includes('USDC') ? 'USDC'
          : preview.from?.includes('mETH') ? 'mETH'
          : preview.from?.includes('WETH') ? 'WETH'
          : 'MNT'
        const tokenOut = preview.to?.includes('mETH') ? 'mETH'
          : preview.to?.includes('WETH') ? 'WETH'
          : preview.to?.includes('USDT') ? 'USDT'
          : preview.to?.includes('USDC') ? 'USDC'
          : 'USDC'

        // Notify user we're building the tx
        setMessages(prev => [...prev, {
          id: `m-building-${Date.now()}`,
          role: 'agent',
          content: `Building swap: **${tokenIn} → ${tokenOut}** for $${preview.amountUsd.toFixed(0)}. Preparing MetaMask…`,
          timestamp: new Date(),
        }])

        const quoteRes = await fetch('/api/swap/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenIn,
            tokenOut,
            amountUsd: preview.amountUsd,
            walletAddress: wallet.address,
            referredBy: settings.referredBy,
          }),
        })
        const quoteData = await quoteRes.json() as {
          error?: string
          to: string; data: string; value: string; gasLimit: string
          fee?: { recipient: string; amountWei: string; amountUsd: number; bps: number; label: string } | null
        }

        if (!quoteRes.ok || quoteData.error) {
          setMessages(prev => [...prev, {
            id: `m-quote-err-${Date.now()}`,
            role: 'agent',
            content: `⚠️ Could not get swap quote: ${quoteData.error ?? 'unknown error'}. Recording intent on-chain instead.`,
            timestamp: new Date(),
          }])
        } else {
          // ── Step 1: Collect CFO fee (0.15% in MNT) if configured ──
          if (quoteData.fee && wallet.sendSwap) {
            const { recipient, amountWei, amountUsd: feeUsd, label } = quoteData.fee
            setMessages(prev => [...prev, {
              id: `m-fee-${Date.now()}`,
              role: 'agent',
              content: `Collecting **${label}** ($${feeUsd.toFixed(2)}) — approve in MetaMask…`,
              timestamp: new Date(),
            }])
            const feeTxHash = await wallet.sendSwap({
              to: recipient,
              data: '0x',
              value: `0x${BigInt(amountWei).toString(16)}`,
              gasLimit: '0x5208', // 21000 — simple transfer
            })
            if (!feeTxHash) {
              setMessages(prev => [...prev, {
                id: `m-fee-rejected-${Date.now()}`,
                role: 'agent',
                content: '❌ Fee transaction rejected. Swap cancelled.',
                timestamp: new Date(),
              }])
              return
            }
          }

          // ── Step 2: Execute the swap ──
          setMessages(prev => [...prev, {
            id: `m-swap-sign-${Date.now()}`,
            role: 'agent',
            content: `Now approve the swap in MetaMask…`,
            timestamp: new Date(),
          }])

          const txHash = await wallet.sendSwap!({
            to: quoteData.to,
            data: quoteData.data,
            value: quoteData.value,
            gasLimit: quoteData.gasLimit,
          })

          if (txHash) {
            const explorerUrl = `https://explorer.mantle.xyz/tx/${txHash}`
            const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
            const feeNote = quoteData.fee ? ` · ${quoteData.fee.label}` : ''
            const action: ActionEntry = {
              id: `real-${Date.now()}`,
              type: 'ok',
              title: preview.title,
              desc: `${tokenIn} → ${tokenOut} · ODOS · Mantle mainnet${feeNote}`,
              time: 'just now',
              txHash: shortHash,
              txHashFull: txHash,
              explorerUrl,
              category: 'swap',
            }
            applyExecution({
              success: true,
              txHash: shortHash,
              txHashFull: txHash,
              explorerUrl,
              action,
              delta: 0,
              erc8004Updated: false,
              source: 'mantle',
              message: `Swap confirmed on Mantle. **${tokenIn} → ${tokenOut}** — [view on explorer](${explorerUrl})`,
            }, walletAddr)
            setMessages(prev => [...prev, {
              id: `m-${Date.now()}`,
              role: 'agent',
              content: `✅ Swap confirmed on Mantle mainnet.\n**${tokenIn} → ${tokenOut}** · $${preview.amountUsd.toFixed(0)}\nTx: ${shortHash}`,
              timestamp: new Date(),
              txCard: { hash: shortHash, explorerUrl },
            }])
            return
          } else {
            setMessages(prev => [...prev, {
              id: `m-rejected-${Date.now()}`,
              role: 'agent',
              content: '❌ Swap rejected in wallet.',
              timestamp: new Date(),
            }])
            return
          }
        }
      }

      // ── Swap previews always require MetaMask — never fire executor silently ──
      if (preview.type === 'swap' || preview.type === 'lp_open' || preview.type === 'compound') {
        setMessages(prev => [...prev, {
          id: `m-no-wallet-${Date.now()}`,
          role: 'agent',
          content: '⚠️ Please connect your MetaMask wallet to execute swaps. Your funds always stay in your wallet until you approve.',
          timestamp: new Date(),
        }])
        return
      }

      // ── Non-swap intents: record on-chain intent anchor only ──
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview, agentId: agentIdNumeric }),
      })
      const result: ExecutionResult = await res.json()
      if (!result.success) {
        setMessages(prev => [...prev, {
          id: `m-err-${Date.now()}`,
          role: 'agent',
          content: result.message || 'Execution failed.',
          timestamp: new Date(),
        }])
        return
      }
      applyExecution(result, walletAddr)
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}`,
        role: 'agent',
        content: result.message.replace(/\*\*/g, ''),
        timestamp: new Date(),
        txCard: txCardFromResult(result),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [applyExecution, agentIdNumeric, wallet, settings.walletAddress])

  const cancelPreview = useCallback(() => {
    setPendingPreview(null)
    setMessages(prev => [...prev, {
      id: `m-skip-${Date.now()}`,
      role: 'agent',
      content: 'Okay, transaction cancelled. Let me know if you\'d like to try a different amount or strategy.',
      timestamp: new Date(),
    }])
  }, [])

  const updatePreviewAmount = useCallback((amountUsd: number) => {
    setPendingPreview(prev => {
      if (!prev) return prev
      const updated = { ...prev, amountUsd }
      // Also update the txCard in the last agent message that has this preview
      setMessages(msgs => msgs.map(m => {
        if (m.txCard && m.role === 'agent') {
          return {
            ...m,
            txCard: {
              ...m.txCard,
              amount: `$${amountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            },
          }
        }
        return m
      }))
      return updated
    })
  }, [])

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim()
    if (!content) return

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const intentConfirm = content.toLowerCase() === 'confirm' && pendingPreview
    if (intentConfirm) {
      await confirmExecution(pendingPreview)
      setIsTyping(false)
      return
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          riskProfile: settings.riskProfile,
          portfolioTotal: portfolio.totalValue,
          positions: positions.map(p => ({ name: p.name, type: p.type, value: p.value })),
          autoExecute: mode === 'Auto' || settings.autoExecute,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, {
          id: `m-err-${Date.now()}`,
          role: 'agent',
          content: (data as AgentApiResponse).error || 'Agent unavailable.',
          timestamp: new Date(),
        }])
        return
      }

      const contentType = res.headers.get('Content-Type') || ''
      const walletAddr = wallet.address || settings.walletAddress

      // — Streaming path —
      if (contentType.includes('text/event-stream') && res.body) {
        const streamMsgId = `m-${Date.now() + 1}`
        // Insert empty agent bubble immediately
        setMessages(prev => [...prev, {
          id: streamMsgId,
          role: 'agent',
          content: '',
          timestamp: new Date(),
        }])
        setIsTyping(false) // dots off; streaming bubble takes over

        let preview: ExecutionPreview | null = null
        let needsConfirm = false
        let fullText = ''

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        const flush = (chunk: string) => {
          buf += chunk
          const parts = buf.split('\n\n')
          buf = parts.pop() ?? ''
          for (const block of parts) {
            const evtLine = block.match(/^event: (\w+)$/m)?.[1]
            const dataLine = block.match(/^data: (.+)$/m)?.[1]
            if (!evtLine || !dataLine) continue
            try {
              const payload = JSON.parse(dataLine)
              if (evtLine === 'meta') {
                preview = payload.preview ?? null
                needsConfirm = payload.needsConfirm ?? false
                if (preview) setPendingPreview(preview)
              } else if (evtLine === 'delta') {
                fullText += payload.text ?? ''
                setMessages(prev => prev.map(m =>
                  m.id === streamMsgId ? { ...m, content: fullText } : m,
                ))
              } else if (evtLine === 'done') {
                // Finalize: attach txCard + actions
                setMessages(prev => prev.map(m => {
                  if (m.id !== streamMsgId) return m
                  return {
                    ...m,
                    content: fullText,
                    txCard: preview ? {
                      from: preview.from,
                      to: preview.to,
                      amount: preview.amountUsd > 0 ? `$${preview.amountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : undefined,
                      expectedApr: preview.expectedApr,
                      gas: preview.gas,
                    } : undefined,
                    actions: needsConfirm
                      ? ['Confirm', 'Edit amount', 'Skip']
                      : ['Tell me more'],
                  }
                }))
              }
            } catch { /* non-JSON */ }
          }
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            flush(decoder.decode(value, { stream: true }))
          }
          flush('') // flush remainder

          // Auto-execute if mode === Auto
          if (preview && (mode === 'Auto' || settings.autoExecute) && walletAddr) {
            setIsTyping(true)
            const execRes = await fetch('/api/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ preview, agentId: agentIdNumeric }),
            })
            const result: ExecutionResult = await execRes.json()
            if (result.success) {
              applyExecution(result, walletAddr)
              setMessages(prev => prev.map(m =>
                m.id === streamMsgId
                  ? { ...m, content: `${fullText} Executed on Mantle.`, txCard: txCardFromResult(result) }
                  : m,
              ))
            }
          }
        } finally {
          reader.releaseLock()
        }
        return
      }

      // — Fallback: JSON path —
      const data: AgentApiResponse = await res.json()
      if (data.error) {
        setMessages(prev => [...prev, {
          id: `m-err-${Date.now()}`,
          role: 'agent',
          content: data.error || 'Agent unavailable.',
          timestamp: new Date(),
        }])
        return
      }

      if (data.preview && (mode === 'Auto' || settings.autoExecute) && walletAddr) {
        const execRes = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preview: data.preview, agentId: agentIdNumeric }),
        })
        const result: ExecutionResult = await execRes.json()
        if (result.success) {
          applyExecution(result, walletAddr)
          setMessages(prev => [...prev, {
            id: `m-${Date.now() + 1}`,
            role: 'agent',
            content: `${data.reply} Executed on Mantle.`,
            timestamp: new Date(),
            txCard: txCardFromResult(result),
          }])
          return
        }
      }

      if (data.preview) setPendingPreview(data.preview)
      setMessages(prev => [...prev, {
        id: `m-${Date.now() + 1}`,
        role: 'agent',
        content: data.reply,
        timestamp: new Date(),
        txCard: data.preview ? {
          from: data.preview.from,
          to: data.preview.to,
          amount: data.preview.amountUsd > 0 ? `$${data.preview.amountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : undefined,
          expectedApr: data.preview.expectedApr,
          gas: data.preview.gas,
        } : undefined,
        actions: data.needsConfirm ? ['Confirm', 'Edit amount', 'Skip'] : ['Tell me more'],
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `m-err-${Date.now()}`,
        role: 'agent',
        content: 'Network error. Check your connection.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [
    input, messages, settings, portfolio.totalValue, positions, mode,
    pendingPreview, confirmExecution, applyExecution, agentIdNumeric,
    wallet.address, settings.walletAddress,
  ])

  // ── Autonomous mode: AI-initiated swap proposals every 2 min ────────────────
  const lastAutoSwapRef = useRef<number>(0)
  useEffect(() => {
    if (mode !== 'Auto' || !settings.onboardingComplete) return
    const walletAddr = wallet.address || settings.walletAddress
    if (!walletAddr) return

    const run = async () => {
      const now = Date.now()
      // Throttle: only propose every 2 minutes
      if (now - lastAutoSwapRef.current < 120_000) return
      lastAutoSwapRef.current = now

      try {
        const pricesRes = await fetch('/api/prices')
        const prices = await pricesRes.json() as Record<string, number>
        const mntPrice = prices['MNT'] ?? 0

        // Build a smart autonomous proposal based on portfolio
        const totalValue = portfolio.totalValue
        if (totalValue < 0.5) return // Nothing to manage

        // Decide action based on portfolio composition
        const swapAmountUsd = Math.min(Math.round(totalValue * 0.1 * 100) / 100, 50)
        const proposal = mntPrice > 0
          ? `🤖 **Auto Mode triggered** — I've analysed your portfolio ($${totalValue.toFixed(2)}) and current market conditions.\n\nMNT is at **$${mntPrice.toFixed(4)}**. Based on your **${settings.riskProfile}** risk profile, I recommend:\n\n> Swap **$${swapAmountUsd}** of MNT → USDC to maintain balanced exposure.\n\nThis is AI-initiated. Confirm to execute or skip to dismiss.`
          : `🤖 **Auto Mode triggered** — Reviewing your portfolio ($${totalValue.toFixed(2)}). Ready to rebalance on your command.`

        setMessages(prev => [...prev, {
          id: `auto-proposal-${now}`,
          role: 'agent' as const,
          content: proposal,
          timestamp: new Date(),
          actions: [`Swap $${swapAmountUsd} of MNT to USDC`, 'Show yield opportunities', 'Skip'],
        }])
      } catch { /* silent */ }
    }

    run() // run immediately on enable
    const id = setInterval(run, 120_000)
    return () => clearInterval(id)
  }, [mode, settings.onboardingComplete, portfolio.totalValue, settings.riskProfile, wallet.address, settings.walletAddress])

  // ── Live price alerts + browser push notifications ───────────────────────
  const prevPriceRef = useRef<number | null>(null)
  const lastAlertRef = useRef<number>(0)

  // Request notification permission once onboarding completes
  useEffect(() => {
    if (!settings.onboardingComplete) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [settings.onboardingComplete])

  useEffect(() => {
    if (!settings.onboardingComplete) return

    const checkPriceAlert = async () => {
      try {
        const res = await fetch('/api/prices')
        const data = await res.json() as Record<string, number>
        const mntPrice = data['MNT'] ?? null

        if (mntPrice === null) return

        if (prevPriceRef.current !== null) {
          const changePct = ((mntPrice - prevPriceRef.current) / prevPriceRef.current) * 100
          const now = Date.now()
          const tenMinutes = 10 * 60 * 1000

          if (Math.abs(changePct) >= 3 && now - lastAlertRef.current > tenMinutes) {
            lastAlertRef.current = now
            const pctStr = `${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%`
            const isUp = changePct > 0
            const content = isUp
              ? `📈 MNT is up **${pctStr}** in the last minute. Good time to consider taking some profit — swap MNT → USDC to lock in gains.`
              : `📉 MNT dropped **${pctStr}**. This could be a buying opportunity — or consider moving to USDC for safety.`
            const actions = isUp
              ? ['Swap $10 of MNT to USDC', 'Hold for now']
              : ['Swap $20 of USDC to MNT', 'Move to safety']

            // In-app chat alert
            setMessages(prev => [...prev, {
              id: `price-alert-${now}`,
              role: 'agent' as const,
              content,
              timestamp: new Date(),
              actions,
            }])

            // Browser push notification (works even when tab is in background)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const title = isUp ? `📈 MNT up ${pctStr}` : `📉 MNT down ${pctStr}`
              const body = isUp
                ? `MNT is at $${mntPrice.toFixed(4)}. Consider taking profit → USDC.`
                : `MNT is at $${mntPrice.toFixed(4)}. Possible buy opportunity or move to safety.`
              new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: 'mnt-price-alert', // replaces previous notification
              })
            }
          }
        }
        prevPriceRef.current = mntPrice
      } catch {
        // silent — price alerts are enhancement only
      }
    }

    const id = setInterval(checkPriceAlert, 60_000)
    return () => clearInterval(id)
  }, [settings.onboardingComplete])

  const disconnect = useCallback(() => {
    localStorage.removeItem('pfo-user-settings')
    localStorage.removeItem('cfo-launched')
    wallet.setAddress(null)
    window.location.reload()
  }, [wallet])

  const value: AgentContextValue = {
    demo,
    settings,
    completeOnboarding,
    portfolio,
    portfolioLive,
    positions,
    allocations,
    actions,
    agent,
    activePosition,
    setActivePosition,
    timeRange,
    setTimeRange,
    messages,
    input,
    setInput,
    isTyping,
    mode,
    setMode,
    sendMessage,
    confirmExecution,
    cancelPreview,
    updatePreviewAmount,
    pendingPreview,
    wallet,
    identityMinting: identity.minting,
    refreshPortfolio,
    disconnect,
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used within AgentProvider')
  return ctx
}
