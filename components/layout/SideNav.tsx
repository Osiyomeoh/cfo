'use client'
import {
  LayoutDashboard,
  PieChart,
  LineChart,
  Building2,
  GraduationCap,
  Settings,
  LogOut,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PriceTicker } from '@/components/layout/PriceTicker'

export type AppView = 'dashboard' | 'positions' | 'analytics' | 'treasury' | 'learn' | 'settings' | 'reputation'

const NAV: { id: AppView; icon: LucideIcon; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'positions', icon: PieChart, label: 'Positions' },
  { id: 'analytics', icon: LineChart, label: 'Analytics' },
  { id: 'treasury', icon: Building2, label: 'Treasury' },
  { id: 'learn', icon: GraduationCap, label: 'Learn' },
  { id: 'reputation', icon: Shield, label: 'Reputation' },
]

interface Props {
  view: AppView
  onView: (v: AppView) => void
  walletLabel?: string | null
  onDisconnect: () => void
}

export function SideNav({ view, onView, walletLabel, onDisconnect }: Props) {
  return (
    <nav className="pro-nav">
      <div className="pro-nav-logo" title="CFO Agent">CFO</div>

      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          onClick={() => onView(id)}
          className={cn('pro-nav-btn', view === id && 'pro-nav-btn--active')}
        >
          <Icon size={18} strokeWidth={1.75} />
        </button>
      ))}

      <div className="flex-1" />

      <PriceTicker />

      <ThemeToggle className="!w-[36px] !h-[36px] !p-0 justify-center border-0 bg-transparent hover:bg-[var(--pro-surface-muted)]" />

      <button
        type="button"
        title="Settings"
        onClick={() => onView('settings')}
        className={cn('pro-nav-btn', view === 'settings' && 'pro-nav-btn--active')}
      >
        <Settings size={18} strokeWidth={1.75} />
      </button>

      {/* Disconnect — prominent at the bottom */}
      <button
        type="button"
        title={walletLabel ? `Disconnect ${walletLabel}` : 'Disconnect'}
        onClick={onDisconnect}
        className="pro-nav-btn mb-2 mt-1"
        style={{
          color: 'var(--pro-negative)',
          border: '1px solid rgba(255,71,87,0.25)',
          borderRadius: 3,
        }}
      >
        <LogOut size={16} strokeWidth={2} />
      </button>
    </nav>
  )
}
