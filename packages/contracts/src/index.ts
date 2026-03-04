import { z } from "zod";

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface IProduct {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    currency: string;
    imageUrl: string;
    tags: string[];
    sizes: string[];
    inStock: boolean;
}

export interface IInventoryItem {
    productId: string;
    sku: string;
    size: string;
    quantity: number;
    warehouseLocation?: string;
}

export interface ICustomerProfile {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    fitType: "big" | "tall" | "big-tall";
    dimensions?: {
        neck?: string;
        sleeve?: string;
        waist?: string;
        inseam?: string;
        shoeSize?: string;
        fitPref?: "regular" | "relaxed";
    };
    contactPref: "email" | "sms" | "both";
    onboardingComplete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IOrder {
    id: string;
    customerId: string;
    items: Array<{ productId: string; sku: string; quantity: number; unitPrice: number }>;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
}

export interface IRecommendationResult {
    styleTags: string[];
    preferredCategories: string[];
    avoidCategories: string[];
    fitNotes: string[];
    summary: string;
    analyzedAt: string;
    provider: "groq" | "huggingface" | "rules-fallback";
}

// ─── Provider Interfaces (POS Plug-and-Play Contracts) ────────────────────────

export interface IProductProvider {
    getProducts(filters?: { category?: string; brand?: string }): Promise<IProduct[]>;
    getProductById(id: string): Promise<IProduct | null>;
}

export interface IInventoryProvider {
    getInventory(productId: string): Promise<IInventoryItem[]>;
    isInStock(productId: string, size: string): Promise<boolean>;
}

export interface ICustomerProvider {
    getCustomer(id: string): Promise<ICustomerProfile | null>;
    getCustomerByEmail(email: string): Promise<ICustomerProfile | null>;
    upsertCustomer(profile: Partial<ICustomerProfile> & { email: string }): Promise<ICustomerProfile>;
    deleteCustomer(id: string): Promise<void>;
}

// ─── Zod Schemas (Request Validation) ────────────────────────────────────────

export const SwipeCardSchema = z.object({
    id: z.string(),
    label: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
});

export const OnboardingSchema = z.object({
    email: z.string().email("Valid email required"),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    mobile: z.string().max(20).optional(),
    fitType: z.enum(["big", "tall", "big-tall"]),
    dimensions: z.object({
        neck: z.string().optional(),
        sleeve: z.string().optional(),
        waist: z.string().optional(),
        inseam: z.string().optional(),
        shoeSize: z.string().optional(),
        fitPref: z.enum(["regular", "relaxed"]).optional(),
    }).optional(),
    contactPref: z.enum(["email", "sms", "both"]),
});
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

export const StylePreferencesSchema = z.object({
    liked: z.array(SwipeCardSchema),
    passed: z.array(SwipeCardSchema),
    fitType: z.enum(["big", "tall", "big-tall"]),
    dimensions: z.record(z.string()).optional(),
});
export type StylePreferencesInput = z.infer<typeof StylePreferencesSchema>;

export const SessionLoginSchema = z.object({
    email: z.string().email(),
});
export type SessionLoginInput = z.infer<typeof SessionLoginSchema>;
