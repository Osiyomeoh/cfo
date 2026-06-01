import { Contract, JsonRpcProvider, formatEther } from 'ethers'
import { getActiveChain } from '@/lib/chain'
import { buildHistoryDays } from '@/lib/emptyDefaults'
import { fetchTokenPrices } from '@/lib/prices'
import { byrealTopPools } from '@/lib/agent/byreal'
import type { Allocation, PortfolioSnapshot, Position } from '@/types'

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

/** Mantle mainnet verified token addresses */
const WATCH_TOKENS: {
  symbol: string
  address: string
  decimals: number
  type: Position['type']
  icon: string
  iconBg: string
  priceKey?: 'mnt' | 'eth' | 'usd'
}[] = [
  {
    symbol: 'USDC',
    address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
    decimals: 6,
    type: 'STABLE',
    icon: 'U',
    iconBg: '#00875f',
    priceKey: 'usd',
  },
  {
    symbol: 'USDT',
    address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
    decimals: 6,
    type: 'STABLE',
    icon: 'T',
    iconBg: '#26a17b',
    priceKey: 'usd',
  },
  {
    symbol: 'WETH',
    address: '0xdEAddEaDdeadDEadDEADDEaddEADDEaddead0000',
    decimals: 18,
    type: 'LP',
    icon: 'E',
    iconBg: '#627eea',
    priceKey: 'eth',
  },
  {
    symbol: 'mETH',
    address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
    decimals: 18,
    type: 'LP',
    icon: 'm',
    iconBg: '#3b4a8b',
    priceKey: 'eth',
  },
  {
    symbol: 'WMNT',
    address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
    decimals: 18,
    type: 'STABLE',
    icon: 'W',
    iconBg: '#1a1aff',
    priceKey: 'mnt',
  },
]

function priceForToken(
  priceKey: 'mnt' | 'eth' | 'usd' | undefined,
  raw: number,
  prices: { mntUsd: number; ethUsd: number },
): number {
  if (priceKey === 'usd') return raw
  if (priceKey === 'mnt') return raw * prices.mntUsd
  if (priceKey === 'eth') return raw * prices.ethUsd
  return raw * prices.mntUsd
}

function emptyResult(executions = 0): {
  portfolio: PortfolioSnapshot
  positions: Position[]
  allocations: Allocation[]
  live: boolean
} {
  return {
    portfolio: {
      totalValue: 0,
      change7d: 0,
      changePct7d: 0,
      executions,
      avgYield: 0,
      history: buildHistoryDays(0),
    },
    positions: [],
    allocations: [],
    live: false,
  }
}

/** Fetch real yield rates from /api/yields */
async function fetchRealYieldRates(): Promise<Record<string, number>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://personal-cfo-agent-nine.vercel.app'
    const res = await fetch(`${baseUrl}/api/yields`, { signal: AbortSignal.timeout(5_000) })
    if (!res.ok) return {}
    const data = await res.json() as { yields: { token: string; apr: number }[] }
    const map: Record<string, number> = {}
    for (const y of data.yields) map[y.token.toUpperCase()] = y.apr
    return map
  } catch {
    // Fallback APRs
    return { METH: 4.8, USDC: 8.2, MNT: 5.1 }
  }
}

