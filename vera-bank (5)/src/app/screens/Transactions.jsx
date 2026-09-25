import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import TransactionItem from '../../components/TransactionItem.jsx'
import Modal from '../../components/Modal.jsx'
import { LoadingBlock, EmptyState } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { formatMoney, formatDate } from '../../data/demoData.js'

const FILTERS = [{ k: 'all', l: 'All' }, { k: 'credit', l: 'Money In' }, { k: 'debit', l: 'Money Out' }]

export default function Transactions() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [list, setList] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    setList(null)
    const t = setTimeout(() => bank.getTransactions({ search, type }).then(setList), 250)
    return () => clearTimeout(t)
  }, [search, type])

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/home')}><Icon name="arrowLeft" size={20} /> Transactions</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <div className="input-wrap" style={{ marginBottom: 14 }}>
          <span className="lead"><Icon name="search" size={19} /></span>
          <input className="input has-lead" placeholder="Search transactions" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="chip-row" style={{ marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button key={f.k} className="chip" onClick={() => setType(f.k)}
              style={type === f.k ? { background: 'var(--vera-blue)', color: '#fff', borderColor: 'var(--vera-blue)' } : {}}>{f.l}</button>
          ))}
        </div>
        <div className="list-card">
          {list === null ? <LoadingBlock height={140} />
            : list.length === 0 ? <EmptyState title="No results" message="Try a different search or filter." />
              : list.map((t) => <TransactionItem key={t.id} txn={t} onClick={() => setDetail(t)} />)}
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Transaction Details">
        {detail && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: detail.type === 'credit' ? 'var(--vera-green-dark)' : 'var(--text-primary)' }}>
                {detail.type === 'credit' ? '+' : '\u2212'}{formatMoney(detail.amount)}
              </div>
              <span className={'badge ' + (detail.status === 'pending' ? 'badge-gray' : 'badge-green')} style={{ marginTop: 8 }}>{detail.status}</span>
            </div>
            {[['Recipient / Sender', detail.party], ['Description', detail.description], ['Date', formatDate(detail.date, { dateStyle: 'medium', timeStyle: 'short' })], ['Reference', detail.reference], ['Type', detail.type === 'credit' ? 'Credit' : 'Debit']].map(([k, v]) => (
              <div className="review-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
