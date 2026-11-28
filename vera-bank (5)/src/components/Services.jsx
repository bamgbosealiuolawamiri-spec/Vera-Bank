// Additional simulated money-service modals for the web dashboard.
// All flows are fictional — no real money, cards or networks are involved.
import React, { useState } from 'react'
import { Modal, Button, Input, Avatar, ErrorBanner, Money, Badge, EmptyState, PhoneField } from './ui.jsx'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch } from '../web/dashboardData.js'
import { NG_BANKS, NG_NETWORKS, DATA_BUNDLES, GIFT_CARDS } from '../data/seed.js'
import { countryByCode, validatePhone } from '../data/phone.js'

const NG = countryByCode('NG')

export function ReceiptModal({ open, txn, onClose }) {
  const { toast } = useApp()
  const maskAccount = (value) => {
    const digits = String(value || '').replace(/\\D/g, '')
    return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : value
  }
  if (!txn) return null
  const credit = txn.type === 'credit'
  const rows = [
    ['Status', <Badge tone={txn.status === 'Pending' ? 'amber' : 'green'}>{txn.status || 'Completed'}</Badge>],
    ['Category', txn.category],
    txn.method && ['Method', txn.method],
    txn.recipient?.name && ['Recipient', txn.recipient.name],
    txn.recipient?.accountNumber && ['Account', maskAccount(txn.recipient.accountNumber)],
    txn.recipient?.bank && ['Bank', txn.recipient.bank],
    txn.sender?.name && ['From', txn.sender.name],
    txn.meta?.phone && ['Phone', txn.meta.phone],
    txn.meta?.code && ['Gift code', txn.meta.code],
    txn.note && ['Note', txn.note],
    ['Date', txn.dateLabel],
    ['Reference', txn.reference],
  ].filter(Boolean)
  function copyRef() { navigator.clipboard?.writeText(txn.reference || ''); toast({ tone: 'success', message: 'Reference copied.' }) }
  return (
    <Modal open={open} onClose={onClose} title="Receipt">
      <div style={{ textAlign: 'center', margin: '4px 0 16px' }}>
        <div className={`ti ${credit ? 'credit' : 'debit'}`} style={{ width: 56, height: 56, borderRadius: 16, display: 'inline-grid', placeItems: 'center' }}>
          <Icon name={credit ? 'arrowDownLeft' : 'arrowUpRight'} size={26} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }} className={credit ? 'text-green' : ''}>
          {credit ? '+' : '−'}<Money value={txn.amount} />
        </div>
        <p className="muted" style={{ marginTop: 2 }}>{txn.title}</p>
      </div>
      <div className="list-card" style={{ textAlign: 'left' }}>
        {rows.map(([k, v]) => (
          <div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
        ))}
      </div>
      <Button block variant="outline" onClick={copyRef} style={{ marginTop: 16 }}><Icon name="copy" size={18} /> Copy reference</Button>
      <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 10 }}>Simulated receipt — no real funds were moved.</p>
    </Modal>
  )
}

