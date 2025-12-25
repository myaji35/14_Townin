# Epic: USR-010 - Digital Signboard Viewer

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-010 |
| **Epic Title** | Digital Signboard Viewer |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 3 days |
| **Phase** | Phase 1 |
| **Category** | USR - User App |

## Business Value

상인이 등록한 **디지털 간판**을 사용자가 조회합니다. 간판은 상시 노출되는 정보(영업시간, 메뉴 등)로, 전단지보다 장기적이고 안정적인 홍보 수단입니다.

### Success Metrics
- 디지털 간판 조회율 ≥ 40%
- 간판 → 상점 방문 전환율 ≥ 10%

## Epic Scope

✅ 디지털 간판 피드
✅ 간판 상세 보기
✅ 카테고리별 필터
✅ 지역별 필터
✅ 간판 검색
✅ 상점 정보 연결

❌ 간판 리뷰 - Phase 2
❌ 간판 QR 체크인 - Phase 2

## User Stories

### Story 10.1: 디지털 간판 피드
- 카드 형식 피드
- 간판 이미지, 상점명, 카테고리, 거리
- 영업 중/마감 표시
- **Story Points**: 5

### Story 10.2: 간판 상세 보기
- 간판 이미지
- 상점명, 주소, 전화번호
- 영업시간, 휴무일
- 대표 메뉴/상품
- 지도 미리보기
- **Story Points**: 3

### Story 10.3: 카테고리 필터
- 음식, 카페, 병원, 학원, 미용실 등
- **Story Points**: 2

### Story 10.4: 지역 필터 (3-Hub)
- 거주지/직장/가족집 전환
- **Story Points**: 2

### Story 10.5: 간판 검색
- 상점명, 카테고리 검색
- **Story Points**: 3

### Story 10.6: 영업 중 필터
- "영업 중만 보기" 토글
- 현재 시간 기준 영업 중인 상점만 표시
- **Story Points**: 3

### Story 10.7: 간판 저장 (즐겨찾기)
- 자주 가는 상점 간판 저장
- **Story Points**: 2

### Story 10.8: 상점 전화 걸기
- 간판 상세 화면에서 "전화하기" 버튼
- 전화 앱 실행
- **Story Points**: 1

### Story 10.9: 상점 길찾기
- 간판 상세 화면에서 "길찾기" 버튼
- 카카오맵/네이버맵 연동
- **Story Points**: 2

### Story 10.10: 간판 공유
- 카카오톡, 메시지로 간판 공유
- **Story Points**: 2

## Technical Specifications

### Database Schema
```sql
CREATE TABLE digital_signboards (
  id UUID PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id),
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  business_hours JSONB, -- {"mon": "09:00-22:00", ...}
  closed_days VARCHAR(50), -- "일요일, 공휴일"
  menu_items JSONB, -- [{"name": "아메리카노", "price": 4000}]
  location GEOMETRY(POINT, 4326),
  region_id UUID REFERENCES regions(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
GET /api/signboards?regionId=...&category=food
GET /api/signboards/:id
GET /api/signboards/search?q=카페
```

### Business Hours Logic
```dart
bool isOpen(Map<String, String> businessHours) {
  final now = DateTime.now();
  final dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.weekday % 7];
  final hours = businessHours[dayOfWeek]; // "09:00-22:00"

  if (hours == null || hours == 'closed') return false;

  final times = hours.split('-');
  final openTime = TimeOfDay.parse(times[0]);
  final closeTime = TimeOfDay.parse(times[1]);

  final nowTime = TimeOfDay.now();
  return nowTime.isAfter(openTime) && nowTime.isBefore(closeTime);
}
```

### Screen Layout
```
┌─────────────────────────────┐
│ [거주지▼] [전체▼] 🔍        │
├─────────────────────────────┤
│ [음식][카페][병원][학원]...  │
├─────────────────────────────┤
│ ☑ 영업 중만 보기            │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 📄 간판 이미지           │ │
│ │ 🏪 치킨마을 · 125m       │ │
│ │ 🕐 영업 중 (09:00-22:00) │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Dependencies
- CORE-002 (Geospatial), USR-002 (3-Hub), MRC-002 (간판 등록)

## Future Enhancements
### Phase 2
- 간판 리뷰/평점
- 간판 QR 체크인 (포인트 적립)
- 간판 예약 (병원, 미용실)
