import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { executePreview, executeAutoRebalance } from '@/lib/agent/executor'
import type { ExecutionPreview } from '@/types'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  const { ok } = rateLimit(`execute:${ip}`, 10, 60_000) // stricter: 10/min
  if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  try {
    const body = await req.json()
    const { preview, autoRebalance, agentId } = body as {
      preview?: ExecutionPreview
      autoRebalance?: boolean
      agentId?: number | null
    }

    const resolvedAgentId = agentId ?? null

    if (autoRebalance) {
      const result = await executeAutoRebalance(resolvedAgentId)
      return NextResponse.json(result)
    }

    if (!preview?.id) {
      return NextResponse.json({ error: 'Missing execution preview' }, { status: 400 })
    }

    const result = await executePreview(preview, resolvedAgentId)
    return NextResponse.json(result)
  } catch (e) {
    console.error('execute', e)
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
