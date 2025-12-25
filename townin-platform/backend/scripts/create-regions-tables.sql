-- Create Region Level enum type
DO $$ BEGIN
    CREATE TYPE region_level AS ENUM ('city', 'district', 'neighborhood');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Hub Type enum type
DO $$ BEGIN
    CREATE TYPE hub_type AS ENUM ('residence', 'workplace', 'family_home');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    level region_level DEFAULT 'neighborhood',
    code VARCHAR(20),
    parent_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    master_id UUID REFERENCES users(id) ON DELETE SET NULL,
    "totalUsers" INT DEFAULT 0,
    "totalMerchants" INT DEFAULT 0,
    "totalFlyers" INT DEFAULT 0,
    livability_index DECIMAL(5,2) DEFAULT 0,
    safety_score DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create user_regions table
CREATE TABLE IF NOT EXISTS user_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    hub_type hub_type NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, hub_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_regions_level ON regions(level);
CREATE INDEX IF NOT EXISTS idx_regions_parent_id ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_master_id ON regions(master_id);
CREATE INDEX IF NOT EXISTS idx_regions_is_active ON regions(is_active);
CREATE INDEX IF NOT EXISTS idx_regions_livability_index ON regions(livability_index DESC);
CREATE INDEX IF NOT EXISTS idx_user_regions_user_id ON user_regions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_regions_region_id ON user_regions(region_id);
CREATE INDEX IF NOT EXISTS idx_user_regions_hub_type ON user_regions(hub_type);
