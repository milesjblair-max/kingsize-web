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
        <section className="mb-8 md:mb-12 relative">
            {/* Header / Editorial Title */}
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5 leading-tight">{title}</h2>
                    <p className="text-[13px] font-medium text-gray-500">{subtitle}</p>
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
                    className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-4 ${blurState ? "blur-md pointer-events-none select-none opacity-40" : ""
                        }`}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="snap-start flex-none w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
                        >
                            <RailProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Optional Blur Overlay */}
                {blurState && overlayContent && (
                    <div className="absolute inset-x-0 top-0 bottom-4 z-10 flex items-center justify-center pointer-events-auto">
                        <div className="relative z-20 w-full max-w-lg mx-auto pointer-events-auto px-4 shadow-2xl">
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
            <div className="relative aspect-[3/4] bg-gray-50 mb-2 overflow-hidden rounded-sm">
                <Image
                    src={imgError ? "/images/placeholder.png" : getPrimaryImage(product)}
                    alt={product.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 220px"
                    onError={() => setImgError(true)}
                />
            </div>
            <div className="flex flex-col flex-grow text-left">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 line-clamp-1">{product.brand}</h3>
                <p className="text-[13px] text-gray-900 line-clamp-2 leading-tight mb-1.5">{product.title}</p>
                <div className="mt-auto">
                    <p className="text-sm font-bold text-gray-900">${product.price}</p>
                </div>
            </div>
        </Link>
    );
}
