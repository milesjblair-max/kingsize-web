/**
 * PersonalizationService
 *
 * Priority logic:
 *   Logged-in:  preference_profile + swipe history + browse history → inventory filter
 *   Logged-out: session_signals (fit selector + views + searches) → trending fallback
 *
 * All Klaviyo calls are async / fire-and-forget.
 * POS-agnostic: consumes IProductProvider, not CounterIntelligence specifics.
 */

import type { IProduct, IProductProvider } from "@kingsize/contracts";
import type { ConsentLevel } from "@/lib/consent";
import { isKlaviyoEventAllowed } from "@/lib/consent";
import { dbQuery, dbQueryOne } from "@/lib/db";
import { cache } from "@/lib/cache";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface StyleBundle {
    id: string;
    label: string;      // e.g. "Weekend Casual"
    tags: string[];
    products: IProduct[];
}

export interface IRecommendationResponse {
    heroPicks: IProduct[];           // top 12
    shopByStyleBundles: StyleBundle[]; // 3–6 bundles, 2–4 items each
    becauseYouLiked: IProduct[];     // swipe-based
    trendingInYourFit: IProduct[];   // big/tall trending
    meta: {
        fitType: string;
        isAuthenticated: boolean;
        computedAt: string;
        fromSnapshot: boolean;
    };
}

// ─── Snapshot TTLs ────────────────────────────────────────────────────────────

const TTL_ANON_SECS = 30 * 60;    // 30 min for anonymous
const TTL_AUTH_SECS = 4 * 60 * 60; // 4 hrs for logged-in

// ─── Bundle definitions (can be driven from CMS/DB in future) ────────────────

const BUNDLE_TEMPLATES = [
    { id: "weekend-casual", label: "Weekend Casual", tags: ["casual", "relaxed", "weekend"] },
    { id: "work-ready", label: "Work Ready", tags: ["formal", "office", "smart"] },
    { id: "active-comfort", label: "Active Comfort", tags: ["sport", "active", "stretch"] },
    { id: "summer-basics", label: "Summer Basics", tags: ["summer", "linen", "light"] },
    { id: "layering-up", label: "Layering Up", tags: ["winter", "layer", "heavy"] },
    { id: "classic-denim", label: "Classic Denim", tags: ["denim", "classic", "jeans"] },
];

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreProduct(
    product: IProduct,
    affinityTags: Record<string, number>,
    preferredCategories: string[],
    likedIds: string[]
): number {
    let score = 0;
    if (likedIds.includes(product.id)) score += 20;
    if (preferredCategories.includes(product.category)) score += 10;
    product.tags.forEach((tag) => { score += (affinityTags[tag] ?? 0); });
    if (product.inStock) score += 5;
    return score;
}

