# Epic: USR-002 - User Profile & Hub Management

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-002 |
| **Epic Title** | User Profile & Hub Management |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 5 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (User App) |
| **Category** | USR - User App |
| **Owner** | Mobile Team (Flutter) |

## Business Value

### Problem Statement
사용자는 온보딩 후에도 프로필 정보를 수정하거나, 3-Hub 위치를 변경/추가해야 할 수 있습니다. 이사, 이직, 가족 이동 등 생활 변화에 따라 위치 정보를 쉽게 관리할 수 있어야 서비스 활용도가 유지됩니다.

### Business Value
- **사용자 유지**: 위치 변경 시 서비스 이탈 방지
- **데이터 정확도**: 최신 위치 정보로 정확한 전단지 노출
- **프로필 완성도**: 프로필 사진, 닉네임 등으로 커뮤니티 참여 유도
- **개인화**: 알림 설정, 관심 카테고리로 맞춤 서비스 제공

### Target Users
- **일반 사용자**: 프로필 수정, 위치 관리
- **활성 사용자**: 프로필 사진, 닉네임 설정으로 커뮤니티 참여

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 프로필 완성도 | ≥ 70% | 프로필 사진 + 닉네임 설정 비율 |
| 위치 변경 성공률 | ≥ 95% | 위치 변경 시도 대비 성공 비율 |
| 설정 페이지 방문율 | ≥ 30% | 월 1회 이상 설정 페이지 방문 |
| 프로필 사진 업로드율 | ≥ 40% | 사용자 중 프로필 사진 설정 비율 |

## Epic Scope

### In Scope
✅ **프로필 관리**
- 프로필 조회 (내 정보 화면)
- 프로필 수정 (이름, 닉네임, 프로필 사진)
- 프로필 사진 업로드
- 이메일/전화번호 변경

✅ **3-Hub 위치 관리**
- 위치 목록 조회
- 위치 추가 (최대 3개)
- 위치 수정
- 위치 삭제
- 주 활동 지역 설정

✅ **계정 설정**
- 비밀번호 변경
- 알림 설정 (카테고리별 ON/OFF)
- 야간 알림 차단 설정
- 언어 설정 (한국어/영어)

✅ **계정 관리**
- 로그아웃
- 회원 탈퇴
- 연결된 소셜 계정 확인

### Out of Scope
❌ 친구 관리 (팔로우/팔로잉) - Phase 2
❌ 활동 내역 (전단지 조회 이력) - Phase 2
❌ 포인트 내역 - USR-009 (별도 Epic)
❌ 관심 카테고리 설정 - Phase 2

## User Stories

### Story 2.1: 내 정보 화면
**As a** 사용자
**I want to** 내 프로필 정보를 조회하고
**So that** 현재 설정된 정보를 확인할 수 있다

**Acceptance Criteria:**
- [ ] 프로필 사진 (기본 아바타 or 업로드한 이미지)
- [ ] 이름, 닉네임
- [ ] 이메일, 전화번호
- [ ] 가입 날짜, 회원 등급 (일반/VIP - Phase 3)
- [ ] 등록된 3-Hub 위치 미리보기
- [ ] "프로필 수정" 버튼

**Tasks:**
- [ ] ProfileScreen 위젯 작성
- [ ] GET /api/auth/me API 호출
- [ ] 프로필 정보 UI 디자인
- [ ] 캐싱 (로컬 저장 + 서버 동기화)

**Story Points:** 3

---

### Story 2.2: 프로필 사진 업로드
**As a** 사용자
**I want to** 프로필 사진을 업로드하고
**So that** 나를 나타내는 이미지를 설정할 수 있다

**Acceptance Criteria:**
- [ ] "사진 변경" 버튼 클릭
- [ ] 2가지 옵션: "갤러리에서 선택", "카메라로 촬영"
- [ ] 이미지 크롭 (1:1 정사각형)
- [ ] 업로드 진행률 표시
- [ ] 업로드 성공 시 즉시 반영

