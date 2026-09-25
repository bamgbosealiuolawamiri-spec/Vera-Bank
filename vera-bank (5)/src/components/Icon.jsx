// Lightweight inline SVG icon set (stroke-based, Lucide-inspired).
import React from 'react'

const P = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  x: 'M6 6l12 12M18 6L6 18',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z',
  eyeOff: 'M9.9 4.24A9.1 9.1 0 0112 4c6.5 0 10 7 10 7a13.2 13.2 0 01-1.67 2.68M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a9.3 9.3 0 005.4-1.6M3 3l18 18M9.9 9.9a3 3 0 004.2 4.2',
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  arrowDownLeft: 'M17 7L7 17M16 17H7V8',
  home: 'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  receipt: 'M4 2h16v20l-3-2-3 2-3-2-3 2V2zM8 7h8M8 11h8M8 15h5',
  card: 'M2 7h20v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM2 10h20M6 15h4',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 006 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 002.6 14H2.5a2 2 0 110-4h.1A1.6 1.6 0 004.6 6l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0010 2.6V2.5a2 2 0 114 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7h.1a2 2 0 110 4h-.1a1.6 1.6 0 00-1.1 1z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  check: 'M20 6L9 17l-5-5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  lock: 'M5 11h14v10H5V11zM8 11V7a4 4 0 018 0v4',
  phone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.8 2z',
  chart: 'M3 3v18h18M7 15l3-4 3 3 4-6',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronUp: 'M6 15l6-6 6 6',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  gift: 'M20 12v9H4v-9M2 7h20v5H2V7zM12 22V7M12 7C12 7 12 2 8.5 2A2.5 2.5 0 0012 7zM12 7c0 0 0-5 3.5-5A2.5 2.5 0 0112 7z',
  wallet: 'M3 6h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM3 6l0-1a2 2 0 012-2h11M17 13h.01',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  qr: 'M4 4h6v6H4V4zM14 4h6v6h-6V4zM4 14h6v6H4v-6zM14 14h3v3h-3v-3zM20 20h.01M20 14h.01M14 20h.01',
  trending: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  wifi: 'M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M2 9a15 15 0 0120 0M12 20h.01',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z',
  star: 'M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1L12 2z',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  moon: 'M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z',
  help: 'M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01',
  building: 'M3 21h18M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01',
  snowflake: 'M12 2v20M2 12h20M5 5l14 14M19 5L5 19M8 4l4 3 4-3M8 20l4-3 4 3M4 8l3 4-3 4M20 8l-3 4 3 4',
}

export default function Icon({ name, size = 20, stroke = 2, className = '', style }) {
  const d = P[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}
