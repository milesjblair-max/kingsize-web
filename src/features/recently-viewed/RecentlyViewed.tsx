"use client";

import { useState, useEffect } from "react";
import { HorizontalProductRail } from "@/components/ui/HorizontalProductRail";
import type { ICatalogProduct } from "@kingsize/contracts";

export const RecentlyViewed = () => {
    const [products, setProducts] = useState<ICatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/gateway/recently-viewed")
            .then((r) => r.json())
            .then((data) => {
                if (data.recentlyViewed) {
                    setProducts(data.recentlyViewed);
                }
            })
            .catch((e) => console.error("Failed to load recently viewed", e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="mb-12 md:mb-16 px-4 md:px-6 max-w-[1400px] mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 w-64 mb-1 rounded" />
                <div className="h-4 bg-gray-200 w-32 mb-6 rounded" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-none w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px] h-[340px] bg-gray-100 rounded-sm" />
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="px-4 md:px-6 max-w-[1400px] mx-auto">
            <HorizontalProductRail
                title="Pick up where you left off"
                subtitle="Recently viewed"
                products={products}
            />
        </div>
    );
};
