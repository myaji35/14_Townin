# Townin Platform - 빠른 시작 가이드
**의정부시 테스트 환경 구축**

---

## 🚀 5분 만에 시작하기

### 1단계: 데이터베이스 시작 (Docker)

```bash
# 프로젝트 디렉토리로 이동
cd townin-platform

# Docker Compose로 모든 데이터베이스 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 예상 출력:
# townin-postgres   running   0.0.0.0:5432->5432/tcp
# townin-redis      running   0.0.0.0:6379->6379/tcp
# townin-neo4j      running   0.0.0.0:7474->7474/tcp, 0.0.0.0:7687->7687/tcp
# townin-influxdb   running   0.0.0.0:8086->8086/tcp
```

**✅ 완료 확인:**
- PostgreSQL: `psql -h localhost -p 15432 -U townin -d townin_db` (비밀번호: townin_dev_password)
- Redis: `redis-cli -p 16379 ping`
- Neo4j 브라우저: http://localhost:7474 (neo4j / townin_neo4j_password)
- InfluxDB: http://localhost:8086

**⚠️ 포트 정보:**
- PostgreSQL은 포트 **15432**를 사용합니다 (로컬 PostgreSQL 충돌 방지)
- Redis는 포트 **16379**를 사용합니다 (로컬 Redis 충돌 방지)

---

### 2단계: 데이터베이스 스키마 확인

PostgreSQL 스키마는 Docker Compose 시작 시 자동으로 적용됩니다.

```bash
# 스키마가 제대로 적용되었는지 확인
docker exec townin-postgres psql -U townin -d townin_db -c "\dt"

# 테이블 목록이 보이면 성공:
# users, user_locations, grid_cells, municipalities,
# security_guards, safety_data, merchants, flyers, etc.
```

**가상 계정이 자동으로 생성되었습니다:**
- 슈퍼관리자: `admin@townin.kr`
- 자치체관리: `municipality@uijeongbu.go.kr`
- 보안관 3명: `guard1@townin.kr`, `guard2@townin.kr`, `guard3@townin.kr`
- 일반 사용자 5명: `user1@example.com` ~ `user5@example.com`

**모든 계정 비밀번호:** `townin2025!`

---

### 3단계: 로그인 데모 확인

```bash
# 브라우저에서 로그인 데모 페이지 열기
open demo-login.html

# 또는 로컬 서버로 실행
python3 -m http.server 8000
# http://localhost:8000/demo-login.html 접속
```

**테스트 시나리오:**
1. "슈퍼관리자" 빠른 로그인 버튼 클릭
2. 로그인 성공 후 대시보드 정보 확인
3. 다른 역할(자치체관리, 보안관, 일반 사용자)도 테스트

---

### 4단계: 데이터 확인

#### PostgreSQL 데이터 조회

```bash
# 사용자 목록 조회
docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT email, role, age_range, household_type, is_active
FROM users
ORDER BY role;
"

# 의정부시 Grid Cells 조회
docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT cell_code, district, property_value_tier, population_density
FROM grid_cells
WHERE city = '의정부시';
"

# 보안관 정보 조회
docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT sg.badge_name, sg.assigned_district, sg.total_earnings, u.email
FROM security_guards sg
JOIN users u ON sg.user_id = u.id;
"

# 안전 데이터 조회 (의정부동)
docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT data_type, name, address
FROM safety_data
WHERE grid_cell = 'uijeongbu_01';
"
```

---

## 📊 역할별 데이터 확인

### 슈퍼관리자 권한으로 조회

```sql
-- 전체 통계
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
    (SELECT COUNT(*) FROM merchants WHERE is_active = TRUE) as total_merchants,
    (SELECT COUNT(*) FROM flyers WHERE is_active = TRUE) as total_flyers,
    (SELECT COUNT(DISTINCT city) FROM grid_cells) as total_cities;

-- 자치체 목록
SELECT name, province, city_code, mayor_name, contact_email
FROM municipalities;
```

### 자치체관리 권한으로 조회 (의정부시)

```sql
-- 의정부시 사용자 수
SELECT COUNT(DISTINCT u.id) as user_count
FROM users u
JOIN user_locations ul ON u.id = ul.user_id
WHERE ul.city = '의정부시' AND u.is_active = TRUE;

-- 의정부시 지역별 사용자 분포
SELECT
    ul.district,
    COUNT(DISTINCT u.id) as user_count
FROM users u
JOIN user_locations ul ON u.id = ul.user_id
WHERE ul.city = '의정부시' AND u.is_active = TRUE
GROUP BY ul.district
ORDER BY user_count DESC;

-- 의정부시 보안관 성과
SELECT
    sg.badge_name,
    sg.assigned_district,
    sg.total_earnings,
    sg.total_ad_views,
    u.email
FROM security_guards sg
JOIN users u ON sg.user_id = u.id
ORDER BY sg.total_earnings DESC;
```

### 보안관 권한으로 조회 (의정부동)

```sql
-- 내 담당 구역 정보
SELECT * FROM security_guards
WHERE user_id = (SELECT id FROM users WHERE email = 'guard1@townin.kr');

-- 내 담당 구역 상인 목록
SELECT business_name, category, signboard_status, total_flyers, total_views
FROM merchants
WHERE grid_cell = 'uijeongbu_01'
ORDER BY total_views DESC;
```

---

## 🔧 추가 설정 (선택사항)

### pgAdmin으로 데이터베이스 GUI 사용

