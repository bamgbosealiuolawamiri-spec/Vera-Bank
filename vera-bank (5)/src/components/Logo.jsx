import React from 'react'

// VERA wordmark + shield/V mark. `on-dark` for navy backgrounds, `lg` for hero.
export default function Logo({ onDark = false, size = 'md' }) {
  return (
    <span className={'vera-logo' + (onDark ? ' on-dark' : '') + (size === 'lg' ? ' lg' : '')}>
      <span className="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 2.5v5.5c0 4.4-3 7-7 8-4-1-7-3.6-7-8V5.5L12 3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8.5 9.5 12 15l3.5-5.5" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="name">VERA<b> Bank</b></span>
    </span>
  )
}
