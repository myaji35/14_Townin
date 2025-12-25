# Epic: USR-005 - Safety Map (Disaster Shelters)

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-005 |
| **Epic Title** | Safety Map (Disaster Shelters) |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 3 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (User App) |
| **Category** | USR - User App |
| **Owner** | Mobile Team (Flutter) |

## Business Value

### Problem Statement
재난 상황(지진, 화재, 침수 등)에서 가장 가까운 대피소를 빠르게 찾는 것은 생명과 직결됩니다. 타운인은 서울시 재난 대피소 정보를 제공하여 안전한 도시를 만듭니다.

### Business Value
- **사회적 가치**: 재난 안전 정보 제공
- **브랜드 신뢰**: 공익적 기능으로 플랫폼 신뢰도 증대
- **Traffic Anchor**: 안전 관심 사용자 유입
- **정부 협력**: 지자체와 협업 기회

### Target Users
- **시민**: 재난 대비 정보 확인
- **학교/기관**: 대피소 위치 파악
- **고령자**: 재난 대피 경로 사전 확인

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 대피소 맵 사용률 | ≥ 15% | 사용자 중 대피소 맵 진입 비율 |
| 재난 상황 시 사용 급증 | 10x | 평상시 대비 재난 발생 시 사용량 |
| 대피소 정보 정확도 | 100% | 서울시 데이터 동기화율 |

## Epic Scope

### In Scope
✅ 재난 대피소 지도 뷰어
✅ 대피소 검색 및 필터 (지진/화재/침수)
✅ 대피소 상세 정보 (수용 인원, 시설)
✅ 가장 가까운 대피소 경로 안내
✅ 대피소 공유 기능

### Out of Scope
❌ 실시간 재난 알림 - Phase 2
❌ 대피소 혼잡도 - Phase 3
❌ 재난 물품 재고 - Phase 3

## User Stories (간결 버전)

### Story 5.1: 대피소 지도 기본 화면
- 현재 위치 중심 지도
- 반경 2km 내 대피소 마커 표시
- 대피소 타입별 아이콘 (지진/화재/침수)
- **Story Points**: 3

### Story 5.2: 대피소 상세 정보
- 대피소명, 주소, 수용 인원
- 시설 유형 (학교, 공원, 공공시설)
- 면적, 전화번호
- 거리 및 경로 안내
- **Story Points**: 2

### Story 5.3: 대피소 타입 필터
- 전체, 지진, 화재, 침수 대피소 필터
- 다중 선택 가능
- **Story Points**: 2

### Story 5.4: 가장 가까운 대피소 찾기
- "가까운 대피소" 버튼
- 현재 위치에서 가장 가까운 대피소 3곳 표시
- 거리순 정렬 리스트
- **Story Points**: 3

### Story 5.5: 대피소 경로 안내
- 도보 경로 우선
- 예상 소요 시간
- 카카오맵/네이버맵 외부 앱 연동
- **Story Points**: 3

### Story 5.6: 대피소 즐겨찾기
- 집/직장 인근 대피소 즐겨찾기
- 즐겨찾기 목록
- **Story Points**: 2

### Story 5.7: 대피소 맵 공유
- 가족/친구에게 대피소 위치 공유
- 카카오톡/메시지 공유
- **Story Points**: 2

### Story 5.8: 대피소 주소 검색
- 주소 검색으로 해당 지역 대피소 조회
- **Story Points**: 2

### Story 5.9: 대피소 안전 정보
- 재난 대비 행동 요령 링크
- 비상 연락처 (119, 112)
- **Story Points**: 2

### Story 5.10: 대피소 수용 인원 표시
- 대피소 마커에 수용 인원 숫자 표시
- 수용 인원 많은 순 정렬
- **Story Points**: 2

## Technical Specifications

### Technology Stack
- Flutter 3.x, flutter_naver_map, url_launcher, Riverpod

### API Endpoints Used
```
GET /api/public-data/shelters?lat=...&lng=...&radius=2000
GET /api/public-data/shelters?type=earthquake
```

### Database Schema (Backend - 이미 CORE-003에 정의됨)
```sql
-- shelters 테이블 사용
SELECT * FROM shelters
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography,
  2000
);
```

### State Management
```dart
class ShelterMapState {
  final List<Shelter> shelters;
  final LatLng? currentLocation;
  final List<String> selectedTypes; // earthquake, fire, flood
  final bool isLoading;
}
```

## Testing Strategy
- Unit Tests: 거리 계산, 필터링 로직
- Widget Tests: 지도 렌더링, BottomSheet
- Integration Tests: 대피소 조회 → 지도 표시

## Dependencies
- **CORE-002**: Geospatial Data Infrastructure
- **CORE-003**: Public Data Integration (대피소 데이터)

## Related Epics
- USR-003, USR-004, USR-006 (통합 안전맵)

## Future Enhancements
### Phase 2
- 실시간 재난 알림 (지진, 호우)
- 재난 문자 연동

### Phase 3
- 대피소 혼잡도 (실시간 수용 현황)
- 재난 물품 재고 (생수, 담요)

## Notes
대피소는 CCTV, 주차장보다 적게 사용되지만, **재난 상황 시 필수 기능**으로 브랜드 신뢰도 증대에 기여합니다.

**재난 대비 행동 요령 링크**:
- 지진: https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/SDIJKM1302.html
- 화재: https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/SDIJKM1201.html
