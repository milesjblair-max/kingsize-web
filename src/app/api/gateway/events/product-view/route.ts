import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

// POST /api/gateway/events/product-view
export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get("ks_session_id")?.value;

    if (!sessionId) {
        // Technically can't track without a session, but let's succeed quietly
        return NextResponse.json({ success: true, warning: "No session ID" });
    }

    try {
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ success: false, error: "Missing productId" }, { status: 400 });
        }

        // Insert into session_signals table
        await dbQuery(
            `INSERT INTO session_signals (session_id, signal_type, entity_type, entity_id)
             VALUES ($1, 'view', 'product', $2)`,
            [sessionId, productId]
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[api] Failed to record product view", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
