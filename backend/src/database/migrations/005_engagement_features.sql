-- Migration 005: Engagement features — Grow Stories, Today's Tasks, Succession Plans
-- Run: psql $DATABASE_URL -f src/database/migrations/005_engagement_features.sql

-- Grow Stories — community photo feed
CREATE TABLE IF NOT EXISTS grow_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  vegetable_name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  lesson TEXT NOT NULL,
  caption TEXT,
  climate_zone VARCHAR(50),
  country_code VARCHAR(5) DEFAULT 'IN',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grow_stories_user ON grow_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_grow_stories_created ON grow_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grow_stories_country ON grow_stories(country_code);

-- Story likes (prevent double-like)
CREATE TABLE IF NOT EXISTS grow_story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES grow_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Task completions — track watering/fertilizing/diary done today
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('water', 'fertilize', 'diary', 'harvest', 'inspect')),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_completions_user ON task_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_completions_crop ON task_completions(crop_id);

-- Succession plans — staggered planting schedules for continuous harvest
CREATE TABLE IF NOT EXISTS succession_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vegetable_id UUID NOT NULL REFERENCES vegetables(id),
  interval_weeks INTEGER DEFAULT 2,
  batches INTEGER DEFAULT 3,
  first_planting_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_succession_plans_farm ON succession_plans(farm_id);
CREATE INDEX IF NOT EXISTS idx_succession_plans_user ON succession_plans(user_id);

-- Add country_code to users if not already present (safe no-op if exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT 'IN';
