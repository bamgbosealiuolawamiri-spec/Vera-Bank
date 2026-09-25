// Shared building blocks for the VERA mobile app flows.
import React, { useState } from 'react'
import { Money, Avatar, Button, Input, ErrorBanner, Badge, Modal } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch } from '../web/dashboardData.js'

export function FlowHead({ title, onClose }) {
  return (
    <div className="app-topbar">
      <button className="back-btn" onClick={onClose}><Icon name="arrowLeft" size={20} /> Back</button>
      <b>{title}</b>
      <span style={{ width: 42 }} />
    </div>
  )
}

export function Success({ title, message, children, onClose, cta = 'Done' }) {
  return (
    <div className="success-screen">
      <div className="ring"><Icon name="check" size={44} /></div>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
      <Button size="lg" onClick={onClose} style={{ marginTop: 18, minWidth: 200 }}>{cta}</Button>
    </div>
  )
}

export function AmountField({ value, onChange, presets = [20, 50, 100, 250] }) {
  return (
    <>
      <input className="amount-input" type="number" min="0" step="0.01" placeholder="$0.00" autoFocus
        value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="chip-row" style={{ justifyContent: 'center', marginBottom: 16 }}>
        {presets.map((a) => <button key={a} className="chip" onClick={() => onChange(String(a))}>${a}</button>)}
      </div>
    </>
  )
}

// Card that clearly shows a resolved recipient's identity + account number.
export function RecipientCard({ rec }) {
  if (!rec) return null
  return (
    <div className="list-card" style={{ textAlign: 'left' }}>
      <div className="txn" style={{ borderBottom: '1px solid var(--border)' }}>
        <Avatar name={rec.name} />
        <div className="t-main"><b>{rec.name}</b><small>{rec.bank || 'VERA Bank'}{rec.username ? ` \u00b7 @${rec.username}` : ''}</small></div>
        {rec.kind === 'vera' && <Badge tone="green">VERA</Badge>}
      </div>
      <div className="review-row"><span className="k">Account number</span><span className="v">{rec.accountNumber || '\u2014'}</span></div>
      {rec.email && <div className="review-row"><span className="k">Email</span><span className="v">{rec.email}</span></div>}
    </div>
  )
}

const METHOD_LABEL = { account: 'Account Number', email: 'Email', username: 'Username', qr: 'Scan QR' }
const METHOD_PLACEHOLDER = { account: 'e.g. 4055 1092 8841', email: 'name@vera.bank', username: '@username' }

