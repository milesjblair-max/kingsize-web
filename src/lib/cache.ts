/**
 * Cache layer
 * - If REDIS_URL is set: uses ioredis (you must `npm install ioredis`)
 * - Otherwise: in-process LRU map with TTL (no extra dependency)
 *
 * Interface is identical in both cases.
 */

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICache {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    del(key: string): Promise<void>;
    /** Returns whether the item was served from cache */
    getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<{ value: T; hit: boolean }>;
}

// ─── In-memory LRU (default — no dependency) ─────────────────────────────────

interface Entry {
    value: unknown;
    expiresAt: number;
}

const MAX_ENTRIES = 500;

class InMemoryCache implements ICache {
    private store = new Map<string, Entry>();

    private evict() {
        if (this.store.size <= MAX_ENTRIES) return;
        // Remove oldest 10%
        const toRemove = Math.ceil(MAX_ENTRIES * 0.1);
        let removed = 0;
        for (const key of this.store.keys()) {
            this.store.delete(key);
            if (++removed >= toRemove) break;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value as T;
    }

    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        this.evict();
        this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async getOrSet<T>(
        key: string,
        ttlSeconds: number,
        factory: () => Promise<T>
    ): Promise<{ value: T; hit: boolean }> {
        const cached = await this.get<T>(key);
        if (cached !== null) return { value: cached, hit: true };
        const value = await factory();
        await this.set(key, value, ttlSeconds);
        return { value, hit: false };
    }
}

// ─── Redis (optional — swap in when REDIS_URL is set) ────────────────────────

class RedisCache implements ICache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private client: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(client: any) {
        this.client = client;
    }

    async get<T>(key: string): Promise<T | null> {
        const raw = await this.client.get(key);
        if (!raw) return null;
        try { return JSON.parse(raw) as T; } catch { return null; }
    }

    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async getOrSet<T>(
        key: string,
        ttlSeconds: number,
        factory: () => Promise<T>
    ): Promise<{ value: T; hit: boolean }> {
        const cached = await this.get<T>(key);
        if (cached !== null) return { value: cached, hit: true };
        const value = await factory();
        await this.set(key, value, ttlSeconds);
        return { value, hit: false };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _cache: ICache | null = null;

export async function getCache(): Promise<ICache> {
    if (_cache) return _cache;
    if (process.env.REDIS_URL) {
        try {
            // ioredis is optional — install with `npm install ioredis` when REDIS_URL is set
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { default: Redis } = await import("ioredis");

            const client = new Redis(process.env.REDIS_URL);
            _cache = new RedisCache(client);
            console.log("[cache] Connected to Redis");
        } catch {
            console.warn("[cache] ioredis not installed — falling back to in-memory LRU");
            _cache = new InMemoryCache();
        }
    } else {
        _cache = new InMemoryCache();
        console.log("[cache] Using in-memory LRU cache");
    }
    return _cache;
}

export const cache = {
    async get<T>(key: string) { return (await getCache()).get<T>(key); },
    async set(key: string, value: unknown, ttl: number) { return (await getCache()).set(key, value, ttl); },
    async del(key: string) { return (await getCache()).del(key); },
    async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>) {
        return (await getCache()).getOrSet<T>(key, ttl, factory);
    },
};
