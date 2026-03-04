"use client";

import { useState } from "react";

export type FitChoice = "big" | "tall" | "big-tall";

interface FitSelectorProps {
    initial?: FitChoice;
    onSelect?: (fit: FitChoice) => void;
    compact?: boolean;
}

const FIT_OPTIONS: { value: FitChoice; label: string; description: string }[] = [
    { value: "big", label: "Big", description: "Wider through chest, waist & hips" },
    { value: "tall", label: "Tall", description: "Extra length in torso & legs" },
    { value: "big-tall", label: "Big & Tall", description: "Both – the full range" },
];

export function FitSelector({ initial = "big-tall", onSelect, compact = false }: FitSelectorProps) {
    const [selected, setSelected] = useState<FitChoice>(initial);
    const [sending, setSending] = useState(false);

    const handleSelect = async (fit: FitChoice) => {
        setSelected(fit);
        onSelect?.(fit);

        // Record as a session signal — fire-and-forget
        if (sending) return;
        setSending(true);
        try {
            await fetch("/api/gateway/session/signals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    signalType: "filter",
                    entityType: "fit_selector",
                    entityLabel: fit,
                    fitContext: fit,
                }),
            });
        } catch { /* non-critical */ } finally {
            setSending(false);
        }
    };

    if (compact) {
        return (
            <div className="flex gap-2" role="group" aria-label="Select your fit">
                {FIT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        aria-pressed={selected === opt.value}
                        style={{
                            padding: "6px 16px",
                            borderRadius: 999,
                            border: `1.5px solid ${selected === opt.value ? "#111" : "#D1D5DB"}`,
                            background: selected === opt.value ? "#111" : "#fff",
                            color: selected === opt.value ? "#fff" : "#374151",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Shop by fit
            </p>
            <div className="flex gap-3 flex-wrap" role="group" aria-label="Select your fit">
                {FIT_OPTIONS.map((opt) => {
                    const active = selected === opt.value;
                    return (
                        <button
                            key={opt.value}
                            id={`fit-selector-${opt.value}`}
                            onClick={() => handleSelect(opt.value)}
                            aria-pressed={active}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: `2px solid ${active ? "#111" : "#E5E7EB"}`,
                                background: active ? "#111" : "#FAFAFA",
                                color: active ? "#fff" : "#111",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s ease",
                                minWidth: 120,
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.label}</div>
                            {!compact && (
                                <div style={{ fontSize: 11, color: active ? "#D1D5DB" : "#9CA3AF", marginTop: 2 }}>
                                    {opt.description}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