export function ReceiveModal({ open, onClose }) {
  const { user, toast } = useApp()
  if (!user) return null
  const copy = (val, label) => { navigator.clipboard?.writeText(val); toast({ tone: 'success', message: `${label} copied.` }) }
  const rows = [
    ['Account holder', user.name, user.name],
    ['Account number', user.accountNumber, user.accountNumber.replace(/\s/g, '')],
    ['Bank', 'VERA Bank', 'VERA Bank'],
    ['VERA email', user.email, user.email],
    ['Username', '@' + user.username, '@' + user.username],
  ]
  return (
    <Modal open={open} onClose={onClose} title="Demo account details">
      <p className="muted" style={{ textAlign: 'center', marginBottom: 12 }}>These details are for VERA's simulated environment only. They cannot receive real payments.</p>
      <div className="qr-box" style={{ margin: '0 auto 16px' }}><Icon name="qr" size={120} style={{ color: 'var(--vera-navy)' }} /></div>
      <div className="list-card" style={{ textAlign: 'left' }}>
        {rows.map(([k, v, c]) => (
          <button type="button" key={k} className="review-row" onClick={() => copy(c, k)}
            style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <span className="k">{k}</span>
            <span className="v" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{v} <Icon name="copy" size={15} style={{ color: 'var(--vera-blue)' }} /></span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

export function NotificationsModal({ open, onClose, items = [] }) {
  const toneMap = { success: 'green', credit: 'green', debit: 'gray', info: 'blue', alert: 'red' }
  return (
    <Modal open={open} onClose={onClose} title="Notifications">
      <div className="list-card" style={{ textAlign: 'left', maxHeight: 420, overflowY: 'auto' }}>
        {items.length === 0 ? <EmptyState icon="bell" title="No notifications">You're all caught up.</EmptyState>
          : items.map((n) => (
            <div key={n.id} className="settings-row" style={{ borderBottom: '1px solid var(--border)', opacity: n.read ? 0.7 : 1 }}>
              <span className="si"><Icon name={n.kind === 'credit' || n.kind === 'success' ? 'check' : n.kind === 'alert' ? 'alert' : 'bell'} size={18} /></span>
              <div className="s-txt"><b>{n.title}</b><small>{n.message}</small></div>
              {!n.read && <span className="dot" style={{ background: 'var(--vera-blue)', width: 8, height: 8, borderRadius: 8 }} />}
            </div>
          ))}
      </div>
    </Modal>
  )
}
//__APPEND__

export function BankTransferModal({ open, onClose, onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [bank, setBank] = useState(NG_BANKS[1])
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await api.bankTransfer(user.id, { bank, accountNumber, accountName, amount, note, pin })
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Transfer sent', message: `Sent to ${bank}.` })
      onDone?.(res); onReceipt?.(res.transaction)
      setAccountNumber(''); setAccountName(''); setAmount(''); setNote(''); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Bank transfer">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="field" style={{ marginTop: err ? 14 : 0 }}>
          <label htmlFor="bt-bank">Bank</label>
          <div className="input-wrap">
            <span className="lead"><Icon name="building" size={18} /></span>
            <select id="bt-bank" className="input has-lead" value={bank} onChange={(e) => setBank(e.target.value)}>
              {NG_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <Input label="Account number" placeholder="0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        <Input label="Account name (optional)" placeholder="Recipient name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
        <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
        <Input label="Six-digit transaction PIN" type="password" inputMode="numeric" maxLength="6" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Available balance: <Money value={user?.balance} className="text-blue" /></p>
        <Button type="submit" block size="lg" loading={loading}>Send transfer</Button>
      </form>
    </Modal>
  )
}

const RQ_MODES = [{ id: 'account', label: 'Account no.' }, { id: 'email', label: 'Email' }, { id: 'username', label: 'Username' }]
export function RequestMoneyModal({ open, onClose, onDone }) {
  const { api, user, toast } = useApp()
  const [mode, setMode] = useState('username')
  const [value, setValue] = useState('')
  const [resolved, setResolved] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [looking, setLooking] = useState(false)
  const [loading, setLoading] = useState(false)

  async function lookup() {
    setErr(''); setResolved(null)
    if (!value.trim()) return setErr('Enter who to request from.')
    setLooking(true)
    try {
      const r = await api.findRecipient(user.id, { method: mode, value })
      if (!r) return setErr('No VERA account matches those details.')
      setResolved(r)
    } catch (e2) { setErr(e2.message) } finally { setLooking(false) }
  }
  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!resolved) return setErr('Look up and confirm who to request from.')
    setLoading(true)
    try {
      await api.requestMoney(user.id, { recipient: resolved, amount, note })
      toast({ tone: 'success', title: 'Request sent', message: `Requested from ${resolved.name}.` })
      onDone?.(); setValue(''); setResolved(null); setAmount(''); setNote(''); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Request money">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="chip-row" style={{ margin: (err ? 14 : 0) + 'px 0 14px' }}>
          {RQ_MODES.map((m) => (
            <button type="button" className="chip" key={m.id} onClick={() => { setMode(m.id); setValue(''); setResolved(null) }}
              style={{ background: mode === m.id ? 'var(--vera-blue)' : '#fff', color: mode === m.id ? '#fff' : 'var(--vera-navy)', borderColor: mode === m.id ? 'var(--vera-blue)' : 'var(--border-strong)' }}>{m.label}</button>
          ))}
        </div>
        <Input label="From" placeholder={mode === 'username' ? '@username' : mode === 'email' ? 'name@vera.bank' : '4021 7788 0031'}
          value={value} onChange={(e) => { setValue(e.target.value); setResolved(null) }} />
        {!resolved ? (
          <Button type="button" variant="outline" block loading={looking} onClick={lookup} style={{ marginBottom: 14 }}>
            <Icon name="search" size={18} /> Look up</Button>
        ) : (
          <div className="settings-row" style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14 }}>
            <Avatar name={resolved.name} />
            <div className="s-txt"><b>{resolved.name}</b><small>{resolved.bank} · {resolved.accountNumber}</small></div>
            <Icon name="check" size={18} style={{ color: 'var(--vera-green)' }} />
          </div>
        )}
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
        <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" block size="lg" loading={loading}>Send request</Button>
      </form>
    </Modal>
  )
}
//__APPEND2__

const NET_TINT = { mtn: 'qi-amber', airtel: 'qi-blue', glo: 'qi-green', '9mobile': 'qi-navy' }
export function AirtimeDataModal({ open, onClose, onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [tab, setTab] = useState('airtime')
  const [network, setNetwork] = useState(NG_NETWORKS[0])
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [bundle, setBundle] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const pr = validatePhone(NG, phone)
      if (!pr.ok) { setErr(pr.error); setLoading(false); return }
      const res = tab === 'airtime'
        ? await api.buyAirtime(user.id, { network: network.name, phone: pr.e164, amount, pin })
        : await api.buyData(user.id, { network: network.name, phone: pr.e164, bundleLabel: bundle?.label, amount: bundle?.amount, pin })
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: tab === 'airtime' ? 'Airtime sent' : 'Data sent', message: `${network.name} · ${pr.e164}` })
      onDone?.(res); onReceipt?.(res.transaction)
      setPhone(''); setAmount(''); setBundle(null); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Airtime & Data">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="chip-row" style={{ margin: (err ? 14 : 0) + 'px 0 14px' }}>
          {[['airtime', 'Airtime'], ['data', 'Data']].map(([k, l]) => (
            <button type="button" className="chip" key={k} onClick={() => { setTab(k); setErr('') }}
              style={{ background: tab === k ? 'var(--vera-blue)' : '#fff', color: tab === k ? '#fff' : 'var(--vera-navy)', borderColor: tab === k ? 'var(--vera-blue)' : 'var(--border-strong)' }}>{l}</button>
          ))}
        </div>
        <div className="bill-grid" style={{ marginBottom: 14 }}>
          {NG_NETWORKS.map((n) => (
            <button type="button" key={n.id} className="bill-cat" onClick={() => setNetwork(n)}
              style={{ outline: network.id === n.id ? '2px solid var(--vera-blue)' : 'none' }}>
              <div className={`bi ${NET_TINT[n.id]}`}><Icon name="phone" size={20} /></div>
              <b>{n.name}</b>
            </button>
          ))}
        </div>
        <PhoneField label="Phone number" country={NG} value={phone} onChange={setPhone} />
        {tab === 'airtime' ? (
          <>
            <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
            <div className="chip-row" style={{ marginTop: -6, marginBottom: 14 }}>
              {[2, 5, 10, 20].map((a) => <button type="button" className="chip" key={a} onClick={() => setAmount(String(a))}>${a}</button>)}
            </div>
          </>
        ) : (
          <div className="field">
            <label>Data bundle</label>
            <div className="stack gap-2">
              {DATA_BUNDLES.map((d) => (
                <button type="button" key={d.id} onClick={() => setBundle(d)} className="settings-row"
                  style={{ border: '1px solid var(--border)', borderRadius: 12, outline: bundle?.id === d.id ? '2px solid var(--vera-blue)' : 'none' }}>
                  <span className="si"><Icon name="wifi" size={18} /></span>
                  <div className="s-txt"><b>{d.label}</b></div>
                  <b><Money value={d.amount} /></b>
                </button>
              ))}
            </div>
          </div>
        )}
        <Input label="Six-digit transaction PIN" type="password" inputMode="numeric" maxLength="6" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
        <p className="muted" style={{ fontSize: 13, margin: '6px 0 14px' }}>Available balance: <Money value={user?.balance} className="text-blue" /></p>
        <Button type="submit" block size="lg" loading={loading}>Buy {tab === 'airtime' ? 'airtime' : 'data'}</Button>
      </form>
    </Modal>
  )
}

export function GiftCardModal({ open, onClose, onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [brand, setBrand] = useState(GIFT_CARDS[0])
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!amount) return setErr('Choose a card amount.')
    setLoading(true)
    try {
      const res = await api.buyGiftCard(user.id, { brand: brand.name, amount, pin })
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Gift card purchased', message: `Code: ${res.code}` })
      onDone?.(res); onReceipt?.(res.transaction)
      setAmount(''); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Buy a gift card">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="bill-grid" style={{ margin: (err ? 14 : 0) + 'px 0 14px' }}>
          {GIFT_CARDS.map((g) => (
            <button type="button" key={g.id} className="bill-cat" onClick={() => { setBrand(g); setAmount('') }}
              style={{ outline: brand.id === g.id ? '2px solid var(--vera-blue)' : 'none' }}>
              <div className={`bi ${g.tint}`}><Icon name="gift" size={20} /></div>
              <b>{g.name}</b>
            </button>
          ))}
        </div>
        <div className="field">
          <label>Amount</label>
          <div className="chip-row">
            {brand.amounts.map((a) => (
              <button type="button" className="chip" key={a} onClick={() => setAmount(String(a))}
                style={{ background: String(a) === amount ? 'var(--vera-blue)' : '#fff', color: String(a) === amount ? '#fff' : 'var(--vera-navy)', borderColor: String(a) === amount ? 'var(--vera-blue)' : 'var(--border-strong)' }}>${a}</button>
            ))}
          </div>
        </div>
        <Input label="Six-digit transaction PIN" type="password" inputMode="numeric" maxLength="6" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
        <p className="muted" style={{ fontSize: 13, margin: '10px 0 14px' }}>Available balance: <Money value={user?.balance} className="text-blue" /></p>
        <Button type="submit" block size="lg" loading={loading}>Buy{amount ? <> <Money value={amount} /></> : ''}</Button>
      </form>
    </Modal>
  )
}

const QR_MERCHANTS = ['Shoprite Ikeja', 'Chicken Republic', 'Ebeano Supermarket', 'Filmhouse Cinemas', 'Domino\u2019s Pizza']
export function QRPayModal({ open, onClose, onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [merchant] = useState(() => QR_MERCHANTS[Math.floor(Math.random() * QR_MERCHANTS.length)])
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await api.transfer(user.id, { recipient: { name: merchant, accountNumber: 'QR · ' + merchant, bank: 'VERA Bank' }, method: 'QR code', amount, pin })
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Payment sent', message: `Paid ${merchant}.` })
      onDone?.(res); onReceipt?.(res.transaction)
      setAmount(''); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Pay with QR">
      <div className="qr-box" style={{ margin: '0 auto 12px' }}><Icon name="qr" size={110} style={{ color: 'var(--vera-navy)' }} /></div>
      <p className="muted" style={{ textAlign: 'center', marginBottom: 12 }}>Scanned merchant</p>
      <div className="settings-row" style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14 }}>
        <span className="si"><Icon name="building" size={18} /></span>
        <div className="s-txt"><b>{merchant}</b><small>VERA Bank merchant</small></div>
        <Icon name="check" size={18} style={{ color: 'var(--vera-green)' }} />
      </div>
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
        <Input label="Six-digit transaction PIN" type="password" inputMode="numeric" maxLength="6" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Available balance: <Money value={user?.balance} className="text-blue" /></p>
        <Button type="submit" block size="lg" loading={loading}>Pay {merchant.split(' ')[0]}</Button>
      </form>
    </Modal>
  )
}
//__APPEND3__

