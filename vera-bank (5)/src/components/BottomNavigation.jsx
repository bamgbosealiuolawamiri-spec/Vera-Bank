import React from 'react'
import Icon from './Icon.jsx'

// Mobile-app bottom tab bar: Home, Send, Receive, Settings.
const TABS = [
  { key: 'home', label: 'Home', icon: 'home', to: '/app/home' },
  { key: 'send', label: 'Send', icon: 'send', to: '/app/send' },
  { key: 'receive', label: 'Receive', icon: 'receive', to: '/app/receive' },
  { key: 'settings', label: 'Settings', icon: 'settings', to: '/app/settings' },
]

export default function BottomNavigation({ active, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((t) => (
        <button key={t.key} className={'bn-item' + (active === t.key ? ' active' : '')}
          onClick={() => onNavigate(t.to)} aria-current={active === t.key ? 'page' : undefined}>
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
