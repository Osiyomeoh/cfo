'use client'
import { useEffect, useState } from 'react'

interface Prices { MNT: number; ETH: number; mETH: number }

export function PriceTicker() {
  const [prices, setPrices] = useState<Prices | null>(null)
  const [prev, setPrev]     = useState<Prices | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/prices')
        if (res.ok) {
          const data = await res.json() as Prices
          setPrev(p => p)
          setPrices(data)
        }
      } catch { /* silent */ }
    }
    void load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!prices) return null

  function fmt(n: number) {
    return n < 10 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`
  }

  function dir(key: keyof Prices) {
    if (!prev) return ''
    if (prices![key] > prev[key]) return '▲'
    if (prices![key] < prev[key]) return '▼'
    return ''
  }

  const rows: { label: string; key: keyof Prices }[] = [
    { label: 'MNT', key: 'MNT' },
    { label: 'ETH', key: 'ETH' },
    { label: 'mETH', key: 'mETH' },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '8px 0',
      borderTop: '1px solid var(--pro-border)',
      borderBottom: '1px solid var(--pro-border)',
      width: '100%',
    }}>
      {rows.map(({ label, key }) => (
        <div key={key} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}>
          <span style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: 'var(--pro-text-muted)',
            letterSpacing: '0.05em',
          }}>
            {label}
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: dir(key) === '▲' ? 'var(--pro-positive)' : dir(key) === '▼' ? 'var(--pro-negative)' : 'var(--pro-text)',
          }}>
            {fmt(prices[key])}
          </span>
        </div>
      ))}
    </div>
  )
}
