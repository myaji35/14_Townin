# 기능 3-4 구현 완료

## ✅ 완료된 작업 요약

### 작업 3: Firebase Cloud Messaging 설정 ✅

#### Flutter 앱

**1. Firebase 패키지 추가** (`frontend/pubspec.yaml`)
- firebase_core: ^2.24.2
- firebase_messaging: ^14.7.10
- flutter_local_notifications: ^16.3.0

**2. NotificationService 생성** (`frontend/lib/core/services/notification_service.dart`)
- 싱글톤 패턴으로 구현
- FCM 초기화 및 권한 요청
- FCM 토큰 관리 (저장, 갱신 감지)
- Foreground 메시지 핸들러
- Background 메시지 핸들러
- 로컬 알림 표시
- 토픽 구독/구독 해제
- 백엔드로 토큰 전송

**3. main.dart 업데이트**
- Firebase 초기화 (`await Firebase.initializeApp()`)
- NotificationService 초기화
- Background 메시지 핸들러 등록

#### 백엔드 API

**1. User 엔티티 업데이트** (`backend/src/modules/users/user.entity.ts`)
- fcmToken 필드 추가

**2. FCM 토큰 관리 API 생성**
- UsersService (`backend/src/modules/users/users.service.ts`)
  - updateFcmToken(): FCM 토큰 저장
  - removeFcmToken(): FCM 토큰 삭제
  - findById(): 사용자 조회

- UsersController (`backend/src/modules/users/users.controller.ts`)
  - PUT /api/v1/users/fcm-token - FCM 토큰 저장
  - DELETE /api/v1/users/fcm-token - FCM 토큰 삭제

**3. 데이터베이스 마이그레이션**
- users 테이블에 fcm_token 컬럼 추가
- fcm_token 인덱스 생성

---

### 작업 4: 오프라인 모드 구현 ✅

#### Flutter 앱

**1. DatabaseHelper 생성** (`frontend/lib/core/database/database_helper.dart`)
- SQLite 데이터베이스 초기화
- 싱글톤 패턴
- 3개 테이블 생성:
  - flyers: 전단지 캐시
  - flyer_products: 전단지 상품 캐시
  - safety_facilities: 안전 시설 캐시
- 인덱스 생성으로 조회 성능 최적화
- 캐시 관리 메서드 (clearCache, clearExpiredFlyers)

**2. FlyerCacheRepository 생성** (`frontend/lib/features/flyer/data/flyer_cache_repository.dart`)
- 전단지 데이터 캐싱
- 캐시된 전단지 조회
- 캐시 유효성 검사 (1시간 기준)
- 전단지별 상품 정보 함께 저장/조회

**3. FlyerRepository 업데이트** (`frontend/lib/features/flyer/data/flyer_repository.dart`)
- 오프라인 우선(Offline-First) 패턴 구현
- getAllFlyers(): API 실패 시 캐시 반환
- getFlyerById(): API 실패 시 캐시 반환
- 네트워크 오류 감지 및 자동 캐시 전환

**4. ConnectivityService 생성** (`frontend/lib/core/services/connectivity_service.dart`)
- 네트워크 연결 상태 모니터링
- 30초마다 자동 연결 확인
- 연결 상태 변경 이벤트 스트림
- 온라인/오프라인 전환 감지

---

## 📱 구현된 기능 상세

### Firebase Cloud Messaging

#### 알림 처리 흐름

```
1. Foreground (앱 실행 중)
   └─> FirebaseMessaging.onMessage
       └─> _handleForegroundMessage()
           └─> _showLocalNotification() (로컬 알림 표시)

2. Background (앱 백그라운드)
   └─> firebaseMessagingBackgroundHandler (top-level 함수)
       └─> 시스템 알림 자동 표시

3. Terminated (앱 종료 상태)
   └─> getInitialMessage()
       └─> _handleNotificationTap() (앱 열림)
```

#### FCM 토큰 관리

```dart
// 1. 앱 시작 시 토큰 가져오기
_fcmToken = await _firebaseMessaging.getToken();

// 2. 토큰 갱신 감지
_firebaseMessaging.onTokenRefresh.listen((newToken) {
  _fcmToken = newToken;
  // 백엔드에 새 토큰 전송
});

// 3. 백엔드로 토큰 전송
await NotificationService().sendTokenToBackend(authToken);
```

#### 알림 채널 설정

- 채널 ID: `townin_channel`
- 채널 이름: `Townin Notifications`
- 중요도: High (헤드업 알림)
- 우선순위: High

---

### 오프라인 모드

#### 오프라인 우선(Offline-First) 패턴

```
1. 데이터 요청
   ↓
2. API 호출 시도
   ↓
3. 성공?
   ├─ Yes → 데이터 반환 + 캐시 저장
   └─ No  → 네트워크 오류?
             ├─ Yes → 캐시에서 데이터 반환
             └─ No  → 에러 처리
```

#### 데이터베이스 스키마

**flyers 테이블**
```sql
CREATE TABLE flyers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT,
  merchant_name TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  valid_from TEXT,
  valid_until TEXT,
  grid_cell TEXT,
  created_at TEXT,
  cached_at TEXT
)
```

