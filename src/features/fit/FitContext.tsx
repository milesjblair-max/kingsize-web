"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type FitOption = "big" | "tall" | "big-tall" | null;

interface FitContextValue {
    fit: FitOption;
    setFit: (fit: FitOption) => void;
    clearFit: () => void;
    fitLabel: string | null;
    fitShowingLabel: string | null;
}

const FIT_STORAGE_KEY = "ks-fit-preference";

const FitContext = createContext<FitContextValue>({
    fit: null,
    setFit: () => { },
    clearFit: () => { },
    fitLabel: null,
    fitShowingLabel: null,
});

const FIT_LABELS: Record<NonNullable<FitOption>, { label: string; showing: string }> = {
    "big": { label: "Big", showing: "Showing Big products" },
    "tall": { label: "Tall", showing: "Showing Tall products" },
    "big-tall": { label: "Big and Tall", showing: "Showing Big and Tall products" },
};

export const FitProvider = ({ children }: { children: ReactNode }) => {
    const [fit, setFitState] = useState<FitOption>(null);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FIT_STORAGE_KEY) as FitOption;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (stored && FIT_LABELS[stored]) setFitState(stored);
        } catch {
            // localStorage unavailable (SSR / private mode)
        }
    }, []);

    const setFit = useCallback((next: FitOption) => {
        setFitState(next);
        try {
            if (next) localStorage.setItem(FIT_STORAGE_KEY, next);
            else localStorage.removeItem(FIT_STORAGE_KEY);
        } catch { /* noop */ }
    }, []);

    const clearFit = useCallback(() => setFit(null), [setFit]);

    const fitLabel = fit ? FIT_LABELS[fit].label : null;
    const fitShowingLabel = fit ? FIT_LABELS[fit].showing : null;

    return (
        <FitContext.Provider value={{ fit, setFit, clearFit, fitLabel, fitShowingLabel }}>
            {children}
        </FitContext.Provider>
    );
};

export const useFit = () => useContext(FitContext);
