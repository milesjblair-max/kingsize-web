"use client";

/**
 * useOnboarding — Central state hook for the 7-step onboarding wizard.
 *
 * Owns all step data and handles API persistence at each step transition.
 * Plugs into existing gateway routes — no schema changes.
 */

import { useState, useCallback } from "react";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type FitType = "big" | "tall" | "big-tall";
export type ContactPref = "email" | "sms" | "both";
export type MeasurementMethod = "garment" | "sizes" | null;
export type GarmentType = "shirt" | "trousers" | null;

export interface MeasurementsByGarment {
    garmentType: GarmentType;
    halfMeasurement: string; // cm entered by user
}

export interface SizeEntry {
    tshirt: string;
    shirt: string;
    waist: string;
}

export interface FitProfileRow {
    label: string;
    key: string;
    value: string;
    editable: boolean;
}

export interface SwipeCardData {
    id: string;
    image: string;
    label: string;
    category: string;
    tags: string[];
}

export interface OnboardingState {
    // Step 2
    fitType: FitType | null;
    // Step 3
    measurementMethod: MeasurementMethod;
    garmentMeasurement: MeasurementsByGarment;
    sizeEntry: SizeEntry;
    // Step 4 — AI Fit Profile (computed)
    fitProfile: FitProfileRow[];
    fitProfileConfirmed: boolean;
    // Step 5
    selectedCategories: string[];
    swipeLiked: SwipeCardData[];
    swipePassed: SwipeCardData[];
    // Step 6
    contactPref: ContactPref | null;
    mobile: string;
    marketingConsent: boolean;
}

export const STYLE_CATEGORIES = [
    "Polos",
    "Tees",
    "Shorts",
    "Casual Shirts",
    "Activewear",
    "Footwear",
    "Jeans & Trousers",
    "Jackets",
];

