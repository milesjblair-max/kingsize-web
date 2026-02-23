"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FitType = "big" | "tall" | "big-tall";
export type ContactPref = "email" | "sms" | "both";
export type FitPref = "regular" | "relaxed";

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    fitType: FitType;
    dimensions?: {
        neck?: string;
        sleeve?: string;
        waist?: string;
        inseam?: string;
        shoeSize?: string;
        fitPref?: FitPref;
    };
    contactPref: ContactPref;
    onboardingComplete: boolean;
    createdAt: string;
}

export interface SwipeCard {
    id: string;
    image: string;
    label: string;
    category: string;
    tags: string[];
}

export interface StylePreferences {
    liked: SwipeCard[];
    passed: SwipeCard[];
    styleTags: string[];
    preferredCategories: string[];
    avoidCategories: string[];
    fitNotes: string[];
    summary: string;
    analyzedAt?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    profile: UserProfile | null;
    preferences: StylePreferences | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string) => { success: boolean; needsOnboarding: boolean };
    createAccount: (email: string) => { success: boolean };
    logout: () => void;
    saveProfile: (profile: UserProfile) => void;
    savePreferences: (prefs: StylePreferences) => void;
    resetDemo: () => void;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KS_AUTH = "ks_auth";
const KS_PROFILE = "ks_profile";
const KS_PREFS = "ks_preferences";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    isAuthenticated: false,
    profile: null,
    preferences: null,
    login: () => ({ success: false, needsOnboarding: false }),
    createAccount: () => ({ success: false }),
    logout: () => { return; },
    saveProfile: () => { return; },
    savePreferences: () => { return; },
    resetDemo: () => { return; },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeGet<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function safeSet(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* noop */ }
}

function safeRemove(...keys: string[]): void {
    try {
        keys.forEach((k) => localStorage.removeItem(k));
    } catch { /* noop */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        profile: null,
        preferences: null,
    });

    useEffect(() => {
        const auth = safeGet<{ isAuthenticated: boolean }>(KS_AUTH);
        const profile = safeGet<UserProfile>(KS_PROFILE);
        const preferences = safeGet<StylePreferences>(KS_PREFS);
        if (auth?.isAuthenticated) {
            setState({ isAuthenticated: true, profile, preferences });
        }
    }, []);

    const login = useCallback((email: string) => {
        const existing = safeGet<UserProfile>(KS_PROFILE);
        const profile = existing?.email === email ? existing : null;
        safeSet(KS_AUTH, { isAuthenticated: true });
        const pref = safeGet<StylePreferences>(KS_PREFS);
        setState({ isAuthenticated: true, profile, preferences: pref });
        return { success: true, needsOnboarding: !profile?.onboardingComplete };
    }, []);

    const createAccount = useCallback((email: string) => {
        const shell: Partial<UserProfile> = {
            email,
            onboardingComplete: false,
            createdAt: new Date().toISOString(),
        };
        safeSet(KS_AUTH, { isAuthenticated: true });
        safeSet(KS_PROFILE, shell);
        setState({ isAuthenticated: true, profile: shell as UserProfile, preferences: null });
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        safeRemove(KS_AUTH);
        setState({ isAuthenticated: false, profile: null, preferences: null });
    }, []);

    const saveProfile = useCallback((profile: UserProfile) => {
        safeSet(KS_PROFILE, profile);
        setState((s) => ({ ...s, profile }));
    }, []);

    const savePreferences = useCallback((preferences: StylePreferences) => {
        safeSet(KS_PREFS, preferences);
        setState((s) => ({ ...s, preferences }));
    }, []);

    const resetDemo = useCallback(() => {
        safeRemove(KS_AUTH, KS_PROFILE, KS_PREFS);
        setState({ isAuthenticated: false, profile: null, preferences: null });
    }, []);

    return (
        <AuthContext.Provider
            value={{ ...state, login, createAccount, logout, saveProfile, savePreferences, resetDemo }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
