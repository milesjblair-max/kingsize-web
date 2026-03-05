import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";
import { dbQueryOne } from "@/lib/db";

// Helper to shuffle array safely
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// GET /api/gateway/recommendations/outfits
export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get("ks_session_id")?.value;
    const catalog = getCatalogProvider();

    if (!sessionId) {
        return NextResponse.json({ outfits: [] }, {
            headers: { "Cache-Control": "public, s-maxage=3600" },
        });
    }

    // Authenticated user -> Get Fit Type
    const row = await dbQueryOne<{ fit_type: string | null }>(
        `SELECT c.fit_type
         FROM sessions s
         JOIN customers c ON c.id = s.customer_id
         WHERE s.id = $1 LIMIT 1`,
        [sessionId]
    );

    const fitType = row?.fit_type ?? "big-tall";

    // Build some outfit groups based on their fit
    let products = await catalog.listProducts({ fit: fitType, limit: 30 });
    products = shuffle(products);

    // Group logic: 1 top + 1 bottom
    const tops = products.filter(p => !p.categoryPaths.some(c => c.toLowerCase().includes("short") || p.title.toLowerCase().includes("short")));
    const bottoms = products.filter(p => p.categoryPaths.some(c => c.toLowerCase().includes("short") || p.title.toLowerCase().includes("short")));

    const outfits = [];

    // Create up to 3 bundles
    for (let i = 0; i < Math.min(3, tops.length, bottoms.length); i++) {
        outfits.push({
            id: `outfit-${i}`,
            name: `Set ${i + 1}: ${tops[i].brand}`,
            products: [tops[i], bottoms[i]]
        });
    }

    return NextResponse.json({ outfits }, {
        headers: { "Cache-Control": "private, no-store, must-revalidate" }
    });
}
