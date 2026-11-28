// VERA Bank data layer.
//
// The app talks to a SHARED simulated backend (a Netlify Function backed by
// Netlify Blobs) so that users registered in one browser/device can be found,
// paid and notified from another — the state is one shared object, not a
// per-browser copy.
//
// Local development can use a per-browser localStorage fallback. On the live
// Render site we fail closed instead: silently using localStorage would make
// different users appear to have separate accounts and break transfers.
//
// Only the session (current user id) is kept on-device — it is a token, not the
// source of truth. All finance is FICTIONAL / SIMULATED.
import { runAction, ensureState, seedData } from './engine.js'

const API_URL = '/api'
const KEY = 'vera_bank_state_v2'          // local fallback state
const SESSION_KEY = 'vera_bank_session_v1' // on-device session token (user id)

// ---- session (on-device token only) ----
function getSession() {
  try { return localStorage.getItem(SESSION_KEY) } catch (e) { return null }
}
function setSession(id) {
  try { if (id) localStorage.setItem(SESSION_KEY, id); else localStorage.removeItem(SESSION_KEY) } catch (e) { /* ignore */ }
}

// ---- local fallback state (per-browser mirror of the engine) ----
function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return ensureState(JSON.parse(raw))
  } catch (e) { /* ignore */ }
  const seeded = seedData()
  saveLocal(seeded)
  return seeded
}
function saveLocal(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* ignore */ }
}
const clone = (v) => JSON.parse(JSON.stringify(v))

// Render production must always use the shared backend. Never silently switch
// live users to isolated browser storage.
const requireSharedBackend = typeof window !== 'undefined' &&
  window.location.hostname.endsWith('.onrender.com')

// Whether we already know the shared backend is unavailable this session.
let backendDown = false

function runLocal(action, args) {
  const state = loadLocal()
  const { result, mutating } = runAction(state, action, args)
  if (mutating) saveLocal(state)
  return clone(result)
}

// Core dispatch: use the shared backend; local fallback is development-only.
async function request(action, args = {}) {
  if (requireSharedBackend && backendDown) {
    throw new Error('VERA shared service is unavailable. Please refresh and try again shortly.')
  }
  if (!backendDown && typeof fetch === 'function') {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action, args }),
      })
      // Static hosting without Functions typically returns index.html (200,
      // text/html) or a 404 — either way JSON parsing/handling below fails and
      // we drop to the local fallback for the rest of the session.
      const ctype = res.headers.get('content-type') || ''
      if (!ctype.includes('application/json')) throw new Error('backend not json')
      const data = await res.json()
      if (data && data.ok) return data.result
      if (data && data.ok === false) throw new DomainError(data.error || 'Request failed')
      throw new Error('unexpected response')
    } catch (err) {
      if (err instanceof DomainError) throw err // real domain error — do not fall back
      backendDown = true
      if (requireSharedBackend) {
        throw new Error('VERA shared service is unavailable. Please refresh and try again shortly.')
      }
    }
  }
  if (requireSharedBackend) {
    throw new Error('VERA shared service is unavailable. Please refresh and try again shortly.')
  }
  return runLocal(action, args)
}

// Marks server-returned {ok:false,error} so we distinguish it from transport
// failures (which should fall back to local).
class DomainError extends Error {}

export const api = {
  // ---- auth ----
  async login(email, password) {
    const user = await request('login', { email, password })
    if (!requireSharedBackend) setSession(user.id)
    return user
  },
  async register(form) {
    const user = await request('register', { name: form.name, email: form.email, password: form.password, phone: form.phone, country: form.country })
    if (!requireSharedBackend) setSession(user.id)
    return user
  },
  logout() {
    setSession(null)
    if (requireSharedBackend && typeof fetch === 'function') {
      fetch(API_URL, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'logout', args: {} }) }).catch(() => {})
    }
  },
  currentUserId() { return getSession() },
  async me() {
    const id = getSession()
    if (!requireSharedBackend && !id) return null
    try {
      const user = await request('me', requireSharedBackend ? {} : { userId: id })
      if (!user) setSession(null)
      return user
    } catch (err) {
      if (requireSharedBackend && /sign in again/i.test(err.message || '')) return null
      throw err
    }
  },

  async setPin(pin) { return request('setPin', { pin }) },

  // ---- reads ----
  getBalance(userId) { return request('getBalance', { userId }) },
  getTransactions(userId) { return request('getTransactions', { userId }) },
  getBeneficiaries(userId) { return request('getBeneficiaries', { userId }) },
  getCards(userId) { return request('getCards', { userId }) },
  getSavings(userId) { return request('getSavings', { userId }) },
  getRequests(userId) { return request('getRequests', { userId }) },
  getNotifications(userId) { return request('getNotifications', { userId }) },
  markNotificationsRead(userId) { return request('markNotificationsRead', { userId }) },
  findRecipient(userId, { method, value }) { return request('findRecipient', { userId, method, value }) },

  // ---- mutations ----
  transfer(userId, opts) { return request('transfer', { userId, ...opts }) },
  bankTransfer(userId, opts) { return request('bankTransfer', { userId, ...opts }) },
  payBill(userId, opts) { return request('payBill', { userId, ...opts }) },
  buyAirtime(userId, opts) { return request('buyAirtime', { userId, ...opts }) },
  buyData(userId, opts) { return request('buyData', { userId, ...opts }) },
  buyGiftCard(userId, opts) { return request('buyGiftCard', { userId, ...opts }) },
  requestMoney(userId, opts) { return request('requestMoney', { userId, ...opts }) },
  updateRequest(userId, requestId, status) { return request('updateRequest', { userId, requestId, status }) },
  addBeneficiary(userId, opts) { return request('addBeneficiary', { userId, ...opts }) },
  toggleFreeze(userId, cardId) { return request('toggleFreeze', { userId, cardId }) },
  deposit(userId, amount, method) { return request('deposit', { userId, amount, method }) },
  updateProfile(userId, patch) { return request('updateProfile', { userId, ...patch }) },
  createPocket(userId, opts) { return request('createPocket', { userId, ...opts }) },
  pocketAdd(userId, pocketId, amount, pin) { return request('pocketAdd', { userId, pocketId, amount, pin }) },
  pocketWithdraw(userId, pocketId, amount, pin) { return request('pocketWithdraw', { userId, pocketId, amount, pin }) },
}
