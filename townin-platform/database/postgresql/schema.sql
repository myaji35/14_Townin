-- Townin Platform Database Schema
-- PostgreSQL 15 + PostGIS
-- Target Region: 의정부시 (Uijeongbu City), 경기도

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'user',              -- 일반 사용자
    'security_guard',    -- 지역관리자 (보안관)
    'municipality',      -- 자치체관리
    'super_admin'        -- 슈퍼관리자
);

CREATE TYPE hub_type AS ENUM ('home', 'work', 'family_home');
CREATE TYPE signboard_status AS ENUM ('open', 'closed', 'away');
CREATE TYPE ai_processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE safety_data_type AS ENUM ('cctv', 'street_light', 'parking', 'flood_zone', 'emergency_bell');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table (Privacy-First)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hashed_id VARCHAR(64) UNIQUE NOT NULL,  -- Hashed identifier (not real name)
    email VARCHAR(255) UNIQUE,               -- Optional, for notifications only
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    age_range VARCHAR(10),                   -- e.g., "30-39"
    household_type VARCHAR(20),              -- single, couple, family_young, family_senior
    phone VARCHAR(20),                       -- Optional, masked
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- User Locations (Three-Hub Model)
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hub_type hub_type NOT NULL,
    grid_cell VARCHAR(50) NOT NULL,          -- e.g., "uijeongbu_03" (500m x 500m grid)
    district VARCHAR(50),                    -- e.g., "의정부동"
    province VARCHAR(50) DEFAULT '경기도',
    city VARCHAR(50) DEFAULT '의정부시',
    property_value_tier INTEGER CHECK (property_value_tier BETWEEN 1 AND 5),
    centroid_location GEOGRAPHY(POINT),      -- PostGIS point (grid center, not exact address)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, hub_type)                -- Max 1 of each hub type per user
);

CREATE INDEX idx_user_locations_grid ON user_locations(grid_cell);
CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_centroid ON user_locations USING GIST(centroid_location);

-- Refresh Tokens (for JWT)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================================================
-- LOCATION & REGION MANAGEMENT
-- ============================================================================

-- Grid Cells (500m x 500m for privacy)
CREATE TABLE grid_cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cell_code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., "uijeongbu_01"
    province VARCHAR(50) DEFAULT '경기도',
    city VARCHAR(50) DEFAULT '의정부시',
    district VARCHAR(50),                    -- e.g., "의정부동", "가능동"
    centroid GEOGRAPHY(POINT) NOT NULL,      -- Grid center point
    boundary GEOGRAPHY(POLYGON),             -- Grid boundary
    property_value_tier INTEGER,
    population_density INTEGER,              -- People per km²
    metadata JSONB,                          -- Additional attributes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grid_cells_code ON grid_cells(cell_code);
CREATE INDEX idx_grid_cells_city ON grid_cells(city);
CREATE INDEX idx_grid_cells_centroid ON grid_cells USING GIST(centroid);

-- Municipalities (자치체)
CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,       -- e.g., "의정부시"
    province VARCHAR(50) DEFAULT '경기도',
    city_code VARCHAR(10) UNIQUE,            -- e.g., "41150"
    mayor_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    boundary GEOGRAPHY(POLYGON),             -- City boundary
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Security Guards (지역관리자)
CREATE TABLE security_guards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    assigned_grid_cell VARCHAR(50) REFERENCES grid_cells(cell_code),
    assigned_district VARCHAR(50),
    commission_rate DECIMAL(5, 2) DEFAULT 5.00,  -- ₩5 per ad view
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    total_ad_views INTEGER DEFAULT 0,
    badge_name VARCHAR(100),                 -- e.g., "의정부동 보안관"
    is_active BOOLEAN DEFAULT TRUE,
    appointed_at TIMESTAMP DEFAULT NOW(),
    appointed_by UUID REFERENCES users(id)   -- Who appointed (municipality or super_admin)
);

