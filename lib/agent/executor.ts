import type { ActionEntry, ExecutionPreview, ExecutionResult, RiskProfile, Position } from '@/types'
import { buildPreview } from './strategies'
import {
  enrichPreviewWithByreal,
  byrealTopPools,
} from './byreal'
import { submitMantleExecutionAnchor, isMockExecutionMode } from './mantle'
import { recordExecutionOnChain } from '@/lib/erc8004'
import { explorerTxUrl } from '@/lib/chain'

function shortenHash(hash: string): string {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function actionFromPreview(preview: ExecutionPreview, fullHash: string): ActionEntry {
  const category =
    preview.type === 'swap' ? 'swap'
    : preview.type === 'risk_reduce' ? 'perp'
    : preview.type === 'compound' ? 'lp'
    : 'lp'

  return {
    id: `a-${Date.now()}`,
    type: 'exec',
    title: preview.title,
    desc: `Executed on Mantle · ${preview.pool || preview.to}`,
    time: 'just now',
    txHash: shortenHash(fullHash),
    txHashFull: fullHash,
    explorerUrl: explorerTxUrl(fullHash),
    category,
  }
}

export function createPreviewForIntent(
  intent: string,
  risk: RiskProfile,
  portfolioTotal: number,
  positions: Position[] = [],
): ExecutionPreview | null {
  const t = intent.toLowerCase()
  if (t.includes('yield') || t.includes('lp') || (t.includes('move') && t.includes('%'))) {
    return buildPreview('lp_open', risk, portfolioTotal, positions)
  }
  if (t.includes('risk') || t.includes('safe') || t.includes('reduce')) {
    return buildPreview('risk_reduce', risk, portfolioTotal, positions)
  }
  if (t.includes('compound')) {
    return buildPreview('compound', risk, portfolioTotal, positions)
  }
  if (t.includes('swap')) {
    return buildPreview('swap', risk, portfolioTotal, positions)
  }
  return null
}

export async function executePreview(
  preview: ExecutionPreview,
  agentId: number | null,
  options?: { byrealExecute?: boolean },
): Promise<ExecutionResult> {
  if (isMockExecutionMode()) {
    return {
      success: false,
      txHash: '',
      action: {
        id: 'failed',
        type: 'warn',
        title: 'Execution blocked',
        desc: 'Live mode requires EXECUTOR_PRIVATE_KEY and EXECUTION_MOCK_MODE=false',
        time: 'now',
        txHash: '—',
        category: 'system',
      },
      delta: 0,
      erc8004Updated: false,
      source: 'mock',
      message: 'Live execution is disabled. Set **EXECUTOR_PRIVATE_KEY** and **EXECUTION_MOCK_MODE=false** in `.env.local`, then restart the dev server.',
    }
  }

  const enrichment = await enrichPreviewWithByreal(preview.type)
  const byrealNote = enrichment.note ? ` · ${enrichment.note}` : ''

  const mantle = await submitMantleExecutionAnchor(preview)
  let erc8004Updated = false

  if (agentId) {
    const erc = await recordExecutionOnChain(agentId, preview, mantle.txHash)
    erc8004Updated = erc.erc8004Updated
  }

  const action = actionFromPreview(preview, mantle.txHash)
  const sources: ExecutionResult['source'][] = ['mantle', 'byreal-api']

  const aprNote = enrichment.apr ? ` · pool APR ${enrichment.apr}` : ''
  const poolNote = enrichment.topPool ? ` (${enrichment.topPool})` : ''

  return {
    success: true,
    txHash: shortenHash(mantle.txHash),
    txHashFull: mantle.txHash,
    explorerUrl: explorerTxUrl(mantle.txHash),
    action: {
      ...action,
      type: 'ok',
      desc: `${action.desc}${poolNote}${byrealNote}`,
    },
    delta: 0,
    erc8004Updated,
    source: 'mantle',
    sources,
    message: `Done. Tx confirmed on Mantle. **${preview.expectedApr || 'Position updated'}**${aprNote}.`,
  }
}

export async function executeAutoRebalance(agentId: number | null): Promise<ExecutionResult> {
  let poolName = 'Top Mantle LP'
  let apr = '+18.4%'
  const pools = await byrealTopPools(1)
  if (pools.ok && pools.data && pools.data.length > 0) {
    const top = pools.data[0]
    poolName = top.name
    if (top.totalApr24h) apr = `+${top.totalApr24h.toFixed(1)}%`
  }

  const preview: ExecutionPreview = {
    id: `auto-${Date.now()}`,
    type: 'rebalance',
    title: `Rebalance ${poolName}`,
    from: poolName,
    to: `${poolName} (optimized range)`,
    expectedApr: apr,
    gas: '~$0.03',
    amountUsd: 0,
    pool: poolName,
  }
  return executePreview(preview, agentId)
}
