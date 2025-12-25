# Epic: MRC-004 - Target Area Selection

## Epic Overview

| Epic ID | MRC-004 |
| Title | Target Area Selection |
| Priority | P1 | Effort | 4 days |
| Phase | Phase 1 | Category | MRC |

## Business Value

상인이 전단지를 **특정 지역에만 노출**하여 효과적으로 타겟팅할 수 있습니다.

## Epic Scope

✅ 반경 선택 (500m, 1km, 2km)
✅ 지도에 반경 표시
✅ 예상 도달 사용자 수 표시
✅ 구/동 단위 선택 (선택 사항)

## User Stories (간결 버전)

1. **반경 선택** (3P)
   - 500m/1km/2km 버튼
2. **지도 미리보기** (3P)
   - 상점 중심 원 표시
3. **예상 도달 사용자** (5P)
   - 해당 반경 내 사용자 수 표시
   - "약 1,250명에게 노출됩니다"
4. **구/동 선택** (5P)
   - 체크박스로 특정 구/동 선택
5. **타겟 지역 저장** (2P)
   - 기본 타겟 지역 저장 (다음 전단지에 자동 적용)
6. **타겟 지역 변경 이력** (3P)
7. **타겟 지역 통계** (3P)
   - 지역별 전단지 조회율
8. **복수 타겟 지역** (Phase 2)

## Technical Specifications

### API Endpoints
```
GET /api/regions/:id/user-count (해당 지역 사용자 수)
POST /api/flyers/:id/target-regions
```

### Target Region Logic
```sql
-- 반경 내 사용자 수 계산
SELECT COUNT(DISTINCT user_id)
FROM user_locations
WHERE ST_DWithin(
  location::geography,
  (SELECT location FROM merchants WHERE id = :merchantId)::geography,
  :radius
);
```

## Dependencies
- CORE-002 (Geospatial), MRC-003 (전단지)
