-- Migration: Add marketplace_listings table and garden_plans table
-- Run: psql $DATABASE_URL -f src/database/migrations/004_marketplace.sql

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vegetable_name VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2),
  price_per_kg DECIMAL(10,2) DEFAULT 0,
  listing_type VARCHAR(20) DEFAULT 'free' CHECK (listing_type IN ('sale', 'free', 'trade')),
  description TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  location GEOGRAPHY(POINT, 4326),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketplace_location ON marketplace_listings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_marketplace_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_active ON marketplace_listings(is_active);

CREATE TABLE IF NOT EXISTS garden_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'My Garden',
  plot_size VARCHAR(20) DEFAULT 'medium',
  grid_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_plans_user ON garden_plans(user_id);
