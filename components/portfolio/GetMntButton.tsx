'use client'
import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Zap } from 'lucide-react'

const ONRAMPS = [
  {
    name: 'Bybit',
    desc: 'Buy MNT directly with card or bank',
    url: 'https://www.bybit.com/en/trade/spot/MNT/USDT',
    tag: 'CEX',
    tagColor: '#f5a623',
  },
  {
    name: 'OKX',
    desc: 'Buy or transfer MNT to Mantle',
    url: 'https://www.okx.com/trade-spot/mnt-usdt',
    tag: 'CEX',
    tagColor: '#f5a623',
  },
  {
    name: 'Mantle Bridge',
    desc: 'Bridge ETH or USDC from Ethereum to Mantle',
    url: 'https://bridge.mantle.xyz',
    tag: 'Bridge',
    tagColor: '#00c896',
  },
  {
    name: 'Orbiter Finance',
    desc: 'Fast cross-chain bridge to Mantle',
    url: 'https://www.orbiter.finance/?source=Ethereum&dest=Mantle',
    tag: 'Bridge',
    tagColor: '#00c896',
  },
]

export function GetMntButton() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '9px 12px',
          background: 'var(--pro-accent-dim)',
          border: '1px solid var(--pro-border-accent)',
          borderRadius: 5,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--pro-accent)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={12} strokeWidth={2.5} />
          GET MNT TO START
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div style={{
          marginTop: 4,
          border: '1px solid var(--pro-border)',
          borderRadius: 5,
          overflow: 'hidden',
          background: 'var(--pro-surface)',
        }}>
          {ONRAMPS.map((r, i) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderBottom: i < ONRAMPS.length - 1 ? '1px solid var(--pro-border)' : 'none',
                textDecoration: 'none',
                background: 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--pro-surface-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: 'var(--pro-text)',
                  }}>
                    {r.name}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                    color: r.tagColor, border: `1px solid ${r.tagColor}40`,
                    borderRadius: 3, padding: '1px 5px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {r.tag}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--pro-text-muted)',
                }}>
                  {r.desc}
                </span>
              </div>
              <ExternalLink size={11} style={{ color: 'var(--pro-text-muted)', flexShrink: 0 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
