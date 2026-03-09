import { getCatalogProvider } from "@/integrations/ci/mockCiCatalog";
import { notFound } from "next/navigation";
import { ProductDisplay } from "@/features/products/ProductDisplay";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const catalog = getCatalogProvider();

    // We fetch all and find, since our mock CI adapter doesn't have a direct getProductBySlug
    // In production this would be a direct lookup
    const allProducts = await catalog.listProducts();
    const product = allProducts.find(p => p.slug === slug || p.id === slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white text-black pt-10">
            <ProductDisplay product={product} />
        </main>
    );
}
