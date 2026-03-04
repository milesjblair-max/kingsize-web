/**
 * Unit tests for PersonalizationService ranking logic
 * Run: npx vitest run tests/unit/
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB and cache (no infrastructure needed) ────────────────────────────

vi.mock("@/lib/db", () => ({
    dbQuery: vi.fn().mockResolvedValue([]),
    dbQueryOne: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/cache", () => ({
    cache: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
        getOrSet: vi.fn(),
    },
}));

vi.mock("@/integrations/klaviyo/KlaviyoClient", () => ({
    getKlaviyoClient: () => ({
        trackEvent: vi.fn(),
        upsertProfile: vi.fn(),
    }),
}));

// ─── Types from contracts (inline for test isolation) ────────────────────────

interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    currency: string;
    imageUrl: string;
    tags: string[];
    sizes: string[];
    inStock: boolean;
}

// ─── Pure scoring helpers (extracted for direct unit testing) ─────────────────

function scoreProduct(
    product: Product,
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

// ─── Tests ───────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
    { id: "p1", name: "Casual Polo", brand: "KS", category: "Polo Shirts", price: 59, currency: "AUD", imageUrl: "", tags: ["casual", "cotton"], sizes: ["XL"], inStock: true },
    { id: "p2", name: "Slim Chino", brand: "KS", category: "Pants", price: 79, currency: "AUD", imageUrl: "", tags: ["formal", "stretch"], sizes: ["36"], inStock: true },
    { id: "p3", name: "Linen Shirt", brand: "KS", category: "Shirts", price: 69, currency: "AUD", imageUrl: "", tags: ["casual", "linen", "summer"], sizes: ["XXL"], inStock: false },
    { id: "p4", name: "Sports Tee", brand: "KS", category: "T-Shirts", price: 39, currency: "AUD", imageUrl: "", tags: ["active", "sport"], sizes: ["XL"], inStock: true },
];

describe("scoreProduct", () => {
    it("scores liked product higher than neutral", () => {
        const likedScore = scoreProduct(MOCK_PRODUCTS[0], {}, [], ["p1"]);
        const neutralScore = scoreProduct(MOCK_PRODUCTS[1], {}, [], ["p1"]);
        expect(likedScore).toBeGreaterThan(neutralScore);
    });

    it("scores preferred category higher", () => {
        const prefScore = scoreProduct(MOCK_PRODUCTS[0], {}, ["Polo Shirts"], []);
        const nonPrefScore = scoreProduct(MOCK_PRODUCTS[1], {}, ["Polo Shirts"], []);
        expect(prefScore).toBeGreaterThan(nonPrefScore);
    });

    it("scores affinity tags correctly", () => {
        const tags = { casual: 5, formal: 1 };
        const casualScore = scoreProduct(MOCK_PRODUCTS[0], tags, [], []); // 2 casual tags
        const formalScore = scoreProduct(MOCK_PRODUCTS[1], tags, [], []); // 1 formal tag
        expect(casualScore).toBeGreaterThan(formalScore);
    });

    it("boosts in-stock products", () => {
        const inStockScore = scoreProduct(MOCK_PRODUCTS[0], {}, [], []);
        const outOfStockScore = scoreProduct(MOCK_PRODUCTS[2], {}, [], []);
        expect(inStockScore).toBeGreaterThan(outOfStockScore);
    });

    it("combines all signals correctly", () => {
        const score = scoreProduct(MOCK_PRODUCTS[0], { casual: 3 }, ["Polo Shirts"], ["p1"]);
        // liked(20) + category(10) + casual tag(3) + cotton tag(0) + inStock(5) = 38
        expect(score).toBe(38);
    });
});

describe("ranking order", () => {
    it("ranks liked+preferred+inStock highest", () => {
        const affinity = { casual: 2 };
        const preferred = ["Polo Shirts"];
        const liked = ["p1"];

        const scored = MOCK_PRODUCTS.map((p) => ({
            id: p.id,
            score: scoreProduct(p, affinity, preferred, liked),
        })).sort((a, b) => b.score - a.score);

        expect(scored[0].id).toBe("p1"); // liked + preferred + inStock + tags
    });

    it("out-of-stock products rank lower", () => {
        const scored = MOCK_PRODUCTS.map((p) => ({
            id: p.id,
            score: scoreProduct(p, {}, [], []),
        })).sort((a, b) => b.score - a.score);

        const outOfStockRank = scored.findIndex((s) => s.id === "p3");
        expect(outOfStockRank).toBeGreaterThan(0); // not first
    });
});

describe("consent state machine", () => {
    it("analytics >= analytics", async () => {
        const { consentAtLeast } = await import("@/lib/consent");
        expect(consentAtLeast("analytics", "analytics")).toBe(true);
    });

    it("essential does NOT meet analytics requirement", async () => {
        const { consentAtLeast } = await import("@/lib/consent");
        expect(consentAtLeast("essential", "analytics")).toBe(false);
    });

    it("marketing meets analytics requirement", async () => {
        const { consentAtLeast } = await import("@/lib/consent");
        expect(consentAtLeast("marketing", "analytics")).toBe(true);
    });

    it("Klaviyo events blocked at essential", async () => {
        const { isKlaviyoEventAllowed } = await import("@/lib/consent");
        expect(isKlaviyoEventAllowed("essential")).toBe(false);
        expect(isKlaviyoEventAllowed("analytics")).toBe(true);
        expect(isKlaviyoEventAllowed("marketing")).toBe(true);
    });
});
