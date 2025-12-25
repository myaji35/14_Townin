# Epic: USR-003 - Safety Map (CCTV)

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-003 |
| **Epic Title** | Safety Map (CCTV) |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 6 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (User App) |
| **Category** | USR - User App |
| **Owner** | Mobile Team (Flutter) |

## Business Value

### Problem Statement
타운인의 Phase 1 전략은 **공공 데이터로 무료 Traffic을 확보**하는 것입니다. CCTV 안전맵은 학부모, 여성, 고령자에게 매력적인 기능으로, 광고 없이 순수한 가치를 제공하여 앱 설치를 유도합니다.

### Business Value
- **Traffic Anchor**: CCTV 맵으로 검색 유입, 입소문 확대
- **신뢰도 구축**: 공공 데이터로 플랫폼 신뢰성 확보
- **사용자 참여**: 안전 경로 찾기로 일상적 사용 유도
- **SEO**: "우리 동네 CCTV 지도" 검색 노출

### Target Users
- **학부모**: 아이 등하굣길 CCTV 확인
- **여성**: 야간 귀가 안전 경로
- **고령자**: 산책로 CCTV 위치
- **지역 주민**: 동네 안전도 파악

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| CCTV 맵 사용률 | ≥ 50% | 사용자 중 CCTV 맵 진입 비율 |
| 안전 경로 찾기 사용 | ≥ 20% | CCTV 맵 사용자 중 경로 찾기 사용 비율 |
| 지도 로딩 시간 | < 2초 | CCTV 마커 로드 평균 시간 |
| 재방문율 | ≥ 30% | 주 1회 이상 CCTV 맵 재방문 |
| 공유 횟수 | - | CCTV 맵 공유 기능 사용 횟수 |

## Epic Scope

### In Scope
✅ **CCTV 지도 뷰어**
- 지도 위 CCTV 마커 표시
- 현재 위치 중심 지도
- CCTV 밀도 히트맵 (선택 사항)
- 지도 확대/축소

✅ **CCTV 검색 및 필터**
- 주소 검색
- 반경 검색 (500m, 1km, 2km)
- 설치 기관별 필터 (서울시, 구청, 경찰서)
- 설치 목적별 필터 (방범, 교통)

✅ **CCTV 상세 정보**
- CCTV 위치명
- 설치 기관
- 설치 목적
- 주소
- 거리 (현재 위치 기준)

✅ **안전 경로 찾기**
- 출발지 → 도착지 경로
- CCTV 많은 경로 우선 표시
- 예상 소요 시간
- CCTV 개수 표시

✅ **CCTV 맵 공유**
- 특정 지역 CCTV 맵 스크린샷 공유
- 카카오톡, 메시지 공유

### Out of Scope
❌ CCTV 실시간 영상 스트리밍 - Phase 3
❌ CCTV 고장 신고 - Phase 2
❌ 사용자 제보 CCTV - Phase 2
❌ 안전 점수 (AI 기반) - Phase 3

## User Stories

### Story 3.1: CCTV 지도 기본 화면
**As a** 사용자
**I want to** 내 주변 CCTV를 지도에서 보고
**So that** 어디에 CCTV가 있는지 한눈에 파악할 수 있다

**Acceptance Criteria:**
- [ ] 현재 위치 중심 지도 (GPS)
- [ ] 반경 1km 내 CCTV 마커 표시
- [ ] CCTV 마커 아이콘 (카메라 모양)
- [ ] 내 위치 마커 (파란색 점)
- [ ] 지도 확대/축소 버튼
- [ ] 상단: "CCTV 안전맵" 타이틀
- [ ] 하단: CCTV 개수 표시 (예: "주변 CCTV 125개")

**Tasks:**
- [ ] CctvMapScreen 위젯 작성
- [ ] flutter_naver_map 또는 google_maps_flutter 통합
- [ ] GET /api/public-data/cctv?lat=...&lng=...&radius=1000
- [ ] 지도 마커 렌더링
- [ ] GPS 권한 요청

**Story Points:** 5

