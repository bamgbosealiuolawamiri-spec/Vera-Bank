// Shared money-movement modals used by the web dashboard.
import React, { useState } from 'react'
import { Modal, Button, Input, Avatar, ErrorBanner, Money } from './ui.jsx'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const QUICK_AMOUNTS = [20, 50, 100, 250]
const SEND_MODES = [
  { id: 'saved', label: 'Saved' },
  { id: 'account', label: 'Account no.' },
  { id: 'email', label: 'Email' },
  { id: 'username', label: 'Username' },
]
const MODE_META = {
  account: { ph: '4021 7788 0031', hint: 'Enter a VERA account number.', method: 'Account number' },
  email: { ph: 'name@vera.bank', hint: 'Enter a VERA email address.', method: 'VERA email' },
  username: { ph: '@username', hint: 'Enter a VERA username.', method: 'VERA username' },
}

export function TransferModal({ open, onClose, beneficiaries = [], onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [mode, setMode] = useState('saved')
  const [benId, setBenId] = useState('')
  const [value, setValue] = useState('')
  const [resolved, setResolved] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [looking, setLooking] = useState(false)
  const [loading, setLoading] = useState(false)

  function reset() { setMode('saved'); setBenId(''); setValue(''); setResolved(null); setAmount(''); setNote(''); setErr('') }
  function switchMode(m) { setMode(m); setBenId(''); setValue(''); setResolved(null); setErr('') }

  async function lookup() {
    setErr(''); setResolved(null)
    if (!value.trim()) return setErr('Enter the recipient details to look up.')
    setLooking(true)
    try {
      const r = await api.findRecipient(user.id, { method: mode, value })
      if (!r) return setErr('No VERA account matches those details.')
      setResolved(r)
    } catch (e2) { setErr(e2.message) } finally { setLooking(false) }
  }

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (mode === 'saved' && !benId) return setErr('Choose who to send to.')
    if (mode !== 'saved' && !resolved) return setErr('Look up and confirm the recipient first.')
    setLoading(true)
    try {
      const payload = mode === 'saved'
        ? { beneficiaryId: benId, amount, note, method: 'Saved recipient' }
        : { recipient: resolved, method: MODE_META[mode].method, amount, note }
      const res = await api.transfer(user.id, payload)
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Transfer sent', message: 'Your money is on its way.' })
      onDone?.(res)
      onReceipt?.(res.transaction)
      reset(); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send money">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="chip-row" style={{ margin: (err ? 14 : 0) + 'px 0 14px' }}>
          {SEND_MODES.map((m) => (
            <button type="button" className="chip" key={m.id} onClick={() => switchMode(m.id)}
              style={{ background: mode === m.id ? 'var(--vera-blue)' : '#fff', color: mode === m.id ? '#fff' : 'var(--vera-navy)', borderColor: mode === m.id ? 'var(--vera-blue)' : 'var(--border-strong)' }}>{m.label}</button>
          ))}
        </div>
        {mode === 'saved' ? (
          <div className="field">
            <label>Recipient</label>
            <div className="stack gap-2">
              {beneficiaries.length === 0 && <p className="muted" style={{ fontSize: 13 }}>No saved recipients yet — send by account, email or username instead.</p>}
              {beneficiaries.map((b) => (
                <button type="button" key={b.id} onClick={() => setBenId(b.id)}
                  className="settings-row" style={{ border: '1px solid var(--border)', borderRadius: 12,
                    outline: benId === b.id ? '2px solid var(--vera-blue)' : 'none' }}>
                  <Avatar name={b.name} />
                  <div className="s-txt"><b>{b.name}</b><small>{b.bank} · {b.accountNumber}</small></div>
                  {benId === b.id && <Icon name="check" size={18} style={{ color: 'var(--vera-blue)' }} />}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Input label={SEND_MODES.find((m) => m.id === mode).label} placeholder={MODE_META[mode].ph}
              hint={MODE_META[mode].hint} value={value} onChange={(e) => { setValue(e.target.value); setResolved(null) }} />
            {!resolved ? (
              <Button type="button" variant="outline" block loading={looking} onClick={lookup} style={{ marginBottom: 14 }}>
                <Icon name="search" size={18} /> Look up recipient</Button>
            ) : (
              <div className="settings-row" style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14 }}>
                <Avatar name={resolved.name} />
                <div className="s-txt"><b>{resolved.name}</b><small>{resolved.bank} · {resolved.accountNumber}</small></div>
                <Icon name="check" size={18} style={{ color: 'var(--vera-green)' }} />
              </div>
            )}
          </>
        )}
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount}
          onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
        <div className="chip-row" style={{ marginTop: -6, marginBottom: 14 }}>
          {QUICK_AMOUNTS.map((a) => (
            <button type="button" className="chip" key={a} onClick={() => setAmount(String(a))}>${a}</button>
          ))}
        </div>
        <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Available balance: <Money value={user?.balance} className="text-blue" />
        </p>
        <Button type="submit" block size="lg" loading={loading}>Send{amount ? <> <Money value={amount} /></> : ''}</Button>
      </form>
    </Modal>
  )
}

const BILLERS = [
  { id: 'electric', name: 'Electricity', icon: 'zap', cat: 'Utilities' },
  { id: 'water', name: 'Water', icon: 'wallet', cat: 'Utilities' },
  { id: 'internet', name: 'Internet', icon: 'wifi', cat: 'Utilities' },
  { id: 'airtime', name: 'Airtime', icon: 'phone', cat: 'Telecom' },
]

export function BillPayModal({ open, onClose, onDone, onReceipt }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [biller, setBiller] = useState(BILLERS[0])
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await api.payBill(user.id, { biller: `${biller.name} bill`, amount, category: biller.cat })
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Bill paid', message: `${biller.name} payment successful.` })
      onDone?.(res); onReceipt?.(res.transaction); setAmount(''); onClose()
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pay a bill">
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="bill-grid" style={{ margin: (err ? 14 : 0) + 'px 0 16px' }}>
          {BILLERS.map((b) => (
            <button type="button" key={b.id} className="bill-cat" onClick={() => setBiller(b)}
              style={{ outline: biller.id === b.id ? '2px solid var(--vera-blue)' : 'none' }}>
              <div className="bi qi-blue"><Icon name={b.icon} size={22} /></div>
              <b>{b.name}</b><small>{b.cat}</small>
            </button>
          ))}
        </div>
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount}
          onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Available balance: <Money value={user?.balance} className="text-blue" />
        </p>
        <Button type="submit" block size="lg" loading={loading}>Pay bill</Button>
      </form>
    </Modal>
  )
}
