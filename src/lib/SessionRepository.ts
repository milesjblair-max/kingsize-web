/**
 * SessionRepository — Postgres-only.
 * Manages anonymous and authenticated browser sessions.
 * Sessions table: id, user_id (nullable), consent_state, timestamps.
 */
import { dbQueryOne, dbQuery } from "./db";
import type { ConsentLevel } from "./consent";

export interface ISession {
    id: string;
    userId: string | null;
    consentState: ConsentLevel;
    lastSeenAt: string;
    createdAt: string;
}

export interface ISessionRepository {
    findById(id: string): Promise<ISession | null>;
    create(data?: Partial<ISession>): Promise<ISession>;
    linkToUser(sessionId: string, userId: string): Promise<void>;
    updateConsent(sessionId: string, level: ConsentLevel): Promise<void>;
    touch(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}

class PostgresSessionRepository implements ISessionRepository {
    async findById(id: string): Promise<ISession | null> {
        const row = await dbQueryOne<{
            id: string;
            user_id: string | null;
            consent_state: string;
            last_seen_at: Date;
            created_at: Date;
        }>(
            `SELECT id, user_id, consent_state, last_seen_at, created_at
             FROM sessions WHERE id = $1`,
            [id]
        );
        if (!row) return null;
        return {
            id: row.id,
            userId: row.user_id,
            consentState: row.consent_state as ConsentLevel,
            lastSeenAt: row.last_seen_at.toISOString(),
            createdAt: row.created_at.toISOString(),
        };
    }

    async create(data?: Partial<ISession>): Promise<ISession> {
        const row = await dbQueryOne<{
            id: string;
            user_id: string | null;
            consent_state: string;
            last_seen_at: Date;
            created_at: Date;
        }>(
            `INSERT INTO sessions (user_id, consent_state)
             VALUES ($1, $2)
             RETURNING id, user_id, consent_state, last_seen_at, created_at`,
            [data?.userId ?? null, data?.consentState ?? "essential"]
        );
        return {
            id: row!.id,
            userId: row!.user_id,
            consentState: row!.consent_state as ConsentLevel,
            lastSeenAt: row!.last_seen_at.toISOString(),
            createdAt: row!.created_at.toISOString(),
        };
    }

    async linkToUser(sessionId: string, userId: string): Promise<void> {
        await dbQuery(
            `UPDATE sessions SET user_id = $2, updated_at = NOW() WHERE id = $1`,
            [sessionId, userId]
        );
    }

    async updateConsent(sessionId: string, level: ConsentLevel): Promise<void> {
        await dbQuery(
            `UPDATE sessions SET consent_state = $2, updated_at = NOW() WHERE id = $1`,
            [sessionId, level]
        );
    }

    async touch(id: string): Promise<void> {
        await dbQuery(
            `UPDATE sessions SET last_seen_at = NOW(), updated_at = NOW() WHERE id = $1`,
            [id]
        );
    }

    async delete(id: string): Promise<void> {
        await dbQuery("DELETE FROM sessions WHERE id = $1", [id]);
    }
}

export const sessionRepository: ISessionRepository = new PostgresSessionRepository();
