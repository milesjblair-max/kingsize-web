"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFit, FitOption } from "@/features/fit/FitContext";

// ─── Placeholder product data ──────────────────────────────────────────────────
// Products tagged with fit metadata. In full implementation these would be
// fetched from the API with a fit filter. Tags: big, tall, bigTall
type FitTag = "big" | "tall" | "bigTall";

interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    fitTags: FitTag[];
    badge?: string;
}

const PLACEHOLDER_PRODUCTS: Product[] = [
    { id: "1", name: "Classic Polo", price: "$49.99", category: "New In", fitTags: ["big", "bigTall"], badge: "New" },
    { id: "2", name: "Stretch Chino", price: "$79.99", category: "New In", fitTags: ["tall", "bigTall"] },
    { id: "3", name: "Relaxed Fit Linen Shirt", price: "$69.99", category: "New In", fitTags: ["big", "bigTall"], badge: "New" },
    { id: "4", name: "Tall Tee 3-Pack", price: "$39.99", category: "New In", fitTags: ["tall"], badge: "New" },
    { id: "5", name: "Business Shirt", price: "$89.99", category: "Best Sellers", fitTags: ["big", "tall", "bigTall"], badge: "Best Seller" },
    { id: "6", name: "Straight Leg Jean", price: "$99.99", category: "Best Sellers", fitTags: ["big", "bigTall"] },
    { id: "7", name: "Tall Chino", price: "$84.99", category: "Best Sellers", fitTags: ["tall", "bigTall"], badge: "Best Seller" },
    { id: "8", name: "Quarter Zip Fleece", price: "$79.99", category: "Best Sellers", fitTags: ["big", "tall", "bigTall"] },
    { id: "9", name: "Cotton Crew Tee", price: "$24.99", category: "Essentials", fitTags: ["big", "bigTall"] },
    { id: "10", name: "Elastic Waist Short", price: "$44.99", category: "Essentials", fitTags: ["big"] },
    { id: "11", name: "Tall Boxer Brief 3-Pack", price: "$34.99", category: "Essentials", fitTags: ["tall", "bigTall"] },
    { id: "12", name: "Stretch Belt", price: "$19.99", category: "Essentials", fitTags: ["big", "tall", "bigTall"] },
];

const FIT_TAG_MAP: Record<NonNullable<FitOption>, FitTag> = {
    "big": "big",
    "tall": "tall",
    "big-tall": "bigTall",
};

const RAILS = ["New In", "Best Sellers", "Essentials"] as const;

// ─── Product card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }: { product: Product }) => (
    <div
        className="flex-shrink-0 group cursor-pointer"
        style={{ width: 180 }}
    >
        {/* Image placeholder */}
        <div
            className="relative mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
            style={{ height: 220 }}
        >
            <span className="text-3xl opacity-20">👔</span>
            {product.badge && (
                <span
                    className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{ background: "#111", color: "#fff" }}
                >
                    {product.badge}
                </span>
            )}
        </div>
        <p className="text-xs font-bold text-gray-900 leading-tight mb-0.5 group-hover:underline underline-offset-2">
            {product.name}
        </p>
        <p className="text-xs text-gray-500">{product.price}</p>
    </div>
);

// ─── Product rail ─────────────────────────────────────────────────────────────
const ProductRail = ({ title, products }: { title: string; products: Product[] }) => {
    if (products.length === 0) return null;
    return (
        <section className="mb-12">
            <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
                <Link href="#" className="text-xs text-gray-500 hover:text-gray-800 font-medium underline underline-offset-2">
                    View all
                </Link>
            </div>
            <div
                className="flex gap-4"
                style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
    );
};

// ─── Fit Landing Page ─────────────────────────────────────────────────────────
interface FitLandingPageProps {
    fit: NonNullable<FitOption>;
    heading: string;
    subheading: string;
    accentColor?: string;
}

export const FitLandingPage = ({ fit, heading, subheading }: FitLandingPageProps) => {
    const { setFit, fit: activeFit } = useFit();

    // Set the fit context when landing here so other parts of the site reflect it
    useEffect(() => {
        if (activeFit !== fit) setFit(fit);
    }, [fit, activeFit, setFit]);

    const fitTag = FIT_TAG_MAP[fit];
    const filtered = PLACEHOLDER_PRODUCTS.filter((p) => p.fitTags.includes(fitTag));

    const FIT_LABEL = { "big": "Big", "tall": "Tall", "big-tall": "Big and Tall" }[fit];

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero */}
            <div
                className="relative overflow-hidden flex items-center"
                style={{
                    minHeight: "clamp(180px, 22vw, 280px)",
                    background: "linear-gradient(120deg, #0E1A2B 0%, #122238 60%, #142640 100%)",
                }}
            >
                {/* Fit badge */}
                <span
                    aria-hidden="true"
                    className="absolute right-12 font-bold select-none hidden md:block"
                    style={{
                        fontSize: "clamp(60px, 9vw, 130px)",
                        color: "rgba(255,255,255,0.04)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        pointerEvents: "none",
                    }}
                >
                    {FIT_LABEL}
                </span>

                <div
                    className="relative z-10"
                    style={{ paddingLeft: "clamp(24px, 8vw, 120px)", paddingRight: "clamp(24px, 5vw, 60px)" }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="flex-shrink-0 mt-2"
                            style={{
                                width: 4,
                                height: "clamp(32px, 4vw, 52px)",
                                background: "linear-gradient(to bottom, #C9A96E, #A8885A)",
                                borderRadius: 2,
                            }}
                        />
                        <div>
                            {/* Breadcrumb */}
                            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                                Shop by Fit — {FIT_LABEL}
                            </p>
                            <h1
                                className="font-bold text-white mb-3"
                                style={{
                                    fontSize: "clamp(22px, 3.5vw, 46px)",
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {heading}
                            </h1>
                            <p
                                className="hidden sm:block"
                                style={{
                                    fontSize: "clamp(13px, 1.3vw, 17px)",
                                    color: "rgba(255,255,255,0.62)",
                                    maxWidth: 520,
                                    lineHeight: 1.6,
                                }}
                            >
                                {subheading}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rails */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                {RAILS.map((rail) => (
                    <ProductRail
                        key={rail}
                        title={rail}
                        products={filtered.filter((p) => p.category === rail)}
                    />
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        No products tagged for this fit yet. Check back soon.
                    </div>
                )}
            </div>
        </div>
    );
};
