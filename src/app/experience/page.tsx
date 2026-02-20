"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Auth stub (replace with real session hook) ───────────────────────────────
const IS_LOGGED_IN = false;

// ─── Featured looks ───────────────────────────────────────────────────────────
const LOOKS = [
    {
        id: 1,
        name: "Smart Weekend",
        image: "/images/new-arrivals/nautica-polo2.jpg",
        brand: "Nautica",
        bullets: ["Relaxed polo fit", "Available in 2XL–6XL", "Pairs with chinos or shorts"],
        inRoom: [
            { name: "GM Polo", image: "/images/new-arrivals/gm-polo.jpg" },
            { name: "KAM Shorts", image: "/images/new-arrivals/kam-shorts-blue.jpg" },
        ],
    },
    {
        id: 2,
        name: "Warm Weather Set",
        image: "/images/new-arrivals/cm-tshirt.jpg",
        brand: "Civil Male",
        bullets: ["Lightweight cotton tee", "XL–5XL extended sizing", "Easy casual layering"],
        inRoom: [
            { name: "Nau Shorts", image: "/images/new-arrivals/nau-shorts.jpg" },
            { name: "HK Tee", image: "/images/new-arrivals/hk-tshirt.jpg" },
        ],
    },
    {
        id: 3,
        name: "Sport & Street",
        image: "/images/new-arrivals/gm-polo2.jpg",
        brand: "GM Active",
        bullets: ["Moisture-wicking polo", "Big & Tall proportions", "Gym or weekend ready"],
        inRoom: [
            { name: "GM Shorts", image: "/images/new-arrivals/gm-shorts-blue.jpg" },
            { name: "JJ Tee", image: "/images/new-arrivals/jj-tshirt-blk.jpg" },
        ],
    },
];

