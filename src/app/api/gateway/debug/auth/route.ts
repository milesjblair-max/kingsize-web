import { NextRequest, NextResponse } from "next/server";
import { sessionRepository } from "@/lib/SessionRepository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get("ks_session_id")?.value;
    const authDiagnostic: any = {
        hasSessionCookie: !!sessionId,
        sessionId: sessionId || null,
        sessionValid: false,
        userId: null,
        error: null
    };

    if (sessionId) {
        try {
            const session = await sessionRepository.findById(sessionId);
            if (session) {
                authDiagnostic.sessionValid = true;
                authDiagnostic.userId = session.userId || null;
            }
        } catch (e: any) {
            authDiagnostic.error = e.message || e.toString();
        }
    }

    return NextResponse.json(authDiagnostic);
}
