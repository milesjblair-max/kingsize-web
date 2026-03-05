"use client";

import { motion } from "framer-motion";
import type { FitType } from "./useOnboarding";
import { NavButtons } from "./OnboardingShell";

const FIT_OPTIONS: {
    key: FitType;
    title: string;
    subtitle: string;
    desc: string;
    icon: string;
}[] = [
        {
            key: "big",
            title: "Big",
            subtitle: "Broader cut",
            desc: "Wider chest, shoulders & waist. Standard or extended length.",
            icon: "◫",
        },
        {
            key: "tall",
            title: "Tall",
            subtitle: "Extended length",
            desc: "Extra inseam, sleeve & torso length. Standard width.",
            icon: "▭",
        },
        {
            key: "big-tall",
            title: "Big & Tall",
            subtitle: "Full extended cut",
            desc: "Broader everywhere AND longer everywhere. The complete solution.",
            icon: "⬜",
        },
    ];

export function StepFitType({
    value,
    onSelect,
    onNext,
    onBack,
    saving,
}: {
    value: FitType | null;
    onSelect: (v: FitType) => void;
    onNext: () => void;
    onBack: () => void;
    saving?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col h-full"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-black text-[#0a0a0a] leading-tight mb-1.5">
                    How do you typically shop?
                </h2>
                <p className="text-sm text-gray-500">
                    We'll filter every product to your fit from here on.
                </p>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                {FIT_OPTIONS.map((opt, i) => {
                    const selected = value === opt.key;
                    return (
                        <motion.button
                            key={opt.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.3 }}
                            onClick={() => onSelect(opt.key)}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${selected
                                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-lg scale-[1.01]"
                                    : "border-gray-200 bg-white text-[#0a0a0a] hover:border-gray-300 hover:shadow-sm"
                                }`}
                        >
                            {selected && (
                                <motion.div
                                    layoutId="fit-selected-bg"
                                    className="absolute inset-0 bg-[#0a0a0a] -z-10"
                                    initial={false}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`font-black text-lg mb-0.5 ${selected ? "text-white" : "text-[#0a0a0a]"}`}>
                                        {opt.title}
                                    </p>
                                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${selected ? "text-white/60" : "text-gray-400"
                                        }`}>
                                        {opt.subtitle}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${selected ? "text-white/75" : "text-gray-500"}`}>
                                        {opt.desc}
                                    </p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 mt-0.5 transition-all ${selected ? "border-white bg-white" : "border-gray-300"
                                    }`}>
                                    {selected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 bg-[#0a0a0a] rounded-full"
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <NavButtons
                onBack={onBack}
                onNext={onNext}
                nextDisabled={!value}
                loading={saving}
            />
        </motion.div>
    );
}
