// Shared simulated-banking backend for the VERA Bank demo.
//
// This Netlify Function is the SINGLE SOURCE OF TRUTH when the app is deployed
// on Netlify with Functions + Blobs enabled. All app instances (any browser,
// any device) POST { action, args } here; state lives in one Netlify Blob, so
// a user registered in one browser can be found, paid and messaged from
// another. Everything is FICTIONAL / SIMULATED — no real money or bank.
import { getStore } from '@netlify/blobs'
import { runAction, ensureState, seedData } from '../../src/services/engine.js'

const STORE_NAME = 'vera-bank'
const STATE_KEY = 'state-v2'

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

async function loadState(store) {
  try {
    const raw = await store.get(STATE_KEY, { type: 'json' })
    if (raw && raw.users) return ensureState(raw)
  } catch (e) { /* fall through to seed */ }
  const seeded = seedData()
  await store.setJSON(STATE_KEY, seeded)
  return seeded
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)

  let payload
  try {
    payload = await req.json()
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const { action, args } = payload || {}
  if (!action || typeof action !== 'string') return json({ ok: false, error: 'Missing action' }, 400)

  const store = getStore({ name: STORE_NAME, consistency: 'strong' })
  const state = await loadState(store)

  try {
    const { result, mutating } = runAction(state, action, args)
    if (mutating) await store.setJSON(STATE_KEY, state)
    return json({ ok: true, result })
  } catch (err) {
    // Domain errors are returned as HTTP 200 with ok:false so the client can
    // surface the message; unknown actions are 400.
    const msg = err && err.message ? err.message : 'Request failed'
    const status = msg.startsWith('Unknown action') ? 400 : 200
    return json({ ok: false, error: msg }, status)
  }
}
