import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { parseChatIntent } from '@/lib/agent/intent'
import { createPreviewForIntent } from '@/lib/agent/executor'
import { enrichPreviewWithByreal } from '@/lib/agent/byreal'
import { toPositions } from '@/lib/mockData'
import type { RiskProfile } from '@/types'

function fallbackReply(message: string, riskProfile: string, portfolioTotal: number): string {
  const t = message.toLowerCase()
  const val = portfolioTotal > 0 ? `**$${portfolioTotal.toFixed(2)}**` : 'your wallet'
  if (t.includes('yield') || t.includes('best') || t.includes('earn'))
    return `Top yield opportunities on Mantle right now:\n\n• **mETH** — ~5% APR, stake ETH passively (just hold it)\n• **Lendle USDC** — ~8% APY, lend stablecoins with no impermanent loss\n• **Merchant Moe MNT/USDC LP** — ~12-18% APR, higher risk with IL\n\nFor ${val} at **${riskProfile}** risk, I'd start with mETH or Lendle. Want me to swap into mETH? Try: *"Swap $10 of MNT to mETH"*`
  if (t.includes('risk') || t.includes('safe') || t.includes('reduce') || t.includes('rebalanc'))
    return `To reduce risk on ${val} with a **${riskProfile}** profile, I'd suggest moving some MNT into USDC to lock in stability, then deploying the USDC into **Lendle** for ~8% APY with no price risk.\n\nTry: *"Swap $20 of MNT to USDC"*`
  if (t.includes('swap'))
    return `I can execute swaps on Mantle via OpenOcean DEX aggregator — best price across all liquidity sources.\n\nSupported tokens: **MNT, USDC, USDT, WETH, mETH**\n\nTell me exactly what you want, e.g.:\n• *"Swap $5 of MNT to USDC"*\n• *"Swap $10 of MNT to mETH"*`
  if (t.includes('portfolio') || t.includes('balance') || t.includes('worth'))
    return `Your live Mantle portfolio is worth ${val}. I track MNT, USDC, USDT, WETH, and mETH balances in real-time.\n\nTo grow it, the simplest move is swapping some MNT into a yield-bearing asset like **mETH** (~5% APR) or **USDC on Lendle** (~8% APY).`
  if (t.includes('mnt') || t.includes('mantle'))
    return `MNT is the native token of Mantle Network. You can:\n• **Hold** — speculate on price appreciation\n• **Swap to USDC** — lock in value as a stablecoin\n• **Swap to mETH** — earn ~5% APR passively\n• **Provide liquidity** — earn trading fees in MNT/USDC pools\n\nWhat would you like to do with your MNT?`
  return `I'm your Personal CFO Agent on Mantle Network, monitoring ${val}.\n\nI can help you:\n💱 **Swap tokens** — *"Swap $5 of MNT to USDC"*\n🌾 **Find yield** — *"Best yield right now?"*\n⚖️ **Reduce risk** — *"Move me to a safer position"*\n📊 **Analyse** — *"What's my portfolio worth?"*\n\nWhat would you like to do?`
}

export const runtime = 'nodejs'

// Gemini free-tier model — fast and capable
const GEMINI_MODEL = 'gemini-2.0-flash'

