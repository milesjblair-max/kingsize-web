"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBar } from "./CategoryBar";
import { Truck, RotateCcw, Tag, Search, Menu, X } from "lucide-react";

// --- Rotating messages ---
const MESSAGES = [
    { text: "Free delivery over $125", icon: Truck },
    { text: "30-day returns", icon: RotateCcw },
    { text: "Clearance on sale 24/7", icon: Tag },
];

const RotatingPill = () => {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const isPaused = useRef(false);
    const prefersReduced =
        typeof window !== "undefined"
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false;

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused.current) return;
            if (prefersReduced) {
                setIndex((i) => (i + 1) % MESSAGES.length);
                return;
            }
            setAnimating(true);
            setTimeout(() => {
                setIndex((i) => (i + 1) % MESSAGES.length);
                setAnimating(false);
            }, 300);
        }, 3000);
        return () => clearInterval(interval);
    }, [prefersReduced]);

    const current = MESSAGES[index];
    const Icon = current.icon;

    return (
        <div
            className="hidden lg:flex items-center flex-shrink-0"
            onMouseEnter={() => { isPaused.current = true; }}
            onMouseLeave={() => { isPaused.current = false; }}
        >
            <div
                style={{
                    height: "32px",
                    padding: "0 12px",
                    border: "1px solid #E5E7EB",
                    background: "#F9FAFB",
                    borderRadius: "999px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "210px",
                    maxWidth: "240px",
                }}
            >
                <Icon size={13} className="text-gray-500 flex-shrink-0" strokeWidth={2} />
                <div style={{ overflow: "hidden", height: "20px", position: "relative", flex: 1 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#374151",
                            whiteSpace: "nowrap",
                            transform: animating ? "translateY(20px)" : "translateY(0)",
                            opacity: animating ? 0 : 1,
                            transition: prefersReduced
                                ? "none"
                                : "transform 280ms ease, opacity 200ms ease",
                        }}
                    >
                        {current.text}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Search bar ---
const SearchBar = () => {
    const [query, setQuery] = useState("");

    return (
        <div className="hidden md:flex items-center relative flex-shrink-0"
            style={{ width: "clamp(160px, 20vw, 300px)" }}>
            <Search
                size={15}
                className="absolute left-3 text-gray-400 pointer-events-none"
                strokeWidth={2}
            />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                    }
                }}
                placeholder="Search products"
                style={{
                    width: "100%",
                    height: "36px",
                    paddingLeft: "34px",
                    paddingRight: "12px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#111",
                    background: "#fff",
                    outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#9CA3AF"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }}
            />
        </div>
    );
};

// --- Mobile menu ---
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            {/* Drawer */}
            <div className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <span className="font-bold text-gray-900">Menu</span>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <nav className="flex-1 overflow-y-auto px-5 py-4">
                    {["New In", "Casual Wear", "Smart & Formal", "Active & Sport", "Footwear", "Essentials"].map((cat) => (
                        <a key={cat} href="#" className="block py-3 text-sm font-bold border-b border-gray-50 text-gray-800 hover:text-orange-600">
                            {cat}
                        </a>
                    ))}
                    <div className="mt-6 space-y-3">
                        <Link href="/about" className="block text-sm text-gray-600 hover:text-black">About Us</Link>
                        <Link href="/help" className="block text-sm text-gray-600 hover:text-black">Help</Link>
                        <Link href="/contact" className="block text-sm text-gray-600 hover:text-black">Contact</Link>
                    </div>
                </nav>
            </div>
        </div>
    );
};

// --- Main Navigation ---
export const Navigation = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
            <nav className="bg-white flex flex-col relative z-50" style={{ maxWidth: "100vw" }}>
                {/* Top Header Bar */}
                <div className="border-b border-gray-200">
                    <div
                        className="flex items-center justify-between px-4 md:px-6"
                        style={{ height: "clamp(64px, 10vw, 120px)" }}
                    >
                        {/* Left: Hamburger (mobile) + Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Hamburger — visible on < md */}
                            <button
                                className="md:hidden flex items-center justify-center w-9 h-9 rounded hover:bg-gray-100 flex-shrink-0"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu size={22} />
                            </button>

                            <Link href="/" className="block flex-shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="Kingsize Big & Tall"
                                    width={0}
                                    height={0}
                                    sizes="(max-width: 768px) 120px, 200px"
                                    style={{
                                        height: "clamp(48px, 8vw, 110px)",
                                        width: "auto",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Centre: Pill + Search — hidden on mobile */}
                        <div className="flex items-center gap-3 flex-1 justify-center mx-4 min-w-0">
                            <RotatingPill />
                            <SearchBar />
                        </div>

                        {/* Right: Utility links */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Full links on lg+ */}
                            <div className="hidden lg:flex gap-5 items-center text-sm font-bold text-gray-700">
                                <Link href="/about" className="hover:text-black transition-colors whitespace-nowrap">About Us</Link>
                                <Link href="/help" className="hover:text-black transition-colors">Help</Link>
                                <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
                                <button className="hover:text-black transition-colors">Account</button>
                                <button className="hover:text-black transition-colors">Cart</button>
                            </div>
                            {/* Compact on md */}
                            <div className="hidden md:flex lg:hidden gap-4 items-center text-sm font-bold text-gray-700">
                                <Link href="/help" className="hover:text-black">Help</Link>
                                <button className="hover:text-black">Account</button>
                                <button className="hover:text-black">Cart</button>
                            </div>
                            {/* Mobile: just Account + Cart icons */}
                            <div className="flex md:hidden gap-4 items-center text-sm font-bold text-gray-700">
                                <button className="hover:text-black">Cart</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Bar — desktop only */}
                <div className="hidden md:block">
                    <CategoryBar />
                </div>
            </nav>
        </>
    );
};
