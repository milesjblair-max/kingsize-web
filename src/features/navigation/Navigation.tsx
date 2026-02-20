"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBar } from "./CategoryBar";
import {
    Truck, RotateCcw, Tag, Search, Menu, X,
    Info, HelpCircle, Phone, User, ShoppingBag,
    ChevronDown, Package, RotateCcw as ReturnIcon, LifeBuoy,
} from "lucide-react";

// ─── Rotating messages ────────────────────────────────────────────────────────
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
            if (prefersReduced) { setIndex((i) => (i + 1) % MESSAGES.length); return; }
            setAnimating(true);
            setTimeout(() => { setIndex((i) => (i + 1) % MESSAGES.length); setAnimating(false); }, 300);
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
            <div style={{
                height: 32, padding: "0 12px", border: "1px solid #E5E7EB",
                background: "#F9FAFB", borderRadius: 999, overflow: "hidden",
                display: "flex", alignItems: "center", gap: 6,
                minWidth: 210, maxWidth: 240,
            }}>
                <Icon size={13} className="text-gray-500 flex-shrink-0" strokeWidth={2} />
                <div style={{ overflow: "hidden", height: 20, position: "relative", flex: 1 }}>
                    <span style={{
                        display: "block", fontSize: 13, fontWeight: 500, color: "#374151",
                        whiteSpace: "nowrap",
                        transform: animating ? "translateY(20px)" : "translateY(0)",
                        opacity: animating ? 0 : 1,
                        transition: prefersReduced ? "none" : "transform 280ms ease, opacity 200ms ease",
                    }}>
                        {current.text}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = () => {
    const [query, setQuery] = useState("");
    return (
        <div className="hidden md:flex items-center relative flex-shrink-0"
            style={{ width: "clamp(140px, 18vw, 280px)" }}>
            <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" strokeWidth={2} />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim())
                        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }}
                placeholder="Search products"
                style={{
                    width: "100%", height: 36, paddingLeft: 34, paddingRight: 12,
                    border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 14,
                    color: "#111", background: "#fff", outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#9CA3AF"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }}
            />
        </div>
    );
};

// ─── Account dropdown ─────────────────────────────────────────────────────────
const ACCOUNT_ITEMS = [
    { label: "Your account", href: "/account", icon: User },
    { label: "Orders", href: "/account/orders", icon: Package },
    { label: "Return an item", href: "/account/returns", icon: ReturnIcon },
    { label: "Help and contact", href: "/help", icon: LifeBuoy },
];

