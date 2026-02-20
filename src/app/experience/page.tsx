"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const IS_LOGGED_IN = false;

// ─── Looks data ───────────────────────────────────────────────────────────────
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

// ─── Hotspot config ───────────────────────────────────────────────────────────
const HOTSPOTS = [
    {
        id: "outfit",
        label: "Outfit ideas",
        x: "22%",
        y: "52%",
        tip: "Browse complete looks curated for your size and style preferences.",
        href: "#vision",
    },
    {
        id: "fit",
        label: "Fit profile",
        x: "72%",
        y: "44%",
        tip: "Save your measurements once — we handle the rest every time you shop.",
        href: "#less-hassle",
    },
    {
        id: "trending",
        label: "Trending now",
        x: "48%",
        y: "18%",
        tip: "We surface in-season picks that match your fit without you having to search.",
        href: "#vision",
    },
];

// ─── Realistic Room Background (multi-layer parallax) ─────────────────────────
type Vec2 = { x: number; y: number };

const RoomBackground = ({ pan }: { pan: Vec2 }) => {
    // Foreground moves 1.4× faster, background 0.6×
    const bg = { x: pan.x * 0.6, y: pan.y * 0.6 };
    const mid = { x: pan.x * 1.0, y: pan.y * 1.0 };
    const fg = { x: pan.x * 1.4, y: pan.y * 1.4 };

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* ─ Layer 0: deep wall / ambient sky ─ */}
            <div
                className="absolute inset-[-8%]"
                style={{
                    transform: `translate(${bg.x}px, ${bg.y}px)`,
                    background: "linear-gradient(170deg, #EAE4DC 0%, #D8D0C4 45%, #C8BEB0 100%)",
                    willChange: "transform",
                }}
            />

            {/* ─ Layer 1: wall panelling + texture ─ */}
            <div
                className="absolute inset-[-8%]"
                style={{
                    transform: `translate(${mid.x}px, ${mid.y}px)`,
                    willChange: "transform",
                }}
            >
                {/* Wainscoting top rail */}
                <div
                    className="absolute w-full"
                    style={{
                        top: "34%",
                        height: "2px",
                        background: "linear-gradient(to right, transparent 0%, rgba(90,78,65,0.22) 15%, rgba(90,78,65,0.22) 85%, transparent 100%)",
                    }}
                />

                {/* Raised wall panel boxes — left wall */}
                {[
                    { l: "4%", t: "10%", w: "8%", h: "22%" },
                    { l: "4%", t: "36%", w: "8%", h: "22%" },
                    { l: "14%", t: "10%", w: "8%", h: "22%" },
                    { l: "14%", t: "36%", w: "8%", h: "22%" },
                ].map((p, i) => (
                    <div
                        key={`lp${i}`}
                        className="absolute"
                        style={{
                            left: p.l, top: p.t, width: p.w, height: p.h,
                            border: "1px solid rgba(90,78,65,0.14)",
                            borderRadius: "2px",
                            boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.08)",
                        }}
                    />
                ))}

                {/* Raised wall panel boxes — right wall */}
                {[
                    { l: "78%", t: "10%", w: "8%", h: "22%" },
                    { l: "78%", t: "36%", w: "8%", h: "22%" },
                    { l: "88%", t: "10%", w: "8%", h: "22%" },
                    { l: "88%", t: "36%", w: "8%", h: "22%" },
                ].map((p, i) => (
                    <div
                        key={`rp${i}`}
                        className="absolute"
                        style={{
                            left: p.l, top: p.t, width: p.w, height: p.h,
                            border: "1px solid rgba(90,78,65,0.14)",
                            borderRadius: "2px",
                            boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.08)",
                        }}
                    />
                ))}

                {/* Full-length mirror — left */}
                <div
                    className="absolute"
                    style={{
                        left: "6%", top: "5%", width: "9%", bottom: "32%",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(220,215,205,0.2) 60%, rgba(180,170,160,0.15) 100%)",
                        border: "3px solid rgba(80,68,54,0.3)",
                        borderRadius: "3px",
                        boxShadow: "4px 0 24px rgba(0,0,0,0.1), inset 2px 2px 0 rgba(255,255,255,0.4)",
                    }}
                >
                    {/* Mirror highlight streak */}
                    <div
                        className="absolute"
                        style={{
                            top: 0, left: "15%", width: "8%", bottom: 0,
                            background: "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 100%)",
                        }}
                    />
                </div>

                {/* Mirror frame top bar */}
                <div
                    className="absolute"
                    style={{
                        left: "5%", top: "4%", width: "11%", height: "1.5%",
                        background: "rgba(80,68,54,0.4)",
                        borderRadius: "2px 2px 0 0",
                    }}
                />

                {/* Floor line */}
                <div
                    className="absolute w-full"
                    style={{
                        bottom: "31%",
                        height: "1px",
                        background: "rgba(90,78,65,0.25)",
                    }}
                />

                {/* Floor — warm hardwood */}
                <div
                    className="absolute w-full"
                    style={{
                        bottom: 0,
                        height: "32%",
                        background: "linear-gradient(to bottom, #B8A898 0%, #A8987C 40%, #987860 100%)",
                    }}
                />

                {/* Floor planks (subtle) */}
                {[10, 22, 34, 46, 58, 70, 82].map((left) => (
                    <div
                        key={`fp${left}`}
                        className="absolute"
                        style={{
                            left: `${left}%`,
                            bottom: 0,
                            height: "32%",
                            width: "1px",
                            background: "rgba(80,60,40,0.12)",
                        }}
                    />
                ))}

                {/* Floor reflection */}
                <div
                    className="absolute w-full"
                    style={{
                        bottom: "31%",
                        height: "6%",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)",
                    }}
                />
            </div>

            {/* ─ Layer 2: foreground elements (bench, clothing rack) ─ */}
            <div
                className="absolute inset-[-8%]"
                style={{
                    transform: `translate(${fg.x}px, ${fg.y}px)`,
                    willChange: "transform",
                }}
            >
                {/* Bench top */}
                <div
                    className="absolute"
                    style={{
                        right: "9%", bottom: "34%", width: "16%", height: "4%",
                        background: "linear-gradient(to bottom, #9B8060, #7A6040)",
                        borderRadius: "4px 4px 0 0",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                />
                {/* Bench legs */}
                <div className="absolute" style={{ right: "10%", bottom: "28%", width: "2%", height: "6%", background: "#5A4428" }} />
                <div className="absolute" style={{ right: "23%", bottom: "28%", width: "2%", height: "6%", background: "#5A4428" }} />
                {/* Bench cushion line */}
                <div
                    className="absolute"
                    style={{
                        right: "9%", bottom: "37.5%", width: "16%", height: "1px",
                        background: "rgba(60,40,20,0.3)",
                    }}
                />

                {/* Clothing rack — far right */}
                <div
                    className="absolute"
                    style={{
                        right: "1%", top: "15%", width: "0.5%", bottom: "32%",
                        background: "linear-gradient(to bottom, #888, #666)",
                        borderRadius: "2px",
                        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
                    }}
                />
                {/* Rack horizontal bar */}
                <div
                    className="absolute"
                    style={{
                        right: "0%", top: "15%", width: "4%", height: "0.8%",
                        background: "#888",
                        borderRadius: "2px",
                    }}
                />
                {/* Rack base */}
                <div
                    className="absolute"
                    style={{
                        right: "0%", bottom: "31%", width: "3%", height: "1%",
                        background: "#666",
                        borderRadius: "4px",
                    }}
                />
            </div>

            {/* ─ Lighting overlays (ambient) ─ */}
            {/* Ceiling spot */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: 0, left: "15%", right: "15%", height: "45%",
                    background: "radial-gradient(ellipse at 50% 0%, rgba(255,250,240,0.65) 0%, transparent 65%)",
                }}
            />
            {/* Left wall bounce */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: 0, left: 0, width: "25%", bottom: 0,
                    background: "linear-gradient(to right, rgba(255,245,230,0.12) 0%, transparent 100%)",
                }}
            />
        </div>
    );
};

