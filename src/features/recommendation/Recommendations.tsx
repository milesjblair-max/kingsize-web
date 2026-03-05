"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getPrimaryImage } from "@/utils/image";
import type { ICatalogProduct } from "@kingsize/contracts";

// ─── Config ───────────────────────────────────────────────────────────────────

const STYLE_TILES = [
    {
        id: "smart-casual",
        label: "Smart Casual",
        badge: "Top picks",
        href: "/products?style=smart-casual",
        image: "/images/new-arrivals/nautica-polo2.jpg",
        bg: "#1A2A3A",
    },
    {
        id: "work-business",
        label: "Work & Business",
        badge: "Trending now",
        href: "/products?style=work-business",
        image: "/images/new-arrivals/cm-tshirt.jpg",
        bg: "#2A2020",
    },
    {
        id: "weekend-casual",
        label: "Weekend Casual",
        badge: "Staff picks",
        href: "/products?style=weekend-casual",
        image: "/images/new-arrivals/hk-tshirt.jpg",
        bg: "#1E2A1E",
    },
    {
        id: "street-sport",
        label: "Street & Sport",
        badge: "Trending now",
        href: "/products?style=street-sport",
        image: "/images/new-arrivals/gm-polo.jpg",
        bg: "#1A1A2A",
    },
    {
        id: "occasion",
        label: "Occasion",
        badge: "Top picks",
        href: "/products?style=occasion",
        image: "/images/new-arrivals/tw-polo-aqua.jpg",
        bg: "#2A1A2A",
    },
];

// ─── Style Tile ───────────────────────────────────────────────────────────────

const StyleTile = ({ tile }: { tile: typeof STYLE_TILES[number] }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <Link
            href={tile.href}
            className="group relative overflow-hidden rounded-sm flex-1 min-w-0"
            style={{ minHeight: "280px" }}
        >
            <div className="absolute inset-0">
                <Image
                    src={imgError ? "/images/placeholder.png" : tile.image}
                    alt={tile.label}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    onError={() => setImgError(true)}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.1) 100%)" }}
                />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-base leading-tight mb-1">{tile.label}</p>
                <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {tile.badge}
                </p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                    <ArrowRight size={14} className="text-gray-900" />
                </div>
            </div>
        </Link>
    );
};

// ─── Logged-out: Sign-up nudge ────────────────────────────────────────────────

const SignUpNudge = () => (
    <div
        className="rounded-sm border border-gray-100 bg-gray-50 p-6 flex flex-col justify-between"
        style={{ minHeight: "120px" }}
    >
        <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <User size={14} className="text-white" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Know your size. We&apos;ll handle the rest.</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Create an account, save your fit once, and we&apos;ll recommend what will fit — paired with what&apos;s trending now.
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Link
                href="/login"
                className="h-9 px-5 bg-gray-900 text-white text-sm font-bold rounded-sm hover:bg-black transition-colors flex items-center"
            >
                Create account
            </Link>
            <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors underline underline-offset-2"
            >
                Sign in
            </Link>
        </div>
    </div>
);

// ─── Dynamic Product / Outfit Components ─────────────────────────────────────

const RecommendedProductCard = ({ product, blur }: { product?: ICatalogProduct, blur?: boolean }) => {
    const [imgError, setImgError] = useState(false);

    if (!product) {
        return (
            <div className="group block border border-gray-100 rounded-sm overflow-hidden bg-gray-50 animate-pulse h-64" />
        );
    }

    return (
        <Link href={`/products/${product.slug}`} className={`group flex flex-col ${blur ? 'blur-[4px] pointer-events-none select-none' : ''}`}>
            <div className="relative aspect-[3/4] bg-gray-100 mb-3 overflow-hidden rounded-sm">
                <Image
                    src={imgError ? "/images/placeholder.png" : getPrimaryImage(product)}
                    alt={product.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onError={() => setImgError(true)}
                />
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand}</h3>
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">{product.title}</p>
            <p className="text-sm font-bold">${product.price}</p>
        </Link>
    );
}

