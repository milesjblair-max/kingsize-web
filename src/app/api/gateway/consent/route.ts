import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isKlaviyoMarketingAllowed } from "@/lib/consent";
import type { ConsentLevel } from "@/lib/consent";
import { sessionRepository } from "@/lib/SessionRepository";
import { userRepository } from "@/lib/UserRepository";
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

    const session = await sessionRepository.findById(sessionId);
    const level = session?.consentState ?? "essential";
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

    await sessionRepository.updateConsent(sessionId, level);
    await cache.del(`consent:${sessionId}`);

    // If marketing consent granted: async sync to Klaviyo
    if (isKlaviyoMarketingAllowed(level)) {
        const session = await sessionRepository.findById(sessionId);
        if (session?.userId) {
            const user = await userRepository.findById(session.userId);
            if (user?.email) {
                const klaviyo = getKlaviyoClient();
                void klaviyo.upsertProfile({ email: user.email, consentState: level });
            }
        }
    }

    return NextResponse.json({ success: true, consentState: level });
}
