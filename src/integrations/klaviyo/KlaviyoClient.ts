/**
 * KlaviyoClient
 * Gateway-only. The frontend must NEVER call Klaviyo directly.
 *
 * - All REST calls are fire-and-forget (async queued, never block page render)
 * - Rate-limit safety: exponential backoff on 429, circuit breaker on 5 failures/30s
 * - If KLAVIYO_PRIVATE_KEY is not set: all calls are no-op'd and logged
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KlaviyoProfile {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string; // our customers.id
    fitType?: string;
    consentState?: string;
    customProperties?: Record<string, unknown>;
}

export interface KlaviyoEvent {
    event: string; // e.g. "Onsite Viewed Product"
    profileEmail: string;
    properties?: Record<string, unknown>;
    time?: string; // ISO8601
}

export interface KlaviyoCatalogItem {
    catalogId?: string; // defaults to '$default'
    externalId: string; // our product id
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
    price?: number;
    published: boolean;
    customMetadata?: Record<string, unknown>;
}

export interface IKlaviyoClient {
    /** Create or update a Klaviyo profile (fire-and-forget) */
    upsertProfile(profile: KlaviyoProfile): Promise<void>;
    /** Fire a custom event (fire-and-forget) */
    trackEvent(event: KlaviyoEvent): Promise<void>;
    /** Sync an item to the Klaviyo catalog (fire-and-forget) */
    syncCatalogItem(item: KlaviyoCatalogItem): Promise<void>;
    /** Read suppression / consent state from Klaviyo for a profile */
    readConsentState(klaviyoProfileId: string): Promise<string | null>;
    /** Get Klaviyo profile id for an email (returns null if not found) */
    getProfileIdByEmail(email: string): Promise<string | null>;
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

class CircuitBreaker {
    private failures = 0;
    private readonly threshold = 5;
    private readonly windowMs = 30_000;
    private openAt: number | null = null;

    isOpen(): boolean {
        if (this.openAt === null) return false;
        if (Date.now() - this.openAt > this.windowMs) {
            this.reset();
            return false;
        }
        return true;
    }

    recordFailure() {
        this.failures += 1;
        if (this.failures >= this.threshold) {
            this.openAt = Date.now();
            console.warn("[klaviyo] Circuit breaker OPEN — too many failures");
        }
    }

    reset() {
        this.failures = 0;
        this.openAt = null;
    }
}

// ─── Real Klaviyo Client ──────────────────────────────────────────────────────

const KLAVIYO_BASE = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

async function klaviyoFetch(
    path: string,
    options: RequestInit,
    privateKey: string,
    retries = 3
): Promise<Response | null> {
    const url = `${KLAVIYO_BASE}${path}`;
    const headers = {
        "Authorization": `Klaviyo-API-Key ${privateKey}`,
        "Content-Type": "application/json",
        "revision": REVISION,
        ...(options.headers as Record<string, string> ?? {}),
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(8000) });

            if (res.status === 429) {
                const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
                const delay = Math.min((retryAfter + attempt) * 1000, 32_000);
                console.warn(`[klaviyo] 429 rate limited — backoff ${delay}ms (attempt ${attempt + 1})`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }

            return res;
        } catch (err) {
            const delay = Math.pow(2, attempt) * 500;
            console.warn(`[klaviyo] Fetch error attempt ${attempt + 1}: ${err} — retrying in ${delay}ms`);
            if (attempt < retries) await new Promise((r) => setTimeout(r, delay));
        }
    }
    return null;
}

class KlaviyoRestClient implements IKlaviyoClient {
    private readonly privateKey: string;
    private readonly cb = new CircuitBreaker();

    constructor(privateKey: string) {
        this.privateKey = privateKey;
    }

    private async fire(path: string, options: RequestInit): Promise<void> {
        if (this.cb.isOpen()) {
            console.warn("[klaviyo] Circuit open — skipping call to", path);
            return;
        }
        const res = await klaviyoFetch(path, options, this.privateKey);
        if (!res || !res.ok) {
            this.cb.recordFailure();
            if (res) console.error(`[klaviyo] ${path} → ${res.status}`);
        } else {
            this.cb.reset();
        }
    }

