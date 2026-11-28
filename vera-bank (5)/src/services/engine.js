// Pure simulated-banking engine shared by BOTH the local fallback (browser)
// and the Netlify Function (server). Every action is a function
//   fn(state, args) -> result
// that MUTATES the passed-in `state` object and returns a plain result.
// Domain errors are thrown as Error(message). No I/O, no localStorage, no
// network — so it runs identically in Node and the browser.
//
// All finance here is FICTIONAL / SIMULATED. Nothing is licensed, insured,
// or connected to any real bank, card network or regulator.
import { seedData, uid } from '../data/seed.js'

export { seedData }

const money2 = (n) => Number(Number(n).toFixed(2))
const ref = () => 'VRA-' + Math.floor(1000000 + Math.random() * 8999999)

function fmtDate(iso) {
  const dt = new Date(iso)
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ', ' + dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
export function withLabel(t) { return { ...t, dateLabel: fmtDate(t.date) } }
function sanitize(u) { const { password, passwordHash, ...rest } = u; return rest }
function getUser(state, userId) { return state.users.find((x) => x.id === userId) }

// Ensure forward-compatible collections exist on a loaded/blob state.
export function ensureState(state) {
  if (!state || typeof state !== 'object') return seedData()
  state.users = state.users || []
  state.cards = state.cards || []
  state.beneficiaries = state.beneficiaries || []
  state.transactions = state.transactions || []
  state.savings = state.savings || []
  state.requests = state.requests || []
  state.notifications = state.notifications || []
  return state
}

function addTxn(state, userId, over) {
  const t = { id: uid('txn'), userId, status: 'completed', reference: ref(), date: new Date().toISOString(), ...over }
  state.transactions.push(t)
  return t
}
function addNote(state, userId, kind, title, message) {
  const n = { id: uid('ntf'), userId, kind, title, message, date: new Date().toISOString(), read: false }
  state.notifications.push(n)
  return n
}

// Set of actions that change state and therefore must be persisted.
export const MUTATING = new Set([
  'login', 'register', 'markNotificationsRead', 'transfer', 'bankTransfer',
  'payBill', 'buyAirtime', 'buyData', 'buyGiftCard', 'requestMoney',
  'updateRequest', 'addBeneficiary', 'toggleFreeze', 'deposit',
  'updateProfile', 'createPocket', 'pocketAdd', 'pocketWithdraw',
])

export const actions = {
  // ---- auth ----
  login(state, { email, password }) {
    const u = state.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase())
    if (!u || u.password !== password) throw new Error('Invalid email or password.')
    return sanitize(u)
  },
  register(state, { name, email, password, phone, country }) {
    if (state.users.some((x) => x.email.toLowerCase() === String(email).toLowerCase()))
      throw new Error('An account with that email already exists.')
    const acct = '40' + Math.floor(10 + Math.random() * 89) + ' ' +
      Math.floor(1000 + Math.random() * 8999) + ' ' + Math.floor(1000 + Math.random() * 8999)
    const baseUser = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
    let username = baseUser || ('vera' + Math.floor(100 + Math.random() * 899))
    while (state.users.some((x) => x.username === username)) username += Math.floor(Math.random() * 9)
    const u = {
      id: uid('usr'), name, email, password, phone: phone || '', username,
      country: country || '', accountNumber: acct, balance: 250.0, currency: 'USD',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    state.users.push(u)
    addTxn(state, u.id, { type: 'credit', title: 'Welcome bonus', category: 'Money Added', amount: 250.0 })
    addNote(state, u.id, 'success', 'Welcome to VERA', 'Your simulated account is ready with a $250 demo bonus.')
    state.cards.push({ id: uid('card'), userId: u.id, name: 'VERA Debit', last4: String(1000 + Math.floor(Math.random() * 8999)).slice(0, 4), brand: 'VERA', frozen: false, type: 'physical', exp: '05/29' })
    return sanitize(u)
  },
  me(state, { userId }) {
    const u = getUser(state, userId)
    return u ? sanitize(u) : null
  },

  // ---- reads ----
  getBalance(state, { userId }) {
    const u = getUser(state, userId)
    return u ? u.balance : 0
  },
  getTransactions(state, { userId }) {
    return state.transactions.filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(withLabel)
  },
  getBeneficiaries(state, { userId }) {
    return state.beneficiaries.filter((b) => b.userId === userId)
  },
  getCards(state, { userId }) {
    return state.cards.filter((c) => c.userId === userId)
  },
  getSavings(state, { userId }) {
    return state.savings.filter((p) => p.userId === userId)
  },
  getRequests(state, { userId }) {
    return state.requests
      .filter((r) => r.fromUserId === userId || r.toUserId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  getNotifications(state, { userId }) {
    return state.notifications.filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  markNotificationsRead(state, { userId }) {
    state.notifications.forEach((n) => { if (n.userId === userId) n.read = true })
    return true
  },

  // Look up a registered VERA recipient by a valid identifier. Only real
  // (seeded/registered) users are searchable — no fake public users exist.
  findRecipient(state, { userId, method, value }) {
    const v = String(value || '').trim().toLowerCase()
    if (!v) return null
    const norm = (s) => String(s || '').replace(/\s+/g, '').toLowerCase()
    let hit = null
    if (method === 'account') hit = state.users.find((u) => norm(u.accountNumber) === norm(value))
    else if (method === 'email') hit = state.users.find((u) => (u.email || '').toLowerCase() === v)
    else if (method === 'username') hit = state.users.find((u) => (u.username || '').toLowerCase() === v.replace(/^@/, ''))
    else hit = state.users.find((u) => norm(u.accountNumber) === norm(value) || (u.email || '').toLowerCase() === v || (u.username || '').toLowerCase() === v.replace(/^@/, ''))
    if (!hit || hit.id === userId) return null
    return { userId: hit.id, name: hit.name, accountNumber: hit.accountNumber, email: hit.email, username: hit.username, bank: 'VERA Bank', kind: 'vera' }
  },

  // ---- mutations ----
  transfer(state, { userId, beneficiaryId, recipient, toName, accountNumber, bank, method, amount, note }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > u.balance) throw new Error('Insufficient funds for this transfer.')
    const ben = beneficiaryId ? state.beneficiaries.find((b) => b.id === beneficiaryId) : null
    const rName = recipient?.name || (ben ? ben.name : (toName || 'Recipient'))
    const rAcct = recipient?.accountNumber || (ben ? ben.accountNumber : accountNumber) || ''
    const rBank = recipient?.bank || (ben ? ben.bank : bank) || 'VERA Bank'
    u.balance = money2(u.balance - amt)
    const rec = { name: rName, accountNumber: rAcct, bank: rBank, email: recipient?.email, username: recipient?.username }
    const t = addTxn(state, userId, { type: 'debit', title: `Transfer to ${rName}`, category: 'Transfer', amount: amt, note: note || '', method: method || 'Account number', recipient: rec, sender: { name: u.name, accountNumber: u.accountNumber, bank: 'VERA Bank' } })
    if (recipient?.userId) {
      const ru = getUser(state, recipient.userId)
      if (ru) { ru.balance = money2(ru.balance + amt); addTxn(state, ru.id, { type: 'credit', title: `Transfer from ${u.name}`, category: 'Transfer', amount: amt, note: note || '', method: 'VERA', sender: { name: u.name, accountNumber: u.accountNumber, bank: 'VERA Bank' } }); addNote(state, ru.id, 'success', 'Money received', `You received $${amt.toFixed(2)} from ${u.name}.`) }
    }
    addNote(state, userId, 'success', 'Transfer successful', `$${amt.toFixed(2)} sent to ${rName}.`)
    return { balance: u.balance, transaction: withLabel(t) }
  },

  bankTransfer(state, { userId, bank, accountNumber, accountName, amount, note }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!accountNumber) throw new Error('Enter an account number.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > u.balance) throw new Error('Insufficient funds for this transfer.')
    u.balance = money2(u.balance - amt)
    const rec = { name: accountName || 'Bank recipient', accountNumber, bank: bank || 'Bank' }
    const t = addTxn(state, userId, { type: 'debit', title: `Bank transfer to ${rec.name}`, category: 'Bank Transfer', amount: amt, note: note || '', method: 'Bank transfer', recipient: rec, sender: { name: u.name, accountNumber: u.accountNumber, bank: 'VERA Bank' } })
    addNote(state, userId, 'success', 'Transfer successful', `$${amt.toFixed(2)} sent to ${rec.name} (${bank}).`)
    return { balance: u.balance, transaction: withLabel(t) }
  },

  payBill(state, { userId, biller, amount, category }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > u.balance) throw new Error('Insufficient funds to pay this bill.')
    u.balance = money2(u.balance - amt)
    const t = addTxn(state, userId, { type: 'debit', title: biller, category: category || 'Payment', amount: amt, method: 'Bill payment' })
    addNote(state, userId, 'success', 'Bill payment', `${biller} of $${amt.toFixed(2)} paid.`)
    return { balance: u.balance, transaction: withLabel(t) }
  },

  buyAirtime(state, { userId, network, phone, amount }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!phone) throw new Error('Enter a phone number.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > u.balance) throw new Error('Insufficient funds for this purchase.')
    u.balance = money2(u.balance - amt)
    const t = addTxn(state, userId, { type: 'debit', title: `${network} Airtime`, category: 'Airtime', amount: amt, method: 'Airtime', meta: { network, phone } })
    addNote(state, userId, 'success', 'Airtime purchase', `$${amt.toFixed(2)} ${network} airtime sent to ${phone}.`)
    return { balance: u.balance, transaction: withLabel(t) }
  },

  buyData(state, { userId, network, phone, bundleLabel, amount }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!phone) throw new Error('Enter a phone number.')
    if (!amt || amt <= 0) throw new Error('Choose a data bundle.')
    if (amt > u.balance) throw new Error('Insufficient funds for this purchase.')
    u.balance = money2(u.balance - amt)
    const t = addTxn(state, userId, { type: 'debit', title: `${network} Data \u2014 ${bundleLabel}`, category: 'Data', amount: amt, method: 'Data', meta: { network, phone, bundle: bundleLabel } })
    addNote(state, userId, 'success', 'Data purchase', `${bundleLabel} ${network} data sent to ${phone}.`)
    return { balance: u.balance, transaction: withLabel(t) }
  },

  buyGiftCard(state, { userId, brand, amount }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!amt || amt <= 0) throw new Error('Choose an amount.')
    if (amt > u.balance) throw new Error('Insufficient funds for this purchase.')
    u.balance = money2(u.balance - amt)
    const code = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 6).toUpperCase()).join('-')
    const t = addTxn(state, userId, { type: 'debit', title: `${brand} (demo)`, category: 'Gift Card', amount: amt, method: 'Gift card', meta: { brand, code, demo: true } })
    addNote(state, userId, 'success', 'Gift card purchased', `Simulated ${brand} of $${amt.toFixed(2)} purchased.`)
    return { balance: u.balance, transaction: withLabel(t), code }
  },

  requestMoney(state, { userId, recipient, amount, note }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!recipient) throw new Error('Choose who to request from.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    const r = { id: uid('req'), fromUserId: userId, toUserId: recipient.userId || null, toName: recipient.name, fromName: u.name, amount: amt, note: note || '', status: 'Pending', date: new Date().toISOString() }
    state.requests.push(r)
    addTxn(state, userId, { type: 'request', title: `Request to ${recipient.name}`, category: 'Request', amount: amt, status: 'Pending', note: note || '', recipient: { name: recipient.name, accountNumber: recipient.accountNumber } })
    addNote(state, userId, 'info', 'Money request sent', `You requested $${amt.toFixed(2)} from ${recipient.name}.`)
    // Notify the recipient too, if they are a registered VERA user.
    if (recipient.userId) addNote(state, recipient.userId, 'info', 'Money requested', `${u.name} requested $${amt.toFixed(2)} from you.`)
    return r
  },
  updateRequest(state, { userId, requestId, status }) {
    const r = state.requests.find((x) => x.id === requestId)
    if (r) r.status = status
    return r || null
  },

  addBeneficiary(state, { userId, name, accountNumber, bank }) {
    const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    const b = { id: uid('ben'), userId, name, accountNumber, bank: bank || 'VERA Bank', initials }
    state.beneficiaries.push(b)
    return b
  },
  toggleFreeze(state, { userId, cardId }) {
    const c = state.cards.find((x) => x.id === cardId && x.userId === userId)
    if (c) {
      c.frozen = !c.frozen
      addNote(state, userId, c.frozen ? 'info' : 'success', 'Card status changed', `${c.name} is now ${c.frozen ? 'frozen' : 'active'}.`)
    }
    return c || null
  },
  deposit(state, { userId, amount, method }) {
    const u = getUser(state, userId)
    const amt = Number(amount)
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    u.balance = money2(u.balance + amt)
    const t = addTxn(state, userId, { type: 'credit', title: 'Money added', category: 'Money Added', amount: amt, method: method || 'Card top-up' })
    addNote(state, userId, 'success', 'Money added', `$${amt.toFixed(2)} added to your VERA balance.`)
    return { balance: u.balance, transaction: withLabel(t) }
  },
  updateProfile(state, { userId, ...patch }) {
    const u = getUser(state, userId)
    // Never allow id/password/balance/accountNumber to be overwritten here.
    delete patch.id; delete patch.password; delete patch.passwordHash; delete patch.balance
    delete patch.accountNumber; delete patch.currency
    Object.assign(u, patch)
    return sanitize(u)
  },

  // ---- savings pockets ----
  createPocket(state, { userId, name, target, targetDate }) {
    const u = getUser(state, userId)
    if (!u) throw new Error('Your VERA account could not be found. Please sign in again.')
    if (!String(name || '').trim()) throw new Error('Give your pocket a name.')
    const targetAmount = Number(target || 0)
    if (!Number.isFinite(targetAmount) || targetAmount < 0) throw new Error('Enter a valid savings target.')
    const p = { id: uid('pk'), userId, name: String(name).trim(), target: money2(targetAmount), saved: 0, targetDate: targetDate || '', createdAt: new Date().toISOString() }
    state.savings.push(p)
    addNote(state, userId, 'success', 'Savings pocket created', `\"${name}\" is ready.`)
    return p
  },
  pocketAdd(state, { userId, pocketId, amount }) {
    const u = getUser(state, userId)
    if (!u) throw new Error('Your VERA account could not be found. Please sign in again.')
    const p = state.savings.find((x) => x.id === pocketId && x.userId === userId)
    const amt = Number(amount)
    if (!p) throw new Error('Pocket not found.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > u.balance) throw new Error('Insufficient available balance.')
    u.balance = money2(u.balance - amt)
    p.saved = money2(p.saved + amt)
    addTxn(state, userId, { type: 'debit', title: `Savings \u2014 ${p.name}`, category: 'Savings', amount: amt, method: 'Savings deposit', meta: { pocket: p.name } })
    addNote(state, userId, 'success', 'Added to savings', `$${amt.toFixed(2)} moved into \"${p.name}\".`)
    return { balance: u.balance, pocket: p }
  },
  pocketWithdraw(state, { userId, pocketId, amount }) {
    const u = getUser(state, userId)
    if (!u) throw new Error('Your VERA account could not be found. Please sign in again.')
    const p = state.savings.find((x) => x.id === pocketId && x.userId === userId)
    const amt = Number(amount)
    if (!p) throw new Error('Pocket not found.')
    if (!amt || amt <= 0) throw new Error('Enter a valid amount.')
    if (amt > p.saved) throw new Error('Amount exceeds pocket balance.')
    u.balance = money2(u.balance + amt)
    p.saved = money2(p.saved - amt)
    addTxn(state, userId, { type: 'credit', title: `Withdraw \u2014 ${p.name}`, category: 'Savings', amount: amt, method: 'Savings withdrawal', meta: { pocket: p.name } })
    addNote(state, userId, 'success', 'Withdrawn from savings', `$${amt.toFixed(2)} moved back to your available balance.`)
    return { balance: u.balance, pocket: p }
  },
}

// Run one action against a state object. Returns { result }.
// Throws on unknown action or on any domain error from the action.
export function runAction(state, action, args = {}) {
  const fn = actions[action]
  if (!fn) throw new Error(`Unknown action: ${action}`)
  const result = fn(state, args || {})
  return { result, mutating: MUTATING.has(action) }
}
