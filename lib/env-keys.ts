/** Normalize hex private key from .env (with or without 0x prefix). */
export function normalizePrivateKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined
  const trimmed = key.trim()
  return trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
}
