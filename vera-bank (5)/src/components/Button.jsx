import React from 'react'

// Reusable button. variant: primary|green|navy|outline|ghost|danger
// size: sm|md|lg. Set `loading` to show a spinner and disable interaction.
export default function Button({
  children, variant = 'primary', size = 'md', block = false,
  loading = false, disabled = false, iconLeft, iconRight, className = '', ...rest
}) {
  const cls = [
    'btn', 'btn-' + variant,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '', className,
  ].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : (
        <>
          {iconLeft}
          {children}
          {iconRight}
        </>
      )}
    </button>
  )
}
