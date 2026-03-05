-- ============================================================
-- Kingsize Production Schema
-- Migration: 002_production_schema
-- Run with: psql $DATABASE_URL -f db/migrations/002_production_schema.sql
-- ============================================================

-- Users: identity table (email is the canonical identity)
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles: personalisation data linked 1:1 to a user
CREATE TABLE IF NOT EXISTS profiles (
    user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    fit_type             TEXT NOT NULL DEFAULT 'big-tall'
                             CHECK (fit_type IN ('big', 'tall', 'big-tall')),
    preferred_brands     TEXT[] NOT NULL DEFAULT '{}',
    preferred_categories TEXT[] NOT NULL DEFAULT '{}',
    measurements         JSONB  NOT NULL DEFAULT '{}',
    marketing_consent    BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_done      BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Swipe events: explicit like/dislike/skip signals per product
CREATE TABLE IF NOT EXISTS swipe_events (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    action     TEXT NOT NULL CHECK (action IN ('like', 'dislike', 'skip')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_swipe_user      ON swipe_events(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_created   ON swipe_events(created_at DESC);

-- Preference vectors: computed style affinity scores (updated async)
CREATE TABLE IF NOT EXISTS preference_vectors (
    user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vector_embedding JSONB NOT NULL DEFAULT '{}',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions: anonymous + authenticated browser sessions
CREATE TABLE IF NOT EXISTS sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    consent_state TEXT NOT NULL DEFAULT 'essential'
                      CHECK (consent_state IN ('essential', 'analytics', 'marketing')),
    last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id) WHERE user_id IS NOT NULL;

-- Schema version: used by the health endpoint
CREATE TABLE IF NOT EXISTS schema_version (
    version    INT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO schema_version (version) VALUES (2) ON CONFLICT DO NOTHING;
