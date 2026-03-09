"use client";

import { useState, useRef, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPrimaryImage } from "@/utils/image";
import type { ICatalogProduct } from "@kingsize/contracts";

export interface HorizontalProductRailProps {
    title: ReactNode;
    subtitle: ReactNode;
    seeMoreLink?: string;
    products: ICatalogProduct[];
    blurState?: boolean;
    overlayContent?: ReactNode;
    emptyState?: ReactNode;
}

export const HorizontalProductRail = ({
    title,
    subtitle,
    seeMoreLink,
    products,
    blurState = false,
    overlayContent,
    emptyState,
}: HorizontalProductRailProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    if (products.length === 0 && emptyState) {
        return <div className="mb-12 md:mb-16">{emptyState}</div>;
    }

    if (products.length === 0) {
        return null; // hide if empty by default
    }

    return (
        <section className="mb-12 md:mb-16 relative">
            {/* Header / Editorial Title */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">{title}</h2>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{subtitle}</p>
                </div>
                {seeMoreLink && products.length > 4 && (
                    <Link
                        href={seeMoreLink}
                        className="hidden md:inline-flex text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-900"
                    >
                        See more
                    </Link>
                )}
            </div>

            {/* Container for Blur Overlay */}
            <div className="relative group">
                {/* Horizontal Scroll Area */}
                <div
                    ref={scrollRef}
                    className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 ${blurState ? "blur-sm pointer-events-none select-none" : ""
                        }`}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="snap-start flex-none w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px]"
                        >
                            <RailProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Optional Blur Overlay */}
                {blurState && overlayContent && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
                        <div className="relative z-20 w-full max-w-lg mx-auto pointer-events-auto px-4 shadow-xl">
                            {overlayContent}
                        </div>
                    </div>
                )}

                {/* Navigation Arrows (Desktop Only) */}
                {!blurState && products.length > 4 && (
                    <>
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-gray-50 disabled:opacity-0"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-gray-50 disabled:opacity-0"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Global style to hide scrollbar cross-browser */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

// ─── Internal Card Component ──────────────────────────────────────────────────

function RailProductCard({ product }: { product: ICatalogProduct }) {
    const [imgError, setImgError] = useState(false);

    // If implementing tracking on click, we intercept it here to fire POST /api/gateway/events/product-view
    const trackClick = () => {
        fetch("/api/gateway/events/product-view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
        }).catch(() => { });
    };

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group flex flex-col h-full"
            onClick={trackClick}
        >
            <div className="relative aspect-[3/4] bg-gray-100 mb-3 overflow-hidden rounded-sm">
                <Image
                    src={imgError ? "/images/placeholder.png" : getPrimaryImage(product)}
                    alt={product.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 260px"
                    onError={() => setImgError(true)}
                />
            </div>
            <div className="flex flex-col flex-grow">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{product.brand}</h3>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">{product.title}</p>
                <div className="mt-auto">
                    <p className="text-sm font-bold text-gray-900">${product.price}</p>
                </div>
            </div>
        </Link>
    );
}
