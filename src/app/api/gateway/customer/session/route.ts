import { NextRequest, NextResponse } from "next/server";
import { customerProfileRepository } from "@/lib/CustomerProfileRepository";
import { SessionLoginSchema } from "@kingsize/contracts";
import { z } from "zod";

const COOKIE_NAME = "ks_session_id";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
};

// GET — Return current session profile
export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionId) {
        return NextResponse.json({ authenticated: false, profile: null });
    }
    const profile = await customerProfileRepository.findById(sessionId);
    if (!profile) {
        const res = NextResponse.json({ authenticated: false, profile: null });
        res.cookies.delete(COOKIE_NAME);
        return res;
    }
    // Return profile WITHOUT PII that shouldn't be in the browser payload
    const { email, firstName, lastName, fitType, dimensions, contactPref, onboardingComplete } = profile;
    return NextResponse.json({ authenticated: true, profile: { email, firstName, lastName, fitType, dimensions, contactPref, onboardingComplete } });
}

// POST — Login or create account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = SessionLoginSchema.parse(body);

        let profile = await customerProfileRepository.findByEmail(email);
        if (!profile) {
            profile = await customerProfileRepository.upsert({ email, onboardingComplete: false });
        }

        const res = NextResponse.json({
            success: true,
            needsOnboarding: !profile.onboardingComplete,
        });
        res.cookies.set(COOKIE_NAME, profile.id, COOKIE_OPTIONS);
        return res;
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
    }
}

// DELETE — Logout
export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return res;
}
