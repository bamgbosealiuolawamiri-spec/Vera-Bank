import React from 'react'
import Icon from './Icon.jsx'
import { formatMoney, formatDate } from '../data/demoData.js'

// Single transaction row with credit/debit indicator. onClick shows details.
export default function TransactionItem({ txn, onClick }) {
  const credit = txn.type === 'credit'
  return (
    <button className="txn" onClick={onClick} style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default', textAlign: 'left' }}>
      <span className={'ti ' + (credit ? 'credit' : 'debit')} aria-hidden="true">
        <Icon name={credit ? 'receive' : 'send'} size={20} />
      </span>
      <span className="t-main">
        <b>{txn.party}</b>
        <small>{txn.description} \u00b7 {formatDate(txn.date)}</small>
      </span>
      <span className={'t-amt ' + (credit ? 'credit' : 'debit')}>
        {credit ? '+' : '\u2212'}{formatMoney(txn.amount).replace('\u20A6', '\u20A6')}
        <small>{txn.status === 'pending' ? 'Pending' : 'Completed'}</small>
      </span>
    </button>
  )
}
