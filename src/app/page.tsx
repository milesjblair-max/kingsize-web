import { Hero } from "@/features/hero/Hero";
import { ProductGrid } from "@/features/products/ProductGrid";
import { Recommendations } from "@/features/recommendation/Recommendations";
import { BrandCarousel } from "@/features/brands/BrandCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Hero />
      <BrandCarousel />
      <ProductGrid />
      <Recommendations />
      {/* Cart is hidden by default, would be toggled by state */}
    </main>
  );
}
