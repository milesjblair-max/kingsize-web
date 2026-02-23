"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { BRANDS, POPULAR_BRANDS, groupByLetter, type Brand } from "@/features/brands/brandData";

// ─── Logo tile ──────────────────────────────────────────────────────────────

function BrandCard({ brand, large = false }: { brand: Brand; large?: boolean }) {
    const [imgFailed, setImgFailed] = useState(false);
    const size = large ? { card: 160, img: 100, imgH: 64 } : { card: 120, img: 80, imgH: 48 };

    return (
        <Link
            href={brand.href}
            className="flex flex-col items-center gap-2 group"
            aria-label={brand.name}
        >
            <div
                className="flex items-center justify-center rounded-xl bg-white border border-gray-100 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-200"
                style={{ width: size.card, height: large ? 100 : 76 }}
            >
                {brand.logoFile && !imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={`/brand-logos/${brand.logoFile}`}
                        alt={brand.name}
                        onError={() => setImgFailed(true)}
                        style={{ maxWidth: size.img, maxHeight: size.imgH, objectFit: "contain" }}
                    />
                ) : (
                    <span className="text-center font-bold text-gray-600 px-2 leading-tight" style={{ fontSize: 11 }}>
                        {brand.name}
                    </span>
                )}
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors text-center leading-tight max-w-[120px]">
                {brand.name}
            </span>
        </Link>
    );
}

// ─── A-Z jump list ─────────────────────────────────────────────────────────

function AlphaJump({ letters, activeRef }: { letters: string[]; activeRef: React.RefObject<string> }) {
    const scrollTo = (letter: string) => {
        const el = document.getElementById(`brand-group-${letter}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav aria-label="Jump to brand letter" className="flex flex-col gap-0.5">
            {letters.map((l) => (
                <button
                    key={l}
                    onClick={() => scrollTo(l)}
                    className="w-7 h-7 rounded-md text-xs font-bold text-gray-500 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center"
                    aria-label={`Scroll to brands starting with ${l}`}
                >
                    {l}
                </button>
            ))}
        </nav>
    );
}

// ─── Brands page ───────────────────────────────────────────────────────────

export default function BrandsPage() {
    const [query, setQuery] = useState("");
    const alphaRef = useRef("");

    const filteredBrands = useMemo(() => {
        const q = query.toLowerCase().trim();
        return q ? BRANDS.filter((b) => b.name.toLowerCase().includes(q)) : BRANDS;
    }, [query]);

    const grouped = useMemo(() => groupByLetter(filteredBrands), [filteredBrands]);
    const letters = Object.keys(grouped).sort();
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">All Brands</h1>
                    <p className="text-sm text-gray-500">
                        {BRANDS.length} brands stocked across big &amp; tall menswear
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <input
                        type="search"
                        placeholder="Search brand name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full max-w-sm h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
                        aria-label="Search brands"
                    />
                </div>

                {/* Popular brands section — only shown when not searching */}
                {!query && (
                    <section className="mb-10" aria-label="Popular brands">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">Popular brands</p>
                        <div className="flex flex-wrap gap-4">
                            {POPULAR_BRANDS.map((brand) => (
                                <BrandCard key={brand.id} brand={brand} large />
                            ))}
                        </div>
                    </section>
                )}

                {/* A-Z jump (desktop sticky) + full grid */}
                <div className="flex gap-6 items-start">

                    {/* A-Z jump — sticky on desktop, hidden on mobile when searching */}
                    {!query && (
                        <aside
                            className="hidden lg:block flex-shrink-0"
                            style={{ position: "sticky", top: 88 }}
                        >
                            <AlphaJump letters={allLetters} activeRef={alphaRef} />
                        </aside>
                    )}

                    {/* Brand grid grouped by letter */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile A-Z pills (only when not searching) */}
                        {!query && (
                            <div className="lg:hidden flex flex-wrap gap-1.5 mb-6">
                                {allLetters.map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => {
                                            const el = document.getElementById(`brand-group-${l}`);
                                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }}
                                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                                        style={{
                                            background: letters.includes(l) ? "#111" : "#F3F4F6",
                                            color: letters.includes(l) ? "#fff" : "#9CA3AF",
                                            cursor: letters.includes(l) ? "pointer" : "default",
                                        }}
                                        disabled={!letters.includes(l)}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        )}

                        {letters.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-sm text-gray-400">No brands found for &ldquo;{query}&rdquo;</p>
                            </div>
                        )}

                        {letters.map((letter) => (
                            <section key={letter} id={`brand-group-${letter}`} className="mb-8 scroll-mt-24">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                                    {letter}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {grouped[letter].map((brand) => (
                                        <BrandCard key={brand.id} brand={brand} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