function Pocket({ p, onChange }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [amt, setAmt] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState('')
  const pct = p.target > 0 ? Math.min(100, Math.round((p.saved / p.target) * 100)) : 0
  async function move(dir) {
    setBusy(dir)
    try {
      if (!user?.id) throw new Error('Your session has expired. Please sign in again.')
      const res = dir === 'add' ? await api.pocketAdd(user.id, p.id, amt, pin) : await api.pocketWithdraw(user.id, p.id, amt, pin)
      if (!res || !Number.isFinite(Number(res.balance)) || !res.pocket) {
        throw new Error('We could not confirm your updated balance. Refresh the page and sign in again.')
      }
      patchUserBalance(Number(res.balance))
      toast({ tone: 'success', message: dir === 'add' ? 'Added to savings.' : 'Moved to balance.' })
      setAmt(''); setPin(''); onChange?.()
    } catch (e) { toast({ tone: 'error', message: e.message }) } finally { setBusy('') }
  }
  return (
    <div className="card card-pad stack gap-3" style={{ border: '1px solid var(--border)' }}>
      <div className="spread"><b>{p.name}</b><span className="muted" style={{ fontSize: 13 }}>{pct}%</span></div>
      <div style={{ height: 8, borderRadius: 8, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: 'var(--vera-green)' }} />
      </div>
      <div className="spread"><span className="muted" style={{ fontSize: 13 }}>Saved <Money value={p.saved} /></span><span className="muted" style={{ fontSize: 13 }}>Target <Money value={p.target} /></span></div>
      <div className="row gap-2" style={{ alignItems: 'center' }}>
        <div style={{ flex: 1 }}><Input placeholder="0.00" type="number" min="0" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} lead={<b>$</b>} /></div>
      </div>
      <Input label="Six-digit transaction PIN" type="password" inputMode="numeric" maxLength="6" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
      <div className="row gap-2">
        <Button variant="green" block loading={busy === 'add'} onClick={() => move('add')}><Icon name="plus" size={16} /> Add</Button>
        <Button variant="outline" block loading={busy === 'wd'} onClick={() => move('wd')}>Withdraw</Button>
      </div>
    </div>
  )
}

