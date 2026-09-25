import React, { useState } from 'react'
import Icon from './Icon.jsx'
import { formatMoney } from '../data/demoData.js'

// Gradient balance card used on mobile dashboard & receive screen.
// `size='lg'` renders the wider desktop variant.
export default function BalanceCard({ account, size = 'md' }) {
  const [hidden, setHidden] = useState(false)
  if (!account) return null
  const shown = hidden ? '\u20A6 \u2022\u2022\u2022\u2022\u2022\u2022\u2022' : formatMoney(account.balance, account.currency)
  if (size === 'lg') {
    return (
      <div className="big-balance">
        <div className="spread">
          <span className="label" style={{ color: '#cdd9f2', fontSize: 13 }}>Available Balance</span>
          <button className="eye-btn" onClick={() => setHidden((h) => !h)} aria-label={hidden ? 'Show balance' : 'Hide balance'}>
            <Icon name={hidden ? 'eyeOff' : 'eye'} size={18} />
          </button>
        </div>
        <div className="amt">{shown}</div>
        <div className="meta">
          <div><small>Account Holder</small><b>{account.accountHolder}</b></div>
          <div><small>Account Number</small><b>{account.accountNumber}</b></div>
          <div><small>Account Type</small><b>{account.accountType}</b></div>
        </div>
      </div>
    )
  }
  return (
    <div className="balance-card">
      <div className="spread">
        <span className="label"><Icon name="card" size={16} /> Available Balance</span>
        <button className="eye-btn" onClick={() => setHidden((h) => !h)} aria-label={hidden ? 'Show balance' : 'Hide balance'}>
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
        </button>
      </div>
      <div className="amount">{shown}</div>
      <div className="acct">
        <div><small>Account Number</small><b>{account.accountNumber}</b></div>
        <div style={{ textAlign: 'right' }}><small>Account Holder</small><b>{account.accountHolder}</b></div>
      </div>
    </div>
  )
}
