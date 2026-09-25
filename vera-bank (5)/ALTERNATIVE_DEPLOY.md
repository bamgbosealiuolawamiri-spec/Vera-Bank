# VERA Bank — Deploying on an alternative host (non-Netlify)

This adds a portable, self-contained backend so VERA can run on any host that
runs Node — **Render, Railway, Fly.io, a VPS/Docker box**, etc. — while the
existing **Netlify** deployment stays exactly as-is and untouched.

All finance is fictional / simulated. Nothing is a real bank or real money.

## What was added (nothing existing was changed / redesigned)

| File | Purpose |
|------|---------|
| `server.mjs` | Portable Node server. Serves the built SPA in `dist/` and exposes `POST /api` — the exact `{ action, args } -> { ok, result }` contract the client (`src/services/store.js`) already speaks. Runs the **same** `src/services/engine.js` as Netlify and the browser. |
| `render.yaml` | One-click Render Blueprint (web service + persistent disk). |
| `package.json` | Added `"start": "node server.mjs"` and `engines.node >= 18`. |

Unchanged and still Netlify's: `netlify.toml`, `netlify/functions/vera.mjs`,
`@netlify/blobs`. The Netlify project keeps working independently.

## How the requirements are met

- **React/Vite** — `npm run build` produces `dist/`, served by `server.mjs`.
- **Serverless-style functions / API endpoints** — `POST /api` dispatches
  actions (`register`, `login`, `transfer`, `findRecipient`, ...). Same actions
  as the Netlify Function.
- **Persistent shared storage** — one shared state file at `DATA_DIR`
  (`state-v2.json`), written atomically. Mount a persistent volume at
  `DATA_DIR` and it survives restarts & redeploys.
- **Cross-browser accounts + simulated transfers** — state is one shared object
  on the server, so a user created in one browser is found, paid and notified
  from another. Verified end-to-end (register in A -> find/transfer from B ->
  balances and records update on both sides).

## Option 1 — Render (recommended, matches your existing workflow)

1. Push this project to a Git repo (or reuse the current one).
2. In Render: **New +** -> **Blueprint** -> pick the repo. `render.yaml` sets:
   - build: `npm install && npm run build`
   - start: `node server.mjs`
   - env `DATA_DIR=/var/data` with a 1 GB persistent disk mounted there
   - `autoDeploy: false` (you deploy manually, like Netlify)
3. Deploy. Your app is at `https://<service>.onrender.com`.

Note: the persistent disk in `render.yaml` requires a paid instance
(Starter). On the free instance, remove the `disk:` block and drop
`DATA_DIR` — state is then still shared across all browsers while the instance
is running, but resets on restart/redeploy. For free durable storage instead,
point the app at Render Key Value or Render Postgres (see Option 3).

## Option 2 — Railway / Fly.io / any VPS or Docker

Same two commands, no platform-specific file needed:

```
npm install && npm run build      # build the SPA
npm start                         # === node server.mjs
```

Environment variables the server honours:

- `PORT`  — port to listen on (most PaaS set this automatically; default 3000)
- `HOST`  — bind address (default 0.0.0.0)
- `DATA_DIR` — folder for the shared state file (default `./data`); point this
  at a mounted volume for persistence.

Health check endpoint: `GET /healthz` -> `{ ok: true }`.

Minimal Dockerfile (if you containerize):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server.mjs"]
```

## Option 3 — Vercel (serverless + external store)

Vercel has no Netlify-Blobs equivalent, so it needs an external store for
shared state (Vercel KV / Upstash Redis, or Postgres). The API logic itself is
already portable: an `api/vera.js` route would `import { runAction, ensureState,
seedData } from '../src/services/engine.js'`, load/save the single state object
from KV instead of a file, and return `{ ok, result }`. If you want to go the
Vercel route, tell me and I'll add the `api/` function + KV wiring.

## Local check

```
npm run build
DATA_DIR=./data npm start
# open http://localhost:3000  (POST /api serves the shared backend)
```
