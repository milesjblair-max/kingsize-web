import { NextRequest, NextResponse } from "next/server";
import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";

const SESSION_COOKIE = "ks_session_id";

// Swipe category groups (maps fuzzy input → catalog category patterns)
const CATEGORY_GROUPS: Record<string, string[]> = {
    tops: ["polo", "t-shirt", "tee", "casual shirt", "business shirt", "activewear"],
    shorts: ["short", "swimwear"],
    casual: ["polo", "t-shirt", "tee", "casual shirt", "short"],
    all: ["polo", "t-shirt", "shirt", "short", "activewear", "swimwear"],
};

// GET /api/gateway/swipe/candidates?category=tops,shorts,casual&limit=12
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? "";
    const categoryParam = searchParams.get("category") ?? "all";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 30);

    // Expand category group strings → list of category patterns
    const rawCategories = categoryParam.split(",").map((c) => c.trim().toLowerCase());
    const expandedCategories = [...new Set(rawCategories.flatMap((c) => CATEGORY_GROUPS[c] ?? [c]))];

    try {
        const catalog = getCatalogProvider();
        const candidates = await catalog.getSwipeCandidates({
            categories: expandedCategories,
            limit,
            seed: sessionId, // stable shuffle per session
        });
        return NextResponse.json({ candidates, count: candidates.length }, {
            // Never cache personalised endpoints
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (err: any) {
        console.error("[gateway/swipe/candidates] GET error:", err.message);
        // Graceful degradation — return empty, onboarding falls back to static cards
        return NextResponse.json({ candidates: [], count: 0 }, { status: 200 });
    }
}
