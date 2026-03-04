import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isKlaviyoEventAllowed } from "@/lib/consent";
import type { ConsentLevel } from "@/lib/consent";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";
import { dbQueryOne } from "@/lib/db";

const SESSION_COOKIE = "ks_session_id";

const EventSchema = z.object({
    event: z.string().max(100),
    properties: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    let body: z.infer<typeof EventSchema>;
    try {
        body = EventSchema.parse(await request.json());
    } catch {
        return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    // Resolve session consent + customer email
    const row = await dbQueryOne<{
        consent_state: string;
        email: string | null;
    }>(
        `SELECT s.consent_state, c.email
         FROM sessions s
         LEFT JOIN customers c ON c.id = s.customer_id
         WHERE s.id = $1 LIMIT 1`,
        [sessionId]
    );

    const consentLevel = (row?.consent_state ?? "essential") as ConsentLevel;

    // Consent gate — never send to Klaviyo if consent < analytics
    if (!isKlaviyoEventAllowed(consentLevel)) {
        console.log(`[klaviyo] blocked by consent (${consentLevel}) — event: ${body.event}`);
        return NextResponse.json({ success: true, sent: false, reason: "consent_block" });
    }

    if (!row?.email) {
        return NextResponse.json({ success: true, sent: false, reason: "no_profile" });
    }

    void getKlaviyoClient().trackEvent({
        event: body.event,
        profileEmail: row.email,
        properties: body.properties,
    });

    return NextResponse.json({ success: true, sent: true });
}
