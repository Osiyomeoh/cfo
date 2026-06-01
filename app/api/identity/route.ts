import { NextRequest, NextResponse } from 'next/server'
import {
  agentUriDataUrl,
  buildAgentRegistrationJson,
  getAgentIdForWallet,
  getAgentOnChainStats,
} from '@/lib/erc8004'
import { registryAddress } from '@/lib/contracts/registryAbi'
import type { RiskProfile } from '@/types'

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 })
  }

  const registry = registryAddress()
  const agentId = await getAgentIdForWallet(wallet)
  const stats = agentId ? await getAgentOnChainStats(agentId) : null

  return NextResponse.json({
    registry,
    agentId,
    stats,
    registered: !!agentId,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, riskProfile = 'balanced', goals = [] } = await req.json() as {
      wallet?: string
      riskProfile?: RiskProfile
      goals?: string[]
    }

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
    }

    const registry = registryAddress()
    if (!registry) {
      return NextResponse.json({
        registered: false,
        mock: true,
        message: 'Deploy PersonalCFOAgentRegistry and set NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS',
      })
    }

    const existing = await getAgentIdForWallet(wallet)
    if (existing) {
      const stats = await getAgentOnChainStats(existing)
      return NextResponse.json({ registered: true, agentId: existing, stats })
    }

    const json = buildAgentRegistrationJson({
      wallet,
      riskProfile,
      goals,
      registry,
    })
    const agentURI = agentUriDataUrl(json)

    return NextResponse.json({
      registered: false,
      registry,
      agentURI,
      calldataHint: 'Call registerAgent(agentURI) from connected wallet',
      registrationJson: json,
    })
  } catch (e) {
    console.error('identity', e)
    return NextResponse.json({ error: 'Identity error' }, { status: 500 })
  }
}
