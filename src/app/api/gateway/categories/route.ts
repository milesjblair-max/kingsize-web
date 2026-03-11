import { NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";

// GET /api/gateway/categories
export async function GET() {
    try {
        const catalog = getCatalogProvider();
        const categories = await catalog.listCategories();
        return NextResponse.json({ categories }, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
        });
    } catch (err: unknown) {
        console.error("[gateway/categories] GET error:", err instanceof Error ? err.message : err);
        return NextResponse.json({ categories: [] }, { status: 503 });
    }
}
