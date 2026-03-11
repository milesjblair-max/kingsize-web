/**
 * UserRepository — Postgres-only.
 * Manages users and their personalisation profiles.
 * Replaces CustomerProfileRepository + PostgresCustomerProfileRepository.
 *
 * Tables:
 *   users   — identity (id, email, created_at)
 *   profiles — personalisation data (fit_type, brands, categories, measurements, etc.)
 */
import { dbQueryOne, dbQuery } from "./db";

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface IUser {
    id: string;
    email: string;
    createdAt: string;
}

export interface IProfile {
    userId: string;
    fitType: "big" | "tall" | "big-tall";
    preferredBrands: string[];
    preferredCategories: string[];
    measurements: Record<string, string | number>;
    marketingConsent: boolean;
    onboardingDone: boolean;
    updatedAt: string;
}

export interface IUserWithProfile extends IUser {
    profile: IProfile | null;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IUserRepository {
    findByEmail(email: string): Promise<IUserWithProfile | null>;
    findById(id: string): Promise<IUserWithProfile | null>;
    findOrCreate(email: string): Promise<IUserWithProfile>;
    upsertProfile(userId: string, data: Partial<IProfile>): Promise<IProfile>;
    delete(userId: string): Promise<void>;
}

// ─── DB row type ──────────────────────────────────────────────────────────────

interface UserProfileRow {
    id: string;
    email: string;
    created_at: Date;
    user_id?: string;
    fit_type?: string;
    preferred_brands?: string[];
    preferred_categories?: string[];
    measurements?: string | Record<string, string | number>;
    marketing_consent?: boolean;
    onboarding_done?: boolean;
    updated_at?: Date;
    profile_updated_at?: Date;
}

// ─── Postgres implementation ──────────────────────────────────────────────────

class PostgresUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<IUserWithProfile | null> {
        const row = await dbQueryOne<UserProfileRow>(
            `SELECT u.id, u.email, u.created_at,
                    p.fit_type, p.preferred_brands, p.preferred_categories,
                    p.measurements, p.marketing_consent, p.onboarding_done, p.updated_at AS profile_updated_at
             FROM users u
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE u.email = $1 LIMIT 1`,
            [email]
        );
        if (!row) return null;
        return this.mapRow(row);
    }

    async findById(id: string): Promise<IUserWithProfile | null> {
        const row = await dbQueryOne<UserProfileRow>(
            `SELECT u.id, u.email, u.created_at,
                    p.fit_type, p.preferred_brands, p.preferred_categories,
                    p.measurements, p.marketing_consent, p.onboarding_done, p.updated_at AS profile_updated_at
             FROM users u
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE u.id = $1 LIMIT 1`,
            [id]
        );
        if (!row) return null;
        return this.mapRow(row);
    }

    async findOrCreate(email: string): Promise<IUserWithProfile> {
        // Upsert user — idempotent on email
        const row = await dbQueryOne<{ id: string; email: string; created_at: Date }>(
            `INSERT INTO users (email)
             VALUES ($1)
             ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
             RETURNING id, email, created_at`,
            [email]
        );
        return (await this.findById(row!.id))!;
    }

    async upsertProfile(userId: string, data: Partial<IProfile>): Promise<IProfile> {
        const row = await dbQueryOne<UserProfileRow>(
            `INSERT INTO profiles (
                user_id, fit_type, preferred_brands, preferred_categories,
                measurements, marketing_consent, onboarding_done, updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
                fit_type             = COALESCE($2, profiles.fit_type),
                preferred_brands     = COALESCE($3, profiles.preferred_brands),
                preferred_categories = COALESCE($4, profiles.preferred_categories),
                measurements         = COALESCE($5, profiles.measurements),
                marketing_consent    = COALESCE($6, profiles.marketing_consent),
                onboarding_done      = COALESCE($7, profiles.onboarding_done),
                updated_at           = NOW()
             RETURNING *`,
            [
                userId,
                data.fitType ?? "big-tall",
                data.preferredBrands ?? [],
                data.preferredCategories ?? [],
                JSON.stringify(data.measurements ?? {}),
                data.marketingConsent ?? false,
                data.onboardingDone ?? false,
            ]
        );
        return this.mapProfile(row!);
    }

    async delete(userId: string): Promise<void> {
        // CASCADE deletes profiles, sessions linked to user, swipe_events, preference_vectors
        await dbQuery("DELETE FROM users WHERE id = $1", [userId]);
    }

    private mapRow(row: UserProfileRow): IUserWithProfile {
        return {
            id: row.id,
            email: row.email,
            createdAt: row.created_at.toISOString(),
            profile: row.fit_type !== undefined && row.fit_type !== null
                ? this.mapProfile({ ...row, user_id: row.id, updated_at: row.profile_updated_at })
                : null,
        };
    }

    private mapProfile(row: UserProfileRow): IProfile {
        return {
            userId: row.user_id,
            fitType: row.fit_type,
            preferredBrands: row.preferred_brands ?? [],
            preferredCategories: row.preferred_categories ?? [],
            measurements: typeof row.measurements === "string"
                ? JSON.parse(row.measurements)
                : (row.measurements ?? {}),
            marketingConsent: row.marketing_consent ?? false,
            onboardingDone: row.onboarding_done ?? false,
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
        };
    }
}

export const userRepository: IUserRepository = new PostgresUserRepository();

// ─── Legacy alias — keeps existing imports working during migration ────────────
/** @deprecated Use userRepository instead */
export const customerProfileRepository = userRepository;
