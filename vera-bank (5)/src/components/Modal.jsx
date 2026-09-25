import React, { useEffect } from 'react'
import Icon from './Icon.jsx'

// Accessible modal / bottom sheet. Closes on overlay click or Escape.
export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="grip" aria-hidden="true" />
        <div className="modal-hd">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
        </div>
        <div>{children}</div>
        {footer && <div style={{ marginTop: 18 }}>{footer}</div>}
      </div>
    </div>
  )
}
