/**
 * Counter Intelligence Product Provider
 * Production adapter for the CounterIntelligence (CIOFFICE/CIPOS) integration.
 *
 * HOW TO ACTIVATE:
 * 1. Set INTEGRATION_PROVIDER=counterintelligence in your .env
 * 2. Set CI_API_URL and CI_API_KEY in your .env
 * 3. Implement the methods below using the CI API documentation
 *
 * The interface contract (IProductProvider) must not change — only the implementation inside.
 */
import type { IProduct, IProductProvider } from "@kingsize/contracts";

export class CounterIntelligenceProductProvider implements IProductProvider {
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor() {
        this.apiUrl = process.env.CI_API_URL ?? "";
        this.apiKey = process.env.CI_API_KEY ?? "";
        if (!this.apiUrl || !this.apiKey) {
            console.warn("[CI] CI_API_URL or CI_API_KEY not set — CounterIntelligence provider will throw.");
        }
    }

    async getProducts(_filters?: { category?: string; brand?: string }): Promise<IProduct[]> {
        // TODO: Implement using CounterIntelligence API
        // Example: const res = await fetch(`${this.apiUrl}/products`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
        throw new Error(
            "[CounterIntelligenceProductProvider.getProducts] Not yet implemented. " +
            "Add CI_API_URL and CI_API_KEY to .env and implement this method."
        );
    }

    async getProductById(_id: string): Promise<IProduct | null> {
        // TODO: Implement using CounterIntelligence API
        throw new Error(
            "[CounterIntelligenceProductProvider.getProductById] Not yet implemented."
        );
    }
}
