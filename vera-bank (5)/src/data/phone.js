// Phone helpers that keep the country selector and dial code in sync.
// The dial code, flag and validation rules are ALWAYS derived from the
// selected country, so a country/dial-code mismatch is impossible by design.
import { COUNTRIES } from './seed.js'

export function countryByName(name) {
  return COUNTRIES.find((c) => c.name === name) || null
}
export function countryByCode(code) {
  return COUNTRIES.find((c) => c.code === code) || null
}
export function countryByDial(dial) {
  const d = String(dial || '').replace(/\D/g, '')
  // Prefer the longest matching dial code (avoids +1 vs +12 ambiguity).
  return COUNTRIES.filter((c) => c.dial === d)[0] || null
}

// Reduce any user input to bare national digits for a given country:
// strips spaces/symbols, a leading + and dial code, and one leading trunk 0.
export function nationalDigits(country, input) {
  let d = String(input == null ? '' : input).replace(/[^\d]/g, '')
  if (country && country.dial && d.startsWith(country.dial) && d.length > country.dial.length) {
    d = d.slice(country.dial.length)
  }
  d = d.replace(/^0+/, '')
  return d
}

// Group national digits loosely for display (3-3-4 style) without being strict.
export function formatNational(digits) {
  const d = String(digits || '').replace(/\D/g, '')
  if (!d) return ''
  const parts = []
  let i = 0
  const sizes = d.length > 9 ? [3, 4, 4] : [3, 3, 3, 3]
  for (const s of sizes) {
    if (i >= d.length) break
    parts.push(d.slice(i, i + s))
    i += s
  }
  if (i < d.length) parts.push(d.slice(i))
  return parts.join(' ')
}

// Validate a national number for the selected country.
// Returns { ok, e164, national, error }.
export function validatePhone(country, input) {
  if (!country) return { ok: false, error: 'Select a country first' }
  const national = nationalDigits(country, input)
  if (!national) return { ok: false, error: 'Enter your phone number' }
  const lens = country.len || []
  if (lens.length && !lens.includes(national.length)) {
    const want = lens.join(' or ')
    return { ok: false, error: `Enter a valid ${country.name} number (${want} digits)` }
  }
  const e164 = `+${country.dial}${national}`
  return { ok: true, e164, national }
}

// Build a normalized display string "+dial national" from parts.
export function toE164(country, input) {
  const r = validatePhone(country, input)
  return r.ok ? r.e164 : null
}

// Split a stored E.164 phone back into { country, national } for editing.
export function splitE164(phone) {
  const raw = String(phone || '').replace(/[^\d]/g, '')
  if (!raw) return { country: null, national: '' }
  const c = countryByDial(raw)
  if (c) return { country: c, national: raw.slice(c.dial.length) }
  return { country: null, national: raw }
}
