import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";

// GET /api/gateway/products?category=&brand=&fit=&q=&limit=&offset=
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const filters = {
        category: searchParams.get("category") ?? undefined,
        brand: searchParams.get("brand") ?? undefined,
        fit: searchParams.get("fit") ?? undefined,
        q: searchParams.get("q") ?? undefined,
        limit: searchParams.has("limit") ? parseInt(searchParams.get("limit")!) : 48,
        offset: searchParams.has("offset") ? parseInt(searchParams.get("offset")!) : 0,
    };

    try {
        const catalog = getCatalogProvider();
        const products = await catalog.listProducts(filters);
        return NextResponse.json({ products, count: products.length }, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err: unknown) {
        console.error("[gateway/products] GET error:", err instanceof Error ? err.message : err);
        return NextResponse.json({ products: [], count: 0, error: "Catalog unavailable" }, { status: 503 });
    }
}