**Tasks:**
- [ ] image_picker 패키지 사용
- [ ] image_cropper 패키지 사용
- [ ] POST /api/files/presigned-url → S3 업로드
- [ ] PATCH /api/auth/me (profileImageUrl 업데이트)

**Story Points:** 5

---

### Story 2.3: 프로필 수정
**As a** 사용자
**I want to** 이름, 닉네임, 전화번호를 수정하고
**So that** 최신 정보를 유지할 수 있다

**Acceptance Criteria:**
- [ ] 수정 가능 필드: 이름, 닉네임, 전화번호
- [ ] 실시간 검증 (닉네임 중복 확인)
- [ ] "저장" 버튼
- [ ] 저장 성공 시 토스트 메시지

**Tasks:**
- [ ] EditProfileScreen 위젯 작성
- [ ] Form Validation
- [ ] PATCH /api/auth/me API 호출
- [ ] 닉네임 중복 확인 API (GET /api/users/check-nickname?nickname=...)

**Story Points:** 3

---

### Story 2.4: 3-Hub 위치 목록 조회
**As a** 사용자
**I want to** 등록된 위치 목록을 보고
**So that** 어떤 위치가 설정되어 있는지 확인할 수 있다

**Acceptance Criteria:**
- [ ] 위치 카드 UI (거주지, 직장, 가족집)
- [ ] 각 위치: 타입, 주소, 지도 미리보기
- [ ] "위치 추가" 버튼 (최대 3개 제한)
- [ ] 각 위치 카드에 "수정", "삭제" 버튼
- [ ] 주 활동 지역 표시 (별 아이콘)

**Tasks:**
- [ ] LocationListScreen 위젯 작성
- [ ] GET /api/users/me/locations API 호출
- [ ] 위치 카드 UI 컴포넌트

**Story Points:** 3

---

### Story 2.5: 위치 추가
**As a** 사용자
**I want to** 새로운 위치를 추가하고
**So that** 최대 3곳의 위치를 관리할 수 있다

**Acceptance Criteria:**
- [ ] 온보딩과 동일한 위치 등록 UI 재사용
- [ ] 최대 3개 제한 (이미 3개면 "추가" 버튼 비활성화)
- [ ] 위치 타입 선택 (거주지/직장/가족집)
- [ ] 주소 검색 or GPS or 지도 선택

**Tasks:**
- [ ] LocationRegistrationScreen 재사용
- [ ] POST /api/users/me/locations API 호출
- [ ] 최대 3개 제한 검증

**Story Points:** 2

---

### Story 2.6: 위치 수정
**As a** 사용자
**I want to** 기존 위치를 수정하고
**So that** 이사나 이직 시 정보를 업데이트할 수 있다

**Acceptance Criteria:**
- [ ] 위치 카드에서 "수정" 버튼 클릭
- [ ] 현재 위치 정보 미리 채워짐
- [ ] 주소 변경 가능
- [ ] 저장 시 즉시 반영

**Tasks:**
- [ ] PATCH /api/users/me/locations/:id API 호출
- [ ] 위치 수정 UI (LocationRegistrationScreen 재사용)

**Story Points:** 2

---

### Story 2.7: 위치 삭제
**As a** 사용자
**I want to** 불필요한 위치를 삭제하고
**So that** 관리하기 쉽게 위치를 정리할 수 있다

**Acceptance Criteria:**
- [ ] 위치 카드에서 "삭제" 버튼 클릭
- [ ] 삭제 확인 다이얼로그 ("정말 삭제하시겠습니까?")
- [ ] 삭제 성공 시 목록에서 제거
- [ ] 최소 1개는 남아야 함 (모두 삭제 불가)

**Tasks:**
- [ ] DELETE /api/users/me/locations/:id API 호출
- [ ] 삭제 확인 다이얼로그 UI
- [ ] 최소 1개 제한 로직

**Story Points:** 2

---

