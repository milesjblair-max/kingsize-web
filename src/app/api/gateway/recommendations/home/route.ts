import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";
import { dbQueryOne } from "@/lib/db";
import type { ICatalogProduct } from "@kingsize/contracts";

// GET /api/gateway/recommendations/home
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get("ks_session_id")?.value;
        const catalog = getCatalogProvider();

        if (!sessionId) {
            // Anonymous user -> return generic teaser list
            try {
                const products = await catalog.listProducts({ limit: 8 });
                return NextResponse.json({
                    isAuthenticated: false,
                    recommendations: products,
                }, {
                    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
                });
            } catch (e) {
                console.error("[recs/home] Anonymous fetch failed", e);
                return NextResponse.json({ isAuthenticated: false, recommendations: [] });
            }
        }

        // Authenticated user -> Personalised
        // Fetch profile info via session
        let row;
        try {
            row = await dbQueryOne<{
                customer_id: string | null;
                fit_type: string | null;
                dimensions: string | null;
                style_preferences: string | null;
            }>(
                `SELECT s.customer_id, c.fit_type, c.dimensions, c.style_preferences
                 FROM sessions s
                 LEFT JOIN customers c ON c.id = s.customer_id
                 WHERE s.id = $1 LIMIT 1`,
                [sessionId]
            );
        } catch (dbErr) {
            console.error("[recs/home] DB query failed", dbErr);
            // Fallback to anonymous-like behavior if DB is down
            return NextResponse.json({ isAuthenticated: false, recommendations: [] });
        }

        const fitType = row?.fit_type ?? "big-tall";
        let preferredCategories: string[] = [];

        // Parse style preferences if available
        try {
            if (row?.style_preferences) {
                const prefs = JSON.parse(row.style_preferences);
                if (prefs.liked && Array.isArray(prefs.liked)) {
                    // simple mapping from liked cards to categories
                    const categories = prefs.liked.map((l: any) => l.category);
                    preferredCategories = [...new Set<string>(categories)];
                }
            }
        } catch { /* ignore parse errors */ }

        // Use fit type as primary filter
        let products: ICatalogProduct[] = [];
        try {
            products = await catalog.listProducts({ fit: fitType, limit: 12 });
        } catch (catalogErr) {
            console.error("[recs/home] Catalog fetch failed", catalogErr);
        }

        // If we have preferred categories, boost them
        if (preferredCategories.length > 0 && products.length > 0) {
            products = products.sort((a: ICatalogProduct, b: ICatalogProduct) => {
                const aMatch = a.categoryPaths.some(p => preferredCategories.some(pc => p.includes(pc)));
                const bMatch = b.categoryPaths.some(p => preferredCategories.some(pc => p.includes(pc)));
                return (aMatch === bMatch) ? 0 : aMatch ? -1 : 1;
            });
        }

        return NextResponse.json({
            isAuthenticated: true,
            fitType,
            recommendations: products.slice(0, 8),
        }, {
            headers: { "Cache-Control": "private, no-store, must-revalidate" }
        });
    } catch (globalErr) {
        console.error("[recs/home] Global crash", globalErr);
        return NextResponse.json({
            isAuthenticated: false,
            recommendations: [],
            error: "Service temporarily unavailable"
        });
    }
}
