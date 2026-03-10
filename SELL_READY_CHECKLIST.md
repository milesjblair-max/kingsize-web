# Kingsize Web — Sell-Ready Checklist

Use this checklist before going live. Each item must be checked off by a human.

---

## Infrastructure

- [ ] **Neon Postgres** — production database created in `ap-southeast-2` (Sydney)
- [ ] **Migrations run** — `npm run migrate` executed against production `DATABASE_URL`
- [ ] **Vercel project** created and linked to the `main` branch
- [ ] **Custom domain** configured in Vercel (`kingsize.com.au`) with SSL
- [ ] **Environment variables** set in Vercel production environment (see below)
- [ ] **Neon staging branch** created for the `staging` Vercel environment

### Required production environment variables

| Variable | Set? |
|----------|------|
| `DATABASE_URL` | ☐ |
| `NODE_ENV=production` | ☐ |
| `LLM_PROVIDER` | ☐ |
| `GROQ_API_KEY` (if using Groq) | ☐ |
| `INTEGRATION_PROVIDER` | ☐ |
| `CI_API_URL` (if using CI POS) | ☐ |
| `CI_API_KEY` (if using CI POS) | ☐ |
| `MOCK_CI_ENABLED` | ☐ |
| `NEXT_PUBLIC_APP_URL=https://kingsize.com.au` | ☐ |

---

## Catalog & Products

- [ ] Products imported into the database (`npm run ingest:catalog`)
- [ ] Product images uploaded to Vercel Blob or Cloudflare R2
- [ ] Image domains added to `next.config.ts` `remotePatterns`
- [ ] At least one product page (`/products/<slug>`) loads and displays correctly
- [ ] Product prices display correctly (correct currency, no $0 or NaN)

---

## Authentication & User Flows

- [ ] Login page (`/login`) accepts email and password
- [ ] Session cookie set correctly (httpOnly, Secure, SameSite=Lax)
- [ ] Onboarding flow (`/onboarding`) completes and sets `onboardingComplete = true`
- [ ] Account page (`/account`) loads for authenticated users without redirect loop
- [ ] Logout clears session and redirects to homepage
- [ ] Anonymous browsing works (no forced login wall)

---

## Homepage

- [ ] Hero section renders
- [ ] Brand carousel displays brands from the database
- [ ] Product grid displays real products (not placeholder data)
- [ ] Recommendations section handles logged-out state gracefully (no error flash)
- [ ] Recently Viewed appears only after a product has been viewed

---

## Product Detail Page (PDP)

- [ ] PDP loads at `/products/<slug>`
- [ ] Product title, brand, price, and image display correctly
- [ ] Image fallback handles missing images without layout break
- [ ] "Back to Homepage" link works
- [ ] Product view is tracked (POST to `/api/gateway/events/product-view` succeeds)

---

## Performance

- [ ] Lighthouse score ≥ 75 on homepage (mobile)
- [ ] Lighthouse score ≥ 75 on PDP (mobile)
- [ ] No layout shift on image load (explicit `fill` + `sizes` on all Next.js Images)
- [ ] No unhandled console errors in production build

---

## Security

- [ ] Security headers present on all pages (verify with securityheaders.com):
  - [ ] `Content-Security-Policy`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy`
  - [ ] `Permissions-Policy`
- [ ] `npm audit --audit-level=high` returns no vulnerabilities
- [ ] No secrets committed to git (`git log --all --oneline | head -20` + `git secret scan`)
- [ ] `.env.local` and `.env` are in `.gitignore` and not tracked

---

## CI/CD

- [ ] GitHub Actions CI pipeline (`.github/workflows/ci.yml`) passing on `main`
- [ ] PRs to `main` are blocked until CI passes (branch protection rule set in GitHub)
- [ ] Vercel preview deployments created for each PR

---

## Legal & Compliance

- [ ] Privacy policy page exists (or link to policy)
- [ ] Cookie consent banner implemented (GDPR/Australian Privacy Act)
- [ ] `GET /api/gateway/consent` and `POST /api/gateway/consent` functioning
- [ ] Terms & conditions accessible

---

## DNS & Email

- [ ] DNS records pointing to Vercel (`A` or `CNAME`)
- [ ] `www.kingsize.com.au` redirects to `kingsize.com.au` (or vice versa)
- [ ] Transactional email configured if any email flows exist

---

## Known Gaps (LOW priority — post-launch)

- [ ] PDP: Add colour swatches, size selector, accordion sections
- [ ] PDP: Show real `product.descriptionHtml` instead of placeholder text
- [ ] Cart: Wire "Add to Bag" button to actual cart/checkout flow
- [ ] CSP: Tighten from `unsafe-inline`/`unsafe-eval` to nonce-based policy (requires Next.js middleware)
- [ ] `context/route.ts`: Update SQL join to use `users` table (currently queries `customers` which may not exist in production schema)
