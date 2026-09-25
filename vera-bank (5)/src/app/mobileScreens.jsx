import React, { useState } from 'react'
import { Money, Avatar, EmptyState, Button, Input, ErrorBanner, Badge } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch } from '../web/dashboardData.js'
import QrCode from '../components/QrCode.jsx'
import { FlowHead, Success, AmountField, RecipientCard, FindRecipient, ReceiptModal } from './mobileParts.jsx'

function TxnItem({ t, onOpen }) {
  const credit = t.type === 'credit'
  const request = t.type === 'request'
  return (
    <button className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
      onClick={() => onOpen?.(t)}>
      <span className={`ti ${request ? '' : credit ? 'credit' : 'debit'}`}>
        <Icon name={request ? 'clock' : credit ? 'arrowDownLeft' : 'arrowUpRight'} size={18} />
      </span>
      <div className="t-main"><b>{t.title}</b><small>{t.category} \u00b7 {t.dateLabel}</small></div>
      <div className={`t-amt ${credit ? 'credit' : 'debit'}`}>
        {request ? '' : credit ? '+' : '\u2212'}<Money value={t.amount} />
      </div>
    </button>
  )
}

// Services offered on the Home 'More' grid -> each maps to a flow id.
const SERVICES = [
  { id: 'add', l: 'Add money', i: 'plus', c: 'qi-green' },
  { id: 'send', l: 'Send', i: 'send', c: 'qi-blue' },
  { id: 'bankTransfer', l: 'Bank transfer', i: 'building', c: 'qi-navy' },
  { id: 'request', l: 'Request', i: 'download', c: 'qi-amber' },
  { id: 'payqr', l: 'Pay with QR', i: 'qr', c: 'qi-blue' },
  { id: 'receive', l: 'Receive', i: 'arrowDownLeft', c: 'qi-green' },
  { id: 'airtime', l: 'Airtime', i: 'phone', c: 'qi-amber' },
  { id: 'data', l: 'Data', i: 'wifi', c: 'qi-navy' },
  { id: 'bills', l: 'Bills', i: 'receipt', c: 'qi-blue' },
  { id: 'giftcards', l: 'Gift cards', i: 'gift', c: 'qi-green' },
  { id: 'savings', l: 'Savings', i: 'wallet', c: 'qi-navy' },
]

export function HomeScreen({ refreshKey, onFlow, onSeeAll }) {
  const { api, user } = useApp()
  const { data: txns, loading } = useFetch(() => api.getTransactions(user.id), [user.id, refreshKey])
  const { data: notes } = useFetch(() => api.getNotifications(user.id), [user.id, refreshKey])
  const [hide, setHide] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const recent = (txns || []).slice(0, 5)
  const unread = (notes || []).filter((n) => !n.read).length

  const actions = [
    { i: 'send', l: 'Send', c: 'qi-blue', on: () => onFlow('send') },
    { i: 'download', l: 'Request', c: 'qi-green', on: () => onFlow('request') },
    { i: 'plus', l: 'Add money', c: 'qi-navy', on: () => onFlow('add') },
    { i: 'qr', l: 'Pay / Scan', c: 'qi-amber', on: () => onFlow('payqr') },
  ]

  return (
    <div className="fade-in">
      <div className="app-topbar">
        <div className="row gap-2" style={{ alignItems: 'center' }}>
          <Avatar name={user.name} />
          <div style={{ lineHeight: 1.2 }}><small className="muted">Welcome back</small><br /><b>{user.name.split(' ')[0]}</b></div>
        </div>
        <button className="icon-btn" aria-label="Notifications" onClick={() => onFlow('notifications')}>
          <Icon name="bell" size={20} />{unread > 0 && <span className="dot" />}</button>
      </div>

      <div className="app-pad" style={{ paddingTop: 6 }}>
        <div className="balance-card">
          <div className="label"><Icon name="wallet" size={16} /> Total balance
            <button className="eye-btn" onClick={() => setHide((h) => !h)} aria-label="Toggle balance">
              <Icon name={hide ? 'eyeOff' : 'eye'} size={15} /></button>
          </div>
          <div className="amount">{hide ? '\u2022\u2022\u2022\u2022\u2022\u2022' : <Money value={user.balance} />}</div>
          <div className="acct">
            <div><small>Account number</small><b>{user.accountNumber}</b></div>
            <Icon name="wifi" size={22} style={{ color: '#cdd9f2' }} />
          </div>
        </div>

        <div className="quick-grid" style={{ marginTop: 18 }}>
          {actions.map((a) => (
            <button key={a.l} className="quick" onClick={a.on}>
              <span className={`qi ${a.c}`}><Icon name={a.i} size={20} /></span><span>{a.l}</span>
            </button>
          ))}
        </div>

        <div className="section-title"><h3>Services</h3></div>
        <div className="quick-grid services-grid">
          {SERVICES.map((s) => (
            <button key={s.id} className="quick" onClick={() => onFlow(s.id)}>
              <span className={`qi ${s.c}`}><Icon name={s.i} size={20} /></span><span>{s.l}</span>
            </button>
          ))}
        </div>

        <div className="section-title">
          <h3>Recent activity</h3>
          <button className="btn-ghost" style={{ padding: 0 }} onClick={onSeeAll}>See all</button>
        </div>
        <div className="list-card">
          {loading ? <div className="center" style={{ padding: 30 }}><span className="spinner dark" /></div>
            : recent.length === 0 ? <EmptyState title="No activity yet">Your transactions will show here.</EmptyState>
              : recent.map((t) => <TxnItem key={t.id} t={t} onOpen={setReceipt} />)}
        </div>
      </div>
      <ReceiptModal txn={receipt} open={!!receipt} onClose={() => setReceipt(null)} />
    </div>
  )
}

