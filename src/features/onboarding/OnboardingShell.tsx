"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OnboardingShellProps {
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
}

const STEP_LABELS = ["Account", "Fit Type", "Set Your Fit", "Fit Profile", "Style", "Contact", "Done"];

const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
        x: dir > 0 ? -60 : 60,
        opacity: 0,
    }),
};

export function OnboardingShell({ currentStep, totalSteps, children }: OnboardingShellProps) {
    const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

    return (
        <div className="min-h-screen bg-[#f5f4f2] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-6 pb-4 max-w-lg mx-auto w-full">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight text-[#0a0a0a]">KINGSIZE+</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                    {currentStep < totalSteps ? `Step ${currentStep} of ${totalSteps - 1}` : "Complete"}
                </span>
            </header>

            {/* Step nav pills */}
            <div className="px-6 pb-6 max-w-lg mx-auto w-full">
                <div className="flex gap-1.5 mb-4">
                    {STEP_LABELS.slice(1).map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = currentStep === stepNum + 1 || (currentStep === 1 && stepNum === 0);
                        const isDone = currentStep > stepNum + 1;

                        return (
                            <div key={label} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className={`h-1 w-full rounded-full transition-all duration-500 ${isDone
                                            ? "bg-[#0a0a0a]"
                                            : isActive
                                                ? "bg-[#0a0a0a] opacity-60"
                                                : "bg-gray-200"
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Current step label */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {STEP_LABELS[currentStep - 1] || "Done"}
                </p>
            </div>

            {/* Content card */}
            <div className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[560px] flex flex-col">
                    <div className="flex-1 p-7 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Navigation buttons used across steps
export function NavButtons({
    onBack,
    onNext,
    nextLabel = "Continue",
    loading = false,
    nextDisabled = false,
    showBack = true,
}: {
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
    loading?: boolean;
    nextDisabled?: boolean;
    showBack?: boolean;
}) {
    return (
        <div className="flex gap-3 pt-4">
            {showBack && onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={loading || nextDisabled}
                className={`flex-[2] h-12 rounded-xl text-sm font-bold transition-all ${nextDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#0a0a0a] text-white hover:bg-gray-800 active:scale-[0.98]"
                    } ${loading ? "opacity-60" : ""}`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                    </span>
                ) : (
                    nextLabel
                )}
            </button>
        </div>
    );
}
