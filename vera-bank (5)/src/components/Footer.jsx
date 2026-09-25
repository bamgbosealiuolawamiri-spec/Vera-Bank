import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div className="fbrand">
            <Logo onDark />
            <p>Banking Made Simple. VERA is a modern, friendly way to send, receive and manage your money.</p>
          </div>
          <div>
            <h5>Product</h5>
            <Link to="/features">Features</Link>
            <Link to="/security">Security</Link>
            <Link to="/signup">Get Started</Link>
            <Link to="/login">Login</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link to="/about">About</Link>
            <Link to="/help">Help &amp; Support</Link>
            <Link to="/app">Open the App</Link>
          </div>
          <div>
            <h5>Legal</h5>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Cookies</a>
          </div>
        </div>
        <div className="disclaimer">
          VERA Bank is a fictional banking product built as a design/engineering prototype. It is not a
          licensed financial institution. Nothing here is licensed by any regulator or protected by any deposit
          insurance scheme, and no real accounts, cards, payments or customer data are involved. All figures are demo data.
        </div>
        <div className="bottom">
          <span>\u00a9 2026 VERA Bank (prototype). All rights reserved.</span>
          <span>Made with care \u00b7 Banking Made Simple</span>
        </div>
      </div>
    </footer>
  )
}
