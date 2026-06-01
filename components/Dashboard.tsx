'use client'
import { useState } from 'react'
import { LayoutDashboard, Wallet, MessageSquare, Menu, BarChart2, Building2, Settings, GraduationCap, Shield } from 'lucide-react'
import { SideNav, type AppView } from '@/components/layout/SideNav'
import { PortfolioPanel } from '@/components/portfolio/PortfolioPanel'
import { MainDashboard } from '@/components/feed/MainDashboard'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { PositionsView } from '@/components/views/PositionsView'
import { AnalyticsView } from '@/components/views/AnalyticsView'
import { TreasuryView } from '@/components/views/TreasuryView'
import { SettingsView } from '@/components/views/SettingsView'
import { LearnView } from '@/components/views/LearnView'
import { ReputationView } from '@/components/views/ReputationView'
import { useAgent } from '@/context/AgentProvider'
import { cn } from '@/lib/utils'

// Mobile tab type — which panel is visible
type MobileTab = 'dashboard' | 'portfolio' | 'chat' | 'more'

const MOBILE_TABS: { id: MobileTab; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home',      Icon: LayoutDashboard },
  { id: 'portfolio', label: 'Portfolio', Icon: Wallet },
  { id: 'chat',      label: 'CFO Chat',  Icon: MessageSquare },
  { id: 'more',      label: 'More',      Icon: Menu },
]

// "More" menu maps to desktop views
const MORE_VIEWS: { id: AppView; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'positions', label: 'Positions', Icon: BarChart2 },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'treasury',  label: 'Treasury',  Icon: Building2 },
  { id: 'learn',     label: 'Learn',     Icon: GraduationCap },
  { id: 'settings',    label: 'Settings',    Icon: Settings },
  { id: 'reputation',  label: 'Reputation',  Icon: Shield },
]

export function Dashboard({ demo = false }: { demo?: boolean }) {
  const [view, setView]           = useState<AppView>('dashboard')
  const [mobileTab, setMobileTab] = useState<MobileTab>('dashboard')

  const {
    portfolio, positions, allocations, actions, agent, portfolioLive,
    activePosition, setActivePosition,
    messages, input, isTyping, mode, setInput, sendMessage, setMode,
    confirmExecution, cancelPreview, updatePreviewAmount,
    pendingPreview, settings, wallet, disconnect,
  } = useAgent()

  return (
    <div className="pro-app" style={{ flexDirection: 'column' }}>
      {/* ── Demo banner ── */}
      {demo && (
        <div style={{
          background: 'var(--pro-accent)', color: '#000',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          textAlign: 'center', padding: '6px 16px', letterSpacing: '0.06em', flexShrink: 0,
        }}>
          ⚡ DEMO MODE — Live data simulation · No wallet required ·{' '}
          <button type="button" onClick={() => { localStorage.removeItem('cfo-launched'); window.location.reload() }}
            style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#000', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>
            Exit Demo
          </button>
        </div>
      )}

      {/* ── Main row (desktop: side by side, mobile: managed by CSS classes) ── */}
      <div className="pro-app" style={{ flex: 1, minHeight: 0 }}>

        {/* Desktop side nav — hidden on mobile via CSS */}
        <SideNav
          view={view}
          onView={v => { setView(v); setMobileTab('more') }}
          walletLabel={wallet.shortAddress}
          onDisconnect={disconnect}
        />

        {/* Portfolio sidebar — hidden on mobile unless portfolio tab active */}
        <div className={cn('pro-sidebar', mobileTab === 'portfolio' && 'pro-sidebar--mobile-active')}>
          <PortfolioPanel
            portfolio={portfolio}
            positions={positions}
            allocations={allocations}
            activePosition={activePosition}
            onSelectPosition={setActivePosition}
            walletLabel={wallet.shortAddress}
            portfolioLive={portfolioLive}
            onDisconnect={disconnect}
          />
        </div>

        {/* Main content — hidden on mobile when portfolio/chat/more is active */}
        <div className={cn(
          'pro-main',
          (mobileTab === 'portfolio' || mobileTab === 'chat') && 'pro-main--mobile-hidden',
        )}>
          {/* Always render based on `view`; CSS hides this panel on mobile when portfolio/chat tab is active */}
          {view === 'dashboard' && (
            <MainDashboard
              portfolio={portfolio}
              actions={actions}
              onStrategy={() => { setView('settings'); setMobileTab('more') }}
              onCommand={msg => { void sendMessage(msg); setMobileTab('chat') }}
            />
          )}
          {view === 'positions' && <PositionsView positions={positions} onChat={msg => { void sendMessage(msg); setMobileTab('chat') }} />}
          {view === 'analytics' && <AnalyticsView portfolio={portfolio} />}
          {view === 'treasury'  && <TreasuryView />}
          {view === 'learn'     && <LearnView onCommand={msg => { void sendMessage(msg); setView('dashboard'); setMobileTab('chat') }} />}
          {view === 'settings'   && <SettingsView agent={agent} walletLabel={wallet.shortAddress} />}
          {view === 'reputation' && <ReputationView />}
        </div>

        {/* Chat panel — hidden on mobile unless chat tab active */}
        <div className={cn('pro-chat', mobileTab === 'chat' && 'pro-chat--mobile-active')}>
          <ChatPanel
            messages={messages}
            input={input}
            isTyping={isTyping}
            mode={mode}
            riskProfile={settings.riskProfile}
            onInput={setInput}
            onSend={sendMessage}
            onMode={setMode}
            onEditAmount={updatePreviewAmount}
            onAction={action => {
              if (action === 'Confirm' && pendingPreview) {
                void confirmExecution(pendingPreview)
              } else if (action === 'Skip') {
                cancelPreview()
              } else if (action !== 'Edit amount') {
                void sendMessage(action)
              }
            }}
          />
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="pro-mobile-tabs" aria-label="Main navigation">
        {MOBILE_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={cn('pro-mobile-tab', mobileTab === id && 'pro-mobile-tab--active')}
            onClick={() => {
              setMobileTab(id)
              if (id !== 'more') setView('dashboard')
            }}
            aria-current={mobileTab === id ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={mobileTab === id ? 2 : 1.5} />
            <span className="pro-mobile-tab__label">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Mobile "More" menu — shown inline when more tab active (mobile only) ── */}
      {mobileTab === 'more' && (
        <div
          className="pro-mobile-tabs pro-more-menu"
          style={{
            position: 'absolute',
            bottom: 56,
            left: 0,
            right: 0,
            background: 'var(--pro-surface)',
            borderTop: '1px solid var(--pro-border)',
            padding: '8px 4px',
            gap: 4,
            zIndex: 50,
            display: 'flex',
            flexWrap: 'wrap',
            height: 'auto',
          }}
        >
          {MORE_VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              style={{
                flex: '1 1 40%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: view === id ? 'var(--pro-accent-dim)' : 'transparent',
                border: '1px solid',
                borderColor: view === id ? 'var(--pro-border-accent)' : 'var(--pro-border)',
                borderRadius: 'var(--pro-radius)',
                color: view === id ? 'var(--pro-accent)' : 'var(--pro-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
