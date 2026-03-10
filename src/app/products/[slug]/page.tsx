import { notFound } from "next/navigation";
import { ProductDisplay } from "@/features/products/ProductDisplay";
import type { ICatalogProduct } from "@kingsize/contracts";

// Resolve the absolute base URL for server-side fetches.
// In Vercel: VERCEL_URL is set. Locally: fall back to localhost.
function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    // All data fetching goes through the API gateway — no direct DB/catalog calls from pages.
    const res = await fetch(`${getBaseUrl()}/api/gateway/products/${encodeURIComponent(slug)}`, {
        // Do not cache at the Next.js layer — gateway handles caching via Cache-Control headers.
        cache: "no-store",
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        // Let Next.js error boundary handle gateway failures
        throw new Error(`[PDP] Gateway returned ${res.status} for slug "${slug}"`);
    }

    const data = await res.json() as { product: ICatalogProduct };

    if (!data.product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white text-black pt-10">
            <ProductDisplay product={data.product} />
        </main>
    );
}