export async function fetchWalletPortfolio(
  wallet: string,
  agentExecutions = 0,
): Promise<{
  portfolio: PortfolioSnapshot
  positions: Position[]
  allocations: Allocation[]
  live: boolean
}> {
  const chain = getActiveChain()
  const provider = new JsonRpcProvider(chain.rpcUrl, chain.chainId)
  const [prices, yieldRates] = await Promise.all([fetchTokenPrices(), fetchRealYieldRates()])

  try {
    const positions: Position[] = []

    const nativeBal = await provider.getBalance(wallet)
    const mntAmount = parseFloat(formatEther(nativeBal))
    const mntUsd = mntAmount * prices.mntUsd

    if (mntUsd > 0.01) {
      positions.push({
        id: 'mnt',
        name: 'MNT (native)',
        type: 'STABLE',
        icon: 'M',
        iconBg: '#0a0a0f',
        value: mntUsd,
        pnl: 0,
        apy: yieldRates['MNT'],
      })
    }

    for (const tok of WATCH_TOKENS) {
      try {
        const c = new Contract(tok.address, ERC20_ABI, provider)
        const bal = await c.balanceOf(wallet)
        const raw = Number(bal) / 10 ** tok.decimals
        if (raw < 0.000001) continue
        const usd = priceForToken(tok.priceKey, raw, prices)
        const symUp = tok.symbol.toUpperCase()
        positions.push({
          id: tok.symbol.toLowerCase(),
          name: `${tok.symbol} balance`,
          type: tok.type,
          icon: tok.icon,
          iconBg: tok.iconBg,
          value: usd,
          pnl: 0,
          apr: yieldRates[symUp] ?? yieldRates[symUp.replace('METH', 'METH')] ?? undefined,
        })
      } catch {
        /* token unavailable on this network */
      }
    }

    // Byreal yield opportunities (REST API — no CLI needed)
    const byrealOpps = await byrealTopPools(3).then(res =>
      res.ok && res.data ? res.data.map((p, i) => ({
        id: `byreal-pool-${i}`,
        name: `${p.name} (LP)`,
        type: 'LP' as Position['type'],
        icon: 'B',
        iconBg: '#1e3a5f',
        value: 0,
        pnl: 0,
        apr: p.totalApr24h != null ? Math.round(p.totalApr24h * 10) / 10 : undefined,
      })).filter(p => (p.apr ?? 0) > 0) : []
    ).catch(() => [] as Position[])
    for (const bp of byrealOpps) {
      if (!positions.some(p => p.name === bp.name)) positions.push(bp)
    }

    if (positions.length === 0) {
      return emptyResult(agentExecutions)
    }

    const totalValue = positions.reduce((s, p) => s + p.value, 0)
    const lpValue = positions.filter(p => p.type === 'LP').reduce((s, p) => s + p.value, 0)
    const stableValue = positions.filter(p => p.type === 'STABLE').reduce((s, p) => s + p.value, 0)
    const perpValue = positions.filter(p => p.type === 'PERP').reduce((s, p) => s + p.value, 0)
    const rwaValue = positions.filter(p => p.type === 'RWA').reduce((s, p) => s + p.value, 0)
    const otherValue = Math.max(0, totalValue - lpValue - stableValue - perpValue - rwaValue)

    const pct = (v: number) => (totalValue > 0 ? Math.round((v / totalValue) * 100) : 0)
    const allocations: Allocation[] = [
      { name: 'Stable', color: '#00c896', pct: pct(stableValue), value: stableValue },
      { name: 'LP', color: '#1e3a5f', pct: pct(lpValue), value: lpValue },
      { name: 'RWA', color: '#f5c842', pct: pct(rwaValue), value: rwaValue },
      { name: 'Perps', color: '#ff6b35', pct: pct(perpValue), value: perpValue },
      { name: 'Other', color: '#9ca3af', pct: pct(otherValue), value: otherValue },
    ].filter(a => a.pct > 0)

    const yields = positions.flatMap(p => [p.apr, p.apy].filter((x): x is number => typeof x === 'number' && x > 0))
    const avgYield = yields.length ? yields.reduce((a, b) => a + b, 0) / yields.length : 0

    const portfolio: PortfolioSnapshot = {
      totalValue,
      change7d: 0,
      changePct7d: 0,
      executions: agentExecutions,
      avgYield: Math.round(avgYield * 10) / 10,
      history: buildHistoryDays(totalValue),
    }

    return { portfolio, positions, allocations, live: true }
  } catch (e) {
    console.error('fetchWalletPortfolio', e)
    return emptyResult(agentExecutions)
  }
}
