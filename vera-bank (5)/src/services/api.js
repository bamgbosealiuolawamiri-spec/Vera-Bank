// -----------------------------------------------------------------------------
// VERA Bank \u2014 MOCK API LAYER
// -----------------------------------------------------------------------------
// This module is the single seam between the UI and a future backend.
// Today it resolves against in-memory demo data + localStorage. To connect a
// real backend later, replace the bodies of these functions with `fetch` calls
// to your API (e.g. Node.js + Express) \u2014 the component-facing signatures and
// returned shapes are designed to stay identical.
//
// Suggested real endpoints (documented for the future developer):
//   POST   /api/auth/login            { identifier, password } -> { token, user }
//   POST   /api/auth/signup           { name, email, phone, password } -> { token, user }
//   POST   /api/auth/forgot-password  { identifier } -> { ok }
//   GET    /api/accounts/me           -> account
//   GET    /api/transactions          ?search=&type= -> [transaction]
//   POST   /api/transfers             { recipient, amount, description } -> transaction
//   GET    /api/cards                 -> [card]
//   PATCH  /api/cards/:id             { status } -> card
//   POST   /api/bills/pay             { category, provider, amount } -> transaction
// -----------------------------------------------------------------------------

import {
  DEMO_USER, DEMO_ACCOUNT, DEMO_CARD, DEMO_TRANSACTIONS,
  DEMO_NOTIFICATIONS,
} from '../data/demoData.js'

const TOKEN_KEY = 'vera.token'
const USER_KEY = 'vera.user'
const DB_KEY = 'vera.db'

const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms))

// -- local \"database\" (session state that survives reloads) --
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  const seed = {
    account: { ...DEMO_ACCOUNT },
    transactions: [...DEMO_TRANSACTIONS],
    card: { ...DEMO_CARD },
    notifications: [...DEMO_NOTIFICATIONS],
  }
  saveDB(seed)
  return seed
}
function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch (e) { /* ignore */ }
}

function newRef() {
  return 'VRA-' + Math.floor(1000000 + Math.random() * 8999999)
}

// ---------------- AUTH ----------------
export const auth = {
  async login({ identifier, password }) {
    await delay()
    if (!identifier || !password) throw new Error('Please enter your details to continue.')
    if (password.length < 4) throw new Error('Incorrect password. This is a demo \u2014 any 4+ char password works.')
    const token = 'demo.' + btoa(identifier).slice(0, 18)
    const user = { ...DEMO_USER, email: identifier.includes('@') ? identifier : DEMO_USER.email }
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { token, user }
  },
  async signup({ name, email, phone, password }) {
    await delay(800)
    if (!name || !email || !phone || !password) throw new Error('All fields are required.')
    const token = 'demo.' + btoa(email).slice(0, 18)
    const user = { ...DEMO_USER, name, displayName: name.toUpperCase(), email, phone,
      initials: name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() }
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { token, user }
  },
  async forgotPassword({ identifier }) {
    await delay()
    if (!identifier) throw new Error('Enter your phone number or email.')
    return { ok: true }
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  getSession() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    try { return { token, user: JSON.parse(localStorage.getItem(USER_KEY)) } }
    catch (e) { return null }
  },
}

// ---------------- BANKING ----------------
export const bank = {
  async getAccount() { await delay(400); return loadDB().account },
  async getCard() { await delay(400); return loadDB().card },
  async getNotifications() { await delay(300); return loadDB().notifications },

  async getTransactions({ search = '', type = 'all' } = {}) {
    await delay(450)
    let list = loadDB().transactions
    if (type !== 'all') list = list.filter((t) => t.type === type)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.party.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q))
    }
    return list
  },

  async transfer({ recipient, amount, description }) {
    await delay(900)
    const amt = Number(amount)
    if (!recipient) throw new Error('Choose a recipient.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    const db = loadDB()
    if (amt > db.account.balance) throw new Error('Insufficient balance for this transfer.')
    const txn = { id: 'txn_' + Date.now(), type: 'debit', amount: amt, party: recipient,
      description: description || 'Transfer', date: new Date().toISOString(), status: 'completed', reference: newRef() }
    db.account.balance -= amt
    db.transactions = [txn, ...db.transactions]
    saveDB(db)
    return txn
  },

  async payBill({ category, provider, amount }) {
    await delay(900)
    const amt = Number(amount)
    if (!provider) throw new Error('Select a provider.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    const db = loadDB()
    if (amt > db.account.balance) throw new Error('Insufficient balance for this payment.')
    const txn = { id: 'txn_' + Date.now(), type: 'debit', amount: amt, party: provider,
      description: category + ' bill', date: new Date().toISOString(), status: 'completed', reference: newRef() }
    db.account.balance -= amt
    db.transactions = [txn, ...db.transactions]
    saveDB(db)
    return txn
  },

  async setCardStatus(status) {
    await delay(500)
    const db = loadDB()
    db.card.status = status
    saveDB(db)
    return db.card
  },

  // demo utility: reset the local sandbox
  resetDemo() { localStorage.removeItem(DB_KEY) },
}