// ─── Ambient vignette ─────────────────────────────────────────────────────────
const Vignette = ({ pan }: { pan: Vec2 }) => {
    const cx = 50 + pan.x * 0.2;
    const cy = 50 + pan.y * 0.2;
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: `radial-gradient(ellipse 80% 80% at ${cx}% ${cy}%, transparent 30%, rgba(10,8,6,0.55) 100%)`,
                transition: "background 0.4s ease",
            }}
        />
    );
};

// ─── Hotspot ─────────────────────────────────────────────────────────────────
const Hotspot = ({
    hotspot, onClick, isOpen,
}: {
    hotspot: typeof HOTSPOTS[number];
    onClick: () => void;
    isOpen: boolean;
}) => (
    <div className="absolute" style={{ left: hotspot.x, top: hotspot.y, transform: "translate(-50%,-50%)", zIndex: 20 }}>
        {/* Pulsing dot */}
        <button
            onClick={onClick}
            aria-label={hotspot.label}
            className="relative flex items-center justify-center"
            style={{ width: 28, height: 28 }}
        >
            {/* Outer pulse ring */}
            <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "rgba(201,169,110,0.4)", animationDuration: "2.2s" }}
            />
            {/* Inner dot */}
            <span
                className="relative rounded-full z-10"
                style={{
                    width: 12, height: 12,
                    background: isOpen ? "#C9A96E" : "rgba(255,255,255,0.85)",
                    border: "2px solid #C9A96E",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    transition: "background 0.2s",
                }}
            />
        </button>

        {/* Tooltip */}
        {isOpen && (
            <div
                className="absolute z-30"
                style={{
                    bottom: "calc(100% + 10px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(14,26,43,0.97)",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    minWidth: "180px",
                    maxWidth: "220px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
            >
                <p className="text-xs font-bold text-amber-400 mb-1 uppercase tracking-wider">{hotspot.label}</p>
                <p className="text-xs text-white/70 leading-relaxed mb-2">{hotspot.tip}</p>
                <a
                    href={hotspot.href}
                    onClick={(e) => { e.stopPropagation(); }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                    Learn more →
                </a>
                {/* Caret */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 10, height: 6,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: 10, height: 10,
                            background: "rgba(14,26,43,0.97)",
                            border: "1px solid rgba(201,169,110,0.3)",
                            transform: "rotate(45deg) translate(-3px, 3px)",
                        }}
                    />
                </div>
            </div>
        )}
    </div>
);

// ─── Virtual Room Hero ────────────────────────────────────────────────────────
const VirtualRoomHero = () => {
    const [lookIdx, setLookIdx] = useState(0);
    const [picks, setPicks] = useState<number[]>([]);
    const [openHotspot, setOpenHotspot] = useState<string | null>(null);

    // Smooth inertia pan
    const targetPan = useRef<Vec2>({ x: 0, y: 0 });
    const currentPan = useRef<Vec2>({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const [displayPan, setDisplayPan] = useState<Vec2>({ x: 0, y: 0 });

    // Animation loop with inertia
    useEffect(() => {
        const animate = () => {
            const lerp = 0.08; // inertia factor
            currentPan.current.x += (targetPan.current.x - currentPan.current.x) * lerp;
            currentPan.current.y += (targetPan.current.y - currentPan.current.y) * lerp;
            setDisplayPan({ x: currentPan.current.x, y: currentPan.current.y });
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetPan.current = { x: nx * -28, y: ny * -14 };
    }, []);

    const handleMouseLeave = useCallback(() => {
        targetPan.current = { x: 0, y: 0 };
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    const look = LOOKS[lookIdx];
    const prev = () => setLookIdx((i) => (i - 1 + LOOKS.length) % LOOKS.length);
    const next = () => setLookIdx((i) => (i + 1) % LOOKS.length);
    const togglePick = () => setPicks((p) => p.includes(look.id) ? p.filter((id) => id !== look.id) : [...p, look.id]);

    // Touch swipe
    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        targetPan.current = { x: dx * 0.06, y: 0 };
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 44) { dx > 0 ? prev() : next(); }
        targetPan.current = { x: 0, y: 0 };
        touchStartX.current = null;
    };

    const toggleHotspot = (id: string) => setOpenHotspot((prev) => prev === id ? null : id);

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ height: "clamp(440px, 68vh, 720px)", cursor: "crosshair" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={() => setOpenHotspot(null)}
        >
            <RoomBackground pan={displayPan} />
            <Vignette pan={displayPan} />

            {/* Hotspots */}
            {HOTSPOTS.map((hs) => (
                <Hotspot
                    key={hs.id}
                    hotspot={hs}
                    isOpen={openHotspot === hs.id}
                    onClick={(e?: React.MouseEvent) => { e?.stopPropagation?.(); toggleHotspot(hs.id); }}
                />
            ))}

            {/* ─── UI Frame ─── */}
            <div className="absolute inset-0 flex items-stretch px-3 md:px-8 py-5 gap-3 md:gap-4" style={{ zIndex: 10 }}>

                {/* Left: In the room */}
                <div className="hidden md:flex flex-col justify-center gap-3 flex-shrink-0" style={{ width: "clamp(80px,11vw,124px)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 mb-0.5">In the room</p>
                    {look.inRoom.map((item) => (
                        <div
                            key={item.name}
                            className="rounded-lg overflow-hidden border border-white/20 shadow-lg"
                            style={{ aspectRatio: "3/4", background: "#1a1612" }}
                        >
                            <Image src={item.image} alt={item.name} width={124} height={165} className="w-full h-full object-cover opacity-90" />
                        </div>
                    ))}
                </div>

                {/* Centre: Product card + arrows */}
                <div className="flex-1 flex flex-col items-center justify-center gap-0">
                    {/* Card */}
                    <div
                        className="rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{
                            width: "clamp(190px, 26vw, 320px)",
                            background: "rgba(255,255,255,0.97)",
                            backdropFilter: "blur(16px)",
                        }}
                    >
                        {/* Product image */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                            <Image src={look.image} alt={look.name} fill className="object-cover" sizes="320px" />
                            <span
                                className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                                style={{ background: "#0E1A2B", color: "#C9A96E" }}
                            >
                                {IS_LOGGED_IN ? "For your fit" : "Try this look"}
                            </span>
                        </div>
                        {/* Card body */}
                        <div className="px-4 py-3.5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{look.brand}</p>
                            <h3 className="font-bold text-gray-900 text-sm mb-1.5">{look.name}</h3>
                            <ul className="space-y-0.5 mb-3">
                                {look.bullets.map((b) => (
                                    <li key={b} className="text-[11px] text-gray-500 flex items-start gap-1">
                                        <span className="text-amber-500 mt-0.5 flex-shrink-0">·</span>{b}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={togglePick}
                                className="w-full py-2 text-xs font-bold rounded-lg transition-all"
                                style={{
                                    background: picks.includes(look.id) ? "#0E1A2B" : "#C9A96E",
                                    color: picks.includes(look.id) ? "#C9A96E" : "#0E1A2B",
                                }}
                            >
                                {picks.includes(look.id) ? "✓ Saved" : IS_LOGGED_IN ? "Save this look" : "Sign in to save"}
                            </button>
                            {!IS_LOGGED_IN && (
                                <p className="text-center text-[10px] text-gray-400 mt-1.5 leading-snug">
                                    <Link href="#" className="underline hover:text-gray-700">Sign in</Link> for personalised picks
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Arrows + counter */}
                    <div className="flex items-center gap-5 mt-4">
                        <button
                            onClick={prev}
                            aria-label="Previous look"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
                            style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)" }}
                        >
                            ‹
                        </button>
                        <div className="flex gap-1.5">
                            {LOOKS.map((_, i) => (
                                <span
                                    key={i}
                                    className="rounded-full transition-all"
                                    style={{
                                        width: i === lookIdx ? 18 : 6,
                                        height: 6,
                                        background: i === lookIdx ? "#C9A96E" : "rgba(255,255,255,0.35)",
                                    }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            aria-label="Next look"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
                            style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)" }}
                        >
                            ›
                        </button>
                    </div>

                    {/* Helper text — below arrows, never overlapping */}
                    <p
                        className="hidden md:block text-center mt-3 text-white/30 select-none"
                        style={{ fontSize: "11px", letterSpacing: "0.04em", lineHeight: 1.5 }}
                    >
                        Move your mouse to look around
                    </p>
                    <p
                        className="md:hidden text-center mt-3 text-white/30 select-none"
                        style={{ fontSize: "11px", lineHeight: 1.5 }}
                    >
                        Swipe to look around
                    </p>
                </div>

                {/* Right: Your picks */}
                <div className="hidden md:flex flex-col justify-center items-center gap-3 flex-shrink-0" style={{ width: "clamp(80px,11vw,124px)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 text-center">Your picks</p>
                    <div
                        className="w-full rounded-xl flex flex-col items-center justify-center py-5 gap-1"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}
                    >
                        <span className="text-3xl font-bold" style={{ color: "#C9A96E" }}>{picks.length}</span>
                        <span className="text-[10px] text-white/45">{picks.length === 1 ? "saved look" : "saved looks"}</span>
                    </div>
                    {picks.length > 0 && (
                        <button onClick={() => setPicks([])} className="text-[10px] text-white/35 hover:text-white/60 underline transition-colors">
                            Clear all
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── "Less hassle" section ────────────────────────────────────────────────────
const BENEFIT_CARDS = [
    {
        icon: "↩",
        title: "Fewer returns",
        desc: "We match products to your saved fit so you spend less time sending things back.",
    },
    {
        icon: "✓",
        title: "Confidence in every order",
        desc: "Clearer sizing guidance and better picks mean less second-guessing at checkout.",
    },
    {
        icon: "◎",
        title: "Stay current effortlessly",
        desc: "We surface in-season options that suit your style, without you having to hunt for them.",
    },
];

const LessHassleSection = () => (
    <section
        id="less-hassle"
        className="py-14 px-4"
        style={{ background: "#0E1A2B", maxWidth: "100vw", overflowX: "hidden" }}
    >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div className="text-center mb-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A96E" }}>
                    Why it matters to you
                </p>
                <h2
                    className="font-bold text-white"
                    style={{ fontSize: "clamp(20px, 3vw, 34px)", lineHeight: 1.2 }}
                >
                    Less hassle. Better fit. Always current.
                </h2>
                <p className="text-white/50 mt-3 mx-auto text-sm leading-relaxed" style={{ maxWidth: "520px" }}>
                    When we know your fit and preferences, shopping gets faster — and better.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {BENEFIT_CARDS.map((card) => (
                    <div
                        key={card.title}
                        className="p-6 rounded-2xl flex flex-col gap-3"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(201,169,110,0.2)",
                        }}
                    >
                        <span className="text-2xl" style={{ color: "#C9A96E" }}>{card.icon}</span>
                        <h3 className="font-bold text-white text-sm">{card.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{card.desc}</p>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <a
                    href={IS_LOGGED_IN ? "/account/fit" : "/account"}
                    className="inline-block px-7 py-3 text-sm font-bold rounded-lg transition-all hover:opacity-90"
                    style={{ background: "#C9A96E", color: "#0E1A2B" }}
                >
                    {IS_LOGGED_IN ? "Update fit preferences" : "Save your fit"}
                </a>
                {!IS_LOGGED_IN && (
                    <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Free to create. Takes less than 2 minutes.
                    </p>
                )}
            </div>
        </div>
    </section>
);

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
        id="vision"
        className="py-20 px-4"
        style={{ background: "#FAFAF9", maxWidth: "100vw", overflowX: "hidden" }}
    >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="mb-12 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Our direction</p>
                <h2 className="font-bold text-gray-900" style={{ fontSize: "clamp(22px, 3.5vw, 40px)", lineHeight: 1.2 }}>
                    Where Kingsize is heading
                </h2>
            </div>

            {/* 3 punchy statements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                {[
                    "Built around your fit",
                    "Recommendations that get better over time",
                    "A smoother experience in-store and online",
                ].map((s) => (
                    <div
                        key={s}
                        className="flex items-start gap-3 p-5 rounded-xl"
                        style={{ background: "#fff", border: "1px solid #E5E1DC" }}
                    >
                        <span className="text-amber-600 font-bold text-lg flex-shrink-0 mt-0.5">→</span>
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{s}</p>
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

            {/* Capability cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {CAPABILITY_CARDS.map((card) => (
                    <div
                        key={card.title}
                        className="p-6 rounded-2xl flex flex-col gap-3"
                        style={{ background: "#fff", border: "1px solid #E5E1DC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                    >
                        <span className="text-2xl" style={{ color: "#0E1A2B" }}>{card.icon}</span>
                        <h3 className="font-bold text-gray-900 text-base">{card.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="mx-auto mb-14" style={{ width: 48, height: 2, background: "#C9A96E", borderRadius: 1 }} />

            {/* How it works */}
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">How it works</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                {HOW_IT_WORKS.map((item, i) => (
                    <div key={item.step} className="flex flex-col items-center text-center relative">
                        {i < HOW_IT_WORKS.length - 1 && (
                            <div
                                className="hidden md:block absolute top-5 left-1/2 w-full h-px"
                                style={{ background: "linear-gradient(to right, #C9A96E, #E5E1DC)" }}
                            />
                        )}
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

            {/* Final CTA */}
            <div className="text-center">
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
        <main style={{ overflowX: "hidden" }}>
            {/* Page header */}
            <div
                style={{
                    background: "#0E1A2B",
                    padding: "clamp(18px, 3.5vw, 32px) clamp(16px, 5vw, 48px)",
                    borderBottom: "1px solid rgba(201,169,110,0.15)",
                }}
            >
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <Link href="/" className="text-xs hover:text-white/70 transition-colors mb-3 inline-block" style={{ color: "rgba(255,255,255,0.38)" }}>
                        ← Back to home
                    </Link>
                    <h1 className="font-bold text-white" style={{ fontSize: "clamp(18px, 2.8vw, 30px)", lineHeight: 1.2 }}>
                        The new Kingsize experience
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.48)" }}>
                        A preview of where we&apos;re heading — smarter fit, better recommendations, one account.
                    </p>
                </div>
            </div>

            {/* Interactive room */}
            <VirtualRoomHero />

            {/* Less hassle section */}
            <LessHassleSection />

            {/* Vision section */}
            <VisionSection />
        </main>
    );
}
