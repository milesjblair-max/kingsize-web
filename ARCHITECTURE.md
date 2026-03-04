# Kingsize Web Platform — Architecture

## Overview

This platform is built as a **layered architecture** with a clear separation between the customer experience (web UI) and the backend data platform (gateway + integrations). The design principle is: **a future buyer can swap any backend provider by implementing a single TypeScript interface**.

```
Browser
  └── apps/web (Next.js — customer experience only)
        └── calls only /api/gateway/* routes
              └── src/app/api/gateway/ (Gateway Layer)
                    └── src/integrations/
                          ├── mock/              ← Local dev & test
                          └── counterintelligence/ ← Production (real CIOFFICE/CIPOS)
```

---

## Layers

### 1. `apps/web` — Next.js Customer Experience
- Routes: `/`, `/new-in`, `/brands`, `/account`, `/login`, `/onboarding`, `/fit`, `/experience`, `/help`, `/contact`
- **Rule:** MUST only call gateway API routes (`/api/gateway/*`). No direct database or external service calls.
- User authentication is managed via **httpOnly session cookies** (no PII in localStorage).

### 2. `src/app/api/gateway/` — Gateway Layer
Stable API surface that the web UI depends on:

| Endpoint | Method | Description |
|---|---|---|
| `/api/gateway/products` | GET | Fetch product catalogue |
| `/api/gateway/customer/session` | GET / POST / DELETE | Login, logout, restore session |
| `/api/gateway/customer/onboarding` | POST | Save onboarding profile |
| `/api/llm` | POST | Style preference analysis (rate-limited, Zod-validated) |

### 3. `packages/contracts/src/index.ts` — Typed Contracts
All provider interfaces live here:
- `IProductProvider` — `getProducts()`, `getProductById()`
- `IInventoryProvider` — `getInventory()`, `isInStock()`
- `ICustomerProvider` — `getCustomer()`, `upsertCustomer()`
- `ICustomerProfileRepository` — `findByEmail()`, `upsert()`, `delete()`

### 4. `src/integrations/` — POS Adapters
Each adapter implements the interfaces above. Selection is controlled by the `INTEGRATION_PROVIDER` environment variable.

---

## How to Swap the POS Provider (Buyer Instructions)

If you are replacing CounterIntelligence with another POS/inventory system:

1. **Create a new folder:** `src/integrations/<your-system>/`
2. **Implement the interfaces** from `packages/contracts/src/index.ts`:
   ```typescript
   import type { IProductProvider } from "../../../packages/contracts/src";
   export class MySystemProductProvider implements IProductProvider {
       async getProducts() { /* call your API here */ }
       async getProductById(id: string) { /* call your API here */ }
   }
   ```
3. **Register it** in `src/app/api/gateway/products/route.ts`:
   ```typescript
   if (integration === "my-system") return new MySystemProductProvider();
   ```
4. **Set the env var:** `INTEGRATION_PROVIDER=my-system`
5. The web UI needs **zero changes**.

---

## Auth Architecture

Session is server-authoritative. No PII is stored in the browser.

```
1. User submits email → POST /api/gateway/customer/session
2. Server looks up or creates profile in CustomerProfileRepository
3. Server sets httpOnly cookie: ks_session_id=<uuid>
4. Browser stores ONLY the opaque session ID (no name, email, dimensions, etc.)
5. On page load → GET /api/gateway/customer/session → server reads cookie → returns safe profile subset
```

**To upgrade to Clerk/Auth0:**
- Replace `src/app/api/gateway/customer/session/route.ts` with Clerk middleware
- The `useAuth()` hook interface in `AuthContext.tsx` does not change

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `INTEGRATION_PROVIDER` | No (defaults to `mock`) | `mock` \| `counterintelligence` |
| `CI_API_URL` | If using CI | CounterIntelligence API base URL |
| `CI_API_KEY` | If using CI | CounterIntelligence API key |
| `LLM_PROVIDER` | No (defaults to `fallback`) | `groq` \| `huggingface` \| `fallback` |
| `GROQ_API_KEY` | If using Groq | Groq API key |