export function CardsScreen() {
  const { api, user, toast } = useApp()
  const { data: cards, loading, setData } = useFetch(() => api.getCards(user.id), [user.id])
  const [busy, setBusy] = useState('')
  async function toggle(c) {
    setBusy(c.id)
    try {
      const u = await api.toggleFreeze(user.id, c.id)
      setData((cur) => cur.map((x) => (x.id === c.id ? u : x)))
      toast({ tone: u.frozen ? 'default' : 'success', message: `${u.name} ${u.frozen ? 'frozen' : 'unfrozen'}.` })
    } finally { setBusy('') }
  }
  return (
    <div className="fade-in">
      <div className="screen-head" style={{ paddingTop: 18 }}><h1>Cards</h1><p>Manage your VERA cards</p></div>
      <div className="app-pad stack gap-6" style={{ paddingTop: 8 }}>
        {loading ? <div className="center" style={{ padding: 40 }}><span className="spinner dark" /></div>
          : (cards || []).map((c) => (
            <div key={c.id} className="stack gap-3">
              <div className={`debit-card ${c.frozen ? 'frozen' : ''}`}>
                <div className="spread"><div className="chip-el" /><Icon name="wifi" size={22} style={{ color: '#c8d5ef' }} /></div>
                <div className="num">\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 {c.last4}</div>
                <div className="foot"><div><small>Card holder</small>{user.name}</div><div><small>Expires</small>{c.exp}</div></div>
              </div>
              <div className="spread">
                <span className="muted" style={{ fontSize: 13 }}>{c.type === 'virtual' ? 'Virtual card' : 'Physical card'}</span>
                <Badge tone={c.frozen ? 'red' : 'green'}>{c.frozen ? 'Frozen' : 'Active'}</Badge>
              </div>
              <Button variant={c.frozen ? 'green' : 'outline'} block loading={busy === c.id} onClick={() => toggle(c)}>
                <Icon name="snowflake" size={18} /> {c.frozen ? 'Unfreeze' : 'Freeze card'}</Button>
            </div>
          ))}
      </div>
    </div>
  )
}

export function ProfileScreen({ onExit, onFlow }) {
  const { user, logout } = useApp()
  const groups = [
    { items: [['user', 'Personal details', user.email], ['shield', 'Security & privacy', 'Password, 2FA'], ['bell', 'Notifications', 'Alerts & updates', 'notifications'], ['wallet', 'Savings pockets', 'Save towards goals', 'savings']] },
    { items: [['help', 'Help center', 'FAQs & support'], ['info', 'About VERA', 'Demo product info']] },
  ]
  return (
    <div className="fade-in">
      <div className="app-pad" style={{ paddingTop: 22, textAlign: 'center' }}>
        <Avatar name={user.name} className="" />
        <div style={{ margin: '12px 0 2px' }}><h1 style={{ fontSize: 22 }}>{user.name}</h1></div>
        <p className="muted" style={{ fontSize: 14 }}>{user.email}</p>
        <p className="muted" style={{ fontSize: 13 }}>{user.username ? `@${user.username}` : ''}{user.country ? ` \u00b7 ${user.country}` : ''}</p>
      </div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        {groups.map((g, gi) => (
          <div className="settings-group" key={gi}>
            {g.items.map(([i, t, d, flow]) => (
              <button key={t} className="settings-row" onClick={() => flow && onFlow?.(flow)}>
                <span className="si"><Icon name={i} size={18} /></span>
                <div className="s-txt"><b>{t}</b><small>{d}</small></div>
                <Icon name="chevronRight" size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            ))}
          </div>
        ))}
        <Button variant="outline" block onClick={() => { logout(); onExit() }}><Icon name="logout" size={18} /> Sign out</Button>
        <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 16 }}>VERA Bank \u2014 fictional demo</p>
      </div>
    </div>
  )
}

