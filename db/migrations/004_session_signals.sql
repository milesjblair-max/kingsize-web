-- ============================================================
-- Kingsize Session Signals Table
-- Migration: 004_session_signals
-- Adds the session_signals table to the production schema.
-- Migration 001 (old schema) had this table; migration 002 (production
-- schema) omitted it. This migration adds it safely with IF NOT EXISTS.
--
-- Run with: psql $DATABASE_URL -f db/migrations/004_session_signals.sql
--
-- ROLLBACK SQL:
-- DROP TABLE IF EXISTS session_signals;
-- DELETE FROM schema_version WHERE version = 4;
-- ============================================================

CREATE TABLE IF NOT EXISTS session_signals (
    id           BIGSERIAL PRIMARY KEY,
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    signal_type  TEXT NOT NULL, -- 'view','search','filter','category_click','brand_click'
    entity_type  TEXT,          -- 'product','category','brand','search_term'
    entity_id    TEXT,
    entity_label TEXT,
    fit_context  TEXT,          -- 'big','tall','big-tall' at time of signal
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_session ON session_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_signals_type    ON session_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_entity  ON session_signals(entity_type, entity_id);

INSERT INTO schema_version (version) VALUES (4) ON CONFLICT DO NOTHING;