```bash
# pgAdmin 시작 (tools 프로파일)
docker-compose --profile tools up -d pgadmin

# 브라우저에서 접속
# http://localhost:5050
# 로그인: admin@townin.kr / townin2025!

# PostgreSQL 서버 추가:
# Host: postgres (Docker 네트워크 내부 호스트명)
# Port: 5432
# Database: townin_db
# Username: townin
# Password: townin_dev_password
```

### Neo4j 브라우저로 GraphRAG 확인

```bash
# Neo4j 브라우저 접속
open http://localhost:7474

# 로그인
# Connect URL: neo4j://localhost:7687
# Username: neo4j
# Password: townin_neo4j_password

# 샘플 Cypher 쿼리 실행:
MATCH (n) RETURN n LIMIT 25;

# GraphRAG용 노드 생성 (validation-mvp/graphrag/setup_neo4j.py 참고)
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 슈퍼관리자로 시스템 전체 보기

```bash
# 1. 로그인 데모에서 슈퍼관리자 로그인
# 2. PostgreSQL에서 전체 통계 조회

docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT
    'users' as resource, COUNT(*) as count FROM users
UNION ALL
SELECT 'municipalities', COUNT(*) FROM municipalities
UNION ALL
SELECT 'grid_cells', COUNT(*) FROM grid_cells
UNION ALL
SELECT 'security_guards', COUNT(*) FROM security_guards
UNION ALL
SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL
SELECT 'safety_data', COUNT(*) FROM safety_data;
"
```

### 시나리오 2: 자치체관리로 의정부시 대시보드 보기

```bash
# 의정부시 살기 좋은 동네 지수 계산 (샘플)
docker exec townin-postgres psql -U townin -d townin_db -c "
WITH city_stats AS (
    SELECT
        (SELECT COUNT(*) FROM users u JOIN user_locations ul ON u.id = ul.user_id WHERE ul.city = '의정부시' AND u.is_active = TRUE) as users,
        (SELECT COUNT(*) FROM merchants WHERE grid_cell LIKE 'uijeongbu_%' AND is_active = TRUE) as merchants,
        (SELECT COUNT(*) FROM safety_data WHERE grid_cell LIKE 'uijeongbu_%') as safety_points
)
SELECT
    users,
    merchants,
    safety_points,
    ROUND((users * 0.3 + merchants * 0.3 + safety_points * 0.4) / 10, 1) as livability_index
FROM city_stats;
"
```

### 시나리오 3: 보안관으로 수익 확인

```bash
# 의정부동 보안관 수익 시뮬레이션
docker exec townin-postgres psql -U townin -d townin_db -c "
-- 가상 전단지 조회 10건 추가 (테스트용)
WITH guard_info AS (
    SELECT id FROM security_guards WHERE assigned_grid_cell = 'uijeongbu_01'
)
INSERT INTO flyer_views (flyer_id, security_guard_id, grid_cell, guard_revenue)
SELECT
    (SELECT id FROM flyers LIMIT 1),
    (SELECT id FROM guard_info),
    'uijeongbu_01',
    5.00
FROM generate_series(1, 10);

-- 수익 업데이트
UPDATE security_guards
SET
    total_earnings = total_earnings + (10 * 5.00),
    total_ad_views = total_ad_views + 10
WHERE assigned_grid_cell = 'uijeongbu_01';

-- 결과 확인
SELECT badge_name, total_earnings, total_ad_views
FROM security_guards
WHERE assigned_grid_cell = 'uijeongbu_01';
"
```

### 시나리오 4: 일반 사용자로 전단지 보기

```bash
# 사용자 거주 지역 기반 전단지 조회 (의정부동)
docker exec townin-postgres psql -U townin -d townin_db -c "
SELECT
    m.business_name,
    m.category,
    f.title,
    f.view_count,
    f.click_count
FROM flyers f
JOIN merchants m ON f.merchant_id = m.id
WHERE m.grid_cell = 'uijeongbu_01' AND f.is_active = TRUE
ORDER BY f.created_at DESC
LIMIT 5;
"
```

---

## 🛑 중지 및 정리

### 서비스 중지 (데이터 유지)

```bash
docker-compose stop
```

### 서비스 중지 및 데이터 삭제

```bash
docker-compose down -v
```

### 특정 서비스만 재시작

```bash
# PostgreSQL만 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs -f postgres
```

---

## 📖 다음 단계

### 백엔드 API 개발
```bash
cd backend
npm install
npm run start:dev
# API: http://localhost:3000
# Swagger 문서: http://localhost:3000/api/docs
```

### 프론트엔드 앱 개발
```bash
cd frontend
flutter pub get
flutter run
```

### GraphRAG 검증
```bash
cd validation-mvp
python setup_neo4j.py
python langchain_integration.py
```

---

## 🆘 문제 해결

### PostgreSQL 연결 안 됨
```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs postgres
```

### 스키마가 적용 안 됨
```bash
# 수동으로 스키마 적용
docker exec -i townin-postgres psql -U townin -d townin_db < database/postgresql/schema.sql
```

### 포트 충돌 (5432 이미 사용 중)
```bash
# docker-compose.yml에서 포트 변경
ports:
  - "15432:5432"  # 호스트 포트를 15432로 변경

# 재시작
docker-compose up -d
```

---

## 📞 지원

- **문서:** `townin-platform/README.md`, `ACCOUNTS.md`
- **검증 코드:** `validation-mvp/`
- **데이터베이스 스키마:** `database/postgresql/schema.sql`

---

**Townin Platform을 시작해보세요! 🚀**
