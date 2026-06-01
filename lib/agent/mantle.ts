import { Wallet, ethers } from 'ethers'
import { getActiveChain } from '@/lib/chain'
import type { ExecutionPreview } from '@/types'

export function isMockExecutionMode(): boolean {
  if (process.env.EXECUTION_MOCK_MODE === 'true') return true
  if (process.env.EXECUTION_MOCK_MODE === 'false') return false
  return !process.env.EXECUTOR_PRIVATE_KEY
}

function deterministicMockHash(previewId: string): string {
  const hex = ethers.keccak256(ethers.toUtf8Bytes(`pfo-mantle:${previewId}`)).slice(2, 66)
  return `0x${hex}`
}

/** Submit a Mantle tx that anchors the execution (relayer wallet) */
export async function submitMantleExecutionAnchor(
  preview: ExecutionPreview,
): Promise<{ txHash: string; source: 'mantle' | 'mock' }> {
  if (isMockExecutionMode()) {
    return { txHash: deterministicMockHash(preview.id), source: 'mock' }
  }

  const key = process.env.EXECUTOR_PRIVATE_KEY
  if (!key) {
    return { txHash: deterministicMockHash(preview.id), source: 'mock' }
  }

  const chain = getActiveChain()
  const provider = new ethers.JsonRpcProvider(chain.rpcUrl, chain.chainId)
  const wallet = new Wallet(key, provider)

  const data = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'string', 'uint256'],
    [preview.type, preview.id, Math.floor(preview.amountUsd * 100)],
  )

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0,
    data: ethers.concat([ethers.id('PersonalCFOExecution'), data]),
  })
  const receipt = await tx.wait()
  return { txHash: receipt?.hash || tx.hash, source: 'mantle' }
}
