/**
 * POST /api/gateway/personalization/swipe
 *
 * Records a batch of swipe results (likes/passes) into the platform DB
 * and busts the recommendation snapshot for the session/customer.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PersonalizationService } from "@/services/PersonalizationService";
import { MockProductProvider } from "@/integrations/mock/MockProductProvider";
import { dbQueryOne } from "@/lib/db";

const SESSION_COOKIE = "ks_session_id";

const SwipeResultSchema = z.object({
    id: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
});

const SwipeBatchSchema = z.object({
    liked: z.array(SwipeResultSchema),
    passed: z.array(SwipeResultSchema),
});

export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    let body: z.infer<typeof SwipeBatchSchema>;
    try {
        body = SwipeBatchSchema.parse(await request.json());
    } catch {
        return NextResponse.json({ error: "Invalid swipe data" }, { status: 400 });
    }

    // Resolve user if authenticated via session
    const row = await dbQueryOne<{ user_id: string | null }>(
        "SELECT user_id FROM sessions WHERE id = $1",
        [sessionId]
    );

    const svc = new PersonalizationService(new MockProductProvider());
    await svc.applySwipeResults({
        sessionId,
        customerId: row?.user_id ?? undefined,
        liked: body.liked,
        passed: body.passed,
    });

    return NextResponse.json({ success: true, count: body.liked.length + body.passed.length });
}
