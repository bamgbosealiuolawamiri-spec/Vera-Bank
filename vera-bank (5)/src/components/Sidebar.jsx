import React from 'react'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'send', label: 'Send Money', icon: 'send' },
  { key: 'receive', label: 'Receive Money', icon: 'receive' },
  { key: 'bills', label: 'Pay Bills', icon: 'bills' },
  { key: 'transactions', label: 'Transactions', icon: 'history' },
  { key: 'cards', label: 'Cards', icon: 'card' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
  { key: 'help', label: 'Help', icon: 'help' },
]

export default function Sidebar({ active, onSelect, onLogout, open, onClose }) {
  return (
    <>
      <div className={'side-backdrop' + (open ? ' show' : '')} onClick={onClose} />
      <aside className={'sidebar' + (open ? ' open' : '')}>
        <div className="brand"><Logo onDark /></div>
        <nav className="side-nav" aria-label="Dashboard">
          {NAV.map((n) => (
            <button key={n.key} className={active === n.key ? 'active' : ''} onClick={() => onSelect(n.key)}
              aria-current={active === n.key ? 'page' : undefined}>
              <Icon name={n.icon} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 0, color: '#f0a8a0', padding: '12px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 14.5, fontWeight: 500 }}>
            <Icon name="logout" size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