### Story 2.8: 비밀번호 변경
**As a** 사용자
**I want to** 비밀번호를 변경하고
**So that** 계정 보안을 유지할 수 있다

**Acceptance Criteria:**
- [ ] 현재 비밀번호 입력
- [ ] 새 비밀번호 입력 (최소 8자, 영문+숫자+특수문자)
- [ ] 새 비밀번호 확인
- [ ] 실시간 검증 (비밀번호 일치 확인)
- [ ] 변경 성공 시 로그아웃 (재로그인 필요)

**Tasks:**
- [ ] ChangePasswordScreen 위젯 작성
- [ ] POST /api/auth/change-password API 호출
- [ ] 비밀번호 검증 로직

**Story Points:** 3

---

### Story 2.9: 알림 설정
**As a** 사용자
**I want to** 알림 수신 여부를 설정하고
**So that** 원하는 알림만 받을 수 있다

**Acceptance Criteria:**
- [ ] 카테고리별 알림 ON/OFF 토글
  - 전단지 알림
  - 포인트 적립 알림
  - 시스템 공지
  - 가족 돌봄 알림 (Phase 2)
- [ ] 야간 알림 차단 (22:00 ~ 08:00)
- [ ] 야간 시간대 커스터마이징
- [ ] 저장 시 즉시 반영

**Tasks:**
- [ ] NotificationSettingsScreen 위젯 작성
- [ ] GET /api/users/me/notification-preferences
- [ ] PATCH /api/users/me/notification-preferences

**Story Points:** 3

---

### Story 2.10: 회원 탈퇴
**As a** 사용자
**I want to** 계정을 삭제하고
**So that** 더 이상 서비스를 이용하지 않을 수 있다

**Acceptance Criteria:**
- [ ] "회원 탈퇴" 버튼 (설정 최하단)
- [ ] 탈퇴 사유 선택 (선택 사항)
- [ ] 탈퇴 확인 다이얼로그 (경고 문구)
- [ ] 비밀번호 재확인
- [ ] 탈퇴 성공 시 로그인 화면으로 이동
- [ ] 탈퇴 후 30일간 데이터 보관 (복구 가능)

**Tasks:**
- [ ] DeleteAccountScreen 위젯 작성
- [ ] POST /api/auth/delete-account API 호출
- [ ] 탈퇴 확인 다이얼로그 UI

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Framework**: Flutter 3.x
- **State Management**: Riverpod
- **Image Handling**: image_picker, image_cropper
- **Local Storage**: SharedPreferences, flutter_secure_storage
- **HTTP Client**: Dio

### Architecture Decisions

#### 1. 프로필 데이터 캐싱
**Decision**: Local Storage + Server Sync

**Rationale**:
- **오프라인 지원**: 네트워크 없어도 프로필 조회 가능
- **성능**: 빠른 화면 로딩
- **동기화**: 앱 시작 시 서버와 동기화

**구현**:
```dart
// 캐시 우선, 백그라운드 동기화
Future<User> getProfile() async {
  // 1. 캐시에서 먼저 로드
  final cachedUser = await _loadFromCache();

  // 2. 백그라운드에서 서버 데이터 가져오기
  _syncFromServer().then((serverUser) {
    if (serverUser != cachedUser) {
      _saveToCache(serverUser);
      _notifyListeners(serverUser);
    }
  });

  return cachedUser;
}
```

#### 2. 프로필 사진 업로드 전략
**Decision**: Presigned URL + S3 Direct Upload

**Rationale**:
- **속도**: 서버를 거치지 않아 빠름
- **서버 부하**: 서버 대역폭 절약
- **확장성**: S3 무제한 스토리지

### Database Schema (Backend)

#### User Table 확장
```sql
-- 기존 User 테이블에 추가 컬럼
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN profile_image_url TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'ko';

CREATE INDEX idx_users_nickname ON users(nickname);
```

### API Endpoints

