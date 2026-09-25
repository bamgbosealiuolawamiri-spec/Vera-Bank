import React, { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import Button from './Button.jsx'
import Icon from './Icon.jsx'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <header className="navbar">
      <div className="container inner">
        <Link to="/" aria-label="VERA Bank home"><Logo /></Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="nav-cta">
          <span className="desktop-only"><Button variant="ghost" onClick={() => navigate('/login')}>Login</Button></span>
          <span className="desktop-only"><Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Get Started</Button></span>
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <div className={'nav-mobile' + (open ? ' open' : '')}>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>{l.label}</NavLink>
        ))}
        <div className="m-cta">
          <Button variant="outline" block onClick={() => { setOpen(false); navigate('/login') }}>Login</Button>
          <Button variant="primary" block onClick={() => { setOpen(false); navigate('/signup') }}>Get Started</Button>
        </div>
      </div>
    </header>
  )
}
