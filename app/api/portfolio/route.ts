import { NextRequest, NextResponse } from 'next/server'
import { fetchWalletPortfolio } from '@/lib/portfolio'
import { fetchExecutionHistory, getAgentIdForWallet, getAgentOnChainStats } from '@/lib/erc8004'

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  const agentId = await getAgentIdForWallet(wallet)
  let agent = null
  let executions = 0
  if (agentId) {
    const stats = await getAgentOnChainStats(agentId)
    executions = stats?.executions ?? 0
    agent = { agentId, executions, repScore: stats?.repScore ?? 0 }
  }

  const data = await fetchWalletPortfolio(wallet, executions)
  const chainActions = agentId ? await fetchExecutionHistory(agentId) : []

  return NextResponse.json({
    ...data,
    agent,
    actions: chainActions,
  })
}
