# Personalisation Architecture

_How the Kingsize personalisation system is structured, what data lives where, and how a future acquirer can swap any component._

---

## System Boundary

```
Browser
  ↓  (only calls /api/* — never Klaviyo directly)
Next.js Gateway  (/api/context, /api/recommendations, /api/gateway/*)
  ↓
PersonalizationService  (ranking logic, snapshot management)
  ├── Postgres (sessions, signals, preference_profiles, snapshots)
  ├── In-memory LRU cache  (or Redis via REDIS_URL)
  └── KlaviyoClient  (async, fire-and-forget, consent-gated)
        └── Klaviyo REST API  (Profiles, Events, Catalogs)
```

**Rule: The browser never calls Klaviyo. The gateway is the only integration point.**

---

## What Data Lives Where

| Data | Store | Reason |
|---|---|---|
| Session ID (anonymous) | httpOnly cookie | No PII in browser |
| Consent state | Postgres `sessions` | Authoritative, auditable |
| Fit type / measurements | Postgres `fit_profiles` | First-party, portable |
| Style/brand/category affinity | Postgres `preference_profiles` | Platform-owned, not Klaviyo |
| Browsing signals (views, searches) | Postgres `session_signals` | First-party behavioural data |
| Recommendation snapshot | Postgres `recommendation_snapshots` + Cache | Fast page loads |
| Klaviyo profile ID link | Postgres `klaviyo_links` | Bridge only — source of truth stays in platform |
| Email marketing consent | Klaviyo (synced from platform) | Klaviyo is the CRM of record for outbound |
| Email / marketing events | Klaviyo `Events API` | Segment membership, flows, campaigns |
| Product catalogue | Klaviyo `Catalogs API` (synced) | Back-in-stock, abandoned cart flows |

**Important:** Affinities, swipe data, and fit profiles are owned by the platform. Klaviyo receives only what is needed for outbound marketing (events, profile attributes). Deleting a Klaviyo profile does not delete platform data — both must be cleared on a data deletion request.

---

## Consent Handling

```
essential  →  analytics  →  marketing
```

| Consent | Klaviyo Events | Klaviyo Profile Upsert | Platform Signals |
|---|---|---|---|
| essential | ❌ blocked | ❌ blocked | ✅ collected |
| analytics | ✅ sent | ✅ sent | ✅ collected |
| marketing | ✅ sent | ✅ sent (with marketing consent flag) | ✅ collected |

Consent is stored in `sessions.consent_state`. All gateway routes read this before making Klaviyo calls. Klaviyo calls are fire-and-forget — they never block page render.

---

## How to Swap Klaviyo

1. Create a new file: `src/integrations/<your-crm>/YourCrmClient.ts`
2. Implement the `IKlaviyoClient` interface from `src/integrations/klaviyo/KlaviyoClient.ts`:
   ```typescript
   export class YourCrmClient implements IKlaviyoClient {
       async upsertProfile(profile: KlaviyoProfile): Promise<void> { /* ... */ }
       async trackEvent(event: KlaviyoEvent): Promise<void> { /* ... */ }
       async syncCatalogItem(item: KlaviyoCatalogItem): Promise<void> { /* ... */ }
       async readConsentState(profileId: string): Promise<string | null> { /* ... */ }
       async getProfileIdByEmail(email: string): Promise<string | null> { /* ... */ }
   }
   ```
3. Update `getKlaviyoClient()` in `KlaviyoClient.ts` to return your implementation.
4. The gateway, consent routes, and PersonalizationService need **zero changes**.

---

## How to Swap the POS / Product Data Source

See `ARCHITECTURE.md`. In summary:

1. Implement `IProductProvider` in `src/integrations/<your-pos>/`.
2. Set `INTEGRATION_PROVIDER=<your-pos>` in env.
3. The PersonalizationService, recommendations endpoint, and all gateway routes use `IProductProvider` — the web UI is untouched.

---

## Performance Targets

| Endpoint | P95 Target | Strategy |
|---|---|---|
| `GET /api/context` | <200ms | In-memory cache, 5-min TTL |
| `GET /api/recommendations` | <300ms | DB snapshot (30 min anon, 4 hr auth) + in-memory |
| Klaviyo calls | Non-blocking | All calls are fire-and-forget (`void promise`) |

---

## Data Deletion / Export

- `POST /api/gateway/privacy/delete?email=` — deletes from Postgres (cascade), queues Klaviyo deletion
- `GET /api/gateway/privacy/export?email=` — exports all first-party data
- Klaviyo deletion: requires Klaviyo Data Privacy API (Enterprise plan). See: [Klaviyo Data Privacy Docs](https://developers.klaviyo.com/en/docs/data_privacy_apis)

---

## New Environment Variables

| Variable | Required | Description |
|---|---|---|
| `KLAVIYO_PRIVATE_KEY` | Production | REST API key for Profiles/Events/Catalogs |
| `KLAVIYO_PUBLIC_KEY` | Production | Public/site ID for Track API |
| `DATABASE_URL` | Production | Postgres (Supabase AU-Sydney recommended) |
| `REDIS_URL` | Optional | Redis for distributed cache (in-memory LRU if absent) |
