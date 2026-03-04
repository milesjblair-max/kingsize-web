import { NextRequest, NextResponse } from "next/server";
import { customerProfileRepository } from "@/lib/CustomerProfileRepository";
import { sessionRepository } from "@/lib/SessionRepository";
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

    const session = await sessionRepository.findById(sessionId);
    if (!session) {
        const res = NextResponse.json({ authenticated: false, profile: null });
        res.cookies.delete(COOKIE_NAME);
        return res;
    }

    // Touch session for activity tracking
    await sessionRepository.touch(sessionId);

    if (!session.customerId) {
        return NextResponse.json({ authenticated: false, profile: null, sessionId: session.id });
    }

    const profile = await customerProfileRepository.findById(session.customerId);
    if (!profile) {
        return NextResponse.json({ authenticated: false, profile: null });
    }

    // Return profile WITHOUT PII that shouldn't be in the browser payload
    const { email, firstName, lastName, fitType, dimensions, contactPref, onboardingComplete } = profile;
    return NextResponse.json({
        authenticated: true,
        profile: { email, firstName, lastName, fitType, dimensions, contactPref, onboardingComplete },
        sessionId: session.id
    });
}

// POST — Login or create account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = SessionLoginSchema.parse(body);

        // 1. Get or create customer
        let profile = await customerProfileRepository.findByEmail(email);
        if (!profile) {
            profile = await customerProfileRepository.upsert({ email, onboardingComplete: false });
        }

        // 2. Get existing session or create fresh
        const existingSessionId = request.cookies.get(COOKIE_NAME)?.value;
        let session = existingSessionId ? await sessionRepository.findById(existingSessionId) : null;

        if (!session) {
            session = await sessionRepository.create({ customerId: profile.id });
        } else {
            await sessionRepository.linkToCustomer(session.id, profile.id);
        }

        const res = NextResponse.json({
            success: true,
            needsOnboarding: !profile.onboardingComplete,
        });
        res.cookies.set(COOKIE_NAME, session.id, COOKIE_OPTIONS);
        return res;
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
    }
}

// DELETE — Logout
export async function DELETE(request: NextRequest) {
    const sessionId = request.cookies.get(COOKIE_NAME)?.value;
    const res = NextResponse.json({ success: true });

    // We don't delete the session from DB (for audit/analytics), we just disconnect the cookie
    // and create a fresh one if the user stays on the site.
    res.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return res;
}
