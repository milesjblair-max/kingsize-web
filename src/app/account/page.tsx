"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

const Chip = ({ label }: { label: string }) => (
    <span className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full font-medium capitalize">
        {label}
    </span>
);

const Row = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-32 flex-shrink-0">{label}</span>
            <span className="text-sm text-gray-800 text-right">{value}</span>
        </div>
    );
};

const FIT_LABELS: Record<string, string> = {
    "big": "Big",
    "tall": "Tall",
    "big-tall": "Big and Tall",
};

export default function AccountPage() {
    const { isAuthenticated, profile, preferences, logout, resetDemo } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.push("/login");
        else if (!profile?.onboardingComplete) router.push("/onboarding");
    }, [isAuthenticated, profile, router]);

    if (!profile?.onboardingComplete) return null;

    const dims = profile.dimensions ?? {};
    const hasDims = Object.values(dims).some(Boolean);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleReset = () => {
        if (confirm("This will clear all demo data. Continue?")) {
            resetDemo();
            router.push("/");
        }
    };

    return (
        <div className="min-h-[80vh] bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-700 transition-colors"
                    >
                        Back to shop
                    </Link>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5">
                    <div className="px-6 pt-5 pb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your profile</p>
                    </div>
                    <div className="px-6 pb-5">
                        <Row label="Name" value={`${profile.firstName} ${profile.lastName}`} />
                        <Row label="Email" value={profile.email} />
                        <Row label="Mobile" value={profile.mobile} />
                        <Row label="Fit type" value={FIT_LABELS[profile.fitType]} />
                        <Row label="Contact" value={
                            profile.contactPref === "both" ? "Email and SMS"
                                : profile.contactPref === "sms" ? "SMS"
                                    : "Email"
                        } />
                    </div>
                </div>

                {/* Dimensions card */}
                {hasDims && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5">
                        <div className="px-6 pt-5 pb-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your measurements</p>
                        </div>
                        <div className="px-6 pb-5">
                            <Row label="Neck" value={dims.neck} />
                            <Row label="Sleeve" value={dims.sleeve} />
                            <Row label="Waist" value={dims.waist} />
                            <Row label="Inseam" value={dims.inseam} />
                            <Row label="Shoe size" value={dims.shoeSize} />
                            <Row label="Fit width" value={dims.fitPref} />
                        </div>
                    </div>
                )}

                {/* Style profile card */}
                {preferences && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5">
                        <div className="px-6 pt-5 pb-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Your style profile</p>

                            {preferences.styleTags.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Style tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.styleTags.map((t) => <Chip key={t} label={t} />)}
                                    </div>
                                </div>
                            )}

                            {preferences.preferredCategories.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Preferred categories</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.preferredCategories.map((c) => (
                                            <span key={c} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium capitalize">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {preferences.fitNotes.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Fit notes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.fitNotes.map((n) => (
                                            <span key={n} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {preferences.summary && (
                                <p className="text-sm text-gray-500 italic mt-2 leading-relaxed">
                                    {preferences.summary}
                                </p>
                            )}

                            {/* Liked items preview */}
                            {preferences.liked.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <p className="text-xs text-gray-500 mb-2">Items you liked</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {preferences.liked.map((c) => (
                                            <div key={c.id} className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-100" title={c.label}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={c.image} alt={c.label} className="w-full h-full object-cover object-top" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/onboarding"
                        className="flex-1 h-11 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        Redo style swipes
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex-1 h-11 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Sign out
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex-1 h-11 rounded-md text-sm font-bold transition-colors"
                        style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FECACA" }}
                    >
                        Reset demo
                    </button>
                </div>
            </div>
        </div>
    );
}