CREATE INDEX idx_security_guards_grid ON security_guards(assigned_grid_cell);
CREATE INDEX idx_security_guards_user ON security_guards(user_id);

-- ============================================================================
-- SAFETY DATA (PUBLIC DATA)
-- ============================================================================

CREATE TABLE safety_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type safety_data_type NOT NULL,
    grid_cell VARCHAR(50) REFERENCES grid_cells(cell_code),
    location GEOGRAPHY(POINT) NOT NULL,
    name VARCHAR(255),                       -- e.g., "의정부역 앞 CCTV"
    address TEXT,
    metadata JSONB,                          -- Type-specific data
    source VARCHAR(100),                     -- e.g., "경기도 공공데이터포털"
    data_provider VARCHAR(100),              -- e.g., "의정부시청"
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_safety_data_type ON safety_data(data_type);
CREATE INDEX idx_safety_data_grid ON safety_data(grid_cell);
CREATE INDEX idx_safety_data_location ON safety_data USING GIST(location);

-- Example metadata for different types:
-- CCTV: {"camera_angle": 360, "resolution": "HD", "night_vision": true}
-- Street Light: {"brightness_level": "high", "light_type": "LED", "pole_height": 5}
-- Parking: {"capacity": 50, "available_spots": 12, "enforcement_camera": true}

-- ============================================================================
-- MERCHANTS & COMMERCE
-- ============================================================================

CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(20),
    category VARCHAR(50),                    -- grocery, restaurant, cosmetics, electronics
    grid_cell VARCHAR(50) REFERENCES grid_cells(cell_code),
    location GEOGRAPHY(POINT),
    address TEXT,
    phone VARCHAR(20),
    signboard_status signboard_status DEFAULT 'closed',
    last_status_update TIMESTAMP,
    total_flyers INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchants_grid ON merchants(grid_cell);
CREATE INDEX idx_merchants_category ON merchants(category);
CREATE INDEX idx_merchants_user ON merchants(user_id);

-- Digital Flyers
CREATE TABLE flyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    ai_processing_status ai_processing_status DEFAULT 'pending',
    ai_extracted_data JSONB,                 -- Structured product data from AI
    ai_processing_started_at TIMESTAMP,
    ai_processing_completed_at TIMESTAMP,
    ai_processing_error TEXT,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,      -- Actual purchases
    revenue_generated DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_flyers_merchant ON flyers(merchant_id);
CREATE INDEX idx_flyers_status ON flyers(ai_processing_status);
CREATE INDEX idx_flyers_active ON flyers(is_active) WHERE is_active = TRUE;

