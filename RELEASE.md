# Kingsize Web — Release Process

A simple, one-developer release chain using GitHub + Vercel automatic deployments.

---

## Environments

| Environment | Branch | URL | Database |
|-------------|--------|-----|----------|
| **Production** | `main` | `https://kingsize.com.au` | Neon `main` branch |
| **Staging** | `staging` | `https://staging.kingsize.com.au` (Vercel preview) | Neon `staging` branch |

---

## Normal Release Flow

### 1. Develop on a feature branch

```bash
git checkout -b feat/my-feature
# make changes
git add <files>
git commit -m "feat: description of change"
git push -u origin feat/my-feature
```

### 2. Open a Pull Request → staging

- Open a PR targeting the `staging` branch.
- GitHub Actions CI runs automatically:
  - Lint (`npm run lint`)
  - Typecheck (`npm run typecheck`)
  - Build (`npm run build`)
  - Playwright E2E tests (`npm test`)
  - npm audit (high+ severity)
- **Do not merge until all checks are green.**

### 3. Merge to staging — auto-deploy to Vercel

- When the PR merges to `staging`, Vercel automatically deploys to the staging environment.
- Verify the deployed staging URL manually:
  - Homepage loads, products display
  - Login / onboarding flow works
  - Recommendations section loads (or shows the correct logged-out state)

### 4. Promote staging → main (production release)

```bash
git checkout main
git merge staging --no-ff -m "release: promote staging to production"
git push origin main
```

Or open a PR from `staging` → `main` for an audit trail.

Vercel automatically deploys `main` to production.

### 5. Verify production

- [ ] Homepage loads without errors
- [ ] A product page (PDP) loads at `/products/<slug>`
- [ ] Login and account page accessible
- [ ] Check Vercel function logs for any runtime errors

---

## Database Migrations

Run migrations **before** deploying code that depends on new schema:

```bash
# Set DATABASE_URL to the target environment's Neon connection string
DATABASE_URL="<neon-connection-string>" npm run migrate
```

**Order matters:** always migrate the database before pushing the code that uses it.

For staging, use the Neon `staging` branch connection string.
For production, use the Neon `main` branch connection string.

---

## Rollback

### Code rollback

Vercel keeps a deployment history. To roll back:
1. Go to Vercel dashboard → project → Deployments
2. Find the last good deployment
3. Click "Promote to Production"

Or via git:
```bash
git revert HEAD
git push origin main
```

### Database rollback

Each migration file has a ROLLBACK comment at the top with the exact SQL to undo it.

Example for migration 004:
```sql
DROP TABLE IF EXISTS session_signals;
DELETE FROM schema_version WHERE version = 4;
```

---

## Environment Variable Changes

1. Add/update the variable in Vercel dashboard (Settings → Environment Variables).
2. Re-deploy (Vercel picks up env var changes on next deployment).
3. Update `.env.example` in the repo so the next developer knows what's needed.

---

## CI Failure Triage

| Failure | Likely cause | Fix |
|---------|-------------|-----|
| Lint fails | ESLint rule violation | Run `npm run lint` locally, fix the issue |
| Typecheck fails | TypeScript error | Run `npm run typecheck` locally |
| Build fails | Missing env var / import error | Check build output; ensure all required env vars are set in CI |
| Playwright fails | UI regression or test env issue | Run `npm test` locally with `npm run dev` running |
| npm audit fails | New high-severity CVE | Run `npm audit fix` or update the affected package |
