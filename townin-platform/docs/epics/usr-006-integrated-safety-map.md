# Epic: USR-006 - Integrated Safety Map

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-006 |
| **Epic Title** | Integrated Safety Map |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 4 days |
| **Actual Effort** | - |
| **Phase** | Phase 1 - Traffic Acquisition |
| **Category** | USR - User App |

## Business Value

CCTV, 주차장, 대피소를 **하나의 통합 지도**에서 보여주어 사용자 편의성을 극대화하고, 타운인의 핵심 가치인 "안전한 우리 동네"를 강조합니다.

### Success Metrics
- 통합 맵 사용률 ≥ 60%
- 레이어 전환 사용률 ≥ 40%

## Epic Scope

✅ 통합 지도 (CCTV + 주차장 + 대피소)
✅ 레이어 ON/OFF 토글
✅ 다중 마커 타입 표시
✅ 필터 조합 (CCTV + 주차장만 등)
✅ 통합 검색

## User Stories (간결 버전)

### Story 6.1: 통합 지도 기본 화면
- 3가지 마커 동시 표시 (CCTV, 주차장, 대피소)
- 레이어 선택 버튼 (체크박스)
- **Story Points**: 5

### Story 6.2: 레이어 ON/OFF 토글
- CCTV, 주차장, 대피소 개별 ON/OFF
- 선택된 레이어만 마커 표시
- **Story Points**: 3

### Story 6.3: 마커 타입별 아이콘
- CCTV: 카메라 아이콘
- 주차장: P 아이콘 (색상: 주차 가능 대수)
- 대피소: 십자가/집 아이콘
- **Story Points**: 2

### Story 6.4: 통합 검색
- 주소 검색 시 3가지 데이터 모두 표시
- 검색 결과: CCTV 10개, 주차장 5개, 대피소 2개
- **Story Points**: 3

### Story 6.5: 마커 클릭 시 BottomSheet
- 타입에 따라 다른 BottomSheet 표시
- CCTV: 설치 기관, 목적
- 주차장: 주차 가능 대수, 요금
- 대피소: 수용 인원, 시설
- **Story Points**: 3

### Story 6.6: 반경 필터 공통 적용
- 500m, 1km, 2km 반경 선택
- 선택된 반경 내 모든 타입 마커 표시
- **Story Points**: 2

### Story 6.7: 레이어별 통계 표시
- 하단: "CCTV 125개, 주차장 15개, 대피소 5개"
- 레이어 ON/OFF에 따라 숫자 업데이트
- **Story Points**: 2

### Story 6.8: 통합 맵 즐겨찾기
- 특정 위치의 레이어 설정 저장
- 예: "우리집 (CCTV + 주차장)"
- **Story Points**: 3

### Story 6.9: 통합 맵 공유
- 현재 지도 화면 (3가지 레이어) 스크린샷 공유
- **Story Points**: 2

### Story 6.10: 빠른 전환 버튼
- 하단 탭: [CCTV만] [주차장만] [대피소만] [전체]
- 탭 클릭 시 레이어 자동 전환
- **Story Points**: 2

## Technical Specifications

### API Endpoint
```
GET /api/public-data/map?types=cctv,parking,shelter&bounds=...
Response: GeoJSON FeatureCollection
```

### State Management
```dart
class IntegratedMapState {
  final List<Cctv> cctvs;
  final List<Parking> parkings;
  final List<Shelter> shelters;
  final Set<MapLayerType> enabledLayers; // {cctv, parking, shelter}
  final double radius;
}

enum MapLayerType { cctv, parking, shelter }
```

### Screen Layout
```
┌─────────────────────────────┐
│  ← 안전맵         🔍 즐겨찾기 │
├─────────────────────────────┤
│ [주소 검색]                 │
├─────────────────────────────┤
│      🗺️ 통합 지도            │
│   📹 CCTV 마커              │
│   🅿️ 주차장 마커            │
│   🏠 대피소 마커            │
├─────────────────────────────┤
│ ☑ CCTV ☑ 주차장 ☑ 대피소   │ ← 레이어 토글
│ [500m] [1km] [2km]          │
├─────────────────────────────┤
│ CCTV 125개, 주차장 15개, 대피소 5개 │
│ [CCTV만] [주차장만] [대피소만] [전체] │
└─────────────────────────────┘
```

## Dependencies
- USR-003 (CCTV), USR-004 (주차장), USR-005 (대피소)

## Future Enhancements
### Phase 2
- 안전 점수 (CCTV + 가로등 + 범죄율)
- 히트맵 (안전한 지역 vs 위험 지역)
