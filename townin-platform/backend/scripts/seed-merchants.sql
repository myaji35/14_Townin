-- Merchant 사용자 및 프로필 시드 데이터

-- 1. Merchant 역할의 사용자 생성 (비밀번호: merchant123)
-- bcrypt hash for 'merchant123': $2b$10$XqWYPBZ.vNLJHF5O/l/g/eJ2vHLXkJ7zKRz9qVP5YNQ8p0qJKqO3m
INSERT INTO users (hashed_id, email, password_hash, role, age_range, household_type, is_active, created_at, updated_at)
VALUES
  ('merchant_001', 'merchant1@example.com', '$2b$10$XqWYPBZ.vNLJHF5O/l/g/eJ2vHLXkJ7zKRz9qVP5YNQ8p0qJKqO3m', 'merchant', '30-39', 'single', true, NOW(), NOW()),
  ('merchant_002', 'merchant2@example.com', '$2b$10$XqWYPBZ.vNLJHF5O/l/g/eJ2vHLXkJ7zKRz9qVP5YNQ8p0qJKqO3m', 'merchant', '40-49', 'family', true, NOW(), NOW()),
  ('merchant_003', 'merchant3@example.com', '$2b$10$XqWYPBZ.vNLJHF5O/l/g/eJ2vHLXkJ7zKRz9qVP5YNQ8p0qJKqO3m', 'merchant', '30-39', 'couple', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Merchant 프로필 생성
-- Using subqueries to get the generated user IDs
-- Only insert if merchant profile doesn't exist for this user
INSERT INTO merchants (user_id, business_name, category, grid_cell, address, phone, signboard_status, total_flyers, total_views, total_clicks, is_verified, is_active, created_at, updated_at)
SELECT
  u.id,
  v.business_name,
  v.category,
  v.grid_cell,
  v.address,
  v.phone,
  v.signboard_status::signboard_status,
  v.total_flyers,
  v.total_views,
  v.total_clicks,
  v.is_verified,
  v.is_active,
  NOW(),
  NOW()
FROM (VALUES
  ('merchant1@example.com', '스타벅스 의정부점', 'cafe', 'uijeongbu_01', '경기도 의정부시 의정부동 123-45', '031-1234-5678', 'open', 0, 0, 0, true, true),
  ('merchant2@example.com', '맛있는 한식당', 'restaurant', 'uijeongbu_02', '경기도 의정부시 가능동 789-12', '031-9876-5432', 'open', 0, 0, 0, true, true),
  ('merchant3@example.com', 'GS25 호원점', 'convenience_store', 'uijeongbu_03', '경기도 의정부시 호원동 456-78', '031-5555-6666', 'open', 0, 0, 0, true, true)
) AS v(email, business_name, category, grid_cell, address, phone, signboard_status, total_flyers, total_views, total_clicks, is_verified, is_active)
JOIN users u ON u.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM merchants m WHERE m.user_id = u.id
);
