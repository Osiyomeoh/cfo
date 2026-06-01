const MNT_COINGECKO = 'https://api.coingecko.com/api/v3/simple/price?ids=mantle,ethereum&vs_currencies=usd'

let cache: { mnt: number; eth: number; ts: number } | null = null

export async function fetchTokenPrices(): Promise<{ mntUsd: number; ethUsd: number }> {
  const envMnt = parseFloat(process.env.MNT_USD_PRICE || '')
  const envEth = parseFloat(process.env.ETH_USD_PRICE || '')

  if (cache && Date.now() - cache.ts < 60_000) {
    return { mntUsd: cache.mnt, ethUsd: cache.eth }
  }

  try {
    const res = await fetch(MNT_COINGECKO, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json() as { mantle?: { usd?: number }; ethereum?: { usd?: number } }
      const mntUsd = data.mantle?.usd ?? (Number.isFinite(envMnt) ? envMnt : 1.2)
      const ethUsd = data.ethereum?.usd ?? (Number.isFinite(envEth) ? envEth : 3200)
      cache = { mnt: mntUsd, eth: ethUsd, ts: Date.now() }
      return { mntUsd, ethUsd }
    }
  } catch {
    /* fall through */
  }

  return {
    mntUsd: Number.isFinite(envMnt) ? envMnt : 1.2,
    ethUsd: Number.isFinite(envEth) ? envEth : 3200,
  }
}