---

### Story 3.2: CCTV 마커 클러스터링
**As a** 사용자
**I want to** 많은 CCTV 마커가 겹치지 않고
**So that** 지도를 깔끔하게 볼 수 있다

**Acceptance Criteria:**
- [ ] 줌 아웃 시 CCTV 마커 그룹화 (숫자 표시)
- [ ] 클러스터 클릭 시 해당 영역 확대
- [ ] 줌 인 시 개별 CCTV 마커 표시
- [ ] 클러스터 색상: CCTV 밀도에 따라 (녹색 → 노란색 → 빨간색)

**Tasks:**
- [ ] Marker Clustering 라이브러리 사용
- [ ] 클러스터 아이콘 커스터마이징
- [ ] 줌 레벨에 따른 클러스터링 로직

**Story Points:** 5

---

### Story 3.3: CCTV 상세 정보 BottomSheet
**As a** 사용자
**I want to** CCTV 마커를 클릭하면 상세 정보를 보고
**So that** 해당 CCTV의 목적과 위치를 알 수 있다

**Acceptance Criteria:**
- [ ] 마커 클릭 시 BottomSheet 표시
- [ ] CCTV 정보:
  - 위치명 (예: "종로구청 앞 교차로")
  - 설치 기관 (예: "종로구청")
  - 설치 목적 (예: "방범")
  - 주소
  - 현재 위치로부터 거리 (예: "125m")
- [ ] "길찾기" 버튼
- [ ] "공유" 버튼

**Tasks:**
- [ ] CctvDetailBottomSheet 위젯 작성
- [ ] 거리 계산 로직 (Haversine formula)
- [ ] BottomSheet UI 디자인

**Story Points:** 3

---

### Story 3.4: 주소 검색
**As a** 사용자
**I want to** 특정 주소의 CCTV를 검색하고
**So that** 내가 가고 싶은 곳의 CCTV를 미리 확인할 수 있다

**Acceptance Criteria:**
- [ ] 상단 검색 바
- [ ] 주소 입력 시 자동완성 (Kakao Address Search)
- [ ] 주소 선택 시 해당 위치로 지도 이동
- [ ] 해당 위치 반경 1km CCTV 표시

**Tasks:**
- [ ] 검색 바 UI
- [ ] Kakao Local API 연동 (주소 검색)
- [ ] 자동완성 리스트 UI
- [ ] 지도 카메라 이동 애니메이션

**Story Points:** 5

---

### Story 3.5: 반경 필터 (500m, 1km, 2km)
**As a** 사용자
**I want to** 검색 반경을 조절하고
**So that** 원하는 범위의 CCTV만 볼 수 있다

**Acceptance Criteria:**
- [ ] 반경 선택 버튼 (500m, 1km, 2km)
- [ ] 선택된 반경 표시 (지도 위 원)
- [ ] 반경 변경 시 CCTV 재조회
- [ ] 하단 CCTV 개수 업데이트

**Tasks:**
- [ ] 반경 선택 버튼 UI
- [ ] 지도 위 원(Circle) 오버레이
- [ ] API 호출 (radius 파라미터)

**Story Points:** 3

---

### Story 3.6: 설치 기관별 필터
**As a** 사용자
**I want to** 설치 기관별로 CCTV를 필터링하고
**So that** 특정 기관의 CCTV만 볼 수 있다

**Acceptance Criteria:**
- [ ] 필터 버튼 (상단 우측)
- [ ] 필터 옵션: 전체, 서울시, 종로구청, 경찰서 등
- [ ] 다중 선택 가능
- [ ] 필터 적용 시 지도 업데이트

**Tasks:**
- [ ] 필터 BottomSheet UI
- [ ] 체크박스 다중 선택
- [ ] 필터링된 CCTV 마커만 표시

**Story Points:** 3

---

### Story 3.7: 안전 경로 찾기
**As a** 사용자
**I want to** CCTV가 많은 안전한 경로를 찾고
**So that** 야간 귀가 시 안전하게 이동할 수 있다

