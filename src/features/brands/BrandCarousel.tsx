"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { POPULAR_BRANDS, BRANDS, type Brand } from "./brandData";

// ─── Animated scroll speed (px per second) ────────────────────────────────────
const SPEED = 38; // px/s

// ─── Single logo tile ──────────────────────────────────────────────────────────
function BrandTile({ brand, ariaHidden }: { brand: Brand; ariaHidden?: boolean }) {
    const [imgFailed, setImgFailed] = useState(false);
    const showText = !brand.logoFile || imgFailed;

    return (
        <Link
            href={brand.href}
            tabIndex={ariaHidden ? -1 : 0}
            aria-hidden={ariaHidden}
            className="flex-shrink-0 flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-200 select-none group"
            style={{
                width: 148,
                height: 88,
                margin: "0 8px",
                background: showText ? "#111" : "#fff",
                border: showText ? "none" : "1.5px solid #E5E7EB",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            aria-label={brand.name}
            draggable={false}
        >
            {!showText ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`/brand-logos/${brand.logoFile}`}
                    alt={brand.name}
                    onError={() => setImgFailed(true)}
                    draggable={false}
                    className="group-hover:scale-105 transition-transform duration-200"
                    style={{
                        maxWidth: 112,
                        maxHeight: 60,
                        objectFit: "contain",
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                />
            ) : (
                /* Styled wordmark pill for text-only brands */
                <span
                    className="text-center font-black uppercase tracking-widest leading-tight px-4 group-hover:opacity-80 transition-opacity"
                    style={{
                        fontSize: brand.name.length > 10 ? 9 : brand.name.length > 7 ? 10 : 11,
                        color: "#fff",
                        letterSpacing: "0.08em",
                    }}
                >
                    {brand.name}
                </span>
            )}
        </Link>
    );
}

// ─── Brand Carousel ────────────────────────────────────────────────────────────
// Uses a duplicated list inside a CSS-animated track for seamless infinite loop.
// Drag/touch scrubbing is layered on top.

export function BrandCarousel() {
    const trackRef = useRef<HTMLDivElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const paused = useRef(false);
    const offset = useRef(0);       // current translate-x in px
    const raf = useRef<number>(0);

    // Drag state
    const dragStart = useRef<number | null>(null);
    const dragOffset = useRef(0);

    // We show popular brands first, then the rest, then duplicate the whole list
    const orderedBrands: Brand[] = [
        ...POPULAR_BRANDS,
        ...BRANDS.filter((b) => !b.popular),
    ];

    // Half-width in px (approx) — recalculated in first frame
    const halfWidth = useRef(0);

    const applyTransform = (x: number) => {
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${x}px)`;
        }
    };

    useEffect(() => {
        // Measure half-width once
        if (trackRef.current) {
            halfWidth.current = trackRef.current.scrollWidth / 2;
        }

        let prev: number | null = null;

        const tick = (ts: number) => {
            if (!paused.current) {
                const dt = prev === null ? 0 : (ts - prev) / 1000;
                prev = ts;
                offset.current -= SPEED * dt;
                // Loop: when we've scrolled one full half, reset to 0
                if (Math.abs(offset.current) >= halfWidth.current) {
                    offset.current = 0;
                }
                applyTransform(offset.current + dragOffset.current);
            } else {
                prev = null;
            }
            raf.current = requestAnimationFrame(tick);
        };

        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, []);

    // ── Pause on hover / focus ─────────────────────────────────────────────────
    const handlePause = () => { paused.current = true; };
    const handleResume = () => { paused.current = false; };

    // ── Drag / swipe handlers ──────────────────────────────────────────────────
    const onPointerDown = (e: React.PointerEvent) => {
        dragStart.current = e.clientX;
        paused.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (dragStart.current === null) return;
        const delta = e.clientX - dragStart.current;
        dragOffset.current = delta;
        applyTransform(offset.current + dragOffset.current);
    };
    const onPointerUp = () => {
        if (dragStart.current === null) return;
        // Absorb the drag delta into the base offset
        offset.current += dragOffset.current;
        dragOffset.current = 0;
        dragStart.current = null;
        paused.current = false;
    };

    return (
        <section className="py-10 bg-white border-b border-gray-100" aria-label="Brands we stock">
            {/* Header */}
            <div className="max-w-[1400px] mx-auto px-6 mb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Brands We Stock</h2>
                    <p className="text-sm text-gray-500">Top labels in big &amp; tall fashion</p>
                </div>
                <Link
                    href="/brands"
                    className="text-sm font-bold text-gray-700 hover:text-black transition-colors"
                >
                    All brands
                </Link>
            </div>

            {/* Carousel track */}
            <div
                ref={outerRef}
                className="overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseEnter={handlePause}
                onMouseLeave={handleResume}
                onFocus={handlePause}
                onBlur={handleResume}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ WebkitUserSelect: "none", userSelect: "none" }}
            >
                {/* Inner track — duplicated list for seamless loop */}
                <div
                    ref={trackRef}
                    className="flex items-center will-change-transform"
                    style={{ width: "max-content", padding: "8px 0" }}
                >
                    {/* First copy */}
                    {orderedBrands.map((brand) => (
                        <BrandTile key={`a-${brand.id}`} brand={brand} />
                    ))}
                    {/* Duplicate copy for seamless loop */}
                    {orderedBrands.map((brand) => (
                        <BrandTile key={`b-${brand.id}`} brand={brand} ariaHidden />
                    ))}
                </div>
            </div>

        </section>
    );
}
