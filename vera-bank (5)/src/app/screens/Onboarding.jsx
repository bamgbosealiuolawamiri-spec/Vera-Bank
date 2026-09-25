import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export function Splash() {
  const navigate = useNavigate()
  const { isAuthed } = useAuth()
  useEffect(() => {
    const t = setTimeout(() => navigate(isAuthed ? '/app/home' : '/app/welcome', { replace: true }), 2100)
    return () => clearTimeout(t)
  }, [navigate, isAuthed])
  return (
    <div className="splash">
      <div className="fade-in" style={{ transform: 'scale(1.2)' }}><Logo onDark size="lg" /></div>
      <p className="tag fade-in">Banking Made Simple</p>
      <div className="loader"><i /></div>
    </div>
  )
}

export function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="welcome">
      <div style={{ display: 'flex', justifyContent: 'center' }}><Logo onDark /></div>
      <div className="hero-art">
        <div className="glass fade-in">
          <div style={{ color: '#cdd9f2', fontSize: 12 }}>Available Balance</div>
          <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 14px' }}>\u20A6145,250.00</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {['send', 'receive', 'bills'].map((i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 12, padding: 12, display: 'grid', placeItems: 'center' }}>
                <Icon name={i} size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h1>Welcome to VERA Bank</h1>
        <p>Send, receive and manage your money with a bank that keeps things simple, secure and friendly.</p>
        <div className="stack gap-3">
          <Button variant="primary" block size="lg" onClick={() => navigate('/app/login')}>Log In</Button>
          <Button variant="outline" block size="lg" onClick={() => navigate('/app/signup')} style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Create an Account</Button>
          <button className="btn btn-ghost" style={{ color: '#c8d5ef', margin: '4px auto 0' }} onClick={() => navigate('/app/home')}>Skip for now</button>
        </div>
      </div>
    </div>
  )
}
