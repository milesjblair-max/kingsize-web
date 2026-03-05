"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FitProfileRow } from "./useOnboarding";
import { NavButtons } from "./OnboardingShell";

function EditableRow({
    row,
    onUpdate,
}: {
    row: FitProfileRow;
    onUpdate: (key: string, value: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(row.value);

    const save = () => {
        onUpdate(row.key, draft || row.value);
        setEditing(false);
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 font-medium flex-shrink-0 mr-4">{row.label}</span>
            {editing ? (
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
                        className="w-28 text-right h-8 px-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#0a0a0a]"
                    />
                    <button onClick={save} className="text-xs font-bold text-[#0a0a0a] hover:opacity-70 transition-opacity">
                        Save
                    </button>
                    <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-bold text-[#0a0a0a]">{row.value}</span>
                    {row.editable && (
                        <button
                            onClick={() => { setDraft(row.value); setEditing(true); }}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                        >
                            Edit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function StepFitProfile({
    fitProfile,
    onUpdateRow,
    onConfirm,
    onBack,
    saving,
}: {
    fitProfile: FitProfileRow[];
    onUpdateRow: (key: string, value: string) => void;
    onConfirm: () => void;
    onBack: () => void;
    saving?: boolean;
}) {
    const isEmpty = fitProfile.length === 0 || fitProfile.every((r) => r.value === "—");

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
                    Your fit profile
                </h2>
                <p className="text-sm text-gray-500">
                    {isEmpty
                        ? "We've set up a base profile. You can edit any value to customise."
                        : "We've worked out your measurements. Check everything looks right and edit if needed."}
                </p>
            </div>

            {/* Fit card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex-1 mb-4"
            >
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xl">📐</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">No measurements yet</p>
                            <p className="text-xs text-gray-400">
                                You skipped measurements. You can update your profile from your account page at any time.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Kingsize Fit Card
                            </p>
                            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                ✓ Generated
                            </span>
                        </div>
                        <div>
                            {fitProfile.map((row) => (
                                <EditableRow key={row.key} row={row} onUpdate={onUpdateRow} />
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            <NavButtons
                onBack={onBack}
                onNext={onConfirm}
                nextLabel={isEmpty ? "Continue" : "Confirm my fit →"}
                loading={saving}
            />
        </motion.div>
    );
}
