import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'

const FEATURES = [
  { icon: 'send', tint: 'qi-blue', title: 'Send Money', desc: 'Transfer to any bank in seconds with saved recipients and zero-stress confirmations.' },
  { icon: 'receive', tint: 'qi-green', title: 'Receive Money', desc: 'Share your account or QR code and get paid instantly from anyone, anywhere.' },
  { icon: 'bills', tint: 'qi-amber', title: 'Pay Bills', desc: 'Electricity, cable TV, internet and government \u2014 all your bills in one place.' },
  { icon: 'history', tint: 'qi-navy', title: 'Transaction History', desc: 'Search, filter and review every transaction with clear credit and debit indicators.' },
  { icon: 'card', tint: 'qi-blue', title: 'Cards', desc: 'A premium debit card you can freeze, monitor and control right from the app.' },
  { icon: 'shield', tint: 'qi-green', title: 'Account Management', desc: 'Update your profile, manage security and stay in control of your money.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <>
      <section className="hero">
        <div className="container grid">
          <div>
            <span className="eyebrow"><Icon name="bolt" size={14} /> Banking Made Simple</span>
            <h1>Money that just <span className="accent">works for you</span>.</h1>
            <p>VERA is a modern, trustworthy way to send, receive and manage your money \u2014 with a clean app, a premium card and bank-grade security. Simple by design.</p>
            <div className="btns">
              <Button variant="green" size="lg" onClick={() => navigate('/signup')} iconRight={<Icon name="arrowRight" size={18} />}>Get Started</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,.06)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Login</Button>
            </div>
            <div className="trust">
              <div className="t"><b>Instant</b><small>Transfers &amp; payments</small></div>
              <div className="t"><b>256-bit</b><small>Encryption in transit</small></div>
              <div className="t"><b>24/7</b><small>Support &amp; monitoring</small></div>
            </div>
          </div>
          <div className="hero-phone">
            <div className="phone-mock">
              <div className="pm-top">
                <div className="pm-bal">Available Balance</div>
                <div className="pm-amt">\u20A6145,250.00</div>
              </div>
              <div className="pm-body">
                <div className="pm-quick">
                  {[['send', 'Send'], ['receive', 'Receive'], ['bills', 'Bills'], ['card', 'Cards']].map(([i, l]) => (
                    <div className="pm-q" key={l}><i><Icon name={i} size={18} /></i>{l}</div>
                  ))}
                </div>
                <div className="pm-txn"><i><Icon name="receive" size={16} /></i><div style={{ flex: 1 }}><b>Salary \u2014 Zenith Corp</b><br /><small>Today</small></div><b style={{ color: 'var(--vera-green-dark)', fontSize: 12 }}>+\u20A660,000</b></div>
                <div className="pm-txn"><i style={{ background: 'var(--error-soft)', color: 'var(--error)' }}><Icon name="send" size={16} /></i><div style={{ flex: 1 }}><b>Ikeja Electric</b><br /><small>Yesterday</small></div><b style={{ fontSize: 12 }}>\u2212\u20A612,500</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-hd">
            <span className="kick">Everything you need</span>
            <h2>One app for all your money</h2>
            <p>From sending money to paying bills and managing your card \u2014 VERA brings it all together in a clean, friendly experience.</p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div className="feat" key={f.title}>
                <span className={'fi ' + f.tint}><Icon name={f.icon} size={26} /></span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 34 }}>
            <Button variant="outline" onClick={() => navigate('/features')} iconRight={<Icon name="arrowRight" size={18} />}>Explore all features</Button>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <div>
            <span className="kick text-blue" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase' }}>Mobile app</span>
            <h2>Your bank, in your pocket</h2>
            <p>The VERA app is designed mobile-first, so everything is a tap away \u2014 check your balance, send money, pay a bill or freeze your card in seconds.</p>
            <ul className="check-list">
              {['Clean dashboard with real-time balance', 'Send &amp; receive with saved recipients and QR', 'Freeze your card instantly if it goes missing', 'Biometric login and login alerts'].map((t) => (
                <li key={t}><span className="ck"><Icon name="check" size={16} /></span><span dangerouslySetInnerHTML={{ __html: t }} /></li>
              ))}
            </ul>
            <div style={{ marginTop: 22 }}>
              <Button onClick={() => navigate('/app')} iconRight={<Icon name="arrowRight" size={18} />}>Open the app preview</Button>
            </div>
          </div>
          <div className="center">
            <div className="phone-mock" style={{ transform: 'rotate(2deg)' }}>
              <div className="pm-top"><div className="pm-bal">Good morning, Babajide</div><div className="pm-amt">\u20A6145,250.00</div></div>
              <div className="pm-body">
                <div className="pm-quick">{[['send', 'Send'], ['receive', 'Receive'], ['bills', 'Bills'], ['settings', 'More']].map(([i, l]) => (<div className="pm-q" key={l}><i><Icon name={i} size={18} /></i>{l}</div>))}</div>
                <div className="pm-txn"><i><Icon name="receive" size={16} /></i><div style={{ flex: 1 }}><b>Freelance \u2014 Payoneer</b><br /><small>Design project</small></div><b style={{ color: 'var(--vera-green-dark)', fontSize: 12 }}>+\u20A642,000</b></div>
                <div className="pm-txn"><i style={{ background: 'var(--error-soft)', color: 'var(--error)' }}><Icon name="send" size={16} /></i><div style={{ flex: 1 }}><b>Aisha Bello</b><br /><small>Rent</small></div><b style={{ fontSize: 12 }}>\u2212\u20A615,000</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-strip">
            <span className="kick" style={{ color: '#7fb0ff', fontWeight: 700, fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase' }}>Security first</span>
            <h2 style={{ fontSize: 32, margin: '10px 0 8px' }}>Built to keep your money safe</h2>
            <p style={{ color: '#c8d5ef', maxWidth: 560 }}>Security is designed into VERA at every layer \u2014 from encryption to real-time monitoring and instant controls you own.</p>
            <div className="sec-grid">
              {[['lock', 'Encryption in transit', 'Your data is protected with strong encryption every time it moves.'], ['shield', 'Real-time monitoring', 'Unusual activity is flagged and you get instant alerts.'], ['card', 'Instant card controls', 'Freeze or unfreeze your card the moment you need to.']].map(([i, t, d]) => (
                <div className="sec-item" key={t}><span className="si2"><Icon name={i} size={22} /></span><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>
            <div style={{ marginTop: 26 }}><Link to="/security"><Button variant="outline" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }} iconRight={<Icon name="arrowRight" size={18} />}>How we protect you</Button></Link></div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="cta-band">
            <h2>Ready to bank the simple way?</h2>
            <p>Create your free VERA account in minutes. No paperwork, no stress.</p>
            <div className="btns">
              <Button variant="green" size="lg" onClick={() => navigate('/signup')}>Get Started</Button>
              <Button variant="outline" size="lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }} onClick={() => navigate('/login')}>I already have an account</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
