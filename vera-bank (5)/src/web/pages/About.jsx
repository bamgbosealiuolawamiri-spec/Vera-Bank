import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'

const VALUES = [
  { icon: 'bolt', title: 'Simple', desc: 'We remove friction so banking feels effortless.' },
  { icon: 'shield', title: 'Trustworthy', desc: 'Clear, honest design with your control at the centre.' },
  { icon: 'star', title: 'Premium', desc: 'A refined experience that feels good to use every day.' },
  { icon: 'users', title: 'Friendly', desc: 'Human, approachable and built for real people.' },
]

export default function About() {
  const navigate = useNavigate()
  return (
    <>
      <section className="hero" style={{ padding: '64px 0 72px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><Icon name="building" size={14} /> About VERA</span>
          <h1 style={{ fontSize: 44 }}>Banking Made Simple</h1>
          <p style={{ margin: '0 auto' }}>VERA is a modern banking product concept built to show what a clean, trustworthy and friendly money experience can look like.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div>
            <h2>Our purpose</h2>
            <p>VERA Bank exists to make everyday money management calm and clear. We believe banking should be fast, understandable and respectful of your time \u2014 whether you\u2019re sending money to family, paying a bill or checking your balance.</p>
            <p>This product brings together a mobile-first app and a responsive website that share one design system and one consistent experience, so VERA feels the same wherever you use it.</p>
          </div>
          <div className="card card-pad" style={{ background: 'linear-gradient(135deg,var(--vera-navy),#12233f)', color: '#fff' }}>
            <h3 style={{ marginBottom: 12 }}>A note on this product</h3>
            <p style={{ color: '#c8d5ef', lineHeight: 1.65, fontSize: 15 }}>
              VERA Bank is fictional \u2014 a design and engineering prototype. It is not a licensed bank, it holds no
              real money, and it makes no regulatory or deposit-insurance claims. Everything you see uses demo data
              and is intended to demonstrate product design, not to provide financial services.
            </p>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <div className="section-hd"><span className="kick">What we stand for</span><h2>Our values</h2></div>
          <div className="feat-grid">
            {VALUES.map((v) => (
              <div className="feat" key={v.title}>
                <span className="fi qi-green"><Icon name={v.icon} size={26} /></span>
                <h3>{v.title}</h3><p>{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 34 }}>
            <Button size="lg" onClick={() => navigate('/signup')}>Join VERA</Button>
          </div>
        </div>
      </section>
    </>
  )
}
