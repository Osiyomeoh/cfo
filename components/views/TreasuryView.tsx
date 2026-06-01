'use client'
import { useState } from 'react'
import { ExternalLink, Copy, Check, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgent } from '@/context/AgentProvider'

const FUNDING_METHODS = [
  {
    title: 'Mantle Sepolia Faucet',
    desc: 'Get free testnet MNT to try the app',
    url: 'https://faucet.sepolia.mantle.xyz',
    badge: 'TESTNET',
    badgeColor: 'var(--pro-positive)',
  },
  {
    title: 'Mantle Bridge',
    desc: 'Bridge ETH or ERC-20s from Ethereum mainnet',
    url: 'https://bridge.mantle.xyz',
    badge: 'MAINNET',
    badgeColor: 'var(--pro-accent)',
  },
  {
    title: 'Transak On-Ramp',
    desc: 'Buy MNT directly with card or bank transfer',
    url: 'https://global.transak.com/?defaultCryptoCurrency=MNT',
    badge: 'FIAT',
    badgeColor: '#9b59b6',
  },
  {
    title: 'OKX Exchange',
    desc: 'Withdraw MNT from OKX directly to Mantle',
    url: 'https://www.okx.com/trade-spot/mnt-usdt',
    badge: 'CEX',
    badgeColor: '#3a8ef6',
  },
]

const USEFUL_LINKS = [
  { label: 'Mantle Explorer', url: 'https://explorer.mantle.xyz', desc: 'View transactions on-chain' },
  { label: 'Mantle Sepolia Explorer', url: 'https://explorer.sepolia.mantle.xyz', desc: 'Testnet block explorer' },
  { label: 'Merchant Moe', url: 'https://merchantmoe.com', desc: 'Leading DEX on Mantle' },
  { label: 'Lendle', url: 'https://lendle.xyz', desc: 'Lending & borrowing on Mantle' },
  { label: 'iZUMi Finance', url: 'https://izumi.finance', desc: 'Concentrated liquidity DEX' },
  { label: 'Agni Finance', url: 'https://agni.finance', desc: 'AMM on Mantle' },
]

