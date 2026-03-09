"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    const [retryCount, setRetryCount] = useState(0);
    const [finalSrc, setFinalSrc] = useState(tile.image);

    const handleImageError = () => {
        if (retryCount === 0) {
            if (!finalSrc.includes("_FRONT") && finalSrc.endsWith(".jpg")) {
                setFinalSrc(finalSrc.replace(".jpg", "_FRONT.jpg"));
            }
            setRetryCount(1);
        } else {
            setImgError(true);
        }
    };

    return (
        <Link
            href={tile.href}
            className="group relative overflow-hidden rounded-sm flex-1 min-w-0"
            style={{ minHeight: "280px" }}
        >
            <div className="absolute inset-0">
                <Image
                    src={imgError ? getPrimaryImage({}) : finalSrc}
                    alt={tile.label}
                    fill
                    className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${imgError ? "opacity-20 p-12 object-contain" : ""}`}
                    sizes="(max-width: 768px) 50vw, 20vw"
                    onError={handleImageError}
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
    const [retryCount, setRetryCount] = useState(0);
    const [finalSrc, setFinalSrc] = useState(() => getPrimaryImage(product));

    const handleImageError = () => {
        if (retryCount === 0) {
            if (finalSrc && !finalSrc.includes("_FRONT") && finalSrc.endsWith(".jpg") && !finalSrc.startsWith("data:")) {
                setFinalSrc(finalSrc.replace(".jpg", "_FRONT.jpg"));
            }
            setRetryCount(1);
        } else {
            setImgError(true);
        }
    };

    if (!product) {
        return (
            <div className="group block border border-gray-100 rounded-sm overflow-hidden bg-gray-50 animate-pulse h-64" />
        );
    }

    return (
        <Link href={`/products/${product.slug}`} className={`group flex flex-col ${blur ? 'blur-[4px] pointer-events-none select-none' : ''}`}>
            <div className="relative aspect-[3/4] bg-gray-100 mb-3 overflow-hidden rounded-sm">
                <Image
                    src={imgError ? getPrimaryImage({}) : finalSrc}
                    alt={product.title}
                    fill
                    className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${imgError ? "opacity-30 p-8 object-contain" : ""}`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onError={handleImageError}
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
                            src={imgErrors[i] ? getPrimaryImage({}) : getPrimaryImage(p)}
                            alt={p.title}
                            fill
                            className={`object-cover object-top ${imgErrors[i] ? "opacity-20 p-4 object-contain" : ""}`}
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

import { HorizontalProductRail } from "@/components/ui/HorizontalProductRail";

// ─── Main export ─────────────────────────────────────────────────────────────

type DataState = "loggedOut" | "loggedInLoading" | "loggedInReady" | "loggedInEmpty" | "error";

export const Recommendations = () => {
    const { isAuthenticated, profile, loading: authLoading } = useAuth();
    const [dataState, setDataState] = useState<DataState>("loggedInLoading");
    const [recs, setRecs] = useState<ICatalogProduct[]>([]);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            setDataState("loggedOut");
            fetch('/api/gateway/recommendations/home')
                .then(r => r.json())
                .then(d => setRecs(d.recommendations || []))
                .catch(() => { });
            return;
        }

        setDataState("loggedInLoading");

        const cacheKey = `kingsize_recs_${profile?.email || 'auth'}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                setRecs(parsed.recs);
                setDataState(parsed.recs.length === 0 ? "loggedInEmpty" : "loggedInReady");
                return;
            }
        } catch (e) {
            // Ignore cache read errors
        }

        fetch('/api/gateway/recommendations/home')
            .then(r => {
                if (!r.ok) throw new Error("Recs failed");
                return r.json();
            })
            .then((homeData) => {
                const r = homeData.recommendations || [];
                setRecs(r);

                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({ recs: r }));
                } catch (e) {
                    // Ignore cache write errors
                }

                if (r.length === 0) {
                    setDataState("loggedInEmpty");
                } else {
                    setDataState("loggedInReady");
                }
            })
            .catch(err => {
                console.error("Failed to load recommendations", err);
                setDataState("error");
            });

    }, [authLoading, isAuthenticated, profile?.email]);

    // Construct overlay for blur state matching the instructions exactly
    const LockedOverlay = (
        <div className="bg-white px-8 py-10 rounded-sm shadow-2xl text-center border border-gray-100 flex flex-col items-center justify-center min-h-[180px]">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">Get personalised recommendations</h3>
            <p className="text-[15px] font-medium text-gray-500 mb-8 px-4">Takes around 60 seconds to create your account</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center w-full max-w-sm mx-auto">
                <Link
                    href="/login"
                    className="h-12 px-8 bg-[#0a0a0a] text-white text-[15px] font-bold rounded-sm border-2 border-[#0a0a0a] hover:bg-black hover:border-black transition-colors flex items-center justify-center w-full"
                >
                    Create account
                </Link>
                <Link
                    href="/login"
                    className="h-12 px-8 bg-transparent text-[#0a0a0a] text-[15px] font-bold rounded-sm border-2 border-[#0a0a0a] hover:bg-gray-50 transition-colors flex items-center justify-center w-full"
                >
                    Log in
                </Link>
            </div>
        </div>
    );

    const EmptyFallback = (
        <div className="p-8 md:p-12 bg-gray-50 rounded-sm border border-gray-100 text-center" data-testid="recs-empty">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">We’re building your recommendations</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-[15px] font-medium leading-relaxed">
                Like a few items or take our style quiz to get started. The more you interact, the better our suggestions become.
            </p>
            <Link href="/onboarding" className="inline-flex h-12 px-8 bg-[#0a0a0a] text-white text-[15px] font-bold rounded-sm items-center justify-center hover:bg-black transition-colors">
                Take Style Quiz
            </Link>
        </div>
    );

    // Skeleton loader for when dataState is loggedInLoading
    if (dataState === "loggedInLoading") {
        return (
            <div className="px-4 md:px-6 py-12 max-w-[1400px] mx-auto animate-pulse" data-testid="recs-loading">
                <div className="h-8 bg-gray-200 w-64 mb-1 rounded" />
                <div className="h-4 bg-gray-200 w-32 mb-6 rounded" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-none w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px] h-[340px] bg-gray-100 rounded-sm" />
                    ))}
                </div>
            </div>
        );
    }

    if (dataState === "error") {
        return (
            <div className="px-4 md:px-6 py-12 max-w-[1400px] mx-auto" data-testid="recs-error">
                <div className="p-8 bg-red-50 rounded-lg border border-red-100 text-center">
                    <p className="text-red-800 font-semibold mb-2">Unable to load your recommendations</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm font-medium text-red-600 hover:text-red-800 underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // Default return for loggedOut, loggedInReady, loggedInEmpty

    // For loggedOut, we MUST provide enough fake products so the rail renders and doesn't trigger the emptyState fallback internally.
    const displayProducts = dataState === "loggedOut" && recs.length === 0
        ? Array.from({ length: 8 }).map((_, i) => ({ id: `dummy-${i}`, title: '', brand: '', price: 0 })) as any[]
        : recs;

    return (
        <div className="px-4 md:px-6 max-w-[1400px] mx-auto py-12" data-testid={dataState === "loggedInEmpty" ? "recs-empty" : dataState === "loggedOut" ? "recs-logged-out" : "recs-ready"}>
            <HorizontalProductRail
                title="We think you'll like these"
                subtitle="Recommended for you"
                products={dataState === "loggedInEmpty" ? [] : displayProducts}
                blurState={dataState === "loggedOut"}
                overlayContent={dataState === "loggedOut" ? LockedOverlay : undefined}
                emptyState={dataState === "loggedInEmpty" ? EmptyFallback : undefined}
            />
        </div>
    );
};

