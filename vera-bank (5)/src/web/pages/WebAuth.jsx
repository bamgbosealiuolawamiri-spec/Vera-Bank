import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Icon from '../../components/Icon.jsx'
import { ErrorBanner } from '../../components/States.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function Aside({ title, points }) {
  return (
    <div className="auth-aside">
      <Link to="/"><Logo onDark /></Link>
      <div>
        <h2>{title}</h2>
        <p>Banking Made Simple \u2014 send, receive and manage money with a clean, secure experience across all your devices.</p>
        <ul className="points" style={{ marginTop: 22 }}>
          {points.map((p) => (<li key={p}><span className="ck"><Icon name="check" size={16} /></span>{p}</li>))}
        </ul>
      </div>
      <small style={{ color: '#9fb2d6' }}>Fictional prototype \u00b7 demo data only</small>
    </div>
  )
}

export function WebLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(form); navigate('/dashboard', { replace: true }) }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="auth-page">
      <Aside title="Welcome back to VERA" points={['Real-time balance &amp; transactions', 'Instant transfers and bill payments', 'Bank-grade security controls'].map((t) => t.replace('&amp;', '&'))} />
      <div className="auth-main">
        <div className="auth-box">
          <div className="head">
            <Link to="/" className="row" style={{ display: 'inline-flex' }}><Logo /></Link>
            <h1>Log in</h1>
            <p>Access your VERA banking dashboard.</p>
          </div>
          <form onSubmit={submit}>
            <ErrorBanner>{err}</ErrorBanner>
            <Input label="Phone Number or Email" icon="user" placeholder="you@example.com" autoComplete="username"
              value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
            <Input label="Password" type="password" icon="lock" placeholder="Enter your password" autoComplete="current-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="Demo: any email + any 4+ character password." />
            <div className="spread" style={{ marginBottom: 16 }}>
              <label className="row gap-2" style={{ alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}><input type="checkbox" /> Remember me</label>
              <Link to="/login" className="text-blue" style={{ fontWeight: 600, fontSize: 14 }} onClick={(e) => e.preventDefault()}>Forgot password?</Link>
            </div>
            <Button type="submit" block size="lg" loading={loading}>Log In</Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}>New to VERA? <Link to="/signup" className="text-blue" style={{ fontWeight: 600 }}>Create an account</Link></p>
        </div>
      </div>
    </div>
  )
}

export function WebSignup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (f.password !== f.confirm) return setErr('Passwords do not match.')
    setLoading(true)
    try { await signup(f); navigate('/dashboard', { replace: true }) }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="auth-page">
      <Aside title="Open your VERA account" points={['Free to create, minutes to set up', 'One experience on web and mobile', 'You stay in control of your money']} />
      <div className="auth-main">
        <div className="auth-box">
          <div className="head">
            <Link to="/" className="row" style={{ display: 'inline-flex' }}><Logo /></Link>
            <h1>Create account</h1>
            <p>Join VERA \u2014 Banking Made Simple.</p>
          </div>
          <form onSubmit={submit}>
            <ErrorBanner>{err}</ErrorBanner>
            <Input label="Full Name" icon="user" placeholder="Babajide Adesina" value={f.name} onChange={set('name')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Phone Number" icon="phone" placeholder="0813 000 0000" value={f.phone} onChange={set('phone')} />
              <Input label="Email" type="email" icon="mail" placeholder="you@example.com" value={f.email} onChange={set('email')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Password" type="password" icon="lock" placeholder="Create password" value={f.password} onChange={set('password')} />
              <Input label="Confirm Password" type="password" icon="lock" placeholder="Re-enter" value={f.confirm} onChange={set('confirm')} />
            </div>
            <Button type="submit" block size="lg" loading={loading}>Create Account</Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" className="text-blue" style={{ fontWeight: 600 }}>Log in</Link></p>
        </div>
      </div>
    </div>
  )
}