export function SendFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [step, setStep] = useState('who') // who | amount | review | done
  const [rec, setRec] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  async function confirm() {
    setErr(''); setLoading(true)
    try {
      const res = await api.transfer(user.id, { recipient: rec, amount, note, method: rec.method || 'Account number' })
      patchUserBalance(res.balance); setTxn(res.transaction)
      toast({ tone: 'success', title: 'Transfer sent', message: `$${Number(amount).toFixed(2)} sent to ${rec.name}.` })
      setStep('done')
    } catch (e) { setErr(e.message); setStep('amount') } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Money sent!" message={`$${Number(amount).toFixed(2)} sent to ${rec.name}.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Send money" onClose={step === 'who' ? onClose : () => setStep(step === 'review' ? 'amount' : 'who')} />
      <div className="app-pad">
        {step === 'who' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 10px' }}><h1 style={{ fontSize: 20 }}>Choose recipient</h1><p>Send to a VERA user by account, email, username or QR</p></div>
            <FindRecipient methods={['account', 'email', 'username', 'qr']} onPick={(r) => { setRec(r); setStep('amount') }} />
          </>
        )}
        {step === 'amount' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 6px', textAlign: 'center' }}><p>Sending to {rec.name}</p></div>
            <ErrorBanner>{err}</ErrorBanner>
            <AmountField value={amount} onChange={setAmount} />
            <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
            <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Available: <Money value={user.balance} className="text-blue" /></p>
            <Button block size="lg" disabled={!amount} onClick={() => setStep('review')}>Review</Button>
          </>
        )}
        {step === 'review' && (
          <div className="stack gap-3">
            <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Confirm transfer</h1></div>
            <ErrorBanner>{err}</ErrorBanner>
            <RecipientCard rec={rec} />
            <div className="list-card">
              <div className="review-row"><span className="k">Amount</span><span className="v"><Money value={amount} /></span></div>
              {note && <div className="review-row"><span className="k">Note</span><span className="v">{note}</span></div>}
              <div className="review-row"><span className="k">Fee</span><span className="v text-green">Free</span></div>
            </div>
            <Button block size="lg" loading={loading} onClick={confirm}>Confirm &amp; send</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function BillsFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const BILLERS = [
    { id: 'electric', name: 'Electricity', icon: 'zap', cat: 'Utilities' },
    { id: 'water', name: 'Water', icon: 'wallet', cat: 'Utilities' },
    { id: 'internet', name: 'Internet', icon: 'wifi', cat: 'Utilities' },
    { id: 'tv', name: 'TV / Cable', icon: 'chart', cat: 'Entertainment' },
    { id: 'education', name: 'Education', icon: 'star', cat: 'Fees' },
    { id: 'betting', name: 'Betting wallet', icon: 'trending', cat: 'Lifestyle' },
  ]
  const [step, setStep] = useState('pick')
  const [biller, setBiller] = useState(null)
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  async function pay() {
    setErr(''); setLoading(true)
    try {
      const res = await api.payBill(user.id, { biller: `${biller.name} bill`, amount, category: biller.cat })
      patchUserBalance(res.balance); setTxn(res.transaction)
      toast({ tone: 'success', title: 'Bill paid', message: `${biller.name} bill of $${Number(amount).toFixed(2)} paid.` })
      setStep('done')
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Payment successful" message={`${biller.name} bill of $${Number(amount).toFixed(2)} paid.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Pay bills" onClose={step === 'pick' ? onClose : () => setStep('pick')} />
      <div className="app-pad">
        {step === 'pick' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 12px' }}><h1 style={{ fontSize: 20 }}>What are you paying?</h1></div>
            <div className="bill-grid">
              {BILLERS.map((b) => (
                <button key={b.id} className="bill-cat" onClick={() => { setBiller(b); setStep('amount') }}>
                  <div className="bi qi-blue"><Icon name={b.icon} size={22} /></div>
                  <b>{b.name}</b><small>{b.cat}</small>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 'amount' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 6px', textAlign: 'center' }}><p>Paying {biller.name}</p></div>
            <ErrorBanner>{err}</ErrorBanner>
            <AmountField value={amount} onChange={setAmount} presets={[10, 25, 50, 100]} />
            <p className="muted" style={{ fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Available: <Money value={user.balance} className="text-blue" /></p>
            <Button block size="lg" loading={loading} disabled={!amount} onClick={pay}>Pay {amount ? <Money value={amount} /> : 'bill'}</Button>
          </>
        )}
      </div>
    </div>
  )
}

export function ReceiveScreen({ onClose }) {
  const { user, toast } = useApp()
  const acct = String(user.accountNumber || '').replace(/\s/g, '')
  const payload = `VERA|name=${user.name}|account=${acct}|username=${user.username || ''}`
  function copy() {
    navigator.clipboard?.writeText(acct)
    toast({ tone: 'success', message: 'Account number copied.' })
  }
  async function share() {
    const text = `Pay me on VERA Bank (demo)\nName: ${user.name}\nAccount: ${user.accountNumber}\nUsername: @${user.username || ''}`
    try {
      if (navigator.share) await navigator.share({ title: 'My VERA details', text })
      else { await navigator.clipboard?.writeText(text); toast({ tone: 'success', message: 'Payment details copied.' }) }
    } catch (e) { /* cancelled */ }
  }
  return (
    <div className="app-scroll">
      <FlowHead title="Receive money" onClose={onClose} />
      <div className="app-pad" style={{ textAlign: 'center' }}>
        <div className="screen-head" style={{ padding: '0 0 10px' }}><p>Scan this QR or share your details to get paid</p></div>
        <div className="qr-box"><QrCode value={payload} size={190} /></div>
        <div className="list-card" style={{ marginTop: 18, textAlign: 'left' }}>
          <div className="review-row"><span className="k">Name</span><span className="v">{user.name}</span></div>
          <div className="review-row"><span className="k">Account</span><span className="v">{user.accountNumber}</span></div>
          {user.username && <div className="review-row"><span className="k">Username</span><span className="v">@{user.username}</span></div>}
          <div className="review-row"><span className="k">Bank</span><span className="v">VERA Bank</span></div>
        </div>
        <div className="row gap-2" style={{ marginTop: 16 }}>
          <Button block variant="outline" onClick={copy}><Icon name="copy" size={18} /> Copy</Button>
          <Button block onClick={share}><Icon name="send" size={18} /> Share</Button>
        </div>
      </div>
    </div>
  )
}

const FILTERS = ['All', 'Money In', 'Money Out', 'Transfer', 'Airtime', 'Data', 'Bills', 'Gift Card', 'Savings']

export function TxnListScreen({ refreshKey }) {
  const { api, user } = useApp()
  const { data: txns, loading } = useFetch(() => api.getTransactions(user.id), [user.id, refreshKey])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [receipt, setReceipt] = useState(null)

  const list = (txns || []).filter((t) => {
    const text = !q || `${t.title} ${t.category} ${t.method || ''}`.toLowerCase().includes(q.toLowerCase())
    let f = true
    if (filter === 'Money In') f = t.type === 'credit'
    else if (filter === 'Money Out') f = t.type === 'debit'
    else if (filter !== 'All') f = (t.category || '').toLowerCase().includes(filter.toLowerCase())
    return text && f
  })

  return (
    <div className="fade-in">
      <div className="screen-head" style={{ paddingTop: 18 }}><h1>Activity</h1><p>All your transactions</p></div>
      <div className="app-pad" style={{ paddingTop: 8 }}>
        <Input placeholder="Search transactions\u2026" value={q} onChange={(e) => setQ(e.target.value)} lead={<Icon name="search" size={18} />} />
        <div className="chip-row filter-row">
          {FILTERS.map((f) => (
            <button key={f} className={`chip ${filter === f ? 'chip-on' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="list-card">
          {loading ? <div className="center" style={{ padding: 30 }}><span className="spinner dark" /></div>
            : list.length === 0 ? <EmptyState title="Nothing found">Try a different search or filter.</EmptyState>
              : list.map((t) => <TxnItem key={t.id} t={t} onOpen={setReceipt} />)}
        </div>
      </div>
      <ReceiptModal txn={receipt} open={!!receipt} onClose={() => setReceipt(null)} />
    </div>
  )
}
