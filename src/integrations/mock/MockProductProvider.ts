/**
 * Mock Product Provider
 * Used for local development and automated tests.
 * Implements IProductProvider — swap this with CounterIntelligenceProductProvider in production.
 */
import type { IProduct, IProductProvider } from "@kingsize/contracts";

const MOCK_PRODUCTS: IProduct[] = [
    {
        id: "mock-001",
        name: "Classic Polo Shirt",
        brand: "Kingsize",
        category: "Polo Shirts",
        price: 59.99,
        currency: "AUD",
        imageUrl: "/images/placeholder-polo.jpg",
        tags: ["casual", "polo", "cotton"],
        sizes: ["L", "XL", "2XL", "3XL", "4XL", "5XL"],
        inStock: true,
    },
    {
        id: "mock-002",
        name: "Straight Leg Chino",
        brand: "Kingsize",
        category: "Pants",
        price: 79.99,
        currency: "AUD",
        imageUrl: "/images/placeholder-chino.jpg",
        tags: ["casual", "chino", "stretch"],
        sizes: ["34", "36", "38", "40", "42", "44", "46", "48"],
        inStock: true,
    },
    {
        id: "mock-003",
        name: "Short Sleeve Linen Shirt",
        brand: "Kingsize",
        category: "Shirts",
        price: 69.99,
        currency: "AUD",
        imageUrl: "/images/placeholder-shirt.jpg",
        tags: ["casual", "linen", "summer"],
        sizes: ["L", "XL", "2XL", "3XL", "4XL"],
        inStock: false,
    },
];

export class MockProductProvider implements IProductProvider {
    async getProducts(filters?: { category?: string; brand?: string }): Promise<IProduct[]> {
        let results = MOCK_PRODUCTS;
        if (filters?.category) {
            results = results.filter((p) => p.category === filters.category);
        }
        if (filters?.brand) {
            results = results.filter((p) => p.brand === filters.brand);
        }
        return results;
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    }
}
