/**
 * GET /api/context
 * Returns a lightweight CustomerContext object for the current session/user.
 * Target: <200ms P95 (served from cache on repeat requests)
 */
import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { dbQueryOne } from "@/lib/db";
import type { ConsentLevel } from "@/lib/consent";

const SESSION_COOKIE = "ks_session_id";

export interface CustomerContext {
    sessionId: string | null;
    fitType: string;
    consentState: ConsentLevel;
    isAuthenticated: boolean;
    firstName?: string;
    styleProfile?: {
        tags: string[];
        preferredCategories: string[];
    };
    klaviyoLinked: boolean;
}

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null;
    const cacheKey = sessionId ? `ctx:${sessionId}` : null;

    // Serve from cache on repeat hits (P95 <200ms)
    if (cacheKey) {
        const cached = await cache.get<CustomerContext>(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: { "X-Cache": "HIT", "Cache-Control": "private, max-age=0" }
            });
        }
    }

    // Build context from DB
    let ctx: CustomerContext = {
        sessionId,
        fitType: "big-tall",
        consentState: "essential",
        isAuthenticated: false,
        klaviyoLinked: false,
    };

    if (sessionId) {
        // Session + customer join
        const row = await dbQueryOne<{
            consent_state: string;
            customer_id: string | null;
            email: string | null;
            first_name: string | null;
            fit_type: string | null;
            klaviyo_profile_id: string | null;
        }>(
            `SELECT s.consent_state, s.customer_id,
                    c.email, c.first_name, c.fit_type,
                    kl.klaviyo_profile_id
             FROM sessions s
             LEFT JOIN customers c ON c.id = s.customer_id
             LEFT JOIN klaviyo_links kl ON kl.customer_id = c.id
             WHERE s.id = $1 LIMIT 1`,
            [sessionId]
        );

        if (row) {
            ctx.consentState = (row.consent_state ?? "essential") as ConsentLevel;
            ctx.fitType = row.fit_type ?? "big-tall";
            ctx.isAuthenticated = !!row.customer_id;
            ctx.firstName = row.first_name ?? undefined;
            ctx.klaviyoLinked = !!row.klaviyo_profile_id;
        }

        // Preference summary (optional enrichment)
        if (ctx.isAuthenticated && row?.customer_id) {
            const pref = await dbQueryOne<{
                style_tags: Record<string, number>;
                category_affinity: Record<string, number>;
            }>(
                "SELECT style_tags, category_affinity FROM preference_profiles WHERE customer_id = $1 LIMIT 1",
                [row.customer_id]
            );
            if (pref) {
                const tags = Object.entries(pref.style_tags)
                    .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 5).map(([k]) => k);
                const cats = Object.entries(pref.category_affinity)
                    .sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k);
                ctx.styleProfile = { tags, preferredCategories: cats };
            }
        }

        // Cache for 5 min
        await cache.set(`ctx:${sessionId}`, ctx, 300);
    }

    return NextResponse.json(ctx, {
        headers: { "X-Cache": "MISS", "Cache-Control": "private, max-age=0" }
    });
}
