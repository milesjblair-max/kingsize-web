import { Hero } from "@/features/hero/Hero";
import { ProductGrid } from "@/features/products/ProductGrid";
import { StyleBundles } from "@/features/personalisation/StyleBundles";
import { FitSelector } from "@/features/personalisation/FitSelector";
import { BrandCarousel } from "@/features/brands/BrandCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Hero />
      <div className="px-6 py-12 max-w-[1400px] mx-auto border-b border-gray-50">
        <FitSelector />
      </div>
      <BrandCarousel />
      <ProductGrid />
      <StyleBundles />
    </main>
  );
}
