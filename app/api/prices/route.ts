import { NextResponse } from 'next/server'
import { fetchTokenPrices } from '@/lib/prices'

export const runtime = 'nodejs'

export async function GET() {
  const prices = await fetchTokenPrices()
  return NextResponse.json({
    MNT: prices.mntUsd,
    ETH: prices.ethUsd,
    USDC: 1,
    USDT: 1,
    mETH: prices.ethUsd * 1.04, // mETH ≈ ETH + staking premium
  }, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
  })
}
