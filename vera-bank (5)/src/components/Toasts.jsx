// Global toast host, rendered once near the app root.
import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import Icon from './Icon.jsx'

const iconFor = { success: 'check', error: 'alert', default: 'info' }

export default function Toasts() {
  const { toasts, dismiss } = useApp()
  if (!toasts.length) return null
  return (
    <div className="toast-wrap" role="region" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone || 'default'}`}>
          <Icon name={iconFor[t.tone] || 'info'} size={18}
            style={{ color: t.tone === 'error' ? 'var(--error)' : t.tone === 'success' ? 'var(--vera-green)' : 'var(--vera-blue)' }} />
          <div className="t-body">
            {t.title && <div className="t-title">{t.title}</div>}
            {t.message && <div className="t-msg">{t.message}</div>}
          </div>
          <button className="x" onClick={() => dismiss(t.id)} aria-label="Dismiss"
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
