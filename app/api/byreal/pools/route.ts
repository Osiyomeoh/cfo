import { NextResponse } from 'next/server'
import { byrealTopPools, byrealOverview } from '@/lib/agent/byreal'
import { rateLimit } from '@/lib/rateLimit'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'
  const { ok } = rateLimit(`byreal:${ip}`, 30, 60_000)
  if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const [pools, overview] = await Promise.all([
    byrealTopPools(8),
    byrealOverview(),
  ])

  return NextResponse.json({
    pools: pools.ok ? pools.data : [],
    overview: overview.ok ? overview.data : null,
    source: 'byreal-rest-api',
    ts: Date.now(),
  })
}