// ─── Parallax Room Background ─────────────────────────────────────────────────
const RoomBackground = ({ mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
    const panX = (mouseX - 0.5) * -24;
    const panY = (mouseY - 0.5) * -12;

    return (
        <div
            className="absolute inset-0 overflow-hidden"
            style={{ transform: `translate(${panX}px, ${panY}px) scale(1.08)`, transition: "transform 0.6s ease-out" }}
        >
            {/* Base room gradient — warm neutral grey */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(175deg, #e8e4df 0%, #d6d0c8 40%, #c8c0b4 100%)",
                }}
            />

            {/* Floor line */}
            <div
                className="absolute w-full"
                style={{
                    bottom: "28%",
                    height: "1px",
                    background: "rgba(120,110,100,0.3)",
                    boxShadow: "0 0 40px 20px rgba(120,110,100,0.12)",
                }}
            />

            {/* Left wall panel lines — architectural feel */}
            {[18, 22, 26].map((left) => (
                <div
                    key={left}
                    className="absolute"
                    style={{
                        left: `${left}%`,
                        top: "8%",
                        bottom: "28%",
                        width: "1px",
                        background: "rgba(100,90,80,0.15)",
                    }}
                />
            ))}

            {/* Right wall panel lines */}
            {[74, 78, 82].map((left) => (
                <div
                    key={left}
                    className="absolute"
                    style={{
                        left: `${left}%`,
                        top: "8%",
                        bottom: "28%",
                        width: "1px",
                        background: "rgba(100,90,80,0.15)",
                    }}
                />
            ))}

            {/* Mirror frame left */}
            <div
                className="absolute"
                style={{
                    left: "12%",
                    top: "6%",
                    width: "10%",
                    bottom: "30%",
                    border: "2px solid rgba(80,70,60,0.2)",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(2px)",
                }}
            />

            {/* Soft ceiling light */}
            <div
                className="absolute"
                style={{
                    top: 0,
                    left: "20%",
                    right: "20%",
                    height: "30%",
                    background: "radial-gradient(ellipse at 50% 0%, rgba(255,252,245,0.6) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            {/* Floor — slightly darker */}
            <div
                className="absolute w-full"
                style={{
                    bottom: 0,
                    height: "28%",
                    background: "linear-gradient(to bottom, #b8b0a4 0%, #a8a098 100%)",
                }}
            />

            {/* Floor reflection shimmer */}
            <div
                className="absolute w-full"
                style={{
                    bottom: "28%",
                    height: "8%",
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, transparent 100%)",
                }}
            />

            {/* Bench */}
            <div
                className="absolute"
                style={{
                    right: "15%",
                    bottom: "28%",
                    width: "14%",
                    height: "6%",
                    background: "#8B7355",
                    borderRadius: "3px 3px 0 0",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
            />
            <div
                className="absolute"
                style={{
                    right: "15.5%",
                    bottom: "22%",
                    width: "13%",
                    height: "6%",
                    background: "#6B5840",
                    borderRadius: "0 0 2px 2px",
                }}
            />
        </div>
    );
};

// ─── Virtual Room Hero ────────────────────────────────────────────────────────
const VirtualRoomHero = () => {
    const [lookIdx, setLookIdx] = useState(0);
    const [picks, setPicks] = useState<number[]>([]);
    const [mouseX, setMouseX] = useState(0.5);
    const [mouseY, setMouseY] = useState(0.5);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const look = LOOKS[lookIdx];

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMouseX((e.clientX - rect.left) / rect.width);
        setMouseY((e.clientY - rect.top) / rect.height);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("mousemove", handleMouseMove);
        return () => el.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    const prev = () => setLookIdx((i) => (i - 1 + LOOKS.length) % LOOKS.length);
    const next = () => setLookIdx((i) => (i + 1) % LOOKS.length);

    const togglePick = () => {
        setPicks((prev) =>
            prev.includes(look.id) ? prev.filter((id) => id !== look.id) : [...prev, look.id]
        );
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
        touchStartX.current = null;
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden select-none"
            style={{ height: "clamp(420px, 65vh, 700px)" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <RoomBackground mouseX={mouseX} mouseY={mouseY} />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0" style={{ background: "rgba(20,16,12,0.28)" }} />

            {/* ─── UI Frame ─── */}
            <div className="absolute inset-0 flex items-stretch px-4 md:px-8 py-6 gap-4">

                {/* Left: In the room */}
                <div
                    className="hidden md:flex flex-col justify-center gap-3 flex-shrink-0"
                    style={{ width: "clamp(80px, 12vw, 130px)" }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
                        In the room
                    </p>
                    {look.inRoom.map((item) => (
                        <div
                            key={item.name}
                            className="rounded-lg overflow-hidden border border-white/20 shadow-lg"
                            style={{ aspectRatio: "3/4", background: "#1a1612" }}
                        >
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={130}
                                height={173}
                                className="w-full h-full object-cover opacity-90"
                            />
                        </div>
                    ))}
                </div>

                {/* Centre: Featured product card */}
                <div className="flex-1 flex flex-col items-center justify-center relative">

                    {/* Card */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{
                            width: "clamp(200px, 28vw, 340px)",
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        {/* Product image */}
                        <div
                            className="relative overflow-hidden"
                            style={{ aspectRatio: "3/4" }}
                        >
                            <Image
                                src={look.image}
                                alt={look.name}
                                fill
                                className="object-cover"
                                sizes="340px"
                            />
                            {/* Badge */}
                            <span
                                className="absolute top-3 left-3 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                                style={{ background: "#0E1A2B", color: "#C9A96E" }}
                            >
                                {IS_LOGGED_IN ? "Recommended for your fit" : "Try this look"}
                            </span>
                        </div>

                        {/* Card body */}
                        <div className="px-4 py-4">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{look.brand}</p>
                            <h3 className="font-bold text-gray-900 text-base mb-2">{look.name}</h3>
                            <ul className="space-y-1 mb-4">
                                {look.bullets.map((b) => (
                                    <li key={b} className="text-xs text-gray-500 flex items-start gap-1">
                                        <span className="text-amber-600 mt-0.5">·</span> {b}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                onClick={togglePick}
                                className="w-full py-2.5 text-sm font-bold rounded-lg transition-all"
                                style={{
                                    background: picks.includes(look.id) ? "#0E1A2B" : "#C9A96E",
                                    color: picks.includes(look.id) ? "#C9A96E" : "#0E1A2B",
                                }}
                            >
                                {picks.includes(look.id)
                                    ? "✓ Saved"
                                    : IS_LOGGED_IN
                                        ? "Save this look"
                                        : "Sign in to save"}
                            </button>

                            {!IS_LOGGED_IN && (
                                <p className="text-center text-xs text-gray-400 mt-2 leading-snug">
                                    <Link href="#" className="underline hover:text-gray-700">Sign in</Link> for personalised recommendations
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Arrows */}
                    <div className="flex items-center gap-6 mt-5">
                        <button
                            onClick={prev}
                            aria-label="Previous look"
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all hover:scale-110"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                        >
                            ‹
                        </button>
                        <span className="text-xs text-white/50 tabular-nums">
                            {lookIdx + 1} / {LOOKS.length}
                        </span>
                        <button
                            onClick={next}
                            aria-label="Next look"
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all hover:scale-110"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Right: Your picks */}
                <div
                    className="hidden md:flex flex-col justify-center items-center gap-3 flex-shrink-0"
                    style={{ width: "clamp(80px, 12vw, 130px)" }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 text-center">
                        Your picks
                    </p>
                    <div
                        className="w-full rounded-xl flex flex-col items-center justify-center gap-2 py-6"
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                        <span
                            className="text-3xl font-bold"
                            style={{ color: "#C9A96E" }}
                        >
                            {picks.length}
                        </span>
                        <span className="text-xs text-white/50">saved {picks.length === 1 ? "look" : "looks"}</span>
                    </div>
                    {picks.length > 0 && (
                        <button
                            onClick={() => setPicks([])}
                            className="text-xs text-white/40 hover:text-white/70 underline transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-4">
                <p className="text-xs text-white/30 text-center">
                    Move your mouse to look around · Swipe on mobile
                </p>
            </div>
        </div>
    );
};

// ─── Vision Section ───────────────────────────────────────────────────────────
const CAPABILITY_CARDS = [
    {
        icon: "◎",
        title: "Fit Profile",
        desc: "Save your sizing and preferences once, so you never have to guess which size is right again.",
    },
    {
        icon: "⊡",
        title: "One Account",
        desc: "A single login that keeps your details, orders, and returns in one place — in-store and online.",
    },
    {
        icon: "◈",
        title: "Smarter Recommendations",
        desc: "Suggestions and outfit pairing based on your fit, what you've bought before, and what's in season.",
    },
];

const HOW_IT_WORKS = [
    { step: "01", label: "Save your fit", sub: "Tell us your size once" },
    { step: "02", label: "Get matched automatically", sub: "We recommend what fits you" },
    { step: "03", label: "Shop with confidence", sub: "Less guesswork, more the right choice" },
];

const VisionSection = () => (
    <section
        className="py-20 px-4"
        style={{ background: "#FAFAF9", maxWidth: "100vw", overflowX: "hidden" }}
    >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            {/* Heading */}
            <div className="mb-12 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Our direction</p>
                <h2
                    className="font-bold text-gray-900"
                    style={{ fontSize: "clamp(24px, 3.5vw, 40px)", lineHeight: 1.2 }}
                >
                    Where Kingsize is heading
                </h2>
            </div>

            {/* 3 punchy statements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                {[
                    { label: "Built around your fit", icon: "→" },
                    { label: "Recommendations that get better over time", icon: "→" },
                    { label: "A smoother experience in-store and online", icon: "→" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="flex items-start gap-3 p-5 rounded-xl"
                        style={{ background: "#fff", border: "1px solid #E5E1DC" }}
                    >
                        <span className="text-amber-600 font-bold text-lg flex-shrink-0 mt-0.5">{s.icon}</span>
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Short paragraph */}
            <p
                className="text-gray-500 text-center mb-14 mx-auto"
                style={{ fontSize: "clamp(14px, 1.6vw, 17px)", lineHeight: 1.75, maxWidth: "640px" }}
            >
                Kingsize is building a single customer profile — combining your fit, preferences, and order
                history — so the site can recommend what will actually fit you, and pair items into complete
                outfits. The goal is simple: fewer returns, less guesswork, and a shopping experience that
                feels like it knows your size.
            </p>

            {/* 3 capability cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {CAPABILITY_CARDS.map((card) => (
                    <div
                        key={card.title}
                        className="p-6 rounded-2xl flex flex-col gap-3"
                        style={{ background: "#fff", border: "1px solid #E5E1DC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                    >
                        <span
                            className="text-2xl"
                            style={{ color: "#0E1A2B" }}
                        >
                            {card.icon}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base">{card.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div
                className="mx-auto mb-14"
                style={{ width: "48px", height: "2px", background: "#C9A96E", borderRadius: "1px" }}
            />

            {/* How it works — 3 step horizontal flow */}
            <div className="text-center mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
                    How it works
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
                    {HOW_IT_WORKS.map((item, i) => (
                        <div key={item.step} className="flex flex-col items-center relative">
                            {/* Connector line */}
                            {i < HOW_IT_WORKS.length - 1 && (
                                <div
                                    className="hidden md:block absolute top-5 left-1/2 w-full h-px"
                                    style={{ background: "linear-gradient(to right, #C9A96E, #E5E1DC)" }}
                                />
                            )}
                            {/* Step number circle */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-4 relative z-10"
                                style={{ background: "#0E1A2B", color: "#C9A96E" }}
                            >
                                {item.step}
                            </div>
                            <p className="font-bold text-gray-900 text-sm mb-1">{item.label}</p>
                            <p className="text-xs text-gray-400 max-w-[180px]">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-12">
                <Link
                    href="/products"
                    className="inline-block px-8 py-3.5 text-sm font-bold rounded-lg transition-all hover:opacity-90"
                    style={{ background: "#0E1A2B", color: "#C9A96E" }}
                >
                    Browse the full range →
                </Link>
                <p className="text-xs text-gray-400 mt-3">
                    Coming soon: personalised fit profiles · smarter outfit suggestions
                </p>
            </div>
        </div>
    </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExperiencePage() {
    return (
        <main>
            {/* Page header */}
            <div
                className="border-b border-gray-100"
                style={{ background: "#0E1A2B", padding: "clamp(20px, 4vw, 36px) clamp(16px, 5vw, 48px)" }}
            >
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <Link
                        href="/"
                        className="text-xs text-white/40 hover:text-white/70 transition-colors mb-3 inline-block"
                    >
                        ← Back to home
                    </Link>
                    <h1
                        className="font-bold text-white"
                        style={{ fontSize: "clamp(20px, 3vw, 32px)", lineHeight: 1.2 }}
                    >
                        The new Kingsize experience
                    </h1>
                    <p
                        className="mt-2"
                        style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(13px, 1.5vw, 16px)" }}
                    >
                        A preview of where we&apos;re heading — smarter fit, better recommendations, one account.
                    </p>
                </div>
            </div>

            {/* Virtual room */}
            <VirtualRoomHero />

            {/* Vision section */}
            <VisionSection />
        </main>
    );
}
