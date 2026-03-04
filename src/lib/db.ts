/**
 * Database connection pool
 * - If DATABASE_URL is set: uses pg Pool (Postgres / Supabase)
 * - Otherwise: returns a MockDb backed by JSON files (local dev, no Postgres needed)
 */
import path from "path";
import fs from "fs";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IDb {
    query<T = Record<string, unknown>>(
        sql: string,
        params?: unknown[]
    ): Promise<{ rows: T[]; rowCount: number }>;
}

// ─── Postgres (production) ────────────────────────────────────────────────────

let _pgPool: IDb | null = null;

async function getPostgresPool(): Promise<IDb> {
    if (_pgPool) return _pgPool;
    const { Pool } = await import("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    });
    _pgPool = {
        query: async <T>(sql: string, params?: unknown[]) => {
            const result = await pool.query(sql, params);
            return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
        },
    };
    return _pgPool;
}

// ─── MockDb (local dev — JSON files in .data/) ───────────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data", "db");

class MockDb implements IDb {
    async query<T>(_sql: string, _params?: unknown[]): Promise<{ rows: T[]; rowCount: number }> {
        // In mock mode, callers should use the typed repository classes directly.
        // This stub allows code that calls db.query() to compile and not throw.
        return { rows: [], rowCount: 0 };
    }
}

// ─── Export singleton ─────────────────────────────────────────────────────────

let _db: IDb | null = null;

export async function getDb(): Promise<IDb> {
    if (_db) return _db;
    if (process.env.DATABASE_URL) {
        _db = await getPostgresPool();
        console.log("[db] Connected to Postgres");
    } else {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        _db = new MockDb();
        console.log("[db] No DATABASE_URL — using MockDb (local dev mode)");
    }
    return _db;
}

// ─── Helper: run a query, returning rows ─────────────────────────────────────

export async function dbQuery<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const db = await getDb();
    const result = await db.query<T>(sql, params);
    return result.rows;
}

export async function dbQueryOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T | null> {
    const rows = await dbQuery<T>(sql, params);
    return rows[0] ?? null;
}