const AccountDropdown = () => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openDrop = useCallback(() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    }, []);
    const schedulClose = useCallback(() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    }, []);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    // Click-outside for mobile
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div
            ref={wrapRef}
            className="relative"
            onMouseEnter={openDrop}
            onMouseLeave={schedulClose}
        >
            {/* Trigger */}
            <button
                id="account-trigger"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls="account-dropdown"
                onClick={() => setOpen((v) => !v)}
                className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-0.5"
            >
                <User
                    size={16}
                    strokeWidth={1.8}
                    className="transition-colors"
                    style={{ color: "rgba(55,65,81,0.75)" }}
                />
                <span className="hidden xl:inline">Account</span>
                <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className="hidden xl:block transition-transform"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    id="account-dropdown"
                    role="menu"
                    onMouseEnter={openDrop}
                    onMouseLeave={schedulClose}
                    className="absolute right-0 top-full mt-2 z-[150]"
                    style={{
                        width: 272,
                        background: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                        padding: "10px",
                        // Smooth appear
                        animation: "dropIn 0.15s ease",
                    }}
                >
                    <style>{`
                        @keyframes dropIn {
                            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                            to   { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>

                    {/* Sign in button */}
                    <Link
                        href="/account/login"
                        role="menuitem"
                        className="block w-full text-center py-2.5 mb-2 rounded-lg text-sm font-bold transition-colors"
                        style={{ background: "#0E1A2B", color: "#fff" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1a2e4a")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#0E1A2B")}
                    >
                        Sign in
                    </Link>

                    {/* Register link */}
                    <Link
                        href="/account/register"
                        role="menuitem"
                        className="block w-full text-center py-1.5 mb-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                        Register — in a snap
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2" />

                    {/* Menu items */}
                    {ACCOUNT_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                role="menuitem"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                            >
                                <Icon
                                    size={15}
                                    strokeWidth={1.8}
                                    className="flex-shrink-0"
                                    style={{ color: "rgba(55,65,81,0.6)" }}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Single nav link with icon ─────────────────────────────────────────────────
const NavLink = ({
    href, icon: Icon, label, showLabelAt = "xl",
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    showLabelAt?: "xl" | "lg";
}) => (
    <Link
        href={href}
        className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-0.5"
    >
        <Icon
            size={16}
            strokeWidth={1.8}
            className="flex-shrink-0 transition-colors group-hover:opacity-100"
            style={{ color: "rgba(55,65,81,0.72)" }}
        />
        <span className={showLabelAt === "xl" ? "hidden xl:inline" : "hidden lg:inline"}>
            {label}
        </span>
    </Link>
);

// ─── Mobile menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <span className="font-bold text-gray-900">Menu</span>
                    <button onClick={onClose} aria-label="Close menu"><X size={20} /></button>
                </div>
                <nav className="flex-1 overflow-y-auto px-5 py-4">
                    {["New In", "Casual Wear", "Smart & Formal", "Active & Sport", "Footwear", "Essentials"].map((cat) => (
                        <a key={cat} href="#" className="block py-3 text-sm font-bold border-b border-gray-50 text-gray-800 hover:text-orange-600">
                            {cat}
                        </a>
                    ))}
                    <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                        {[
                            { label: "About Us", href: "/about", Icon: Info },
                            { label: "Help", href: "/help", Icon: HelpCircle },
                            { label: "Contact", href: "/contact", Icon: Phone },
                            { label: "Sign in", href: "/account/login", Icon: User },
                        ].map(({ label, href, Icon }) => (
                            <Link key={label} href={href} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 py-1">
                                <Icon size={15} strokeWidth={1.8} style={{ color: "rgba(55,65,81,0.6)" }} />
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
};

// ─── Main Navigation ──────────────────────────────────────────────────────────
export const Navigation = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
            <nav className="bg-white flex flex-col relative z-50" style={{ maxWidth: "100vw" }}>
                <div className="border-b border-gray-200">
                    <div
                        className="flex items-center justify-between px-4 md:px-6"
                        style={{ height: "clamp(64px, 10vw, 120px)" }}
                    >
                        {/* Left: Hamburger + Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0">
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

                        {/* Centre: Pill + Search */}
                        <div className="flex items-center gap-3 flex-1 justify-center mx-4 min-w-0">
                            <RotatingPill />
                            <SearchBar />
                        </div>

                        {/* Right: Nav items with icons */}
                        <div className="flex items-center gap-5 flex-shrink-0">

                            {/* Full set on lg+ screens */}
                            <div className="hidden lg:flex items-center gap-5">
                                <NavLink href="/about" icon={Info} label="About Us" />
                                <NavLink href="/help" icon={HelpCircle} label="Help" />
                                <NavLink href="/contact" icon={Phone} label="Contact" />

                                {/* Account with dropdown */}
                                <AccountDropdown />

                                {/* Cart */}
                                <Link
                                    href="/cart"
                                    className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-0.5"
                                    aria-label="Cart"
                                >
                                    <ShoppingBag
                                        size={16}
                                        strokeWidth={1.8}
                                        className="flex-shrink-0 transition-colors group-hover:opacity-100"
                                        style={{ color: "rgba(55,65,81,0.72)" }}
                                    />
                                    <span className="hidden xl:inline">Cart</span>
                                </Link>
                            </div>

                            {/* Compact icons only on md (between hamburger breakpoint and lg) */}
                            <div className="hidden md:flex lg:hidden items-center gap-4">
                                <AccountDropdown />
                                <Link href="/cart" aria-label="Cart" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    <ShoppingBag size={18} strokeWidth={1.8} />
                                </Link>
                            </div>

                            {/* Mobile: just cart */}
                            <div className="flex md:hidden items-center gap-3">
                                <Link href="/cart" aria-label="Cart" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    <ShoppingBag size={20} strokeWidth={1.8} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category bar — desktop only */}
                <div className="hidden md:block">
                    <CategoryBar />
                </div>
            </nav>
        </>
    );
};
