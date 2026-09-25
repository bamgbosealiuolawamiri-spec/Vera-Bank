import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#app', label: 'Mobile App' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useApp()
  const nav = useNavigate()

  return (
    <header className="navbar">
      <div className="container inner">
        <Link to="/" aria-label="VERA Bank home"><Logo /></Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="nav-cta">
          {user ? (
            <Button size="sm" onClick={() => nav('/dashboard')}>Go to dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" className="desktop-only" onClick={() => nav('/login')}>Sign in</Button>
              <Button size="sm" onClick={() => nav('/signup')}>Get started</Button>
            </>
          )}
          <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open}
            onClick={() => setOpen((o) => !o)}><Icon name={open ? 'x' : 'menu'} /></button>
        </div>
      </div>
      <div className={`nav-mobile ${open ? 'open' : ''}`}>
        {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        <div className="m-cta">
          {user ? (
            <Button block onClick={() => nav('/dashboard')}>Go to dashboard</Button>
          ) : (
            <>
              <Button variant="outline" block onClick={() => nav('/login')}>Sign in</Button>
              <Button block onClick={() => nav('/signup')}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