#### Profile APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/auth/me` | 내 정보 조회 | Yes | All |
| PATCH | `/api/auth/me` | 프로필 수정 | Yes | All |
| POST | `/api/auth/change-password` | 비밀번호 변경 | Yes | All |
| POST | `/api/auth/delete-account` | 회원 탈퇴 | Yes | All |
| GET | `/api/users/check-nickname?nickname=홍길동` | 닉네임 중복 확인 | No | - |

#### Location APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users/me/locations` | 위치 목록 조회 | Yes | user, merchant |
| POST | `/api/users/me/locations` | 위치 추가 | Yes | user, merchant |
| PATCH | `/api/users/me/locations/:id` | 위치 수정 | Yes | user, merchant |
| DELETE | `/api/users/me/locations/:id` | 위치 삭제 | Yes | user, merchant |
| PATCH | `/api/users/me/locations/:id/primary` | 주 활동 지역 설정 | Yes | user, merchant |

#### Notification Preference APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users/me/notification-preferences` | 알림 설정 조회 | Yes | All |
| PATCH | `/api/users/me/notification-preferences` | 알림 설정 수정 | Yes | All |

### Request/Response Examples

#### PATCH /api/auth/me
**Request:**
```json
{
  "name": "홍길동",
  "nickname": "타운인마스터",
  "phone": "010-1234-5678",
  "profileImageUrl": "https://cdn.townin.kr/users/2025/02/uuid.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "nickname": "타운인마스터",
  "phone": "010-1234-5678",
  "profileImageUrl": "https://cdn.townin.kr/users/2025/02/uuid.jpg",
  "role": "user",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### GET /api/users/me/locations
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "location-uuid-1",
      "locationType": "home",
      "location": {
        "type": "Point",
        "coordinates": [126.9780, 37.5665]
      },
      "address": {
        "full": "서울특별시 종로구 세종대로 209",
        "city": "서울특별시",
        "district": "종로구",
        "neighborhood": "세종로"
      },
      "isPrimary": true,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "location-uuid-2",
      "locationType": "work",
      "location": {
        "type": "Point",
        "coordinates": [127.0276, 37.4979]
      },
      "address": {
        "full": "서울특별시 강남구 테헤란로 152",
        "city": "서울특별시",
        "district": "강남구",
        "neighborhood": "역삼동"
      },
      "isPrimary": false,
      "createdAt": "2025-01-15T10:05:00Z"
    }
  ]
}
```

#### PATCH /api/users/me/notification-preferences
**Request:**
```json
{
  "flyerEnabled": true,
  "pointsEnabled": true,
  "systemEnabled": false,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

**Response (200 OK):**
```json
{
  "id": "preference-uuid",
  "userId": "user-uuid",
  "flyerEnabled": true,
  "pointsEnabled": true,
  "systemEnabled": false,
  "careEnabled": true,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "updatedAt": "2025-02-01T10:00:00Z"
}
```

### Screen Flow
```
설정 화면
├── 내 정보
│   ├── 프로필 사진 변경
│   ├── 프로필 수정
│   └── 비밀번호 변경
├── 내 위치 관리
│   ├── 위치 목록
│   ├── 위치 추가
│   ├── 위치 수정
│   └── 위치 삭제
├── 알림 설정
│   ├── 카테고리별 알림
│   └── 야간 알림 차단
├── 계정
│   ├── 로그아웃
│   └── 회원 탈퇴
└── 앱 정보
    ├── 버전 정보
    ├── 이용약관
    └── 개인정보처리방침
```

### State Management (Riverpod)
```dart
// user_profile_provider.dart
final userProfileProvider = StateNotifierProvider<UserProfileNotifier, AsyncValue<User>>((ref) {
  return UserProfileNotifier(ref.read(apiServiceProvider));
});

class UserProfileNotifier extends StateNotifier<AsyncValue<User>> {
  UserProfileNotifier(this._apiService) : super(const AsyncValue.loading()) {
    loadProfile();
  }

  final ApiService _apiService;

