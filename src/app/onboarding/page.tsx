"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/features/auth/AuthContext";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { StepWelcome } from "@/features/onboarding/StepWelcome";
import { StepFitType } from "@/features/onboarding/StepFitType";
import { StepSetYourFit } from "@/features/onboarding/StepSetYourFit";
import { StepFitProfile } from "@/features/onboarding/StepFitProfile";
import { StepStylePrefs } from "@/features/onboarding/StepStylePrefs";
import { StepContactPrefs } from "@/features/onboarding/StepContactPrefs";
import { StepComplete } from "@/features/onboarding/StepComplete";
import type { FitType, ContactPref, SwipeCardData } from "@/features/onboarding/useOnboarding";

// ─── Step constants ───────────────────────────────────────────────────────────
//  1 Welcome
//  2 FitType
//  3 SetYourFit
//  4 FitProfile (AI Fit Card)
//  5 StylePrefs
//  6 ContactPrefs
//  7 Complete

const TOTAL_STEPS = 7;

// Page-level animated step wrapper
function StepWrapper({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stepKey}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function OnboardingContent() {
    const router = useRouter();
    const { saveProfile, savePreferences, profile } = useAuth();
    const {
        state,
        update,
        saving,
        saveFitType,
        computeFromGarment,
        computeFromSizes,
        saveMeasurements,
        saveSwipes,
        saveContactAndFinish,
    } = useOnboarding();

    const [step, setStep] = useState(1);

    const goNext = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
    const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

    // ═══ Step 2: Fit Type ════════════════════════════════════════════════════════
    const handleFitTypeNext = async () => {
        if (!state.fitType) return;
        await saveFitType(state.fitType);
        goNext();
    };

    // ═══ Step 3: Compute measurements and advance ════════════════════════════════
    const handleComputeMeasurements = async () => {
        let profile: ReturnType<typeof computeFromGarment> = [];
        let rawMeasurements: Record<string, string> = {};

        if (state.measurementMethod === "garment" && state.garmentMeasurement.halfMeasurement) {
            const half = parseFloat(state.garmentMeasurement.halfMeasurement);
            if (!isNaN(half) && half > 0) {
                profile = computeFromGarment(state.garmentMeasurement.garmentType, state.garmentMeasurement.halfMeasurement);
                rawMeasurements = {
                    halfChest: `${half}cm`,
                    fullChest: `${half * 2}cm`,
                    garmentType: state.garmentMeasurement.garmentType ?? "shirt",
                };
            }
        } else if (state.measurementMethod === "sizes") {
            profile = computeFromSizes(state.sizeEntry);
            rawMeasurements = {
                tshirtSize: state.sizeEntry.tshirt,
                shirtSize: state.sizeEntry.shirt,
                waistSize: state.sizeEntry.waist,
            };
        }

        update({ fitProfile: profile });
        if (Object.keys(rawMeasurements).length > 0) {
            await saveMeasurements(profile, rawMeasurements);
        }
        goNext();
    };

    // ═══ Step 4: Confirm fit profile ════════════════════════════════════════════
    const handleConfirmFit = () => {
        update({ fitProfileConfirmed: true });
        goNext();
    };

    const handleUpdateRow = (key: string, value: string) => {
        update({
            fitProfile: state.fitProfile.map((r) => (r.key === key ? { ...r, value } : r)),
        });
    };

    // ═══ Step 5: Style prefs ════════════════════════════════════════════════════
    const handleCategoryToggle = (cat: string) => {
        update({
            selectedCategories: state.selectedCategories.includes(cat)
                ? state.selectedCategories.filter((c) => c !== cat)
                : [...state.selectedCategories, cat],
        });
    };

    const handleSwipeLike = (card: SwipeCardData) => {
        update({ swipeLiked: [...state.swipeLiked, card] });
    };

    const handleSwipePass = (card: SwipeCardData) => {
        update({ swipePassed: [...state.swipePassed, card] });
    };

    const handleStyleNext = async () => {
        // Persist swipe results
        await saveSwipes(state.swipeLiked, state.swipePassed);
        goNext();
    };

    // ═══ Step 6: Contact + finish ════════════════════════════════════════════════
    const handleContactFinish = async () => {
        if (!state.contactPref) return;
        await saveContactAndFinish(
            state.contactPref,
            state.mobile,
            state.marketingConsent,
            state.selectedCategories,
        );
        goNext(); // → Step 7 (Complete)
    };

    // ═══ Step 7: Redirect ═══════════════════════════════════════════════════════
    const handleFinish = () => {
        router.push("/");
    };

    return (
        <OnboardingShell currentStep={step} totalSteps={TOTAL_STEPS}>
            {step === 1 && (
                <StepWrapper stepKey={1}>
                    <StepWelcome onNext={goNext} />
                </StepWrapper>
            )}

            {step === 2 && (
                <StepWrapper stepKey={2}>
                    <StepFitType
                        value={state.fitType}
                        onSelect={(v: FitType) => update({ fitType: v })}
                        onNext={handleFitTypeNext}
                        onBack={goBack}
                        saving={saving}
                    />
                </StepWrapper>
            )}

            {step === 3 && (
                <StepWrapper stepKey={3}>
                    <StepSetYourFit
                        method={state.measurementMethod}
                        garmentData={state.garmentMeasurement}
                        sizeData={state.sizeEntry}
                        onMethodSelect={(m) => update({ measurementMethod: m })}
                        onGarmentChange={(d) => update({ garmentMeasurement: d })}
                        onSizeChange={(d) => update({ sizeEntry: d })}
                        onCompute={handleComputeMeasurements}
                        onBack={goBack}
                        saving={saving}
                    />
                </StepWrapper>
            )}

            {step === 4 && (
                <StepWrapper stepKey={4}>
                    <StepFitProfile
                        fitProfile={state.fitProfile}
                        onUpdateRow={handleUpdateRow}
                        onConfirm={handleConfirmFit}
                        onBack={goBack}
                        saving={saving}
                    />
                </StepWrapper>
            )}

            {step === 5 && (
                <StepWrapper stepKey={5}>
                    <StepStylePrefs
                        selectedCategories={state.selectedCategories}
                        swipeLiked={state.swipeLiked}
                        swipePassed={state.swipePassed}
                        onCategoryToggle={handleCategoryToggle}
                        onSwipeLike={handleSwipeLike}
                        onSwipePass={handleSwipePass}
                        onNext={handleStyleNext}
                        onBack={goBack}
                        saving={saving}
                    />
                </StepWrapper>
            )}

            {step === 6 && (
                <StepWrapper stepKey={6}>
                    <StepContactPrefs
                        value={state.contactPref}
                        mobile={state.mobile}
                        onSelect={(v: ContactPref) => update({ contactPref: v })}
                        onMobileChange={(v) => update({ mobile: v })}
                        onNext={handleContactFinish}
                        onBack={goBack}
                        saving={saving}
                    />
                </StepWrapper>
            )}

            {step === 7 && (
                <StepWrapper stepKey={7}>
                    <StepComplete onFinish={handleFinish} />
                </StepWrapper>
            )}
        </OnboardingShell>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f5f4f2] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#0a0a0a] rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Loading your profile…</p>
                    </div>
                </div>
            }
        >
            <OnboardingContent />
        </Suspense>
    );
}
