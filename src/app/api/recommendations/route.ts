/**
 * GET /api/recommendations
 * Returns ranked products and style bundles for the current session/user.
 * Target: <300ms P95 (served from snapshot on repeat requests)
 */
import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne } from "@/lib/db";
import { PersonalizationService } from "@/services/PersonalizationService";
import { MockProductProvider } from "@/integrations/mock/MockProductProvider";
import { CounterIntelligenceProductProvider } from "@/integrations/counterintelligence/CounterIntelligenceProductProvider";
import type { IProductProvider } from "@kingsize/contracts";
import type { ConsentLevel } from "@/lib/consent";

const SESSION_COOKIE = "ks_session_id";

function getProductProvider(): IProductProvider {
    return process.env.INTEGRATION_PROVIDER === "counterintelligence"
        ? new CounterIntelligenceProductProvider()
        : new MockProductProvider();
}

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

    if (!sessionId) {
        // No session: return trending / default recs
        const svc = new PersonalizationService(getProductProvider());
        const result = await svc.getRecommendations({
            sessionId: "anonymous",
            fitType: "big-tall",
            consentLevel: "essential",
        });
        return NextResponse.json(result);
    }

    // Resolve session → customer
    const row = await dbQueryOne<{
        consent_state: string;
        customer_id: string | null;
        fit_type: string | null;
    }>(
        `SELECT s.consent_state, s.customer_id, c.fit_type
         FROM sessions s
         LEFT JOIN customers c ON c.id = s.customer_id
         WHERE s.id = $1 LIMIT 1`,
        [sessionId]
    );

    const fitType = row?.fit_type ?? "big-tall";
    const consentLevel = (row?.consent_state ?? "essential") as ConsentLevel;
    const customerId = row?.customer_id ?? undefined;

    const svc = new PersonalizationService(getProductProvider());
    const result = await svc.getRecommendations({
        sessionId,
        customerId,
        fitType,
        consentLevel,
        forceRefresh,
    });

    return NextResponse.json(result, {
        headers: {
            "X-Cache": result.meta.fromSnapshot ? "HIT" : "MISS",
            "Cache-Control": "private, max-age=0",
        },
    });
}
