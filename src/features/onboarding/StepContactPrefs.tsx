"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContactPref } from "./useOnboarding";
import { NavButtons } from "./OnboardingShell";

const OPTIONS: { key: ContactPref; label: string; desc: string; icon: string }[] = [
    {
        key: "email",
        label: "Email",
        desc: "New arrivals, deals and order updates by email.",
        icon: "✉️",
    },
    {
        key: "sms",
        label: "SMS",
        desc: "Quick texts for promos and time-sensitive offers.",
        icon: "💬",
    },
    {
        key: "both",
        label: "Email & SMS",
        desc: "Get the best of both — nothing missed.",
        icon: "🔔",
    },
];

export function StepContactPrefs({
    value,
    mobile,
    onSelect,
    onMobileChange,
    onNext,
    onBack,
    saving,
}: {
    value: ContactPref | null;
    mobile: string;
    onSelect: (v: ContactPref) => void;
    onMobileChange: (v: string) => void;
    onNext: () => void;
    onBack: () => void;
    saving?: boolean;
}) {
    const [error, setError] = useState("");

    const needsMobile = value === "sms" || value === "both";

    const handleNext = () => {
        if (!value) { setError("Please choose a preference to continue."); return; }
        if (needsMobile && !mobile.trim()) {
            setError("A mobile number is required for SMS updates.");
            return;
        }
        setError("");
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-black text-[#0a0a0a] leading-tight mb-1.5">
                    How do you like to hear from us?
                </h2>
                <p className="text-sm text-gray-500">
                    New arrivals, exclusive offers and your order updates.
                </p>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                {OPTIONS.map((opt, i) => {
                    const selected = value === opt.key;
                    return (
                        <motion.button
                            key={opt.key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            onClick={() => { onSelect(opt.key); setError(""); }}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${selected
                                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-md scale-[1.01]"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                                <div className="flex-1">
                                    <p className={`font-black text-base mb-0.5 ${selected ? "text-white" : "text-[#0a0a0a]"}`}>
                                        {opt.label}
                                    </p>
                                    <p className={`text-sm ${selected ? "text-white/70" : "text-gray-500"}`}>
                                        {opt.desc}
                                    </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? "border-white" : "border-gray-300"
                                    }`}>
                                    {selected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2.5 h-2.5 rounded-full bg-white"
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}

                {/* Mobile input — shown when SMS selected */}
                <AnimatePresence>
                    {needsMobile && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -8 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Mobile number
                                </label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => onMobileChange(e.target.value)}
                                    placeholder="04XX XXX XXX"
                                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 font-medium"
                    >
                        {error}
                    </motion.p>
                )}
            </div>

            <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Finish →" loading={saving} />
        </motion.div>
    );
}
