# Kingsize Web — Architecture

## Overview

Kingsize Web is a headless e-commerce storefront for big & tall menswear built on **Next.js 16 App Router**, deployed on **Vercel**, with a **Neon Serverless Postgres** database (Sydney region, `ap-southeast-2`).

The core design principle: **the browser and server components NEVER access the database or external POS APIs directly. All data access goes through `/api/gateway/*` route handlers.**

```
Browser
  │
  ▼
Next.js App Router  (Vercel Serverless/Edge)
  │  Server Components → fetch /api/gateway/* (absolute URL via getBaseUrl())
  │  Client Components → fetch /api/gateway/* (relative URL)
  ▼
/api/gateway/*  ← single data-access entry point
  │
  ├── Provider Interface  ← swappable POS adapter
  │     ICatalogProvider / IProductProvider
  │     ├── Mock (Neon Postgres mock catalog)   MOCK_CI_ENABLED=true
  │     └── Counter Intelligence POS adapter   MOCK_CI_ENABLED=false
  │
  └── Neon Postgres  ← sessions, users, profiles, signals
```

---

## Directory Structure

```
kingsize-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              Root layout (Geist fonts, auth, fit providers)
│   │   ├── page.tsx                Homepage
│   │   ├── products/[slug]/        PDP (server component → gateway fetch)
│   │   ├── account/                Protected account page
│   │   ├── onboarding/             Fit preference onboarding (Framer Motion)
│   │   ├── login/                  Email/password auth
│   │   └── api/
│   │       ├── gateway/            ← ALL data access routes
│   │       │   ├── products/           GET list + GET ?slug=
│   │       │   ├── brands/             Brand listing
│   │       │   ├── categories/         Category tree
│   │       │   ├── recommendations/home/   Personalised homepage recs
│   │       │   ├── recently-viewed/        Session-scoped view history
│   │       │   ├── events/product-view/    Signal tracking (POST)
│   │       │   ├── customer/session/       Auth session (GET/DELETE)
│   │       │   ├── consent/                GDPR consent management
│   │       │   └── swipe/                  Swipe-to-preference UI signals
│   │       └── context/            GET /api/context — lightweight CustomerContext
│   │
│   ├── features/                   UI feature modules (no direct DB access)
│   │   ├── auth/                   AuthContext + AuthProvider
│   │   ├── fit/                    FitContext + FitProvider (big/tall/big-tall)
│   │   ├── hero/                   Homepage hero banner
│   │   ├── products/               ProductGrid + ProductDisplay (PDP)
│   │   ├── brands/                 BrandCarousel
│   │   ├── recommendation/         Recommendations widget
│   │   ├── recently-viewed/        RecentlyViewed widget
│   │   ├── navigation/             Top nav + mobile nav
│   │   ├── onboarding/             Framer Motion onboarding flow
│   │   └── cart/                   Cart UI (stub — not yet wired to POS)
│   │
│   ├── integrations/
│   │   ├── mock/                   Neon-backed mock catalog (dev + staging)
│   │   ├── ci/                     Counter Intelligence POS adapter (production)
│   │   └── counterintelligence/    CI API client
│   │
│   ├── lib/
│   │   ├── db.ts                   Neon serverless pg Pool + helpers
│   │   ├── env.ts                  Zod-validated environment variables (fails fast at startup)
│   │   ├── cache.ts                In-memory / Redis cache abstraction
│   │   └── consent.ts              ConsentLevel type
│   │
│   └── utils/
│       └── image.ts                getPrimaryImage() — fallback-safe image URL
│
├── db/
│   └── migrations/                 Sequential SQL files — run via npm run migrate
│       ├── 002_production_schema.sql   Schema baseline (users, sessions, profiles, …)
│       ├── 003_mock_catalog.sql        Mock products + catalog tables
│       └── 004_session_signals.sql     session_signals table (additive, safe to re-run)
│
├── packages/
│   └── contracts/                  @kingsize/contracts — shared TypeScript interfaces
│       └── src/index.ts            ICatalogProduct, ISwipeCandidate, ICatalogProvider, …
│
├── .github/workflows/ci.yml        GitHub Actions CI (lint → typecheck → build → Playwright)
└── next.config.ts                  Security headers (CSP, X-Frame-Options, …), image domains
```

---

## Key Interfaces (`@kingsize/contracts`)

| Interface | Purpose |
|-----------|---------|
| `ICatalogProduct` | Product from catalog (id, slug, title, brand, price, images, etc.) |
| `ISwipeCandidate` | Lightweight product for swipe preference UI |
| `ICatalogProvider` | `getProducts(opts)`, `getProductBySlug(slug)`, `getBrands()`, `getCategories()` |
| `IProductProvider` | `getProductById(id)` — deep product detail |

---

## Session & Auth

- Sessions tracked via `ks_session_id` httpOnly cookie (UUID, 30-day expiry, Secure in production, SameSite=Lax).
- Anonymous sessions are created automatically on first visit.
- Auth converts an anonymous session to authenticated by setting `sessions.user_id`.
- `AuthContext` (client-side) fetches `GET /api/gateway/customer/session` on mount.
- `profile.onboardingComplete = false` redirects the user to `/onboarding` after login.

---

## Provider / POS Toggle

```env
MOCK_CI_ENABLED=true    # Use Neon mock catalog (dev + staging default)
MOCK_CI_ENABLED=false   # Use Counter Intelligence POS adapter (production)
```

### How to swap the POS provider

1. Create `src/integrations/<your-system>/`
2. Implement `ICatalogProvider` from `@kingsize/contracts`
3. Register it in the gateway route handlers
4. Set `INTEGRATION_PROVIDER=<your-system>` and `MOCK_CI_ENABLED=false`
5. The web UI needs zero changes.

---

## Database Migrations

Migrations are plain SQL files in `db/migrations/` run sequentially:

```bash
npm run migrate   # runs all migrations against $DATABASE_URL
```

Each migration is idempotent (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`). The `schema_version` table tracks which migrations have been applied.

---

## Environment Variables

Full schema is in `src/lib/env.ts` (Zod — startup fails fast if misconfigured).

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | Neon Postgres connection string (required) |
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `LLM_PROVIDER` | `fallback` | `groq` / `huggingface` / `fallback` |
| `GROQ_API_KEY` | — | Required if `LLM_PROVIDER=groq` |
| `INTEGRATION_PROVIDER` | `mock` | `mock` / `counterintelligence` |
| `CI_API_URL` | — | Required if `INTEGRATION_PROVIDER=counterintelligence` |
| `CI_API_KEY` | — | Required if `INTEGRATION_PROVIDER=counterintelligence` |
| `MOCK_CI_ENABLED` | `true` | `true` = mock catalog, `false` = CI POS |
| `NEXT_PUBLIC_APP_URL` | — | Canonical URL (e.g. `https://kingsize.com.au`) |
