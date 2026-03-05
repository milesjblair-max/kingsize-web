import { NextRequest, NextResponse } from "next/server";
import { sessionRepository } from "@/lib/SessionRepository";
import { userRepository } from "@/lib/UserRepository";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";

const SESSION_COOKIE = "ks_session_id";

export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    const session = await sessionRepository.findById(sessionId);
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userRepository.findById(session.userId);
    if (user) {
        const klaviyo = getKlaviyoClient();
        console.log(`[privacy] Deletion requested for user ${user.id} (${user.email})`);
        // Trigger Klaviyo profile suppression (fire-and-forget)
        void klaviyo.upsertProfile({ email: user.email, consentState: "essential" });
    }

    // Delete user (CASCADE removes profiles, sessions, swipe_events, preference_vectors)
    await userRepository.delete(session.userId);

    const res = NextResponse.json({ success: true, message: "Your data has been deleted." });
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0 });
    return res;
}