export function TreasuryView() {
  const { wallet, portfolio } = useAgent()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')

  function copyAddress() {
    const addr = wallet.address
    if (!addr) return
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Treasury</h1>
          <p className="pro-page-sub">Fund wallet · Bridge · On-ramp</p>
        </div>
        <div className="pro-segment">
          {(['deposit', 'withdraw'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn('pro-segment-btn capitalize', activeTab === t && 'pro-segment-btn--active')}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="pro-scroll p-6 flex flex-col gap-6">

        {/* Wallet address card */}
        <div className="pro-card" style={{ borderLeft: '3px solid var(--pro-accent)' }}>
          <p className="pro-label mb-3">Your Mantle Wallet</p>
          {wallet.address ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[13px] font-semibold text-[var(--pro-text)] truncate">
                  {wallet.address}
                </p>
                <p className="font-mono text-[11px] text-[var(--pro-text-muted)] mt-1">
                  Chain ID 5003 · Mantle Sepolia
                </p>
              </div>
              <button
                type="button"
                onClick={copyAddress}
                className="pro-btn shrink-0 gap-1.5"
                title="Copy address"
              >
                {copied ? <Check size={12} strokeWidth={2.5} className="text-[var(--pro-positive)]" /> : <Copy size={12} strokeWidth={2} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={`https://explorer.sepolia.mantle.xyz/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-btn shrink-0 gap-1.5"
              >
                <ExternalLink size={12} strokeWidth={2} />
                Explorer
              </a>
            </div>
          ) : (
            <p className="font-mono text-[13px] text-[var(--pro-text-muted)]">
              No wallet connected — complete onboarding to connect.
            </p>
          )}
        </div>

        {/* Portfolio summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Value', value: `$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: 'Avg Yield', value: `${portfolio.avgYield}% APY` },
            { label: 'Executions', value: `${portfolio.executions}` },
          ].map(m => (
            <div key={m.label} className="pro-card text-center py-4">
              <p className="pro-label mb-2">{m.label}</p>
              <p className="font-mono text-[18px] font-black text-[var(--pro-text)]">{m.value}</p>
            </div>
          ))}
        </div>

        {activeTab === 'deposit' ? (
          <>
            {/* Funding methods */}
            <div>
              <p className="pro-label mb-3">Fund your wallet</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {FUNDING_METHODS.map(m => (
                  <a
                    key={m.title}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pro-card flex items-center gap-4 hover:border-[var(--pro-border-strong)] transition-colors group"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-[13px] font-bold text-[var(--pro-text)]">{m.title}</p>
                        <span
                          className="font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider"
                          style={{ background: `${m.badgeColor}20`, color: m.badgeColor, borderRadius: 2 }}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[var(--pro-text-muted)]">{m.desc}</p>
                    </div>
                    <ExternalLink size={14} strokeWidth={1.75} className="text-[var(--pro-text-muted)] group-hover:text-[var(--pro-accent)] transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Step-by-step */}
            <div className="pro-card" style={{ borderLeft: '3px solid var(--pro-border-strong)' }}>
              <p className="pro-label mb-4">Quick start guide</p>
              <div className="flex flex-col gap-3">
                {[
                  { n: '01', text: 'Get testnet MNT from the Mantle Sepolia faucet above' },
                  { n: '02', text: 'Add Mantle Sepolia to MetaMask — Chain ID 5003, RPC: rpc.sepolia.mantle.xyz' },
                  { n: '03', text: 'Send MNT to your wallet address shown above' },
                  { n: '04', text: 'Return to Dashboard — balances update every 30 seconds' },
                  { n: '05', text: 'Ask the CFO Agent to find the best yield for your balance' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span
                      className="font-mono text-[10px] font-black shrink-0 mt-0.5"
                      style={{ color: 'var(--pro-accent)', minWidth: 24 }}
                    >
                      {s.n}
                    </span>
                    <p className="font-mono text-[12px] text-[var(--pro-text-secondary)] leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Withdraw tab */
          <div className="flex flex-col gap-4">
            <div className="pro-card text-center py-10">
              <ArrowUpFromLine size={28} strokeWidth={1.5} className="mx-auto mb-3 text-[var(--pro-text-muted)]" />
              <p className="font-mono text-[14px] font-bold text-[var(--pro-text)] mb-2">Withdraw via Bridge</p>
              <p className="font-mono text-[12px] text-[var(--pro-text-muted)] mb-5 max-w-xs mx-auto leading-relaxed">
                Bridge MNT or USDC back to Ethereum mainnet using the official Mantle Bridge.
              </p>
              <a
                href="https://bridge.mantle.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="pro-btn-primary inline-flex gap-2"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={13} strokeWidth={2} />
                Open Mantle Bridge
              </a>
            </div>

            <div className="pro-card">
              <p className="pro-label mb-3">Off-ramp to fiat</p>
              <p className="font-mono text-[12px] text-[var(--pro-text-muted)] mb-4 leading-relaxed">
                Sell MNT for fiat via a CEX or use Transak's off-ramp widget.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="https://global.transak.com" target="_blank" rel="noopener noreferrer" className="pro-btn gap-1.5" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={12} strokeWidth={2} /> Transak
                </a>
                <a href="https://www.okx.com/trade-spot/mnt-usdt" target="_blank" rel="noopener noreferrer" className="pro-btn gap-1.5" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={12} strokeWidth={2} /> OKX
                </a>
                <a href="https://www.bybit.com/en/trade/spot/MNT/USDT" target="_blank" rel="noopener noreferrer" className="pro-btn gap-1.5" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={12} strokeWidth={2} /> Bybit
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Useful protocol links */}
        <div>
          <p className="pro-label mb-3">Mantle DeFi Ecosystem</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USEFUL_LINKS.map(l => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-card flex items-center justify-between gap-2 hover:border-[var(--pro-border-strong)] transition-colors group py-3"
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <p className="font-mono text-[12px] font-bold text-[var(--pro-text)]">{l.label}</p>
                  <p className="font-mono text-[10px] text-[var(--pro-text-muted)] mt-0.5">{l.desc}</p>
                </div>
                <ExternalLink size={12} strokeWidth={1.75} className="text-[var(--pro-text-muted)] group-hover:text-[var(--pro-accent)] transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
