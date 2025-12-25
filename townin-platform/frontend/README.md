# Townin Mobile App

Flutter 기반 Townin 플랫폼 모바일 앱

## 시작하기

### 1. 의존성 설치

```bash
flutter pub get
```

### 2. 코드 생성 (JSON serialization)

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. 앱 실행

```bash
# iOS 시뮬레이터
flutter run -d ios

# Android 에뮬레이터
flutter run -d android

# 웹 (개발용)
flutter run -d chrome
```

## 프로젝트 구조

```
lib/
├── core/                 # 공통 기능
│   ├── constants/       # API 상수, 앱 상수
│   ├── enums/           # UserRole 등 열거형
│   ├── models/          # 공통 데이터 모델
│   └── utils/           # 유틸리티 함수
├── features/            # 기능별 모듈
│   ├── auth/           # 인증 (로그인, 회원가입)
│   │   ├── data/       # Repository, Data Source
│   │   ├── domain/     # Entities, Use Cases
│   │   └── presentation/ # Screens, Widgets, Bloc
│   ├── dashboard/      # 대시보드 (역할별)
│   ├── flyers/         # 전단지 관리
│   ├── safety/         # 안전 맵
│   └── profile/        # 프로필 관리
└── main.dart           # 앱 진입점
```

## 역할별 화면

### 일반 사용자 (User)
- 전단지 보기
- 안전 맵 확인
- 프로필 관리

### 지역관리자 (Security Guard)
- 담당 구역 관리
- 상인 간판 관리
- 수익 대시보드

### 자치체관리 (Municipality)
- 의정부시 전체 대시보드
- 사용자 통계
- 보안관 성과 관리

### 슈퍼관리자 (Super Admin)
- 전체 시스템 관리
- 자치체 관리
- 사용자 및 권한 관리

## 빠른 로그인 계정

모든 계정 비밀번호: `townin2025!`

- 슈퍼관리자: `admin@townin.kr`
- 자치체관리: `municipality@uijeongbu.go.kr`
- 지역관리자: `guard1@townin.kr`
- 일반 사용자: `user1@example.com`

## 백엔드 API 연결

`.env` 파일에서 API URL 설정:

```
API_BASE_URL=http://localhost:3000/api/v1
```

## 참고 사항

- Clean Architecture + BLoC 패턴 사용
- Dio를 사용한 HTTP 통신
- Flutter Secure Storage로 토큰 관리
- go_router를 사용한 선언적 라우팅