**Acceptance Criteria:**
- [ ] BottomSheet에서 "길찾기" 버튼 클릭
- [ ] 출발지 (현재 위치), 도착지 (선택한 CCTV) 설정
- [ ] 경로 표시 (Polyline)
- [ ] 경로 상의 CCTV 개수 표시
- [ ] 예상 소요 시간 (도보 기준)
- [ ] 대안 경로 (CCTV 적은 경로 비교)

**Tasks:**
- [ ] 경로 찾기 API 연동 (Kakao Navigation or Naver Directions)
- [ ] Polyline 그리기
- [ ] 경로 상 CCTV 개수 계산 (ST_Buffer)
- [ ] 대안 경로 UI

**Story Points:** 8

---

### Story 3.8: CCTV 밀도 히트맵 (선택 사항)
**As a** 사용자
**I want to** CCTV 밀도를 히트맵으로 보고
**So that** 어떤 지역이 안전한지 시각적으로 파악할 수 있다

**Acceptance Criteria:**
- [ ] 히트맵 레이어 ON/OFF 토글
- [ ] CCTV 밀도에 따라 색상 변화 (파란색 → 빨간색)
- [ ] 반투명 오버레이
- [ ] 지도 확대/축소에 따라 히트맵 업데이트

**Tasks:**
- [ ] 히트맵 라이브러리 (google_maps_flutter heatmap)
- [ ] CCTV 좌표 배열 전달
- [ ] 히트맵 레이어 토글 버튼

**Story Points:** 5

---

### Story 3.9: CCTV 맵 공유
**As a** 사용자
**I want to** CCTV 맵을 친구에게 공유하고
**So that** 우리 동네 CCTV 정보를 알려줄 수 있다

**Acceptance Criteria:**
- [ ] "공유" 버튼 (상단 우측)
- [ ] 현재 지도 화면 캡처
- [ ] 공유 옵션: 카카오톡, 메시지, URL 복사
- [ ] 공유 메시지: "우리 동네 CCTV 안전맵 - 타운인"

**Tasks:**
- [ ] Screenshot 캡처 (RepaintBoundary)
- [ ] share_plus 패키지 사용
- [ ] 공유 메시지 템플릿

**Story Points:** 3

---

### Story 3.10: CCTV 맵 즐겨찾기 (선택 사항)
**As a** 사용자
**I want to** 자주 보는 위치를 즐겨찾기하고
**So that** 빠르게 해당 위치의 CCTV를 확인할 수 있다

**Acceptance Criteria:**
- [ ] 즐겨찾기 추가 버튼
- [ ] 즐겨찾기 목록 (BottomSheet)
- [ ] 즐겨찾기 선택 시 해당 위치로 이동
- [ ] 최대 5개 즐겨찾기

**Tasks:**
- [ ] FavoriteCctvLocation 로컬 저장 (SharedPreferences)
- [ ] 즐겨찾기 목록 UI
- [ ] 즐겨찾기 CRUD

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Framework**: Flutter 3.x
- **Maps**: flutter_naver_map (네이버 지도) 또는 google_maps_flutter
- **Clustering**: google_maps_cluster_manager 또는 커스텀 구현
- **Routing**: Kakao Mobility API (경로 찾기)
- **Share**: share_plus
- **Screenshot**: RepaintBoundary + dart:ui

### Architecture Decisions

#### 1. 지도 SDK 선택
**Decision**: 네이버 지도 (flutter_naver_map)

**Rationale**:
- **한국 지도**: 국내 최적화, 상세한 한국 지도
- **무료 할당량**: 일 300,000건 (Google Maps보다 높음)
- **CCTV 데이터**: 서울시 데이터와 호환성 좋음

**Fallback**: Google Maps (해외 확장 시)

#### 2. Marker Clustering
**Decision**: 커스텀 클러스터링 구현

**Rationale**:
- **성능**: 1,000개 이상 마커도 부드러운 렌더링
- **커스터마이징**: 클러스터 색상, 크기 자유롭게 조정
- **라이브러리 제한**: 기존 라이브러리는 Naver Map 미지원

