/**
 * CatalogRepository — Postgres-only.
 * Reads from the 003_mock_catalog tables.
 * Implements ICatalogProvider from @kingsize/contracts.
 *
 * When real CI credentials arrive:
 *   1. Create CounterIntelligenceCatalogProvider implementing the same ICatalogProvider interface
 *   2. Set MOCK_CI_ENABLED=false — this file is bypassed entirely
 */
import { dbQuery, dbQueryOne } from "@/lib/db";
import type {
    ICatalogProduct,
    ICatalogProvider,
    ICatalogImage,
    ICatalogVariant,
    IProductFilters,
    ISwipeCandidate,
} from "@kingsize/contracts";

// ─── Row mappers ──────────────────────────────────────────────────────────────

function mapProduct(row: any, images: ICatalogImage[], variants: ICatalogVariant[]): ICatalogProduct {
    const primary = images.find((i) => i.isPrimary) ?? images[0];
    const price = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
    const colours = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
    const sizes = [...new Set(variants.map((v) => v.sizeLabel).filter(Boolean))];

    return {
        id: row.id,
        brand: row.brand ?? "",
        title: row.title,
        slug: row.slug,
        descriptionHtml: row.description_html ?? "",
        fitType: row.fit_type ?? "big-tall",
        isLive: row.is_live ?? true,
        categoryPaths: row.category_paths ?? [],
        filters: row.filters ?? {},
        images,
        variants,
        sizeGuide: row.size_guide_rows
            ? {
                guideType: row.guide_type ?? "X",
                rows: typeof row.size_guide_rows === "string" ? JSON.parse(row.size_guide_rows) : row.size_guide_rows,
                notes: row.size_guide_notes ?? "",
            }
            : undefined,
        primaryImageUrl: primary?.url ?? "/images/placeholder-product.jpg",
        price,
        colours,
        sizes,
    };
}

// ─── Repository ───────────────────────────────────────────────────────────────

