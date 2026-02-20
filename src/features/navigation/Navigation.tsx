"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBar } from "./CategoryBar";
import { Truck, RotateCcw, Tag, Search } from "lucide-react";

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
            className="hidden md:flex items-center"
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
                    minWidth: "220px",
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
        <div className="hidden md:flex items-center relative" style={{ width: "300px" }}>
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

// --- Main Navigation ---
export const Navigation = () => {
    return (
        <nav className="bg-white flex flex-col relative z-50">
            {/* Top Utility Bar */}
            <div className="border-b border-gray-200">
                <div className="flex justify-between items-center h-[160px] px-6">

                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="block">
                            <Image
                                src="/logo.png"
                                alt="Kingsize Big & Tall"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="h-[148px] w-auto object-contain block"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Centre: Rotating pill + Search */}
                    <div className="flex items-center gap-3">
                        <RotatingPill />
                        <SearchBar />
                    </div>

                    {/* Right: Utility links */}
                    <div className="flex gap-6 items-center text-sm font-bold text-gray-700">
                        <Link href="/about" className="hover:text-black transition-colors hidden md:block">
                            About Us
                        </Link>
                        <Link href="/help" className="hover:text-black transition-colors">
                            Help
                        </Link>
                        <Link href="/contact" className="hover:text-black transition-colors">
                            Contact
                        </Link>
                        <button className="hover:text-black transition-colors">Account</button>
                        <button className="hover:text-black transition-colors">Cart</button>
                    </div>
                </div>
            </div>

            {/* Category Bar */}
            <CategoryBar />
        </nav>
    );
};