**구현**:
```dart
// H3 Grid Cell 기반 클러스터링
class CctvClusterManager {
  Map<String, List<Cctv>> clusterCctvs(List<Cctv> cctvs, int resolution) {
    final clusters = <String, List<Cctv>>{};

    for (final cctv in cctvs) {
      final h3Index = latLngToCell(cctv.lat, cctv.lng, resolution);
      clusters.putIfAbsent(h3Index, () => []).add(cctv);
    }

    return clusters;
  }
}
```

#### 3. 경로 찾기 API
**Decision**: Kakao Mobility API

**Rationale**:
- **도보 경로**: Naver보다 정확한 도보 경로
- **무료**: 일 300,000건
- **CCTV 통과 경로**: Waypoint 지원

### API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public-data/cctv?lat=37.5665&lng=126.9780&radius=1000` | CCTV 조회 (반경) |
| GET | `/api/public-data/cctv?regionId=...` | CCTV 조회 (지역별) |
| GET | `/api/public-data/map?types=cctv&bounds=...` | CCTV GeoJSON |

### External APIs

| Provider | API | Usage |
|----------|-----|-------|
| Kakao | Local API (주소 검색) | 주소 자동완성 |
| Kakao | Mobility API (경로) | 안전 경로 찾기 |

### State Management (Riverpod)
```dart
// cctv_map_provider.dart
final cctvMapProvider = StateNotifierProvider<CctvMapNotifier, CctvMapState>((ref) {
  return CctvMapNotifier(ref.read(apiServiceProvider));
});

class CctvMapState {
  final List<Cctv> cctvs;
  final LatLng? currentLocation;
  final double radius; // 500, 1000, 2000
  final List<String> selectedAgencies; // 필터
  final bool isLoading;

  CctvMapState({
    this.cctvs = const [],
    this.currentLocation,
    this.radius = 1000,
    this.selectedAgencies = const [],
    this.isLoading = false,
  });
}

class CctvMapNotifier extends StateNotifier<CctvMapState> {
  CctvMapNotifier(this._apiService) : super(CctvMapState());

  final ApiService _apiService;

  Future<void> loadCctvs(LatLng location, double radius) async {
    state = state.copyWith(isLoading: true);

    try {
      final cctvs = await _apiService.getCctvs(
        lat: location.latitude,
        lng: location.longitude,
        radius: radius,
      );

      state = state.copyWith(
        cctvs: cctvs,
        currentLocation: location,
        radius: radius,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  void setRadius(double radius) {
    state = state.copyWith(radius: radius);
    loadCctvs(state.currentLocation!, radius);
  }

  void setAgencyFilter(List<String> agencies) {
    state = state.copyWith(selectedAgencies: agencies);
  }

  List<Cctv> get filteredCctvs {
    if (state.selectedAgencies.isEmpty) return state.cctvs;
    return state.cctvs.where((cctv) =>
      state.selectedAgencies.contains(cctv.installationAgency)
    ).toList();
  }
}
```

