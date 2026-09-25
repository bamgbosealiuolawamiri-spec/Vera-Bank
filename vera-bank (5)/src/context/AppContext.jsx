// Global app context: session/auth + toast notifications.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/store.js'
import { uid } from '../data/seed.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    let active = true
    api.me().then((u) => { if (active) { setUser(u); setBooting(false) } })
    return () => { active = false }
  }, [])

  const toast = useCallback((opts) => {
    const t = typeof opts === 'string' ? { message: opts } : opts
    const id = uid('toast')
    setToasts((cur) => [...cur, { id, tone: 'default', ...t }])
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), t.duration || 3800)
  }, [])
  const dismiss = useCallback((id) => setToasts((cur) => cur.filter((x) => x.id !== id)), [])

  const login = useCallback(async (email, password) => {
    const u = await api.login(email, password)
    setUser(u)
    return u
  }, [])
  const register = useCallback(async (payload) => {
    const u = await api.register(payload)
    setUser(u)
    return u
  }, [])
  const logout = useCallback(() => { api.logout(); setUser(null) }, [])
  const refreshUser = useCallback(async () => {
    const u = await api.me(); setUser(u); return u
  }, [])
  const patchUserBalance = useCallback((balance) => {
    setUser((u) => (u ? { ...u, balance } : u))
  }, [])

  const value = useMemo(() => ({
    user, booting, login, register, logout, refreshUser, patchUserBalance,
    toast, toasts, dismiss, api,
  }), [user, booting, login, register, logout, refreshUser, patchUserBalance, toast, toasts, dismiss])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
