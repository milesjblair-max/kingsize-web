import { NextRequest, NextResponse } from "next/server";
import { sessionRepository } from "@/lib/SessionRepository";
import { customerProfileRepository } from "@/lib/CustomerProfileRepository";
import { dbQuery } from "@/lib/db";

const SESSION_COOKIE = "ks_session_id";

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    const session = await sessionRepository.findById(sessionId);
    if (!session || !session.customerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gather all PII for export
    const profile = await customerProfileRepository.findById(session.customerId);
    const preferences = await dbQuery(
        "SELECT * FROM preference_profiles WHERE customer_id = $1",
        [session.customerId]
    );
    const signals = await dbQuery(
        "SELECT * FROM session_signals WHERE session_id = $1",
        [sessionId]
    );

    const exportData = {
        profile,
        preferences,
        signals,
        exportedAt: new Date().toISOString(),
        site: "Kingsize"
    };

    return NextResponse.json(exportData, {
        headers: {
            "Content-Disposition": `attachment; filename="kingsize-data-export-${session.customerId}.json"`
        }
    });
}
