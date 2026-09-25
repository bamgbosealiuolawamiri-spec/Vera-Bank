import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Toasts from '../components/Toasts.jsx'
import Website from '../web/Website.jsx'
import AuthPage from '../web/AuthPage.jsx'
import Dashboard from '../web/Dashboard.jsx'
import MobileApp from '../app/MobileApp.jsx'
import Landing from '../web/pages/Landing.jsx'
import Features from '../web/pages/Features.jsx'
import Security from '../web/pages/Security.jsx'
import About from '../web/pages/About.jsx'
import Help from '../web/pages/Help.jsx'

function Protected({ children }) {
  const { user, booting } = useApp()
  const loc = useLocation()
  if (booting) return <BootScreen />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return children
}

function BootScreen() {
  return (
    <div className="splash">
      <div className="vera-logo lg on-dark"><span className="mark"><svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5l8 15 8-15" /></svg></span>
        <span className="name" style={{ color: '#fff' }}>VERA<b style={{ color: '#4d8bff' }}>.</b></span></div>
      <div className="loader"><i /></div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Toasts />
      <Routes>
        <Route path="/" element={<Website />}>
          <Route index element={<Landing />} />
          <Route path="features" element={<Features />} />
          <Route path="security" element={<Security />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
        </Route>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/app" element={<MobileApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
