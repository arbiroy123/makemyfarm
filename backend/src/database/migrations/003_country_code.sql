-- Migration: Add country_code to users for region-based pricing
-- Run: psql $DATABASE_URL -f src/database/migrations/003_country_code.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) NOT NULL DEFAULT 'IN'
    CHECK (country_code IN ('IN', 'US'));
