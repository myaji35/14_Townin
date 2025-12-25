# Townin Flutter App Setup Guide

## 프로젝트 초기화

### 1. Flutter 프로젝트 생성

```bash
cd townin-platform
flutter create townin_app
cd townin_app
```

### 2. 필수 패키지 설치

`pubspec.yaml`에 다음 dependencies 추가:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP & API
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2

  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0

  # Maps & Location
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1

  # Utils
  intl: ^0.18.1
  logger: ^2.0.2+1
  equatable: ^2.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.7
  retrofit_generator: ^8.0.4
  json_serializable: ^6.7.1
  riverpod_generator: ^2.3.9

  # Linting
  flutter_lints: ^3.0.1
```

### 3. 코드 생성 실행

```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

## 프로젝트 구조

```
townin_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart              # Dio 설정
│   │   │   ├── api_interceptor.dart         # JWT 인터셉터
│   │   │   └── endpoints.dart               # API 엔드포인트
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   └── app_strings.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── utils/
│   │       ├── logger.dart
│   │       └── validators.dart
│   │
│   ├── data/
│   │   ├── models/                          # JSON 모델
│   │   │   ├── user_model.dart
│   │   │   ├── flyer_model.dart
│   │   │   ├── merchant_model.dart
│   │   │   └── point_model.dart
│   │   ├── repositories/                    # Repository 패턴
│   │   │   ├── auth_repository.dart
│   │   │   ├── user_repository.dart
│   │   │   ├── flyer_repository.dart
│   │   │   └── points_repository.dart
│   │   └── services/                        # Retrofit API Services
│   │       ├── auth_service.dart
│   │       ├── user_service.dart
│   │       ├── flyer_service.dart
│   │       └── points_service.dart
│   │
│   ├── domain/
│   │   ├── entities/                        # 도메인 엔티티
│   │   └── usecases/                        # 비즈니스 로직
│   │
│   ├── presentation/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── register_screen.dart
│   │   │   └── providers/
│   │   │       └── auth_provider.dart
│   │   │
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   ├── widgets/
│   │   │   └── providers/
│   │   │
│   │   ├── map/
│   │   │   ├── safety_map_screen.dart
│   │   │   ├── widgets/
│   │   │   └── providers/
│   │   │
│   │   ├── flyer/
│   │   │   ├── flyer_list_screen.dart
│   │   │   ├── flyer_detail_screen.dart
│   │   │   └── providers/
│   │   │
│   │   ├── points/
│   │   │   ├── points_screen.dart
│   │   │   └── providers/
│   │   │
│   │   └── merchant/
│   │       ├── merchant_dashboard_screen.dart
│   │       ├── flyer_create_screen.dart
│   │       ├── signboard_screen.dart
│   │       └── providers/
│   │
│   └── shared/
│       ├── widgets/                         # 공통 위젯
│       │   ├── loading_indicator.dart
│       │   ├── error_widget.dart
│       │   └── custom_button.dart
│       └── extensions/
│           └── context_extension.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── test/
    ├── unit/
    ├── widget/
    └── integration/
```

## 핵심 파일 구현

### 1. API Client (`lib/core/api/api_client.dart`)

이미 생성된 파일 사용

### 2. Auth Service (`lib/data/services/auth_service.dart`)

이미 생성된 파일 사용

### 3. Main App (`lib/app.dart`)

이미 생성된 파일 사용

### 4. 환경 설정

`.env` 파일 생성:

```
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Phase 1 필수 화면

### 사용자 앱
1. ✅ 로그인/회원가입
2. ✅ 홈 대시보드
3. ✅ 안전 지도 (CCTV, 주차장, 대피소)
4. ✅ 디지털 전단지 뷰어
5. ✅ 포인트 적립 화면
6. ✅ 사용자 허브 관리 (거주지, 직장, 본가)

### 판매자 앱
1. ✅ 판매자 대시보드
2. ✅ 전단지 생성/관리
3. ✅ 디지털 간판 Open/Close
4. ✅ 타겟 지역 선택 (H3)
5. ✅ 통계 조회

## 개발 단계

### Phase 1-A: 인증 & 기본 구조 (1-2일)
- [x] 프로젝트 초기화
- [x] API 클라이언트 설정
- [ ] 로그인/회원가입 화면
- [ ] Riverpod 상태 관리 설정

### Phase 1-B: 사용자 앱 핵심 (3-4일)
- [ ] 홈 대시보드
- [ ] 안전 지도 (Google Maps)
- [ ] 디지털 전단지 리스트
- [ ] 포인트 화면

### Phase 1-C: 판매자 앱 핵심 (3-4일)
- [ ] 판매자 대시보드
- [ ] 전단지 생성 폼
- [ ] 디지털 간판 토글
- [ ] 통계 차트

### Phase 1-D: 폴리싱 (2-3일)
- [ ] UI/UX 개선
- [ ] 에러 처리
- [ ] 로딩 상태
- [ ] 오프라인 지원

## 실행 방법

### iOS
```bash
cd townin_app
flutter run -d ios
```

### Android
```bash
cd townin_app
flutter run -d android
```

### 웹 (테스트용)
```bash
cd townin_app
flutter run -d chrome --web-port 8080
```

## 주의사항

1. **API 주소**: 로컬 개발 시 실제 기기에서는 `http://localhost:3000` 대신 `http://192.168.x.x:3000` 사용
2. **Google Maps API Key**: Android/iOS 각각 설정 필요
3. **권한**: 위치 권한, 카메라 권한 등 필요
4. **코드 생성**: 모델 변경 시 `build_runner` 재실행 필요

## 다음 단계

1. Flutter 프로젝트 생성
2. API 클라이언트 테스트
3. 로그인/회원가입 구현
4. 홈 대시보드 구현
5. 안전 지도 구현
