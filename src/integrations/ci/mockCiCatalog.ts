/**
 * mockCiCatalog.ts
 *
 * Single-toggle adapter. Set MOCK_CI_ENABLED=true to use the Postgres mock catalog.
 * When CI credentials arrive, set MOCK_CI_ENABLED=false and the real CI provider
 * will be loaded instead (stub currently throws — replace CounterIntelligenceCatalogProvider).
 *
 * Usage:
 *   import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";
 *   const catalog = getCatalogProvider();
 */
import type { ICatalogProvider } from "@kingsize/contracts";
import { catalogRepository } from "./CatalogRepository";

// Lazy stub for real CI — add implementation when credentials arrive
class CounterIntelligenceCatalogProvider implements ICatalogProvider {
    async listProducts(_filters?: import("@kingsize/contracts").IProductFilters): Promise<import("@kingsize/contracts").ICatalogProduct[]> {
        throw new Error("[CI] Real Counter Intelligence provider not yet configured. Set MOCK_CI_ENABLED=true.");
    }
    async getProductBySlug(_slug: string): Promise<import("@kingsize/contracts").ICatalogProduct | null> {
        throw new Error("[CI] Real Counter Intelligence provider not yet configured.");
    }
    async listCategories(): Promise<{ path: string; count: number }[]> {
        throw new Error("[CI] Real Counter Intelligence provider not yet configured.");
    }
    async listBrands(): Promise<string[]> {
        throw new Error("[CI] Real Counter Intelligence provider not yet configured.");
    }
    async getSwipeCandidates(_opts: { categories: string[]; limit: number; seed?: string }): Promise<import("@kingsize/contracts").ISwipeCandidate[]> {
        throw new Error("[CI] Real Counter Intelligence provider not yet configured.");
    }
}

let _provider: ICatalogProvider | undefined;

export function getCatalogProvider(): ICatalogProvider {
    if (_provider) return _provider;

    const useMock = process.env.MOCK_CI_ENABLED !== "false"; // default: true if not set
    _provider = useMock ? catalogRepository : new CounterIntelligenceCatalogProvider();
    return _provider;
}

// Reset for tests
export function resetCatalogProvider() {
    _provider = undefined;
}
