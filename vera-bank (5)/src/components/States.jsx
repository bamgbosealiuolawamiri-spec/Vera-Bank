import React from 'react'
import Icon from './Icon.jsx'

export function LoadingBlock({ label = 'Loading\u2026', height = 160 }) {
  return (
    <div className="center" style={{ flexDirection: 'column', gap: 12, minHeight: height, color: 'var(--text-secondary)' }}>
      <span className="spinner dark" />
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  )
}

export function EmptyState({ icon = 'search', title, message }) {
  return (
    <div className="empty-state">
      <div className="ico"><Icon name={icon} size={26} /></div>
      <b style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</b>
      <span style={{ fontSize: 14 }}>{message}</span>
    </div>
  )
}

export function ErrorBanner({ children }) {
  if (!children) return null
  return <div className="error-banner" role="alert"><Icon name="x" size={16} /><span>{children}</span></div>
}
