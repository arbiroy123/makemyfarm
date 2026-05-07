-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  bio TEXT,
  experience_level VARCHAR(20) CHECK (experience_level IN ('novice', 'beginner', 'intermediate', 'advanced', 'expert')),
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  farm_type VARCHAR(20) CHECK (farm_type IN ('backyard', 'container', 'rooftop', 'community', 'medium', 'large', 'greenhouse', 'hybrid')),
  size_sqft DECIMAL(12, 2),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  climate_zone VARCHAR(50),
  is_public BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm collaborators (multiple users can manage a farm)
CREATE TABLE farm_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'contributor', 'viewer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, user_id)
);

-- Growing seasons for a farm
CREATE TABLE growing_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vegetable database with growing information
CREATE TABLE vegetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  scientific_name VARCHAR(150),
  description TEXT,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('novice', 'intermediate', 'expert')),
  days_to_harvest INTEGER,
  spacing_cm INTEGER,
  min_temp_celsius INTEGER,
  max_temp_celsius INTEGER,
  optimal_temp_celsius INTEGER,
  water_frequency_days INTEGER,
  sunlight_hours INTEGER,
  soil_type VARCHAR(100),
  ph_min DECIMAL(3, 1),
  ph_max DECIMAL(3, 1),
  season VARCHAR(50),
  climate_zones TEXT[],
  can_greenhouse BOOLEAN DEFAULT TRUE,
  yields_per_plant DECIMAL(10, 2),
  image_url TEXT,
  planting_tips TEXT,
  care_tips TEXT,
  pest_diseases TEXT,
  companion_plants TEXT[],
  fun_fact TEXT,
  growing_story TEXT,
  simple_recipe TEXT,
  nutrition TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops/vegetables in a farm
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  season_id UUID REFERENCES growing_seasons(id) ON DELETE SET NULL,
  vegetable_id UUID NOT NULL REFERENCES vegetables(id),
  plot_number VARCHAR(50),
  quantity_planted INTEGER,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  status VARCHAR(20) CHECK (status IN ('planned', 'planted', 'growing', 'harvested', 'failed')),
  yield_quantity DECIMAL(10, 2),
  yield_unit VARCHAR(20) DEFAULT 'kg',
  growing_method VARCHAR(20) CHECK (growing_method IN ('outdoor', 'greenhouse', 'hydroponic')),
  notes TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop diary entries (chronological log with photos from planting to harvest)
CREATE TABLE crop_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  growth_stage VARCHAR(30) CHECK (growth_stage IN (
    'seeded','sprouted','seedling','growing','flowering','fruiting','harvested','issue'
  )),
  note TEXT,
  photo_url TEXT,
  height_cm DECIMAL(6, 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community gardens
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  admin_id UUID NOT NULL REFERENCES users(id),
  cover_image_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community group members
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin', 'member', 'moderator')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- Community forum posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('tips', 'question', 'success_story', 'event', 'trade')),
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements/badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name VARCHAR(100),
  badge_icon TEXT,
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offline sync queue (for tracking changes when offline)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50),
  entity_id UUID,
  operation VARCHAR(20) CHECK (operation IN ('create', 'update', 'delete')),
  payload JSONB,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);

-- Real-time activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_location ON farms USING GIST(location);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_diary_crop_id ON crop_diary_entries(crop_id);
CREATE INDEX idx_diary_entry_date ON crop_diary_entries(crop_id, entry_date DESC);
CREATE INDEX idx_vegetables_season ON vegetables USING GIN(climate_zones);
CREATE INDEX idx_community_groups_location ON community_groups USING GIST(location);
CREATE INDEX idx_community_members_group_id ON community_members(group_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
CREATE INDEX idx_activity_log_farm_id ON activity_log(farm_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for farms table
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for crops table
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for community_groups table
CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON community_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for community_posts table
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vegetable requests (users requesting new vegetables to be added)
CREATE TABLE vegetable_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vegetable_name VARCHAR(200) NOT NULL,
  description TEXT,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vegetable_requests_user_id ON vegetable_requests(user_id);
CREATE INDEX idx_vegetable_requests_status ON vegetable_requests(status);

CREATE TRIGGER update_vegetable_requests_updated_at BEFORE UPDATE ON vegetable_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Push notification tokens (one per user)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20) DEFAULT 'expo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Marketplace / surplus exchange listings
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

-- Garden layout plans
CREATE TABLE IF NOT EXISTS garden_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  name VARCHAR(100) DEFAULT 'My Garden',
  grid_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_plans_user_id ON garden_plans(user_id);
