-- ============================================================
-- Kingsize Personalisation Schema
-- Migration: 001_personalisation
-- Run with: psql $DATABASE_URL -f db/migrations/001_personalisation.sql
-- ============================================================

-- Anonymous sessions (also used for logged-in users via session_id)
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Consent state: 'essential' | 'analytics' | 'marketing'
    consent_state   TEXT NOT NULL DEFAULT 'essential' CHECK (consent_state IN ('essential','analytics','marketing')),
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL
);

-- Customer identity (created on login/signup; links to anonymous session)
CREATE TABLE IF NOT EXISTS customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    phone           TEXT,
    fit_type        TEXT NOT NULL DEFAULT 'big-tall' CHECK (fit_type IN ('big','tall','big-tall')),
    contact_pref    TEXT NOT NULL DEFAULT 'email' CHECK (contact_pref IN ('email','sms','both')),
    onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK once customer table exists
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Detailed fit measurements (optional)
CREATE TABLE IF NOT EXISTS fit_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    neck            TEXT,
    sleeve          TEXT,
    waist           TEXT,
    inseam          TEXT,
    shoe_size       TEXT,
    fit_pref        TEXT CHECK (fit_pref IN ('regular','relaxed')),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Style / affinity preferences (updated by swipes + browse)
CREATE TABLE IF NOT EXISTS preference_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id          UUID REFERENCES sessions(id) ON DELETE CASCADE,
    -- JSONB affinity maps: { "casual": 12, "formal": 3 }
    style_tags          JSONB NOT NULL DEFAULT '{}',
    brand_affinity      JSONB NOT NULL DEFAULT '{}',
    category_affinity   JSONB NOT NULL DEFAULT '{}',
    liked_product_ids   TEXT[] NOT NULL DEFAULT '{}',
    disliked_product_ids TEXT[] NOT NULL DEFAULT '{}',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pp_owner CHECK (
        (customer_id IS NOT NULL) OR (session_id IS NOT NULL)
    )
);

-- Anonymous and logged-in session signals (browsing behaviour)
CREATE TABLE IF NOT EXISTS session_signals (
    id              BIGSERIAL PRIMARY KEY,
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    signal_type     TEXT NOT NULL, -- 'view','search','filter','category_click','brand_click'
    entity_type     TEXT,          -- 'product','category','brand','search_term'
    entity_id       TEXT,
    entity_label    TEXT,
    fit_context     TEXT,          -- 'big','tall','big-tall' at time of signal
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_signals_session ON session_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON session_signals(signal_type);

-- Klaviyo profile link (allows sync and suppression checks)
CREATE TABLE IF NOT EXISTS klaviyo_links (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id          UUID REFERENCES sessions(id) ON DELETE CASCADE,
    klaviyo_profile_id  TEXT NOT NULL,
    consent_synced_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kl_owner CHECK (
        (customer_id IS NOT NULL) OR (session_id IS NOT NULL)
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_klaviyo_customer ON klaviyo_links(customer_id) WHERE customer_id IS NOT NULL;

-- Cached recommendation snapshots (avoids recompute on every page load)
CREATE TABLE IF NOT EXISTS recommendation_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key       TEXT NOT NULL UNIQUE, -- 'cust:{id}' or 'sess:{id}'
    payload         JSONB NOT NULL,       -- full IRecommendationResponse
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    fit_type        TEXT
);
CREATE INDEX IF NOT EXISTS idx_snapshots_key ON recommendation_snapshots(cache_key);
CREATE INDEX IF NOT EXISTS idx_snapshots_expires ON recommendation_snapshots(expires_at);
