import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import BalanceCard from '../../components/BalanceCard.jsx'
import TransactionItem from '../../components/TransactionItem.jsx'
import Modal from '../../components/Modal.jsx'
import { LoadingBlock, EmptyState } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatMoney, formatDate } from '../../data/demoData.js'

const QUICK = [
  { key: 'send', label: 'Send', icon: 'send', tint: 'qi-blue', to: '/app/send' },
  { key: 'receive', label: 'Receive', icon: 'receive', tint: 'qi-green', to: '/app/receive' },
  { key: 'bills', label: 'Pay Bills', icon: 'bills', tint: 'qi-amber', to: '/app/bills' },
  { key: 'cards', label: 'My Cards', icon: 'card', tint: 'qi-navy', to: '/app/cards' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [txns, setTxns] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    bank.getAccount().then(setAccount)
    bank.getTransactions().then((t) => setTxns(t))
    bank.getNotifications().then(setNotifs)
  }, [])

  const name = (user?.name || 'BABAJIDE ADESINA').split(' ')[0]
  const initials = user?.initials || 'BA'
  const unread = notifs.filter((n) => n.unread).length
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="app-pad-b">
      <div className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="avatar">{initials}</span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{greet},</div>
            <b style={{ fontSize: 16 }}>{name}</b>
          </div>
        </div>
        <button className="icon-btn" onClick={() => setShowNotif(true)} aria-label="Notifications">
          <Icon name="bell" />{unread > 0 && <span className="dot" />}
        </button>
      </div>

      <div className="app-pad" style={{ paddingTop: 6 }}>
        {account ? <BalanceCard account={account} /> : <LoadingBlock label="Loading your balance\u2026" />}

        <div className="quick-grid" style={{ marginTop: 20 }}>
          {QUICK.map((q) => (
            <button key={q.key} className="quick" onClick={() => navigate(q.to)}>
              <span className={'qi ' + q.tint}><Icon name={q.icon} size={22} /></span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        <div className="section-title">
          <h3>Recent Transactions</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/app/transactions')}>See All</button>
        </div>
        <div className="list-card">
          {txns === null ? <LoadingBlock height={120} />
            : txns.length === 0 ? <EmptyState icon="history" title="No transactions yet" message="Your activity will appear here." />
              : txns.slice(0, 5).map((t) => <TransactionItem key={t.id} txn={t} onClick={() => setDetail(t)} />)}
        </div>
      </div>

      <Modal open={showNotif} onClose={() => setShowNotif(false)} title="Notifications">
        {notifs.length === 0 ? <EmptyState icon="bell" title="All caught up" message="You have no notifications." />
          : notifs.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span className={'ti ' + (n.kind === 'credit' ? 'credit' : 'debit')} style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: n.kind === 'security' ? 'rgba(21,94,239,.12)' : n.kind === 'credit' ? 'var(--success-soft)' : 'var(--surface-alt)', color: n.kind === 'security' ? 'var(--vera-blue)' : n.kind === 'credit' ? 'var(--vera-green-dark)' : 'var(--text-secondary)' }}>
                <Icon name={n.kind === 'security' ? 'shield' : n.kind === 'credit' ? 'receive' : 'bell'} size={19} />
              </span>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14 }}>{n.title}</b>
                <div className="muted" style={{ fontSize: 13 }}>{n.body}</div>
                <small className="muted">{n.time}</small>
              </div>
            </div>
          ))}
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Transaction Details">
        {detail && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div className={'t-amt ' + detail.type} style={{ fontSize: 30, fontWeight: 800, color: detail.type === 'credit' ? 'var(--vera-green-dark)' : 'var(--text-primary)' }}>
                {detail.type === 'credit' ? '+' : '\u2212'}{formatMoney(detail.amount)}
              </div>
              <span className={'badge ' + (detail.status === 'pending' ? 'badge-gray' : 'badge-green')} style={{ marginTop: 8 }}>{detail.status}</span>
            </div>
            {[['Recipient / Sender', detail.party], ['Description', detail.description], ['Date', formatDate(detail.date, { dateStyle: 'medium', timeStyle: 'short' })], ['Reference', detail.reference], ['Type', detail.type === 'credit' ? 'Credit' : 'Debit']].map(([k, v]) => (
              <div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
