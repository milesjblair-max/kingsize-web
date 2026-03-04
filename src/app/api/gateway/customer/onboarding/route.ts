import { NextRequest, NextResponse } from "next/server";
import { customerProfileRepository } from "@/lib/CustomerProfileRepository";
import { OnboardingSchema } from "../../../../../../packages/contracts/src";
import { z } from "zod";

// POST — Save full onboarding profile
export async function POST(request: NextRequest) {
    const sessionId = request.cookies.get("ks_session_id")?.value;
    if (!sessionId) {
        return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const data = OnboardingSchema.parse(body);

        const profile = await customerProfileRepository.upsert({
            ...data,
            onboardingComplete: true,
        });

        return NextResponse.json({ success: true, profile: { onboardingComplete: profile.onboardingComplete } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Onboarding save failed" }, { status: 500 });
    }
}
