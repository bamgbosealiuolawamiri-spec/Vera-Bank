import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Input, ErrorBanner, PhoneField } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_EMAIL, DEMO_PASSWORD, COUNTRIES } from '../data/seed.js'
import { countryByName, validatePhone } from '../data/phone.js'
import { HomeScreen, CardsScreen, ProfileScreen, SendFlow, BillsFlow, ReceiveScreen, TxnListScreen } from './mobileScreens.jsx'
import { AddMoneyFlow, BankTransferFlow, AirtimeFlow, DataFlow, GiftCardsFlow, RequestMoneyFlow, PayQRFlow, SavingsScreen, NotificationsScreen } from './mobileFlows.jsx'

function Frame({ children }) {
  return <div className="app-shell"><div className="app-frame">{children}</div></div>
}

function Welcome({ onStart, onSignin, onExit }) {
  return (
    <Frame>
      <div className="welcome">
        <div className="spread">
          <Logo onDark />
          <button className="back-btn" style={{ color: '#c8d5ef' }} onClick={onExit}>Exit</button>
        </div>
        <div className="hero-art">
          <div className="glass">
            <div style={{ color: '#cdd9f2', fontSize: 12 }}>Total balance</div>
            <div style={{ fontSize: 30, fontWeight: 800, margin: '4px 0 16px' }}>$12,480.55</div>
            <div className="quick-grid">
              {['send', 'download', 'receipt', 'card'].map((i) => (
                <div key={i} style={{ display: 'grid', placeItems: 'center', gap: 6, color: '#fff' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center' }}><Icon name={i} size={18} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h1>Banking made simple, secure and yours.</h1>
          <p>Everything you need to move, track and manage your money — in one app.</p>
          <Button block size="lg" variant="green" onClick={onStart}>Create free account</Button>
          <Button block size="lg" variant="outline" onClick={onSignin}
            style={{ marginTop: 12, background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>I already have an account</Button>
        </div>
      </div>
    </Frame>
  )
}

function MobileAuth({ mode, onBack, onSwitch }) {
  const isLogin = mode === 'login'
  const { login, register, toast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', country: 'Nigeria' })
  const selCountry = countryByName(form.country)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid email address.')
    if (form.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (!isLogin && !form.name.trim()) return setErr('Please enter your name.')
    let phoneE164 = ''
    if (!isLogin && String(form.phone).trim()) {
      const pr = validatePhone(selCountry, form.phone)
      if (!pr.ok) return setErr(pr.error)
      phoneE164 = pr.e164
    }
    setLoading(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register({ ...form, phone: phoneE164 })
      toast({ tone: 'success', message: isLogin ? 'Welcome back!' : 'Account created!' })
    } catch (e2) { setErr(e2.message) } finally { setLoading(false) }
  }

  return (
    <Frame>
      <div className="app-scroll">
        <div className="app-topbar"><button className="back-btn" onClick={onBack}><Icon name="arrowLeft" size={20} /> Back</button></div>
        <div className="auth-mobile">
          <div className="brand-top"><Logo size="lg" /></div>
          <div className="screen-head" style={{ padding: '0 0 14px' }}>
            <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p>{isLogin ? 'Sign in to continue' : 'Start banking in minutes'}</p>
          </div>
          <ErrorBanner>{err}</ErrorBanner>
          <form onSubmit={submit} style={{ marginTop: err ? 14 : 6 }}>
            {!isLogin && <Input label="Full name" placeholder="Alex Morgan" value={form.name} onChange={set('name')} lead={<Icon name="user" size={18} />} />}
            {!isLogin && (
              <div className="field">
                <label htmlFor="m-country">Country</label>
                <div className="input-wrap">
                  <span className="lead"><Icon name="building" size={18} /></span>
                  <select id="m-country" className="input has-lead" value={form.country} onChange={set('country')}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.flag}\u00a0\u00a0{c.name} (+{c.dial})</option>)}
                  </select>
                </div>
              </div>
            )}
            {!isLogin && (
              <PhoneField label="Phone Number" country={selCountry} value={form.phone}
                placeholder="Enter phone number"
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                hint={selCountry ? `Dial code +${selCountry.dial} follows your selected country` : undefined} />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} lead={<Icon name="user" size={18} />} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} lead={<Icon name="lock" size={18} />} />
            {isLogin && (
              <div className="auth-links">
                <button type="button" className="btn-ghost" style={{ padding: 0 }}
                  onClick={() => setForm((f) => ({ ...f, email: DEMO_EMAIL, password: DEMO_PASSWORD }))}>Use demo login</button>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue">Forgot?</a>
              </div>
            )}
            <Button type="submit" block size="lg" loading={loading} style={{ marginTop: 16 }}>{isLogin ? 'Sign in' : 'Create account'}</Button>
          </form>
          <p className="auth-foot">
            {isLogin ? "New to VERA? " : 'Have an account? '}
            <button className="btn-ghost text-blue" style={{ padding: 0, fontWeight: 600 }} onClick={onSwitch}>{isLogin ? 'Create account' : 'Sign in'}</button>
          </p>
        </div>
      </div>
    </Frame>
  )
}

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'txns', label: 'Activity', icon: 'receipt' },
  { id: 'cards', label: 'Cards', icon: 'card' },
  { id: 'profile', label: 'Profile', icon: 'user' },
]

export default function MobileApp() {
  const { user, booting } = useApp()
  const nav = useNavigate()
  const [gate, setGate] = useState('welcome') // welcome | login | signup
  const [tab, setTab] = useState('home')
  const [flow, setFlow] = useState(null) // send | bills | receive
  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((k) => k + 1)

  if (booting) return <Frame><div className="splash"><Logo onDark size="lg" /><div className="loader"><i /></div></div></Frame>

  if (!user) {
    if (gate === 'welcome') return <Welcome onStart={() => setGate('signup')} onSignin={() => setGate('login')} onExit={() => nav('/')} />
    return <MobileAuth mode={gate} onBack={() => setGate('welcome')} onSwitch={() => setGate(gate === 'login' ? 'signup' : 'login')} />
  }

  const closeFlow = () => { setFlow(null); bump() }
  if (flow === 'send') return <Frame><SendFlow onClose={closeFlow} /></Frame>
  if (flow === 'bills') return <Frame><BillsFlow onClose={closeFlow} /></Frame>
  if (flow === 'receive') return <Frame><ReceiveScreen onClose={closeFlow} /></Frame>
  if (flow === 'add') return <Frame><AddMoneyFlow onClose={closeFlow} /></Frame>
  if (flow === 'bankTransfer') return <Frame><BankTransferFlow onClose={closeFlow} /></Frame>
  if (flow === 'airtime') return <Frame><AirtimeFlow onClose={closeFlow} /></Frame>
  if (flow === 'data') return <Frame><DataFlow onClose={closeFlow} /></Frame>
  if (flow === 'giftcards') return <Frame><GiftCardsFlow onClose={closeFlow} /></Frame>
  if (flow === 'request') return <Frame><RequestMoneyFlow onClose={closeFlow} /></Frame>
  if (flow === 'payqr') return <Frame><PayQRFlow onClose={closeFlow} /></Frame>
  if (flow === 'savings') return <Frame><SavingsScreen onClose={closeFlow} /></Frame>
  if (flow === 'notifications') return <Frame><NotificationsScreen onClose={closeFlow} /></Frame>

  return (
    <Frame>
      <div className="app-scroll app-pad-b">
        {tab === 'home' && <HomeScreen refreshKey={refreshKey} onFlow={setFlow} onSeeAll={() => setTab('txns')} onExit={() => nav('/')} />}
        {tab === 'txns' && <TxnListScreen refreshKey={refreshKey} />}
        {tab === 'cards' && <CardsScreen />}
        {tab === 'profile' && <ProfileScreen onExit={() => nav('/')} onFlow={setFlow} />}
      </div>
      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button key={t.id} className={`bn-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={22} />{t.label}
          </button>
        ))}
      </nav>
    </Frame>
  )
}
