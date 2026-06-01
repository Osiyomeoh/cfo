const KEY = 'pfo-portfolio-snapshots'

type Snapshot = { wallet: string; ts: number; totalValue: number }

function loadAll(): Snapshot[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Snapshot[]) : []
  } catch {
    return []
  }
}

function saveAll(rows: Snapshot[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(rows.slice(-500)))
}

/** Record wallet balance snapshot for 7d change tracking */
export function recordPortfolioSnapshot(wallet: string, totalValue: number) {
  const rows = loadAll().filter(r => r.wallet.toLowerCase() !== wallet.toLowerCase() || Date.now() - r.ts < 8 * 86400000)
  rows.push({ wallet: wallet.toLowerCase(), ts: Date.now(), totalValue })
  saveAll(rows)
}

export function compute7dChange(wallet: string, currentTotal: number): { change7d: number; changePct7d: number } {
  const rows = loadAll()
    .filter(r => r.wallet.toLowerCase() === wallet.toLowerCase())
    .sort((a, b) => a.ts - b.ts)

  const weekAgo = Date.now() - 7 * 86400000
  const baseline = rows.find(r => r.ts >= weekAgo) ?? rows[0]
  if (!baseline || baseline.totalValue <= 0) {
    return { change7d: 0, changePct7d: 0 }
  }
  const change7d = currentTotal - baseline.totalValue
  const changePct7d = (change7d / baseline.totalValue) * 100
  return { change7d, changePct7d }
}
