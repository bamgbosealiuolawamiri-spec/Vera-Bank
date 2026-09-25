import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui.jsx'

const cols = [
  { h: 'Product', items: ['Personal', 'Business', 'Cards', 'Payments', 'Savings'] },
  { h: 'Company', items: ['About', 'Careers', 'Press', 'Blog'] },
  { h: 'Support', items: ['Help Center', 'Contact', 'Status', 'Security'] },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="disclaimer">
          VERA Bank is a fictional product built for demonstration purposes only. It is not a real
          financial institution, holds no deposits, and does not provide banking services. All names,
          balances and transactions shown are sample data.
        </div>
        <div className="cols">
          <div className="fbrand">
            <Logo onDark />
            <p>Banking made simple. Move money, track spending and manage your cards — all from one
              beautifully secure app.</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h5>{c.h}</h5>
              {c.items.map((i) => <a key={i} href="#" onClick={(e) => e.preventDefault()}>{i}</a>)}
            </div>
          ))}
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} VERA Bank (demo). All rights reserved.</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <Link to="/" onClick={(e) => e.preventDefault()}>Privacy</Link>
            <Link to="/" onClick={(e) => e.preventDefault()}>Terms</Link>
            <Link to="/" onClick={(e) => e.preventDefault()}>Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
