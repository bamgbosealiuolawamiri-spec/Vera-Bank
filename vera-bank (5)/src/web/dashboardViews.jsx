import React, { useState, useMemo } from 'react'
import { Card, Money, Badge, EmptyState, Button, Input, PhoneField } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch, summarize } from './dashboardData.js'
import { COUNTRIES } from '../data/seed.js'
import { countryByName, splitE164, validatePhone } from '../data/phone.js'

function Loading({ rows = 3 }) {
  return (
    <div className="stack gap-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 54, borderRadius: 12, background: 'linear-gradient(90deg,#eef1f6,#f7f9fc,#eef1f6)', backgroundSize: '200% 100%', animation: 'load 1.2s linear infinite' }} />
      ))}
    </div>
  )
}

function TxnRow({ t, onReceipt }) {
  const credit = t.type === 'credit'
  return (
    <tr onClick={() => onReceipt?.(t)} style={{ cursor: onReceipt ? 'pointer' : 'default' }}>
      <td data-l="Description">
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <span className={`ti ${credit ? 'credit' : 'debit'}`} style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center' }}>
            <Icon name={credit ? 'arrowDownLeft' : 'arrowUpRight'} size={16} />
          </span>
          <b>{t.title}</b>
        </div>
      </td>
      <td data-l="Category"><Badge tone={credit ? 'green' : 'gray'}>{t.category}</Badge></td>
      <td data-l="Date" className="muted">{t.dateLabel}</td>
      <td data-l="Amount" className={credit ? 'amt-c' : 'amt-d'} style={{ textAlign: 'right' }}>
        {credit ? '+' : '−'}<Money value={t.amount} />
      </td>
    </tr>
  )
}

export function Overview({ onTransfer, onPayBill, onAddMoney, onReceipt, refreshKey }) {
  const { api, user } = useApp()
  const { data: txns, loading } = useFetch(() => api.getTransactions(user.id), [user.id, refreshKey])
  const stats = useMemo(() => summarize(txns || []), [txns])
  const recent = (txns || []).slice(0, 6)

  const tiles = [
    { i: 'send', t: 'Send money', d: 'Transfer to anyone', c: 'qi-blue', on: onTransfer },
    { i: 'receipt', t: 'Pay a bill', d: 'Utilities & more', c: 'qi-green', on: onPayBill },
    { i: 'download', t: 'Add money', d: 'Top up your account', c: 'qi-navy', on: onAddMoney },
    { i: 'card', t: 'Manage cards', d: 'Freeze & control', c: 'qi-amber', on: () => onAddMoney('cards') },
  ]

  return (
    <div className="stack gap-6 fade-in">
      <div role="note" aria-label="Simulation notice" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 14, border: '1px solid #c9d9ff', background: '#f2f6ff', color: '#17356b' }}>
        <Icon name="shield" size={20} />
        <div><b style={{ display: 'block', marginBottom: 3 }}>VERA demo wallet</b><span style={{ fontSize: 13, lineHeight: 1.5 }}>This is a simulated experience. Balances, cards, payments and transfers shown here have no cash value and are not connected to real banks or payment networks.</span></div>
      </div>
      <div className="dash-grid">
        <div className="big-balance">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ color: '#cdd9f2', fontSize: 14 }}>Demo wallet balance</span>
            <div className="amt"><Money value={user.balance} /></div>
            <div className="meta">
              <div><small>Demo account number</small><b>{user.accountNumber}</b></div>
              <div><small>Account holder</small><b>{user.name}</b></div>
            </div>
          </div>
        </div>
        <div className="stack gap-4">
          <Card><small className="muted">Income this month</small>
            <div className="sv text-green"><Money value={stats.income} /></div>
            <span className="muted" style={{ fontSize: 13 }}><Icon name="trending" size={14} /> vs. last period</span>
          </Card>
          <Card><small className="muted">Spending this month</small>
            <div className="sv"><Money value={stats.spending} /></div>
            <span className="muted" style={{ fontSize: 13 }}>Across {(txns || []).filter(t => t.type === 'debit').length} payments</span>
          </Card>
        </div>
      </div>

      <div className="action-tiles">
        {tiles.map((a) => (
          <button key={a.t} className="action-tile" onClick={a.on}>
            <span className={`ai ${a.c}`}><Icon name={a.i} size={22} /></span>
            <div><b>{a.t}</b><br /><small>{a.d}</small></div>
          </button>
        ))}
      </div>

      <Card pad={false}>
        <div className="card-hd" style={{ padding: '18px 20px 0' }}>
          <h3>Recent transactions</h3>
        </div>
        <div style={{ padding: '4px 20px 12px', overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 12 }}><Loading /></div>
            : recent.length === 0 ? <EmptyState title="No transactions yet">Your activity will appear here.</EmptyState>
              : (
                <table className="txn-table">
                  <thead><tr><th>Description</th><th>Category</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                  <tbody>{recent.map((t) => <TxnRow key={t.id} t={t} onReceipt={onReceipt} />)}</tbody>
                </table>
              )}
        </div>
      </Card>
    </div>
  )
}

