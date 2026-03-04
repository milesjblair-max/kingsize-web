"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/features/auth/AuthContext";

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 14px",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    fontSize: 14,
    color: "#111",
    background: "#fff",
    outline: "none",
};

const btnPrimary: React.CSSProperties = {
    width: "100%",
    height: 46,
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
};

const btnSecondary: React.CSSProperties = {
    width: "100%",
    height: 46,
    background: "#fff",
    color: "#111",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
};

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter your email"); return; }
        const result = await login(email.trim().toLowerCase());
        if (result.success) {
            router.push(result.needsOnboarding ? "/onboarding" : "/account");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#9CA3AF")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    autoComplete="email"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <p className="text-xs text-gray-400 text-center">
                Demo mode: any email will sign you in
            </p>
            <button type="submit" style={btnPrimary}>
                Sign in
            </button>
            <button type="button" style={btnSecondary} onClick={onSwitch}>
                Create an account instead
            </button>
        </form>
    );
};

// ─── Register Form ────────────────────────────────────────────────────────────

const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { createAccount } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter a valid email"); return; }
        const result = await createAccount(email.trim().toLowerCase());
        if (result.success) {
            router.push("/onboarding");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#9CA3AF")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    autoComplete="email"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <p className="text-xs text-gray-400 text-center">
                You will be taken through a short style setup
            </p>
            <button type="submit" style={btnPrimary}>
                Create account and set up my profile
            </button>
            <button type="button" style={btnSecondary} onClick={onSwitch}>
                Already have an account? Sign in
            </button>
        </form>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
            <div
                className="w-full bg-white rounded-xl shadow-sm border border-gray-100"
                style={{ maxWidth: 420 }}
            >
                {/* Logo */}
                <div className="flex justify-center pt-8 pb-6 border-b border-gray-100">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Kingsize Big & Tall"
                            width={140}
                            height={60}
                            style={{ objectFit: "contain" }}
                            priority
                        />
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {(["login", "register"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setMode(tab)}
                            className="flex-1 py-3 text-sm font-bold transition-colors"
                            style={{
                                color: mode === tab ? "#111" : "#9CA3AF",
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderBottom: mode === tab ? "2px solid #111" : "2px solid transparent",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            {tab === "login" ? "Sign in" : "Create account"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="p-8">
                    {mode === "login" ? (
                        <LoginForm onSwitch={() => setMode("register")} />
                    ) : (
                        <RegisterForm onSwitch={() => setMode("login")} />
                    )}
                </div>

                {/* Back link */}
                <p className="text-center text-xs text-gray-400 pb-6">
                    <Link href="/" className="hover:text-gray-700 underline underline-offset-2">
                        Continue browsing without signing in
                    </Link>
                </p>
            </div>
        </div>
    );
}
