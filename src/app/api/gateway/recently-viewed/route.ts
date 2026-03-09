import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";
import { dbQuery } from "@/lib/db";

// GET /api/gateway/recently-viewed
export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get("ks_session_id")?.value;
    const catalog = getCatalogProvider();

    if (!sessionId) {
        return NextResponse.json({
            recentlyViewed: [],
        }, {
            headers: { "Cache-Control": "private, no-store, must-revalidate" },
        });
    }

    try {
        // Get the most recent distinct products viewed by this session
        const rows = await dbQuery<{ entity_id: string; last_viewed: Date }>(
            `SELECT entity_id, MAX(created_at) as last_viewed
             FROM session_signals
             WHERE session_id = $1 
               AND signal_type = 'view' 
               AND entity_type = 'product'
             GROUP BY entity_id
             ORDER BY last_viewed DESC
             LIMIT 12`,
            [sessionId]
        );

        const viewedSlugs = rows.map(r => r.entity_id);

        if (viewedSlugs.length === 0) {
            return NextResponse.json({ recentlyViewed: [] }, {
                headers: { "Cache-Control": "private, no-store, must-revalidate" },
            });
        }

        // We fetch by slug. Let's do a fast map using the catalog list
        // In a real DB we'd use WHERE slug IN (...), but mock catalog needs manual filter
        const allProducts = await catalog.listProducts();

        // Filter and keep the order defined by `viewedSlugs`
        const matchedProducts = viewedSlugs
            .map(slug => allProducts.find(p => p.slug === slug || p.id === slug))
            .filter(Boolean); // removes undefined

        return NextResponse.json({
            recentlyViewed: matchedProducts,
        }, {
            headers: { "Cache-Control": "private, no-store, must-revalidate" }
        });

    } catch (e) {
        console.error("[api] Failed to fetch recently viewed", e);
        return NextResponse.json({ recentlyViewed: [] }, { status: 500 });
    }
}