export function CardsView() {
  const { api, user, toast } = useApp()
  const { data: cards, loading, setData } = useFetch(() => api.getCards(user.id), [user.id])
  const [busy, setBusy] = useState('')

  async function toggle(card) {
    setBusy(card.id)
    try {
      const updated = await api.toggleFreeze(user.id, card.id)
      setData((cur) => cur.map((c) => (c.id === card.id ? updated : c)))
      toast({ tone: updated.frozen ? 'default' : 'success', message: `${updated.name} ${updated.frozen ? 'frozen' : 'unfrozen'}.` })
    } finally { setBusy('') }
  }

  if (loading) return <Loading rows={2} />
  return (
    <div className="dash-grid-3 fade-in">
      {(cards || []).map((c) => (
        <Card key={c.id} className="stack gap-4">
          <div className={`debit-card ${c.frozen ? 'frozen' : ''}`}>
            <div className="spread">
              <div className="chip-el" />
              <Icon name="wifi" size={22} style={{ color: '#c8d5ef' }} />
            </div>
            <div className="num">•••• •••• •••• {c.last4}</div>
            <div className="foot">
              <div><small>Card holder</small>{user.name}</div>
              <div><small>Expires</small>{c.exp}</div>
            </div>
          </div>
          <div className="spread">
            <div><b>{c.name}</b><br /><small className="muted">{c.type === 'virtual' ? 'Virtual card' : 'Physical card'}</small></div>
            <Badge tone={c.frozen ? 'red' : 'green'}>{c.frozen ? 'Frozen' : 'Active'}</Badge>
          </div>
          <Button variant={c.frozen ? 'green' : 'outline'} block loading={busy === c.id} onClick={() => toggle(c)}>
            <Icon name="snowflake" size={18} /> {c.frozen ? 'Unfreeze card' : 'Freeze card'}
          </Button>
        </Card>
      ))}
    </div>
  )
}

