# Townin Flutter 앱 설정 가이드

## 사전 준비

### 1. Flutter 설치 확인

```bash
flutter --version
```

Flutter 3.16.0 이상이 필요합니다.

### 2. 의존성 설치

```bash
cd frontend
flutter pub get
```

## 앱 실행

### iOS 시뮬레이터

```bash
flutter run -d ios
```

### Android 에뮬레이터

```bash
flutter run -d android
```

### 웹 (개발용)

```bash
flutter run -d chrome
```

## 빠른 테스트

### 로그인 계정 (비밀번호: townin2025!)

1. **슈퍼관리자**: `admin@townin.kr`
   - 전체 시스템 관리 대시보드
   - 도시별 통계, 사용자/상인/보안관 현황
   - 최근 활동 내역

2. **자치체관리**: `municipality@uijeongbu.go.kr`
   - 의정부시 관리 대시보드
   - 동별 현황 (의정부동, 가능동, 호원동, 신곡동, 송산동)
   - 보안관 성과 모니터링

3. **보안관**: `guard1@townin.kr`
   - 지역관리자 대시보드
   - 담당 구역: 의정부동
   - 수익 현황, 상인 관리, 간판 점검

4. **일반 사용자**: `user1@example.com`
   - 사용자 홈 화면
   - 안전 맵, 전단지, 커뮤니티
   - 3-Hub (집, 회사, 가족집) 위치 관리

## 주요 화면

### 1. 로그인 화면 (LoginScreen)
- 파일: `lib/features/auth/presentation/login_screen.dart`
- 기능: 이메일/비밀번호 로그인, 빠른 로그인 버튼

### 2. 슈퍼관리자 대시보드 (SuperAdminDashboard)
- 파일: `lib/features/dashboard/super_admin/super_admin_dashboard.dart`
- 표시 정보:
  - 총 사용자, 자치체, 보안관, 상인 통계
  - 도시별 현황 (사용자, 상인, 살기좋은동네지수)
  - 최근 활동 내역

### 3. 자치체관리 대시보드 (MunicipalityDashboard)
- 파일: `lib/features/dashboard/municipality/municipality_dashboard.dart`
- 표시 정보:
  - 의정부시 핵심 지표
  - 동별 현황 (사용자, 상인, 부동산 등급)
  - 보안관 성과 (수익, 광고 조회)

### 4. 보안관 대시보드 (SecurityGuardDashboard)
- 파일: `lib/features/dashboard/security_guard/security_guard_dashboard.dart`
- 표시 정보:
  - 수익 현황 (총 수익, 광고 조회, 평균 수익)
  - 담당 구역 상인 목록
  - 빠른 작업 (간판 점검, QR 스캔, 전단지 확인, 보고서 작성)

### 5. 일반 사용자 대시보드 (UserDashboard)
- 파일: `lib/features/dashboard/user/user_dashboard.dart`
- 표시 정보:
  - 3-Hub 위치 선택 (집, 회사, 가족집)
  - 안전 맵 미리보기
  - 내 주변 전단지
  - 커뮤니티 기능 (동네 소식, 안전 정보, 이웃 찾기, 문의하기)

## 앱 구조

```
lib/
├── core/
│   ├── constants/       # API 상수
│   ├── enums/          # UserRole 등 열거형
│   ├── models/         # 데이터 모델
│   └── widgets/        # 공통 위젯 (StatCard 등)
├── features/
│   ├── auth/
│   │   ├── data/       # AuthRepository
│   │   └── presentation/ # LoginScreen, DashboardRouter
│   └── dashboard/
│       ├── super_admin/      # 슈퍼관리자 화면
│       ├── municipality/     # 자치체관리 화면
│       ├── security_guard/   # 보안관 화면
│       └── user/            # 일반 사용자 화면
└── main.dart           # 앱 진입점
```

## 다음 단계 (TODO)

### 백엔드 연동
1. `lib/features/auth/data/auth_repository.dart`에서 실제 API 연동
2. Dio interceptor로 JWT 토큰 자동 추가
3. BLoC 패턴으로 상태 관리 구현

### 추가 기능 개발
1. 안전 맵 화면 (Google Maps 연동)
2. 전단지 상세 화면
3. 프로필 관리 화면
4. 푸시 알림

### UI/UX 개선
1. 로딩 상태 표시
2. 에러 핸들링
3. 오프라인 모드
4. 다크 모드

## 문제 해결

### Flutter 버전 문제
```bash
flutter upgrade
```

### 의존성 충돌
```bash
flutter pub upgrade --major-versions
flutter pub get
```

### iOS 빌드 문제
```bash
cd ios
pod install
cd ..
```

### Android 빌드 문제
```bash
flutter clean
flutter pub get
flutter build apk
```

## 참고 자료

- [Flutter 공식 문서](https://flutter.dev/docs)
- [Dart 언어 가이드](https://dart.dev/guides)
- [BLoC 패턴](https://bloclibrary.dev/)
- [Dio HTTP 클라이언트](https://pub.dev/packages/dio)
