import { NextRequest, NextResponse } from "next/server";
import { dbQuery, dbQueryOne } from "@/lib/db";

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ status: "error", message: "DATABASE_URL not set" });
        }

        // 1. Check connectivity
        const now = await dbQueryOne("SELECT NOW() as now");

        // 2. Check tables
        const tables = await dbQuery<{ tablename: string }>(
            "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
        );

        return NextResponse.json({
            status: "ok",
            time: now?.now,
            tables: tables.map(t => t.tablename),
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: err.message,
            stack: err.stack,
        }, { status: 500 });
    }
}
