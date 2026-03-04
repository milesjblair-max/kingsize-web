import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PersonalizationService } from "@/services/PersonalizationService";
import { MockProductProvider } from "@/integrations/mock/MockProductProvider";
import { dbQueryOne } from "@/lib/db";
import type { ConsentLevel } from "@/lib/consent";

const SESSION_COOKIE = "ks_session_id";

const SignalSchema = z.object({
    signalType: z.enum(["view", "search", "filter", "category_click", "brand_click"]),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    entityLabel: z.string().max(200).optional(),
    fitContext: z.enum(["big", "tall", "big-tall"]).optional(),
});

export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    let body: z.infer<typeof SignalSchema>;
    try {
        body = SignalSchema.parse(await request.json());
    } catch (err) {
        return NextResponse.json({ error: "Invalid signal" }, { status: 400 });
    }

    // Fetch fit context from session if not provided
    const fitCtx = body.fitContext ?? (
        await dbQueryOne<{ fit_type: string }>(
            "SELECT c.fit_type FROM sessions s LEFT JOIN customers c ON c.id = s.customer_id WHERE s.id = $1",
            [sessionId]
        )
    )?.fit_type ?? "big-tall";

    const svc = new PersonalizationService(new MockProductProvider());
    await svc.recordSignal({
        sessionId,
        signalType: body.signalType,
        entityType: body.entityType,
        entityId: body.entityId,
        entityLabel: body.entityLabel,
        fitContext: fitCtx as string,
    });

    return NextResponse.json({ success: true });
}
