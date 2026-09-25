// Reusable UI primitives mapped to the design-system CSS classes.
import React, { useState, useEffect } from 'react'
import Icon from './Icon.jsx'

export function Logo({ onDark = false, size = 'md', className = '' }) {
  return (
    <span className={`vera-logo ${onDark ? 'on-dark' : ''} ${size === 'lg' ? 'lg' : ''} ${className}`}>
      <span className="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"><path d="M4 5l8 15 8-15" /></svg>
      </span>
      <span className="name">VERA<b>.</b></span>
    </span>
  )
}

export function Button({ variant = 'primary', size, block, loading, children, className = '', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', block ? 'btn-block' : '', className]
    .filter(Boolean).join(' ')
  const light = variant === 'outline' || variant === 'ghost'
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className={`spinner ${light ? 'dark' : ''}`} /> : children}
    </button>
  )
}

export function Input({ label, hint, error, lead, type = 'text', id, ...rest }) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  const inputId = id || rest.name || label
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="input-wrap">
        {lead && <span className="lead">{lead}</span>}
        <input id={inputId} type={isPw ? (show ? 'text' : 'password') : type}
          className={`input ${lead ? 'has-lead' : ''} ${error ? 'invalid' : ''}`}
          aria-invalid={!!error} {...rest} />
        {isPw && (
          <button type="button" className="toggle" aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

// Phone field whose dial code + flag are driven by the selected `country`
// object ({ dial, flag, name, len, example }). The user types only the
// national number; the prefix is fixed and read-only so it can never be
// out of sync with the chosen country. `value` is the national digits.
export function PhoneField({ label = 'Phone number', country, value, onChange, error, hint, id, name, disabled, placeholder }) {
  const inputId = id || name || 'phone'
  const dial = country ? `+${country.dial}` : '+\u2014'
  const flag = country ? country.flag : '\uD83C\uDF10'
  const ph = placeholder || (country && country.example ? country.example : 'Phone number')
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="input-wrap phone-wrap">
        <span className="lead phone-cc" aria-label={country ? country.name : 'country code'}>
          <span className="cc-flag" aria-hidden="true">{flag}</span>
          <span className="cc-dial">{dial}</span>
        </span>
        <input id={inputId} name={name} type="tel" inputMode="numeric" autoComplete="tel-national"
          className={`input has-lead ${error ? 'invalid' : ''}`} placeholder={ph}
          aria-invalid={!!error} disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value.replace(/[^\d ]/g, ''))} />
      </div>
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

export function Card({ children, pad = true, className = '', ...rest }) {
  return <div className={`card ${pad ? 'card-pad' : ''} ${className}`} {...rest}>{children}</div>
}

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Avatar({ name = '?', className = '' }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return <div className={`avatar ${className}`}>{initials}</div>
}

export function EmptyState({ icon = 'receipt', title, children }) {
  return (
    <div className="empty-state">
      <div className="ico"><Icon name={icon} size={26} /></div>
      {title && <b style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</b>}
      <div>{children}</div>
    </div>
  )
}

export function ErrorBanner({ children }) {
  if (!children) return null
  return <div className="error-banner"><Icon name="alert" size={18} />{children}</div>
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div className="modal-hd">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Money({ value, currency = 'USD', className = '', sign }) {
  const n = Number(value || 0)
  const s = n.toLocaleString(undefined, { style: 'currency', currency })
  return <span className={className}>{sign || ''}{s}</span>
}
