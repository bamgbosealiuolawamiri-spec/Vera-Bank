import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Icon from '../../components/Icon.jsx'
import Modal from '../../components/Modal.jsx'
import { EmptyState } from '../../components/States.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { bank } from '../../services/api.js'
import { Overview, SendPanel, ReceivePanel } from './DashPanels1.jsx'
import { BillsPanel, TransactionsPanel, CardsPanel, SettingsPanel, HelpPanel } from './DashPanels2.jsx'

const TITLES = {
  dashboard: ['Dashboard', 'Welcome back \u2014 here\u2019s your money at a glance.'],
  send: ['Send Money', 'Transfer to any bank in seconds.'],
  receive: ['Receive Money', 'Share your details to get paid.'],
  bills: ['Pay Bills', 'Utilities, cable, internet and government.'],
  transactions: ['Transactions', 'Search and review your activity.'],
  cards: ['Cards', 'Manage your premium VERA card.'],
  settings: ['Settings', 'Profile and security controls.'],
  help: ['Help', 'Answers and support.'],
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [section, setSection] = useState('dashboard')
  const [drawer, setDrawer] = useState(false)
  const [account, setAccount] = useState(null)
  const [txns, setTxns] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  const refresh = useCallback(() => {
    bank.getAccount().then(setAccount)
    bank.getTransactions().then(setTxns)
  }, [])
  useEffect(() => { refresh(); bank.getNotifications().then(setNotifs) }, [refresh])

  const select = (key) => { setSection(key); setDrawer(false); if (['dashboard', 'transactions'].includes(key)) refresh() }
  const doLogout = () => { logout(); toast.info('Logged out', 'You have been signed out.'); navigate('/', { replace: true }) }
  const unread = notifs.filter((n) => n.unread).length
  const [title, subtitle] = TITLES[section]

  return (
    <div className="dash">
      <Sidebar active={section} onSelect={select} onLogout={doLogout} open={drawer} onClose={() => setDrawer(false)} />
      <div className="dash-main">
        <header className="dash-header">
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <button className="dash-hamburger" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" /></button>
            <div className="search"><Icon name="search" size={18} /><input placeholder="Search VERA\u2026" aria-label="Search" /></div>
          </div>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <button className="icon-btn" onClick={() => setShowNotif(true)} aria-label="Notifications"><Icon name="bell" />{unread > 0 && <span className="dot" />}</button>
            <span className="avatar" title={user?.name}>{user?.initials || 'BA'}</span>
          </div>
        </header>
        <div className="dash-body">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, letterSpacing: '-.02em' }}>{title}</h1>
            <p className="muted" style={{ marginTop: 4 }}>{subtitle}</p>
          </div>
          <div className="fade-in" key={section}>
            {section === 'dashboard' && <Overview account={account} txns={txns} onGo={select} />}
            {section === 'send' && <SendPanel onDone={() => { refresh(); }} />}
            {section === 'receive' && <ReceivePanel account={account} />}
            {section === 'bills' && <BillsPanel onDone={refresh} />}
            {section === 'transactions' && <TransactionsPanel />}
            {section === 'cards' && <CardsPanel />}
            {section === 'settings' && <SettingsPanel user={user} />}
            {section === 'help' && <HelpPanel />}
          </div>
        </div>
      </div>

      <Modal open={showNotif} onClose={() => setShowNotif(false)} title="Notifications">
        {notifs.length === 0 ? <EmptyState icon="bell" title="All caught up" message="No notifications." /> : notifs.map((n) => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', flexShrink: 0, background: n.kind === 'security' ? 'rgba(21,94,239,.12)' : n.kind === 'credit' ? 'var(--success-soft)' : 'var(--surface-alt)', color: n.kind === 'security' ? 'var(--vera-blue)' : n.kind === 'credit' ? 'var(--vera-green-dark)' : 'var(--text-secondary)' }}>
              <Icon name={n.kind === 'security' ? 'shield' : n.kind === 'credit' ? 'receive' : 'bell'} size={19} />
            </span>
            <div style={{ flex: 1 }}><b style={{ fontSize: 14 }}>{n.title}</b><div className="muted" style={{ fontSize: 13 }}>{n.body}</div><small className="muted">{n.time}</small></div>
          </div>
        ))}
      </Modal>
    </div>
  )
}
