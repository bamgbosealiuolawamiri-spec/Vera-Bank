import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Modal from '../../components/Modal.jsx'
import { ErrorBanner } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { BILL_CATEGORIES, formatMoney } from '../../data/demoData.js'

export default function Bills() {
  const navigate = useNavigate()
  const toast = useToast()
  const [cat, setCat] = useState(null)
  const [provider, setProvider] = useState('')
  const [amount, setAmount] = useState('')
  const [customer, setCustomer] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const close = () => { setCat(null); setProvider(''); setAmount(''); setCustomer(''); setErr('') }

  const pay = async () => {
    setErr(''); setLoading(true)
    try {
      await bank.payBill({ category: cat.label, provider, amount })
      toast.success('Payment successful', `${cat.label} \u2014 ${formatMoney(Number(amount))} to ${provider}.`)
      close()
      navigate('/app/home')
    } catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/home')}><Icon name="arrowLeft" size={20} /> Pay Bills</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>Choose a category to pay a bill instantly.</p>
        <div className="bill-grid">
          {BILL_CATEGORIES.map((c) => (
            <button key={c.id} className="bill-cat" onClick={() => { setCat(c); setProvider(c.providers[0]) }}>
              <span className={'bi ' + c.tint}><Icon name={c.icon} size={24} /></span>
              <div><b>{c.label}</b><br /><small>{c.providers.length} providers</small></div>
            </button>
          ))}
        </div>
      </div>

      <Modal open={!!cat} onClose={close} title={cat ? cat.label + ' Bill' : ''}
        footer={<Button block size="lg" loading={loading} onClick={pay}>Pay {amount ? formatMoney(Number(amount)) : 'Bill'}</Button>}>
        {cat && (
          <div>
            <ErrorBanner>{err}</ErrorBanner>
            <div className="field">
              <label>Provider</label>
              <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
                {cat.providers.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <Input label={cat.id === 'electricity' ? 'Meter Number' : cat.id === 'cabletv' ? 'Smartcard Number' : 'Customer ID'}
              icon="user" placeholder="Enter number" value={customer} onChange={(e) => setCustomer(e.target.value)} />
            <Input label="Amount" icon="card" inputMode="decimal" placeholder="\u20A60" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
          </div>
        )}
      </Modal>
    </div>
  )
}
