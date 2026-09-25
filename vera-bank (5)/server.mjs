// VERA Bank — portable shared backend for NON-Netlify hosting (Render, Railway,
// Fly.io, a VPS, etc.). It runs the SAME simulated-banking engine as the
// Netlify Function and the browser fallback, so behaviour is identical.
//
// Responsibilities:
//   1. Expose  POST /api  ->  { action, args }  ->  { ok, result }
//      (this is exactly the contract src/services/store.js already speaks).
//   2. Serve the built Vite SPA in ./dist with history/SPA fallback.
//   3. Persist ONE shared state object to disk (DATA_DIR) so every browser /
//      device sees the same users, balances and transfers. Attach a persistent
//      volume at DATA_DIR to make it durable across restarts/redeploys.
//
// All finance is FICTIONAL / SIMULATED. Nothing is a real bank or real money.
// This file does NOT touch or depend on Netlify — the Netlify project is
// unchanged and keeps using netlify/functions/vera.mjs.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAction, ensureState, seedData } from './src/services/engine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const STATE_FILE = path.join(DATA_DIR, 'state-v2.json')
const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
}

// ---- shared state (single source of truth, persisted to DATA_DIR) ----
fs.mkdirSync(DATA_DIR, { recursive: true })

function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    if (raw && raw.users) return ensureState(raw)
  } catch (e) { /* fall through to seed */ }
  const seeded = seedData()
  saveState(seeded)
  return seeded
}

// Atomic write (tmp file + rename) so a crash mid-write can't corrupt state.
function saveState(state) {
  const tmp = STATE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(state))
  fs.renameSync(tmp, STATE_FILE)
}

let state = loadState()
// Serialise mutating writes (single Node process) to avoid interleaving.
let writing = Promise.resolve()
function persist() {
  writing = writing.then(() => { try { saveState(state) } catch (e) { /* keep serving */ } })
  return writing
}

function sendJson(res, body, status = 200) {
  const s = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(s)
}

async function handleApi(req, res) {
  if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'Method not allowed' }, 405)
  let raw = ''
  req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy() })
  req.on('end', async () => {
    let payload
    try { payload = JSON.parse(raw || '{}') } catch (e) { return sendJson(res, { ok: false, error: 'Invalid JSON body' }, 400) }
    const { action, args } = payload || {}
    if (!action || typeof action !== 'string') return sendJson(res, { ok: false, error: 'Missing action' }, 400)
    try {
      const { result, mutating } = runAction(state, action, args)
      if (mutating) await persist()
      sendJson(res, { ok: true, result })
    } catch (err) {
      const msg = err && err.message ? err.message : 'Request failed'
      const status = msg.startsWith('Unknown action') ? 400 : 200
      sendJson(res, { ok: false, error: msg }, status)
    }
  })
}

// ---- static file + SPA fallback ----
function safeJoin(base, target) {
  const p = path.normalize(path.join(base, target))
  if (!p.startsWith(base)) return null // block path traversal
  return p
}

function serveFile(res, fp, status = 200) {
  const ext = path.extname(fp).toLowerCase()
  res.writeHead(status, {
    'content-type': MIME[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
  })
  fs.createReadStream(fp).pipe(res)
}

function handleStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let fp = safeJoin(DIST, urlPath === '/' ? '/index.html' : urlPath)
  if (fp && fs.existsSync(fp) && fs.statSync(fp).isFile()) return serveFile(res, fp)
  // SPA fallback: unknown non-file GET -> index.html (client router handles it)
  const index = path.join(DIST, 'index.html')
  if (fs.existsSync(index)) return serveFile(res, index)
  res.writeHead(404, { 'content-type': 'text/plain' })
  res.end('Not found')
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0]
  if (urlPath === '/api' || urlPath === '/api/') return handleApi(req, res)
  if (urlPath === '/healthz') return sendJson(res, { ok: true, status: 'up' })
  return handleStatic(req, res)
})

server.listen(PORT, HOST, () => {
  console.log(`VERA Bank server on http://${HOST}:${PORT}  (data: ${DATA_DIR})`)
})
