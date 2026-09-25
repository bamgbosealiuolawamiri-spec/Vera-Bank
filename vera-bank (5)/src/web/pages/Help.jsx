import React, { useState } from 'react'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Icon from '../../components/Icon.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const FAQ = [
  { q: 'Is VERA Bank a real bank?', a: 'No. VERA Bank is a fictional product built as a design and engineering prototype. It is not a licensed financial institution and uses demo data only.' },
  { q: 'How do I create an account?', a: 'Click Get Started, enter your name, phone, email and a password, and you\u2019ll be taken straight to your dashboard. No real verification is performed in this demo.' },
  { q: 'How do I send money?', a: 'Open Send, choose or type a recipient, enter an amount and a note, review the details, then confirm. You\u2019ll get an instant demo receipt with a reference number.' },
  { q: 'Can I pay bills with VERA?', a: 'Yes. The Pay Bills section supports Electricity, Cable TV, Internet and Government categories with demo providers.' },
  { q: 'What can I do with my card?', a: 'You can view your premium debit card, freeze or unfreeze it instantly, and track your daily and monthly spending limits.' },
  { q: 'Is my money safe?', a: 'This is a prototype with no real money. The app demonstrates security good practices such as alerts, PIN, biometric login and device management at a general product level.' },
]

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={onToggle} aria-expanded={open}>
        {item.q}<Icon name={open ? 'chevronDown' : 'chevron'} size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      </button>
      {open && <div className="faq-a">{item.a}</div>}
    </div>
  )
}

export default function Help() {
  const toast = useToast()
  const [open, setOpen] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = (e) => { e.preventDefault(); toast.success('Message sent', 'Thanks! Our team will get back to you (demo).'); setForm({ name: '', email: '', message: '' }) }
  return (
    <>
      <section className="hero" style={{ padding: '64px 0 72px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><Icon name="help" size={14} /> Help &amp; Support</span>
          <h1 style={{ fontSize: 44 }}>How can we help?</h1>
          <p style={{ margin: '0 auto' }}>Find quick answers below, or reach out and our team will get back to you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split" style={{ alignItems: 'start' }}>
          <div>
            <h2 style={{ marginBottom: 20 }}>Frequently asked questions</h2>
            {FAQ.map((item, i) => (<FaqItem key={i} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />))}
          </div>
          <div className="card card-pad">
            <h3 style={{ marginBottom: 6 }}>Contact support</h3>
            <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>We\u2019re here 24/7. Send us a message (demo form).</p>
            <form onSubmit={submit}>
              <Input label="Your Name" icon="user" placeholder="Full name" value={form.name} onChange={set('name')} required />
              <Input label="Email" type="email" icon="mail" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              <div className="field">
                <label htmlFor="msg">Message</label>
                <textarea id="msg" className="input" rows={4} placeholder="How can we help?" value={form.message} onChange={set('message')} required />
              </div>
              <Button type="submit" block size="lg">Send Message</Button>
            </form>
            <div className="stack gap-2" style={{ marginTop: 18 }}>
              <div className="row gap-2" style={{ alignItems: 'center', color: 'var(--text-secondary)', fontSize: 14 }}><Icon name="mail" size={18} /> support@verabank.example</div>
              <div className="row gap-2" style={{ alignItems: 'center', color: 'var(--text-secondary)', fontSize: 14 }}><Icon name="phone" size={18} /> 0800-VERA-HELP (demo)</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
