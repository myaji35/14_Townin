# USR-007: Digital Flyer Viewer - Backend Implementation Summary

## Implementation Overview

USR-007 전단지 뷰어 백엔드 API가 구현되었습니다. 사용자가 위치 기반으로 전단지를 조회하고, 검색하고, 카테고리별로 필터링할 수 있는 완전한 API 세트를 제공합니다.

---

## Implemented Features

### 1. Entity Enhancements

**File**: `src/modules/flyers/flyer.entity.ts`

새로 추가된 필드:
```typescript
export enum FlyerCategory {
  FOOD = 'food',
  FASHION = 'fashion',
  BEAUTY = 'beauty',
  EDUCATION = 'education',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum FlyerStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// New Fields
category: FlyerCategory;         // 전단지 카테고리
status: FlyerStatus;             // 승인 상태
targetRadius: number;            // 타겟 반경 (meters)
startDate: Date;                 // 전단지 시작일
endDate: Date;                   // 전단지 종료일
regionId: string;                // 지역 ID (향후 H3 연동)
```

### 2. Service Methods (User-facing)

**File**: `src/modules/flyers/flyers.service.ts`

#### getFlyersByLocation()
위치 기반 전단지 조회 (H3 hexagon grid 사용 예정)
```typescript
async getFlyersByLocation(
  h3Index: string,
  radius: number = 1,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: Flyer[]; total: number }>
```

필터링 조건:
- `isActive = true`
- `status = APPROVED`
- `deletedAt IS NULL`
- `expiresAt > now` (만료되지 않음)
- `startDate <= now` (시작일 체크)

#### searchFlyers()
키워드 기반 전단지 검색
```typescript
async searchFlyers(
  keyword: string,
  category?: FlyerCategory,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: Flyer[]; total: number }>
```

검색 대상:
- `title` (제목)
- `description` (설명)
- 옵션: 카테고리 필터링

#### getFlyersByCategory()
카테고리별 전단지 조회
```typescript
async getFlyersByCategory(
  category: FlyerCategory,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: Flyer[]; total: number }>
```

#### getFeaturedFlyers()
인기 전단지 조회 (조회수, 클릭수 기준)
```typescript
async getFeaturedFlyers(limit: number = 10): Promise<Flyer[]>
```

정렬 기준:
- `view_count DESC`
- `click_count DESC`

#### trackFlyerView() / trackFlyerClick()
전단지 조회/클릭 추적 (Analytics 통합)
```typescript
async trackFlyerView(flyerId: string, userId?: string): Promise<void>
async trackFlyerClick(flyerId: string, userId?: string): Promise<void>
```

기능:
- 조회수/클릭수 증가
- Analytics 이벤트 발행 (`flyer.viewed`, `flyer.clicked`)

---

## API Endpoints

### User-facing Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| **GET** | `/api/flyers/location/:h3Index` | 내 위치 주변 전단지 | radius, page, limit |
| **GET** | `/api/flyers/search` | 전단지 검색 | q (keyword), category, page, limit |
| **GET** | `/api/flyers/category/:category` | 카테고리별 전단지 | page, limit |
| **GET** | `/api/flyers/featured` | 인기 전단지 | limit |
| **POST** | `/api/flyers/:id/view` | 전단지 조회 추적 | - |
| **POST** | `/api/flyers/:id/click` | 전단지 클릭 추적 | - |
| **GET** | `/api/flyers/:id` | 전단지 상세 조회 (제품 포함) | - |

### Merchant/Admin Endpoints (Existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/flyers` | 모든 활성 전단지 |
| **GET** | `/api/flyers/merchant/:merchantId` | 상인별 전단지 |
| **GET** | `/api/flyers/nearby/:gridCell` | 그리드셀 기준 주변 전단지 |
| **POST** | `/api/flyers` | 전단지 생성 (상인 전용) |
| **PUT** | `/api/flyers/:id` | 전단지 수정 (상인 전용) |
| **DELETE** | `/api/flyers/:id` | 전단지 삭제 (상인 전용) |

---

## Analytics Integration

### Event Listener

**File**: `src/modules/flyers/listeners/flyer-analytics.listener.ts`

이벤트 구독:
- `flyer.viewed` → Analytics 이벤트 생성 (event_type: 'flyer_view')
- `flyer.clicked` → Analytics 이벤트 생성 (event_type: 'flyer_click')

저장 데이터:
```typescript
{
  userId: string,
  eventType: 'flyer_view' | 'flyer_click',
  eventCategory: 'engagement',
  metadata: {
    flyerId: string,
    timestamp: Date,
  },
  platform: 'web' | 'ios' | 'android',
}
```

---

## API Usage Examples

### 1. 내 위치 주변 전단지 조회
```bash
GET /api/flyers/location/8a2a1005892ffff?radius=2&page=1&limit=20
Authorization: Bearer {JWT_TOKEN}
```

Response:
```json
{
  "data": [
    {
      "id": "flyer-uuid",
      "title": "신선한 과일 할인",
      "category": "food",
      "status": "approved",
      "imageUrl": "https://cdn.townin.kr/...",
      "viewCount": 120,
      "clickCount": 45,
      "merchant": {
        "id": "merchant-uuid",
        "businessName": "타운마트",
        "gridCell": "8a2a100589dffff"
      },
      "createdAt": "2025-02-01T10:00:00Z"
    }
  ],
  "total": 42
}
```

