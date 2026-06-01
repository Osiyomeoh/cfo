'use client'
import { useCallback, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { REGISTRY_ABI } from '@/lib/contracts/registryAbi'
import type { RiskProfile } from '@/types'

export function useAgentIdentity(registryAddress: string | undefined) {
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerOnChain = useCallback(async (
    wallet: string,
    agentURI: string,
  ): Promise<number | null> => {
    if (!registryAddress || !window.ethereum) return null
    setMinting(true)
    setError(null)
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(registryAddress, REGISTRY_ABI, signer)
      const tx = await contract.registerAgent(agentURI)
      const receipt = await tx.wait()
      const res = await fetch(`/api/identity?wallet=${wallet}`)
      const data = await res.json()
      return data.agentId ?? null
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mint failed')
      return null
    } finally {
      setMinting(false)
    }
  }, [registryAddress])

  const prepareAndMint = useCallback(async (
    wallet: string,
    riskProfile: RiskProfile,
    goals: string[],
  ): Promise<number | null> => {
    const res = await fetch('/api/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, riskProfile, goals }),
    })
    const data = await res.json()
    if (data.agentId) return data.agentId as number
    if (!data.agentURI) return null
    return registerOnChain(wallet, data.agentURI as string)
  }, [registerOnChain])

  return { minting, error, prepareAndMint, registerOnChain }
}
