# Kingsize Website Uplift - Architecture Overview

This project is set up to mimic the architecture of **Zalando**, but adapted for a single developer learning the ropes.

## The Goal
To create a "Micro-Frontend" style website where independent features are composed together to form a cohesive experience.

## Folder Structure

### 1. `src/features/` (The Fragments)
These are your building blocks. Each folder here is like a mini-application.
- **Hero**: The big banner at the top.
- **Navigation**: The menu and search.
- **Products**: The item lists.
- **Recommendations**: The "You might also like" section.
- **Cart**: The shopping cart.

### 2. `src/services/` (The Backend)
These "services" simulate fetching data from a real backend.
- **api.ts**: Generic data fetcher.
- **catalogue.ts**: Simulates the Product Service (fetching items).
- **cms.ts**: Simulates the Content Service (deciding layout).

### 3. `src/components/` (The Design System)
These are the shared "Lego blocks" that every feature uses.
- **ui**: Buttons, Cards, Inputs.
- **layout**: Grids, Containers.

## core Principles

1. **Isolation**: Features shouldn't depend on each other.
2. **Data-Driven**: Features should ask `services` for data, not hardcode it.
3. **Consistency**: Use `components` for all styling.

## Getting Started

1. Run the development server:
   ```bash
   npm run dev
   ```

## Database Setup (Production)

Kingsize uses **Postgres** for all durable customer data (users, profiles, swipe events).
The platform is designed to run stateless on Vercel — all state lives in the database.

### 1. Set DATABASE_URL in Vercel

Go to **Project → Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Postgres connection string (e.g. from [Supabase](https://supabase.com) or [Neon](https://neon.tech)) |

> **Tip:** For local dev, create a free Supabase project and use its connection string.
> The app has no filesystem fallback — it will throw a clear error at startup if `DATABASE_URL` is missing.

### 2. Run Migrations

Run the production schema migration against your database:

```bash
psql $DATABASE_URL -f db/migrations/002_production_schema.sql
```

This creates the following tables: `users`, `profiles`, `swipe_events`, `preference_vectors`, `sessions`, `schema_version`.

### 3. Verify Connectivity

After deploying, visit the health endpoint:

```
GET https://kingsize-web.vercel.app/api/gateway/debug/db
```

Expected response:
```json
{
  "status": "ok",
  "env": "production",
  "schema_version": 2,
  "db_time": "2026-03-05T04:00:00Z"
}
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
3. Start editing files in `src/features/` to see changes.

---

## Global CDN & Privacy Architecture

Our global edge layer is powered by Cloudflare, sitting in front of the Next.js frontend (Vercel) and Node.js/Supabase backend (Sydney, AU).

### 1. Architecture Overview
**Traffic Flow:**
1. **Customer Request:** Hits the nearest Cloudflare Edge server (e.g., in Bahrain or Sydney).
2. **Edge Processing (Cloudflare):**
   - **Static Assets:** Served directly from Cloudflare cache.
   - **Anonymous HTML/SSR:** Served from Cloudflare cache (respecting Vercel's `Cache-Control` headers). 
   - **Personalized/Authenticated/Cart:** Cache instantly bypassed based on `ks_*` cookies.
3. **Dynamic Routing:** Cache-bypassed requests traverse Cloudflare's **Argo Smart Routing** backbone to reach Vercel or the Sydney Node.js API Gateway, minimizing latency.
4. **Third-Party Tags:** Cloudflare Zaraz evaluates the `ks_consent` cookie. If consent is granted, tracking scripts are executed at the edge, reducing client bloat and strictly enforcing privacy.

### 2. Actionable Implementation Steps

**Networking & Optimization:**
- **Proxy Status:** Enable Proxy (Orange Cloud).
- **SSL/TLS:** Full (Strict).
- **Argo Smart Routing:** Enable (crucial for Middle East markets to Sydney).
- **Tiered Caching:** Enable to prevent cache stampedes on Vercel.

**Modern Cache Rules:**
- **Rule 1 (Bypass sessions):** `Cookie` `matches regex` `(^|;) *(__Host-ks_session|ks_logged_in|ks_cart_token|__Host-ks_admin_session)=` -> Bypass Cache
- **Rule 2 (Static assets):** `URI Path` -> `Extension` `is in` `css, js, jpg, jpeg, png, webp, avif, svg, woff2` -> Eligible for cache

**Security Posture:**
- **Bot Management:** Super Bot Fight Mode (Block Definite Bots, Managed Challenge for Likely Bots).
- **Credential Stuffing Rate Limiting:** `/login` or `/api/auth` (5 req / min / IP -> Block).
- **Checkout Fraud Rate Limiting:** `/checkout` or `/api/payment` (10 req / min / IP -> Managed Challenge via Turnstile).
- **WAF:** Cloudflare Managed Ruleset (OWASP Core Ruleset) on moderate sensitivity.

### 3. Compliance Checklist (GDPR & APP)
- [ ] **Data Processing Agreement:** Execute Cloudflare’s standard DPA.
- [ ] **Consent Integration:** Ensure Next.js sets `ks_consent` cookie and verify Zaraz respects it.
- [ ] **IP Masking:** Configure Logpush to omit `ClientIP` or use pseudo-anonymization.
- [ ] **Query String Cleaning:** Use Transform Rules or custom Edge Workers to sanitize PII from URLs (e.g., `?email=test@test.com`).
