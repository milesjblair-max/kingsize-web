"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import type { SwipeCardData } from "./useOnboarding";
import { NavButtons } from "./OnboardingShell";
import { STYLE_CATEGORIES } from "./useOnboarding";
import { getPrimaryImage } from "@/utils/image";

function SwipeCardItem({
    card,
    onLike,
    onPass,
    isTop,
}: {
    card: SwipeCardData;
    onLike: () => void;
    onPass: () => void;
    isTop?: boolean;
}) {
    const [imgError, setImgError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 150], [-20, 20]);
    const likeOpacity = useTransform(x, [20, 80], [0, 1]);
    const passOpacity = useTransform(x, [-80, -20], [1, 0]);

    const THRESHOLD = 80;

    const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
        if (info.offset.x > THRESHOLD) onLike();
        else if (info.offset.x < -THRESHOLD) onPass();
    };

    // Keyboard support
    useEffect(() => {
        if (!isTop) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") onLike();
            if (e.key === "ArrowLeft") onPass();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onLike, onPass, isTop]);

    const rawUrl = getPrimaryImage(card);
    const [finalSrc, setFinalSrc] = useState(rawUrl);

    // Sync state if card changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFinalSrc(getPrimaryImage(card));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRetryCount(0);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImgError(false);
    }, [card.id]);

    const handleImageError = () => {
        if (retryCount === 0) {
            let nextSrc = finalSrc;
            // Try different naming variations to bridge the gap between DB URLs and actual files
            if (finalSrc.includes("_FRONT")) {
                nextSrc = finalSrc.replace("_FRONT", "");
            } else if (finalSrc.endsWith(".jpg")) {
                nextSrc = finalSrc.replace(".jpg", "_FRONT.jpg");
            }

            if (nextSrc !== finalSrc && !nextSrc.startsWith("data:")) {
                setFinalSrc(nextSrc);
                setRetryCount(1);
            } else {
                setImgError(true);
            }
        } else {
            setImgError(true);
        }
    };

    return (
        <motion.div
            className="absolute inset-x-0 inset-y-0 cursor-grab active:cursor-grabbing select-none flex items-center justify-center max-w-sm mx-auto"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            initial={{ scale: 1, opacity: 1 }}
            exit={{ x: 0, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        >
            <div className="w-full aspect-[3/4] bg-white rounded-2xl overflow-hidden relative border border-gray-100 shadow-md">
                {/* Product image or placeholder */}
                {!imgError ? (
                    <Image
                        src={finalSrc}
                        alt={card.label}
                        fill
                        className="object-cover object-top transition-all duration-300"
                        sizes="(max-width: 480px) 100vw, 440px"
                        priority={isTop}
                        unoptimized
                        onError={handleImageError}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-5xl mb-3 block opacity-50">
                                {card.category.includes("Polo") ? "👕" :
                                    card.category.includes("T-Shirt") ? "👚" :
                                        card.category.includes("Short") ? "🩳" :
                                            card.category.includes("Shirt") ? "👔" :
                                                card.category.includes("Active") ? "🏋️" :
                                                    card.category.includes("Foot") ? "👟" : "🧥"}
                            </span>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.category}</p>
                        </div>
                    </div>
                )}

                {/* Like / Pass overlays */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-6 left-6 bg-green-500 text-white font-black text-xl px-4 py-2 rounded-xl border-4 border-green-400 rotate-[-8deg] z-10"
                >
                    LIKE ♥
                </motion.div>
                <motion.div
                    style={{ opacity: passOpacity }}
                    className="absolute top-6 right-6 bg-red-500 text-white font-black text-xl px-4 py-2 rounded-xl border-4 border-red-400 rotate-[8deg] z-10"
                >
                    PASS ✕
                </motion.div>

                {/* Bottom metadata */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                    <p className="text-white font-bold text-base leading-tight drop-shadow-sm">{card.label}</p>
                    <p className="text-white/80 text-xs mt-1 font-medium drop-shadow-sm">{card.category}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Static fallback cards (if catalog empty) ─────────────────────────────────

const FALLBACK_ITEMS = [
    { cat: "Polos", labels: ["Classic Polo", "Performance Polo", "Essential Polo"] },
    { cat: "T-Shirts", labels: ["Crew Neck Tee", "Pocket Tee", "Striped Tee"] },
    { cat: "Casual Shirts", labels: ["Check Shirt", "Oxford Shirt", "Linen Shirt"] },
    { cat: "Shorts", labels: ["Chino Shorts", "Cargo Shorts", "Swim Shorts"] },
    { cat: "Activewear", labels: ["Gym Tee", "Track Pants", "Sports Shorts"] },
];

function buildFallbackCards(count: number): SwipeCardData[] {
    return Array.from({ length: count }, (_, i) => {
        const group = FALLBACK_ITEMS[i % FALLBACK_ITEMS.length];
        return {
            id: `fallback-${i}`,
            image: "",
            label: group.labels[Math.floor(i / FALLBACK_ITEMS.length) % group.labels.length],
            category: group.cat,
            tags: [group.cat.toLowerCase(), "big-tall"],
        };
    });
}

// ─── Main Step ────────────────────────────────────────────────────────────────

export function StepStylePrefs({
    selectedCategories,
    swipeLiked,
    swipePassed,
    onCategoryToggle,
    onSwipeLike,
    onSwipePass,
    onNext,
    onBack,
    saving,
}: {
    selectedCategories: string[];
    swipeLiked: SwipeCardData[];
    swipePassed: SwipeCardData[];
    onCategoryToggle: (cat: string) => void;
    onSwipeLike: (card: SwipeCardData) => void;
    onSwipePass: (card: SwipeCardData) => void;
    onNext: () => void;
    onBack: () => void;
    saving?: boolean;
}) {
    const [mode, setMode] = useState<"choose" | "categories" | "swipe">("choose");
    const [cards, setCards] = useState<SwipeCardData[]>([]);
    const [cardsLoading, setCardsLoading] = useState(false);

    // Fetch real swipe candidates when user chooses swipe mode
    useEffect(() => {
        if (mode !== "swipe" || cards.length > 0) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardsLoading(true);

        fetch("/api/gateway/swipe/candidates?category=tops,shorts,casual&limit=12")
            .then((r) => r.json())
            .then((data) => {
                if (data.candidates && data.candidates.length > 0) {
                    const realCards: SwipeCardData[] = data.candidates.map((c: { productId: string; primaryImageUrl: string; title: string; category: string; tags?: string[] }) => ({
                        id: c.productId,
                        image: c.primaryImageUrl,
                        label: c.title,
                        category: c.category.split("|").pop() ?? c.category,
                        tags: c.tags ?? [],
                    }));
                    setCards(realCards);
                } else {
                    // Fallback: static cards if catalog not yet seeded
                    setCards(buildFallbackCards(12));
                }
            })
            .catch(() => setCards(buildFallbackCards(12)))
            .finally(() => setCardsLoading(false));
    }, [mode, cards.length]);

    const totalSwiped = swipeLiked.length + swipePassed.length;
    const remainingCards = cards.slice(totalSwiped);

    // Preload the next 3 card images using native browser Image objects.
    // This works with unoptimized images because the raw URL is cached directly.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const toPreload = remainingCards.slice(1, 4);
        toPreload.forEach((card) => {
            const src = getPrimaryImage(card);
            if (!src || src.startsWith("data:")) return;
            const img = new window.Image();
            img.src = src;
        });
    }, [remainingCards]);
    const swipeDone = cards.length > 0 && totalSwiped >= cards.length;

    const handleLike = useCallback(() => {
        if (remainingCards[0]) onSwipeLike(remainingCards[0]);
    }, [remainingCards, onSwipeLike]);

    const handlePass = useCallback(() => {
        if (remainingCards[0]) onSwipePass(remainingCards[0]);
    }, [remainingCards, onSwipePass]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
        >
            <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0a0a0a] leading-tight mb-1.5">
                    Style preferences
                </h2>
                <p className="text-sm text-gray-500">
                    Optional — help us personalise your recommendations.
                </p>
            </div>

            {/* Mode chooser */}
            {mode === "choose" && (
                <div className="flex flex-col gap-4 flex-1">
                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => setMode("categories")}
                        className="w-full p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <p className="font-black text-[#0a0a0a] text-base mb-1">Quick: Select categories</p>
                                <p className="text-sm text-gray-500">Pick what you wear most — takes 10 seconds.</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => setMode("swipe")}
                        className="w-full p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">↔️</span>
                            </div>
                            <div>
                                <p className="font-black text-[#0a0a0a] text-base mb-1">Swipe style quiz</p>
                                <p className="text-sm text-gray-500">Swipe through real Kingsize styles — like/pass for deep personalisation.</p>
                            </div>
                        </div>
                    </motion.button>

                    <NavButtons onBack={onBack} onNext={onNext} nextLabel="Skip →" showBack={true} />
                </div>
            )}

            {/* Category grid */}
            {mode === "categories" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-4">What do you wear most?</p>
                    <div className="grid grid-cols-2 gap-2.5 flex-1">
                        {STYLE_CATEGORIES.map((cat, i) => {
                            const selected = selectedCategories.includes(cat);
                            return (
                                <motion.button
                                    key={cat}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => onCategoryToggle(cat)}
                                    className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all text-left ${selected
                                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-md"
                                        : "border-gray-200 bg-white text-[#0a0a0a] hover:border-gray-300"
                                        }`}
                                >
                                    {cat}
                                </motion.button>
                            );
                        })}
                    </div>
                    <NavButtons
                        onBack={() => setMode("choose")}
                        onNext={onNext}
                        nextLabel={selectedCategories.length > 0 ? `Continue (${selectedCategories.length} selected)` : "Skip"}
                        loading={saving}
                    />
                </motion.div>
            )}

            {/* Swipe mode */}
            {mode === "swipe" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
                    {cardsLoading ? (
                        <div className="flex-1 flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#0a0a0a] rounded-full animate-spin" />
                            <span className="text-sm text-gray-400">Loading styles…</span>
                        </div>
                    ) : swipeDone ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">✓</span>
                            </div>
                            <div>
                                <p className="font-black text-[#0a0a0a] text-lg mb-1">Style quiz done!</p>
                                <p className="text-sm text-gray-500">{swipeLiked.length} liked · {swipePassed.length} passed</p>
                            </div>
                            <NavButtons
                                onBack={() => setMode("choose")}
                                onNext={onNext}
                                nextLabel="Save my style →"
                                loading={saving}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1">
                            {/* Progress */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-400 font-medium">
                                    {totalSwiped} of {cards.length} swiped
                                </p>
                                <div className="h-1.5 bg-gray-100 rounded-full w-32 overflow-hidden">
                                    <div
                                        className="h-full bg-[#0a0a0a] rounded-full transition-all duration-300"
                                        style={{ width: cards.length > 0 ? `${(totalSwiped / cards.length) * 100}%` : "0%" }}
                                    />
                                </div>
                            </div>

                            {/* Card stack */}
                            <div className="relative flex-1 rounded-2xl overflow-hidden min-h-[280px]">
                                <AnimatePresence>
                                    {remainingCards.slice(0, 2).reverse().map((card, i) => (
                                        <motion.div
                                            key={card.id}
                                            className="absolute inset-0"
                                            style={{
                                                zIndex: i === 1 ? 2 : 1,
                                                scale: i === 1 ? 1 : 0.96,
                                                y: i === 1 ? 0 : 8,
                                            }}
                                        >
                                            {i === 1 ? (
                                                <SwipeCardItem card={card} onLike={handleLike} onPass={handlePass} isTop={true} />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 rounded-2xl border border-gray-200" />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={handlePass}
                                    className="flex-1 h-14 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-red-200 hover:bg-red-50 transition-all"
                                >
                                    ✕ Pass
                                </button>
                                <button
                                    onClick={handleLike}
                                    className="flex-1 h-14 rounded-xl bg-[#0a0a0a] text-white font-bold hover:bg-gray-800 transition-all"
                                >
                                    ♥ Like
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">or use ← → keyboard arrows</p>
                            <button onClick={onNext} className="text-sm text-gray-400 hover:text-gray-600 text-center py-2 mt-1">
                                Skip quiz →
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
