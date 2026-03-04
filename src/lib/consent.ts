/**
 * Consent State Machine
 * States: essential → analytics → marketing
 * Persisted in the sessions table. Propagated to Klaviyo async on upgrade.
 *
 * Rules:
 * - Klaviyo events are BLOCKED unless consent >= analytics
 * - Klaviyo marketing (email/SMS) is BLOCKED unless consent >= marketing
 * - Downgrading consent fires a Klaviyo unsubscribe async
 */

export type ConsentLevel = "essential" | "analytics" | "marketing";

const LEVELS: ConsentLevel[] = ["essential", "analytics", "marketing"];

export function consentAtLeast(current: ConsentLevel, required: ConsentLevel): boolean {
    return LEVELS.indexOf(current) >= LEVELS.indexOf(required);
}

export function isKlaviyoEventAllowed(consent: ConsentLevel): boolean {
    return consentAtLeast(consent, "analytics");
}

export function isKlaviyoMarketingAllowed(consent: ConsentLevel): boolean {
    return consentAtLeast(consent, "marketing");
}

export const ConsentSchema = {
    isValid: (val: string): val is ConsentLevel => LEVELS.includes(val as ConsentLevel),
    default: (): ConsentLevel => "essential",
    upgrade: (current: ConsentLevel, to: ConsentLevel): ConsentLevel => {
        return LEVELS.indexOf(to) > LEVELS.indexOf(current) ? to : current;
    },
    downgrade: (current: ConsentLevel, to: ConsentLevel): ConsentLevel => {
        return LEVELS.indexOf(to) < LEVELS.indexOf(current) ? to : current;
    },
};

/** Consent context attached to each gateway request */
export interface ConsentContext {
    sessionId: string;
    level: ConsentLevel;
}
