import React, { useId, useState } from 'react'
import Icon from './Icon.jsx'

// Accessible labelled input with optional lead icon, password reveal, hint & error.
export default function Input({
  label, type = 'text', icon, hint, error, className = '', id, ...rest
}) {
  const autoId = useId()
  const inputId = id || autoId
  const isPassword = type === 'password'
  const [reveal, setReveal] = useState(false)
  const realType = isPassword ? (reveal ? 'text' : 'password') : type
  return (
    <div className={'field ' + className}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="input-wrap">
        {icon && <span className="lead" aria-hidden="true"><Icon name={icon} size={19} /></span>}
        <input
          id={inputId}
          type={realType}
          className={'input' + (icon ? ' has-lead' : '') + (error ? ' invalid' : '')}
          aria-invalid={!!error}
          aria-describedby={error ? inputId + '-err' : hint ? inputId + '-hint' : undefined}
          {...rest}
        />
        {isPassword && (
          <button type="button" className="toggle" onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}>
            <Icon name={reveal ? 'eyeOff' : 'eye'} size={19} />
          </button>
        )}
      </div>
      {error ? <span className="err" id={inputId + '-err'}>{error}</span>
        : hint ? <span className="hint" id={inputId + '-hint'}>{hint}</span> : null}
    </div>
  )
}