export function PaymentsView({ onTransfer, onPayBill, onAddMoney, onService }) {
  const items = [
    { i: 'send', t: 'Send money', d: 'To a saved recipient, account, email or username.', on: onTransfer, c: 'qi-blue' },
    { i: 'building', t: 'Bank transfer', d: 'Send to any Nigerian bank account.', on: () => onService('bank'), c: 'qi-navy' },
    { i: 'arrowDownLeft', t: 'Request money', d: 'Ask another VERA user to pay you.', on: () => onService('request'), c: 'qi-green' },
    { i: 'download', t: 'Add money', d: 'Top up your VERA balance.', on: onAddMoney, c: 'qi-amber' },
    { i: 'receipt', t: 'Pay a bill', d: 'Electricity, water, internet and more.', on: onPayBill, c: 'qi-green' },
    { i: 'phone', t: 'Airtime & Data', d: 'MTN, Airtel, Glo & 9mobile top-ups.', on: () => onService('airtime'), c: 'qi-blue' },
    { i: 'gift', t: 'Gift cards', d: 'Buy simulated gift cards instantly.', on: () => onService('gift'), c: 'qi-amber' },
    { i: 'qr', t: 'Pay with QR', d: 'Scan a merchant code to pay.', on: () => onService('qr'), c: 'qi-navy' },
    { i: 'wallet', t: 'Savings pockets', d: 'Set money aside toward your goals.', on: () => onService('savings'), c: 'qi-green' },
    { i: 'arrowDownLeft', t: 'Receive money', d: 'Share your QR and account details.', on: () => onService('receive'), c: 'qi-blue' },
  ]
  return (
    <div className="stack gap-4 fade-in">
      <div role="note" style={{ padding: '12px 15px', borderRadius: 12, background: '#fff8e8', border: '1px solid #f2dfb5', color: '#70521a', fontSize: 13 }}>
        Demo mode only — these actions do not move real money or connect to external banks, billers or merchants.
      </div>
      <div className="dash-grid-3">
      {items.map((a) => (
        <Card key={a.t} className="stack gap-4">
          <span className={`ai ${a.c}`} style={{ width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center' }}>
            <Icon name={a.i} size={24} /></span>
          <div><h3 style={{ fontSize: 18 }}>{a.t}</h3><p className="muted" style={{ marginTop: 6 }}>{a.d}</p></div>
          <Button onClick={a.on}>{a.t}</Button>
        </Card>
      ))}
      </div>
    </div>
  )
}

export function SettingsView() {
  const { api, user, refreshUser, toast } = useApp()
  const initial = splitE164(user.phone)
  const [form, setForm] = useState({
    name: user.name,
    country: user.country || (initial.country ? initial.country.name : 'Nigeria'),
    phone: initial.national || '',
  })
  const selCountry = countryByName(form.country)
  const [phoneErr, setPhoneErr] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault(); setPhoneErr('')
    let phoneE164 = ''
    if (String(form.phone).trim()) {
      const pr = validatePhone(selCountry, form.phone)
      if (!pr.ok) { setPhoneErr(pr.error); return }
      phoneE164 = pr.e164
    }
    setSaving(true)
    try {
      await api.updateProfile(user.id, { name: form.name, country: form.country, phone: phoneE164 })
      await refreshUser()
      toast({ tone: 'success', message: 'Profile updated.' })
    } finally { setSaving(false) }
  }

  return (
    <div className="dash-grid fade-in">
      <Card>
        <div className="card-hd"><h3>Profile</h3></div>
        <form onSubmit={save}>
          <Input label="Full name" value={form.name} onChange={set('name')} />
          <Input label="Email" value={user.email} disabled hint="Email cannot be changed in this demo." />
          <div className="field">
            <label htmlFor="set-country">Country</label>
            <div className="input-wrap">
              <span className="lead"><Icon name="building" size={18} /></span>
              <select id="set-country" className="input has-lead" value={form.country} onChange={set('country')}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <PhoneField label="Phone" country={selCountry} value={form.phone} error={phoneErr}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </Card>
      <Card>
        <div className="card-hd"><h3>Security</h3></div>
        <div className="stack gap-3">
          {[['lock', 'Change password', 'Last changed 2 months ago'], ['shield', 'Two-factor auth', 'Add an extra layer of security'], ['bell', 'Login alerts', 'Get notified of new sign-ins']].map(([i, t, d]) => (
            <div key={t} className="settings-row" style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
              <span className="si"><Icon name={i} size={18} /></span>
              <div className="s-txt"><b>{t}</b><small>{d}</small></div>
              <Icon name="chevronRight" size={18} style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function TransactionsView({ refreshKey, onReceipt }) {
  const { api, user } = useApp()
  const { data: txns, loading } = useFetch(() => api.getTransactions(user.id), [user.id, refreshKey])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const list = (txns || []).filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false
    if (q && !(`${t.title} ${t.category}`.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  })
  return (
    <div className="stack gap-4 fade-in">
      <div className="spread" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <Input placeholder="Search transactions…" value={q} onChange={(e) => setQ(e.target.value)}
            lead={<Icon name="search" size={18} />} />
        </div>
        <div className="chip-row">
          {[['all', 'All'], ['credit', 'Income'], ['debit', 'Spending']].map(([k, l]) => (
            <button key={k} className="chip" onClick={() => setFilter(k)}
              style={{ background: filter === k ? 'var(--vera-blue)' : '#fff', color: filter === k ? '#fff' : 'var(--vera-navy)', borderColor: filter === k ? 'var(--vera-blue)' : 'var(--border-strong)' }}>{l}</button>
          ))}
        </div>
      </div>
      <Card pad={false}>
        <div style={{ padding: '8px 20px', overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 12 }}><Loading rows={6} /></div>
            : list.length === 0 ? <EmptyState title="Nothing found">Try a different search or filter.</EmptyState>
              : (
                <table className="txn-table">
                  <thead><tr><th>Description</th><th>Category</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                  <tbody>{list.map((t) => <TxnRow key={t.id} t={t} onReceipt={onReceipt} />)}</tbody>
                </table>
              )}
        </div>
      </Card>
    </div>
  )
}


export function AnalyticsView({ refreshKey }) {
  const { api, user } = useApp()
  const { data: txns, loading } = useFetch(() => api.getTransactions(user.id), [user.id, refreshKey])
  const rows = txns || []
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const key = date.getMonth() + 1
    const year = date.getFullYear()
    const matching = rows.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() + 1 === key && d.getFullYear() === year
    })
    return {
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      income: matching.filter((t) => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0),
      spending: matching.filter((t) => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    }
  })
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const current = rows.filter((t) => new Date(t.date) >= monthStart && new Date(t.date) <= now)
  const income = current.filter((t) => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const spending = current.filter((t) => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const categories = Object.entries(current.filter((t) => t.type === 'debit').reduce((acc, t) => {
    const key = t.category || 'Other'
    acc[key] = (acc[key] || 0) + Number(t.amount || 0)
    return acc
  }, {})).sort((a, b) => b[1] - a[1])
  const maxBar = Math.max(1, ...months.flatMap((m) => [m.income, m.spending]))
  return (
    <div className="stack gap-6 fade-in">
      <div className="dash-grid">
        <Card><small className="muted">Income this month</small><div className="sv text-green"><Money value={income} /></div><small className="muted">Based on recorded credits</small></Card>
        <Card><small className="muted">Spending this month</small><div className="sv"><Money value={spending} /></div><small className="muted">Based on recorded debits</small></Card>
        <Card><small className="muted">Net this month</small><div className={income - spending >= 0 ? 'sv text-green' : 'sv text-error'}><Money value={income - spending} /></div><small className="muted">Income minus spending</small></Card>
      </div>
      <Card>
        <div className="card-hd"><h3>Income vs spending</h3><small className="muted">Last 6 months</small></div>
        {loading ? <Loading rows={4} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 12, alignItems: 'end', minHeight: 190, paddingTop: 18 }}>
            {months.map((m) => <div key={m.label + m.income} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
              <div style={{ height: 130, width: '100%', display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 4 }}>
                <div title={'Income: ' + m.income} style={{ width: '35%', minWidth: 8, height: Math.max(3, m.income / maxBar * 120), borderRadius: '5px 5px 0 0', background: 'var(--vera-green)' }} />
                <div title={'Spending: ' + m.spending} style={{ width: '35%', minWidth: 8, height: Math.max(3, m.spending / maxBar * 120), borderRadius: '5px 5px 0 0', background: 'var(--vera-blue)' }} />
              </div><small className="muted">{m.label}</small>
            </div>)}
          </div>
        )}
        <div className="row gap-4" style={{ justifyContent: 'center', marginTop: 14, fontSize: 12 }}>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--vera-green)', marginRight: 6 }} />Income</span>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--vera-blue)', marginRight: 6 }} />Spending</span>
        </div>
      </Card>
      <Card>
        <div className="card-hd"><h3>Spending by category</h3><small className="muted">This month</small></div>
        {loading ? <Loading rows={3} /> : categories.length === 0 ? <EmptyState title="No spending recorded">Your category breakdown will appear as you make simulated transactions.</EmptyState> : (
          <div className="stack gap-3">
            {categories.map(([name, amount]) => <div key={name}>
              <div className="spread" style={{ marginBottom: 6 }}><b>{name}</b><b><Money value={amount} /></b></div>
              <div style={{ height: 8, borderRadius: 20, background: 'var(--surface-alt)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (amount / Math.max(1, spending) * 100) + '%', background: 'var(--vera-blue)', borderRadius: 20 }} />
              </div>
            </div>)}
          </div>
        )}
      </Card>
      <p className="muted" style={{ fontSize: 12 }}>Analytics are calculated from your VERA simulated transaction history and are not financial advice.</p>
    </div>
  )
}
