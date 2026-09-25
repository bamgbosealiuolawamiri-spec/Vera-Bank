import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Logo from '../../components/Logo.jsx'
import { LoadingBlock } from '../../components/States.jsx'
import { bank } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { formatMoney } from '../../data/demoData.js'

export default function Cards() {
  const navigate = useNavigate()
  const toast = useToast()
  const [card, setCard] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { bank.getCard().then(setCard) }, [])

  const toggleFreeze = async () => {
    setBusy(true)
    const next = card.status === 'active' ? 'frozen' : 'active'
    try {
      const updated = await bank.setCardStatus(next)
      setCard(updated)
      toast.info(next === 'frozen' ? 'Card frozen' : 'Card unfrozen', next === 'frozen' ? 'Your card is now temporarily blocked.' : 'Your card is active again.')
    } finally { setBusy(false) }
  }

  if (!card) return <div className="app-pad"><LoadingBlock label="Loading your card\u2026" /></div>
  const frozen = card.status === 'frozen'
  const pct = (used, total) => Math.min(100, Math.round((used / total) * 100))

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/settings')}><Icon name="arrowLeft" size={20} /> My Cards</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <div className={'debit-card' + (frozen ? ' frozen' : '')}>
          <div className="spread" style={{ position: 'relative', zIndex: 1 }}>
            <span className="chip-el" />
            <Logo onDark />
          </div>
          <div className="num">{card.maskedNumber}</div>
          <div className="foot">
            <div><small>Card Holder</small>{card.holder}</div>
            <div style={{ textAlign: 'right' }}><small>Expires</small>{card.expiry}</div>
          </div>
        </div>
        {frozen && <div className="badge badge-red" style={{ marginTop: 12 }}><Icon name="snow" size={14} /> Card is frozen</div>}

        <div className="card card-pad" style={{ marginTop: 18 }}>
          <div className="card-hd"><h3>Card Details</h3><span className="badge badge-blue">{card.cardType}</span></div>
          <div className="review-row"><span className="k">Network</span><span className="v">{card.network}</span></div>
          <div className="review-row"><span className="k">Status</span><span className="v" style={{ color: frozen ? 'var(--error)' : 'var(--vera-green-dark)' }}>{frozen ? 'Frozen' : 'Active'}</span></div>
          <div className="review-row"><span className="k">Expiry</span><span className="v">{card.expiry}</span></div>
        </div>

        <button className="settings-row" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginTop: 16 }} onClick={toggleFreeze} disabled={busy}>
          <span className="si" style={{ color: frozen ? 'var(--vera-green-dark)' : 'var(--error)' }}><Icon name="snow" size={18} /></span>
          <span className="s-txt"><b>{frozen ? 'Unfreeze Card' : 'Freeze Card'}</b><small>{frozen ? 'Re-enable payments' : 'Temporarily block all payments'}</small></span>
          <span className={'toggle-sw' + (frozen ? '' : ' on')}><i /></span>
        </button>

        <div className="card card-pad" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 14 }}>Card Limits</h3>
          {[['Daily spending', card.limits.dailyUsed, card.limits.daily], ['Monthly spending', card.limits.monthlyUsed, card.limits.monthly]].map(([label, used, total]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div className="spread" style={{ fontSize: 13.5, marginBottom: 6 }}><span className="muted">{label}</span><b>{formatMoney(used)} / {formatMoney(total)}</b></div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-alt)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct(used, total) + '%', background: 'linear-gradient(90deg,var(--vera-blue),var(--vera-green))', borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
