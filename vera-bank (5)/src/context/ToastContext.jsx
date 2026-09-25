import React, { createContext, useContext, useState, useCallback } from 'react'
import Icon from '../components/Icon.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind: 'info', ...toast }])
    setTimeout(() => remove(id), toast.duration || 3800)
  }, [remove])

  const api = {
    notify: push,
    success: (title, message) => push({ kind: 'success', title, message }),
    error: (title, message) => push({ kind: 'error', title, message }),
    info: (title, message) => push({ kind: 'info', title, message }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            <span style={{ color: t.kind === 'success' ? 'var(--vera-green)' : t.kind === 'error' ? 'var(--error)' : 'var(--vera-blue)' }}>
              <Icon name={t.kind === 'error' ? 'x' : t.kind === 'success' ? 'checkCircle' : 'bell'} size={20} />
            </span>
            <div className="t-body">
              <div className="t-title">{t.title}</div>
              {t.message && <div className="t-msg">{t.message}</div>}
            </div>
            <button className="x" onClick={() => remove(t.id)} aria-label="Dismiss" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
