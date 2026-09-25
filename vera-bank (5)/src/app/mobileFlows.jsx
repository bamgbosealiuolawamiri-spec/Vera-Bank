// New VERA mobile flows (all simulated): Add Money, Bank Transfer, Airtime,
// Data, Gift Cards, Request Money, Pay with QR, Savings, Notifications.
import React, { useState } from 'react'
import { Money, Avatar, Button, Input, ErrorBanner, Badge, EmptyState, Modal, PhoneField } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch } from '../web/dashboardData.js'
import { NG_BANKS, NG_NETWORKS, DATA_BUNDLES, GIFT_CARDS } from '../data/seed.js'
import { countryByCode, validatePhone } from '../data/phone.js'
import { FlowHead, Success, AmountField, RecipientCard, FindRecipient, ReceiptModal } from './mobileParts.jsx'

const NG = countryByCode('NG')

function DemoTag() { return <span className="demo-tag">Simulated demo</span> }

// ---------------- ADD MONEY ----------------
export function AddMoneyFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const METHODS = [
    { id: 'Debit card', icon: 'card', desc: 'Instant top-up from a card' },
    { id: 'Bank transfer', icon: 'building', desc: 'From a linked bank account' },
    { id: 'Voucher', icon: 'gift', desc: 'Redeem a demo voucher' },
  ]
  const [step, setStep] = useState('method')
  const [method, setMethod] = useState(null)
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  async function confirm() {
    setErr(''); setLoading(true)
    try {
      const res = await api.deposit(user.id, amount, method.id)
      patchUserBalance(res.balance)
      setTxn(res.transaction)
      toast({ tone: 'success', title: 'Money added', message: `$${Number(amount).toFixed(2)} added to your balance.` })
      setStep('done')
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Money added" message={`$${Number(amount).toFixed(2)} is now in your VERA balance.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Add money" onClose={step === 'method' ? onClose : () => setStep('method')} />
      <div className="app-pad">
        {step === 'method' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 12px' }}><h1 style={{ fontSize: 20 }}>How do you want to add money?</h1><DemoTag /></div>
            <div className="list-card">
              {METHODS.map((m) => (
                <button key={m.id} className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => { setMethod(m); setStep('amount') }}>
                  <span className="ti credit"><Icon name={m.icon} size={18} /></span>
                  <div className="t-main" style={{ textAlign: 'left' }}><b>{m.id}</b><small>{m.desc}</small></div>
                  <Icon name="chevronRight" size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 'amount' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 6px', textAlign: 'center' }}><p>Add via {method.id}</p></div>
            <ErrorBanner>{err}</ErrorBanner>
            <AmountField value={amount} onChange={setAmount} presets={[50, 100, 250, 500]} />
            <p className="muted" style={{ fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Current balance: <Money value={user.balance} className="text-blue" /></p>
            <Button block size="lg" loading={loading} disabled={!amount} onClick={confirm}>Add {amount ? <Money value={amount} /> : 'money'}</Button>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------- BANK TRANSFER ----------------
const SIM_NAMES = ['Emeka Obi', 'Fatima Yusuf', 'Bola Ahmed', 'Grace Okon', 'Samuel Ade', 'Zainab Musa', 'Peter Eze', 'Halima Sani']
function simName(acct) {
  const digits = String(acct).replace(/\D/g, '')
  const i = (Number(digits.slice(-2)) || digits.length) % SIM_NAMES.length
  return SIM_NAMES[i]
}

export function BankTransferFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [step, setStep] = useState('form')
  const [bank, setBank] = useState('')
  const [bankQ, setBankQ] = useState('')
  const [acct, setAcct] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const acctName = simName(acct)
  const banks = NG_BANKS.filter((b) => b.toLowerCase().includes(bankQ.toLowerCase()))

  async function confirm() {
    setErr(''); setLoading(true)
    try {
      const res = await api.bankTransfer(user.id, { bank, accountNumber: acct, accountName: acctName, amount, note })
      patchUserBalance(res.balance)
      setTxn(res.transaction)
      toast({ tone: 'success', title: 'Transfer successful', message: `$${Number(amount).toFixed(2)} sent to ${acctName}.` })
      setStep('done')
    } catch (e) { setErr(e.message); setStep('form') } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Transfer successful" message={`$${Number(amount).toFixed(2)} sent to ${acctName} (${bank}).`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Bank transfer" onClose={step === 'form' ? onClose : () => setStep('form')} />
      <div className="app-pad">
        {step === 'form' && (
          <div className="stack gap-3">
            <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Send to a bank</h1><DemoTag /></div>
            <ErrorBanner>{err}</ErrorBanner>
            <Input label="Bank" placeholder="Search bank" value={bank || bankQ} onChange={(e) => { setBank(''); setBankQ(e.target.value) }} lead={<Icon name="building" size={18} />} />
            {!bank && bankQ && (
              <div className="list-card" style={{ maxHeight: 220, overflow: 'auto' }}>
                {banks.length === 0 ? <EmptyState title="No match">Try another bank name.</EmptyState> : banks.map((b) => (
                  <button key={b} className="settings-row" style={{ cursor: 'pointer' }} onClick={() => { setBank(b); setBankQ('') }}>
                    <span className="si"><Icon name="building" size={16} /></span><div className="s-txt"><b>{b}</b></div></button>
                ))}
              </div>
            )}
            <Input label="Account number" placeholder="10-digit account number" value={acct} onChange={(e) => setAcct(e.target.value)} lead={<Icon name="card" size={18} />} />
            <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} />
            <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button block size="lg" disabled={!bank || !acct || !amount} onClick={() => setStep('review')}>Continue</Button>
          </div>
        )}
        {step === 'review' && (
          <div className="stack gap-3">
            <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Confirm transfer</h1></div>
            <div className="list-card">
              <div className="review-row"><span className="k">Account name</span><span className="v">{acctName}</span></div>
              <div className="review-row"><span className="k">Account number</span><span className="v">{acct}</span></div>
              <div className="review-row"><span className="k">Bank</span><span className="v">{bank}</span></div>
              <div className="review-row"><span className="k">Amount</span><span className="v"><Money value={amount} /></span></div>
              {note && <div className="review-row"><span className="k">Note</span><span className="v">{note}</span></div>}
            </div>
            <p className="muted" style={{ fontSize: 12.5, textAlign: 'center', margin: 0 }}>Recipient details are simulated for this demo.</p>
            <Button block size="lg" loading={loading} onClick={confirm}>Confirm &amp; send</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- AIRTIME & DATA ----------------
function NetworkPicker({ value, onChange }) {
  return (
    <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
      {NG_NETWORKS.map((n) => (
        <button key={n.id} className="quick" onClick={() => onChange(n)} style={value?.id === n.id ? { outline: '2px solid var(--vera-blue)', borderRadius: 14 } : undefined}>
          <span className={`qi ${n.tint}`}><Icon name="phone" size={18} /></span><span>{n.name}</span>
        </button>
      ))}
    </div>
  )
}

export function AirtimeFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [net, setNet] = useState(null)
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null); const [showReceipt, setShowReceipt] = useState(false)
  const [done, setDone] = useState(false)
  async function buy() {
    setErr(''); setLoading(true)
    try {
      const pr = validatePhone(NG, phone)
      if (!pr.ok) { setErr(pr.error); setLoading(false); return }
      const res = await api.buyAirtime(user.id, { network: net.name, phone: pr.e164, amount })
      patchUserBalance(res.balance); setTxn(res.transaction)
      toast({ tone: 'success', title: 'Airtime purchase', message: `$${Number(amount).toFixed(2)} ${net.name} airtime sent.` })
      setDone(true)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  if (done) return (
    <div className="app-scroll"><Success title="Airtime sent" message={`${net.name} airtime of $${Number(amount).toFixed(2)} sent to ${phone}.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )
  return (
    <div className="app-scroll">
      <FlowHead title="Airtime" onClose={onClose} />
      <div className="app-pad stack gap-3">
        <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Buy airtime</h1><DemoTag /></div>
        <ErrorBanner>{err}</ErrorBanner>
        <label className="lbl">Network</label>
        <NetworkPicker value={net} onChange={setNet} />
        <PhoneField label="Phone number" country={NG} value={phone} onChange={setPhone} />
        <AmountField value={amount} onChange={setAmount} presets={[1, 2, 5, 10]} />
        <Button block size="lg" loading={loading} disabled={!net || !phone || !amount} onClick={buy}>Buy airtime</Button>
      </div>
    </div>
  )
}

export function DataFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [net, setNet] = useState(null)
  const [phone, setPhone] = useState('')
  const [bundle, setBundle] = useState(null)
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null); const [showReceipt, setShowReceipt] = useState(false); const [done, setDone] = useState(false)
  async function buy() {
    setErr(''); setLoading(true)
    try {
      const pr = validatePhone(NG, phone)
      if (!pr.ok) { setErr(pr.error); setLoading(false); return }
      const res = await api.buyData(user.id, { network: net.name, phone: pr.e164, bundleLabel: bundle.label, amount: bundle.amount })
      patchUserBalance(res.balance); setTxn(res.transaction)
      toast({ tone: 'success', title: 'Data purchase', message: `${bundle.label} ${net.name} data sent.` })
      setDone(true)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  if (done) return (
    <div className="app-scroll"><Success title="Data sent" message={`${bundle.label} ${net.name} data sent to ${phone}.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )
  return (
    <div className="app-scroll">
      <FlowHead title="Data" onClose={onClose} />
      <div className="app-pad stack gap-3">
        <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Buy data</h1><DemoTag /></div>
        <ErrorBanner>{err}</ErrorBanner>
        <label className="lbl">Network</label>
        <NetworkPicker value={net} onChange={setNet} />
        <PhoneField label="Phone number" country={NG} value={phone} onChange={setPhone} />
        <label className="lbl">Data bundle</label>
        <div className="list-card">
          {DATA_BUNDLES.map((d) => (
            <button key={d.id} className="txn" style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', ...(bundle?.id === d.id ? { background: 'var(--surface-2, #f2f6ff)' } : {}) }}
              onClick={() => setBundle(d)}>
              <span className="ti credit"><Icon name="wifi" size={18} /></span>
              <div className="t-main" style={{ textAlign: 'left' }}><b>{d.label}</b></div>
              <span className="t-amt"><Money value={d.amount} /></span>
            </button>
          ))}
        </div>
        <Button block size="lg" loading={loading} disabled={!net || !phone || !bundle} onClick={buy}>Buy data</Button>
      </div>
    </div>
  )
}

// ---------------- GIFT CARDS ----------------
export function GiftCardsFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [step, setStep] = useState('brand')
  const [brand, setBrand] = useState(null)
  const [amount, setAmount] = useState(null)
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null); const [code, setCode] = useState(''); const [showReceipt, setShowReceipt] = useState(false)

  async function confirm() {
    setErr(''); setLoading(true)
    try {
      const res = await api.buyGiftCard(user.id, { brand: brand.name, amount })
      patchUserBalance(res.balance); setTxn(res.transaction); setCode(res.code)
      toast({ tone: 'success', title: 'Gift card purchased', message: `Simulated ${brand.name} for $${Number(amount).toFixed(2)}.` })
      setStep('done')
    } catch (e) { setErr(e.message); setStep('amount') } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Purchase successful" message={`Your simulated ${brand.name} is ready.`} onClose={onClose}>
      <div className="list-card" style={{ marginTop: 14, textAlign: 'left', width: '100%' }}>
        <div className="review-row"><span className="k">Brand</span><span className="v">{brand.name}</span></div>
        <div className="review-row"><span className="k">Value</span><span className="v"><Money value={amount} /></span></div>
        <div className="review-row"><span className="k">Demo code</span><span className="v">{code}</span></div>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Simulated code \u2014 not redeemable anywhere.</p>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Gift cards" onClose={step === 'brand' ? onClose : () => setStep(step === 'amount' ? 'brand' : 'amount')} />
      <div className="app-pad">
        {step === 'brand' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 12px' }}><h1 style={{ fontSize: 20 }}>Choose a gift card</h1><DemoTag /></div>
            <div className="bill-grid">
              {GIFT_CARDS.map((g) => (
                <button key={g.id} className="bill-cat" onClick={() => { setBrand(g); setAmount(null); setStep('amount') }}>
                  <div className={`bi ${g.tint}`}><Icon name="gift" size={22} /></div>
                  <b>{g.name}</b><small>Demo</small>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 'amount' && (
          <div className="stack gap-3">
            <div className="screen-head" style={{ padding: '0 0 4px', textAlign: 'center' }}><p>{brand.name}</p></div>
            <ErrorBanner>{err}</ErrorBanner>
            <label className="lbl">Select amount</label>
            <div className="chip-row" style={{ flexWrap: 'wrap' }}>
              {brand.amounts.map((a) => (
                <button key={a} className={`chip ${amount === a ? 'chip-on' : ''}`} onClick={() => setAmount(a)}>${a}</button>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>Available: <Money value={user.balance} className="text-blue" /></p>
            <Button block size="lg" disabled={!amount} onClick={() => setStep('summary')}>Continue</Button>
          </div>
        )}
        {step === 'summary' && (
          <div className="stack gap-3">
            <div className="screen-head" style={{ padding: '0 0 4px' }}><h1 style={{ fontSize: 20 }}>Purchase summary</h1></div>
            <div className="list-card">
              <div className="review-row"><span className="k">Brand</span><span className="v">{brand.name}</span></div>
              <div className="review-row"><span className="k">Amount</span><span className="v"><Money value={amount} /></span></div>
              <div className="review-row"><span className="k">Pay from</span><span className="v">VERA balance</span></div>
              <div className="review-row"><span className="k">Type</span><span className="v">Simulated / demo</span></div>
            </div>
            <Button block size="lg" loading={loading} onClick={confirm}>Confirm purchase</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- REQUEST MONEY ----------------
export function RequestMoneyFlow({ onClose }) {
  const { api, user, toast } = useApp()
  const [step, setStep] = useState('who')
  const [rec, setRec] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  async function send() {
    setErr(''); setLoading(true)
    try {
      await api.requestMoney(user.id, { recipient: rec, amount, note })
      toast({ tone: 'success', title: 'Request sent', message: `You requested $${Number(amount).toFixed(2)} from ${rec.name}.` })
      setStep('done')
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Request sent" message={`Your request to ${rec.name} is now pending.`} onClose={onClose}>
      <Badge tone="amber">Pending</Badge>
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Request money" onClose={step === 'who' ? onClose : () => setStep('who')} />
      <div className="app-pad">
        {step === 'who' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 10px' }}><h1 style={{ fontSize: 20 }}>Request from</h1><p>Registered VERA users only</p></div>
            <FindRecipient methods={['username', 'email', 'account']} showSaved={false} onPick={(r) => { setRec(r); setStep('amount') }} />
          </>
        )}
        {step === 'amount' && (
          <div className="stack gap-3">
            <RecipientCard rec={rec} />
            <ErrorBanner>{err}</ErrorBanner>
            <AmountField value={amount} onChange={setAmount} />
            <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button block size="lg" loading={loading} disabled={!amount} onClick={send}>Send request</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- PAY WITH QR ----------------
export function PayQRFlow({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const [step, setStep] = useState('scan')
  const [rec, setRec] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const [txn, setTxn] = useState(null); const [showReceipt, setShowReceipt] = useState(false)

  async function pay() {
    setErr(''); setLoading(true)
    try {
      const res = await api.transfer(user.id, { recipient: rec, amount, note, method: 'QR payment' })
      patchUserBalance(res.balance); setTxn(res.transaction)
      toast({ tone: 'success', title: 'Payment successful', message: `$${Number(amount).toFixed(2)} paid to ${rec.name}.` })
      setStep('done')
    } catch (e) { setErr(e.message); setStep('amount') } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="app-scroll"><Success title="Payment successful" message={`$${Number(amount).toFixed(2)} paid to ${rec.name}.`} onClose={onClose}>
      <Button variant="outline" onClick={() => setShowReceipt(true)} style={{ marginTop: 12, minWidth: 200 }}><Icon name="receipt" size={16} /> View receipt</Button>
      <ReceiptModal txn={txn} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </Success></div>
  )

  return (
    <div className="app-scroll">
      <FlowHead title="Pay with QR" onClose={step === 'scan' ? onClose : () => setStep('scan')} />
      <div className="app-pad">
        {step === 'scan' && (
          <>
            <div className="screen-head" style={{ padding: '0 0 10px' }}><h1 style={{ fontSize: 20 }}>Scan to pay</h1><DemoTag /></div>
            <FindRecipient methods={['qr', 'username', 'account']} showSaved={false} onPick={(r) => { setRec(r); setStep('amount') }} />
          </>
        )}
        {step === 'amount' && (
          <div className="stack gap-3">
            <RecipientCard rec={rec} />
            <ErrorBanner>{err}</ErrorBanner>
            <AmountField value={amount} onChange={setAmount} />
            <Input label="Note (optional)" placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} />
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>Available: <Money value={user.balance} className="text-blue" /></p>
            <Button block size="lg" loading={loading} disabled={!amount} onClick={pay}>Pay {amount ? <Money value={amount} /> : ''}</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- SAVINGS POCKETS ----------------
export function SavingsScreen({ onClose }) {
  const { api, user, patchUserBalance, toast } = useApp()
  const { data: pockets, loading, reload } = useFetch(() => api.getSavings(user.id), [user.id])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', targetDate: '' })
  const [action, setAction] = useState(null) // { pocket, mode:'add'|'withdraw' }
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)

  async function create(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await api.createPocket(user.id, { name: form.name, target: Number(form.target) || 0, targetDate: form.targetDate }); toast({ tone: 'success', message: 'Pocket created.' }); setShowNew(false); setForm({ name: '', target: '', targetDate: '' }); reload() }
    catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  async function move(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const res = action.mode === 'add' ? await api.pocketAdd(user.id, action.pocket.id, amount) : await api.pocketWithdraw(user.id, action.pocket.id, amount)
      patchUserBalance(res.balance)
      toast({ tone: 'success', message: action.mode === 'add' ? 'Added to savings.' : 'Withdrawn to balance.' })
      setAction(null); setAmount(''); reload()
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  return (
    <div className="app-scroll app-pad-b">
      <FlowHead title="Savings pockets" onClose={onClose} />
      <div className="app-pad stack gap-4">
        <div className="spread"><div><h1 style={{ fontSize: 20 }}>Your pockets</h1><p className="muted" style={{ fontSize: 13, margin: 0 }}>Save towards your goals</p></div>
          <Button size="sm" onClick={() => { setErr(''); setShowNew(true) }}><Icon name="plus" size={16} /> New</Button></div>
        {loading ? <div className="center" style={{ padding: 30 }}><span className="spinner dark" /></div>
          : (pockets || []).length === 0 ? <EmptyState title="No pockets yet">Create a pocket to start saving.</EmptyState>
            : (pockets || []).map((p) => {
              const pct = p.target > 0 ? Math.min(100, Math.round((p.saved / p.target) * 100)) : 0
              return (
                <div key={p.id} className="card card-pad stack gap-2">
                  <div className="spread"><b>{p.name}</b><span className="muted" style={{ fontSize: 13 }}>{pct}%</span></div>
                  <div className="progress"><i style={{ width: pct + '%' }} /></div>
                  <div className="spread" style={{ fontSize: 13 }}><span><Money value={p.saved} className="text-blue" /> saved</span><span className="muted">of <Money value={p.target} /></span></div>
                  {p.targetDate && <small className="muted">Target date: {p.targetDate}</small>}
                  <div className="row gap-2" style={{ marginTop: 4 }}>
                    <Button variant="outline" block onClick={() => { setErr(''); setAmount(''); setAction({ pocket: p, mode: 'add' }) }}>Add</Button>
                    <Button variant="outline" block onClick={() => { setErr(''); setAmount(''); setAction({ pocket: p, mode: 'withdraw' }) }}>Withdraw</Button>
                  </div>
                </div>
              )
            })}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New savings pocket">
        <form onSubmit={create} className="stack gap-3">
          <ErrorBanner>{err}</ErrorBanner>
          <Input label="Pocket name" placeholder="e.g. Rent" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
          <Input label="Target amount" type="number" min="0" placeholder="0.00" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} lead={<b>$</b>} />
          <Input label="Target date (optional)" type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
          <Button type="submit" block size="lg" loading={busy}>Create pocket</Button>
        </form>
      </Modal>

      <Modal open={!!action} onClose={() => setAction(null)} title={action?.mode === 'add' ? 'Add to pocket' : 'Withdraw from pocket'}>
        {action && (
          <form onSubmit={move} className="stack gap-3">
            <ErrorBanner>{err}</ErrorBanner>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>{action.pocket.name} \u00b7 <Money value={action.pocket.saved} /> saved</p>
            <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} lead={<b>$</b>} autoFocus />
            <Button type="submit" block size="lg" loading={busy}>{action.mode === 'add' ? 'Add money' : 'Withdraw'}</Button>
          </form>
        )}
      </Modal>
    </div>
  )
}

// ---------------- NOTIFICATIONS ----------------
export function NotificationsScreen({ onClose }) {
  const { api, user } = useApp()
  const { data: notes, loading } = useFetch(async () => { const n = await api.getNotifications(user.id); api.markNotificationsRead(user.id); return n }, [user.id])
  const iconFor = { success: 'check', error: 'alert', info: 'info' }
  return (
    <div className="app-scroll app-pad-b">
      <FlowHead title="Notifications" onClose={onClose} />
      <div className="app-pad">
        <div className="list-card">
          {loading ? <div className="center" style={{ padding: 30 }}><span className="spinner dark" /></div>
            : (notes || []).length === 0 ? <EmptyState title="All caught up">You have no notifications.</EmptyState>
              : (notes || []).map((n) => (
                <div key={n.id} className="txn" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className={`ti ${n.kind === 'error' ? 'debit' : 'credit'}`}><Icon name={iconFor[n.kind] || 'info'} size={18} /></span>
                  <div className="t-main"><b>{n.title}</b><small>{n.message}</small></div>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
