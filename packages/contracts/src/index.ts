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

// ─── Extended Catalog Types (CI-ready, Mock adapter first) ──────────────────

export interface ICatalogImage {
    url: string;
    alt: string;
    position: number;
    colourCode?: string;
    isPrimary: boolean;
}

export interface ICatalogVariant {
    id: string;
    sku: string;
    colour: string;
    colourCode: string;
    sizeLabel: string;
    sizeType: 'X' | 'CM' | 'NECK' | 'WAIST' | 'EU' | 'US';
    price: number;
    compareAtPrice?: number;
    stockTotal: number;
}

export interface ICatalogSizeGuideRow {
    size: string;
    chest?: string;
    waist?: string;
    hips?: string;
    inseam?: string;
    neck?: string;
    sleeve?: string;
}

export interface ICatalogSizeGuide {
    guideType: string;
    rows: ICatalogSizeGuideRow[];
    notes: string;
}

export interface ICatalogProduct {
    id: string;
    brand: string;
    title: string;
    slug: string;
    descriptionHtml: string;
    fitType: 'big' | 'tall' | 'big-tall' | 'all';
    isLive: boolean;
    categoryPaths: string[];
    filters: Record<string, string[]>;
    images: ICatalogImage[];
    variants: ICatalogVariant[];
    sizeGuide?: ICatalogSizeGuide;
    // Convenience fields
    primaryImageUrl: string;
    price: number;
    colours: string[];
    sizes: string[];
}

export interface ISwipeCandidate {
    productId: string;
    slug: string;
    brand: string;
    title: string;
    primaryImageUrl: string;
    colour: string;
    category: string;
    tags: string[];
}

export interface IProductFilters {
    category?: string;
    brand?: string;
    fit?: string;
    q?: string;
    limit?: number;
    offset?: number;
}

// ─── Provider Interfaces (POS Plug-and-Play Contracts) ────────────────────────

export interface IProductProvider {
    getProducts(filters?: { category?: string; brand?: string }): Promise<IProduct[]>;
    getProductById(id: string): Promise<IProduct | null>;
}

export interface ICatalogProvider {
    listProducts(filters?: IProductFilters): Promise<ICatalogProduct[]>;
    getProductBySlug(slug: string): Promise<ICatalogProduct | null>;
    listCategories(): Promise<{ path: string; count: number }[]>;
    listBrands(): Promise<string[]>;
    getSwipeCandidates(opts: { categories: string[]; limit: number; seed?: string }): Promise<ISwipeCandidate[]>;
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