export function SavingsModal({ open, onClose, onDone }) {
  const { api, user, toast } = useApp()
  const { data: pockets, reload } = useFetch(() => api.getSavings(user.id), [user.id, open])
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  function refresh() { reload(); onDone?.() }
  async function create(e) {
    e.preventDefault(); setErr('')
    if (!name.trim()) return setErr('Give your pocket a name.')
    setLoading(true)
    try {
      if (!user?.id) throw new Error('Your session has expired. Please sign in again.')
      const created = await api.createPocket(user.id, { name: name.trim(), target: Number(target) || 0 })
      if (!created?.id) throw new Error('The pocket could not be confirmed. Please refresh and try again.')
      toast({ tone: 'success', message: 'Savings pocket created.' })
      setName(''); setTarget(''); refresh()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Savings pockets">
      <form onSubmit={create}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="row gap-2" style={{ marginTop: err ? 14 : 0 }}>
          <div style={{ flex: 2 }}><Input label="New pocket" placeholder="e.g. Rent" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div style={{ flex: 1 }}><Input label="Target" type="number" min="0" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} lead={<b>$</b>} /></div>
        </div>
        <Button type="submit" block loading={loading} style={{ marginBottom: 16 }}><Icon name="plus" size={16} /> Create pocket</Button>
      </form>
      <div className="stack gap-3" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {(pockets || []).length === 0 ? <EmptyState icon="wallet" title="No pockets yet">Create one to start saving.</EmptyState>
          : (pockets || []).map((p) => <Pocket key={p.id} p={p} onChange={refresh} />)}
      </div>
    </Modal>
  )
}
