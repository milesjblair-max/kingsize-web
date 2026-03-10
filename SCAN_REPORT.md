# Kingsize Big & Tall — Platform Scan Report

**Date:** 2026-03-10
**Branch:** claude/scan-and-fix-issues-PHy5U
**Auditor:** Claude Code automated scan + manual review

---

## Command Results

| Command | Result |
|---|---|
| `npm ci` | ✅ PASS |
| `npm run lint` | ❌ FAIL — 53 errors, 50 warnings |
| `npm run typecheck` | ✅ PASS |
| `npm run build` | ❌ FAIL — Google Fonts network unavailable in sandboxed build |
| `npm audit --production` | ✅ PASS — 0 vulnerabilities |

---

## ARCHITECTURE ISSUES

### CRITICAL

**ARCH-01 — PDP page bypasses API Gateway**
File: `src/app/products/[slug]/page.tsx` lines 1, 7–12
The product detail page directly imports and calls `getCatalogProvider()` from `@/integrations/ci/mockCiCatalog`. This is a direct database call from a UI page, completely bypassing the API gateway contract. Every other surface calls `/api/gateway/*` endpoints. This page is the only violation.

**ARCH-02 — `recommendations/home` route queries wrong table/column** — HIGH
File: `src/app/api/gateway/recommendations/home/route.ts` lines 38–43
SQL query joins `customers c ON c.id = s.customer_id`. The production schema (migration 002) uses `users` table and `sessions.user_id`. This silently returns null for all authenticated users — every logged-in user gets anonymous recommendations even if they have a fit profile.

**ARCH-03 — MOCK_CI_ENABLED vs INTEGRATION_PROVIDER naming inconsistency** — MEDIUM
File: `src/integrations/ci/mockCiCatalog.ts:39`; `src/lib/env.ts:19`
Two different env vars for the same toggle. `MOCK_CI_ENABLED` in mockCiCatalog.ts; `INTEGRATION_PROVIDER` validated in env.ts.

**ARCH-04 — Swipe route hard-codes MockProductProvider** — MEDIUM
File: `src/app/api/gateway/personalization/swipe/route.ts:45`
Creates `new MockProductProvider()` directly. When `MOCK_CI_ENABLED=false`, swipe still uses mock products.

**ARCH-05 — recently-viewed loads ALL products to find recent items** — LOW
File: `src/app/api/gateway/recently-viewed/route.ts:42`
Loads entire catalog into memory to filter by viewed slugs. Scales poorly.

---

## SECURITY AND PRIVACY ISSUES

**SEC-01 — Missing Content-Security-Policy header** — HIGH
File: `next.config.ts`
CSP header missing. XSS attacks not mitigated at HTTP layer.

**SEC-02 — sessionStorage used for recs caching with email as key** — MEDIUM
File: `src/features/recommendation/Recommendations.tsx:246`
Cache key `kingsize_recs_${profile.email}` stores user email in sessionStorage. Inconsistent with "no PII in client storage" principle.

**SEC-03 — Sessions use httpOnly cookies correctly** ✅
**SEC-04 — No secrets committed to repo** ✅

---

## DATABASE AND PERSISTENCE ISSUES

**DB-01 — `session_signals` table missing from production schema** — CRITICAL
Files: `src/app/api/gateway/events/product-view/route.ts:22`; `db/migrations/002_production_schema.sql`
Product-view tracking inserts into `session_signals` but this table is only in migration 001 (old schema). Migration 002 (production) omits it. Any deployment using only migration 002+003 will fail silently on every product view event.

**DB-02 — Migration 001 and 002 conflict** — HIGH
Migration 001 creates `sessions` with `customer_id` FK to `customers`. Migration 002 creates `sessions` with `user_id` FK to `users`. Migration 001 is the old schema, only 002+003 should be applied to production but this is not documented.

**DB-03 — No `npm run migrate` script** — HIGH
No standard migrate command. Developers must remember exact `psql` invocations.

**DB-04 — db.ts fails fast on missing DATABASE_URL** ✅
**DB-05 — All 6 required schema tables present** ✅

---

## IMAGE AND ASSET ISSUES

**IMG-01 — Large binary assets committed to git** — CRITICAL

| Folder | Size | In .gitignore |
|---|---|---|
| `FOR MILES-20260305T061547Z-3-001/` | 35 MB | ❌ NOT ignored |
| `ZIp Polo's 2025/` | 2.4 MB | ✅ In .gitignore but tracked |
| `Zip Short's 2025/` | 2.3 MB | ✅ In .gitignore but tracked |
| `Zip T-shirts 2025/` | 1.5 MB | ✅ In .gitignore but tracked |

Total committed binary bloat: ~41 MB. The `FOR MILES` folder is not in .gitignore at all.

**IMG-02 — getPrimaryImage() shared helper used consistently** ✅
**IMG-03 — next/image remote patterns may be incomplete** — LOW
**IMG-04 — Error fallbacks present on all image components** ✅

---

## ONBOARDING FLOW ISSUES

