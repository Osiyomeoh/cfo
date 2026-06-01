export const MANTLE_MAINNET = {
  chainId: 5000,
  name: 'Mantle',
  rpcUrl: process.env.MANTLE_RPC_URL || 'https://rpc.mantle.xyz',
  explorer: 'https://explorer.mantle.xyz',
}

export const MANTLE_TESTNET = {
  chainId: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: process.env.MANTLE_TESTNET_RPC_URL || 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
}

export function getActiveChain() {
  const useTestnet = process.env.NEXT_PUBLIC_MANTLE_TESTNET === 'true'
  return useTestnet ? MANTLE_TESTNET : MANTLE_MAINNET
}

export function explorerTxUrl(hash: string): string {
  const full = hash.includes('...') ? null : hash
  if (!full || !full.startsWith('0x') || full.length < 66) {
    return `${getActiveChain().explorer}`
  }
  return `${getActiveChain().explorer}/tx/${full}`
}

export function explorerAddressUrl(address: string): string {
  return `${getActiveChain().explorer}/address/${address}`
}

export function explorerNftUrl(registry: string, tokenId: number): string {
  return `${getActiveChain().explorer}/token/${registry}?a=${tokenId}`
}
