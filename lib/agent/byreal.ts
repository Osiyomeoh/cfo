/**
 * Byreal REST API integration
 * Calls https://api2.byreal.io directly — no CLI dependency, works on Vercel.
 * Byreal is a CLMM DEX on Solana; we surface its pool/APR data as yield intel
 * for the CFO agent's recommendations.
 */

const BYREAL_API = 'https://api2.byreal.io'

const ENDPOINTS = {
  OVERVIEW:    '/byreal/api/dex/v2/overview/global',
  POOLS_LIST:  '/byreal/api/dex/v2/pools/info/list',
  TOKEN_PRICE: '/byreal/api/dex/v2/mint/price',
} as const

export interface ByrealPool {
  id: string
  name: string
  tvl: number
  volume24h: number
  feeApr24h: number
  rewardApr24h: number
  totalApr24h: number
  tokenA: string
  tokenB: string
}

export interface ByrealOverview {
  tvl: number
  volume24h: number
  fees24h: number
  poolCount: number
}

export type ByrealJson<T = unknown> = {
  ok: boolean
  data?: T
  error?: string
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<ByrealJson<T>> {
  try {
    const url = new URL(BYREAL_API + path)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    // Byreal wraps as { retCode, result: { data: T } } or { data: T }
    const json = await res.json() as {
      retCode?: number
      result?: { data?: T; success?: boolean }
      data?: T
    }
    const payload: T | undefined =
      json.result?.data          // { retCode, result: { data } }
      ?? json.data               // { data }
      ?? (json.result as unknown as T) // fallback
    return { ok: true, data: payload }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'fetch failed' }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function byrealOverview(): Promise<ByrealJson<ByrealOverview>> {
  const res = await apiFetch<{
    tvl?: string | number; totalTvl?: string | number
    volumeUsd24h?: string | number; volume24h?: string | number; vol24h?: string | number
    feeUsd24h?: string | number; fees24h?: string | number; fee24h?: string | number
    poolCount?: number; pool_count?: number
  }>(ENDPOINTS.OVERVIEW)

  if (!res.ok || !res.data) return { ok: false, error: res.error }
  const d = res.data
  return {
    ok: true,
    data: {
      tvl:       Number(d.tvl ?? d.totalTvl ?? 0),
      volume24h: Number(d.volumeUsd24h ?? d.volume24h ?? d.vol24h ?? 0),
      fees24h:   Number(d.feeUsd24h ?? d.fees24h ?? d.fee24h ?? 0),
      poolCount: d.poolCount ?? d.pool_count ?? 0,
    },
  }
}

export async function byrealTopPools(limit = 5): Promise<ByrealJson<ByrealPool[]>> {
  const res = await apiFetch<unknown>(ENDPOINTS.POOLS_LIST, {
    pageSize: String(limit),
    pageNum: '1',
    sortField: 'apr24h',
    sortType: 'desc',
  })

  if (!res.ok) return { ok: false, error: res.error }

  // Normalise whatever shape the API returns
  // Byreal returns: { total, records: [...], pageNum, ... }
  const raw = res.data as {
    records?: RawPool[]
    list?: RawPool[]
    pools?: RawPool[]
    data?: RawPool[]
  } | RawPool[] | undefined

  const list: RawPool[] = Array.isArray(raw)
    ? raw
    : (raw as { records?: RawPool[] })?.records
      ?? (raw as { list?: RawPool[] })?.list
      ?? (raw as { pools?: RawPool[] })?.pools
      ?? (raw as { data?: RawPool[] })?.data
      ?? []

  const pools: ByrealPool[] = list.slice(0, limit).map((p) => {
    const symA = (typeof p.mintA === 'object' ? p.mintA?.mintInfo?.symbol : undefined) ?? p.tokenASymbol ?? '?'
    const symB = (typeof p.mintB === 'object' ? p.mintB?.mintInfo?.symbol : undefined) ?? p.tokenBSymbol ?? '?'
    const feeApr = Number(p.feeApr24h ?? p.feeApr ?? 0)
    const rewardApr = Number(p.rewardApr24h ?? p.rewardApr ?? 0)
    return {
      id:           p.poolAddress ?? p.id ?? p.poolId ?? '',
      name:         `${symA}/${symB}`,
      tvl:          Number(p.tvl ?? 0),
      volume24h:    Number(p.volumeUsd24h ?? p.volume24h ?? p.vol24h ?? 0),
      feeApr24h:    feeApr,
      rewardApr24h: rewardApr,
      totalApr24h:  feeApr + rewardApr,
      tokenA:       symA,
      tokenB:       symB,
    }
  })

  return { ok: true, data: pools }
}

interface MintInfo { symbol?: string }
interface RawPool {
  poolAddress?: string; id?: string; poolId?: string
  name?: string; poolName?: string
  tvl?: number | string
  volumeUsd24h?: number | string; volume24h?: number | string; vol24h?: number | string
  feeApr24h?: number | string; feeApr?: number | string
  rewardApr24h?: number | string; rewardApr?: number | string
  totalApr24h?: number | string; estApr?: number | string; apr24h?: number | string
  tokenASymbol?: string; mintA?: { mintInfo?: MintInfo } | string
  tokenBSymbol?: string; mintB?: { mintInfo?: MintInfo } | string
}

/** Enrich an execution preview with live Byreal pool data */
export async function enrichPreviewWithByreal(
  previewType: string,
): Promise<{ note?: string; topPool?: string; apr?: string }> {
  if (previewType === 'swap' || previewType === 'lp_open' || previewType === 'compound') {
    const pools = await byrealTopPools(3)
    if (pools.ok && pools.data && pools.data.length > 0) {
      const top = pools.data[0]
      return {
        note: 'Byreal live pool data',
        topPool: top.name,
        apr: top.totalApr24h ? `${top.totalApr24h.toFixed(1)}%` : undefined,
      }
    }
  }

  // Fallback: overview ping to show connectivity
  const ov = await byrealOverview()
  if (ov.ok) return { note: 'Byreal DEX connected' }
  return {}
}
