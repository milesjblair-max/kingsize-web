/**
 * Database connection pool — Postgres only.
 *
 * IMPORTANT: This module deliberately has NO filesystem fallback.
 * If DATABASE_URL is not set in production, the module throws immediately
 * so failures are surfaced at startup, not buried in a silent no-op.
 *
 * For local development without a real Postgres instance, set up a free
 * Supabase or Neon project and point DATABASE_URL at it.
 *
 * Neon note: When connected via Vercel's Neon integration, prefer
 * DATABASE_URL_UNPOOLED (direct connection) for the pg Pool to avoid
 * pgbouncer session-mode incompatibilities.
 */

export interface IDb {
    query<T = Record<string, unknown>>(
        sql: string,
        params?: unknown[]
    ): Promise<{ rows: T[]; rowCount: number }>;
}

// ─── Connection pool singleton ────────────────────────────────────────────────

let _pool: IDb | null = null;

async function getPool(): Promise<IDb> {
    if (_pool) return _pool;

    // Prefer the direct (unpooled) connection string when available.
    // Neon's pgbouncer URL (DATABASE_URL) uses session pooling which can
    // cause issues with some pg Pool commands.
    const connectionString =
        process.env.DATABASE_URL_UNPOOLED ??
        process.env.POSTGRES_URL_NON_POOLING ??
        process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "[db] DATABASE_URL is not set. " +
            "Please add it to your Vercel project environment variables " +
            "(Project → Settings → Environment Variables → DATABASE_URL)."
        );
    }

    const { Pool } = await import("pg");
    const pool = new Pool({
        connectionString,
        // Vercel serverless: keep pool small to avoid exhausting connections
        max: 5,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
        ssl: { rejectUnauthorized: false },
    });

    // Verify connectivity on first use
    await pool.query("SELECT 1");
    console.log("[db] Postgres connected");

    _pool = {
        query: async <T>(sql: string, params?: unknown[]) => {
            const result = await pool.query(sql, params);
            return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
        },
    };
    return _pool;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export async function getDb(): Promise<IDb> {
    return getPool();
}

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
