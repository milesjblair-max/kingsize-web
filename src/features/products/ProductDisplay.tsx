"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";
import { getPrimaryImage } from "@/utils/image";
import type { ICatalogProduct } from "@kingsize/contracts";

export function ProductDisplay({ product }: { product: ICatalogProduct }) {
    const [imgError, setImgError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [finalSrc, setFinalSrc] = useState(() => getPrimaryImage(product));

    const handleImageError = () => {
        if (retryCount === 0) {
            let nextSrc = finalSrc;
            if (finalSrc.includes("_FRONT")) {
                nextSrc = finalSrc.replace("_FRONT", "");
            } else if (finalSrc.endsWith(".jpg")) {
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

    // Trigger product view tracking on mount
    useEffect(() => {
        if (!product.id) return;
        fetch("/api/gateway/events/product-view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
        }).catch((err) => console.error("Failed to track view", err));
    }, [product.id]);

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-8">
                <ArrowLeft size={16} />
                Back to Homepage
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery (Single Image for simplicity) */}
                <div className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <Image
                        src={imgError ? getPrimaryImage({}) : finalSrc}
                        alt={product.title}
                        fill
                        className={`object-cover object-top ${imgError ? "opacity-30 p-12 object-contain" : ""}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onError={handleImageError}
                        priority
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brand}</h2>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.title}</h1>
                    <p className="text-sm text-gray-500 mb-6">SKU: {product.id}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-8">${product.price}</p>

                    {/* Measured by Kingsize Badge */}
                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-semibold text-gray-700 w-fit mb-8">
                        <Ruler size={16} className="text-gray-500" />
                        Measured by Kingsize
                    </div>

                    <div className="space-y-4 mb-8">
                        <button className="w-full h-14 bg-black text-white font-bold rounded flex items-center justify-center hover:bg-gray-800 transition-colors">
                            Add to Bag
                        </button>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Product Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            A staple for your wardrobe, designed with premium materials built to last.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
