import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Icon from '../../components/Icon.jsx'
import { ErrorBanner } from '../../components/States.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { auth } from '../../services/api.js'

function TopBack({ to }) {
  const navigate = useNavigate()
  return <button className="back-btn" onClick={() => navigate(to)}><Icon name="arrowLeft" size={20} /> Back</button>
}

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(form); navigate('/app/home', { replace: true }) }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="auth-mobile">
      <div className="app-topbar" style={{ padding: '14px 0' }}><TopBack to="/app/welcome" /></div>
      <div className="brand-top"><Logo /></div>
      <div className="screen-head" style={{ padding: '0 0 14px' }}><h1>Welcome back</h1><p>Log in to continue banking with VERA.</p></div>
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <Input label="Phone Number or Email" icon="user" placeholder="you@example.com" autoComplete="username"
          value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
        <Input label="Password" type="password" icon="lock" placeholder="Enter your password" autoComplete="current-password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="auth-links" style={{ justifyContent: 'flex-end', marginBottom: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/app/forgot')}>Forgot Password?</button>
        </div>
        <Button type="submit" block size="lg" loading={loading}>Log In</Button>
      </form>
      <div className="auth-foot">New to VERA? <button className="btn btn-ghost" onClick={() => navigate('/app/signup')}>Create Account</button></div>
    </div>
  )
}

export function ForgotPassword() {
  const navigate = useNavigate()
  const [identifier, setId] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await auth.forgotPassword({ identifier }); setSent(true) }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="auth-mobile">
      <div className="app-topbar" style={{ padding: '14px 0' }}><TopBack to="/app/login" /></div>
      <div className="screen-head" style={{ padding: '8px 0 14px' }}><h1>Reset password</h1><p>We\u2019ll send you a reset link. This is a demo \u2014 no real message is sent.</p></div>
      {sent ? (
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--vera-green)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icon name="checkCircle" size={40} /></div>
          <b>Check your inbox</b>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>If {identifier} matches an account, a reset link is on its way.</p>
          <Button block style={{ marginTop: 16 }} onClick={() => navigate('/app/login')}>Back to Login</Button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <ErrorBanner>{err}</ErrorBanner>
          <Input label="Phone Number or Email" icon="mail" placeholder="you@example.com"
            value={identifier} onChange={(e) => setId(e.target.value)} />
          <Button type="submit" block size="lg" loading={loading}>Continue</Button>
          <div className="auth-foot"><button className="btn btn-ghost" onClick={() => navigate('/app/login')}>Back to Login</button></div>
        </form>
      )}
    </div>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (f.password !== f.confirm) { setErr('Passwords do not match.'); return }
    setLoading(true)
    try { await signup(f); navigate('/app/success', { replace: true }) }
    catch (ex) { setErr(ex.message) } finally { setLoading(false) }
  }
  return (
    <div className="auth-mobile">
      <div className="app-topbar" style={{ padding: '14px 0' }}><TopBack to="/app/welcome" /></div>
      <div className="screen-head" style={{ padding: '8px 0 14px' }}><h1>Create your account</h1><p>Open a VERA account in a couple of minutes.</p></div>
      <form onSubmit={submit}>
        <ErrorBanner>{err}</ErrorBanner>
        <Input label="Full Name" icon="user" placeholder="Babajide Adesina" value={f.name} onChange={set('name')} />
        <Input label="Phone Number" icon="phone" placeholder="0813 000 0000" value={f.phone} onChange={set('phone')} />
        <Input label="Email" type="email" icon="mail" placeholder="you@example.com" value={f.email} onChange={set('email')} />
        <Input label="Password" type="password" icon="lock" placeholder="Create a password" value={f.password} onChange={set('password')} hint="Use at least 4 characters (demo)." />
        <Input label="Confirm Password" type="password" icon="lock" placeholder="Re-enter password" value={f.confirm} onChange={set('confirm')} />
        <Button type="submit" block size="lg" loading={loading}>Continue</Button>
      </form>
      <div className="auth-foot">Already have an account? <button className="btn btn-ghost" onClick={() => navigate('/app/login')}>Log In</button></div>
    </div>
  )
}

export function AccountCreated() {
  const navigate = useNavigate()
  return (
    <div className="success-screen">
      <div className="ring"><Icon name="checkCircle" size={54} /></div>
      <h2>Account Created</h2>
      <p>Welcome to VERA Bank. Your demo account is ready \u2014 let\u2019s get you to your dashboard.</p>
      <Button size="lg" style={{ marginTop: 18, minWidth: 240 }} onClick={() => navigate('/app/home', { replace: true })}>Continue to Dashboard</Button>
    </div>
  )
}
