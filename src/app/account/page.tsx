"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import type { FitType, ContactPref } from "@/features/auth/AuthContext";
import {
    LayoutDashboard, User, Ruler, Sparkles,
    Package, RotateCcw, MapPin, HelpCircle,
    LogOut, Check, RefreshCw, Heart,
} from "lucide-react";
import { FitSelector } from "@/features/personalisation/FitSelector";


// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = "overview" | "profile" | "measurements" | "style" | "orders" | "returns" | "addresses";

// ─── Constants ─────────────────────────────────────────────────────────────────
const FIT_LABELS: Record<string, string> = {
    big: "Big", tall: "Tall", "big-tall": "Big and Tall",
};
const CONTACT_LABELS: Record<string, string> = {
    email: "Email only", sms: "SMS only", both: "Email and SMS",
};
const FIT_OPTIONS: { key: FitType; label: string }[] = [
    { key: "big", label: "Big" },
    { key: "tall", label: "Tall" },
    { key: "big-tall", label: "Big and Tall" },
];
const CONTACT_OPTIONS: { key: ContactPref; label: string }[] = [
    { key: "email", label: "Email only" },
    { key: "sms", label: "SMS only" },
    { key: "both", label: "Email and SMS" },
];

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const inputCls = "w-full h-10 px-3 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:border-gray-500 bg-white transition-colors";
const labelCls = "block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest";

const Card = ({ title, action, children }: {
    title: string; action?: React.ReactNode; children: React.ReactNode;
}) => (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            {action}
        </div>
        {children}
    </div>
);

const FieldRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
            <span className="text-sm text-gray-800 text-right">{value}</span>
        </div>
    );
};

