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

const RegisterSchema = z.object({ email: z.string().email() });

// POST — Create account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = RegisterSchema.parse(body);

        // Explicitly catch missing DB local env for developers
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({
                success: false,
                error: "Local Environment Error: DATABASE_URL is missing. Please add it to your .env.local file to enable account creation."
            }, { status: 503 });
        }

        // Find or create user
        const user = await userRepository.findOrCreate(email);

        // Session attach
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
    } catch (err: unknown) {
        console.error("[gateway/register] POST error:", err);
        if (err instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Failed to create account. Please check your connection and try again.", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