const DEFAULT_STATE: OnboardingState = {
    fitType: null,
    measurementMethod: null,
    garmentMeasurement: { garmentType: null, halfMeasurement: "" },
    sizeEntry: { tshirt: "", shirt: "", waist: "" },
    fitProfile: [],
    fitProfileConfirmed: false,
    selectedCategories: [],
    swipeLiked: [],
    swipePassed: [],
    contactPref: null,
    mobile: "",
    marketingConsent: false,
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function saveOnboardingData(
    data: Record<string, unknown>
): Promise<boolean> {
    try {
        const res = await fetch("/api/gateway/customer/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function saveSwipeData(
    liked: SwipeCardData[],
    passed: SwipeCardData[]
): Promise<boolean> {
    try {
        const res = await fetch("/api/gateway/personalization/swipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                liked: liked.map((c) => ({ id: c.id, category: c.category, tags: c.tags })),
                passed: passed.map((c) => ({ id: c.id, category: c.category, tags: c.tags })),
            }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── AI sizing (converts label sizes to measurements) ─────────────────────────

function deriveMeasurementsFromSizes(sizes: SizeEntry): Record<string, string> {
    // Rules-based size-to-measurement mapping
    // Based on standard big & tall sizing tables
    const shirtToChest: Record<string, number> = {
        "S": 96, "M": 100, "L": 104, "XL": 108, "2XL": 112,
        "3XL": 116, "4XL": 120, "5XL": 124, "6XL": 128,
        "XS": 92,
    };
    const tshirtToChest: Record<string, number> = {
        "S": 94, "M": 98, "L": 102, "XL": 106, "2XL": 110,
        "3XL": 114, "4XL": 118, "5XL": 122, "6XL": 126,
        "XS": 90,
    };

    const chest = shirtToChest[sizes.shirt.toUpperCase()] ?? tshirtToChest[sizes.tshirt.toUpperCase()];
    const waistNum = parseInt(sizes.waist) || undefined;

    return {
        ...(chest ? { fullChest: `${chest}cm`, halfChest: `${chest / 2}cm` } : {}),
        ...(waistNum ? { waist: `${waistNum}cm` } : {}),
        tshirtSize: sizes.tshirt,
        shirtSize: sizes.shirt,
        waistSize: sizes.waist,
    };
}

function buildFitProfile(
    fitType: FitType,
    measurements: Record<string, string>
): FitProfileRow[] {
    const rows: FitProfileRow[] = [
        {
            label: "T-Shirts",
            key: "tshirtSize",
            value: measurements.tshirtSize || "—",
            editable: true,
        },
        {
            label: "Casual Shirts",
            key: "shirtSize",
            value: measurements.shirtSize || "—",
            editable: true,
        },
        {
            label: "Full Chest",
            key: "fullChest",
            value: measurements.fullChest || "—",
            editable: true,
        },
        {
            label: "Half Chest",
            key: "halfChest",
            value: measurements.halfChest || "—",
            editable: true,
        },
        {
            label: "Waist",
            key: "waistSize",
            value: measurements.waistSize || measurements.waist || "—",
            editable: true,
        },
        {
            label: "Fit Type",
            key: "fitType",
            value: fitType === "big-tall" ? "Big & Tall" : fitType === "big" ? "Big" : "Tall",
            editable: false,
        },
    ];
    return rows;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboarding() {
    const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
    const [saving, setSaving] = useState(false);

    const update = useCallback((partial: Partial<OnboardingState>) => {
        setState((s) => ({ ...s, ...partial }));
    }, []);

    // Step 2 → persist fit type immediately
    const saveFitType = useCallback(async (fitType: FitType) => {
        update({ fitType });
        setSaving(true);
        await saveOnboardingData({ fitType });
        setSaving(false);
    }, [update]);

    // Step 3 → compute measurements from garment entry
    const computeFromGarment = useCallback((
        garmentType: GarmentType,
        halfMeasurement: string
    ): FitProfileRow[] => {
        const half = parseFloat(halfMeasurement);
        if (isNaN(half) || half <= 0) return [];
        const full = half * 2;
        const measurements: Record<string, string> = {
            halfChest: `${half}cm`,
            fullChest: `${full}cm`,
            garmentType: garmentType === "shirt" ? "Shirt" : "Trousers",
        };
        return buildFitProfile(state.fitType ?? "big-tall", measurements);
    }, [state.fitType]);

    // Step 3 → compute measurements from label sizes
    const computeFromSizes = useCallback((sizes: SizeEntry): FitProfileRow[] => {
        const measurements = deriveMeasurementsFromSizes(sizes);
        return buildFitProfile(state.fitType ?? "big-tall", measurements);
    }, [state.fitType]);

    // Step 3 → save measurements
    const saveMeasurements = useCallback(async (
        profile: FitProfileRow[],
        rawMeasurements: Record<string, string>
    ) => {
        update({ fitProfile: profile, fitProfileConfirmed: false });
        setSaving(true);
        await saveOnboardingData({ measurements: rawMeasurements });
        setSaving(false);
    }, [update]);

    // Step 5 → save swipe data
    const saveSwipes = useCallback(async (
        liked: SwipeCardData[],
        passed: SwipeCardData[]
    ) => {
        update({ swipeLiked: liked, swipePassed: passed });
        if (liked.length > 0 || passed.length > 0) {
            setSaving(true);
            await saveSwipeData(liked, passed);
            setSaving(false);
        }
    }, [update]);

    // Step 6 → save contact preferences and mark onboarding done
    const saveContactAndFinish = useCallback(async (
        contactPref: ContactPref,
        mobile: string,
        marketingConsent: boolean,
        categories: string[]
    ) => {
        update({ contactPref, mobile, marketingConsent });
        setSaving(true);
        await saveOnboardingData({
            preferredCategories: categories,
            marketingConsent,
            onboardingDone: true,
        });
        setSaving(false);
    }, [update]);

    return {
        state,
        update,
        saving,
        saveFitType,
        computeFromGarment,
        computeFromSizes,
        saveMeasurements,
        saveSwipes,
        saveContactAndFinish,
    };
}
