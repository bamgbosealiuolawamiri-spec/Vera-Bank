// Renders a real, scannable QR code (SVG) for a prototype string using the
// bundled `qrcode` library. Falls back gracefully if generation fails.
import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ value, size = 180, className = '' }) {
  const [url, setUrl] = useState('')
  const [err, setErr] = useState(false)
  useEffect(() => {
    let active = true
    setErr(false)
    QRCode.toDataURL(String(value || 'vera'), {
      errorCorrectionLevel: 'M', margin: 1, width: size * 2,
      color: { dark: '#0B1F3A', light: '#ffffff' },
    }).then((u) => { if (active) setUrl(u) }).catch(() => { if (active) setErr(true) })
    return () => { active = false }
  }, [value, size])
  if (err) return <div className={className} style={{ width: size, height: size, display: 'grid', placeItems: 'center', color: 'var(--vera-navy)' }}>QR</div>
  return (
    <img src={url} width={size} height={size} alt="VERA QR code" className={className}
      style={{ width: size, height: size, borderRadius: 12, background: '#fff', display: 'block' }} />
  )
}