// Reusable recipient finder used by Send, Request and Pay-with-QR.
// Searches ONLY registered simulated VERA users. Calls onPick(recipient).
export function FindRecipient({ methods = ['account', 'email', 'username', 'qr'], onPick, showSaved = true }) {
  const { api, user } = useApp()
  const { data: bens } = useFetch(() => api.getBeneficiaries(user.id), [user.id])
  const [method, setMethod] = useState(methods[0])
  const [value, setValue] = useState('')
  const [rec, setRec] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  // Simulated QR: choose one of the known registered VERA identifiers.
  const QR_DEMO = [
    { label: 'Chidi Okafor', method: 'username', value: 'chidi' },
    { label: 'Amara Eze', method: 'username', value: 'amara' },
    { label: 'Tunde Bello', method: 'username', value: 'tunde' },
  ]

  async function find(m = method, v = value) {
    setErr(''); setRec(null); setLoading(true)
    try {
      const found = await api.findRecipient(user.id, { method: m, value: v })
      if (!found) setErr('No registered VERA user found for that ' + (METHOD_LABEL[m] || 'value') + '.')
      else setRec(found)
    } finally { setLoading(false) }
  }

  return (
    <div className="stack gap-4">
      <div className="seg">
        {methods.map((m) => (
          <button key={m} className={`seg-btn ${method === m ? 'active' : ''}`}
            onClick={() => { setMethod(m); setRec(null); setErr(''); setValue('') }}>{METHOD_LABEL[m]}</button>
        ))}
      </div>
      <ErrorBanner>{err}</ErrorBanner>

      {method === 'qr' ? (
        <div className="stack gap-3">
          <div className="qr-scanner"><div className="qr-frame"><Icon name="qr" size={72} /></div>
            <small>Simulated scanner \u00b7 demo only</small></div>
          <p className="muted" style={{ fontSize: 13, textAlign: 'center', margin: 0 }}>Tap a code to simulate a scan</p>
          <div className="list-card">
            {QR_DEMO.map((q) => (
              <button key={q.value} className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => find(q.method, q.value)}>
                <span className="ti credit"><Icon name="qr" size={18} /></span>
                <div className="t-main" style={{ textAlign: 'left' }}><b>{q.label}</b><small>Tap to scan QR</small></div>
                <Icon name="chevronRight" size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="stack gap-3">
          <Input label={`Recipient ${METHOD_LABEL[method]}`} placeholder={METHOD_PLACEHOLDER[method]}
            value={value} onChange={(e) => setValue(e.target.value)} />
          <Button block loading={loading} disabled={!value} onClick={() => find()}>Find recipient</Button>
          {showSaved && bens && bens.length > 0 && !rec && (
            <>
              <div className="section-title" style={{ marginTop: 4 }}><h3>Saved recipients</h3></div>
              <div className="list-card">
                {bens.map((b) => (
                  <button key={b.id} className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => onPick({ name: b.name, accountNumber: b.accountNumber, bank: b.bank })}>
                    <Avatar name={b.name} />
                    <div className="t-main" style={{ textAlign: 'left' }}><b>{b.name}</b><small>{b.bank} \u00b7 {b.accountNumber}</small></div>
                    <Icon name="chevronRight" size={18} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {rec && (
        <div className="stack gap-3">
          <RecipientCard rec={rec} />
          <Button block size="lg" onClick={() => onPick(rec)}>Continue</Button>
        </div>
      )}
    </div>
  )
}

// Full transaction receipt (VERA branded). Rendered inside a Modal.
export function ReceiptModal({ txn, open, onClose }) {
  const { toast } = useApp()
  if (!txn) return null
  const credit = txn.type === 'credit'
  const dt = new Date(txn.date)
  const dateStr = dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  function copyId() { navigator.clipboard?.writeText(txn.reference || txn.id); toast({ tone: 'success', message: 'Transaction ID copied.' }) }
  async function share() {
    const text = `VERA Bank receipt\n${txn.title}\nAmount: $${Number(txn.amount).toFixed(2)}\nRef: ${txn.reference || txn.id}\nDate: ${dateStr}`
    try {
      if (navigator.share) await navigator.share({ title: 'VERA receipt', text })
      else { await navigator.clipboard?.writeText(text); toast({ tone: 'success', message: 'Receipt copied to clipboard.' }) }
    } catch (e) { /* user cancelled */ }
  }
  return (
    <Modal open={open} onClose={onClose} title="Transaction receipt">
      <div className="receipt">
        <div className="receipt-hd">
          <span className="vera-logo"><span className="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5l8 15 8-15" /></svg></span><span className="name">VERA<b>.</b></span></span>
          <Badge tone={txn.status === 'Pending' ? 'amber' : txn.status === 'Declined' || txn.status === 'failed' ? 'red' : 'green'}>{txn.status || 'completed'}</Badge>
        </div>
        <div className={`receipt-amt ${credit ? 'text-green' : ''}`}>{credit ? '+' : '\u2212'}<Money value={txn.amount} /></div>
        <div className="list-card" style={{ textAlign: 'left' }}>
          <div className="review-row"><span className="k">Type</span><span className="v">{txn.category || (credit ? 'Credit' : 'Debit')}</span></div>
          <div className="review-row"><span className="k">Description</span><span className="v">{txn.title}</span></div>
          <div className="review-row"><span className="k">Date &amp; time</span><span className="v">{dateStr}</span></div>
          {txn.sender?.name && <div className="review-row"><span className="k">Sender</span><span className="v">{txn.sender.name}</span></div>}
          {txn.recipient?.name && <div className="review-row"><span className="k">Recipient</span><span className="v">{txn.recipient.name}</span></div>}
          {txn.recipient?.accountNumber && <div className="review-row"><span className="k">Account</span><span className="v">{txn.recipient.accountNumber}</span></div>}
          {txn.method && <div className="review-row"><span className="k">Payment method</span><span className="v">{txn.method}</span></div>}
          {txn.meta?.code && <div className="review-row"><span className="k">Gift code</span><span className="v">{txn.meta.code}</span></div>}
          {txn.note && <div className="review-row"><span className="k">Note</span><span className="v">{txn.note}</span></div>}
          <div className="review-row"><span className="k">Reference ID</span><span className="v">{txn.reference || txn.id}</span></div>
        </div>
        <div className="row gap-2" style={{ marginTop: 14 }}>
          <Button variant="outline" block onClick={copyId}><Icon name="copy" size={16} /> Copy ID</Button>
          <Button block onClick={share}><Icon name="send" size={16} /> Share</Button>
        </div>
        <p className="muted" style={{ textAlign: 'center', fontSize: 11.5, marginTop: 12 }}>VERA Bank \u2014 fictional demo. Simulated transaction, no real money moved.</p>
      </div>
    </Modal>
  )
}