**flyer_products 테이블**
```sql
CREATE TABLE flyer_products (
  id TEXT PRIMARY KEY,
  flyer_id TEXT,
  product_name TEXT,
  price REAL,
  original_price REAL,
  promotion TEXT,
  category TEXT,
  display_order INTEGER,
  FOREIGN KEY (flyer_id) REFERENCES flyers (id) ON DELETE CASCADE
)
```

**safety_facilities 테이블**
```sql
CREATE TABLE safety_facilities (
  id TEXT PRIMARY KEY,
  facility_type TEXT,
  name TEXT,
  latitude REAL,
  longitude REAL,
  grid_cell TEXT,
  is_active INTEGER DEFAULT 1,
  cached_at TEXT
)
```

#### 캐시 관리 전략

1. **캐시 유효 기간**: 1시간
2. **자동 캐시**: API 호출 성공 시 자동 저장
3. **만료된 전단지 정리**: `clearExpiredFlyers()` 메서드
4. **전체 캐시 초기화**: `clearCache()` 메서드

---

## 📂 생성된 파일 목록

### 백엔드

```
backend/src/modules/users/
├── user.entity.ts (수정 - fcmToken 필드 추가)
├── users.service.ts (신규)
├── users.controller.ts (신규)
├── users.module.ts (수정)
└── dto/
    └── update-fcm-token.dto.ts (신규)

backend/scripts/
└── add-fcm-token-column.sql (신규)
```

### Flutter

```
frontend/lib/core/
├── services/
│   ├── notification_service.dart (신규)
│   └── connectivity_service.dart (신규)
└── database/
    └── database_helper.dart (신규)

frontend/lib/features/flyer/data/
├── flyer_repository.dart (수정 - 오프라인 지원)
└── flyer_cache_repository.dart (신규)

frontend/lib/main.dart (수정 - Firebase 초기화)
frontend/pubspec.yaml (수정 - 패키지 추가)
```

### 문서

```
FIREBASE_SETUP.md (신규)
FEATURES_3_4_COMPLETE.md (신규)
```

---

## 🚀 사용 방법

### 1. 백엔드 서버 실행

```bash
cd backend
npm install
npm run start:dev
```

데이터베이스 마이그레이션이 자동으로 실행됩니다.

### 2. Flutter 앱 실행

```bash
cd frontend
flutter pub get
flutter run
```

### 3. Firebase 설정 (필수)

Firebase를 사용하려면 추가 설정이 필요합니다.
자세한 내용은 `FIREBASE_SETUP.md` 참조.

**요약:**
1. Firebase Console에서 프로젝트 생성
2. Android/iOS 앱 등록
3. 설정 파일 다운로드 (`google-services.json`, `GoogleService-Info.plist`)
4. 플랫폼 폴더 생성: `flutter create --platforms=android,ios .`
5. 설정 파일을 적절한 위치에 복사

### 4. 로그인 후 FCM 토큰 전송

로그인 성공 후 FCM 토큰을 백엔드로 전송:

```dart
final authToken = loginResponse['accessToken'];
await NotificationService().sendTokenToBackend(authToken);
```

---

## 🧪 테스트 시나리오

### FCM 테스트

1. **앱에서 FCM 토큰 확인**
   - 앱 실행 후 콘솔 로그 확인
   - `FCM Token: xxxxx` 형식으로 출력됨

2. **Firebase Console에서 테스트 알림 보내기**
   - Firebase Console → Cloud Messaging
   - "새 알림" 클릭
   - 제목, 내용 입력
   - "테스트 메시지 보내기"
   - FCM 토큰 입력 후 전송

3. **알림 수신 확인**
   - Foreground: 로컬 알림 표시
   - Background: 시스템 알림 표시
   - Terminated: 알림 탭하면 앱 열림

### 오프라인 모드 테스트

1. **정상 상태에서 데이터 로드**
   ```
   앱 실행 → 전단지 목록 조회 → API 호출 → 캐시 저장
   ```

2. **오프라인 상태로 전환**
   - 기기 비행기 모드 활성화
   - 또는 백엔드 서버 중지

3. **캐시된 데이터 확인**
   ```
   앱 재시작 → 전단지 목록 조회 → 캐시에서 로드
   콘솔: "Network error, loading from cache..."
   ```

4. **온라인 복귀**
   - 비행기 모드 해제
   - ConnectivityService가 자동으로 감지
   - 콘솔: "Connection restored"

---

## 🎯 API 엔드포인트

### FCM 토큰 관리

```
PUT    /api/v1/users/fcm-token
DELETE /api/v1/users/fcm-token
```

**요청 예시:**

```bash
# FCM 토큰 저장
curl -X PUT http://localhost:3000/api/v1/users/fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "FCM_TOKEN_HERE"}'

# 응답
{
  "message": "FCM token updated successfully",
  "fcmToken": "FCM_TOKEN_HERE"
}
```

