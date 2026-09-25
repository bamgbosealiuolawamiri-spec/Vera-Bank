import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = auth.getSession()
    if (s) setUser(s.user)
    setReady(true)
  }, [])

  const login = useCallback(async (creds) => {
    const { user } = await auth.login(creds)
    setUser(user)
    return user
  }, [])

  const signup = useCallback(async (data) => {
    const { user } = await auth.signup(data)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, isAuthed: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