**OB-01 — Profile field mismatch breaks post-onboarding account redirect** — HIGH
Files: `src/app/api/gateway/customer/session/route.ts:51–58`; `src/app/account/page.tsx:537`
Session GET returns `{ profile: { onboardingDone: boolean } }` but AuthContext.UserProfile defines the field as `onboardingComplete: boolean`. Account page redirects to `/onboarding` when `!profile?.onboardingComplete` — since this is always undefined, every authenticated user visiting `/account` is redirected to `/onboarding` in an infinite loop.

**OB-02 — Garment measurement doubling is correct** ✅
**OB-03 — Swipe step uses real catalog images from gateway** ✅
**OB-04 — Swipe data persisted to DB via gateway** ✅

---

## HOMEPAGE ISSUES

**HOME-01 — ProductGrid uses hardcoded static data with no PDP links** — HIGH
File: `src/features/products/ProductGrid.tsx`
"New Arrivals" shows 4 hardcoded products. Cards are plain `div` elements — clicking does nothing. Data does not come from gateway.

**HOME-02 — No duplicate Shop by Fit section** ✅
**HOME-03 — Logged-out blurred recommendations render correctly** ✅
**HOME-04 — Recently Viewed section works correctly** ✅

---

## PRODUCT DETAIL PAGE ISSUES

**PDP-01 — PDP bypasses API gateway** (same as ARCH-01) — CRITICAL

**PDP-02 — PDP shows placeholder description text** — MEDIUM
File: `src/features/products/ProductDisplay.tsx:87`
Hard-coded: "A staple for your wardrobe, designed with premium materials built to last." Should render `product.descriptionHtml`.

**PDP-03 — PDP missing colour/size/accordions/trust modules** — MEDIUM
File: `src/features/products/ProductDisplay.tsx`
Minimal UI — missing colour swatches, size selector, expandable accordions (Details, Size & Fit, Material & Care, Delivery & Returns), trust modules.

**PDP-04 — Product view tracking fires through gateway** ✅

---

## ACCOUNT PAGE ISSUES

**ACC-01 — Account redirect loop** (same as OB-01) — HIGH
**ACC-02 — Left nav panel complete** ✅
**ACC-03 — Style redo link correct** ✅

---

## RESPONSIVE AND REGRESSION ISSUES

**RESP-01 — Playwright screenshot tests require baseline on first run** — LOW
**RESP-02 — Playwright state 4 test expects wrong testid** — HIGH
File: `tests/ui.spec.ts:233`
Test expects `data-testid="recs-error"` but component falls back to `loggedOut` state on API errors. The error state is unreachable.

**RESP-03 — Playwright starts dev server automatically** ✅
**RESP-04 — Test artefacts correctly excluded from git** ✅

---

## PERFORMANCE AND BUILD ISSUES

**BUILD-01 — Build fails without Google Fonts network access** — CRITICAL
File: `src/app/layout.tsx:2–3`
`import { Geist, Geist_Mono } from "next/font/google"` requires live internet at build time. Sandboxed/CI builds will fail.

**BUILD-02 — 53 lint errors** — HIGH
Key categories: `no-explicit-any` (35 occurrences), `prefer-const` (1), `no-require-imports` (2 in tmp/), `ban-ts-comment` (1 in terraform/).

**BUILD-03 — No GitHub Actions CI workflow** — CRITICAL
`.github/workflows/` directory does not exist. No automated checks on PRs. Merge to main is unprotected.

---

## RELEASE CHAIN AND ENVIRONMENT ISSUES

**REL-01 — No CI/CD pipeline** — CRITICAL
No `.github/workflows/` directory. No deployment automation.

**REL-02 — No two-environment setup documented** — HIGH
No documentation of staging vs production, Neon branching, Vercel project config.

**REL-03 — No rollback strategy documented** — HIGH

**REL-04 — No production branch protection** — HIGH
No branch protection rules documented or configured.

---

## Issue Summary

| ID | Severity | Status |
|---|---|---|
| ARCH-01 | CRITICAL | Fixed |
| IMG-01 | CRITICAL | Fixed |
| DB-01 | CRITICAL | Fixed |
| ARCH-02 | CRITICAL | Fixed |
| BUILD-01 | CRITICAL | Fixed |
| REL-01/BUILD-03 | CRITICAL | Fixed |
| OB-01/ACC-01 | HIGH | Fixed |
| HOME-01 | HIGH | Fixed |
| RESP-02 | HIGH | Fixed |
| DB-02/DB-03 | HIGH | Fixed |
| REL-02/REL-03 | HIGH | Fixed (RELEASE.md) |
| SEC-01 | HIGH | Fixed |
| BUILD-02 | HIGH | Partially fixed |
| ARCH-03 | MEDIUM | Fixed (env.ts) |
| PDP-02/PDP-03 | MEDIUM | Fixed |
| SEC-02 | MEDIUM | Fixed |
| ARCH-04 | MEDIUM | Documented |
| ARCH-05 | LOW | Documented |
| RESP-01 | LOW | Documented |
