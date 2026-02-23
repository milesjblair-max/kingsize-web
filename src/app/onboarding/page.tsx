"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/features/auth/AuthContext";
import { getRandomCards } from "@/features/auth/swipeCards";
import type { SwipeCard, UserProfile, StylePreferences, FitType, ContactPref } from "@/features/auth/AuthContext";

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
    <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Step {step} of {total}
            </span>
            <span className="text-xs text-gray-400">{Math.round((step / total) * 100)}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500"
                style={{ width: `${(step / total) * 100}%` }}
            />
        </div>
    </div>
);

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputClass = "w-full h-11 px-3 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white";

const Label = ({ children, optional }: { children: React.ReactNode; optional?: boolean }) => (
    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
        {children}
        {optional && <span className="ml-1.5 font-normal text-gray-400 normal-case tracking-normal">(optional)</span>}
    </label>
);

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

interface BasicsData {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
}

const StepBasics = ({
    data,
    onChange,
    onNext,
}: {
    data: BasicsData;
    onChange: (d: BasicsData) => void;
    onNext: () => void;
}) => {
    const [errors, setErrors] = useState<Partial<BasicsData>>({});

    const validate = () => {
        const e: Partial<BasicsData> = {};
        if (!data.firstName.trim()) e.firstName = "Required";
        if (!data.lastName.trim()) e.lastName = "Required";
        if (!data.email.trim() || !data.email.includes("@")) e.email = "Valid email required";
        return e;
    };

    const handleNext = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onNext();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
            <p className="text-sm text-gray-500 mb-6">Just the basics to get started.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Label>First name</Label>
                    <input
                        className={inputClass}
                        value={data.firstName}
                        onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                        placeholder="James"
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                    <Label>Last name</Label>
                    <input
                        className={inputClass}
                        value={data.lastName}
                        onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                        placeholder="Smith"
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
            </div>
            <div className="mb-4">
                <Label>Email address</Label>
                <input
                    className={inputClass}
                    type="email"
                    value={data.email}
                    onChange={(e) => onChange({ ...data, email: e.target.value })}
                    placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="mb-6">
                <Label optional>Mobile number</Label>
                <input
                    className={inputClass}
                    type="tel"
                    value={data.mobile}
                    onChange={(e) => onChange({ ...data, mobile: e.target.value })}
                    placeholder="04XX XXX XXX"
                />
            </div>

            <button
                onClick={handleNext}
                className="w-full h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors"
            >
                Continue
            </button>
        </div>
    );
};

// ─── Step 2: Fit Type ─────────────────────────────────────────────────────────

const FIT_OPTIONS: { key: FitType; title: string; desc: string }[] = [
    { key: "big", title: "Big", desc: "Broader chest, shoulders and waist. Standard or extended length." },
    { key: "tall", title: "Tall", desc: "Extra inseam, sleeve and torso length. Regular width." },
    { key: "big-tall", title: "Big and Tall", desc: "The full cut. Broader and longer everywhere." },
];

