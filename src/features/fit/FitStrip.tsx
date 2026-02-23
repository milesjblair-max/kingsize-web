"use client";

import { useFit, FitOption } from "@/features/fit/FitContext";

const PILLS: { key: FitOption; label: string }[] = [
    { key: "big", label: "Big" },
    { key: "tall", label: "Tall" },
    { key: "big-tall", label: "Big and Tall" },
];

export const FitStrip = () => {
    const { fit, setFit, fitShowingLabel } = useFit();

    const handlePill = (key: FitOption) => {
        // Toggle off if already selected
        setFit(fit === key ? null : key);
    };

    return (
        <div
            className="bg-white border-b border-gray-100"
            style={{ minHeight: 40 }}
        >
            <div
                className="flex items-center gap-3 px-4 md:px-6 h-10"
                style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
            >
                {/* Label */}
                <span
                    className="text-xs font-bold text-gray-500 uppercase tracking-widest flex-shrink-0 hidden sm:block"
                    style={{ letterSpacing: "0.12em" }}
                >
                    Shop by Fit
                </span>
                <span
                    className="text-xs font-bold text-gray-500 uppercase tracking-widest flex-shrink-0 sm:hidden"
                    style={{ letterSpacing: "0.10em" }}
                >
                    Fit
                </span>

                {/* Divider — desktop only */}
                <div className="w-px h-4 bg-gray-200 flex-shrink-0 hidden sm:block" />

                {/* Pills */}
                <div className="flex items-center gap-2 flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                    {PILLS.map(({ key, label }) => {
                        const isActive = fit === key;
                        return (
                            <button
                                key={key}
                                onClick={() => handlePill(key)}
                                aria-pressed={isActive}
                                aria-label={`Filter by ${label} fit`}
                                className="flex-shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                                style={{
                                    height: 26,
                                    padding: "0 12px",
                                    borderRadius: 5,
                                    border: isActive ? "1px solid #111" : "1px solid #D1D5DB",
                                    background: isActive ? "#111" : "#fff",
                                    color: isActive ? "#fff" : "#374151",
                                    fontSize: 12,
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: "pointer",
                                    scrollSnapAlign: "start",
                                    whiteSpace: "nowrap",
                                    letterSpacing: "0.01em",
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* "Showing X products" indicator */}
                {fitShowingLabel && (
                    <>
                        <div className="w-px h-4 bg-gray-200 flex-shrink-0" />
                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                            {fitShowingLabel}
                        </span>
                        <button
                            onClick={() => setFit(null)}
                            className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 flex-shrink-0 whitespace-nowrap transition-colors"
                            aria-label="Clear fit filter"
                        >
                            Clear
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
