import { Hero } from "@/features/hero/Hero";
import { ProductGrid } from "@/features/products/ProductGrid";
import { StyleBundles } from "@/features/personalisation/StyleBundles";
import { BrandCarousel } from "@/features/brands/BrandCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Hero />
      <BrandCarousel />
      <ProductGrid />
      <StyleBundles />
    </main>
  );
}
