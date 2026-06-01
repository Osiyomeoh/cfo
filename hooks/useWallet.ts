'use client'
import { useState, useCallback } from 'react'
import { BrowserProvider } from 'ethers'
import { getActiveChain } from '@/lib/chain'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      isMetaMask?: boolean
    }
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      if (!window.ethereum) {
        setError('Install MetaMask or a Web3 wallet')
        return null
      }
      const chain = getActiveChain()
      const provider = new BrowserProvider(window.ethereum)
      await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }])
      const accounts = await provider.send('eth_requestAccounts', [])
      const acc = accounts[0] as string
      setAddress(acc)

      try {
        const network = await provider.getNetwork()
        if (Number(network.chainId) !== chain.chainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chain.chainId.toString(16)}` }],
          })
        }
      } catch {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chain.chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
            }],
          })
        } catch {
          /* user declined network switch */
        }
      }
      return acc
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
      return null
    } finally {
      setConnecting(false)
    }
  }, [])

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  /** Send a pre-built transaction via MetaMask — returns txHash */
  const sendSwap = useCallback(async (tx: {
    to: string
    data: string
    value: string
    gasLimit: string
  }): Promise<string | null> => {
    if (!window.ethereum || !address) return null
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: tx.to,
          data: tx.data,
          value: tx.value,
          gas: tx.gasLimit,
        }],
      }) as string
      return txHash
    } catch (e) {
      console.error('sendSwap error', e)
      return null
    }
  }, [address])

  return { address, shortAddress, connecting, error, connect, setAddress, sendSwap }
}
