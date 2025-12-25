# Townin Platform MVP 구현 요약

## 개요

Townin 플랫폼의 핵심 기능인 **디지털 전단지 시스템**의 백엔드 API와 Flutter 모델/서비스가 구현되었습니다.

**구현일**: 2025-02-01
**구현 범위**: USR-007 (Digital Flyer Viewer) 백엔드 + Flutter 기본 구조

---

## 🎯 구현 완료된 기능

### Backend (NestJS)

#### 1. Flyer Entity 개선
**파일**: `backend/src/modules/flyers/flyer.entity.ts`

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
```

**새로 추가된 필드**:
- `category`: 전단지 카테고리 (8개)
- `status`: 승인 상태 (5개 상태)
- `targetRadius`: 타겟 반경 (meters, 기본 1000m)
- `startDate`: 전단지 시작일
- `endDate`: 전단지 종료일 (expiresAt와 별개)
- `regionId`: 지역 ID (H3 grid 연동 준비)

#### 2. User-facing Service Methods
**파일**: `backend/src/modules/flyers/flyers.service.ts`

| 메서드 | 설명 | 주요 기능 |
|--------|------|----------|
| `getFlyersByLocation()` | 위치 기반 전단지 조회 | H3 hexagon grid 사용, 승인된 활성 전단지만 |
| `searchFlyers()` | 키워드 검색 | 제목/설명 ILIKE 검색, 카테고리 필터 가능 |
| `getFlyersByCategory()` | 카테고리별 조회 | 8개 카테고리 지원 |
| `getFeaturedFlyers()` | 인기 전단지 | 조회수/클릭수 기준 정렬 |
| `trackFlyerView()` | 조회 추적 | Analytics 이벤트 발행 |
| `trackFlyerClick()` | 클릭 추적 | Analytics 이벤트 발행 |

**필터링 조건 (공통)**:
- `isActive = true`
- `status = APPROVED`
- `deletedAt IS NULL`
- `expiresAt > now` OR `expiresAt IS NULL`
- `startDate <= now` OR `startDate IS NULL`

#### 3. RESTful API Endpoints
**파일**: `backend/src/modules/flyers/flyers.controller.ts`

**사용자용 엔드포인트**:
```
GET  /api/flyers/location/:h3Index   # 위치 주변 전단지
GET  /api/flyers/search               # 검색 (q, category)
GET  /api/flyers/category/:category   # 카테고리별
GET  /api/flyers/featured             # 인기 전단지
POST /api/flyers/:id/view             # 조회 추적
POST /api/flyers/:id/click            # 클릭 추적
GET  /api/flyers/:id                  # 상세 조회
```

**상인/관리자 엔드포인트 (기존)**:
```
GET    /api/flyers                     # 모든 전단지
GET    /api/flyers/merchant/:id        # 상인별 전단지
GET    /api/flyers/nearby/:gridCell    # 그리드셀 기준
POST   /api/flyers                     # 전단지 생성
PUT    /api/flyers/:id                 # 전단지 수정
DELETE /api/flyers/:id                 # 전단지 삭제
```

#### 4. Analytics 통합
**파일**: `backend/src/modules/flyers/listeners/flyer-analytics.listener.ts`

이벤트 구독:
- `flyer.viewed` → `analytics_events` 테이블에 저장
  - eventType: `flyer_view`
  - eventCategory: `engagement`
- `flyer.clicked` → `analytics_events` 테이블에 저장
  - eventType: `flyer_click`
  - eventCategory: `engagement`

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

### Frontend (Flutter)

#### 1. Models & Enums

**파일 구조**:
```
lib/
├── core/
│   ├── enums/
│   │   ├── flyer_category.dart
│   │   └── flyer_status.dart
│   └── models/
│       ├── flyer_model.dart
│       ├── flyer_model.g.dart
│       ├── merchant_model.dart
│       ├── merchant_model.g.dart
│       ├── flyer_list_response.dart
│       └── flyer_list_response.g.dart
└── features/
    └── flyers/
        └── data/
            └── flyer_api_service.dart
```

**FlyerCategory Enum**:
```dart
enum FlyerCategory {
  food,       // 음식
  fashion,    // 패션
  beauty,     // 뷰티
  education,  // 교육
  health,     // 건강
  entertainment, // 엔터테인먼트
  service,    // 서비스
  other;      // 기타
}
```

**FlyerStatus Enum**:
```dart
enum FlyerStatus {
  draft,            // 임시저장
  pendingApproval,  // 승인 대기
  approved,         // 승인됨
  rejected,         // 거부됨
  expired;          // 만료됨
}
```

**FlyerModel**:
```dart
class FlyerModel {
  final String id;
  final String merchantId;
  final String title;
  final String? description;
  final String imageUrl;
  final FlyerCategory category;
  final FlyerStatus status;
  final int targetRadius;
  final DateTime? startDate;
  final DateTime? endDate;
  final int viewCount;
  final int clickCount;
  final MerchantModel? merchant;
  final DateTime createdAt;
  final DateTime? expiresAt;