```bash
# FCM 토큰 삭제
curl -X DELETE http://localhost:3000/api/v1/users/fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 응답
{
  "message": "FCM token removed successfully"
}
```

---

## 📊 데이터 흐름

### 전단지 조회 (온라인)

```
UserDashboard
  ↓ (getAllFlyers)
FlyerRepository
  ↓ (API 호출)
Backend API
  ↓ (응답)
FlyerRepository
  ↓ (캐시 저장)
FlyerCacheRepository
  ↓ (SQLite 저장)
Database
  ↓ (데이터 반환)
UserDashboard (화면 표시)
```

### 전단지 조회 (오프라인)

```
UserDashboard
  ↓ (getAllFlyers)
FlyerRepository
  ↓ (API 호출 시도)
Backend API (연결 실패)
  ↓ (네트워크 오류 감지)
FlyerRepository
  ↓ (캐시 조회)
FlyerCacheRepository
  ↓ (SQLite 조회)
Database
  ↓ (캐시된 데이터 반환)
UserDashboard (화면 표시 + "오프라인" 표시)
```

---

## 🔧 추가 개선 사항 (선택)

### 1. 연결 상태 UI 표시

UserDashboard에 연결 상태 배너 추가:

```dart
class _UserDashboardState extends State<UserDashboard> {
  final _connectivityService = ConnectivityService();

  @override
  void initState() {
    super.initState();
    _connectivityService.onConnectivityChanged.listen((isOnline) {
      if (!isOnline) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('오프라인 모드 - 캐시된 데이터를 표시합니다'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });
  }
}
```

### 2. 캐시 크기 제한

DatabaseHelper에 캐시 크기 제한 추가:

```dart
Future<void> limitCacheSize(int maxSizeBytes) async {
  final size = await getDatabaseSize();
  if (size > maxSizeBytes) {
    await clearCache();
  }
}
```

### 3. 백그라운드 동기화

ConnectivityService에서 온라인 복귀 시 자동 동기화:

```dart
_statusController.stream.listen((isOnline) {
  if (isOnline) {
    // 캐시 갱신
    FlyerRepository().getAllFlyers();
  }
});
```

### 4. 푸시 알림 네비게이션

NotificationService에 알림 타입별 화면 이동:

```dart
void _handleNotificationTap(RemoteMessage message) {
  final type = message.data['type'];
  final id = message.data['id'];

  if (type == 'flyer') {
    // Navigate to FlyerDetailScreen
    navigatorKey.currentState?.push(
      MaterialPageRoute(
        builder: (context) => FlyerDetailScreen(flyerId: id),
      ),
    );
  }
}
```

---

## 🐛 문제 해결

### Firebase 초기화 오류

**문제**: `[core/no-app] No Firebase App '[DEFAULT]' has been created`

**해결**:
1. `google-services.json` / `GoogleService-Info.plist` 파일 확인
2. `flutter clean && flutter pub get` 실행
3. 앱 재빌드

### SQLite 오류

**문제**: `DatabaseException: no such table: flyers`

**해결**:
1. 앱 삭제 후 재설치
2. 또는 데이터베이스 버전 변경:
```dart
return await openDatabase(
  path,
  version: 2, // 버전 증가
  onCreate: _onCreate,
  onUpgrade: _onUpgrade,
);
```

### 캐시가 작동하지 않음

**문제**: 오프라인 상태에서 데이터가 표시되지 않음

**해결**:
1. 먼저 온라인 상태에서 데이터 로드 (캐시 생성)
2. 로그 확인: "Network error, loading from cache..."
3. 캐시 확인: `FlyerCacheRepository().getCachedFlyers()`

---

## ✅ 완료 체크리스트

- [x] Firebase 패키지 추가
- [x] NotificationService 생성
- [x] Firebase 초기화
- [x] FCM 토큰 관리 API
- [x] DatabaseHelper 생성
- [x] FlyerCacheRepository 생성
- [x] 오프라인 우선 패턴 구현
- [x] ConnectivityService 생성
- [x] 문서 작성

---

## 📚 참고 자료

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [FlutterFire](https://firebase.flutter.dev/)
- [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications)
- [sqflite](https://pub.dev/packages/sqflite)
- [Offline-First Architecture](https://www.infoq.com/articles/offline-first-architecture/)

---

## 🎉 작업 3-4 완료!

모든 기능이 성공적으로 구현되었습니다!

**다음 단계:**
1. Firebase 프로젝트 생성 및 설정
2. 플랫폼별 설정 완료 (Android/iOS)
3. 실제 기기에서 FCM 테스트
4. 오프라인 모드 테스트
5. 프로덕션 배포 준비

---

## 💡 팁

1. **개발 중**: `print()` 로그를 활용하여 FCM 토큰 및 네트워크 상태 모니터링
2. **테스트**: Firebase Console의 "테스트 메시지 보내기" 기능 활용
3. **디버깅**: Flutter DevTools로 SQLite 데이터 확인
4. **성능**: 캐시 유효 기간을 프로젝트 요구사항에 맞게 조정
5. **보안**: FCM 서버 키는 환경 변수로 관리
