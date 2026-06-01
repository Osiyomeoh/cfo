import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

const OPENOCEAN_API = 'https://open-api.openocean.finance/v3/mantle'

// ── Fee config ────────────────────────────────────────────────────────────────
const FEE_BPS_DEFAULT = 15  // 0.15% standard fee
const FEE_BPS_REFERRED = 10 // 0.10% for referred users
const FEE_WALLET = process.env.FEE_WALLET_ADDRESS || '0x00224492F572944500AB4eb91E413cfA34770c60'

// Well-known Mantle mainnet token addresses
// MNT uses OpenOcean's native-token sentinel so the tx sends native value (not ERC20)
const NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const TOKENS: Record<string, string> = {
  MNT:  NATIVE,  // native MNT — OpenOcean wraps internally, sets tx.value correctly
  WMNT: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
  USDC: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
  USDT: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
  WETH: '0xdEAddEaDdeadDEadDEADDEaddEADDEaddead0000',
  mETH: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
}

// MNT price fallback (used for fee calc)
const MNT_USD = parseFloat(process.env.MNT_USD_PRICE || '0.7')

function resolveToken(symbol: string): string {
  const up = symbol.toUpperCase().trim()
  return TOKENS[up] ?? up
}

function calcFeeWei(amountUsd: number, feeBps: number): string {
  const feeUsd = (amountUsd * feeBps) / 10_000
  const feeMnt = feeUsd / MNT_USD
  return BigInt(Math.floor(feeMnt * 1e18)).toString()
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'
  const { ok } = rateLimit(`swap:${ip}`, 10, 60_000)
  if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const { tokenIn, tokenOut, amountUsd, walletAddress, referredBy } = await req.json() as {
    tokenIn?: string; tokenOut?: string; amountUsd?: number; walletAddress?: string; referredBy?: string
  }

  if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 })
  if (!amountUsd || amountUsd <= 0) return NextResponse.json({ error: 'amountUsd must be > 0' }, { status: 400 })

  // Apply referral discount
  const FEE_BPS = referredBy ? FEE_BPS_REFERRED : FEE_BPS_DEFAULT

  const tokenInAddr  = resolveToken(tokenIn  ?? 'MNT')
  const tokenOutAddr = resolveToken(tokenOut ?? 'USDC')

  // Convert USD → token amount (in human-readable units — OpenOcean takes decimals)
  // For 18-decimal tokens: amount in whole tokens. OpenOcean handles precision.
  const inDecimals = (tokenInAddr === TOKENS.USDC || tokenInAddr === TOKENS.USDT) ? 6 : 18
  const tokenPriceUsd = (tokenInAddr === TOKENS.USDC || tokenInAddr === TOKENS.USDT) ? 1 : MNT_USD
  const amountInTokens = amountUsd / tokenPriceUsd
  // OpenOcean wants human units (not wei) for the `amount` param
  const amountParam = amountInTokens.toFixed(inDecimals === 6 ? 2 : 6)

  // ── OpenOcean swap_quote ───────────────────────────────────────────────────
  const params = new URLSearchParams({
    inTokenAddress:  tokenInAddr,
    outTokenAddress: tokenOutAddr,
    amount:          amountParam,
    gasPrice:        '5',         // gwei — Mantle standard
    slippage:        '1',         // 1%
    account:         walletAddress,
  })

  let data: Record<string, unknown>
  try {
    const res = await fetch(`${OPENOCEAN_API}/swap_quote?${params}`, {
      signal: AbortSignal.timeout(15_000),
    })
    const json = await res.json() as { code: number; data?: Record<string, unknown>; error?: string }

    if (json.code !== 200 || !json.data) {
      console.error('OpenOcean error', json)
      return NextResponse.json(
        { error: `Swap quote failed: ${json.error ?? `code ${json.code}`}` },
        { status: 502 },
      )
    }
    data = json.data
  } catch (e) {
    return NextResponse.json(
      { error: `Swap API request failed: ${e instanceof Error ? e.message : 'timeout'}` },
      { status: 502 },
    )
  }

  const { to, data: calldata, value, estimatedGas, inAmount, outAmount, minOutAmount } = data as {
    to: string; data: string; value: string
    estimatedGas: number; inAmount: string; outAmount: string; minOutAmount: string
  }

  if (!to || !calldata) {
    return NextResponse.json({ error: 'No swap route found for this token pair on Mantle' }, { status: 404 })
  }

  const feeWei = calcFeeWei(amountUsd, FEE_BPS)
  const feeUsd = (amountUsd * FEE_BPS) / 10_000

  return NextResponse.json({
    // Swap transaction (MetaMask signs this)
    to,
    data:        calldata,
    // When tokenIn is native MNT, OpenOcean sets value = input amount (wei); encode as hex
    value:       (!value || value === '0') ? '0x0' : `0x${BigInt(value).toString(16)}`,
    gasLimit:    `0x${(estimatedGas + 50_000).toString(16)}`, // add buffer

    // Quote metadata
    inputAmount:  inAmount,
    outputAmount: outAmount,
    minOutput:    minOutAmount,
    priceImpact:  0,
    tokenIn:      tokenInAddr,
    tokenOut:     tokenOutAddr,

    // Fee — separate MNT transfer before swap
    fee: {
      recipient: FEE_WALLET,
      amountWei: feeWei,
      amountUsd: feeUsd,
      bps:       FEE_BPS,
      label:     `CFO Agent fee (${FEE_BPS / 100}%)`,
    },
  })
}