  // Computed properties
  bool get isExpired;
  bool get isActive_AndApproved;
  String get categoryDisplayName;
  String get statusDisplayName;
}
```

#### 2. API Service

**파일**: `frontend/lib/features/flyers/data/flyer_api_service.dart`

```dart
class FlyerApiService {
  // 위치 기반 조회
  Future<FlyerListResponse> getFlyersByLocation({
    required String h3Index,
    int radius = 1,
    int page = 1,
    int limit = 20,
  });

  // 검색
  Future<FlyerListResponse> searchFlyers({
    required String keyword,
    FlyerCategory? category,
    int page = 1,
    int limit = 20,
  });

  // 카테고리별 조회
  Future<FlyerListResponse> getFlyersByCategory({
    required FlyerCategory category,
    int page = 1,
    int limit = 20,
  });

  // 인기 전단지
  Future<List<FlyerModel>> getFeaturedFlyers({int limit = 10});

  // 상세 조회
  Future<FlyerModel> getFlyerById(String id);

  // Analytics 추적
  Future<void> trackFlyerView(String flyerId);
  Future<void> trackFlyerClick(String flyerId);
}
```

**응답 구조**:
```dart
class FlyerListResponse {
  final List<FlyerModel> data;
  final int total;
}
```

---

## 📊 데이터베이스 스키마 변경

### flyers 테이블 추가 컬럼

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

### analytics_events 테이블 (CORE-006)

전단지 관련 이벤트:
- `flyer_view`: 전단지 조회
- `flyer_click`: 전단지 클릭
- `flyer_search`: 전단지 검색 (향후 추가 가능)

---

## 🚀 API 사용 예제

### 1. 위치 기반 전단지 조회

```bash
GET /api/flyers/location/8a2a1005892ffff?radius=2&page=1&limit=20
Authorization: Bearer {JWT_TOKEN}
```

**응답**:
```json
{
  "data": [
    {
      "id": "uuid-1",
      "title": "신선한 과일 할인",
      "description": "모든 과일 20% 할인",
      "category": "food",
      "status": "approved",
      "imageUrl": "https://cdn.townin.kr/flyers/...",
      "viewCount": 120,
      "clickCount": 45,
      "targetRadius": 1000,
      "merchant": {
        "id": "merchant-uuid",
        "businessName": "타운마트",
        "gridCell": "8a2a100589dffff"
      },
      "createdAt": "2025-02-01T10:00:00Z",
      "expiresAt": "2025-02-28T23:59:59Z"
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

**응답**: Array of FlyerModel (조회수/클릭수 순)

### 5. 조회 추적

```bash
POST /api/flyers/{flyerId}/view
Authorization: Bearer {JWT_TOKEN}
```

**응답**:
```json
{
  "message": "View tracked"
}
```

---

## 🔗 모듈 통합

### Backend 모듈 의존성

```typescript
// FlyersModule
imports: [
  TypeOrmModule.forFeature([Flyer, FlyerProduct]),
  AnalyticsModule,  // Analytics 통합
]

providers: [
  FlyersService,
  FlyerAnalyticsListener,  // 이벤트 구독
]
```

### 기존 CORE 모듈과의 연동

| CORE 모듈 | 연동 내용 |
|-----------|----------|
| **CORE-001: Auth** | JWT 인증으로 API 보호 |
| **CORE-002: Geospatial** | H3 grid 기반 위치 필터링 (구현 예정) |
| **CORE-005: Files** | 전단지 이미지 S3/CloudFront 저장 |
| **CORE-006: Analytics** | 조회/클릭 이벤트 자동 추적 |

---

## 📝 다음 단계 (미구현)

### Flutter UI 구현

#### 1. 전단지 목록 화면
```dart
class FlyerListScreen extends StatefulWidget {
  // 기능:
  // - 위치 기반 전단지 표시
  // - 무한 스크롤 (페이지네이션)
  // - 카테고리 필터
  // - 검색 기능
  // - Pull to refresh
}
```

#### 2. 전단지 상세 화면
```dart
class FlyerDetailScreen extends StatelessWidget {
  // 기능:
  // - 전단지 이미지 확대
  // - 상인 정보 표시
  // - 클릭 추적
  // - 공유 기능
  // - 찜하기 (향후)
}
```

#### 3. BLoC/Cubit State Management
```dart
class FlyerBloc extends Bloc<FlyerEvent, FlyerState> {
  // Events:
  // - LoadFlyers
  // - SearchFlyers
  // - FilterByCategory
  // - LoadMore

  // States:
  // - FlyerInitial
  // - FlyerLoading
  // - FlyerLoaded
  // - FlyerError
}
```

### MVP 통합 테스트

#### 시나리오 1: 전단지 등록 → 조회
1. **상인**: 전단지 생성 (POST /api/flyers)
2. **관리자**: 전단지 승인 (PUT /api/flyers/:id - status: approved)
3. **사용자**: Flutter 앱에서 위치 기반 조회
4. **Analytics**: DAU/MAU, 조회수 확인

#### 시나리오 2: 검색 및 필터링
1. **사용자**: "할인" 키워드 검색
2. **사용자**: "음식" 카테고리 필터 적용
3. **Analytics**: 검색 이벤트 확인 (향후)

#### 시나리오 3: 상세 조회 및 Analytics
1. **사용자**: 전단지 클릭 → 상세 화면
2. **Backend**: `trackFlyerView()` 호출
3. **Backend**: `trackFlyerClick()` 호출
4. **Analytics**: `flyer_view`, `flyer_click` 이벤트 저장 확인

---

## 🧪 테스트 가이드

### Backend API 테스트 (curl)

#### 1. 전단지 생성 (Merchant)
```bash
POST http://localhost:3000/api/flyers
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

#### 2. 전단지 승인 (Admin)
```bash
PUT http://localhost:3000/api/flyers/{flyerId}
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "status": "approved"
}
```

#### 3. 사용자 조회
```bash
# 위치 기반
GET http://localhost:3000/api/flyers/location/8a2a1005892ffff

# 검색
GET http://localhost:3000/api/flyers/search?q=세일

# 카테고리
GET http://localhost:3000/api/flyers/category/fashion

# 인기
GET http://localhost:3000/api/flyers/featured
```

#### 4. Analytics 확인
```bash
GET http://localhost:3000/api/analytics/events/counts?startDate=2025-02-01&endDate=2025-02-07

# 확인 항목: flyer_view, flyer_click 이벤트 카운트
```

### Flutter 테스트 (향후)

```dart
// Unit Test
test('FlyerApiService.getFlyersByLocation', () async {
  final response = await service.getFlyersByLocation(
    h3Index: '8a2a1005892ffff',
    radius: 2,
  );

  expect(response.data, isNotEmpty);
  expect(response.data.first.status, FlyerStatus.approved);
});

// Widget Test
testWidgets('FlyerListScreen displays flyers', (tester) async {
  await tester.pumpWidget(MyApp());
  await tester.tap(find.text('전단지'));
  await tester.pumpAndSettle();

  expect(find.byType(FlyerCard), findsWidgets);
});
```

---

## 📚 참고 문서

### Backend 상세 문서
- `/backend/docs/USR-007-implementation-summary.md` - API 전체 문서
- `/backend/docs/CORE-004-006-implementation-summary.md` - Analytics 통합
- `/backend/docs/package-installation-guide.md` - 패키지 설치 가이드
- `/backend/docs/disk-space-requirements.md` - 디스크 공간 계산

### API 문서 (Swagger)
```bash
# 서버 시작 후
http://localhost:3000/api
```

---

## ✅ 구현 완료 체크리스트

### Backend
- [x] Flyer Entity 업데이트 (category, status, radius 등)
- [x] User-facing Service 메서드 (조회, 검색, 필터)
- [x] User-facing Controller 엔드포인트
- [x] Analytics 이벤트 통합 (FlyerAnalyticsListener)
- [x] FlyersModule 의존성 추가 (AnalyticsModule)
- [x] API 문서화 (Swagger)

### Frontend
- [x] Flyer 모델 및 enum 생성
- [x] Merchant 모델 생성
- [x] FlyerListResponse 모델 생성
- [x] JSON serialization 코드 (*.g.dart)
- [x] FlyerApiService 구현 (전체 API 연동)
- [ ] BLoC/Cubit State Management (미구현)
- [ ] 전단지 목록 화면 (미구현)
- [ ] 전단지 상세 화면 (미구현)
- [ ] 검색/필터 UI (미구현)

### MVP 통합
- [ ] E2E 테스트 시나리오 작성
- [ ] 상인 → 전단지 등록 플로우
- [ ] 관리자 → 승인 플로우
- [ ] 사용자 → Flutter 앱 조회 플로우
- [ ] Analytics 데이터 검증

---

## 🎉 결론

**완료된 작업**:
1. ✅ 백엔드 API 완전 구현 (USR-007)
2. ✅ Flutter 모델/서비스 기본 구조 구현
3. ✅ Analytics 통합 완료
4. ✅ 문서화 완료

**다음 작업**:
1. Flutter UI 구현 (목록, 상세, 검색)
2. State Management (BLoC/Cubit)
3. MVP 통합 테스트
4. 프로덕션 배포 준비

---

**작성일**: 2025-02-01
**작성자**: Claude Code
**버전**: 1.0.0
