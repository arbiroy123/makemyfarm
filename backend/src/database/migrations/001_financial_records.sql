-- Migration: Add financial_records table for Farm Financial Dashboard feature
-- Run: psql $DATABASE_URL -f src/database/migrations/001_financial_records.sql

CREATE TABLE IF NOT EXISTS financial_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_id       UUID REFERENCES crops(id) ON DELETE SET NULL,
  created_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category      VARCHAR(60) NOT NULL,
  amount        NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency      VARCHAR(5) NOT NULL DEFAULT 'INR',
  description   TEXT,
  record_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_records_farm ON financial_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date  ON financial_records(record_date);
CREATE INDEX IF NOT EXISTS idx_financial_records_type  ON financial_records(type);