-- Flyer Products (Extracted by AI)
CREATE TABLE flyer_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flyer_id UUID REFERENCES flyers(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    unit VARCHAR(20),                        -- 원, 개, kg, etc.
    original_price DECIMAL(10, 2),
    promotion VARCHAR(100),                  -- "1+1", "50% off", etc.
    description TEXT,
    category VARCHAR(50),
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flyer_products_flyer ON flyer_products(flyer_id);

-- Flyer Views (Revenue Attribution)
CREATE TABLE flyer_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flyer_id UUID REFERENCES flyers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    security_guard_id UUID REFERENCES security_guards(id) ON DELETE SET NULL,
    grid_cell VARCHAR(50),
    view_duration_seconds INTEGER,           -- How long user viewed
    device_type VARCHAR(20),                 -- ios, android, web
    user_revenue DECIMAL(10, 2) DEFAULT 25.00,      -- ₩25
    guard_revenue DECIMAL(10, 2) DEFAULT 5.00,      -- ₩5
    platform_revenue DECIMAL(10, 2) DEFAULT 20.00,  -- ₩20
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flyer_views_flyer ON flyer_views(flyer_id);
CREATE INDEX idx_flyer_views_user ON flyer_views(user_id);
CREATE INDEX idx_flyer_views_guard ON flyer_views(security_guard_id);

-- ============================================================================
-- IOT & FAMILY CARE
-- ============================================================================

CREATE TABLE iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,        -- motion_sensor, door_sensor
    device_id VARCHAR(100) UNIQUE NOT NULL,  -- Hardware device ID
    room_location VARCHAR(50),               -- living_room, bedroom, bathroom
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    last_ping TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_iot_devices_user ON iot_devices(user_id);

-- IoT Events (Stored in InfluxDB for production, PostgreSQL for MVP)
CREATE TABLE iot_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES iot_devices(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,         -- motion_detected, motion_stopped, door_opened, door_closed
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_iot_events_device ON iot_events(device_id);
CREATE INDEX idx_iot_events_timestamp ON iot_events(timestamp DESC);

-- Anomaly Detections
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL,       -- long_inactivity, midnight_wandering, irregular_sleep
    severity VARCHAR(20),                    -- low, medium, high
    detected_at TIMESTAMP NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    description TEXT,
    ai_generated_message TEXT,               -- Korean empathetic message
    was_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_anomalies_user ON anomalies(user_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);

-- ============================================================================
-- ANALYTICS & REPORTING
-- ============================================================================

-- Municipality Dashboard Stats (Cache for performance)
CREATE TABLE municipality_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    total_merchants INTEGER DEFAULT 0,
    total_flyers INTEGER DEFAULT 0,
    total_flyer_views INTEGER DEFAULT 0,
    total_safety_data_points INTEGER DEFAULT 0,
    livability_index_score DECIMAL(5, 2),    -- Townin's "살기 좋은 동네 지수"
    calculated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(municipality_id, date)
);

-- Security Guard Performance
CREATE TABLE guard_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    security_guard_id UUID REFERENCES security_guards(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    flyers_promoted INTEGER DEFAULT 0,
    ad_views_generated INTEGER DEFAULT 0,
    earnings DECIMAL(10, 2) DEFAULT 0.00,
    new_merchants_recruited INTEGER DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(security_guard_id, date)
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,            -- e.g., "flyer_created", "user_login", "municipality_updated"
    resource_type VARCHAR(50),               -- e.g., "flyer", "user", "merchant"
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- SEED DATA - 가상 계정 (Virtual Accounts)
-- ============================================================================

-- Insert Default Municipality (의정부시)
INSERT INTO municipalities (name, province, city_code, mayor_name, contact_email, contact_phone) VALUES
('의정부시', '경기도', '41150', '김동근', 'admin@uijeongbu.go.kr', '031-828-2114');

-- Insert Sample Grid Cells for 의정부시
INSERT INTO grid_cells (cell_code, province, city, district, centroid, property_value_tier, population_density) VALUES
('uijeongbu_01', '경기도', '의정부시', '의정부동', ST_SetSRID(ST_MakePoint(127.0475, 37.7382), 4326), 3, 15000),
('uijeongbu_02', '경기도', '의정부시', '가능동', ST_SetSRID(ST_MakePoint(127.0624, 37.7419), 4326), 4, 18000),
('uijeongbu_03', '경기도', '의정부시', '호원동', ST_SetSRID(ST_MakePoint(127.0583, 37.7298), 4326), 3, 16000),
('uijeongbu_04', '경기도', '의정부시', '신곡동', ST_SetSRID(ST_MakePoint(127.0345, 37.7515), 4326), 2, 12000),
('uijeongbu_05', '경기도', '의정부시', '송산동', ST_SetSRID(ST_MakePoint(127.0738, 37.7448), 4326), 4, 17000);

-- ============================================================================
-- VIRTUAL ACCOUNTS (가상 계정)
-- Password for all: "townin2025!" (hashed with bcrypt)
-- ============================================================================

-- 1. 슈퍼관리자 (Super Admin)
INSERT INTO users (hashed_id, email, password_hash, role, age_range, household_type) VALUES
('super_admin_001', 'admin@townin.kr', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'super_admin', '35-44', 'couple');

-- 2. 자치체관리 (Municipality Admin) - 의정부시청
INSERT INTO users (hashed_id, email, password_hash, role, age_range, household_type) VALUES
('muni_uijeongbu_001', 'municipality@uijeongbu.go.kr', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'municipality', '40-49', 'family_young');

-- 3. 지역관리자 (Security Guards) - 보안관 (3명, 각 지역별)
INSERT INTO users (hashed_id, email, password_hash, role, age_range, household_type) VALUES
('guard_uijeongbu_01', 'guard1@townin.kr', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'security_guard', '30-39', 'couple'),
('guard_uijeongbu_02', 'guard2@townin.kr', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'security_guard', '35-44', 'family_young'),
('guard_uijeongbu_03', 'guard3@townin.kr', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'security_guard', '25-34', 'single');

-- Link Security Guards to Grid Cells
WITH guard_users AS (
    SELECT id, hashed_id FROM users WHERE role = 'security_guard'
)
INSERT INTO security_guards (user_id, assigned_grid_cell, assigned_district, badge_name, appointed_by) VALUES
((SELECT id FROM guard_users WHERE hashed_id = 'guard_uijeongbu_01'), 'uijeongbu_01', '의정부동', '의정부동 보안관', (SELECT id FROM users WHERE role = 'super_admin')),
((SELECT id FROM guard_users WHERE hashed_id = 'guard_uijeongbu_02'), 'uijeongbu_02', '가능동', '가능동 보안관', (SELECT id FROM users WHERE role = 'super_admin')),
((SELECT id FROM guard_users WHERE hashed_id = 'guard_uijeongbu_03'), 'uijeongbu_03', '호원동', '호원동 보안관', (SELECT id FROM users WHERE role = 'super_admin'));

-- 4. 일반 사용자 (Regular Users) - 5명
INSERT INTO users (hashed_id, email, password_hash, role, age_range, household_type) VALUES
('user_001', 'user1@example.com', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'user', '30-39', 'family_young'),
('user_002', 'user2@example.com', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'user', '35-44', 'couple'),
('user_003', 'user3@example.com', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'user', '25-34', 'single'),
('user_004', 'user4@example.com', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'user', '45-54', 'family_senior'),
('user_005', 'user5@example.com', '$2b$10$qKF4YxRk.Qm7vMKJXhEIXOxGJg8rVY0SYJBLi3N8rZQ7WxEz4P1k6', 'user', '55-64', 'couple');

-- Add User Locations (Example: user_001 lives in uijeongbu_01)
WITH regular_users AS (
    SELECT id, hashed_id FROM users WHERE role = 'user'
)
INSERT INTO user_locations (user_id, hub_type, grid_cell, district, province, city, property_value_tier, centroid_location) VALUES
((SELECT id FROM regular_users WHERE hashed_id = 'user_001'), 'home', 'uijeongbu_01', '의정부동', '경기도', '의정부시', 3, ST_SetSRID(ST_MakePoint(127.0475, 37.7382), 4326)),
((SELECT id FROM regular_users WHERE hashed_id = 'user_002'), 'home', 'uijeongbu_02', '가능동', '경기도', '의정부시', 4, ST_SetSRID(ST_MakePoint(127.0624, 37.7419), 4326)),
((SELECT id FROM regular_users WHERE hashed_id = 'user_003'), 'home', 'uijeongbu_03', '호원동', '경기도', '의정부시', 3, ST_SetSRID(ST_MakePoint(127.0583, 37.7298), 4326)),
((SELECT id FROM regular_users WHERE hashed_id = 'user_004'), 'home', 'uijeongbu_04', '신곡동', '경기도', '의정부시', 2, ST_SetSRID(ST_MakePoint(127.0345, 37.7515), 4326)),
((SELECT id FROM regular_users WHERE hashed_id = 'user_005'), 'home', 'uijeongbu_05', '송산동', '경기도', '의정부시', 4, ST_SetSRID(ST_MakePoint(127.0738, 37.7448), 4326));

-- ============================================================================
-- SAMPLE DATA - Safety Data for 의정부시
-- ============================================================================

INSERT INTO safety_data (data_type, grid_cell, location, name, address, metadata, source, data_provider) VALUES
-- CCTV
('cctv', 'uijeongbu_01', ST_SetSRID(ST_MakePoint(127.0475, 37.7385), 4326), '의정부역 앞 CCTV', '경기 의정부시 의정부동 123', '{"camera_angle": 360, "resolution": "HD", "night_vision": true}'::jsonb, '경기도 공공데이터포털', '의정부시청'),
('cctv', 'uijeongbu_02', ST_SetSRID(ST_MakePoint(127.0620, 37.7422), 4326), '가능동 주민센터 CCTV', '경기 의정부시 가능동 456', '{"camera_angle": 270, "resolution": "HD", "night_vision": true}'::jsonb, '경기도 공공데이터포털', '의정부시청'),

-- Street Lights
('street_light', 'uijeongbu_01', ST_SetSRID(ST_MakePoint(127.0478, 37.7380), 4326), '의정부동 가로등 1', '경기 의정부시 의정부동 125', '{"brightness_level": "high", "light_type": "LED", "pole_height": 5}'::jsonb, '경기도 공공데이터포털', '의정부시청'),
('street_light', 'uijeongbu_03', ST_SetSRID(ST_MakePoint(127.0585, 37.7300), 4326), '호원동 가로등 12', '경기 의정부시 호원동 789', '{"brightness_level": "medium", "light_type": "LED", "pole_height": 4}'::jsonb, '경기도 공공데이터포털', '의정부시청'),

-- Parking
('parking', 'uijeongbu_01', ST_SetSRID(ST_MakePoint(127.0472, 37.7388), 4326), '의정부역 공영주차장', '경기 의정부시 의정부동 130', '{"capacity": 200, "available_spots": 45, "enforcement_camera": true, "hourly_rate": 1000}'::jsonb, '경기도 공공데이터포털', '의정부시청');

-- ============================================================================
-- SAMPLE DATA - Merchants for 의정부시
-- ============================================================================

INSERT INTO merchants (business_name, category, grid_cell, location, address, phone, signboard_status) VALUES
('의정부 슈퍼마켓', 'grocery', 'uijeongbu_01', ST_SetSRID(ST_MakePoint(127.0477, 37.7383), 4326), '경기 의정부시 의정부동 140', '031-821-1234', 'open'),
('가능동 치킨', 'restaurant', 'uijeongbu_02', ST_SetSRID(ST_MakePoint(127.0622, 37.7420), 4326), '경기 의정부시 가능동 460', '031-822-5678', 'open'),
('호원 화장품', 'cosmetics', 'uijeongbu_03', ST_SetSRID(ST_MakePoint(127.0580, 37.7295), 4326), '경기 의정부시 호원동 790', '031-823-9012', 'closed');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at BEFORE UPDATE ON user_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flyers_updated_at BEFORE UPDATE ON flyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active Users by Grid Cell (for analytics)
CREATE OR REPLACE VIEW v_users_by_grid AS
SELECT
    ul.grid_cell,
    ul.district,
    COUNT(DISTINCT u.id) as user_count,
    AVG(ul.property_value_tier) as avg_property_tier
FROM users u
JOIN user_locations ul ON u.id = ul.user_id
WHERE u.is_active = TRUE
GROUP BY ul.grid_cell, ul.district;

-- Merchant Performance
CREATE OR REPLACE VIEW v_merchant_performance AS
SELECT
    m.id,
    m.business_name,
    m.grid_cell,
    m.category,
    COUNT(f.id) as total_flyers,
    COALESCE(SUM(f.view_count), 0) as total_views,
    COALESCE(SUM(f.click_count), 0) as total_clicks
FROM merchants m
LEFT JOIN flyers f ON m.id = f.merchant_id AND f.is_active = TRUE
GROUP BY m.id, m.business_name, m.grid_cell, m.category;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant permissions (adjust for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO townin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO townin;
