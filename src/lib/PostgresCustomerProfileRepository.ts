/**
 * PostgresCustomerProfileRepository
 * Production implementation using the customers and fit_profiles tables.
 */
import { dbQueryOne, dbQuery } from "./db";
import type { ICustomerProfile } from "@kingsize/contracts";
import type { ICustomerProfileRepository } from "./CustomerProfileRepository";

export class PostgresCustomerProfileRepository implements ICustomerProfileRepository {
    async findByEmail(email: string): Promise<ICustomerProfile | null> {
        const row = await dbQueryOne<any>(
            `SELECT c.*, f.neck, f.sleeve, f.waist, f.inseam, f.shoe_size, f.fit_pref
             FROM customers c
             LEFT JOIN fit_profiles f ON f.customer_id = c.id
             WHERE c.email = $1 LIMIT 1`,
            [email]
        );
        if (!row) return null;
        return this.mapRowToProfile(row);
    }

    async findById(id: string): Promise<ICustomerProfile | null> {
        const row = await dbQueryOne<any>(
            `SELECT c.*, f.neck, f.sleeve, f.waist, f.inseam, f.shoe_size, f.fit_pref
             FROM customers c
             LEFT JOIN fit_profiles f ON f.customer_id = c.id
             WHERE c.id = $1 LIMIT 1`,
            [id]
        );
        if (!row) return null;
        return this.mapRowToProfile(row);
    }

    async upsert(data: Partial<ICustomerProfile> & { email: string }): Promise<ICustomerProfile> {
        // 1. Upsert customer
        const custRow = await dbQueryOne<any>(
            `INSERT INTO customers (email, first_name, last_name, mobile, fit_type, contact_pref, onboarding_done)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO UPDATE SET
                first_name = COALESCE(EXCLUDED.first_name, customers.first_name),
                last_name = COALESCE(EXCLUDED.last_name, customers.last_name),
                mobile = COALESCE(EXCLUDED.mobile, customers.mobile),
                fit_type = COALESCE(EXCLUDED.fit_type, customers.fit_type),
                contact_pref = COALESCE(EXCLUDED.contact_pref, customers.contact_pref),
                onboarding_done = COALESCE(EXCLUDED.onboarding_done, customers.onboarding_done),
                updated_at = NOW()
             RETURNING *`,
            [
                data.email,
                data.firstName ?? null,
                data.lastName ?? null,
                data.mobile ?? null,
                data.fitType ?? 'big-tall',
                data.contactPref ?? 'email',
                data.onboardingComplete ?? false
            ]
        );

        // 2. Upsert fit profile if dimensions are provided
        if (data.dimensions) {
            await dbQuery(
                `INSERT INTO fit_profiles (customer_id, neck, sleeve, waist, inseam, shoe_size, fit_pref)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (customer_id) DO UPDATE SET
                    neck = EXCLUDED.neck, sleeve = EXCLUDED.sleeve, waist = EXCLUDED.waist,
                    inseam = EXCLUDED.inseam, shoe_size = EXCLUDED.shoe_size, fit_pref = EXCLUDED.fit_pref,
                    updated_at = NOW()`,
                [
                    custRow.id,
                    data.dimensions.neck ?? null,
                    data.dimensions.sleeve ?? null,
                    data.dimensions.waist ?? null,
                    data.dimensions.inseam ?? null,
                    data.dimensions.shoeSize ?? null,
                    data.dimensions.fitPref ?? null
                ]
            );
        }

        return this.findById(custRow.id) as Promise<ICustomerProfile>;
    }

    async delete(id: string): Promise<void> {
        await dbQuery("DELETE FROM customers WHERE id = $1", [id]);
    }

    private mapRowToProfile(row: any): ICustomerProfile {
        return {
            id: row.id,
            email: row.email,
            firstName: row.first_name ?? undefined,
            lastName: row.last_name ?? undefined,
            mobile: row.mobile ?? undefined,
            fitType: row.fit_type as any,
            contactPref: row.contact_pref as any,
            onboardingComplete: row.onboarding_done,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
            dimensions: row.neck || row.sleeve || row.waist || row.inseam || row.shoe_size || row.fit_pref ? {
                neck: row.neck ?? undefined,
                sleeve: row.sleeve ?? undefined,
                waist: row.waist ?? undefined,
                inseam: row.inseam ?? undefined,
                shoeSize: row.shoe_size ?? undefined,
                fitPref: row.fit_pref ?? undefined,
            } : undefined
        };
    }
}
