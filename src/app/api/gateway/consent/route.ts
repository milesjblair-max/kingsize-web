import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ConsentSchema, isKlaviyoMarketingAllowed } from "@/lib/consent";
import type { ConsentLevel } from "@/lib/consent";
import { dbQuery, dbQueryOne } from "@/lib/db";
import { cache } from "@/lib/cache";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";

const SESSION_COOKIE = "ks_session_id";

const UpdateConsentSchema = z.object({
    level: z.enum(["essential", "analytics", "marketing"]),
});

// GET — return consent state for the current session
export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ consentState: "essential" });
    }
    const cacheKey = `consent:${sessionId}`;
    const cached = await cache.get<ConsentLevel>(cacheKey);
    if (cached) return NextResponse.json({ consentState: cached }, { headers: { "X-Cache": "HIT" } });

    const row = await dbQueryOne<{ consent_state: string }>(
        "SELECT consent_state FROM sessions WHERE id = $1",
        [sessionId]
    );
    const level = (row?.consent_state ?? "essential") as ConsentLevel;
    await cache.set(cacheKey, level, 300);
    return NextResponse.json({ consentState: level });
}

// POST — update consent state
export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    let level: ConsentLevel;
    try {
        const body = await request.json();
        level = UpdateConsentSchema.parse(body).level;
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Persist to DB
    await dbQuery(
        `UPDATE sessions SET consent_state = $1, updated_at = NOW() WHERE id = $2`,
        [level, sessionId]
    );

    // Invalidate cache
    await cache.del(`consent:${sessionId}`);

    // If marketing consent granted: async sync to Klaviyo
    if (isKlaviyoMarketingAllowed(level)) {
        const klaviyo = getKlaviyoClient();
        // Look up customer email if linked
        const link = await dbQueryOne<{ email: string; klaviyo_profile_id: string }>(
            `SELECT c.email, kl.klaviyo_profile_id
             FROM klaviyo_links kl
             JOIN customers c ON c.id = kl.customer_id
             WHERE kl.session_id = $1 LIMIT 1`,
            [sessionId]
        );
        if (link?.email) {
            void klaviyo.upsertProfile({ email: link.email, consentState: level });
        }
    }

    return NextResponse.json({ success: true, consentState: level });
}
