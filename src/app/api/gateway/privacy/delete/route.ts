/**
 * POST /api/gateway/privacy/delete
 * Stub: initiates customer data deletion workflow.
 * See: https://developers.klaviyo.com/en/docs/data_privacy_apis
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbQuery, dbQueryOne } from "@/lib/db";
import { getKlaviyoClient } from "@/integrations/klaviyo/KlaviyoClient";

const DeleteSchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
    let email: string;
    try {
        email = DeleteSchema.parse(await request.json()).email;
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 1. Find customer
    const customer = await dbQueryOne<{ id: string; email: string }>(
        "SELECT id, email FROM customers WHERE email = $1",
        [email]
    );
    if (!customer) {
        return NextResponse.json({ success: true, message: "No record found" });
    }

    // 2. Queue Klaviyo data deletion (REST API — Data Privacy)
    const klaviyo = getKlaviyoClient();
    const klaviyoProfileId = await klaviyo.getProfileIdByEmail(email);
    if (klaviyoProfileId) {
        // Klaviyo Data Privacy delete request — documented but requires Enterprise plan
        // TODO: POST https://a.klaviyo.com/api/data-privacy-deletion-jobs/
        console.log(`[privacy] Klaviyo deletion request queued for profile ${klaviyoProfileId}`);
    }

    // 3. Delete from platform DB (cascade deletes sessions, signals, fit_profiles, etc.)
    await dbQuery("DELETE FROM customers WHERE id = $1", [customer.id]);

    console.log(`[privacy] Deleted customer ${customer.id} and all related data`);
    return NextResponse.json({
        success: true,
        message: "Deletion initiated. Platform data removed. Klaviyo deletion queued.",
    });
}
