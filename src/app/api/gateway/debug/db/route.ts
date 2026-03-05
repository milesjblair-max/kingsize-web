import { NextResponse } from "next/server";
import { dbQueryOne } from "@/lib/db";

/**
 * GET /api/gateway/debug/db
 * Database health endpoint.
 * Returns: connectivity status, schema version, environment.
 */
export async function GET() {
    const env = process.env.NODE_ENV ?? "unknown";

    if (!process.env.DATABASE_URL) {
        return NextResponse.json({
            status: "error",
            env,
            message: "DATABASE_URL is not set. Add it in Vercel: Project → Settings → Environment Variables",
        }, { status: 503 });
    }

    try {
        const [timeRow, versionRow] = await Promise.all([
            dbQueryOne<{ now: Date }>("SELECT NOW() AS now"),
            dbQueryOne<{ version: number }>("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1"),
        ]);

        return NextResponse.json({
            status: "ok",
            env,
            schema_version: versionRow?.version ?? null,
            db_time: timeRow?.now?.toISOString() ?? null,
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            env,
            message: err.message,
        }, { status: 503 });
    }
}
