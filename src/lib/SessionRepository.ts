/**
 * SessionRepository
 * Unified management for anonymous and authenticated sessions.
 * Backed by Postgres (sessions table) or JSON file for dev.
 */
import fs from "fs";
import path from "path";
import { dbQueryOne, dbQuery } from "./db";
import type { ConsentLevel } from "./consent";

export interface ISession {
    id: string;
    customerId: string | null;
    consentState: ConsentLevel;
    lastSeenAt: string;
    createdAt: string;
}

export interface ISessionRepository {
    findById(id: string): Promise<ISession | null>;
    create(data?: Partial<ISession>): Promise<ISession>;
    linkToCustomer(sessionId: string, customerId: string): Promise<void>;
    updateConsent(sessionId: string, level: ConsentLevel): Promise<void>;
    touch(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}

// ─── JSON Implementation (Dev) ────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "{}");
}

class JsonSessionRepository implements ISessionRepository {
    private read(): Record<string, ISession> {
        ensureDir();
        try { return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8")); }
        catch { return {}; }
    }

    private write(data: Record<string, ISession>) {
        ensureDir();
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
    }

    async findById(id: string): Promise<ISession | null> {
        return this.read()[id] ?? null;
    }

    async create(data?: Partial<ISession>): Promise<ISession> {
        const sessions = this.read();
        const id = crypto.randomUUID();
        const session: ISession = {
            id,
            customerId: data?.customerId ?? null,
            consentState: data?.consentState ?? "essential",
            lastSeenAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
        sessions[id] = session;
        this.write(sessions);
        return session;
    }

    async linkToCustomer(sessionId: string, customerId: string): Promise<void> {
        const sessions = this.read();
        if (sessions[sessionId]) {
            sessions[sessionId].customerId = customerId;
            this.write(sessions);
        }
    }

    async updateConsent(sessionId: string, level: ConsentLevel): Promise<void> {
        const sessions = this.read();
        if (sessions[sessionId]) {
            sessions[sessionId].consentState = level;
            this.write(sessions);
        }
    }

    async touch(id: string): Promise<void> {
        const sessions = this.read();
        if (sessions[id]) {
            sessions[id].lastSeenAt = new Date().toISOString();
            this.write(sessions);
        }
    }

    async delete(id: string): Promise<void> {
        const sessions = this.read();
        delete sessions[id];
        this.write(sessions);
    }
}

// ─── Postgres Implementation (Prod) ───────────────────────────────────────────

class PostgresSessionRepository implements ISessionRepository {
    async findById(id: string): Promise<ISession | null> {
        const row = await dbQueryOne<{
            id: string, customer_id: string | null, consent_state: string,
            last_seen_at: Date, created_at: Date
        }>(
            "SELECT id, customer_id, consent_state, last_seen_at, created_at FROM sessions WHERE id = $1",
            [id]
        );
        if (!row) return null;
        return {
            id: row.id,
            customerId: row.customer_id,
            consentState: row.consent_state as ConsentLevel,
            lastSeenAt: row.last_seen_at.toISOString(),
            createdAt: row.created_at.toISOString()
        };
    }

    async create(data?: Partial<ISession>): Promise<ISession> {
        const row = await dbQueryOne<{ id: string, customer_id: string | null, consent_state: string, last_seen_at: Date, created_at: Date }>(
            `INSERT INTO sessions (customer_id, consent_state) 
             VALUES ($1, $2) 
             RETURNING id, customer_id, consent_state, last_seen_at, created_at`,
            [data?.customerId ?? null, data?.consentState ?? "essential"]
        );
        return {
            id: row!.id,
            customerId: row!.customer_id,
            consentState: row!.consent_state as ConsentLevel,
            lastSeenAt: row!.last_seen_at.toISOString(),
            createdAt: row!.created_at.toISOString()
        };
    }

    async linkToCustomer(sessionId: string, customerId: string): Promise<void> {
        await dbQuery("UPDATE sessions SET customer_id = $2, updated_at = NOW() WHERE id = $1", [sessionId, customerId]);
    }

    async updateConsent(sessionId: string, level: ConsentLevel): Promise<void> {
        await dbQuery("UPDATE sessions SET consent_state = $2, updated_at = NOW() WHERE id = $1", [sessionId, level]);
    }

    async touch(id: string): Promise<void> {
        await dbQuery("UPDATE sessions SET last_seen_at = NOW(), updated_at = NOW() WHERE id = $1", [id]);
    }

    async delete(id: string): Promise<void> {
        await dbQuery("DELETE FROM sessions WHERE id = $1", [id]);
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const sessionRepository: ISessionRepository = process.env.DATABASE_URL
    ? new PostgresSessionRepository()
    : new JsonSessionRepository();
