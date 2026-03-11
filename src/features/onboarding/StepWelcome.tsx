"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
    { number: 1, label: "Account" },
    { number: 2, label: "Fit Type" },
    { number: 3, label: "Set Your Fit" },
    { number: 4, label: "Review Fit" },
    { number: 5, label: "Style" },
    { number: 6, label: "Contact" },
];

export function StepWelcome({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col h-full"
        >
            {/* Hero */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center mb-6"
                    >
                        <span className="text-white text-xl font-black">K+</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="text-3xl font-black text-[#0a0a0a] leading-tight mb-3"
                    >
                        Let&apos;s set up your perfect fit
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                        className="text-gray-500 text-base leading-relaxed"
                    >
                        We&apos;ll personalise every product recommendation to your exact measurements and style — takes just 2 minutes.
                    </motion.p>
                </div>

                {/* Progress steps */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="space-y-2.5 mb-8"
                >
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-gray-400">{step.number}</span>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{step.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* CTA */}
            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                onClick={onNext}
                className="w-full h-14 bg-[#0a0a0a] text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
                Get started →
            </motion.button>
        </motion.div>
    );
}
