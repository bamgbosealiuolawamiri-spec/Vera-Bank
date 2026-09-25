import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button, Input, ErrorBanner, PhoneField } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_EMAIL, DEMO_PASSWORD, COUNTRIES } from '../data/seed.js'
import { countryByName, validatePhone } from '../data/phone.js'

const POINTS = ['No monthly fees, ever', 'Bank-grade security', 'Set up in minutes']

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const nav = useNavigate()
  const { login, register, toast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', country: 'Nigeria' })
  const selCountry = countryByName(form.country)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const er = {}
    if (!isLogin && !form.name.trim()) er.name = 'Please enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.'
    if (form.password.length < 6) er.password = 'Password must be at least 6 characters.'
    if (!isLogin && String(form.phone).trim()) {
      const pr = validatePhone(selCountry, form.phone)
      if (!pr.ok) er.phone = pr.error
    }
    setErrors(er)
    return Object.keys(er).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    setBanner('')
    if (!validate()) return
    setLoading(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else {
        const pr = String(form.phone).trim() ? validatePhone(selCountry, form.phone) : null
        await register({ ...form, phone: pr && pr.ok ? pr.e164 : '' })
      }
      toast({ tone: 'success', title: isLogin ? 'Welcome back' : 'Account created', message: 'Redirecting to your dashboard…' })
      nav('/dashboard')
    } catch (err) {
      setBanner(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function useDemo() {
    setForm((f) => ({ ...f, email: DEMO_EMAIL, password: DEMO_PASSWORD }))
    setErrors({})
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link to="/"><Logo onDark size="lg" /></Link>
        <div>
          <h2>{isLogin ? 'Welcome back to simpler banking.' : 'Join millions banking the simple way.'}</h2>
          <p>Move money, track spending and manage your cards from one secure app.</p>
          <ul className="points" style={{ marginTop: 22 }}>
            {POINTS.map((p) => (
              <li key={p}><span className="ck"><Icon name="check" size={16} /></span>{p}</li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: 13, opacity: .8 }}>Fictional demo product. No real accounts or money involved.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-box">
          <div className="head">
            <Link to="/" className="btn-ghost" style={{ display: 'inline-flex', gap: 6, padding: 0, marginBottom: 8 }}>
              <Icon name="arrowLeft" size={18} /> Back to home</Link>
            <h1>{isLogin ? 'Sign in' : 'Create your account'}</h1>
            <p>{isLogin ? 'Enter your details to access your account.' : 'It only takes a minute to get started.'}</p>
          </div>

          <ErrorBanner>{banner}</ErrorBanner>

          <form onSubmit={submit} noValidate style={{ marginTop: banner ? 16 : 0 }}>
            {!isLogin && (
              <Input label="Full name" name="name" placeholder="Alex Morgan" value={form.name}
                onChange={set('name')} error={errors.name} lead={<Icon name="user" size={18} />} />
            )}
            <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email}
              onChange={set('email')} error={errors.email} lead={<Icon name="user" size={18} />} />
            {!isLogin && (
              <div className="field">
                <label htmlFor="country">Country</label>
                <div className="input-wrap">
                  <span className="lead"><Icon name="building" size={18} /></span>
                  <select id="country" name="country" className="input has-lead" value={form.country} onChange={set('country')}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.flag}\u00a0\u00a0{c.name} (+{c.dial})</option>)}
                  </select>
                </div>
              </div>
            )}
            {!isLogin && (
              <PhoneField label="Phone Number" country={selCountry} value={form.phone}
                placeholder="Enter phone number"
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))} error={errors.phone}
                hint={selCountry ? `Dial code +${selCountry.dial} follows your selected country` : undefined} />
            )}
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={form.password}
              onChange={set('password')} error={errors.password}
              hint={isLogin ? undefined : 'At least 6 characters.'} lead={<Icon name="lock" size={18} />} />

            {isLogin && (
              <div className="auth-links">
                <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={useDemo}>Use demo account</button>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue">Forgot password?</a>
              </div>
            )}

            <Button type="submit" block size="lg" loading={loading} style={{ marginTop: 18 }}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="auth-foot">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} className="text-blue" style={{ fontWeight: 600 }}>
              {isLogin ? 'Sign up' : 'Sign in'}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
