import { Contract, JsonRpcProvider, Wallet, ethers, type EventLog } from 'ethers'
import { getActiveChain, explorerTxUrl } from '@/lib/chain'
import { REGISTRY_ABI, registryAddress } from '@/lib/contracts/registryAbi'
import type { ActionEntry, ExecutionPreview, RiskProfile } from '@/types'

export function buildAgentRegistrationJson(params: {
  wallet: string
  riskProfile: RiskProfile
  goals: string[]
  agentId?: number
  registry?: string
}) {
  const chain = getActiveChain()
  const reg = params.registry || registryAddress() || '0x0000000000000000000000000000000000000000'
  const agentRegistry = `eip155:${chain.chainId}:${reg}`

  return {
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
    name: 'Personal CFO Agent',
    description: 'Autonomous on-chain wealth manager on Mantle Network',
    image: 'https://personal-cfo-agent.vercel.app/og-agent.png',
    services: [
      {
        name: 'A2A',
        endpoint: 'https://personal-cfo-agent.vercel.app/api/agent',
        version: '1.0',
      },
    ],
    registrations: params.agentId
      ? [{ agentId: params.agentId, agentRegistry }]
      : [],
    supportedTrust: ['reputation', 'crypto-economic'],
    x402Support: false,
    metadata: {
      wallet: params.wallet,
      riskProfile: params.riskProfile,
      goals: params.goals,
      chain: chain.name,
    },
  }
}

export function agentUriDataUrl(json: object): string {
  const b64 = Buffer.from(JSON.stringify(json)).toString('base64')
  return `data:application/json;base64,${b64}`
}

function getProvider(): JsonRpcProvider {
  const chain = getActiveChain()
  return new JsonRpcProvider(chain.rpcUrl, chain.chainId)
}

export async function getAgentIdForWallet(wallet: string): Promise<number | null> {
  const addr = registryAddress()
  if (!addr) return null
  const contract = new Contract(addr, REGISTRY_ABI, getProvider())
  const id = await contract.agentIdByWallet(wallet)
  const n = Number(id)
  return n > 0 ? n : null
}

export async function getAgentOnChainStats(agentId: number): Promise<{
  executions: number
  repScore: number
} | null> {
  const addr = registryAddress()
  if (!addr) return null
  const contract = new Contract(addr, REGISTRY_ABI, getProvider())
  const rec = await contract.records(agentId)
  const executions = Number(rec.executions ?? rec[0] ?? 0)
  const repScore = Number(await contract.reputationScore(agentId))
  return { executions, repScore }
}

export async function recordExecutionOnChain(
  agentId: number,
  preview: ExecutionPreview,
  txHash: string,
): Promise<{ txHash: string; erc8004Updated: boolean }> {
  const addr = registryAddress()
  const key = process.env.EXECUTOR_PRIVATE_KEY
  if (!addr || !key) {
    return { txHash, erc8004Updated: false }
  }

  const provider = getProvider()
  const wallet = new Wallet(key, provider)
  const contract = new Contract(addr, REGISTRY_ABI, wallet)

  const actionHash = ethers.keccak256(
    ethers.toUtf8Bytes(`${preview.id}:${preview.type}:${txHash}`),
  )

  // Convert USD amount to cents (integer) for the spend cap check
  const amountCents = Math.round((preview.amountUsd ?? 0) * 100)

  try {
    const tx = await contract.recordExecution(
      agentId,
      actionHash,
      preview.type,
      amountCents,
    )
    const receipt = await tx.wait()
    return {
      txHash: receipt?.hash || tx.hash,
      erc8004Updated: true,
    }
  } catch (err: unknown) {
    // Contract reverts (rate limit, spend cap, etc.) should not crash the app
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('ERC-8004 recordExecution reverted:', msg)
    return { txHash, erc8004Updated: false }
  }
}

export async function fetchExecutionHistory(agentId: number, limit = 30): Promise<ActionEntry[]> {
  const addr = registryAddress()
  if (!addr) return []

  const provider = getProvider()
  const contract = new Contract(addr, REGISTRY_ABI, provider)
  const current = await provider.getBlockNumber()
  const from = Math.max(0, current - 200_000)

  let events: EventLog[] = []
  try {
    const filter = contract.filters.ExecutionRecorded(agentId)
    events = (await contract.queryFilter(filter, from, current)) as EventLog[]
  } catch {
    return []
  }

  return events
    .slice(-limit)
    .reverse()
    .map((ev, i) => {
      const args = ev.args as unknown as { actionHash?: string; actionType?: string; totalExecutions?: bigint }
      const actionType = String(args?.actionType ?? 'execution')
      const hash = ev.transactionHash
      const short = hash.length > 14 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash
      const category =
        actionType.includes('swap') ? 'swap'
        : actionType.includes('perp') || actionType.includes('risk') ? 'perp'
        : actionType.includes('compound') ? 'lp'
        : 'lp'

      return {
        id: `chain-${hash}-${i}`,
        type: 'exec' as const,
        title: actionType.replace(/_/g, ' '),
        desc: `On-chain execution #${String(args?.totalExecutions ?? '')}`,
        time: new Date().toLocaleString(),
        txHash: short,
        txHashFull: hash,
        explorerUrl: explorerTxUrl(hash),
        category,
      }
    })
}

export function encodeRegisterAgentCalldata(agentURI: string): string | null {
  const addr = registryAddress()
  if (!addr) return null
  const iface = new ethers.Interface(REGISTRY_ABI)
  return iface.encodeFunctionData('registerAgent', [agentURI])
}