class PostgresCatalogRepository implements ICatalogProvider {
    async listProducts(filters: IProductFilters = {}): Promise<ICatalogProduct[]> {
        const conditions: string[] = ["p.is_live = TRUE"];
        const params: unknown[] = [];
        let i = 1;

        if (filters.category) {
            params.push(`%${filters.category}%`);
            conditions.push(`EXISTS (
        SELECT 1 FROM product_categories pc
        WHERE pc.product_id = p.id AND pc.category_path ILIKE $${i++}
      )`);
        }
        if (filters.brand) {
            params.push(filters.brand);
            conditions.push(`p.brand ILIKE $${i++}`);
        }
        if (filters.fit) {
            // 'big-tall' and 'all' products fit everyone; also match the user's specific fit type.
            // e.g. a user with fit_type='big' sees products tagged 'big', 'big-tall', and 'all'.
            params.push(filters.fit);
            conditions.push(`(p.fit_type = $${i++} OR p.fit_type = 'big-tall' OR p.fit_type = 'all')`);
        }
        if (filters.q) {
            params.push(`%${filters.q}%`);
            conditions.push(`(p.title ILIKE $${i++} OR p.brand ILIKE $${i - 1})`);
        }

        const limit = Math.min(filters.limit ?? 48, 100);
        const offset = filters.offset ?? 0;

        const rows = await dbQuery<any>(
            `SELECT p.*,
        ARRAY(SELECT pc.category_path FROM product_categories pc WHERE pc.product_id = p.id ORDER BY pc.position) AS category_paths,
        sg.rows AS size_guide_rows, sg.guide_type, sg.notes AS size_guide_notes
       FROM products_catalog p
       LEFT JOIN product_size_guides sg ON sg.product_id = p.id
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return Promise.all(rows.map((r) => this._hydrate(r)));
    }

    async getProductBySlug(slug: string): Promise<ICatalogProduct | null> {
        const row = await dbQueryOne<any>(
            `SELECT p.*,
        ARRAY(SELECT pc.category_path FROM product_categories pc WHERE pc.product_id = p.id ORDER BY pc.position) AS category_paths,
        sg.rows AS size_guide_rows, sg.guide_type, sg.notes AS size_guide_notes
       FROM products_catalog p
       LEFT JOIN product_size_guides sg ON sg.product_id = p.id
       WHERE p.slug = $1 LIMIT 1`,
            [slug]
        );
        if (!row) return null;
        return this._hydrate(row);
    }

    async listCategories(): Promise<{ path: string; count: number }[]> {
        return dbQuery<{ path: string; count: number }>(
            `SELECT pc.category_path AS path, COUNT(DISTINCT pc.product_id)::int AS count
       FROM product_categories pc
       INNER JOIN products_catalog p ON p.id = pc.product_id
       WHERE p.is_live = TRUE
       GROUP BY pc.category_path
       ORDER BY count DESC`,
            []
        );
    }

    async listBrands(): Promise<string[]> {
        const rows = await dbQuery<{ brand: string }>(
            `SELECT DISTINCT brand FROM products_catalog WHERE is_live = TRUE AND brand != '' ORDER BY brand`,
            []
        );
        return rows.map((r) => r.brand);
    }

    async getSwipeCandidates(opts: {
        categories: string[];
        limit: number;
        seed?: string;
    }): Promise<ISwipeCandidate[]> {
        const { categories, limit, seed } = opts;
        const catConditions = categories
            .map((c, idx) => `pc.category_path ILIKE $${idx + 1}`)
            .join(" OR ");
        const catParams = categories.map((c) => `%${c}%`);

        // Stable shuffle via MD5(seed || product_id) — no randomness per request
        const seedVal = seed ?? "default-seed";

        const rows = await dbQuery<{
            product_id: string;
            slug: string;
            brand: string;
            title: string;
            url: string;
            colour: string;
            colour_code: string;
            category_path: string;
        }>(
            `SELECT DISTINCT ON (p.id)
        p.id AS product_id, p.slug, p.brand, p.title,
        pi.url, pv.colour, pv.colour_code,
        pc.category_path
       FROM products_catalog p
       INNER JOIN product_categories pc ON pc.product_id = p.id
       INNER JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       WHERE p.is_live = TRUE
         AND (${catConditions})
       ORDER BY p.id, MD5($${catParams.length + 1} || p.id)
       LIMIT $${catParams.length + 2}`,
            [...catParams, seedVal, limit]
        );

        return rows.map((r) => ({
            productId: r.product_id,
            slug: r.slug,
            brand: r.brand,
            title: r.title,
            primaryImageUrl: r.url ?? "/images/placeholder-product.jpg",
            colour: r.colour ?? "",
            category: r.category_path ?? "",
            tags: [r.colour ?? "", r.category_path ?? ""].filter(Boolean),
        }));
    }

    // ─── Private hydration ─────────────────────────────────────────────────────

    private async _hydrate(row: any): Promise<ICatalogProduct> {
        const [imgRows, varRows] = await Promise.all([
            dbQuery<any>(
                `SELECT * FROM product_images WHERE product_id = $1 ORDER BY position ASC`,
                [row.id]
            ),
            dbQuery<any>(
                `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id ASC`,
                [row.id]
            ),
        ]);

        const images: ICatalogImage[] = imgRows.map((img) => ({
            url: img.url,
            alt: img.alt ?? row.title,
            position: img.position,
            colourCode: img.colour_code ?? undefined,
            isPrimary: img.is_primary ?? false,
        }));

        const variants: ICatalogVariant[] = varRows.map((v) => ({
            id: String(v.id),
            sku: v.sku,
            colour: v.colour ?? "",
            colourCode: v.colour_code ?? "",
            sizeLabel: v.size_label,
            sizeType: v.size_type ?? "X",
            price: parseFloat(v.price ?? "0"),
            compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : undefined,
            stockTotal: v.stock_total ?? 0,
        }));

        return mapProduct(row, images, variants);
    }
}

export const catalogRepository: ICatalogProvider = new PostgresCatalogRepository();