### Screen Layout
```
┌─────────────────────────────┐
│  ← CCTV 안전맵       🔍 공유  │ ← AppBar
├─────────────────────────────┤
│  [주소 검색]                │ ← 검색 바
├─────────────────────────────┤
│                             │
│      🗺️ 지도 영역            │
│   📹 CCTV 마커들             │
│   📍 현재 위치              │
│                             │
│                             │
├─────────────────────────────┤
│ [500m] [1km] [2km]  [필터]  │ ← 반경/필터 버튼
├─────────────────────────────┤
│ 주변 CCTV 125개             │ ← 개수 표시
└─────────────────────────────┘

[CCTV 클릭 시 BottomSheet]
┌─────────────────────────────┐
│ 종로구청 앞 교차로            │
│ 종로구청 · 방범              │
│ 서울특별시 종로구 세종대로... │
│ 현재 위치로부터 125m         │
├─────────────────────────────┤
│ [길찾기]           [공유]    │
└─────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- [ ] CctvMapNotifier 상태 관리 테스트
- [ ] 거리 계산 로직 테스트 (Haversine)
- [ ] 필터링 로직 테스트
- [ ] 클러스터링 로직 테스트

### Widget Tests
- [ ] CctvMapScreen 지도 렌더링 테스트
- [ ] CctvDetailBottomSheet UI 테스트
- [ ] 반경 필터 버튼 테스트

### Integration Tests
- [ ] CCTV 조회 → 지도 표시 플로우
- [ ] 주소 검색 → 지도 이동 플로우
- [ ] 경로 찾기 플로우

### Performance Tests
- [ ] 1,000개 CCTV 마커 렌더링 성능
- [ ] 지도 확대/축소 부드러움
- [ ] API 응답 시간 < 2초

## Deployment Checklist

### Pre-Deployment
- [ ] 네이버 지도 API 키 발급
- [ ] Kakao Local/Mobility API 키 발급
- [ ] CCTV 데이터 수집 완료 (서울 25개 구)

### Deployment
- [ ] Android/iOS 빌드
- [ ] 지도 API 키 환경 변수 설정
- [ ] CCTV 맵 사용률 추적 (Analytics)

### Post-Deployment
- [ ] CCTV 맵 사용률 모니터링
- [ ] 안전 경로 찾기 사용률 모니터링
- [ ] 사용자 피드백 수집

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 지도 API 할당량 초과 | High | Low | 캐싱, 네이버 → Google Fallback |
| 많은 마커로 인한 성능 저하 | Medium | Medium | 클러스터링, 뷰포트 내 마커만 렌더링 |
| GPS 권한 거부 | Medium | High | 주소 검색 대체 방법 |
| CCTV 데이터 부정확 | Medium | Low | 공공 데이터 정기 업데이트 |
| 경로 찾기 API 장애 | Low | Low | 에러 메시지, 재시도 버튼 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-002**: Geospatial Data Infrastructure (GPS, 지도)
- **CORE-003**: Public Data Integration (CCTV 데이터)

### Blocks (Dependent Epics)
- **USR-006**: Integrated Safety Map (CCTV + 주차장 + 대피소 통합)

## Related Epics

- **USR-004**: Safety Map (Parking) (주차장 맵)
- **USR-005**: Safety Map (Disaster) (재난 대피소 맵)
- **USR-006**: Integrated Safety Map (통합 안전맵)

## Future Enhancements

### Phase 2
- 사용자 제보 CCTV (크라우드소싱)
- CCTV 고장 신고
- 안전 경로 즐겨찾기

### Phase 3
- CCTV 실시간 영상 스트리밍 (라이브뷰)
- AI 기반 안전 점수 (CCTV 밀도 + 조명 + 범죄율)
- 시간대별 안전도 (야간 vs 주간)

### Phase 4
- 글로벌 CCTV 맵 (Vietnam, Japan)
- AR 기반 CCTV 위치 표시 (카메라 오버레이)

## Notes

### 안전 경로 점수 계산 (Phase 3)
```dart
double calculateSafetyScore(Route route) {
  final cctvCount = countCctvOnRoute(route);
  final lightingScore = analyzeLighting(route); // 가로등 데이터
  final crimeRate = getCrimeRate(route.region); // 범죄 통계

  return (cctvCount * 0.5) + (lightingScore * 0.3) + ((1 - crimeRate) * 0.2);
}
```

### Flutter Packages
```yaml
dependencies:
  flutter_naver_map: ^1.0.0 # 또는 google_maps_flutter
  geolocator: ^10.0.0
  share_plus: ^7.0.0
  dio: ^5.3.0
  cached_network_image: ^3.3.0
  h3_dart: ^0.3.0 # H3 Clustering
```

### References
- 네이버 지도 SDK: https://navermaps.github.io/flutter-map-sdk/
- Kakao Mobility API: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- Google Maps Flutter: https://pub.dev/packages/google_maps_flutter
- H3 Geo: https://h3geo.org/
