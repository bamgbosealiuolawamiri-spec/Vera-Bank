import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'

const DETAIL = [
  { icon: 'send', tint: 'qi-blue', title: 'Send Money', points: ['Transfer to VERA and other banks', 'Saved recipients for one-tap sending', 'Clear review &amp; confirmation step', 'Instant success receipts with reference'] },
  { icon: 'receive', tint: 'qi-green', title: 'Receive Money', points: ['Share your account number or QR code', 'Get paid from any bank', 'Copy &amp; share details in one tap', 'See incoming credits in real time'] },
  { icon: 'bills', tint: 'qi-amber', title: 'Pay Bills', points: ['Electricity \u2014 prepaid &amp; postpaid', 'Cable TV \u2014 DSTV, GOtv, StarTimes', 'Internet data bundles', 'Government levies &amp; licences'] },
  { icon: 'history', tint: 'qi-navy', title: 'Transaction History', points: ['Search by name, note or reference', 'Filter money in vs money out', 'Detailed transaction breakdown', 'Pending &amp; completed indicators'] },
  { icon: 'card', tint: 'qi-blue', title: 'Cards', points: ['Premium VERA debit card', 'Freeze / unfreeze instantly', 'Daily &amp; monthly spend limits', 'Live usage tracking'] },
  { icon: 'shield', tint: 'qi-green', title: 'Account Management', points: ['Edit your profile details', 'Manage password &amp; PIN', 'Device &amp; session management', 'Notification preferences'] },
]

export default function Features() {
  const navigate = useNavigate()
  return (
    <>
      <section className="hero" style={{ padding: '64px 0 72px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><Icon name="star" size={14} /> Features</span>
          <h1 style={{ fontSize: 44 }}>Everything VERA can do</h1>
          <p style={{ margin: '0 auto' }}>A complete banking toolkit \u2014 thoughtfully designed and simple to use across every device.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="feat-grid">
            {DETAIL.map((f) => (
              <div className="feat" key={f.title}>
                <span className={'fi ' + f.tint}><Icon name={f.icon} size={26} /></span>
                <h3>{f.title}</h3>
                <ul className="check-list" style={{ marginTop: 8 }}>
                  {f.points.map((p) => (<li key={p} style={{ padding: '6px 0', fontSize: 14.5 }}><span className="ck" style={{ width: 22, height: 22 }}><Icon name="check" size={14} /></span><span dangerouslySetInnerHTML={{ __html: p }} /></li>))}
                </ul>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 40 }}>
            <Button variant="green" size="lg" onClick={() => navigate('/signup')} iconRight={<Icon name="arrowRight" size={18} />}>Get Started free</Button>
          </div>
        </div>
      </section>
    </>
  )
}
