"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function StepComplete({ onFinish }: { onFinish: () => void }) {
    // Auto-redirect after 3s if user doesn't click
    useEffect(() => {
        const t = setTimeout(onFinish, 4000);
        return () => clearTimeout(t);
    }, [onFinish]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center h-full py-8"
        >
            {/* Animated checkmark */}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                className="w-20 h-20 bg-[#0a0a0a] rounded-full flex items-center justify-center mb-6"
            >
                <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                    />
                </svg>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-3xl font-black text-[#0a0a0a] leading-tight mb-3"
            >
                Your fit profile<br />is ready.
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-gray-500 text-base mb-8 max-w-xs leading-relaxed"
            >
                Every recommendation from here on is personalised to your exact fit and style.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="w-full max-w-xs"
            >
                <button
                    onClick={onFinish}
                    className="w-full h-14 bg-[#0a0a0a] text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors active:scale-[0.98]"
                >
                    Start shopping →
                </button>
                <p className="text-xs text-gray-400 mt-3">
                    Taking you to your personalised feed…
                </p>
            </motion.div>
        </motion.div>
    );
}