    async upsertProfile(profile: KlaviyoProfile): Promise<void> {
        const body = {
            data: {
                type: "profile",
                attributes: {
                    email: profile.email,
                    phone_number: profile.phone,
                    first_name: profile.firstName,
                    last_name: profile.lastName,
                    external_id: profile.externalId,
                    properties: {
                        fit_type: profile.fitType,
                        consent_state: profile.consentState,
                        ...profile.customProperties,
                    },
                },
            },
        };
        // Fire async — never await on the critical path
        void this.fire("/profile-import/", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async trackEvent(event: KlaviyoEvent): Promise<void> {
        const body = {
            data: {
                type: "event",
                attributes: {
                    properties: event.properties ?? {},
                    time: event.time ?? new Date().toISOString(),
                    metric: { data: { type: "metric", attributes: { name: event.event } } },
                    profile: { data: { type: "profile", attributes: { email: event.profileEmail } } },
                },
            },
        };
        void this.fire("/events/", { method: "POST", body: JSON.stringify(body) });
    }

    async syncCatalogItem(item: KlaviyoCatalogItem): Promise<void> {
        const catalogId = item.catalogId ?? "$default";
        const body = {
            data: {
                type: "catalog-item",
                id: `${catalogId}:::${item.externalId}`,
                attributes: {
                    external_id: item.externalId,
                    title: item.title,
                    description: item.description ?? "",
                    url: item.url,
                    image_full_url: item.imageUrl,
                    price: item.price,
                    published: item.published,
                    custom_metadata: item.customMetadata ?? {},
                },
            },
        };
        void this.fire(`/catalog-items/${catalogId}:::${item.externalId}/`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    async readConsentState(klaviyoProfileId: string): Promise<string | null> {
        const res = await klaviyoFetch(
            `/profiles/${klaviyoProfileId}/?fields[profile]=subscriptions`,
            { method: "GET" },
            this.privateKey
        );
        if (!res?.ok) return null;
        const data = await res.json();
        const emailSub = data?.data?.attributes?.subscriptions?.email;
        if (emailSub?.marketing?.consent === "SUBSCRIBED") return "marketing";
        if (emailSub?.email?.consent === "SUBSCRIBED") return "analytics";
        return "essential";
    }

    async getProfileIdByEmail(email: string): Promise<string | null> {
        const encoded = encodeURIComponent(`equals(email,"${email}")`);
        const res = await klaviyoFetch(
            `/profiles/?filter=${encoded}&fields[profile]=id`,
            { method: "GET" },
            this.privateKey
        );
        if (!res?.ok) return null;
        const data = await res.json();
        return data?.data?.[0]?.id ?? null;
    }
}

// ─── No-op client (when keys not set) ────────────────────────────────────────

class NoOpKlaviyoClient implements IKlaviyoClient {
    private warn(method: string) {
        console.log(`[klaviyo][noop] ${method} — no KLAVIYO_PRIVATE_KEY set`);
    }
    async upsertProfile(_p: KlaviyoProfile) { this.warn("upsertProfile"); }
    async trackEvent(_e: KlaviyoEvent) { this.warn("trackEvent"); }
    async syncCatalogItem(_i: KlaviyoCatalogItem) { this.warn("syncCatalogItem"); }
    async readConsentState(_id: string) { this.warn("readConsentState"); return null; }
    async getProfileIdByEmail(_email: string) { this.warn("getProfileIdByEmail"); return null; }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _klaviyo: IKlaviyoClient | null = null;

export function getKlaviyoClient(): IKlaviyoClient {
    if (_klaviyo) return _klaviyo;
    const key = process.env.KLAVIYO_PRIVATE_KEY;
    _klaviyo = key ? new KlaviyoRestClient(key) : new NoOpKlaviyoClient();
    return _klaviyo;
}
