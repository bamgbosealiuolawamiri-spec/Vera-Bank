import React, { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Card from '../../components/Card.jsx'
import BalanceCard from '../../components/BalanceCard.jsx'
import { LoadingBlock, EmptyState, ErrorBanner } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { SAVED_RECIPIENTS, formatMoney, formatDate } from '../../data/demoData.js'

const TILES = [
  { key: 'send', label: 'Send Money', sub: 'Transfer instantly', icon: 'send', tint: 'qi-blue' },
  { key: 'receive', label: 'Receive', sub: 'Share your details', icon: 'receive', tint: 'qi-green' },
  { key: 'bills', label: 'Pay Bills', sub: 'Utilities & more', icon: 'bills', tint: 'qi-amber' },
  { key: 'cards', label: 'Cards', sub: 'Manage your card', icon: 'card', tint: 'qi-navy' },
]

export function Overview({ account, txns, onGo }) {
  const inflow = (txns || []).filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const outflow = (txns || []).filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  return (
    <div className="stack gap-6">
      <div className="dash-grid">
        <div className="stack gap-6">
          {account ? <BalanceCard account={account} size="lg" /> : <LoadingBlock />}
          <div>
            <h3 style={{ marginBottom: 14 }}>Quick actions</h3>
            <div className="action-tiles">
              {TILES.map((t) => (
                <button key={t.key} className="action-tile" onClick={() => onGo(t.key)}>
                  <span className={'ai ' + t.tint}><Icon name={t.icon} size={22} /></span>
                  <div><b>{t.label}</b><br /><small>{t.sub}</small></div>
                </button>
              ))}
            </div>
          </div>
          <Card title="Recent Transactions" action={<Button variant="ghost" onClick={() => onGo('transactions')}>See all</Button>}>
            {!txns ? <LoadingBlock height={120} /> : (
              <table className="txn-table">
                <thead><tr><th>Description</th><th>Date</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {txns.slice(0, 6).map((t) => (
                    <tr key={t.id}>
                      <td data-l="Description"><b>{t.party}</b><br /><small className="muted">{t.description}</small></td>
                      <td data-l="Date" className="muted">{formatDate(t.date)}</td>
                      <td data-l="Reference" className="muted">{t.reference}</td>
                      <td data-l="Amount" style={{ textAlign: 'right' }} className={t.type === 'credit' ? 'amt-c' : 'amt-d'}>{t.type === 'credit' ? '+' : '\u2212'}{formatMoney(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
        <div className="stack gap-6">
          <div className="dash-grid-3" style={{ gridTemplateColumns: '1fr' }}>
            <div className="stat-card"><span className="muted" style={{ fontSize: 13 }}><Icon name="trend" size={15} /> Money in</span><div className="sv text-green">{formatMoney(inflow)}</div><small className="muted">Recent credits</small></div>
            <div className="stat-card"><span className="muted" style={{ fontSize: 13 }}><Icon name="send" size={15} /> Money out</span><div className="sv">{formatMoney(outflow)}</div><small className="muted">Recent debits</small></div>
          </div>
          <Card title="Account Information">
            {account && [['Account Holder', account.accountHolder], ['Account Number', account.accountNumber], ['Account Type', account.accountType], ['Bank', account.bankName]].map(([k, v]) => (
              <div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

export function SendPanel({ onDone }) {
  const toast = useToast()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const txn = await bank.transfer({ recipient, amount, description: desc })
      toast.success('Transfer successful', formatMoney(txn.amount) + ' sent to ' + recipient)
      setRecipient(''); setAmount(''); setDesc(''); onDone?.()
    } catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="dash-grid">
      <Card title="Send Money">
        <form onSubmit={submit}>
          <ErrorBanner>{err}</ErrorBanner>
          <Input label="Recipient" icon="user" placeholder="Name or account number" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <Input label="Amount (\u20A6)" icon="card" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
          <Input label="Description / Purpose" icon="copy" placeholder="What\u2019s this for?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button type="submit" block size="lg" loading={loading}>Send Money</Button>
        </form>
      </Card>
      <Card title="Saved recipients">
        {SAVED_RECIPIENTS.map((r) => (
          <button key={r.id} className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }} onClick={() => setRecipient(r.name)}>
            <span className="avatar" style={{ width: 40, height: 40 }}>{r.initials}</span>
            <span className="t-main"><b>{r.name}</b><small>{r.bank} \u00b7 {r.account}</small></span>
            <Icon name="arrowRight" size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        ))}
      </Card>
    </div>
  )
}

export function ReceivePanel({ account }) {
  const toast = useToast()
  if (!account) return <LoadingBlock />
  const copy = (t, l) => { try { navigator.clipboard?.writeText(t) } catch (e) {} toast.success('Copied', l + ' copied.') }
  return (
    <div className="dash-grid">
      <Card title="Receive Money">
        <p className="muted" style={{ marginBottom: 16 }}>Share your account details or QR code to get paid from any bank.</p>
        {[['Bank Name', account.bankName], ['Account Holder', account.accountHolder], ['Account Number', account.accountNumber], ['Account Type', account.accountType]].map(([k, v]) => (
          <div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
        ))}
        <div className="row gap-3" style={{ marginTop: 18 }}>
          <Button variant="outline" onClick={() => copy(account.accountNumber, 'Account number')} iconLeft={<Icon name="copy" size={18} />}>Copy number</Button>
          <Button variant="green" onClick={() => copy('VERA Bank ' + account.accountNumber, 'Account details')} iconLeft={<Icon name="share" size={18} />}>Share details</Button>
        </div>
      </Card>
      <Card title="Your QR code">
        <div className="center" style={{ flexDirection: 'column', gap: 12, padding: 20 }}>
          <div className="qr-box" style={{ width: 220, height: 220 }} role="img" aria-label="Account QR placeholder"><Icon name="qr" size={150} style={{ color: 'var(--vera-navy)' }} /></div>
          <small className="muted">Scan to pay this VERA account (demo QR)</small>
        </div>
      </Card>
    </div>
  )
}
