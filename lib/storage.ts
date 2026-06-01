import type { RiskProfile, UserSettings } from '@/types'

const KEY = 'pfo-user-settings'

export const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  riskProfile: 'balanced',
  goals: [],
  autoExecute: false,
}

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<UserSettings>): UserSettings {
  const next = { ...loadSettings(), ...settings }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(next))
  }
  return next
}

export function riskLabel(profile: RiskProfile): string {
  return profile.charAt(0).toUpperCase() + profile.slice(1)
}

export function riskBarPct(profile: RiskProfile): number {
  const map = { conservative: 25, balanced: 45, aggressive: 75 }
  return map[profile]
}