const Chip = ({ label, dark }: { label: string; dark?: boolean }) => (
    <span className={`text-xs px-3 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
        {label}
    </span>
);

const EmptyState = ({ text }: { text: string }) => (
    <p className="text-sm text-gray-400 py-1">{text}</p>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
    <div
        className="fixed bottom-6 left-1/2 flex items-center gap-2 bg-gray-900 text-white text-sm font-bold rounded-full px-5 py-3 shadow-xl transition-all duration-300 z-[999] whitespace-nowrap"
        style={{
            transform: `translateX(-50%) translateY(${visible ? "0" : "16px"})`,
            opacity: visible ? 1 : 0,
            pointerEvents: "none",
        }}
    >
        <Check size={14} strokeWidth={2.5} />
        {message}
    </div>
);

function useToast() {
    const [msg, setMsg] = useState("");
    const [visible, setVisible] = useState(false);
    const show = useCallback((m: string) => {
        setMsg(m);
        setVisible(true);
        setTimeout(() => setVisible(false), 2500);
    }, []);
    return { msg, visible, show };
}

// ─── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ onTab }: { onTab: (t: Tab) => void }) {
    const { profile, preferences } = useAuth();
    const dims = profile?.dimensions ?? {};
    const hasDims = Object.values(dims).some(Boolean);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Profile snapshot */}
            <Card
                title="Profile"
                action={
                    <button onClick={() => onTab("profile")}
                        className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                        Edit
                    </button>
                }
            >
                <FieldRow label="Name" value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()} />
                <FieldRow label="Email" value={profile?.email} />
                <FieldRow label="Mobile" value={profile?.mobile} />
                <FieldRow label="Fit" value={FIT_LABELS[profile?.fitType ?? ""]} />
                <FieldRow label="Contact" value={CONTACT_LABELS[profile?.contactPref ?? ""]} />
            </Card>

            {/* Measurements snapshot */}
            <Card
                title="Measurements"
                action={
                    <button onClick={() => onTab("measurements")}
                        className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                        {hasDims ? "Update" : "Add"}
                    </button>
                }
            >
                {hasDims ? (
                    <>
                        <FieldRow label="Neck" value={dims.neck} />
                        <FieldRow label="Sleeve" value={dims.sleeve} />
                        <FieldRow label="Waist" value={dims.waist} />
                        <FieldRow label="Inseam" value={dims.inseam} />
                        <FieldRow label="Shoe size" value={dims.shoeSize} />
                        <FieldRow label="Fit width" value={dims.fitPref} />
                    </>
                ) : (
                    <EmptyState text="No measurements saved yet. Adding them helps match your size more accurately." />
                )}
            </Card>

            {/* Style snapshot — full width */}
            <div className="lg:col-span-2">
                <Card
                    title="Style profile"
                    action={
                        <Link
                            href="/onboarding?redo=true&returnTo=%2Faccount%3Ftab%3Dstyle%26updated%3D1"
                            className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            Redo swipes
                        </Link>
                    }
                >
                    {preferences && (preferences.styleTags.length > 0 || preferences.liked.length > 0) ? (
                        <div>
                            {preferences.styleTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {preferences.styleTags.map((t) => <Chip key={t} label={t} dark />)}
                                </div>
                            )}
                            {preferences.summary && (
                                <p className="text-sm text-gray-500 italic mb-4 leading-relaxed">{preferences.summary}</p>
                            )}
                            {preferences.liked.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {preferences.liked.map((c) => (
                                        <div key={c.id} className="w-10 h-10 rounded-md overflow-hidden border border-gray-100 flex-shrink-0" title={c.label}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={c.image} alt={c.label} className="w-full h-full object-cover object-top" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-4">
                            <EmptyState text="No style profile yet." />
                            <Link
                                href="/onboarding?redo=true&returnTo=%2Faccount%3Ftab%3Dstyle%26updated%3D1"
                                className="flex-shrink-0 h-9 px-4 bg-gray-900 text-white text-xs font-bold rounded-md hover:bg-black transition-colors flex items-center"
                            >
                                Set up style profile
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ─── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ showToast }: { showToast: (m: string) => void }) {
    const { profile, saveProfile } = useAuth();

    const [form, setForm] = useState({
        firstName: profile?.firstName ?? "",
        lastName: profile?.lastName ?? "",
        mobile: profile?.mobile ?? "",
        fitType: (profile?.fitType ?? "big") as FitType,
        contactPref: (profile?.contactPref ?? "email") as ContactPref,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = "Required";
        if (!form.lastName.trim()) e.lastName = "Required";
        if ((form.contactPref === "sms" || form.contactPref === "both") && !form.mobile.trim()) {
            e.mobile = "Mobile number is required when SMS is selected";
        }
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        if (!profile) return;
        saveProfile({
            ...profile,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            mobile: form.mobile.trim() || undefined,
            fitType: form.fitType,
            contactPref: form.contactPref,
        });
        setErrors({});
        showToast("Profile saved");
    };

    return (
        <Card title="Edit profile">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={labelCls}>First name</label>
                    <input className={inputCls} value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                    <label className={labelCls}>Last name</label>
                    <input className={inputCls} value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
            </div>

            <div className="mb-4">
                <label className={labelCls}>
                    Email <span className="font-normal text-gray-400 normal-case tracking-normal">(read-only in demo)</span>
                </label>
                <input className={inputCls + " bg-gray-50 text-gray-400 cursor-not-allowed"} value={profile?.email ?? ""} readOnly />
            </div>

            <div className="mb-4">
                <label className={labelCls}>Mobile</label>
                <input className={inputCls} type="tel" value={form.mobile} placeholder="04XX XXX XXX"
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            <div className="mb-6">
                <label className={labelCls}>Fit type</label>
                <FitSelector
                    initial={form.fitType}
                    onSelect={(fit) => setForm((f) => ({ ...f, fitType: fit }))}
                    compact
                />
            </div>

            <div className="mb-6">
                <label className={labelCls}>Contact preference</label>
                <div className="flex flex-col gap-2">
                    {CONTACT_OPTIONS.map((opt) => (
                        <button key={opt.key} onClick={() => setForm((f) => ({ ...f, contactPref: opt.key }))}
                            className="h-10 px-4 rounded-md border text-sm text-left font-medium transition-all"
                            style={{
                                borderColor: form.contactPref === opt.key ? "#111" : "#E5E7EB",
                                background: form.contactPref === opt.key ? "#111" : "#fff",
                                color: form.contactPref === opt.key ? "#fff" : "#374151",
                            }}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={handleSave}
                className="w-full h-11 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">
                Save changes
            </button>
        </Card>
    );
}

// ─── Measurements tab ──────────────────────────────────────────────────────────
function MeasurementsTab({ showToast }: { showToast: (m: string) => void }) {
    const { profile, saveProfile } = useAuth();
    const dims = profile?.dimensions ?? {};

    const [form, setForm] = useState({
        neck: dims.neck ?? "",
        sleeve: dims.sleeve ?? "",
        waist: dims.waist ?? "",
        inseam: dims.inseam ?? "",
        shoeSize: dims.shoeSize ?? "",
        fitPref: (dims.fitPref ?? "") as "regular" | "relaxed" | "",
    });

    const handleSave = () => {
        if (!profile) return;
        saveProfile({
            ...profile,
            dimensions: {
                neck: form.neck || undefined,
                sleeve: form.sleeve || undefined,
                waist: form.waist || undefined,
                inseam: form.inseam || undefined,
                shoeSize: form.shoeSize || undefined,
                fitPref: form.fitPref || undefined,
            },
        });
        showToast("Measurements saved");
    };

    const dimFields: { key: keyof Omit<typeof form, "fitPref">; label: string; placeholder: string }[] = [
        { key: "neck", label: "Neck", placeholder: "e.g. 46cm" },
        { key: "sleeve", label: "Sleeve length", placeholder: "e.g. 88cm" },
        { key: "waist", label: "Waist", placeholder: "e.g. 102cm" },
        { key: "inseam", label: "Inseam", placeholder: "e.g. 86cm" },
        { key: "shoeSize", label: "Shoe size", placeholder: "e.g. 47EU / 13US" },
    ];

    return (
        <Card title="Measurements">
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                All fields are optional. They help us match your size and reduce the chance of returns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {dimFields.map((f) => (
                    <div key={f.key}>
                        <label className={labelCls}>{f.label}</label>
                        <input className={inputCls} value={form[f.key]} placeholder={f.placeholder}
                            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                ))}
            </div>
            <div className="mb-6">
                <label className={labelCls}>Preferred fit width</label>
                <div className="flex gap-3">
                    {(["regular", "relaxed"] as const).map((fp) => (
                        <button key={fp}
                            onClick={() => setForm((f) => ({ ...f, fitPref: f.fitPref === fp ? "" : fp }))}
                            className="flex-1 h-10 rounded-md border text-sm font-bold transition-all capitalize"
                            style={{
                                borderColor: form.fitPref === fp ? "#111" : "#E5E7EB",
                                background: form.fitPref === fp ? "#111" : "#fff",
                                color: form.fitPref === fp ? "#fff" : "#374151",
                            }}>
                            {fp}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={handleSave}
                className="w-full h-11 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">
                Save measurements
            </button>
        </Card>
    );
}

// ─── Style tab ─────────────────────────────────────────────────────────────────
function StyleTab({ showToast }: { showToast: (m: string) => void }) {
    const { preferences, savePreferences } = useAuth();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("updated") === "1") {
            showToast("Style profile updated");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResetStyle = () => {
        if (!confirm("Clear your style profile? You can redo the swipes any time.")) return;
        savePreferences({
            liked: [], passed: [],
            styleTags: [], preferredCategories: [],
            avoidCategories: [], fitNotes: [],
            summary: "",
        });
        showToast("Style profile cleared");
    };

    const redoUrl = "/onboarding?redo=true&returnTo=" + encodeURIComponent("/account?tab=style&updated=1");

    return (
        <div>
            {/* Primary actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link href={redoUrl}
                    className="flex-1 h-11 bg-gray-900 text-white text-sm font-bold rounded-md hover:bg-black transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={14} strokeWidth={2} />
                    Redo style swipes
                </Link>
                <button onClick={handleResetStyle}
                    className="flex-1 h-11 border border-gray-200 text-sm font-bold text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
                    Reset style profile
                </button>
            </div>

            {preferences && (preferences.styleTags.length > 0 || preferences.liked.length > 0) ? (
                <>
                    {/* Style tags + summary */}
                    {preferences.styleTags.length > 0 && (
                        <Card title="Your style tags">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {preferences.styleTags.map((t) => <Chip key={t} label={t} dark />)}
                            </div>
                            {preferences.summary && (
                                <p className="text-sm text-gray-500 italic leading-relaxed">{preferences.summary}</p>
                            )}
                        </Card>
                    )}

                    {/* Liked items */}
                    {preferences.liked.length > 0 && (
                        <Card title="Items you liked">
                            <div className="flex flex-wrap gap-2">
                                {preferences.liked.map((c) => (
                                    <div key={c.id} className="relative group">
                                        <div className="w-14 h-14 rounded-md overflow-hidden border border-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={c.image} alt={c.label} className="w-full h-full object-cover object-top" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full items-center justify-center hidden group-hover:flex">
                                            <Heart size={9} className="text-white fill-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Category preferences */}
                    {(preferences.preferredCategories.length > 0 || preferences.avoidCategories.length > 0) && (
                        <Card title="Category preferences">
                            {preferences.preferredCategories.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-400 mb-2">Preferred</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.preferredCategories.map((c) => <Chip key={c} label={c} />)}
                                    </div>
                                </div>
                            )}
                            {preferences.avoidCategories.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Less interested in</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.avoidCategories.map((c) => <Chip key={c} label={c} />)}
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Fit notes */}
                    {preferences.fitNotes.length > 0 && (
                        <Card title="Fit notes">
                            <div className="flex flex-wrap gap-2">
                                {preferences.fitNotes.map((n) => (
                                    <span key={n} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{n}</span>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                    <Sparkles size={24} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400 mb-1">No style profile yet</p>
                    <p className="text-xs text-gray-400 mb-5">Complete the style swipes to get personalised recommendations on the homepage.</p>
                    <Link href={redoUrl}
                        className="inline-flex items-center gap-2 h-10 px-6 bg-gray-900 text-white text-sm font-bold rounded-md hover:bg-black transition-colors">
                        <RefreshCw size={13} />
                        Start style swipes
                    </Link>
                </div>
            )}
        </div>
    );
}

// ─── Placeholder tab ────────────────────────────────────────────────────────────
function PlaceholderTab({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <Icon size={28} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-bold text-gray-400">{title}</p>
            <p className="text-xs text-gray-300 mt-1">Coming soon</p>
        </div>
    );
}

// ─── Nav items config ──────────────────────────────────────────────────────────
const MAIN_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "measurements", label: "Measurements", icon: Ruler },
    { id: "style", label: "Style", icon: Sparkles },
];

const EXTRA_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "returns", label: "Returns", icon: RotateCcw },
    { id: "addresses", label: "Addresses", icon: MapPin },
];

// ─── Account content (uses searchParams) ──────────────────────────────────────
function AccountContent() {
    const { isAuthenticated, profile, preferences, logout, resetDemo } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("tab") ?? "overview") as Tab;
    const toast = useToast();

    useEffect(() => {
        if (!isAuthenticated) router.push("/login");
        else if (!profile?.onboardingComplete) router.push("/onboarding");
    }, [isAuthenticated, profile, router]);

    const setTab = useCallback((t: Tab) => {
        router.push(`/account?tab=${t}`, { scroll: false });
    }, [router]);

    const handleLogout = () => { logout(); router.push("/"); };
    const handleReset = () => {
        if (confirm("This will clear all demo data. Continue?")) {
            resetDemo();
            router.push("/");
        }
    };

    if (!isAuthenticated || !profile?.onboardingComplete) return null;

    const fitLabel = FIT_LABELS[profile.fitType] ?? profile.fitType;

    // ── Left nav item ───────────────────────────────────────────────────────────
    const NavItem = ({ id, label, Icon }: { id: Tab; label: string; Icon: React.ElementType }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                    background: isActive ? "#F3F4F6" : "transparent",
                    color: isActive ? "#111" : "#6B7280",
                    borderLeft: isActive ? "2px solid #111" : "2px solid transparent",
                    fontWeight: isActive ? 700 : 500,
                }}
                aria-current={isActive ? "page" : undefined}
            >
                <Icon size={15} strokeWidth={isActive ? 2 : 1.8} />
                {label}
            </button>
        );
    };

    // ── Render content by tab ───────────────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case "overview": return <OverviewTab onTab={setTab} />;
            case "profile": return <ProfileTab showToast={toast.show} />;
            case "measurements": return <MeasurementsTab showToast={toast.show} />;
            case "style": return <StyleTab showToast={toast.show} />;
            case "orders": return <PlaceholderTab title="Orders" icon={Package} />;
            case "returns": return <PlaceholderTab title="Returns" icon={RotateCcw} />;
            case "addresses": return <PlaceholderTab title="Addresses" icon={MapPin} />;
            default: return <OverviewTab onTab={setTab} />;
        }
    };

    const tabTitle = [...MAIN_TABS, ...EXTRA_TABS].find((t) => t.id === activeTab)?.label ?? "Overview";

    return (
        <>
            <Toast message={toast.msg} visible={toast.visible} />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-8">

                    {/* ── Mobile tab bar ──────────────────────────────────────── */}
                    <div className="lg:hidden mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account</p>
                        {/* Scrollable pill nav */}
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                            {[...MAIN_TABS, ...EXTRA_TABS].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                                    style={{
                                        background: activeTab === t.id ? "#111" : "#fff",
                                        color: activeTab === t.id ? "#fff" : "#6B7280",
                                        border: activeTab === t.id ? "1px solid #111" : "1px solid #E5E7EB",
                                    }}
                                >
                                    <t.icon size={12} strokeWidth={2} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Desktop + mobile layout ─────────────────────────────── */}
                    <div className="flex gap-6 items-start">

                        {/* ── Left sidebar (desktop only) ─────────────────────── */}
                        <aside
                            className="hidden lg:flex flex-col flex-shrink-0 bg-white border border-gray-100 rounded-xl p-4 gap-1"
                            style={{ width: 256, position: "sticky", top: 24, maxHeight: "calc(100vh - 48px)", overflowY: "auto" }}
                        >
                            {/* User summary */}
                            <div className="px-3 pt-2 pb-4 border-b border-gray-100 mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                    {profile.firstName} {profile.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate mb-2">{profile.email}</p>
                                <span className="inline-block text-[10px] font-bold bg-gray-900 text-white px-2.5 py-0.5 rounded-full">
                                    {fitLabel}
                                </span>
                                {preferences?.styleTags && preferences.styleTags.length > 0 && (
                                    <p className="text-[10px] text-gray-400 mt-2 truncate">
                                        {preferences.styleTags.slice(0, 2).join(", ")}
                                    </p>
                                )}
                            </div>

                            {/* Main nav */}
                            {MAIN_TABS.map((t) => (
                                <NavItem key={t.id} id={t.id} label={t.label} Icon={t.icon} />
                            ))}

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2" />

                            {/* Extra nav */}
                            {EXTRA_TABS.map((t) => (
                                <NavItem key={t.id} id={t.id} label={t.label} Icon={t.icon} />
                            ))}

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2" />

                            {/* Support link */}
                            <Link
                                href="/help"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium"
                            >
                                <HelpCircle size={15} strokeWidth={1.8} />
                                Support
                            </Link>

                            {/* Sign out */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all font-medium"
                            >
                                <LogOut size={15} strokeWidth={1.8} />
                                Sign out
                            </button>

                            {/* Reset demo */}
                            <button
                                onClick={handleReset}
                                className="w-full text-center px-3 py-2 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors mt-1 rounded-lg hover:bg-red-50"
                            >
                                Reset demo
                            </button>
                        </aside>

                        {/* ── Content area ─────────────────────────────────────── */}
                        <div className="flex-1 min-w-0">
                            {/* Content header */}
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-xl font-bold text-gray-900">{tabTitle}</h1>
                                <Link href="/"
                                    className="text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors hidden lg:block">
                                    Back to shop
                                </Link>
                            </div>

                            {/* Tab content */}
                            {renderContent()}

                            {/* Mobile footer actions */}
                            <div className="lg:hidden mt-6 flex flex-col gap-3">
                                <div className="border-t border-gray-100 pt-4 flex gap-3">
                                    <button onClick={handleLogout}
                                        className="flex-1 h-10 border border-gray-200 rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                        <LogOut size={14} />
                                        Sign out
                                    </button>
                                    <button onClick={handleReset}
                                        className="flex-1 h-10 rounded-md text-sm font-bold transition-colors"
                                        style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
                                        Reset demo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Page export (Suspense wrapper for useSearchParams) ────────────────────────
export default function AccountPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        }>
            <AccountContent />
        </Suspense>
    );
}
