import { NextRequest, NextResponse } from "next/server";
import { sessionRepository } from "@/lib/SessionRepository";
import { userRepository } from "@/lib/UserRepository";
import { dbQuery } from "@/lib/db";

const SESSION_COOKIE = "ks_session_id";

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    const session = await sessionRepository.findById(sessionId);
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, swipes, vector] = await Promise.all([
        userRepository.findById(session.userId),
        dbQuery<any>("SELECT product_id, action, created_at FROM swipe_events WHERE user_id = $1 ORDER BY created_at DESC", [session.userId]),
        dbQuery<any>("SELECT vector_embedding, updated_at FROM preference_vectors WHERE user_id = $1", [session.userId]),
    ]);

    const exportData = {
        exportedAt: new Date().toISOString(),
        site: "Kingsize",
        user: user ? { id: user.id, email: user.email, createdAt: user.createdAt } : null,
        profile: user?.profile ?? null,
        swipeHistory: swipes,
        preferenceVector: vector[0]?.vector_embedding ?? null,
    };

    return NextResponse.json(exportData, {
        headers: {
            "Content-Disposition": `attachment; filename="kingsize-data-export-${session.userId}.json"`
        }
    });
}
