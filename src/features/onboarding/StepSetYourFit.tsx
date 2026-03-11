"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MeasurementMethod, GarmentType, SizeEntry, FitProfileRow } from "./useOnboarding";
import { NavButtons } from "./OnboardingShell";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
const WAIST_SIZES = ["32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"];

function MeasurementInput({
    value,
    onChange,
    label = "Half Chest Measurement",
}: {
    value: string;
    onChange: (v: string) => void;
    label?: string;
}) {
    const half = parseFloat(value);
    const full = isNaN(half) || half <= 0 ? null : half * 2;

    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    inputMode="decimal"
                    min="30"
                    max="200"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g. 86"
                    className="w-full h-14 px-4 pr-14 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors text-[#0a0a0a] bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    cm
                </span>
            </div>

            <AnimatePresence>
                {full && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 grid grid-cols-2 gap-3"
                    >
                        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
                                Half Chest
                            </p>
                            <p className="text-xl font-black text-[#0a0a0a]">{value}cm</p>
                        </div>
                        <div className="bg-[#0a0a0a] rounded-xl p-4 text-center">
                            <p className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">
                                Full Chest
                            </p>
                            <p className="text-xl font-black text-white">{full}cm</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SelectDropdown({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#0a0a0a] bg-white focus:outline-none focus:border-[#0a0a0a] transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
            >
                <option value="">Select…</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
    );
}

type GarmentPath = {
    garmentType: GarmentType;
    halfMeasurement: string;
};

type SizePath = SizeEntry;

export function StepSetYourFit({
    method,
    garmentData,
    sizeData,
    onMethodSelect,
    onGarmentChange,
    onSizeChange,
    onCompute,
    onBack,
    saving,
}: {
    method: MeasurementMethod;
    garmentData: GarmentPath;
    sizeData: SizePath;
    onMethodSelect: (m: MeasurementMethod) => void;
    onGarmentChange: (d: GarmentPath) => void;
    onSizeChange: (d: SizePath) => void;
    onCompute: () => void;
    onBack: () => void;
    saving?: boolean;
}) {
    const [garmentStep, setGarmentStep] = useState<"choose" | "measure">("choose");

    const canContinueGarment =
        garmentData.garmentType && garmentData.halfMeasurement && parseFloat(garmentData.halfMeasurement) > 0;

    const canContinueSizes =
        sizeData.tshirt || sizeData.shirt;

    const canContinue = method === "garment" ? canContinueGarment : method === "sizes" ? canContinueSizes : false;

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
                    Set your fit
                </h2>
                <p className="text-sm text-gray-500">
                    How would you like to enter your measurements?
                </p>
            </div>

            {/* Method selection */}
            {!method && (
                <div className="flex flex-col gap-4 flex-1">
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => onMethodSelect("garment")}
                        className="w-full p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📏</span>
                            </div>
                            <div>
                                <p className="font-black text-[#0a0a0a] text-base mb-1">Measure a garment</p>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Lay a favourite shirt or trouser flat and measure across the chest or waist.
                                </p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => onMethodSelect("sizes")}
                        className="w-full p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🏷️</span>
                            </div>
                            <div>
                                <p className="font-black text-[#0a0a0a] text-base mb-1">Enter my usual sizes</p>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Tell us your label sizes (XL, 2XL etc.) and we&apos;ll work out your measurements.
                                </p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={onCompute}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center py-2"
                    >
                        Skip for now →
                    </motion.button>
                </div>
            )}

            {/* Garment path */}
            {method === "garment" && (
                <AnimatePresence mode="wait">
                    {garmentStep === "choose" ? (
                        <motion.div
                            key="choose"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col flex-1 gap-3"
                        >
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                Which garment are you measuring?
                            </p>
                            {[
                                { key: "shirt" as const, label: "Shirt / T-Shirt / Polo", emoji: "👔" },
                                { key: "trousers" as const, label: "Trousers / Shorts", emoji: "👖" },
                            ].map((g) => (
                                <button
                                    key={g.key}
                                    onClick={() => {
                                        onGarmentChange({ ...garmentData, garmentType: g.key });
                                        setGarmentStep("measure");
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${garmentData.garmentType === g.key
                                            ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <span className="text-2xl">{g.emoji}</span>
                                    <span className="font-semibold text-sm">{g.label}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => onMethodSelect(null)}
                                className="mt-auto text-sm text-gray-400 hover:text-gray-600 text-center py-2"
                            >
                                ← Change method
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="measure"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col flex-1"
                        >
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                {garmentData.garmentType === "shirt" ? "Shirt / T-Shirt / Polo" : "Trousers / Shorts"}
                            </p>
                            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                Lay the garment flat and measure from one {garmentData.garmentType === "shirt" ? "chest seam" : "hip seam"} to the other. Enter the <strong>half</strong> measurement.
                            </p>
                            <MeasurementInput
                                value={garmentData.halfMeasurement}
                                onChange={(v) => onGarmentChange({ ...garmentData, halfMeasurement: v })}
                                label={garmentData.garmentType === "shirt" ? "Half Chest Measurement" : "Half Waist Measurement"}
                            />
                            <div className="mt-auto">
                                <NavButtons
                                    onBack={() => setGarmentStep("choose")}
                                    onNext={onCompute}
                                    nextLabel="Generate my fit →"
                                    nextDisabled={!canContinueGarment}
                                    loading={saving}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Size entry path */}
            {method === "sizes" && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col flex-1"
                >
                    <p className="text-sm text-gray-600 mb-5">
                        Enter any sizes you know — we&apos;ll fill in the rest.
                    </p>
                    <div className="flex flex-col gap-4 flex-1">
                        <SelectDropdown
                            label="T-Shirt size"
                            value={sizeData.tshirt}
                            options={SHIRT_SIZES}
                            onChange={(v) => onSizeChange({ ...sizeData, tshirt: v })}
                        />
                        <SelectDropdown
                            label="Shirt size"
                            value={sizeData.shirt}
                            options={SHIRT_SIZES}
                            onChange={(v) => onSizeChange({ ...sizeData, shirt: v })}
                        />
                        <SelectDropdown
                            label="Waist size (inches)"
                            value={sizeData.waist}
                            options={WAIST_SIZES}
                            onChange={(v) => onSizeChange({ ...sizeData, waist: v })}
                        />
                    </div>
                    <NavButtons
                        onBack={() => onMethodSelect(null)}
                        onNext={onCompute}
                        nextLabel="Generate my fit →"
                        nextDisabled={!canContinueSizes}
                        loading={saving}
                    />
                </motion.div>
            )}

            {/* Back button if no method selected yet */}
            {!method && (
                <div className="mt-4">
                    <button
                        onClick={onBack}
                        className="w-full h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                </div>
            )}
        </motion.div>
    );
}
