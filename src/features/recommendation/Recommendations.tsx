"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────

// Simulate auth state — swap to real auth hook when ready
const IS_LOGGED_IN = false;

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

// Bundle data using available Zip range images
const BUNDLES = [
    {
        id: "warm-weather",
        name: "Warm-weather set",
        products: [
            { name: "Nautica Polo", image: "/images/new-arrivals/nautica-polo.jpg" },
            { name: "GM Shorts Tan", image: "/images/new-arrivals/gm-shorts-tan.jpg" },
        ],
        href: "/products?bundle=warm-weather",
    },
    {
        id: "smart-casual-set",
        name: "Smart casual set",
        products: [
            { name: "GM Polo", image: "/images/new-arrivals/gm-polo2.jpg" },
            { name: "KAM Shorts Blue", image: "/images/new-arrivals/kam-shorts-blue.jpg" },
        ],
        href: "/products?bundle=smart-casual",
    },
    {
        id: "weekend-set",
        name: "Weekend set",
        products: [
            { name: "JJ Split Tee", image: "/images/new-arrivals/jj-tshirt-blk.jpg" },
            { name: "Nau Shorts", image: "/images/new-arrivals/nau-shorts.jpg" },
        ],
        href: "/products?bundle=weekend",
    },
];

// ─── Style Tile ───────────────────────────────────────────────────────────────

const StyleTile = ({ tile }: { tile: typeof STYLE_TILES[number] }) => (
    <Link
        href={tile.href}
        className="group relative overflow-hidden rounded-sm flex-1 min-w-0"
        style={{ minHeight: "280px" }}
    >
        {/* Background image */}
        <div className="absolute inset-0">
            <Image
                src={tile.image}
                alt={tile.label}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
            />
            {/* Dark overlay */}
            <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.1) 100%)" }}
            />
        </div>

        {/* Bottom band */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-base leading-tight mb-1">{tile.label}</p>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                {tile.badge}
            </p>
        </div>

        {/* Hover arrow */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                <ArrowRight size={14} className="text-gray-900" />
            </div>
        </div>
    </Link>
);

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
            <button className="h-9 px-5 bg-gray-900 text-white text-sm font-bold rounded-sm hover:bg-black transition-colors">
                Create account
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors underline underline-offset-2">
                Log in
            </button>
        </div>
    </div>
);

// ─── Bundle Card ─────────────────────────────────────────────────────────────

const BundleCard = ({ bundle }: { bundle: typeof BUNDLES[number] }) => (
    <Link
        href={bundle.href}
        className="group block border border-gray-100 rounded-sm overflow-hidden hover:border-gray-300 transition-colors bg-white"
    >
        {/* Product thumbnails */}
        <div className="flex h-40">
            {bundle.products.map((p, i) => (
                <div key={i} className="relative flex-1">
                    <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover object-top"
                        sizes="150px"
                    />
                </div>
            ))}
        </div>

        {/* Bundle footer */}
        <div className="p-4 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{bundle.name}</p>
                <p className="text-xs text-gray-400">Curated for your fit</p>
            </div>
            <span className="text-xs font-bold text-gray-900 border border-gray-200 rounded-sm px-3 py-1.5 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                View set
            </span>
        </div>
    </Link>
);

// ─── Main export ─────────────────────────────────────────────────────────────

export const Recommendations = () => {
    const [, setHovered] = useState<string | null>(null);

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

            {/* Style tiles — 5-across desktop, 2-col tablet, 1-col mobile */}
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

            {/* Bottom row: auth state determines content */}
            {IS_LOGGED_IN ? (
                <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Picked for your fit
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {BUNDLES.map((bundle) => (
                            <BundleCard key={bundle.id} bundle={bundle} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SignUpNudge />
                    {/* Show first 2 bundles as preview even logged out */}
                    <div className="grid grid-cols-2 gap-3">
                        {BUNDLES.slice(0, 2).map((bundle) => (
                            <div key={bundle.id} className="relative">
                                <BundleCard bundle={bundle} />
                                {/* Blur overlay nudging sign-in */}
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-sm flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-500">Sign in to unlock</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};
