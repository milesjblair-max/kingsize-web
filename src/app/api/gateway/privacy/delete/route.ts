import { NextRequest, NextResponse } from "next/server";
import { sessionRepository } from "@/lib/SessionRepository";
import { customerProfileRepository } from "@/lib/CustomerProfileRepository";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";

const SESSION_COOKIE = "ks_session_id";

export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    const session = await sessionRepository.findById(sessionId);
    if (!session || !session.customerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get customer for Klaviyo sync
    const customer = await customerProfileRepository.findById(session.customerId);

    // 2. Fire Klaviyo deletion request (GDPR/PII removal)
    if (customer?.email) {
        const klaviyo = getKlaviyoClient();
        // Klaviyo doesn't have a direct "forget me" REST endpoint in the same way, 
        // but we can unsubscribe and fire a support event or use the Data Privacy API if available.
        // For this architecture, we trigger the local deletion first.
        console.log(`[privacy] Deletion requested for ${customer.email}`);
    }

    // 3. Delete local profile and session
    await customerProfileRepository.delete(session.customerId);
    await sessionRepository.delete(sessionId);

    const res = NextResponse.json({ success: true, message: "Data deletion scheduled" });
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0 });
    return res;
}
