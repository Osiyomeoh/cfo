'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { chartDays } from '@/lib/feedUtils'
import { formatUSD } from '@/lib/utils'
import type { PortfolioSnapshot } from '@/types'

interface Props {
  portfolio: PortfolioSnapshot
}

export function AnalyticsView({ portfolio }: Props) {
  const [range, setRange] = useState('1W')
  const rangeMap: Record<string, string> = { '1H': '1D', '4H': '1D', '1D': '1D', '1W': '7D', '1M': '1M', 'YTD': 'ALL' }
  const data = chartDays(portfolio.history, rangeMap[range] ?? '7D').map((d, i) => ({
    day: d.day,
    portfolio: d.value,
    index: d.value * (0.98 + i * 0.004),
  }))

  return (
    <>
      <header className="pro-page-header">
        <div className="flex-1 min-w-0">
          <h1 className="pro-page-title">Analytics</h1>
          <p className="pro-page-sub">Performance metrics and benchmark comparison</p>
        </div>
      </header>

      <div className="pro-scroll p-6 flex flex-col gap-6">
        <div className="pro-card">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--pro-chart)]" />
              <span className="text-[12px] text-[var(--pro-text-secondary)]">Portfolio equity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full border border-dashed border-[var(--pro-text-muted)]" />
              <span className="text-[12px] text-[var(--pro-text-secondary)]">Mantle index</span>
            </div>
            <div className="flex-1" />
            <div className="pro-segment">
              {['1H', '4H', '1D', '1W', '1M', 'YTD'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRange(t)}
                  className={`pro-segment-btn ${range === t ? 'pro-segment-btn--active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--pro-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(v, n) => [
                    formatUSD(Number(v)),
                    n === 'portfolio' ? 'Portfolio' : 'Mantle Index',
                  ]}
                  contentStyle={{
                    background: 'var(--pro-tooltip-bg)',
                    border: '1px solid var(--pro-border)',
                    borderRadius: 6,
                    fontSize: 12,
                    color: 'var(--pro-text)',
                  }}
                />
                <Line type="monotone" dataKey="portfolio" stroke="var(--pro-chart)" strokeWidth={1.75} dot={false} />
                <Line type="monotone" dataKey="index" stroke="var(--pro-chart-index)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pro-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[var(--pro-text)]">Asset correlation</h3>
              <span className="text-[11px] text-[var(--pro-text-muted)]">30D window</span>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  <th className="pb-2 text-[var(--pro-text-muted)] font-medium text-left" />
                  {['mETH', 'MNT', 'USDY'].map(h => (
                    <th key={h} className="pb-2 text-[var(--pro-text-muted)] font-medium text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: 'mETH', v: [1.0, 0.6, 0.1] },
                  { r: 'MNT', v: [0.6, 1.0, 0.1] },
                  { r: 'USDY', v: [0.1, 0.1, 1.0] },
                ].map(row => (
                  <tr key={row.r}>
                    <td className="py-1 pr-2 text-[var(--pro-text-muted)] font-medium">{row.r}</td>
                    {row.v.map((val, i) => (
                      <td key={i} className="py-1 px-1 text-center">
                        <div
                          className="w-9 h-9 mx-auto rounded-md flex items-center justify-center text-[11px] font-semibold"
                          style={{
                            background: `color-mix(in srgb, var(--pro-accent) ${val > 0.5 ? 85 : val > 0.2 ? 28 : 8}%, transparent)`,
                            color: val > 0.5 ? 'var(--pro-text)' : 'var(--pro-accent)',
                          }}
                        >
                          {val.toFixed(1)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pro-card">
            <h3 className="text-[14px] font-semibold text-[var(--pro-text)] mb-4">Alpha vs. benchmark</h3>
            <div className="bg-[var(--pro-surface-muted)] rounded-md p-4 mb-4 border border-[var(--pro-border)]">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="pro-metric-label mb-1">Relative performance</p>
                  <p className="pro-metric-value pro-metric-value--up">+{portfolio.changePct7d.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="pro-metric-label mb-1">Avg yield</p>
                  <p className="pro-metric-value">{portfolio.avgYield}%</p>
                </div>
              </div>
            </div>
            {[
              { label: 'Portfolio efficiency', val: 82 },
              { label: 'Drawdown recovery', val: 78 },
            ].map(m => (
              <div key={m.label} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--pro-text-secondary)]">{m.label}</span>
                  <span className="text-[12px] font-semibold text-[var(--pro-text)]">{m.val}/100</span>
                </div>
                <div className="h-1.5 bg-[var(--pro-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--pro-accent)] rounded-full opacity-80"
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
