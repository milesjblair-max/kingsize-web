import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";

// GET /api/gateway/products/:slug
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const catalog = getCatalogProvider();
        const product = await catalog.getProductBySlug(slug);
        if (!product) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ product }, {
            headers: {
                "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
            },
        });
    } catch (err: unknown) {
        console.error("[gateway/products/slug] GET error:", err instanceof Error ? err.message : err);
        return NextResponse.json({ error: "Product unavailable" }, { status: 503 });
    }
}