function buildBundles(products: IProduct[], count = 4): StyleBundle[] {
    if (products.length === 0) return [];
    return BUNDLE_TEMPLATES.slice(0, count).map((tmpl) => {
        const bundleProducts = products
            .filter((p) => p.tags.some((t) => tmpl.tags.includes(t)) && p.inStock)
            .slice(0, 4);
        // Fallback: take first N in-stock products if no tag match
        const items = bundleProducts.length >= 2
            ? bundleProducts
            : products.filter((p) => p.inStock).slice(0, 3);
        return { ...tmpl, products: items };
    }).filter((b) => b.products.length > 0);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class PersonalizationService {
    constructor(private readonly productProvider: IProductProvider) { }

    /** Main entry: compute or serve snapshot */
    async getRecommendations(opts: {
        sessionId: string;
        customerId?: string;
        fitType: string;
        consentLevel: ConsentLevel;
        forceRefresh?: boolean;
    }): Promise<IRecommendationResponse> {
        const cacheKey = opts.customerId
            ? `recs:cust:${opts.customerId}`
            : `recs:sess:${opts.sessionId}`;

        if (!opts.forceRefresh) {
            // 1. Try in-process cache (fastest)
            const cached = await cache.get<IRecommendationResponse>(cacheKey);
            if (cached) return { ...cached, meta: { ...cached.meta, fromSnapshot: true } };

            // 2. Try DB snapshot
            const snapshot = await dbQueryOne<{ payload: IRecommendationResponse; expires_at: string }>(
                `SELECT payload, expires_at FROM recommendation_snapshots
                 WHERE cache_key = $1 AND expires_at > NOW()`,
                [cacheKey]
            );
            if (snapshot) {
                const result = { ...snapshot.payload, meta: { ...snapshot.payload.meta, fromSnapshot: true } };
                const ttl = opts.customerId ? TTL_AUTH_SECS : TTL_ANON_SECS;
                await cache.set(cacheKey, result, ttl);
                return result;
            }
        }

        // 3. Compute fresh
        const result = await this.compute(opts);
        await this.persist(cacheKey, result, opts.customerId ? "auth" : "anon");
        return result;
    }

    private async compute(opts: {
        sessionId: string;
        customerId?: string;
        fitType: string;
        consentLevel: ConsentLevel;
    }): Promise<IRecommendationResponse> {
        const allProducts = await this.productProvider.getProducts();
        const inStockProducts = allProducts.filter((p) => p.inStock);

        let affinityTags: Record<string, number> = {};
        let preferredCategories: string[] = [];
        let likedProductIds: string[] = [];

        if (opts.customerId) {
            // ── Logged-in: use preference_vectors for stored affinity ─────────
            const prefRow = await dbQueryOne<{ vector_embedding: any }>(
                `SELECT vector_embedding FROM preference_vectors WHERE user_id = $1 LIMIT 1`,
                [opts.customerId]
            );
            const embedding = typeof prefRow?.vector_embedding === "string"
                ? JSON.parse(prefRow.vector_embedding)
                : (prefRow?.vector_embedding ?? {});
            affinityTags = embedding.style_tags ?? {};
            preferredCategories = Object.entries((embedding.category_affinity ?? {}) as Record<string, number>)
                .sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 3).map(([k]) => k);
            // Liked product IDs from swipe_events
            const swipes = await dbQuery<{ product_id: string }>(
                `SELECT product_id FROM swipe_events WHERE user_id = $1 AND action = 'like' ORDER BY created_at DESC LIMIT 50`,
                [opts.customerId]
            );
            likedProductIds = swipes.map((s) => s.product_id);
        } else {
            // ── Logged-out: no persistent signals (anonymous) ─────────────────
            // Anonymous signals are kept client-side only in this architecture
        }

        // Score and rank all products
        const scored = inStockProducts.map((p) => ({
            product: p,
            score: scoreProduct(p, affinityTags, preferredCategories, likedProductIds),
        })).sort((a, b) => b.score - a.score);

        const heroPicks = scored.slice(0, 12).map((s) => s.product);
        const becauseYouLiked = likedProductIds.length > 0
            ? scored.filter((s) => likedProductIds.some((id) => s.product.tags.some((t) => inStockProducts.find((p) => p.id === id)?.tags.includes(t)))).slice(0, 8).map((s) => s.product)
            : [];

        // Trending in fit — for now: in-stock, tag-matched
        const fitTag = opts.fitType === "big" ? "big-fit" : opts.fitType === "tall" ? "tall-fit" : undefined;
        const trendingInYourFit = fitTag
            ? inStockProducts.filter((p) => p.tags.includes(fitTag)).slice(0, 8)
            : inStockProducts.slice(0, 8);

        const shopByStyleBundles = buildBundles(scored.map((s) => s.product), 4);

        const result: IRecommendationResponse = {
            heroPicks,
            shopByStyleBundles,
            becauseYouLiked,
            trendingInYourFit,
            meta: {
                fitType: opts.fitType,
                isAuthenticated: !!opts.customerId,
                computedAt: new Date().toISOString(),
                fromSnapshot: false,
            },
        };

        // Fire Klaviyo event async (consent-gated)
        if (opts.customerId && isKlaviyoEventAllowed(opts.consentLevel)) {
            // Look up email from users table
            const user = await dbQueryOne<{ email: string }>(
                "SELECT email FROM users WHERE id = $1",
                [opts.customerId]
            );
            if (user?.email) {
                void getKlaviyoClient().trackEvent({
                    event: "Onsite Recommendations Computed",
                    profileEmail: user.email,
                    properties: {
                        fit_type: opts.fitType,
                        hero_pick_count: heroPicks.length,
                        bundle_count: shopByStyleBundles.length,
                    },
                });
            }
        }

        return result;
    }

    private async persist(
        cacheKey: string,
        result: IRecommendationResponse,
        tier: "auth" | "anon"
    ): Promise<void> {
        const ttlSecs = tier === "auth" ? TTL_AUTH_SECS : TTL_ANON_SECS;
        await cache.set(cacheKey, result, ttlSecs);

        // Recommendations are cached in-memory/Redis only — no DB snapshot table
    }

    /** Update preference vectors and swipe events from swipe results */
    async applySwipeResults(opts: {
        customerId?: string;
        sessionId: string;
        liked: Array<{ id: string; category: string; tags: string[] }>;
        passed: Array<{ id: string; category: string; tags: string[] }>;
    }): Promise<void> {
        const tagCounts: Record<string, number> = {};
        const catCounts: Record<string, number> = {};

        opts.liked.forEach((c) => {
            c.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 2; });
            catCounts[c.category] = (catCounts[c.category] ?? 0) + 2;
        });
        opts.passed.forEach((c) => {
            c.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) - 1; });
        });

        if (opts.customerId) {
            // 1. Record individual swipe events
            for (const item of opts.liked) {
                await dbQuery(
                    `INSERT INTO swipe_events (user_id, product_id, action) VALUES ($1, $2, 'like')`,
                    [opts.customerId, item.id]
                );
            }
            for (const item of opts.passed) {
                await dbQuery(
                    `INSERT INTO swipe_events (user_id, product_id, action) VALUES ($1, $2, 'skip')`,
                    [opts.customerId, item.id]
                );
            }

            // 2. Update / merge preference_vectors
            const newEmbedding = JSON.stringify({
                style_tags: tagCounts,
                category_affinity: catCounts,
            });
            await dbQuery(
                `INSERT INTO preference_vectors (user_id, vector_embedding, updated_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                    vector_embedding = preference_vectors.vector_embedding || $2::jsonb,
                    updated_at = NOW()`,
                [opts.customerId, newEmbedding]
            );
            await cache.del(`recs:cust:${opts.customerId}`);
        } else {
            // Anonymous users — no DB persistence; swipe signals stay client-side
            await cache.del(`recs:sess:${opts.sessionId}`);
        }
    }

    /** Record a session signal (view, search, filter, category click)
     * NOTE: session_signals table not in production schema — busts cache only */
    async recordSignal(opts: {
        sessionId: string;
        signalType: string;
        entityType?: string;
        entityId?: string;
        entityLabel?: string;
        fitContext?: string;
    }): Promise<void> {
        // Bust recs snapshot so next load recomputes with new signal
        await cache.del(`recs:sess:${opts.sessionId}`);
    }
}
