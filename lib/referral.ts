/**
 * Referral system
 * - Each wallet gets a deterministic referral code (first 8 chars of address)
 * - Referral codes are passed via ?ref=XXXXX URL param
 * - Referred users get 0.05% fee discount (fee goes from 0.15% to 0.10%)
 * - Stored in localStorage
 */

const REF_KEY = 'pfo-referral'

export function generateReferralCode(walletAddress: string): string {
  // Use chars 2-10 of the wallet address (skip 0x)
  return walletAddress.slice(2, 10).toUpperCase()
}

export function getReferralUrl(walletAddress: string): string {
  const code = generateReferralCode(walletAddress)
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://personal-cfo-agent-nine.vercel.app'
  return `${base}?ref=${code}`
}

export function readReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('ref')
}

export function saveReferral(code: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REF_KEY, code)
}

export function getSavedReferral(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REF_KEY)
}

export function getFeeBps(referredBy?: string): number {
  // Referred users pay 0.10% instead of 0.15%
  return referredBy ? 10 : 15
}
