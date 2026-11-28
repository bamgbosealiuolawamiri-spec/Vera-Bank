// VERA Bank shared backend. All balances and transactions are fictional demo data.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { runAction, ensureState, seedData } from './src/services/engine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const STATE_FILE = path.join(DATA_DIR, 'state-v2.json')
const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'
const SESSION_COOKIE = 'vera_session'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000
const sessions = new Map()
const pinFailures = new Map()
const PIN_PROTECTED_ACTIONS = new Set(['transfer', 'bankTransfer', 'payBill', 'buyAirtime', 'buyData', 'buyGiftCard', 'pocketAdd', 'pocketWithdraw'])

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
}

fs.mkdirSync(DATA_DIR, { recursive: true })
function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    if (raw && raw.users) return ensureState(raw)
  } catch {}
  const seeded = seedData()
  saveState(seeded)
  return seeded
}
function saveState(value) {
  const tmp = STATE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(value))
  fs.renameSync(tmp, STATE_FILE)
}
let state = loadState()
let writing = Promise.resolve()
function persist() {
  writing = writing.then(() => saveState(state))
  return writing
}
function hashPassword(password, salt = crypto.randomBytes(16)) {
  const digest = crypto.scryptSync(String(password), salt, 64)
  return salt.toString('base64') + ':' + digest.toString('base64')
}
function verifyPassword(password, stored) {
  try {
    const [saltText, digestText] = String(stored).split(':')
    const salt = Buffer.from(saltText, 'base64')
    const expected = Buffer.from(digestText, 'base64')
    const actual = crypto.scryptSync(String(password), salt, expected.length)
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  } catch { return false }
}
function publicUser(user) {
  const { password, passwordHash, pinHash, ...safe } = user
  return { ...safe, pinConfigured: Boolean(pinHash) }
}
function sendJson(res, body, status = 200, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(x => x.trim().split('=').map(decodeURIComponent)).filter(x => x.length === 2))
}
function sessionFor(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE]
  const session = token && sessions.get(token)
  if (!session) return null
  if (session.expiresAt <= Date.now()) { sessions.delete(token); return null }
  session.expiresAt = Date.now() + SESSION_TTL_MS
  return { token, ...session }
}
function cookieHeader(req, token, clear = false) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production'
  return `${SESSION_COOKIE}=${clear ? '' : encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : Math.floor(SESSION_TTL_MS / 1000)}${secure ? '; Secure' : ''}`
}
function originAllowed(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try { return new URL(origin).host === req.headers.host } catch { return false }
}
async function handleApi(req, res) {
  if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'Method not allowed' }, 405)
  if (!originAllowed(req)) return sendJson(res, { ok: false, error: 'Request origin rejected.' }, 403)
  let raw = ''
  req.on('data', chunk => {
    raw += chunk
    if (raw.length > 1e6) { res.writeHead(413); res.end(); req.destroy() }
  })
  req.on('end', async () => {
    let payload
    try { payload = JSON.parse(raw || '{}') } catch { return sendJson(res, { ok: false, error: 'Invalid JSON body' }, 400) }
    const { action, args = {} } = payload || {}
    if (!action || typeof action !== 'string' || !args || typeof args !== 'object' || Array.isArray(args))
      return sendJson(res, { ok: false, error: 'Invalid action request.' }, 400)
    try {
      if (action === 'login' || action === 'register') {
        let user
        if (action === 'register') {
          const password = String(args.password || '')
          if (password.length < 8 || password.length > 256) throw new Error('Choose a password with at least 8 characters.')
          const placeholder = crypto.randomBytes(32).toString('hex')
          const { result } = runAction(state, 'register', { ...args, password: placeholder })
          user = state.users.find(u => u.id === result.id)
          user.passwordHash = hashPassword(password)
          delete user.password
          await persist()
        } else {
          const email = String(args.email || '').trim().toLowerCase()
          const password = String(args.password || '')
          user = state.users.find(u => String(u.email || '').toLowerCase() === email)
          if (!user) throw new Error('Invalid email or password.')
          const valid = user.passwordHash
            ? verifyPassword(password, user.passwordHash)
            : user.password === password
          if (!valid) throw new Error('Invalid email or password.')
          // Upgrade legacy plaintext credentials on successful sign-in.
          if (!user.passwordHash) {
            user.passwordHash = hashPassword(password)
            delete user.password
            await persist()
          }
        }
        const token = crypto.randomBytes(32).toString('base64url')
        sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS })
        return sendJson(res, { ok: true, result: publicUser(user) }, 200, { 'set-cookie': cookieHeader(req, token) })
      }
      if (action === 'logout') {
        const current = sessionFor(req)
        if (current) sessions.delete(current.token)
        return sendJson(res, { ok: true, result: true }, 200, { 'set-cookie': cookieHeader(req, '', true) })
      }
      const current = sessionFor(req)
      if (!current) return sendJson(res, { ok: false, error: 'Please sign in again to continue.' }, 401)
      const authenticatedUser = state.users.find(u => u.id === current.userId)
      if (!authenticatedUser) return sendJson(res, { ok: false, error: 'Account not found. Please sign in again.' }, 401)

      if (action === 'setPin') {
        const pin = String(args.pin || '')
        if (!/^\d{6}$/.test(pin) || /^(\d)\1{5}$/.test(pin) || ['123456','654321','012345','987654'].includes(pin))
          throw new Error('Choose a six-digit PIN that is not an obvious sequence or repeated number.')
        authenticatedUser.pinHash = hashPassword(pin)
        await persist()
        return sendJson(res, { ok: true, result: { pinConfigured: true } })
      }

      // Every action that reduces available or savings balance is verified
      // server-side. PIN values are never passed into the engine or persisted.
      if (PIN_PROTECTED_ACTIONS.has(action)) {
        const pin = String(args.pin || '')
        const failureKey = current.userId
        const failure = pinFailures.get(failureKey) || { count: 0, lockedUntil: 0 }
        if (failure.lockedUntil > Date.now()) throw new Error('PIN verification is temporarily locked. Please try again later.')
        if (!authenticatedUser.pinHash) throw new Error('Set up your six-digit transaction PIN in Settings before making payments.')
        if (!verifyPassword(pin, authenticatedUser.pinHash)) {
          failure.count += 1
          if (failure.count >= 5) { failure.count = 0; failure.lockedUntil = Date.now() + 10 * 60 * 1000 }
          pinFailures.set(failureKey, failure)
          throw new Error(failure.lockedUntil ? 'Too many incorrect PIN attempts. Try again in 10 minutes.' : 'Incorrect transaction PIN.')
        }
        pinFailures.delete(failureKey)
      }
      // Never trust userId supplied by the browser. Bind every action to the
      // authenticated server-side session identity.
      const { pin: _discardedPin, ...cleanArgs } = args
      const safeArgs = { ...cleanArgs, userId: current.userId }
      const { result, mutating } = runAction(state, action, safeArgs)
      if (mutating) await persist()
      return sendJson(res, { ok: true, result })
    } catch (err) {
      const msg = err?.message || 'Request failed'
      const status = msg.startsWith('Unknown action') ? 400 : 400
      return sendJson(res, { ok: false, error: msg }, status)
    }
  })
}
function safeJoin(base, target) {
  const resolved = path.resolve(base, '.' + target)
  return resolved.startsWith(path.resolve(base) + path.sep) || resolved === path.resolve(base) ? resolved : null
}
function serveFile(res, fp) {
  const ext = path.extname(fp).toLowerCase()
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=3600' })
  fs.createReadStream(fp).pipe(res)
}
function handleStatic(req, res) {
  let urlPath
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0]) } catch { res.writeHead(400); return res.end('Bad request') }
  const fp = safeJoin(DIST, urlPath === '/' ? '/index.html' : urlPath)
  if (fp && fs.existsSync(fp) && fs.statSync(fp).isFile()) return serveFile(res, fp)
  const index = path.join(DIST, 'index.html')
  if (fs.existsSync(index)) return serveFile(res, index)
  res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found')
}
const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0]
  if (urlPath === '/api' || urlPath === '/api/') return handleApi(req, res)
  if (urlPath === '/healthz') return sendJson(res, { ok: true, status: 'up' })
  return handleStatic(req, res)
})
server.listen(PORT, HOST, () => console.log(`VERA demo server listening on ${HOST}:${PORT}`))
