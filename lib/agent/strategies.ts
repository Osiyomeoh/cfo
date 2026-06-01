import type { ExecutionPreview, RiskProfile, Position } from '@/types'

const POOLS = {
  balanced: { name: 'mETH/USDC LP', pool: 'Merchant Moe', apr: 18.4 },
  conservative: { name: 'USDY Yield', pool: 'Ondo USDY', apr: 5.3 },
  aggressive: { name: 'Agni USDC Pool', pool: 'Agni Finance', apr: 11.2 },
}

export function maxAllocationPct(risk: RiskProfile): number {
  return { conservative: 15, balanced: 25, aggressive: 40 }[risk]
}

function largestStable(positions: Position[]): Position | null {
  const stables = positions.filter(p => p.type === 'STABLE' || p.type === 'RWA')
  return stables.sort((a, b) => b.value - a.value)[0] ?? null
}

function largestPerp(positions: Position[]): Position | null {
  return positions.filter(p => p.type === 'PERP').sort((a, b) => b.value - a.value)[0] ?? null
}

function largestLp(positions: Position[]): Position | null {
  return positions.filter(p => p.type === 'LP').sort((a, b) => b.value - a.value)[0] ?? null
}

export function buildPreview(
  type: ExecutionPreview['type'],
  risk: RiskProfile,
  portfolioTotal: number,
  positions: Position[] = [],
): ExecutionPreview {
  const pct = maxAllocationPct(risk) / 100
  const amountUsd = portfolioTotal > 0
    ? Math.round(portfolioTotal * pct * 100) / 100
    : 100
  const pool = POOLS[risk]
  const stable = largestStable(positions)
  const perp = largestPerp(positions)
  const lp = largestLp(positions)

  if (type === 'risk_reduce') {
    const from = perp
      ? `${perp.name} ($${perp.value.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
      : 'Perp exposure'
    const to = stable?.name ?? 'Stable allocation'
    return {
      id: `prev-${Date.now()}`,
      type: 'risk_reduce',
      title: 'Reduce risk exposure',
      from,
      to,
      expectedApr: stable?.apy ? `+${stable.apy}% APY` : '+5.3% APY',
      gas: '~$0.03',
      amountUsd: perp ? Math.min(perp.value * 0.2, amountUsd) : amountUsd,
      pool: stable?.name ?? 'Ondo USDY',
    }
  }

  if (type === 'compound') {
    const from = lp ? `${lp.name} fees` : 'LP fees'
    return {
      id: `prev-${Date.now()}`,
      type: 'compound',
      title: 'Compound LP fees',
      from,
      to: 'Reinvested principal',
      expectedApr: lp?.apr ? `+${lp.apr}%` : `+${pool.apr}%`,
      gas: '~$0.02',
      amountUsd: lp ? Math.max(10, lp.value * 0.01) : 10,
      pool: pool.pool,
    }
  }

  const fromLabel = stable
    ? `${stable.name} ($${Math.min(stable.value * pct, amountUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })})`
    : `Wallet ($${amountUsd.toLocaleString()})`

  return {
    id: `prev-${Date.now()}`,
    type: type === 'swap' ? 'swap' : 'lp_open',
    title: type === 'swap' ? 'Swap to target asset' : `Enter ${pool.name}`,
    from: fromLabel,
    to: pool.name,
    expectedApr: `+${pool.apr}%`,
    gas: '~$0.04',
    amountUsd,
    pool: pool.pool,
  }
}