### 2. 전단지 검색
```bash
GET /api/flyers/search?q=할인&category=food&page=1&limit=10
Authorization: Bearer {JWT_TOKEN}
```

### 3. 카테고리별 조회
```bash
GET /api/flyers/category/fashion?page=1&limit=20
Authorization: Bearer {JWT_TOKEN}
```

### 4. 인기 전단지
```bash
GET /api/flyers/featured?limit=10
Authorization: Bearer {JWT_TOKEN}
```

### 5. 전단지 조회 추적
```bash
POST /api/flyers/{flyerId}/view
Authorization: Bearer {JWT_TOKEN}
```

Response:
```json
{
  "message": "View tracked"
}
```

---

## Database Schema Changes

### New Columns in `flyers` Table

```sql
ALTER TABLE flyers
ADD COLUMN category VARCHAR(50) DEFAULT 'other',
ADD COLUMN status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN target_radius INT DEFAULT 1000,
ADD COLUMN start_date TIMESTAMP NULL,
ADD COLUMN end_date TIMESTAMP NULL,
ADD COLUMN region_id UUID NULL;

CREATE INDEX idx_flyers_category ON flyers(category);
CREATE INDEX idx_flyers_status ON flyers(status);
```

---

## Module Dependencies

**FlyersModule** now imports:
- `TypeOrmModule` (Flyer, FlyerProduct entities)
- `AnalyticsModule` (for event tracking)

Providers:
- `FlyersService`
- `FlyerAnalyticsListener`

---

## Integration with Existing Modules

### CORE-002: Geospatial Data Infrastructure
- Location-based filtering uses H3 grid system
- Currently using `merchant.gridCell` for proximity
- **TODO**: Implement H3 k-ring queries for accurate radius search

### CORE-005: File Upload & CDN
- Flyer images stored via S3
- CloudFront CDN for image delivery
- `imageUrl` field contains CDN URL

### CORE-006: Logging & Monitoring
- Analytics events tracked for every view/click
- DAU/MAU metrics include flyer engagement
- Event metadata stored in JSONB for flexible querying

---

## Testing Guide

### Manual Testing

#### 1. 전단지 생성 (Merchant)
```bash
POST /api/flyers
Authorization: Bearer {MERCHANT_JWT_TOKEN}
Content-Type: application/json

{
  "title": "봄맞이 신상품 세일",
  "description": "모든 상품 20% 할인",
  "imageUrl": "https://cdn.townin.kr/flyers/2025/02/test.jpg",
  "category": "fashion",
  "targetRadius": 2000,
  "startDate": "2025-02-01T00:00:00Z",
  "expiresAt": "2025-02-28T23:59:59Z"
}
```

#### 2. 사용자 전단지 조회
```bash
# 위치 기반
GET /api/flyers/location/8a2a1005892ffff

# 검색
GET /api/flyers/search?q=세일

# 카테고리
GET /api/flyers/category/fashion

# 인기 전단지
GET /api/flyers/featured
```

#### 3. Analytics 확인
```bash
# 이벤트 집계
GET /api/analytics/events/counts?startDate=2025-02-01&endDate=2025-02-07

# flyer_view, flyer_click 이벤트 카운트 확인
```

---

## Future Enhancements

### Phase 2 (추후 개선)

1. **Geospatial Query Optimization**
   - H3 k-ring 쿼리 구현 (정확한 반경 검색)
   - PostGIS 통합 고려

2. **Personalization**
   - 사용자 선호 카테고리 기반 추천
   - 조회 이력 기반 맞춤 전단지

3. **Notification Integration**
   - 새로운 전단지 푸시 알림
   - 관심 카테고리 전단지 알림

4. **Advanced Filtering**
   - 가격대 필터
   - 할인율 필터
   - 거리 슬라이더

5. **Merchant Dashboard**
   - 전단지 성과 분석
   - 경쟁사 비교 분석

---

## Completed Status

- [x] Flyer Entity 업데이트 (category, status, radius 등)
- [x] User-facing Service 메서드 구현 (조회, 검색, 필터)
- [x] User-facing Controller 엔드포인트 구현
- [x] Analytics 이벤트 통합 (FlyerAnalyticsListener)
- [x] FlyersModule 의존성 추가 (AnalyticsModule)
- [x] API 문서화 (Swagger)

---

## Next Steps

### USR-001: Flutter User Onboarding

이제 Flutter 앱에서 이 API를 사용하여:
1. 위치 기반 전단지 목록 표시
2. 검색 기능 구현
3. 카테고리 필터 UI
4. 전단지 상세 화면 (클릭 추적)

### MVP: 최소 기능 통합 테스트

전체 플로우 테스트:
1. 상인이 전단지 등록
2. 관리자가 승인 (status: approved)
3. 사용자가 Flutter 앱에서 전단지 조회
4. Analytics 이벤트 확인

---

**구현 완료일**: 2025-02-01
**담당**: Claude Code
**상태**: ✅ 구현 완료