const DynamicBundleCard = ({ outfit, blur }: { outfit: any, blur?: boolean }) => {
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    const handleImgError = (idx: number) => {
        setImgErrors(prev => ({ ...prev, [idx]: true }));
    };

    return (
        <div className={`group block border border-gray-100 rounded-sm overflow-hidden bg-white ${blur ? 'blur-[4px] pointer-events-none select-none' : ''}`}>
            <div className="flex xl:h-48 lg:h-40 h-32">
                {outfit.products.map((p: any, i: number) => (
                    <div key={i} className="relative flex-1">
                        <Image
                            src={imgErrors[i] ? "/images/placeholder.png" : getPrimaryImage(p)}
                            alt={p.title}
                            fill
                            className="object-cover object-top"
                            sizes="150px"
                            onError={() => handleImgError(i)}
                        />
                    </div>
                ))}
            </div>
            <div className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">{outfit.name}</p>
                    <p className="text-xs text-gray-400">Curated outfit</p>
                </div>
                <span className="text-xs font-bold text-gray-900 border border-gray-200 rounded-sm px-3 py-1.5 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    View list
                </span>
            </div>
        </div>
    );
};

// ─── Main export ─────────────────────────────────────────────────────────────

export const Recommendations = () => {
    const [, setHovered] = useState<string | null>(null);
    const { isAuthenticated, profile, preferences, loading: authLoading } = useAuth();

    // Dynamic data states
    const [recs, setRecs] = useState<ICatalogProduct[]>([]);
    const [outfits, setOutfits] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is known

        // Fetch our real personalised endpoints based on the cookie
        Promise.all([
            fetch('/api/gateway/recommendations/home').then(r => r.json()),
            fetch('/api/gateway/recommendations/outfits').then(r => r.json())
        ])
            .then(([homeData, outfitsData]) => {
                setRecs(homeData.recommendations || []);
                setOutfits(outfitsData.outfits || []);
                setLoadingData(false);
            })
            .catch(err => {
                console.error("Failed to load recommendations", err);
                setLoadingData(false);
            });

    }, [authLoading, isAuthenticated]);

    const fitLabel = profile?.fitType === "big" ? "Big" : profile?.fitType === "tall" ? "Tall" : profile?.fitType === "big-tall" ? "Big and Tall" : null;

    return (
        <section className="px-6 py-12 max-w-[1400px] mx-auto">
            {/* Module header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Style we recommend</h2>
                    <p className="text-sm text-gray-500">Shop by style, built around your fit</p>
                </div>
                <Link
                    href="/shop-by-style"
                    className="text-sm font-bold text-gray-700 hover:text-black transition-colors flex items-center gap-1"
                >
                    See more <ArrowRight size={14} />
                </Link>
            </div>

            {/* Style tiles */}
            <div
                className="grid gap-3 mb-8"
                style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
                onMouseLeave={() => setHovered(null)}
            >
                <style>{`
                    @media (max-width: 1024px) {
                        .style-tiles-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    }
                    @media (max-width: 640px) {
                        .style-tiles-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
                {STYLE_TILES.map((tile) => (
                    <StyleTile key={tile.id} tile={tile} />
                ))}
            </div>

            {/* Bottom Section */}

            {/* 1. Recommended For You (Personalised Products) */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                        {isAuthenticated ? `Recommended for you${fitLabel ? ` — ${fitLabel}` : ""}` : "Recommended for you"}
                    </p>
                    {isAuthenticated && preferences?.styleTags && preferences.styleTags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {preferences.styleTags.slice(0, 3).map((t) => (
                                <span key={t} className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium capitalize">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {loadingData || authLoading
                            ? Array.from({ length: 4 }).map((_, i) => <RecommendedProductCard key={i} />)
                            : isAuthenticated
                                ? recs.slice(0, 4).map(p => <RecommendedProductCard key={p.id} product={p} />)
                                // Logged out teaser
                                : recs.slice(0, 4).map((p, i) => <RecommendedProductCard key={i} product={p} blur />)
                        }
                    </div>

                    {/* Logged-out blur overlay */}
                    {!isAuthenticated && !loadingData && !authLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            <div className="relative z-20 w-full max-w-lg mx-auto">
                                <SignUpNudge />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Complete The Look (Outfits) - Logged in only */}
            {isAuthenticated && outfits.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                            Complete the look
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Outfits built for your height & build</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingData || authLoading
                            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-50 rounded-sm animate-pulse" />)
                            : outfits.map(outfit => <DynamicBundleCard key={outfit.id} outfit={outfit} />)
                        }
                    </div>
                </div>
            )}
        </section>
    );
};
