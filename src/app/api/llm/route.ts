import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwipeCard {
    id: string;
    label: string;
    category: string;
    tags: string[];
}

interface LLMPayload {
    fitType: string;
    dimensions?: Record<string, string>;
    liked: SwipeCard[];
    passed: SwipeCard[];
}

interface LLMResult {
    styleTags: string[];
    preferredCategories: string[];
    avoidCategories: string[];
    fitNotes: string[];
    summary: string;
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

// ─── Groq provider (free tier) ───────────────────────────────────────────────

async function groqAnalysis(payload: LLMPayload): Promise<LLMResult | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const prompt = `
You are a personal stylist for a big and tall menswear retailer.
A customer completed a style preference quiz. Based on the data below, return a JSON object with these exact fields:
- styleTags: string[] (top 5 style keywords)
- preferredCategories: string[] (top 3 clothing categories they liked)
- avoidCategories: string[] (categories they consistently skipped)
- fitNotes: string[] (observations about their fit/sizing preferences)
- summary: string (one sentence personalised recommendation rationale, friendly tone, no em dashes)

Customer data:
- Fit type: ${payload.fitType}
- Dimensions: ${JSON.stringify(payload.dimensions || {})}
- Liked items: ${payload.liked.map((c) => `${c.label} [${c.tags.join(", ")}]`).join("; ")}
- Passed items: ${payload.passed.map((c) => `${c.label} [${c.tags.join(", ")}]`).join("; ")}

Return only valid JSON, no markdown.
`.trim();

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 400,
                temperature: 0.4,
            }),
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

// ─── HuggingFace provider (free tier) ────────────────────────────────────────

async function huggingfaceAnalysis(payload: LLMPayload): Promise<LLMResult | null> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return null;

    try {
        const res = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    inputs: `Extract style preferences as JSON from: liked=${payload.liked.map((c) => c.tags.join(",")).join("; ")}`,
                    parameters: { max_new_tokens: 200 },
                }),
                signal: AbortSignal.timeout(10000),
            }
        );
        if (!res.ok) return null;
        // HF returns text — use rules fallback to structure it
        return rulesBasedAnalysis(payload);
    } catch {
        return null;
    }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as LLMPayload;

        const provider = process.env.LLM_PROVIDER ?? "fallback";

        let result: LLMResult | null = null;

        if (provider === "groq") {
            result = await groqAnalysis(payload);
        } else if (provider === "huggingface") {
            result = await huggingfaceAnalysis(payload);
        }

        // Always fall back to rules-based if provider fails or not configured
        if (!result) {
            result = rulesBasedAnalysis(payload);
        }

        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { error: "Analysis failed" },
            { status: 500 }
        );
    }
}
