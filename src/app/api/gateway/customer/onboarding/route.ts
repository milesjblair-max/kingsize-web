import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/UserRepository";
import { sessionRepository } from "@/lib/SessionRepository";
import { z } from "zod";

const COOKIE_NAME = "ks_session_id";

const OnboardingSchema = z.object({
    fitType: z.enum(["big", "tall", "big-tall"]).optional(),
    preferredBrands: z.array(z.string()).optional(),
    preferredCategories: z.array(z.string()).optional(),
    measurements: z.record(z.union([z.string(), z.number()])).optional(),
    marketingConsent: z.boolean().optional(),
});

// POST — Save onboarding profile
export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionId) {
        return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    try {
        const session = await sessionRepository.findById(sessionId);
        if (!session?.userId) {
            return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const data = OnboardingSchema.parse(body);

        const profile = await userRepository.upsertProfile(session.userId, {
            ...data,
            onboardingDone: true,
        });

        return NextResponse.json({ success: true, profile: { onboardingDone: profile.onboardingDone } });
    } catch (err: any) {
        console.error("[gateway/onboarding] POST error:", err);
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Onboarding save failed", detail: err.message }, { status: 500 });
    }
}
