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
            // ── Logged-in: use preference profile ────────────────────────────
            const prefRow = await dbQueryOne<{
                style_tags: Record<string, number>;
                category_affinity: Record<string, number>;
                liked_product_ids: string[];
            }>(
                `SELECT style_tags, category_affinity, liked_product_ids
                 FROM preference_profiles WHERE customer_id = $1 LIMIT 1`,
                [opts.customerId]
            );
            affinityTags = prefRow?.style_tags ?? {};
            preferredCategories = Object.entries(prefRow?.category_affinity ?? {})
                .sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k);
            likedProductIds = prefRow?.liked_product_ids ?? [];
        } else {
            // ── Logged-out: aggregate session signals ─────────────────────────
            const signals = await dbQuery<{
                entity_type: string;
                entity_label: string;
                signal_type: string;
            }>(
                `SELECT entity_type, entity_label, signal_type
                 FROM session_signals WHERE session_id = $1 ORDER BY created_at DESC LIMIT 100`,
                [opts.sessionId]
            );
            signals.forEach((sig) => {
                if (sig.entity_type === "category" && sig.entity_label) {
                    affinityTags[sig.entity_label] = (affinityTags[sig.entity_label] ?? 0) + 2;
                }
            });
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
            // Look up email for the event
            const customer = await dbQueryOne<{ email: string }>(
                "SELECT email FROM customers WHERE id = $1",
                [opts.customerId]
            );
            if (customer?.email) {
                void getKlaviyoClient().trackEvent({
                    event: "Onsite Recommendations Computed",
                    profileEmail: customer.email,
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

        const expiresAt = new Date(Date.now() + ttlSecs * 1000).toISOString();
        await dbQuery(
            `INSERT INTO recommendation_snapshots (cache_key, payload, expires_at, fit_type)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (cache_key) DO UPDATE
             SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at,
                 computed_at = NOW(), fit_type = EXCLUDED.fit_type`,
            [cacheKey, JSON.stringify(result), expiresAt, result.meta.fitType]
        );
    }

    /** Update preference profile from swipe results */
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

        const likedIds = opts.liked.map((c) => c.id);

        if (opts.customerId) {
            await dbQuery(
                `INSERT INTO preference_profiles
                    (customer_id, style_tags, category_affinity, liked_product_ids)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (customer_id)
                 DO UPDATE SET
                    style_tags = preference_profiles.style_tags || EXCLUDED.style_tags,
                    category_affinity = preference_profiles.category_affinity || EXCLUDED.category_affinity,
                    liked_product_ids = array_cat(preference_profiles.liked_product_ids, EXCLUDED.liked_product_ids),
                    updated_at = NOW()`,
                [opts.customerId, JSON.stringify(tagCounts), JSON.stringify(catCounts), likedIds]
            );
            // Bust snapshot
            await cache.del(`recs:cust:${opts.customerId}`);
        } else {
            await dbQuery(
                `INSERT INTO preference_profiles (session_id, style_tags, category_affinity, liked_product_ids)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (session_id)
                 DO UPDATE SET
                    style_tags = preference_profiles.style_tags || EXCLUDED.style_tags,
                    category_affinity = preference_profiles.category_affinity || EXCLUDED.category_affinity,
                    liked_product_ids = array_cat(preference_profiles.liked_product_ids, EXCLUDED.liked_product_ids),
                    updated_at = NOW()`,
                [opts.sessionId, JSON.stringify(tagCounts), JSON.stringify(catCounts), likedIds]
            );
            await cache.del(`recs:sess:${opts.sessionId}`);
        }
    }

    /** Record a session signal (view, search, filter, category click) */
    async recordSignal(opts: {
        sessionId: string;
        signalType: string;
        entityType?: string;
        entityId?: string;
        entityLabel?: string;
        fitContext?: string;
    }): Promise<void> {
        await dbQuery(
            `INSERT INTO session_signals
                (session_id, signal_type, entity_type, entity_id, entity_label, fit_context)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [opts.sessionId, opts.signalType, opts.entityType, opts.entityId, opts.entityLabel, opts.fitContext]
        );
        // Bust recs snapshot so next load recomputes with new signal
        await cache.del(`recs:sess:${opts.sessionId}`);
    }
}
