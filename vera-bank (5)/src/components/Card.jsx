import React from 'react'

// Generic surface card. Pass `title` + optional `action` for a header row.
export default function Card({ title, action, pad = true, className = '', children, ...rest }) {
  return (
    <div className={'card ' + (pad ? 'card-pad ' : '') + className} {...rest}>
      {(title || action) && (
        <div className="card-hd">
          {title && <h3>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
