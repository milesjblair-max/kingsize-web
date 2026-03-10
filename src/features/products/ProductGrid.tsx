"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getPrimaryImage } from "@/utils/image";
import type { ICatalogProduct } from "@kingsize/contracts";

const ProductCard = ({ product }: { product: ICatalogProduct }) => {
    const [imgError, setImgError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [finalSrc, setFinalSrc] = useState(() => getPrimaryImage(product));

    const handleImageError = () => {
        if (retryCount === 0) {
            let nextSrc = finalSrc;
            if (!finalSrc.includes("_FRONT") && finalSrc.endsWith(".jpg")) {
                nextSrc = finalSrc.replace(".jpg", "_FRONT.jpg");
            }
            if (nextSrc !== finalSrc && !nextSrc.startsWith("data:")) {
                setFinalSrc(nextSrc);
                setRetryCount(1);
            } else {
                setImgError(true);
            }
        } else {
            setImgError(true);
        }
    };

    return (
        <Link href={`/products/${product.slug}`} className="group cursor-pointer block">
            <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden rounded-sm">
                <Image
                    src={imgError ? getPrimaryImage({}) : finalSrc}
                    alt={product.title}
                    fill
                    className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${imgError ? "opacity-20 p-12 object-contain" : ""}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={handleImageError}
                />
            </div>
            <h3 className="font-bold text-lg mb-1">{product.brand}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.title}</p>
            <p className="font-bold text-gray-900">${product.price}</p>
        </Link>
    );
};

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="aspect-[3/4] bg-gray-100 mb-4 rounded-sm" />
        <div className="h-5 bg-gray-200 w-3/4 mb-2 rounded" />
        <div className="h-4 bg-gray-200 w-1/2 mb-2 rounded" />
        <div className="h-4 bg-gray-200 w-1/4 rounded" />
    </div>
);

export const ProductGrid = () => {
    const [products, setProducts] = useState<ICatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/gateway/products?limit=4")
            .then((r) => r.json())
            .then((data) => {
                if (data.products) setProducts(data.products);
            })
            .catch((e) => console.error("[ProductGrid] Failed to load new arrivals", e))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="px-6 py-12 max-w-[1400px] mx-auto">
            <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : products.map((product) => <ProductCard key={product.id} product={product} />)
                }
            </div>
        </section>
    );
};
