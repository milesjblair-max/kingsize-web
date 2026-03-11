import { NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";

// GET /api/gateway/brands
export async function GET() {
    try {
        const catalog = getCatalogProvider();
        const brands = await catalog.listBrands();
        return NextResponse.json({ brands }, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
        });
    } catch (err: unknown) {
        console.error("[gateway/brands] GET error:", err instanceof Error ? err.message : err);
        return NextResponse.json({ brands: [] }, { status: 503 });
    }
}
