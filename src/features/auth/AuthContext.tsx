"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─── Types (Public surface — unchanged so consuming components need zero edits) ─

export type FitType = "big" | "tall" | "big-tall";
export type ContactPref = "email" | "sms" | "both";
export type FitPref = "regular" | "relaxed";

export interface UserProfile {
    firstName?: string;
    lastName?: string;
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
    loading: boolean;
}

interface AuthContextValue extends AuthState {
    login: (email: string) => Promise<{ success: boolean; needsOnboarding: boolean; error?: string }>;
    createAccount: (email: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    saveProfile: (profile: UserProfile) => Promise<void>;
    savePreferences: (prefs: StylePreferences) => void;
    resetDemo: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    isAuthenticated: false,
    profile: null,
    preferences: null,
    loading: true,
    login: async () => ({ success: false, needsOnboarding: false }),
    createAccount: async () => ({ success: false }),
    logout: async () => { return; },
    saveProfile: async () => { return; },
    savePreferences: () => { return; },
    resetDemo: async () => { return; },
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        profile: null,
        preferences: null,
        loading: true,
    });

    // On mount — restore session from server via httpOnly cookie (no localStorage PII)
    useEffect(() => {
        fetch("/api/gateway/customer/session")
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated) {
                    setState({ isAuthenticated: true, profile: data.profile, preferences: null, loading: false });
                } else {
                    setState((s) => ({ ...s, loading: false }));
                }
            })
            .catch(() => setState((s) => ({ ...s, loading: false })));
    }, []);

    // Login / create account — posts to server, which sets an httpOnly session cookie
    const login = useCallback(async (email: string) => {
        try {
            const res = await fetch("/api/gateway/customer/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.success) {
                // Reload profile from server to ensure session is active
                const sessionRes = await fetch("/api/gateway/customer/session");
                const sessionData = await sessionRes.json();

                if (sessionData.authenticated) {
                    setState({ isAuthenticated: true, profile: sessionData.profile, preferences: null, loading: false });
                    return { success: true, needsOnboarding: data.needsOnboarding };
                }
                return { success: false, error: "Session synchronization failed. Please try again.", needsOnboarding: false };
            }
            return { success: false, error: data.error || "Login failed", needsOnboarding: false };
        } catch (err) {
            console.error("[auth] login error", err);
            return { success: false, error: "An unexpected error occurred", needsOnboarding: false };
        }
    }, []);

    const createAccount = useCallback(async (email: string) => {
        try {
            const res = await fetch("/api/gateway/customer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.success) {
                // Reload profile from server to ensure session is active
                const sessionRes = await fetch("/api/gateway/customer/session");
                const sessionData = await sessionRes.json();

                if (sessionData.authenticated) {
                    setState({ isAuthenticated: true, profile: sessionData.profile, preferences: null, loading: false });
                    return { success: true, needsOnboarding: data.needsOnboarding };
                }
                return { success: false, error: "Account created but session synchronization failed.", needsOnboarding: false };
            }
            return { success: false, error: data.error || "Failed to create account", needsOnboarding: false };
        } catch (err) {
            console.error("[auth] register error", err);
            return { success: false, error: "An unexpected error occurred during account creation", needsOnboarding: false };
        }
    }, []);

    const logout = useCallback(async () => {
        await fetch("/api/gateway/customer/session", { method: "DELETE" });
        setState({ isAuthenticated: false, profile: null, preferences: null, loading: false });
    }, []);

    // Save full profile via gateway (Zod-validated on server)
    const saveProfile = useCallback(async (profile: UserProfile) => {
        await fetch("/api/gateway/customer/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
        });
        setState((s) => ({ ...s, profile }));
    }, []);

    // Preferences: stored in component state only (not localStorage, not server PII)
    // These are transient for the session. For persistence, add a /api/gateway/customer/preferences endpoint.
    const savePreferences = useCallback((preferences: StylePreferences) => {
        setState((s) => ({ ...s, preferences }));
    }, []);

    const resetDemo = useCallback(async () => {
        await logout();
    }, [logout]);

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