  Future<void> loadProfile() async {
    state = const AsyncValue.loading();
    try {
      final user = await _apiService.getProfile();
      state = AsyncValue.data(user);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateProfile({
    String? name,
    String? nickname,
    String? phone,
    String? profileImageUrl,
  }) async {
    try {
      final updatedUser = await _apiService.updateProfile(
        name: name,
        nickname: nickname,
        phone: phone,
        profileImageUrl: profileImageUrl,
      );
      state = AsyncValue.data(updatedUser);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
}
```

## Testing Strategy

### Unit Tests
- [ ] UserProfileNotifier 상태 관리 테스트
- [ ] 닉네임 검증 로직 테스트
- [ ] 비밀번호 검증 로직 테스트

### Widget Tests
- [ ] ProfileScreen UI 테스트
- [ ] EditProfileScreen Form Validation 테스트
- [ ] LocationListScreen 위치 카드 렌더링 테스트

### Integration Tests
- [ ] 프로필 수정 플로우 (수정 → 저장 → 확인)
- [ ] 위치 추가/수정/삭제 플로우
- [ ] 프로필 사진 업로드 플로우

## Deployment Checklist

### Pre-Deployment
- [ ] S3 버킷 권한 확인 (프로필 사진 업로드)
- [ ] 닉네임 중복 확인 API 성능 테스트
- [ ] 회원 탈퇴 플로우 테스트

### Deployment
- [ ] Android/iOS 빌드
- [ ] 프로필 완성도 추적 Analytics 설정

### Post-Deployment
- [ ] 프로필 완성도 모니터링
- [ ] 위치 변경 성공률 모니터링
- [ ] 회원 탈퇴 사유 분석

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 프로필 사진 업로드 실패 | Medium | Medium | 재시도 버튼, 이미지 압축 |
| 닉네임 중복 확인 지연 | Low | Medium | Debouncing (500ms 지연 후 API 호출) |
| 위치 삭제 시 데이터 손실 | Medium | Low | Soft Delete (30일 후 영구 삭제) |
| 회원 탈퇴 후 복구 요청 | Medium | Low | 30일 보관, 복구 API 제공 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System
- **CORE-002**: Geospatial Data Infrastructure (위치 관리)
- **CORE-005**: File Upload & CDN (프로필 사진)
- **USR-001**: User Onboarding

### Blocks (Dependent Epics)
- All other User App Epics (프로필/위치 정보 사용)

## Related Epics

- **USR-001**: User Onboarding (최초 위치 등록)
- **USR-009**: User Points & Rewards (포인트 내역)

## Future Enhancements

### Phase 2
- 프로필 뱃지 시스템 (활동 레벨)
- 친구 관리 (팔로우/팔로잉)
- 활동 내역 (전단지 조회, 댓글)
- 관심 카테고리 설정

### Phase 3
- AI 기반 프로필 추천 (닉네임, 사진)
- 소셜 그래프 (친구 추천)
- 프로필 공개/비공개 설정

### Phase 4
- 다국어 프로필 (영어, 베트남어, 일본어)
- 블록체인 기반 프로필 인증

## Notes

### 프로필 완성도 계산
```dart
int calculateProfileCompleteness(User user) {
  int score = 0;

  if (user.name != null && user.name!.isNotEmpty) score += 20;
  if (user.nickname != null) score += 20;
  if (user.profileImageUrl != null) score += 30;
  if (user.phone != null) score += 10;
  if (user.locations.length >= 3) score += 20;

  return score; // 0-100
}
```

### Flutter Packages
```yaml
dependencies:
  image_picker: ^1.0.0
  image_cropper: ^5.0.0
  cached_network_image: ^3.3.0
  flutter_riverpod: ^2.4.0
```

### References
- Flutter Image Picker: https://pub.dev/packages/image_picker
- Flutter Image Cropper: https://pub.dev/packages/image_cropper
- Material Design - User Profile: https://m3.material.io/
