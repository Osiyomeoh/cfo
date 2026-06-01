'use client'
import { useState } from 'react'
import { AgentProvider, useAgent } from '@/context/AgentProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { Dashboard } from '@/components/Dashboard'
import { LandingPage } from '@/components/landing/LandingPage'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'

// ── Read routing state directly from localStorage (sync, SSR-safe) ──
function getInitialScreen(): 'landing' | 'onboarding' | 'app' {
  if (typeof window === 'undefined') return 'landing'
  try {
    const raw = localStorage.getItem('pfo-user-settings')
    const onboardingComplete = raw ? JSON.parse(raw)?.onboardingComplete === true : false
    // Only skip landing page if the user has fully completed onboarding
    return onboardingComplete ? 'app' : 'landing'
  } catch {
    return 'landing'
  }
}

// ── Inner shell — reads live settings for onboarding completion ──
function AppShell({
  screen,
  setScreen,
  demo,
  setDemo,
}: {
  screen: 'landing' | 'onboarding' | 'app'
  setScreen: (s: 'landing' | 'onboarding' | 'app') => void
  demo: boolean
  setDemo: (v: boolean) => void
}) {
  const { settings } = useAgent()

  // Onboarding just finished — advance to app
  if (screen === 'onboarding' && settings.onboardingComplete) {
    setScreen('app')
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        onLaunch={() => {
          localStorage.setItem('cfo-launched', '1')
          setScreen('onboarding')
        }}
        onDemo={() => {
          localStorage.setItem('cfo-launched', '1')
          setDemo(true)
          setScreen('app')
        }}
      />
    )
  }

  if ((screen === 'onboarding' || screen === 'app') && !demo && !settings.onboardingComplete) {
    return <OnboardingFlow />
  }

  return <Dashboard demo={demo} />
}

// ── Root — screen state lives here, above all providers ──
export default function Home() {
  const [screen, setScreen] = useState<'landing' | 'onboarding' | 'app'>(getInitialScreen)
  const [demo, setDemo] = useState(false)

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AgentProvider demo={demo}>
          <AppShell
            screen={screen}
            setScreen={setScreen}
            demo={demo}
            setDemo={setDemo}
          />
        </AgentProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
