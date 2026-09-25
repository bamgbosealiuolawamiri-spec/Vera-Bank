import React, { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Card from '../../components/Card.jsx'
import Logo from '../../components/Logo.jsx'
import { LoadingBlock, EmptyState, ErrorBanner } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { BILL_CATEGORIES, DEMO_DEVICES, formatMoney, formatDate } from '../../data/demoData.js'

export function BillsPanel({ onDone }) {
  const toast = useToast()
  const [cat, setCat] = useState(BILL_CATEGORIES[0])
  const [provider, setProvider] = useState(BILL_CATEGORIES[0].providers[0])
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const pay = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await bank.payBill({ category: cat.label, provider, amount }); toast.success('Payment successful', `${cat.label} \u2014 ${formatMoney(Number(amount))} to ${provider}.`); setAmount(''); onDone?.() }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="dash-grid">
      <Card title="Pay a Bill">
        <form onSubmit={pay}>
          <ErrorBanner>{err}</ErrorBanner>
          <div className="field"><label>Category</label>
            <div className="action-tiles" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              {BILL_CATEGORIES.map((c) => (
                <button type="button" key={c.id} className="action-tile" onClick={() => { setCat(c); setProvider(c.providers[0]) }}
                  style={{ alignItems: 'center', textAlign: 'center', outline: cat.id === c.id ? '2px solid var(--vera-blue)' : 'none' }}>
                  <span className={'ai ' + c.tint} style={{ margin: '0 auto' }}><Icon name={c.icon} size={20} /></span>
                  <b style={{ fontSize: 13 }}>{c.label}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label>Provider</label>
            <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>{cat.providers.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <Input label="Amount (\u20A6)" icon="card" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
          <Button type="submit" block size="lg" loading={loading}>Pay {amount ? formatMoney(Number(amount)) : 'Bill'}</Button>
        </form>
      </Card>
      <Card title="About bill payments">
        <ul className="check-list">
          {['Instant confirmation with reference', 'Electricity, Cable TV, Internet & Government', 'Saved billers for faster payments', 'Full history in your transactions'].map((t) => (
            <li key={t}><span className="ck"><Icon name="check" size={16} /></span>{t}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function TransactionsPanel() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [list, setList] = useState(null)
  useEffect(() => { setList(null); const t = setTimeout(() => bank.getTransactions({ search, type }).then(setList), 250); return () => clearTimeout(t) }, [search, type])
  return (
    <Card title="Transaction History" action={
      <div className="row gap-2">
        {[['all', 'All'], ['credit', 'In'], ['debit', 'Out']].map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setType(k)} style={type === k ? { background: 'var(--vera-blue)', color: '#fff', borderColor: 'var(--vera-blue)' } : {}}>{l}</button>
        ))}
      </div>}>
      <div className="input-wrap" style={{ marginBottom: 16 }}>
        <span className="lead"><Icon name="search" size={19} /></span>
        <input className="input has-lead" placeholder="Search by name, note or reference" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {!list ? <LoadingBlock height={160} /> : list.length === 0 ? <EmptyState title="No results" message="Try a different search or filter." /> : (
        <table className="txn-table">
          <thead><tr><th>Description</th><th>Date</th><th>Reference</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td data-l="Description"><b>{t.party}</b><br /><small className="muted">{t.description}</small></td>
                <td data-l="Date" className="muted">{formatDate(t.date)}</td>
                <td data-l="Reference" className="muted">{t.reference}</td>
                <td data-l="Status"><span className={'badge ' + (t.status === 'pending' ? 'badge-gray' : 'badge-green')}>{t.status}</span></td>
                <td data-l="Amount" style={{ textAlign: 'right' }} className={t.type === 'credit' ? 'amt-c' : 'amt-d'}>{t.type === 'credit' ? '+' : '\u2212'}{formatMoney(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}

export function CardsPanel() {
  const toast = useToast()
  const [card, setCard] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { bank.getCard().then(setCard) }, [])
  if (!card) return <LoadingBlock />
  const frozen = card.status === 'frozen'
  const toggle = async () => { setBusy(true); const next = frozen ? 'active' : 'frozen'; try { setCard(await bank.setCardStatus(next)); toast.info(next === 'frozen' ? 'Card frozen' : 'Card unfrozen', '') } finally { setBusy(false) } }
  const pct = (u, t) => Math.min(100, Math.round((u / t) * 100))
  return (
    <div className="dash-grid">
      <Card title="Your Card">
        <div className={'debit-card' + (frozen ? ' frozen' : '')} style={{ maxWidth: 400 }}>
          <div className="spread" style={{ position: 'relative', zIndex: 1 }}><span className="chip-el" /><Logo onDark /></div>
          <div className="num">{card.maskedNumber}</div>
          <div className="foot"><div><small>Card Holder</small>{card.holder}</div><div style={{ textAlign: 'right' }}><small>Expires</small>{card.expiry}</div></div>
        </div>
        <div className="row gap-3" style={{ marginTop: 18 }}>
          <Button variant={frozen ? 'green' : 'outline'} onClick={toggle} loading={busy} iconLeft={<Icon name="snow" size={18} />}>{frozen ? 'Unfreeze Card' : 'Freeze Card'}</Button>
          <span className={'badge ' + (frozen ? 'badge-red' : 'badge-green')} style={{ alignSelf: 'center' }}>{frozen ? 'Frozen' : 'Active'}</span>
        </div>
      </Card>
      <Card title="Card Limits">
        {[['Daily spending', card.limits.dailyUsed, card.limits.daily], ['Monthly spending', card.limits.monthlyUsed, card.limits.monthly]].map(([label, u, t]) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div className="spread" style={{ fontSize: 14, marginBottom: 6 }}><span className="muted">{label}</span><b>{formatMoney(u)} / {formatMoney(t)}</b></div>
            <div style={{ height: 9, borderRadius: 99, background: 'var(--surface-alt)', overflow: 'hidden' }}><div style={{ height: '100%', width: pct(u, t) + '%', background: 'linear-gradient(90deg,var(--vera-blue),var(--vera-green))' }} /></div>
          </div>
        ))}
        <div className="review-row"><span className="k">Card Type</span><span className="v">{card.cardType}</span></div>
        <div className="review-row"><span className="k">Network</span><span className="v">{card.network}</span></div>
      </Card>
    </div>
  )
}

export function SettingsPanel({ user }) {
  const toast = useToast()
  const [alerts, setAlerts] = useState(true)
  return (
    <div className="dash-grid">
      <Card title="My Profile">
        <div className="row gap-3" style={{ alignItems: 'center', marginBottom: 16 }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{user?.initials || 'BA'}</span>
          <div><b style={{ fontSize: 17 }}>{user?.name || 'Babajide Adesina'}</b><div className="muted">{user?.email}</div></div>
        </div>
        <Input label="Full Name" icon="user" defaultValue={user?.name || 'Babajide Adesina'} />
        <Input label="Phone Number" icon="phone" defaultValue={user?.phone || '0813 697 1145'} />
        <Input label="Email" icon="mail" defaultValue={user?.email || 'demo@verabank.example'} />
        <Button onClick={() => toast.success('Saved', 'Profile updated (demo).')}>Save Changes</Button>
      </Card>
      <Card title="Security & Control">
        <div className="settings-row" style={{ borderRadius: 12, border: '1px solid var(--border)', marginBottom: 10 }}>
          <span className="si"><Icon name="bell" size={18} /></span>
          <span className="s-txt"><b>Login alerts</b><small>Notify me of new sign-ins</small></span>
          <span className={'toggle-sw' + (alerts ? ' on' : '')} onClick={() => setAlerts((v) => !v)}><i /></span>
        </div>
        <Input label="Change Password" type="password" icon="lock" placeholder="New password" />
        <Button variant="outline" onClick={() => toast.success('Updated', 'Password changed (demo).')}>Update password</Button>
        <h4 style={{ margin: '20px 0 10px' }}>Devices &amp; sessions</h4>
        {DEMO_DEVICES.map((d) => (
          <div className="review-row" key={d.id}><span className="k">{d.name}<br /><small>{d.meta}</small></span>{d.current ? <span className="badge badge-green">This device</span> : <button className="btn btn-ghost text-error" onClick={() => toast.info('Signed out', 'Device session ended (demo).')}>Sign out</button>}</div>
        ))}
      </Card>
    </div>
  )
}

export function HelpPanel() {
  return (
    <Card title="Help & Support">
      <p className="muted" style={{ marginBottom: 16 }}>Need a hand? Here are quick answers and ways to reach us.</p>
      <ul className="check-list">
        {['Sending money: open Send, enter details, confirm.', 'Paying bills: choose a category and provider under Pay Bills.', 'Freezing your card: go to Cards and tap Freeze Card.', 'Contact us: support@verabank.example (demo).'].map((t) => (
          <li key={t}><span className="ck"><Icon name="check" size={16} /></span>{t}</li>
        ))}
      </ul>
    </Card>
  )
}
