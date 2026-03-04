/**
 * GET /api/gateway/privacy/export
 * Stub: exports all first-party data for a customer (GDPR / APP Data Portability).
 */
import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne, dbQuery } from "@/lib/db";

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email query param required" }, { status: 400 });

    const customer = await dbQueryOne<{ id: string }>("SELECT id FROM customers WHERE email = $1", [email]);
    if (!customer) return NextResponse.json({ data: null, message: "No record found" });

    const [fitProfile, prefProfile, signals] = await Promise.all([
        dbQueryOne("SELECT * FROM fit_profiles WHERE customer_id = $1", [customer.id]),
        dbQueryOne("SELECT style_tags, category_affinity, brand_affinity FROM preference_profiles WHERE customer_id = $1", [customer.id]),
        dbQuery("SELECT signal_type, entity_label, created_at FROM session_signals ss JOIN sessions s ON s.id = ss.session_id WHERE s.customer_id = $1 ORDER BY ss.created_at DESC LIMIT 500", [customer.id]),
    ]);

    return NextResponse.json({
        data: { fitProfile, preferenceProfile: prefProfile, recentSignals: signals },
        generatedAt: new Date().toISOString(),
        note: "For full Klaviyo data export, visit your Klaviyo profile in the Klaviyo dashboard.",
    });
}
