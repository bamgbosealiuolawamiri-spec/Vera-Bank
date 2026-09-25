import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import { ErrorBanner } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { SAVED_RECIPIENTS, formatMoney } from '../../data/demoData.js'

export function Send() {
  const navigate = useNavigate()
  const [recipient, setRecipient] = useState('')
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState('')

  const cont = () => {
    setErr('')
    if (!recipient) return setErr('Enter or choose a recipient.')
    if (!amount || Number(amount) <= 0) return setErr('Enter a valid amount.')
    navigate('/app/confirm', { state: { recipient, amount: Number(amount), description: desc || 'Transfer', bank: selected?.bank || 'VERA Bank', account: selected?.account } })
  }

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/home')}><Icon name="arrowLeft" size={20} /> Send Money</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <ErrorBanner>{err}</ErrorBanner>
        <label style={{ fontSize: 13.5, fontWeight: 600, display: 'block', marginBottom: 10 }}>Saved recipients</label>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
          {SAVED_RECIPIENTS.map((r) => (
            <button key={r.id} onClick={() => { setSelected(r); setRecipient(r.name) }}
              style={{ background: 'none', border: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 62 }}>
              <span className="avatar" style={{ width: 52, height: 52, outline: selected?.id === r.id ? '3px solid var(--vera-blue)' : 'none', outlineOffset: 2 }}>{r.initials}</span>
              <small style={{ fontSize: 11.5 }}>{r.name.split(' ')[0]}</small>
            </button>
          ))}
        </div>
        <Input label="Recipient" icon="user" placeholder="Name or account number" value={recipient}
          onChange={(e) => { setRecipient(e.target.value); setSelected(null) }} />
        <div className="field">
          <label>Amount</label>
          <div className="card card-pad" style={{ padding: '8px 16px' }}>
            <input className="amount-input" inputMode="decimal" placeholder="\u20A60" value={amount ? '\u20A6' + amount : ''}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} aria-label="Amount" />
          </div>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {[1000, 5000, 10000, 20000].map((v) => (
              <button key={v} className="chip" onClick={() => setAmount(String(v))}>{formatMoney(v).replace('.00', '')}</button>
            ))}
          </div>
        </div>
        <Input label="Description / Purpose" icon="copy" placeholder="What\u2019s this for?" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button block size="lg" onClick={cont} iconRight={<Icon name="arrowRight" size={18} />}>Continue</Button>
      </div>
    </div>
  )
}

export function ConfirmTransfer() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)

  if (!state) { navigate('/app/send', { replace: true }); return null }

  const confirm = async () => {
    setErr(''); setLoading(true)
    try {
      const txn = await bank.transfer(state)
      setDone(txn)
      toast.success('Transfer successful', formatMoney(state.amount) + ' sent to ' + state.recipient)
    } catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="success-screen">
        <div className="ring"><Icon name="checkCircle" size={54} /></div>
        <h2>Transfer Successful</h2>
        <p>{formatMoney(state.amount)} sent to {state.recipient}.</p>
        <small className="muted">Ref: {done.reference}</small>
        <div className="stack gap-3" style={{ marginTop: 20, width: '100%', maxWidth: 260 }}>
          <Button block onClick={() => navigate('/app/home')}>Back to Dashboard</Button>
          <Button variant="outline" block onClick={() => navigate('/app/send')}>Send Again</Button>
        </div>
      </div>
    )
  }

  const rows = [['Recipient', state.recipient], ['Bank', state.bank], state.account && ['Account', state.account], ['Amount', formatMoney(state.amount)], ['Purpose', state.description], ['Fee', 'Free']].filter(Boolean)
  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/send')}><Icon name="arrowLeft" size={20} /> Confirm Transfer</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <div className="balance-card" style={{ marginBottom: 18, textAlign: 'center' }}>
          <div className="label" style={{ justifyContent: 'center' }}>You\u2019re sending</div>
          <div className="amount" style={{ textAlign: 'center' }}>{formatMoney(state.amount)}</div>
          <div style={{ textAlign: 'center', color: '#cdd9f2', fontSize: 13 }}>to {state.recipient}</div>
        </div>
        <ErrorBanner>{err}</ErrorBanner>
        <div className="list-card">{rows.map(([k, v]) => (<div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>))}</div>
        <Button block size="lg" style={{ marginTop: 18 }} loading={loading} onClick={confirm}>Confirm Transfer</Button>
      </div>
    </div>
  )
}
