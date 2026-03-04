import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StylePreferencesSchema } from "../../../../packages/contracts/src";

// ─── In-memory rate limiter (5 req / 60s / IP) ───────────────────────────────
// For production, swap this with Upstash Redis or Cloudflare rate limiting rules
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, retryAfter: 0 };
    }

    if (entry.count >= RATE_LIMIT) {
        return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }

    entry.count += 1;
    return { allowed: true, retryAfter: 0 };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type LLMPayload = z.infer<typeof StylePreferencesSchema>;

interface LLMResult {
    styleTags: string[];
    preferredCategories: string[];
    avoidCategories: string[];
    fitNotes: string[];
    summary: string;
    fallback?: boolean;
}

// ─── Rules-based fallback (always safe) ──────────────────────────────────────
function rulesBasedAnalysis(payload: LLMPayload): LLMResult {
    const tagCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    const avoidCats: Record<string, number> = {};

    payload.liked.forEach((card) => {
        card.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 2; });
        catCounts[card.category] = (catCounts[card.category] || 0) + 2;
    });
    payload.passed.forEach((card) => {
        card.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) - 1; });
        avoidCats[card.category] = (avoidCats[card.category] || 0) + 1;
    });

    const styleTags = Object.entries(tagCounts)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([k]) => k);

    const preferredCategories = Object.entries(catCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k]) => k);

    const avoidCategories = Object.entries(avoidCats)
        .filter(([cat]) => !(catCounts[cat] > 0))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([k]) => k);

    const fitLabel = payload.fitType === "big" ? "Big" : payload.fitType === "tall" ? "Tall" : "Big and Tall";

    const fitNotes: string[] = [];
    if (payload.dimensions?.waist) fitNotes.push(`Waist ${payload.dimensions.waist}`);
    if (payload.dimensions?.inseam) fitNotes.push(`Inseam ${payload.dimensions.inseam}`);
    if (payload.dimensions?.fitPref) fitNotes.push(`Prefers ${payload.dimensions.fitPref} fit`);

    const topStyle = styleTags[0] || "casual";
    const topCat = preferredCategories[0] || "tops";
    const summary = `Based on your swipes, you lean ${topStyle} with a preference for ${topCat}. We have curated your ${fitLabel} fit recommendations to match your style.`;

    return { styleTags, preferredCategories, avoidCategories, fitNotes, summary };
}

// ─── Groq provider ───────────────────────────────────────────────────────────
async function groqAnalysis(payload: LLMPayload): Promise<LLMResult | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are a personal stylist for a big and tall menswear retailer.
A customer completed a style preference quiz. Return only valid JSON (no markdown) with:
- styleTags: string[] (top 5)
- preferredCategories: string[] (top 3)
- avoidCategories: string[]
- fitNotes: string[]
- summary: string (one sentence, friendly, no em dashes)

Customer data:
- Fit type: ${payload.fitType}
- Dimensions: ${JSON.stringify(payload.dimensions || {})}
- Liked: ${payload.liked.map((c) => `${c.label} [${c.tags.join(", ")}]`).join("; ")}
- Passed: ${payload.passed.map((c) => `${c.label} [${c.tags.join(", ")}]`).join("; ")}`.trim();

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }], max_tokens: 400, temperature: 0.4 }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        return JSON.parse(text) as LLMResult;
    } catch {
        return null;
    }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    const start = Date.now();

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
        console.log(`[llm] Rate limited ip=${ip}`);
        return NextResponse.json({ error: "Too many requests" }, {
            status: 429,
            headers: { "Retry-After": String(rateCheck.retryAfter) }
        });
    }

    // Zod validation
    let payload: LLMPayload;
    try {
        const body = await request.json();
        payload = StylePreferencesSchema.parse(body);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid request", details: err.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const provider = process.env.LLM_PROVIDER ?? "fallback";
    let result: LLMResult | null = null;
    let usedProvider = "rules-fallback";

    if (provider === "groq") {
        result = await groqAnalysis(payload);
        if (result) usedProvider = "groq";
    }

    // Always fall back to rules-based if provider fails or not configured
    const fallbackTriggered = !result;
    if (!result) {
        result = rulesBasedAnalysis(payload);
    }

    // Telemetry — structured log (Sentry-ready, replace console with Sentry.captureMessage)
    console.log(JSON.stringify({
        event: "llm_analyse",
        provider: usedProvider,
        fallback: fallbackTriggered,
        likedCount: payload.liked.length,
        passedCount: payload.passed.length,
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ ...result, fallback: fallbackTriggered });
}
