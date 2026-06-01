'use client'
import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { getReferralUrl } from '@/lib/referral'

interface Props {
  walletAddress: string
  referredBy?: string
}

export function ReferralCard({ walletAddress, referredBy }: Props) {
  const [copied, setCopied] = useState(false)
  const url = getReferralUrl(walletAddress)

  function copy() {
    void navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      border: '1px solid var(--pro-border)',
      borderRadius: 6,
      overflow: 'hidden',
      background: 'var(--pro-surface)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        borderBottom: '1px solid var(--pro-border)',
        background: 'var(--pro-surface-muted)',
      }}>
        <Users size={13} strokeWidth={2} style={{ color: 'var(--pro-accent)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: 'var(--pro-text)', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Invite Friends
        </span>
        {referredBy && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, fontWeight: 700,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            color: 'var(--pro-positive)',
            border: '1px solid var(--pro-positive)',
            borderRadius: 3, padding: '1px 6px',
          }}>
            FEE DISCOUNT ACTIVE
          </span>
        )}
      </div>

      <div style={{ padding: '12px 14px' }}>
        {/* Incentive line */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--pro-text-secondary)', marginBottom: 10, lineHeight: 1.5,
        }}>
          Share your link — friends pay <strong style={{ color: 'var(--pro-positive)' }}>0.10% fees</strong> instead of 0.15%.
          You both win.
        </p>

        {/* Referral URL */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--pro-bg)', border: '1px solid var(--pro-border)',
          borderRadius: 4, padding: '6px 10px',
        }}>
          <span style={{
            flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--pro-text-muted)', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
          <button
            type="button"
            onClick={copy}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 3, border: 'none',
              background: copied ? 'var(--pro-positive)' : 'var(--pro-accent)',
              color: '#000', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            {copied ? <Check size={10} strokeWidth={3} /> : <Copy size={10} strokeWidth={2} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Referred by notice */}
        {referredBy && (
          <p style={{
            marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--pro-positive)',
          }}>
            ✓ You were referred by <strong>{referredBy}</strong> — enjoying 0.10% swap fee
          </p>
        )}
      </div>
    </div>
  )
}