const StepFitType = ({
    value,
    onChange,
    onNext,
    onBack,
}: {
    value: FitType | "";
    onChange: (v: FitType) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const [error, setError] = useState(false);

    const handleNext = () => {
        if (!value) { setError(true); return; }
        onNext();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">How do you typically shop?</h2>
            <p className="text-sm text-gray-500 mb-6">We will use this to filter everything to your fit.</p>

            <div className="flex flex-col gap-3 mb-6">
                {FIT_OPTIONS.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => { onChange(opt.key); setError(false); }}
                        className="text-left p-4 rounded-md border-2 transition-all"
                        style={{
                            borderColor: value === opt.key ? "#111" : "#E5E7EB",
                            background: value === opt.key ? "#111" : "#fff",
                            color: value === opt.key ? "#fff" : "#111",
                        }}
                    >
                        <p className="font-bold text-sm mb-0.5">{opt.title}</p>
                        <p className="text-xs" style={{ color: value === opt.key ? "rgba(255,255,255,0.7)" : "#6B7280" }}>
                            {opt.desc}
                        </p>
                    </button>
                ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-4">Please select a fit type</p>}

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 h-12 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={handleNext} className="flex-[2] h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">Continue</button>
            </div>
        </div>
    );
};

// ─── Step 3: Dimensions ───────────────────────────────────────────────────────

interface Dimensions {
    neck: string; sleeve: string; waist: string;
    inseam: string; shoeSize: string; fitPref: "regular" | "relaxed" | "";
}

const StepDimensions = ({
    data,
    onChange,
    onNext,
    onBack,
}: {
    data: Dimensions;
    onChange: (d: Dimensions) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const fields: { key: keyof Omit<Dimensions, "fitPref">; label: string; placeholder: string }[] = [
        { key: "neck", label: "Neck", placeholder: 'e.g. 46cm' },
        { key: "sleeve", label: "Sleeve length", placeholder: 'e.g. 88cm' },
        { key: "waist", label: "Waist", placeholder: 'e.g. 102cm' },
        { key: "inseam", label: "Inseam", placeholder: 'e.g. 86cm' },
        { key: "shoeSize", label: "Shoe size", placeholder: 'e.g. 47EU / 13US' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your measurements</h2>
            <p className="text-sm text-gray-500 mb-6">All optional. We use these for smarter size matching.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {fields.map((f) => (
                    <div key={f.key}>
                        <Label optional>{f.label}</Label>
                        <input
                            className={inputClass}
                            value={data[f.key]}
                            onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                        />
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <Label optional>Preferred fit width</Label>
                <div className="flex gap-3">
                    {(["regular", "relaxed"] as const).map((fp) => (
                        <button
                            key={fp}
                            onClick={() => onChange({ ...data, fitPref: data.fitPref === fp ? "" : fp })}
                            className="flex-1 h-10 rounded-md border text-sm font-bold transition-all capitalize"
                            style={{
                                borderColor: data.fitPref === fp ? "#111" : "#E5E7EB",
                                background: data.fitPref === fp ? "#111" : "#fff",
                                color: data.fitPref === fp ? "#fff" : "#374151",
                            }}
                        >
                            {fp}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 h-12 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={onNext} className="flex-[2] h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">Continue</button>
            </div>
        </div>
    );
};

// ─── Step 4: Contact Preference ───────────────────────────────────────────────

const StepContact = ({
    value,
    mobile,
    onChange,
    onNext,
    onBack,
}: {
    value: ContactPref | "";
    mobile: string;
    onChange: (v: ContactPref) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const [error, setError] = useState("");

    const handleNext = () => {
        if (!value) { setError("Please select a preference"); return; }
        if ((value === "sms" || value === "both") && !mobile.trim()) {
            setError("A mobile number is required for SMS updates. Go back and add it.");
            return;
        }
        onNext();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">How do you like to hear from us?</h2>
            <p className="text-sm text-gray-500 mb-6">New arrivals, exclusive offers and your order updates.</p>

            <div className="flex flex-col gap-3 mb-6">
                {([
                    { key: "email" as const, label: "Email only", desc: "Deals, new arrivals and orders by email" },
                    { key: "sms" as const, label: "SMS only", desc: "Quick texts for promos and order updates" },
                    { key: "both" as const, label: "Email and SMS", desc: "Best of both" },
                ]).map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => { onChange(opt.key); setError(""); }}
                        className="text-left p-4 rounded-md border-2 transition-all"
                        style={{
                            borderColor: value === opt.key ? "#111" : "#E5E7EB",
                            background: value === opt.key ? "#111" : "#fff",
                            color: value === opt.key ? "#fff" : "#111",
                        }}
                    >
                        <p className="font-bold text-sm mb-0.5">{opt.label}</p>
                        <p className="text-xs" style={{ color: value === opt.key ? "rgba(255,255,255,0.7)" : "#6B7280" }}>
                            {opt.desc}
                        </p>
                    </button>
                ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 h-12 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={handleNext} className="flex-[2] h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">Continue</button>
            </div>
        </div>
    );
};

// ─── Step 5: Swipe Cards ──────────────────────────────────────────────────────

const SwipeStep = ({
    cards,
    liked,
    passed,
    onLike,
    onPass,
    onNext,
    onBack,
}: {
    cards: SwipeCard[];
    liked: SwipeCard[];
    passed: SwipeCard[];
    onLike: (c: SwipeCard) => void;
    onPass: (c: SwipeCard) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const total = liked.length + passed.length;
    const current = cards[total];
    const done = total >= cards.length;

    // Drag/swipe state
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const THRESHOLD = 80;

    const handleDragStart = (clientX: number) => {
        startX.current = clientX;
        setIsDragging(true);
    };

    const handleDragMove = (clientX: number) => {
        if (!isDragging) return;
        setDragX(clientX - startX.current);
    };

    const handleDragEnd = () => {
        if (!isDragging || !current) return;
        setIsDragging(false);
        if (dragX > THRESHOLD) { onLike(current); }
        else if (dragX < -THRESHOLD) { onPass(current); }
        setDragX(0);
    };

    // Keyboard support
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!current) return;
            if (e.key === "ArrowRight") onLike(current);
            if (e.key === "ArrowLeft") onPass(current);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [current, onLike, onPass]);

    const rotate = Math.min(Math.max(dragX / 10, -15), 15);
    const likeOpacity = Math.min(dragX / 60, 1);
    const passOpacity = Math.min(-dragX / 60, 1);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">What catches your eye?</h2>
            <p className="text-sm text-gray-500 mb-4">
                Swipe right to like, left to pass. Use buttons or arrow keys.
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
                {cards.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < total ? "#111" : "#E5E7EB" }}
                    />
                ))}
            </div>

            {done ? (
                /* Recap */
                <div>
                    <p className="text-sm font-bold text-gray-900 mb-3">
                        You liked {liked.length} of {cards.length} items
                    </p>
                    {liked.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Liked</p>
                            <div className="flex flex-wrap gap-2">
                                {liked.map((c) => (
                                    <div key={c.id} className="w-14 h-14 relative rounded-md overflow-hidden border border-gray-100">
                                        <Image src={c.image} alt={c.label} fill className="object-cover object-top" sizes="56px" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {passed.length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Passed</p>
                            <div className="flex flex-wrap gap-2">
                                {passed.map((c) => (
                                    <div key={c.id} className="w-14 h-14 relative rounded-md overflow-hidden border border-gray-100 opacity-40">
                                        <Image src={c.image} alt={c.label} fill className="object-cover object-top" sizes="56px" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={onBack} className="flex-1 h-12 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Back</button>
                        <button onClick={onNext} className="flex-[2] h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors">
                            Analyse my style
                        </button>
                    </div>
                </div>
            ) : (
                /* Active swipe card */
                <div>
                    <p className="text-xs text-center text-gray-400 mb-3">
                        {total + 1} of {cards.length}
                    </p>
                    <div className="flex justify-center mb-5">
                        <div
                            ref={cardRef}
                            className="relative select-none touch-none"
                            style={{
                                width: "min(280px, 80vw)",
                                cursor: isDragging ? "grabbing" : "grab",
                                transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
                                transition: isDragging ? "none" : "transform 0.3s ease",
                            }}
                            onMouseDown={(e) => handleDragStart(e.clientX)}
                            onMouseMove={(e) => handleDragMove(e.clientX)}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                            onTouchEnd={handleDragEnd}
                        >
                            {/* Card image */}
                            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-md" style={{ aspectRatio: "3/4" }}>
                                <div className="relative w-full h-full" style={{ minHeight: 300 }}>
                                    <Image
                                        src={current.image}
                                        alt={current.label}
                                        fill
                                        className="object-cover object-top pointer-events-none"
                                        sizes="280px"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Like/Pass overlays */}
                            <div
                                className="absolute top-4 left-4 bg-green-500 text-white text-sm font-black px-3 py-1 rounded-md border-2 border-green-600 rotate-[-12deg]"
                                style={{ opacity: Math.max(0, likeOpacity) }}
                            >
                                LIKE
                            </div>
                            <div
                                className="absolute top-4 right-4 bg-gray-700 text-white text-sm font-black px-3 py-1 rounded-md border-2 border-gray-800 rotate-[12deg]"
                                style={{ opacity: Math.max(0, passOpacity) }}
                            >
                                PASS
                            </div>

                            {/* Label */}
                            <div className="mt-3 text-center">
                                <p className="font-bold text-sm text-gray-900">{current.label}</p>
                                <div className="flex justify-center gap-1.5 mt-1 flex-wrap">
                                    {current.tags.slice(0, 2).map((t) => (
                                        <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={() => onPass(current)}
                            className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl hover:border-gray-700 hover:bg-gray-50 transition-all"
                            aria-label="Pass"
                        >
                            ✕
                        </button>
                        <button
                            onClick={() => onLike(current)}
                            className="w-14 h-14 rounded-full border-2 border-green-300 flex items-center justify-center text-xl hover:border-green-500 hover:bg-green-50 transition-all"
                            aria-label="Like"
                        >
                            ♥
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">Use arrow keys: ← pass &nbsp; → like</p>
                </div>
            )}
        </div>
    );
};

// ─── Step 6: LLM Analysis ─────────────────────────────────────────────────────

const StepAnalysis = ({
    fitType,
    dimensions,
    liked,
    passed,
    onComplete,
}: {
    fitType: FitType;
    dimensions: Dimensions;
    liked: SwipeCard[];
    passed: SwipeCard[];
    onComplete: (prefs: StylePreferences) => void;
}) => {
    const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
    const [result, setResult] = useState<StylePreferences | null>(null);
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const analyse = async () => {
            try {
                const payload = {
                    fitType,
                    dimensions: Object.fromEntries(
                        Object.entries(dimensions).filter(([, v]) => v !== "")
                    ),
                    liked,
                    passed,
                };

                const res = await fetch("/api/llm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("API error");
                const data = await res.json();

                const prefs: StylePreferences = {
                    liked,
                    passed,
                    styleTags: data.styleTags ?? [],
                    preferredCategories: data.preferredCategories ?? [],
                    avoidCategories: data.avoidCategories ?? [],
                    fitNotes: data.fitNotes ?? [],
                    summary: data.summary ?? "",
                    analyzedAt: new Date().toISOString(),
                };

                setResult(prefs);
                setStatus("done");
            } catch {
                setStatus("error");
            }
        };

        analyse();
    }, [fitType, dimensions, liked, passed]);

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysing your style</h2>
            <p className="text-sm text-gray-500 mb-8">Give us a moment...</p>

            {status === "loading" && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Reviewing your picks...</p>
                </div>
            )}

            {status === "error" && (
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">Could not reach the analysis service. Using smart defaults instead.</p>
                    <button
                        onClick={() => {
                            // apply rules-based offline
                            const fallback: StylePreferences = {
                                liked, passed,
                                styleTags: ["casual", "smart casual"],
                                preferredCategories: ["tops"],
                                avoidCategories: [],
                                fitNotes: [],
                                summary: "Based on your swipes, we have curated picks across your favourite styles.",
                            };
                            onComplete(fallback);
                        }}
                        className="h-12 px-8 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors"
                    >
                        Continue anyway
                    </button>
                </div>
            )}

            {status === "done" && result && (
                <div className="text-left">
                    <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-100">
                        <p className="text-sm font-bold text-gray-900 mb-3">Your style profile</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {result.styleTags.map((t) => (
                                <span key={t} className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full font-medium capitalize">
                                    {t}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 italic">{result.summary}</p>
                    </div>
                    <button
                        onClick={() => onComplete(result)}
                        className="w-full h-12 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-black transition-colors"
                    >
                        Save profile and finish
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

function OnboardingContent() {
    const { profile, saveProfile, savePreferences } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isRedo = searchParams.get("redo") === "true";
    const returnTo = searchParams.get("returnTo") ?? "/account";

    // In redo mode, skip to step 5 and pre-populate from existing profile
    const [step, setStep] = useState(() => (isRedo ? 5 : 1));

    const [basics, setBasics] = useState<BasicsData>({
        firstName: profile?.firstName ?? "",
        lastName: profile?.lastName ?? "",
        email: profile?.email ?? "",
        mobile: profile?.mobile ?? "",
    });
    const [fitType, setFitType] = useState<FitType | "">(
        isRedo ? (profile?.fitType ?? "") : ""
    );
    const [dimensions, setDimensions] = useState<Dimensions>({
        neck: profile?.dimensions?.neck ?? "",
        sleeve: profile?.dimensions?.sleeve ?? "",
        waist: profile?.dimensions?.waist ?? "",
        inseam: profile?.dimensions?.inseam ?? "",
        shoeSize: profile?.dimensions?.shoeSize ?? "",
        fitPref: profile?.dimensions?.fitPref ?? "",
    });
    const [contactPref, setContactPref] = useState<ContactPref | "">(
        isRedo ? (profile?.contactPref ?? "") : ""
    );
    const [swipeCards] = useState(() => getRandomCards(10));
    const [liked, setLiked] = useState<SwipeCard[]>([]);
    const [passed, setPassed] = useState<SwipeCard[]>([]);

    const handleLike = (card: SwipeCard) => setLiked((p) => [...p, card]);
    const handlePass = (card: SwipeCard) => setPassed((p) => [...p, card]);

    const handleAnalysisComplete = (prefs: StylePreferences) => {
        if (isRedo && profile) {
            // Redo mode: update only preferences, keep existing profile
            savePreferences(prefs);
        } else {
            // Full onboarding: save complete profile
            const fullProfile: UserProfile = {
                firstName: basics.firstName,
                lastName: basics.lastName,
                email: basics.email,
                mobile: basics.mobile || undefined,
                fitType: fitType as FitType,
                dimensions: {
                    neck: dimensions.neck || undefined,
                    sleeve: dimensions.sleeve || undefined,
                    waist: dimensions.waist || undefined,
                    inseam: dimensions.inseam || undefined,
                    shoeSize: dimensions.shoeSize || undefined,
                    fitPref: dimensions.fitPref || undefined,
                },
                contactPref: contactPref as ContactPref,
                onboardingComplete: true,
                createdAt: profile?.createdAt ?? new Date().toISOString(),
            };
            saveProfile(fullProfile);
            savePreferences(prefs);
        }
        router.push(returnTo);
    };

    // In redo mode, show a simpler header
    const redoHeader = isRedo && (
        <div className="mb-6 pb-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Style swipes</p>
            <h2 className="text-lg font-bold text-gray-900">Redo your style picks</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your profile and measurements are unchanged.</p>
        </div>
    );

    return (
        <div className="min-h-[90vh] bg-gray-50 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {isRedo ? redoHeader : <ProgressBar step={step} total={TOTAL_STEPS} />}

                {step === 1 && (
                    <StepBasics data={basics} onChange={setBasics} onNext={() => setStep(2)} />
                )}
                {step === 2 && (
                    <StepFitType value={fitType} onChange={setFitType} onNext={() => setStep(3)} onBack={() => setStep(1)} />
                )}
                {step === 3 && (
                    <StepDimensions data={dimensions} onChange={setDimensions} onNext={() => setStep(4)} onBack={() => setStep(2)} />
                )}
                {step === 4 && (
                    <StepContact value={contactPref} mobile={basics.mobile} onChange={setContactPref} onNext={() => setStep(5)} onBack={() => setStep(3)} />
                )}
                {step === 5 && (
                    <SwipeStep
                        cards={swipeCards}
                        liked={liked}
                        passed={passed}
                        onLike={handleLike}
                        onPass={handlePass}
                        onNext={() => setStep(6)}
                        onBack={isRedo ? () => router.push(returnTo) : () => setStep(4)}
                    />
                )}
                {step === 6 && (
                    <StepAnalysis
                        fitType={(fitType || profile?.fitType || "big") as FitType}
                        dimensions={dimensions}
                        liked={liked}
                        passed={passed}
                        onComplete={handleAnalysisComplete}
                    />
                )}
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
