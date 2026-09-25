import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'

const ITEMS = [
  { icon: 'lock', title: 'Encryption in transit', desc: 'Sensitive information is protected with strong encryption whenever it travels between your device and VERA.' },
  { icon: 'shield', title: 'Real-time monitoring', desc: 'Our systems watch for unusual patterns and can flag suspicious activity so you can act quickly.' },
  { icon: 'bell', title: 'Login &amp; transaction alerts', desc: 'Get notified about new sign-ins and account activity, so nothing happens without your knowledge.' },
  { icon: 'card', title: 'Instant card controls', desc: 'Freeze or unfreeze your card in a single tap, and set daily and monthly spending limits.' },
  { icon: 'device', title: 'Device &amp; session management', desc: 'See where you\u2019re logged in and sign out of any device you don\u2019t recognise.' },
  { icon: 'user', title: 'PIN &amp; biometric access', desc: 'Protect your app with a transaction PIN and optional face or fingerprint unlock.' },
]

export default function Security() {
  const navigate = useNavigate()
  return (
    <>
      <section className="hero" style={{ padding: '64px 0 72px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><Icon name="shield" size={14} /> Security</span>
          <h1 style={{ fontSize: 44 }}>Security you can feel good about</h1>
          <p style={{ margin: '0 auto' }}>We build protection into VERA at every layer and give you the controls to stay in charge of your money.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="feat-grid">
            {ITEMS.map((i) => (
              <div className="feat" key={i.title}>
                <span className="fi qi-blue"><Icon name={i.icon} size={26} /></span>
                <h3 dangerouslySetInnerHTML={{ __html: i.title }} />
                <p dangerouslySetInnerHTML={{ __html: i.desc }} />
              </div>
            ))}
          </div>
          <div className="card card-pad" style={{ marginTop: 34, background: 'var(--surface-alt)', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--vera-blue)' }}><Icon name="help" size={22} /></span>
              <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
                VERA Bank is a fictional prototype created for design and engineering demonstration. It is not a
                licensed financial institution, and we make no regulatory, licensing or deposit-insurance claims.
                The security features described here illustrate good product practices at a general level.
              </p>
            </div>
          </div>
          <div className="center" style={{ marginTop: 34 }}>
            <Button size="lg" onClick={() => navigate('/signup')} iconRight={<Icon name="arrowRight" size={18} />}>Create your account</Button>
          </div>
        </div>
      </section>
    </>
  )
}
