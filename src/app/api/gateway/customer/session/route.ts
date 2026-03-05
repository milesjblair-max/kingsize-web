import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/UserRepository";
import { sessionRepository } from "@/lib/SessionRepository";
import { z } from "zod";

const COOKIE_NAME = "ks_session_id";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
};

const LoginSchema = z.object({ email: z.string().email() });

// GET — Return current session and profile
export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionId) {
        return NextResponse.json({ authenticated: false, profile: null });
    }

    try {
        const session = await sessionRepository.findById(sessionId);
        if (!session) {
            const res = NextResponse.json({ authenticated: false, profile: null });
            res.cookies.delete(COOKIE_NAME);
            return res;
        }

        // Touch session for activity tracking
        void sessionRepository.touch(sessionId);

        if (!session.userId) {
            return NextResponse.json({ authenticated: false, profile: null, sessionId: session.id });
        }

        const user = await userRepository.findById(session.userId);
        if (!user) {
            return NextResponse.json({ authenticated: false, profile: null });
        }

        return NextResponse.json({
            authenticated: true,
            sessionId: session.id,
            user: {
                id: user.id,
                email: user.email,
            },
            profile: user.profile ? {
                fitType: user.profile.fitType,
                preferredBrands: user.profile.preferredBrands,
                preferredCategories: user.profile.preferredCategories,
                measurements: user.profile.measurements,
                marketingConsent: user.profile.marketingConsent,
                onboardingDone: user.profile.onboardingDone,
            } : null,
        });
    } catch (err: any) {
        console.error("[gateway/session] GET error:", err);
        return NextResponse.json({ error: "Session lookup failed" }, { status: 500 });
    }
}

// POST — Login or create account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = LoginSchema.parse(body);

        // 1. Find or create user (idempotent)
        const user = await userRepository.findOrCreate(email);

        // 2. Get existing session or create fresh, then link to user
        const existingSessionId = request.cookies.get(COOKIE_NAME)?.value;
        let session = existingSessionId
            ? await sessionRepository.findById(existingSessionId)
            : null;

        if (!session) {
            session = await sessionRepository.create({ userId: user.id });
        } else {
            await sessionRepository.linkToUser(session.id, user.id);
        }

        const res = NextResponse.json({
            success: true,
            needsOnboarding: !user.profile?.onboardingDone,
        });
        res.cookies.set(COOKIE_NAME, session.id, COOKIE_OPTIONS);
        return res;
    } catch (err: any) {
        console.error("[gateway/session] POST error:", err);
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Login failed", detail: err.message }, { status: 500 });
    }
}

// DELETE — Logout (expire cookie; session row stays for audit)
export async function DELETE(request: NextRequest) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return res;
}
