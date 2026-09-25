import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import { LoadingBlock } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { formatMoney } from '../../data/demoData.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Receive() {
  const navigate = useNavigate()
  const toast = useToast()
  const [account, setAccount] = useState(null)
  useEffect(() => { bank.getAccount().then(setAccount) }, [])

  const copy = (text, label) => {
    try { navigator.clipboard?.writeText(text) } catch (e) { /* ignore */ }
    toast.success('Copied', label + ' copied to clipboard.')
  }
  const share = () => {
    const details = `VERA Bank\nAccount: ${account.accountNumber}\nHolder: ${account.accountHolder}`
    if (navigator.share) navigator.share({ title: 'My VERA account', text: details }).catch(() => {})
    else copy(details, 'Account details')
  }

  if (!account) return <div className="app-pad"><LoadingBlock label="Loading account\u2026" /></div>

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/home')}><Icon name="arrowLeft" size={20} /> Receive Money</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <span className="muted" style={{ fontSize: 13 }}>Available Balance</span>
          <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 16px' }}>{formatMoney(account.balance)}</div>
          <div className="qr-box" role="img" aria-label="QR code placeholder for your account">
            <Icon name="qr" size={130} style={{ color: 'var(--vera-navy)' }} />
          </div>
          <small className="muted">Scan to pay this VERA account (demo QR)</small>
        </div>

        <div className="list-card" style={{ marginTop: 16 }}>
          <div className="review-row"><span className="k">Bank Name</span><span className="v">{account.bankName}</span></div>
          <div className="review-row"><span className="k">Account Holder</span><span className="v">{account.accountHolder}</span></div>
          <button className="review-row" style={{ width: '100%', background: 'none', border: 0, borderBottom: 0, cursor: 'pointer' }} onClick={() => copy(account.accountNumber, 'Account number')}>
            <span className="k">Account Number</span>
            <span className="v" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--vera-blue)' }}>{account.accountNumber} <Icon name="copy" size={16} /></span>
          </button>
        </div>

        <Button block size="lg" variant="green" style={{ marginTop: 18 }} onClick={share} iconLeft={<Icon name="share" size={18} />}>Share Details</Button>
      </div>
    </div>
  )
}
