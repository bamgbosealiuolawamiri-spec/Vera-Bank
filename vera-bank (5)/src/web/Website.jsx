import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Marketing website shell: sticky navbar + routed page + footer.
export default function Website() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="site">
      <Navbar />
      <main className="grow"><Outlet /></main>
      <Footer />
    </div>
  )
}
