# Kingsize Web — Local Development Setup

## Prerequisites

- **Node.js 20+** (`node --version`)
- **npm 10+** (`npm --version`)
- **git**
- A **Neon Postgres** account (free tier is fine for dev) — https://neon.tech

---

## 1. Clone and install

```bash
git clone <repo-url> kingsize-web
cd kingsize-web
npm install
```

---

## 2. Set up environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Neon Postgres connection string (get from Neon dashboard → Connection Details)
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-2.aws.neon.tech/neondb?sslmode=require

# Use mock catalog locally (no Counter Intelligence POS needed)
MOCK_CI_ENABLED=true
INTEGRATION_PROVIDER=mock

# No LLM needed for basic dev
LLM_PROVIDER=fallback

# App URL for server-side fetch (server components call gateway via absolute URL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Set up the database

Run all migrations against your Neon dev database:

```bash
DATABASE_URL="<your-neon-connection-string>" npm run migrate
```

This creates all tables and seeds the mock product catalog.

---

## 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## 5. Verify everything works

| Check | URL |
|-------|-----|
| Homepage loads | http://localhost:3000 |
| Products display | http://localhost:3000 (ProductGrid section) |
| A PDP loads | http://localhost:3000/products/<any-slug> |
| Gateway responds | http://localhost:3000/api/gateway/products |

---

## Common Commands

```bash
npm run dev           # Start dev server (hot reload)
npm run build         # Production build (verify before pushing)
npm run typecheck     # TypeScript check (no emit)
npm run lint          # ESLint
npm test              # Playwright E2E tests (starts dev server automatically)
npm run migrate       # Run all DB migrations
```

---

## Running Tests

Playwright E2E tests start the Next.js dev server automatically:

```bash
npm test
```

To run with the UI (useful for debugging):

```bash
npm run test:ui
```

To update snapshots after intentional UI changes:

```bash
npm run test:ui:update
```

---

## Project Structure Quick Reference

- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/gateway/` — All data access routes (the only place DB/POS is touched)
- `src/features/` — UI feature modules (no direct DB access)
- `src/lib/` — Shared utilities (db, env, cache, consent)
- `src/integrations/` — POS adapters (mock and Counter Intelligence)
- `db/migrations/` — SQL migration files
- `packages/contracts/` — Shared TypeScript interfaces (`@kingsize/contracts`)

See `ARCHITECTURE.md` for the full system design.

---

## Troubleshooting

### Build fails: "Cannot find module 'geist/font/sans'"

```bash
npm install
```

### `DATABASE_URL` missing at startup

The app uses Zod validation and will throw immediately if `DATABASE_URL` is missing.
Make sure `.env.local` exists and contains a valid Neon connection string.

### "Failed to track view" in browser console

This means `/api/gateway/events/product-view` returned an error.
The `session_signals` table may not exist — run `npm run migrate`.

### Recommendations section shows error state

Check that the `sessions` and `profiles` tables exist (run migrations).
In logged-out state the section intentionally shows the logged-out UI (not an error).

### Port 3000 already in use

```bash
npx kill-port 3000
npm run dev
```

---

## Connecting to Counter Intelligence POS (optional)

To test with real CI POS data instead of the mock catalog:

```env
MOCK_CI_ENABLED=false
INTEGRATION_PROVIDER=counterintelligence
CI_API_URL=https://api.counterintelligence.com.au
CI_API_KEY=<your-key>
```

Contact the CI team for sandbox credentials.
