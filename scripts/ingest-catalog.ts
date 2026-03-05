#!/usr/bin/env ts-node
/**
 * ingest-catalog.ts
 *
 * One-step ingestion pipeline for the Kingsize mock catalog.
 * Scans the product image folders, upserts the catalog into Postgres,
 * and optionally uploads images to Cloudflare R2.
 *
 * Usage:
 *   npx ts-node scripts/ingest-catalog.ts [--dry-run] [--r2]
 *
 * Env vars:
 *   DATABASE_URL or DATABASE_URL_UNPOOLED  — Neon Postgres
 *   MOCK_CI_ENABLED=true                   — enables mock catalog queries
 *   KEEP_IMPORTS=false                     — delete source images after R2 upload (default: true locally)
 *
 *   R2 upload (optional, requires --r2 flag):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Pool } from "pg";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const USE_R2 = process.argv.includes("--r2");
const KEEP_IMPORTS = process.env.KEEP_IMPORTS !== "false"; // default: keep locally

const ROOT_DIR = path.resolve(__dirname, "..");
const IMAGE_BASE = path.join(ROOT_DIR, "FOR MILES-20260305T061547Z-3-001", "FOR MILES");
const PUBLIC_PRODUCTS_DIR = path.join(ROOT_DIR, "public", "products");

// Additional zip folder sources
const EXTRA_SOURCES = [
    { dir: path.join(ROOT_DIR, "ZIp Polo's 2025"), category: "POLO_S" },
    { dir: path.join(ROOT_DIR, "Zip Short's 2025"), category: "SHORTS" },
    { dir: path.join(ROOT_DIR, "Zip T-shirts 2025"), category: "T-SHIRTS" },
];

// Category → catalog path mapping
const CATEGORY_MAP: Record<string, string> = {
    "POLO_S": "Menswear|Tops|Polos",
    "T-SHIRTS": "Menswear|Tops|T-Shirts",
    "SHORTS": "Menswear|Bottoms|Shorts",
    "ACTIVEWEAR": "Menswear|Activewear",
    "BUSINESS SHIRTS": "Menswear|Tops|Business Shirts",
    "FOOTWEAR": "Menswear|Footwear",
    "JACKET, FLEECY & SWEAT TOPS": "Menswear|Outerwear|Jackets & Fleece",
    "JACKET, FLEECY & SWEAT TOPS (1)": "Menswear|Outerwear|Jackets & Fleece",
    "SPORT JACKETS & SUIT COATS": "Menswear|Formal|Sport Jackets",
    "SPORT JACKETS & SUIT COATS (1)": "Menswear|Formal|Sport Jackets",
    "SWIMWEAR": "Menswear|Swimwear",
    "TALL ITEMS (MIX)": "Menswear|Tall|Mix",
    "TROUSERS, JEANS & TRACKPANTS": "Menswear|Bottoms|Trousers & Jeans",
    "TROUSERS, JEANS & TRACKPANTS (1)": "Menswear|Bottoms|Trousers & Jeans",
    "ACCESSORIES & BELTS": "Menswear|Accessories",
    "ACCESSORIES & BELTS (1)": "Menswear|Accessories",
};

// Category → fit type
const FIT_TYPE_MAP: Record<string, "big" | "tall" | "big-tall" | "all"> = {
    "TALL ITEMS (MIX)": "tall",
};

// Colour code → human name
const COLOUR_NAMES: Record<string, string> = {
    BK: "Black", NY: "Navy", WH: "White", RD: "Red", OR: "Orange",
    GR: "Green", BL: "Blue", GY: "Grey", KH: "Khaki", MA: "Maroon",
    OL: "Olive", ST: "Stone", FN: "Fawn", RE: "Red", NV: "Navy",
    TL: "Teal", PP: "Purple", PK: "Pink", YL: "Yellow", BC: "Burgundy",
    CL: "Coral", NB: "Nimbus", CK: "Charcoal", BE: "Beige", BR: "Brown",
};

function toColourName(code: string): string {
    return COLOUR_NAMES[code.toUpperCase()] ?? code;
}

// ─── IMAGE MANIFEST ───────────────────────────────────────────────────────────

interface ImageManifestEntry {
    sku: string;
    colourCode: string;
    colourName: string;
    category: string;
    categoryPath: string;
    localPath: string;
    filename: string;
    publicPath: string;  // /products/{slug}.jpg
    r2Key?: string;
    url?: string;        // set after upload or local copy
}

function fileHash(filePath: string): string {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(buf).digest("hex").substring(0, 8);
}

function slugify(s: string): string {
    return s.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function parseFilename(filename: string, category: string): { sku: string; colourCode: string } | null {
    // Pattern: {SKU}_{COLOUR}_FRONT.jpg  or some variant
    const name = path.basename(filename, path.extname(filename));
    const parts = name.split("_");
    if (parts.length < 2) return null;

    // Last part may be FRONT, BACK, SIDE etc. - strip positional suffixes
    const positional = new Set(["FRONT", "BACK", "SIDE", "FLAT", "MODEL", "DETAIL", "25"]);
    const filtered = parts.filter((p) => !positional.has(p.toUpperCase()));
    if (filtered.length < 2) return null;

    const colourCode = filtered[filtered.length - 1];
    const sku = filtered.slice(0, -1).join("_");
    return { sku: sku.toUpperCase(), colourCode: colourCode.toUpperCase() };
}

function buildManifest(): ImageManifestEntry[] {
    const manifest: ImageManifestEntry[] = [];

    // Main image directory
    if (fs.existsSync(IMAGE_BASE)) {
        const categoryDirs = fs.readdirSync(IMAGE_BASE, { withFileTypes: true })
            .filter((d) => d.isDirectory());

        for (const catDir of categoryDirs) {
            const category = catDir.name;
            const categoryPath = CATEGORY_MAP[category] ?? `Menswear|${category}`;
            const catFull = path.join(IMAGE_BASE, category);

            const files = fs.readdirSync(catFull).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
            for (const file of files) {
                const parsed = parseFilename(file, category);
                if (!parsed) {
                    console.warn(`  [SKIP] Cannot parse filename: ${file}`);
                    continue;
                }
                const { sku, colourCode } = parsed;
                const localPath = path.join(catFull, file);
                const productSlug = slugify(`${sku}-${colourCode}`);
                const publicPath = `/products/${slugify(category)}/${sku}_${colourCode}.jpg`;

                manifest.push({
                    sku,
                    colourCode,
                    colourName: toColourName(colourCode),
                    category,
                    categoryPath,
                    localPath,
                    filename: file,
                    publicPath,
                    url: publicPath, // default: local /public path
                });
            }
        }
    }

    // Extra zip sources
    for (const extra of EXTRA_SOURCES) {
        if (!fs.existsSync(extra.dir)) continue;
        const category = extra.category;
        const categoryPath = CATEGORY_MAP[category] ?? `Menswear|${category}`;
        const files = fs.readdirSync(extra.dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
        for (const file of files) {
            const parsed = parseFilename(file, category);
            if (!parsed) continue;
            const { sku, colourCode } = parsed;
            const localPath = path.join(extra.dir, file);
            const publicPath = `/products/${slugify(category)}/${sku}_${colourCode}.jpg`;
            manifest.push({
                sku, colourCode, colourName: toColourName(colourCode),
                category, categoryPath, localPath, filename: file, publicPath, url: publicPath,
            });
        }
    }

    return manifest;
}

// ─── COPY TO /public ──────────────────────────────────────────────────────────

function copyImagesToPublic(manifest: ImageManifestEntry[]): void {
    console.log("\n📦 Copying images to /public/products/ ...");
    let copied = 0, skipped = 0;

    for (const entry of manifest) {
        const destDir = path.dirname(path.join(ROOT_DIR, "public", entry.publicPath));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        const destPath = path.join(ROOT_DIR, "public", entry.publicPath);
        if (fs.existsSync(destPath)) { skipped++; continue; }

        try {
            fs.copyFileSync(entry.localPath, destPath);
            copied++;
        } catch (e: any) {
            console.warn(`  [WARN] Copy failed for ${entry.filename}: ${e.message}`);
        }
    }

    console.log(`  ✓ Copied: ${copied}, Skipped (already exist): ${skipped}`);
}

// ─── POSTGRES ─────────────────────────────────────────────────────────────────

function titleFromSku(sku: string, category: string, colour: string): string {
    const catLabel = category.replace(/_/g, " ").replace(/\(.*\)/, "").trim();
    const catSingular = catLabel.replace(/S$/, "").replace(/POLO/, "Polo").replace(/SHIRT/, "Shirt");
    return `${catSingular} — ${colour} (${sku})`;
}

function categoryToFitType(category: string): "big" | "tall" | "big-tall" | "all" {
    return FIT_TYPE_MAP[category] ?? "big-tall";
}

async function ingestToPostgres(
    manifest: ImageManifestEntry[],
    pool: Pool
): Promise<void> {
    console.log("\n🗄️  Ingesting catalog into Postgres ...");

    // Group by SKU → product
    const productMap = new Map<string, ImageManifestEntry[]>();
    for (const entry of manifest) {
        const existing = productMap.get(entry.sku) ?? [];
        existing.push(entry);
        productMap.set(entry.sku, existing);
    }

    let productCount = 0, imageCount = 0, variantCount = 0;

    for (const [sku, entries] of productMap) {
        const primary = entries[0];
        const category = primary.category;
        const fitType = categoryToFitType(category);
        const mainColour = primary.colourName;
        const productId = sku;
        const slug = slugify(`${sku}-${primary.colourCode}`);
        const title = titleFromSku(sku, category, mainColour);

        if (DRY_RUN) {
            console.log(`  [DRY-RUN] Would upsert: ${productId} "${title}" [${fitType}]`);
            continue;
        }

        // Upsert product
        await pool.query(
            `INSERT INTO products_catalog (id, brand, title, slug, description_html, fit_type, is_live)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, fit_type = EXCLUDED.fit_type, updated_at = NOW()`,
            [productId, "Kingsize", title, slug, "", fitType]
        );
        productCount++;

        // Upsert category
        await pool.query(
            `INSERT INTO product_categories (product_id, category_path, position)
       VALUES ($1, $2, 0) ON CONFLICT DO NOTHING`,
            [productId, primary.categoryPath]
        );

        // Upsert filters
        const filters = [
            { key: "fit", val: fitType === "tall" ? "Tall" : "Big & Tall" },
            { key: "category", val: category.replace(/_/g, " ").trim() },
        ];
        for (const { key, val } of filters) {
            await pool.query(
                `INSERT INTO product_filters (product_id, filter_key, filter_val)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM product_filters WHERE product_id=$1 AND filter_key=$2 AND filter_val=$3)`,
                [productId, key, val]
            );
        }

        // Upsert images
        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            const url = e.url ?? e.publicPath;
            const isPrimary = i === 0;
            await pool.query(
                `INSERT INTO product_images (product_id, url, alt, position, colour_code, is_primary)
         SELECT $1, $2, $3, $4, $5, $6
         WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=$1 AND url=$2)`,
                [productId, url, title, i, e.colourCode, isPrimary]
            );
            imageCount++;
        }

        // Upsert a basic variant (Big & Tall sizes — XL through 6XL range)
        const standardSizes = fitType === "tall"
            ? ["LT", "XLT", "2XLT", "3XLT", "4XLT"]
            : ["2XL", "3XL", "4XL", "5XL", "6XL"];
        for (const size of standardSizes) {
            const variantSku = `${productId}-${primary.colourCode}-${size}`;
            await pool.query(
                `INSERT INTO product_variants (product_id, sku, colour, colour_code, size_label, size_type, price, stock_total)
         VALUES ($1, $2, $3, $4, $5, 'X', $6, 10)
         ON CONFLICT (sku) DO NOTHING`,
                [productId, variantSku, mainColour, primary.colourCode, size, 59.99]
            );
            variantCount++;
        }
    }

    console.log(`  ✓ Products: ${productCount}, Images: ${imageCount}, Variants: ${variantCount}`);
}

// ─── OPTIONAL R2 UPLOAD ───────────────────────────────────────────────────────

async function uploadToR2(manifest: ImageManifestEntry[]): Promise<ImageManifestEntry[]> {
    const requiredVars = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        console.error(`\n❌ R2 upload failed — missing env vars: ${missing.join(", ")}`);
        console.error("   Set these vars and re-run with --r2 flag, or run without --r2 to use /public serving.");
        process.exit(1);
    }

    // Dynamically import to avoid requiring @aws-sdk/client-s3 when R2 is not used
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
    });

    const bucket = process.env.R2_BUCKET!;
    const publicBase = process.env.R2_PUBLIC_BASE_URL ?? `https://pub-${process.env.R2_BUCKET}.r2.dev`;

    console.log("\n☁️  Uploading to Cloudflare R2 ...");
    let uploaded = 0, failed = 0;

    for (const entry of manifest) {
        const hash = fileHash(entry.localPath);
        const ext = path.extname(entry.filename).toLowerCase();
        const key = `kingsize/${slugify(entry.category)}/${entry.sku}/${entry.colourCode}/${hash}${ext}`;
        const publicUrl = `${publicBase}/${key}`;

        if (DRY_RUN) {
            entry.r2Key = key;
            entry.url = publicUrl;
            console.log(`  [DRY-RUN] Would upload: ${key}`);
            continue;
        }

        try {
            const body = fs.readFileSync(entry.localPath);
            await client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: "image/jpeg",
                CacheControl: "public, max-age=31536000, immutable",
            }));
            entry.r2Key = key;
            entry.url = publicUrl;
            uploaded++;
        } catch (e: any) {
            console.warn(`  [WARN] Upload failed for ${entry.filename}: ${e.message}`);
            failed++;
        }
    }

    console.log(`  ✓ Uploaded: ${uploaded}, Failed: ${failed}`);
    return manifest;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
    console.log("🏷️  Kingsize Mock Catalog Ingestion");
    console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
    console.log(`   R2 upload: ${USE_R2 ? "YES" : "NO (using /public)"}\n`);

    // Step 1: Build manifest from local images
    console.log("📸 Scanning image folders ...");
    const manifest = buildManifest();
    console.log(`  Found ${manifest.length} images across ${new Set(manifest.map((e) => e.sku)).size} products`);

    if (manifest.length === 0) {
        console.error("❌ No images found. Check that image folders exist at expected paths.");
        process.exit(1);
    }

    // Step 2: Copy to /public (always done — works without R2)
    if (!DRY_RUN) {
        copyImagesToPublic(manifest);
    }

    // Step 3: Optional R2 upload
    let finalManifest = manifest;
    if (USE_R2) {
        finalManifest = await uploadToR2(manifest);
        // Update product_images URLs after R2 upload (call ingest again below)
    }

    // Step 4: Ingest to Postgres
    const connStr = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
    if (!connStr) {
        if (DRY_RUN) {
            console.log("\n[DRY-RUN] Skipping Postgres (no DATABASE_URL set)");
        } else {
            console.error("❌ DATABASE_URL not set");
            process.exit(1);
        }
    } else {
        const pool = new Pool({
            connectionString: connStr,
            ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
            max: 3,
        });
        await ingestToPostgres(finalManifest, pool);
        await pool.end();
    }

    // Step 5: Cleanup if KEEP_IMPORTS=false
    if (!KEEP_IMPORTS && USE_R2 && !DRY_RUN) {
        console.log("\n🧹 Cleaning up local import files (KEEP_IMPORTS=false) ...");
        // Note: Only deletes extracted temp files, not the original ZIPs
        // Add explicit cleanup logic here if needed
        console.log("  (Manual step: remove FOR MILES-... folder and Zip* folders from repo)");
    }

    console.log("\n✅ Ingestion complete!");
    console.log("   Next: run the DB migration 003_mock_catalog.sql in Neon if not done yet.");
    if (!USE_R2) {
        console.log("   Images served from /public/products/ (Next.js static). Add R2 later with --r2 flag.");
    }
}

main().catch((err) => {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
});
