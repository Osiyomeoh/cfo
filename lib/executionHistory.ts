import type { ActionEntry } from '@/types'

const KEY = 'pfo-execution-history'

type StoredAction = ActionEntry & { wallet: string }

function loadAll(): StoredAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredAction[]) : []
  } catch {
    return []
  }
}

function saveAll(rows: StoredAction[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 100)))
}

export function loadExecutionHistory(wallet: string): ActionEntry[] {
  return loadAll()
    .filter(r => r.wallet.toLowerCase() === wallet.toLowerCase())
    .map(({ wallet: _w, ...rest }) => rest)
}

export function appendExecutionHistory(wallet: string, action: ActionEntry) {
  const rows = loadAll().filter(r => r.wallet.toLowerCase() !== wallet.toLowerCase() || r.id !== action.id)
  rows.unshift({ ...action, wallet: wallet.toLowerCase() })
  saveAll(rows)
}

/** Merge on-chain feed with locally stored tx metadata (titles, explorer links) */
export function mergeActionFeeds(chain: ActionEntry[], local: ActionEntry[]): ActionEntry[] {
  const byHash = new Map<string, ActionEntry>()
  for (const a of [...local, ...chain]) {
    const key = a.txHashFull || a.txHash
    const existing = byHash.get(key)
    if (!existing || (a.explorerUrl && !existing.explorerUrl)) {
      byHash.set(key, { ...existing, ...a })
    }
  }
  return [...byHash.values()].slice(0, 50)
}
