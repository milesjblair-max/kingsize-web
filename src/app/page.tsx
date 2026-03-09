import { Hero } from "@/features/hero/Hero";
import { ProductGrid } from "@/features/products/ProductGrid";
import { Recommendations } from "@/features/recommendation/Recommendations";
import { BrandCarousel } from "@/features/brands/BrandCarousel";
import { RecentlyViewed } from "@/features/recently-viewed/RecentlyViewed";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Hero />
      <BrandCarousel />
      <RecentlyViewed />
      <ProductGrid />
      <Recommendations />
    </main>
  );
}
