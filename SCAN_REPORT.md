# Kingsize Web — Code Scan Report
_Generated: 2026-03-04_

## Summary

| Category | Severity | Status |
|---|---|---|
| PII stored in localStorage | 🔴 High | **Fixed** |
| Committed test artefacts in git | 🟡 Medium | **Fixed** |
| Binary brand logo assets in git | 🟡 Medium | **Fixed** |
| No typed API boundary (monolith) | 🔴 High | **Fixed** |
| Empty `next.config.ts` (no security headers) | 🔴 High | **Fixed** |
| Playwright requires manual dev server | 🟡 Medium | **Fixed** |
| LLM route has no rate limiting or validation | 🔴 High | **Fixed** |
| No `typecheck` or `test` scripts | 🟡 Medium | **Fixed** |
| No integration adapter abstraction | 🔴 High | **Fixed** |
| TypeScript typecheck | ✅ Passes | No errors |
| Next.js build | ✅ Passes | Exit 0, 21 routes |

---

## Detailed Findings & Changes

### 🔴 HIGH — PII in localStorage
**Before:** `AuthContext.tsx` wrote `email`, `firstName`, `lastName`, `mobile`, `waist`, `inseam`, and style preferences to `localStorage` — readable by any XSS payload, fails GDPR/APP.
**Fix:** All `localStorage` writes removed. Session is now server-authoritative — a random UUID is stored in an `httpOnly` cookie (`ks_session_id`). Profile data is stored server-side in `.data/profiles.json` (gitignored) behind `CustomerProfileRepository` (Postgres-ready interface).

### 🔴 HIGH — No Typed API Boundary
**Before:** Web UI imported services directly, no gateway layer existed. Swapping POS required rewriting the UI.
**Fix:** `packages/contracts/src/index.ts` defines `IProductProvider`, `IInventoryProvider`, `ICustomerProvider`. Gateway routes at `/api/gateway/*` expose a stable API. Mock and CounterIntelligence adapters built. Provider selected via `INTEGRATION_PROVIDER` env var.

### 🔴 HIGH — Empty `next.config.ts`
**Before:** No security headers, caching, image policy, or redirects.
**Fix:** Added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Caching: private for auth/account pages, 5-minute public for marketing pages, immutable for static assets. Vercel Blob + Cloudflare R2 added to image remote patterns.

### 🔴 HIGH — LLM Route Unguarded
**Before:** No input validation, no rate limiting, no telemetry.
**Fix:** `zod` validation on all inputs (rejects malformed payloads with 400). In-memory rate limiter: 5 requests/60s per IP, returns HTTP 429 with `Retry-After` header. Structured JSON telemetry on every request (provider used, fallback triggered, latency).

### 🔴 HIGH — No Integration Abstraction
**Before:** No provider interface — tightly coupled to no specific integration, making POS swap impossible.
**Fix:** `src/integrations/mock/` (local dev), `src/integrations/counterintelligence/` (production stub with clear implementation instructions). Adapter selection via env var.

### 🟡 MEDIUM — Committed Test Artefacts
**Before:** `tests/report/`, `tests/results/`, `tests/screenshots/` (90+ binary files) tracked in git.
**Fix:** Removed from git tracking with `git rm --cached`. Added to `.gitignore`.

### 🟡 MEDIUM — Binary Assets in Git
**Before:** `Brand Logos/` (48 PNG files) committed to repo.
**Fix:** Removed from git tracking. Added to `.gitignore`. Files remain on local disk. `ARCHITECTURE.md` notes these should be served from Cloudflare R2 / Vercel Blob.

### 🟡 MEDIUM — Playwright Manual Server Dependency
**Before:** `webServer: undefined` — tests silently failed unless dev server was manually running.
**Fix:** `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }` — server starts automatically. Added Mobile Chrome project for responsive regression detection.

### 🟡 MEDIUM — Missing Scripts
**Fix:** Added `"typecheck": "tsc --noEmit"` and `"test"` alias to `package.json`.

---

## Remaining / Out of Scope

- **Clerk/Auth0 integration**: Session abstraction is ready; Clerk middleware can replace `session/route.ts` with no UI changes.
- **Postgres CustomerProfileRepository**: Interface is defined; JSON-file implementation is local-dev only.
- **CounterIntelligence API implementation**: Stub boundary exists; fill in `CounterIntelligenceProductProvider` methods when credentials are available.
- **Cloudflare R2 asset migration**: Architecture supports it; bucket provisioning is a separate operational task.
- **npm audit**: 2 vulnerabilities (1 moderate, 1 high) remain in dev dependencies — run `npm audit fix` to auto-resolve.
