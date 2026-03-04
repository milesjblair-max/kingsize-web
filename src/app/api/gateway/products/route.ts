/**
 * Gateway Products Route
 * All web UI product fetching must go through this route.
 * Swap the provider by changing INTEGRATION_PROVIDER in .env
 */
import { NextResponse } from "next/server";
import { MockProductProvider } from "@/integrations/mock/MockProductProvider";
import { CounterIntelligenceProductProvider } from "@/integrations/counterintelligence/CounterIntelligenceProductProvider";
import type { IProductProvider } from "@kingsize/contracts";

function getProvider(): IProductProvider {
    const integration = process.env.INTEGRATION_PROVIDER ?? "mock";
    if (integration === "counterintelligence") {
        return new CounterIntelligenceProductProvider();
    }
    return new MockProductProvider();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") ?? undefined;
        const brand = searchParams.get("brand") ?? undefined;

        const provider = getProvider();
        const products = await provider.getProducts({ category, brand });

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error("[gateway/products] Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
