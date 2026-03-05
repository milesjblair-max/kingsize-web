-- ============================================================
-- Kingsize Mock Catalog Schema
-- Migration: 003_mock_catalog
-- Run with: psql $DATABASE_URL -f db/migrations/003_mock_catalog.sql
-- ============================================================

-- Products catalog (one row per product, brand-agnostic)
CREATE TABLE IF NOT EXISTS products_catalog (
    id               TEXT PRIMARY KEY,           -- SKU-based, e.g. "AS41141"
    brand            TEXT NOT NULL DEFAULT '',
    title            TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description_html TEXT NOT NULL DEFAULT '',
    fit_type         TEXT NOT NULL DEFAULT 'big-tall'
                         CHECK (fit_type IN ('big', 'tall', 'big-tall', 'all')),
    is_live          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_slug    ON products_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_products_live    ON products_catalog(is_live);
CREATE INDEX IF NOT EXISTS idx_products_brand   ON products_catalog(brand);

-- Product images (multiple per product, ordered by position)
CREATE TABLE IF NOT EXISTS product_images (
    id           BIGSERIAL PRIMARY KEY,
    product_id   TEXT NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
    url          TEXT NOT NULL,           -- R2 public URL or /products/... local
    alt          TEXT NOT NULL DEFAULT '',
    position     INT  NOT NULL DEFAULT 0,
    colour_code  TEXT,                    -- e.g. "OR", "BK", "NY"
    is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON product_images(product_id);

-- Product variants (size + colour combinations)
CREATE TABLE IF NOT EXISTS product_variants (
    id               BIGSERIAL PRIMARY KEY,
    product_id       TEXT NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
    sku              TEXT NOT NULL UNIQUE,    -- full SKU e.g. "AS41141-OR-2XL"
    colour           TEXT NOT NULL DEFAULT '',
    colour_code      TEXT NOT NULL DEFAULT '',
    size_label       TEXT NOT NULL,           -- "2XL", "52", "47"
    size_type        TEXT NOT NULL DEFAULT 'X'
                         CHECK (size_type IN ('X', 'CM', 'NECK', 'WAIST', 'EU', 'US')),
    price            NUMERIC(10,2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(10,2),
    stock_total      INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Product ↔ category many-to-many
CREATE TABLE IF NOT EXISTS product_categories (
    product_id    TEXT NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
    category_path TEXT NOT NULL,   -- e.g. "Menswear|Tops|Polos"
    position      INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, category_path)
);
CREATE INDEX IF NOT EXISTS idx_cat_path ON product_categories(category_path);

-- Product filters / tags (faceted navigation)
CREATE TABLE IF NOT EXISTS product_filters (
    id         BIGSERIAL PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
    filter_key TEXT NOT NULL,    -- e.g. "colour", "fit", "occasion", "fabric"
    filter_val TEXT NOT NULL     -- e.g. "Black", "Big & Tall", "Casual"
);
CREATE INDEX IF NOT EXISTS idx_filters_product ON product_filters(product_id);
CREATE INDEX IF NOT EXISTS idx_filters_key     ON product_filters(filter_key, filter_val);

-- Size guides (per product, grid stored as JSONB)
CREATE TABLE IF NOT EXISTS product_size_guides (
    product_id    TEXT PRIMARY KEY REFERENCES products_catalog(id) ON DELETE CASCADE,
    guide_type    TEXT NOT NULL DEFAULT 'X',
    rows          JSONB NOT NULL DEFAULT '[]',   -- [{size, chest, waist, ...}]
    notes         TEXT NOT NULL DEFAULT '',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bump schema version
INSERT INTO schema_version (version) VALUES (3) ON CONFLICT DO NOTHING;
