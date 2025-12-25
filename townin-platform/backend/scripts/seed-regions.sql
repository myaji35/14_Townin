-- Region 샘플 데이터 (서울시 강남구, 서초구)
-- 3단계 계층: 시(city) -> 구(district) -> 동(neighborhood)

-- 1. 서울특별시 (city level)
INSERT INTO regions (id, name, level, code, parent_id, master_id, "totalUsers", "totalMerchants", "totalFlyers", livability_index, safety_score, is_active, latitude, longitude, metadata, "createdAt", "updatedAt")
VALUES
  ('11000000-0000-0000-0000-000000000000', '서울특별시', 'city', '11000', NULL, NULL, 0, 0, 0, 85.5, 88.2, true, 37.5665, 126.9780, '{"population": 9700000, "area_km2": 605.21}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. 강남구 (district level)
INSERT INTO regions (id, name, level, code, parent_id, master_id, "totalUsers", "totalMerchants", "totalFlyers", livability_index, safety_score, is_active, latitude, longitude, metadata, "createdAt", "updatedAt")
VALUES
  ('11680000-0000-0000-0000-000000000000', '강남구', 'district', '11680', '11000000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 92.3, 91.5, true, 37.5172, 127.0473, '{"population": 561052, "area_km2": 39.5}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. 강남구 내 동(neighborhood level)
INSERT INTO regions (id, name, level, code, parent_id, master_id, "totalUsers", "totalMerchants", "totalFlyers", livability_index, safety_score, is_active, latitude, longitude, metadata, "createdAt", "updatedAt")
VALUES
  -- 삼성동
  ('11680101-0000-0000-0000-000000000000', '삼성동', 'neighborhood', '1168010100', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 94.2, 93.1, true, 37.5140, 127.0633, '{"population": 22500, "area_km2": 2.1}'::jsonb, NOW(), NOW()),
  -- 역삼동
  ('11680102-0000-0000-0000-000000000000', '역삼동', 'neighborhood', '1168010200', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 91.8, 90.5, true, 37.5004, 127.0374, '{"population": 31200, "area_km2": 2.8}'::jsonb, NOW(), NOW()),
  -- 대치동
  ('11680103-0000-0000-0000-000000000000', '대치동', 'neighborhood', '1168010300', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 95.1, 94.3, true, 37.4953, 127.0620, '{"population": 54800, "area_km2": 5.6}'::jsonb, NOW(), NOW()),
  -- 도곡동
  ('11680104-0000-0000-0000-000000000000', '도곡동', 'neighborhood', '1168010400', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 89.5, 88.7, true, 37.4875, 127.0540, '{"population": 28900, "area_km2": 3.2}'::jsonb, NOW(), NOW()),
  -- 청담동
  ('11680105-0000-0000-0000-000000000000', '청담동', 'neighborhood', '1168010500', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 93.7, 92.8, true, 37.5239, 127.0473, '{"population": 18700, "area_km2": 1.9}'::jsonb, NOW(), NOW()),
  -- 압구정동
  ('11680106-0000-0000-0000-000000000000', '압구정동', 'neighborhood', '1168010600', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 92.5, 91.2, true, 37.5274, 127.0280, '{"population": 35600, "area_km2": 3.8}'::jsonb, NOW(), NOW()),
  -- 신사동
  ('11680107-0000-0000-0000-000000000000', '신사동', 'neighborhood', '1168010700', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 90.3, 89.6, true, 37.5175, 127.0205, '{"population": 24300, "area_km2": 2.6}'::jsonb, NOW(), NOW()),
  -- 논현동
  ('11680108-0000-0000-0000-000000000000', '논현동', 'neighborhood', '1168010800', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 88.9, 87.4, true, 37.5104, 127.0286, '{"population": 27800, "area_km2": 2.9}'::jsonb, NOW(), NOW()),
  -- 개포동
  ('11680109-0000-0000-0000-000000000000', '개포동', 'neighborhood', '1168010900', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 87.6, 86.8, true, 37.4802, 127.0557, '{"population": 33100, "area_km2": 4.1}'::jsonb, NOW(), NOW()),
  -- 일원동
  ('11680110-0000-0000-0000-000000000000', '일원동', 'neighborhood', '1168011000', '11680000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 86.2, 85.9, true, 37.4840, 127.0833, '{"population": 45200, "area_km2": 5.8}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. 서초구 (district level)
INSERT INTO regions (id, name, level, code, parent_id, master_id, "totalUsers", "totalMerchants", "totalFlyers", livability_index, safety_score, is_active, latitude, longitude, metadata, "createdAt", "updatedAt")
VALUES
  ('11650000-0000-0000-0000-000000000000', '서초구', 'district', '11650', '11000000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 89.7, 90.3, true, 37.4837, 127.0324, '{"population": 442000, "area_km2": 47.0}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. 서초구 내 동
INSERT INTO regions (id, name, level, code, parent_id, master_id, "totalUsers", "totalMerchants", "totalFlyers", livability_index, safety_score, is_active, latitude, longitude, metadata, "createdAt", "updatedAt")
VALUES
  -- 서초동
  ('11650101-0000-0000-0000-000000000000', '서초동', 'neighborhood', '1165010100', '11650000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 91.2, 92.1, true, 37.4837, 127.0181, '{"population": 52300, "area_km2": 6.3}'::jsonb, NOW(), NOW()),
  -- 잠원동
  ('11650102-0000-0000-0000-000000000000', '잠원동', 'neighborhood', '1165010200', '11650000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 88.5, 89.2, true, 37.5141, 127.0114, '{"population": 28900, "area_km2": 3.4}'::jsonb, NOW(), NOW()),
  -- 반포동
  ('11650103-0000-0000-0000-000000000000', '반포동', 'neighborhood', '1165010300', '11650000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 90.8, 91.5, true, 37.5028, 127.0016, '{"population": 41600, "area_km2": 4.9}'::jsonb, NOW(), NOW()),
  -- 방배동
  ('11650104-0000-0000-0000-000000000000', '방배동', 'neighborhood', '1165010400', '11650000-0000-0000-0000-000000000000', NULL, 0, 0, 0, 87.3, 88.6, true, 37.4817, 126.9963, '{"population": 39700, "area_km2": 4.5}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
