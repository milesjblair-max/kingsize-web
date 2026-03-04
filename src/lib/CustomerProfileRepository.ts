/**
 * CustomerProfileRepository
 * Server-side profile storage. Currently backed by a local JSON file for dev.
 * Implement the ICustomerProfileRepository interface with a Postgres adapter for production.
 *
 * Data is stored in .data/profiles.json (gitignored).
 */
import fs from "fs";
import path from "path";
import type { ICustomerProfile } from "../../packages/contracts/src";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICustomerProfileRepository {
    findByEmail(email: string): Promise<ICustomerProfile | null>;
    findById(id: string): Promise<ICustomerProfile | null>;
    upsert(data: Partial<ICustomerProfile> & { email: string }): Promise<ICustomerProfile>;
    delete(id: string): Promise<void>;
}

// ─── JSON File Implementation (local dev only) ────────────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, "{}");
}

function readProfiles(): Record<string, ICustomerProfile> {
    ensureDataDir();
    try {
        return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));
    } catch {
        return {};
    }
}

function writeProfiles(profiles: Record<string, ICustomerProfile>) {
    ensureDataDir();
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

export class JsonFileCustomerProfileRepository implements ICustomerProfileRepository {
    async findByEmail(email: string): Promise<ICustomerProfile | null> {
        const profiles = readProfiles();
        return Object.values(profiles).find((p) => p.email === email) ?? null;
    }

    async findById(id: string): Promise<ICustomerProfile | null> {
        const profiles = readProfiles();
        return profiles[id] ?? null;
    }

    async upsert(data: Partial<ICustomerProfile> & { email: string }): Promise<ICustomerProfile> {
        const profiles = readProfiles();
        const existing = Object.values(profiles).find((p) => p.email === data.email);
        const now = new Date().toISOString();

        const profile: ICustomerProfile = {
            id: existing?.id ?? crypto.randomUUID(),
            email: data.email,
            firstName: data.firstName ?? existing?.firstName,
            lastName: data.lastName ?? existing?.lastName,
            mobile: data.mobile ?? existing?.mobile,
            fitType: data.fitType ?? existing?.fitType ?? "big-tall",
            dimensions: data.dimensions ?? existing?.dimensions,
            contactPref: data.contactPref ?? existing?.contactPref ?? "email",
            onboardingComplete: data.onboardingComplete ?? existing?.onboardingComplete ?? false,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };

        profiles[profile.id] = profile;
        writeProfiles(profiles);
        return profile;
    }

    async delete(id: string): Promise<void> {
        const profiles = readProfiles();
        delete profiles[id];
        writeProfiles(profiles);
    }
}

import { PostgresCustomerProfileRepository } from "./PostgresCustomerProfileRepository";

// ─── Singleton for use in API routes ─────────────────────────────────────────

export const customerProfileRepository: ICustomerProfileRepository = process.env.DATABASE_URL
    ? new PostgresCustomerProfileRepository()
    : new JsonFileCustomerProfileRepository();
