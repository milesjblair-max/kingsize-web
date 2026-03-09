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
        <div className="bg-white p-8 rounded-sm shadow-2xl text-center border border-gray-100 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-full mb-4">
                <User size={24} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get personalised recommendations</h3>
            <p className="text-sm text-gray-500 mb-6">Takes around 60 seconds to create your account</p>
            <div className="flex items-center gap-4 justify-center w-full">
                <Link
                    href="/login"
                    className="h-10 px-6 bg-[#0a0a0a] text-white text-sm font-bold rounded-sm hover:bg-black transition-colors flex items-center justify-center flex-1"
                >
                    Create account
                </Link>
                <Link
                    href="/login"
                    className="h-10 px-6 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-sm hover:bg-gray-50 transition-colors flex items-center justify-center flex-1"
                >
                    Log in
                </Link>
            </div>
        </div>
    );

    const EmptyFallback = (
        <div className="p-8 md:p-12 bg-gray-50 rounded-lg border border-gray-100 text-center" data-testid="recs-empty">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <User className="text-gray-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">We’re building your recommendations</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                Like a few items or take our style quiz to get started. The more you interact, the better our suggestions become.
            </p>
            <Link href="/onboarding" className="inline-flex h-10 px-6 bg-[#0a0a0a] text-white text-sm font-bold rounded items-center justify-center hover:bg-black transition-colors">
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