export async function POST(req: NextRequest) {
  // Rate limit: 20 requests/min per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  const { ok } = rateLimit(`agent:${ip}`, 20, 60_000)
  if (!ok) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await req.json()
  const {
    history,
    riskProfile = 'balanced',
    portfolioTotal = 0,
    positions = [],
    autoExecute = false,
  } = body
  // Clamp message to prevent prompt injection / oversized payloads
  const message = typeof body.message === 'string'
    ? body.message.slice(0, 1000)
    : ''
  if (!message) {
    return new Response(
      JSON.stringify({ error: 'Message is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is required. Add it to .env.local. Get a free key at aistudio.google.com' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Only generate a transaction preview for explicit swap requests.
  // Risk/yield/compound intents should give advice only — not trigger executor.
  const intent = parseChatIntent(message)
  const risk = riskProfile as RiskProfile
  const positionRows = toPositions(positions)
  const isExplicitSwap = /\bswap\b/i.test(message)
  const rawPreview = isExplicitSwap
    ? createPreviewForIntent(message, risk, portfolioTotal, positionRows)
    : null
  // Only send swap-type previews to the client — lp_open/compound/risk_reduce
  // cannot execute via MetaMask and cause confusing "USDC → USDC" errors
  const preview = rawPreview?.type === 'swap' ? rawPreview : null

  if (preview) {
    const enrichment = await enrichPreviewWithByreal(preview.type)
    if (enrichment.topPool) preview.pool = enrichment.topPool
    if (enrichment.apr) preview.expectedApr = `+${enrichment.apr}`
  }

  const positionSummary = positions.length
    ? positions.map((p: { name: string; type: string; value: number }) =>
        `${p.name} (${p.type}): $${p.value.toFixed(2)}`,
      ).join('; ')
    : 'No open positions — wallet balances only.'

  const systemPrompt = `You are a Personal CFO Agent running on Mantle Network (chainId 5000).

USER CONTEXT:
- Risk profile: ${risk}
- Live portfolio total: $${portfolioTotal.toFixed(2)}
- Positions: ${positionSummary}

MANTLE DEFI KNOWLEDGE:
- MNT is the native token of Mantle Network. Current approximate price: $${(parseFloat(process.env.MNT_USD_PRICE || '0.7')).toFixed(4)}
- Swaps execute via OpenOcean DEX aggregator (best price routing across all Mantle DEXes)
- Supported swap tokens: MNT (native), USDC, USDT, WETH, mETH, WMNT
- mETH = staked ETH on Mantle, earns ~4-6% APR automatically just by holding
- Lendle is a lending protocol on Mantle — supply USDC to earn ~5-9% APY
- Merchant Moe is a leading DEX on Mantle with MNT/USDC LP pools
- Agni Finance is a concentrated liquidity DEX (Uniswap V3 style) on Mantle

SWAP INSTRUCTIONS (when user asks to swap):
- Tell them to use the exact phrase: "Swap $[amount] of [TOKEN] to [TOKEN]"
- Example: "Swap $10 of MNT to USDC"
- You will generate a preview they must confirm before anything executes
- Their funds never move until they approve in MetaMask

RULES:
- Be concise, confident, and specific — like a real financial advisor
- Never invent balances or transactions — only reference the live data provided
- Format key numbers in **bold**
- When suggesting a swap, always include the exact command they can copy
- If portfolio is empty, focus on how to get started with a first swap
- Provide specific ROI estimates when relevant (e.g. "At 5% APY, $100 becomes $105 in a year")
- Always mention risk when recommending volatile assets`

  // Build Gemini contents array (interleaved user/model turns)
  type GeminiRole = 'user' | 'model'
  const contents: { role: GeminiRole; parts: { text: string }[] }[] = [
    ...(history || []).slice(-6).map((m: { role: string; content: string }) => ({
      role: (m.role === 'agent' ? 'model' : 'user') as GeminiRole,
      parts: [{ text: m.content }],
    })),
    { role: 'user' as GeminiRole, parts: [{ text: message }] },
  ]

  // Gemini streaming endpoint
  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

  const geminiRes = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  })

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '')
    console.error('Gemini API error:', geminiRes.status, errText)

    // 429 = rate limit — use smart fallback instead of an error
    if (geminiRes.status === 429) {
      const reply = fallbackReply(message, riskProfile, portfolioTotal)
      const metaFallback = { preview: preview ?? null, needsConfirm: !!preview && !autoExecute }
      const enc = new TextEncoder()
      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify(metaFallback)}\n\n`))
          // Stream word by word for the typing effect
          const words = reply.split(' ')
          let i = 0
          const tick = () => {
            if (i >= words.length) {
              controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`))
              controller.close()
              return
            }
            const chunk = (i === 0 ? '' : ' ') + words[i++]
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`))
            setTimeout(tick, 30)
          }
          tick()
        },
      })
      return new Response(fallbackStream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }

    return new Response(
      JSON.stringify({ error: `Gemini API error ${geminiRes.status}. Check GEMINI_API_KEY.` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // SSE metadata event
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const metaPayload = { preview: preview ?? null, needsConfirm: !!preview && !autoExecute }

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: meta\ndata: ${JSON.stringify(metaPayload)}\n\n`),
      )

      const reader = geminiRes.body!.getReader()
      let buf = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })

          // Process complete SSE lines
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw || raw === '[DONE]') continue
            try {
              const evt = JSON.parse(raw)
              // Gemini delta: candidates[0].content.parts[0].text
              const text: string =
                evt?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
              if (text) {
                controller.enqueue(
                  encoder.encode(`event: delta\ndata: ${JSON.stringify({ text })}\n\n`),
                )
              }
              // finishReason signals end
              if (evt?.candidates?.[0]?.finishReason) {
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`))
              }
            } catch { /* non-JSON */ }
          }
        }
        // flush remainder
        if (buf.startsWith('data: ')) {
          try {
            const evt = JSON.parse(buf.slice(6).trim())
            const text: string = evt?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            if (text) {
              controller.enqueue(
                encoder.encode(`event: delta\ndata: ${JSON.stringify({ text })}\n\n`),
              )
            }
          } catch { /* ignore */ }
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`))
      } finally {
        reader.releaseLock()
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
