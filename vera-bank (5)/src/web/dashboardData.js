// Shared helpers for dashboard + mobile views.
import { useEffect, useState, useCallback } from 'react'

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const run = useCallback(() => {
    let active = true
    setLoading(true); setError('')
    Promise.resolve(fn())
      .then((d) => { if (active) setData(d) })
      .catch((e) => { if (active) setError(e.message || 'Failed to load.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(run, [run])
  return { data, loading, error, reload: run, setData }
}

export function summarize(transactions = []) {
  const now = new Date()
  const thisMonth = (iso) => {
    const d = new Date(iso)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  let income = 0, spending = 0
  transactions.forEach((t) => {
    if (!thisMonth(t.date)) return
    if (t.type === 'credit') income += t.amount
    else spending += t.amount
  })
  return { income, spending, saved: Math.max(0, income - spending) }
}
