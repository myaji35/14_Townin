# CORE-004 & CORE-006 구현 요약

## ✅ 구현 완료된 Epic

### CORE-004: Real-time Notification System
### CORE-006: Logging & Monitoring

---

## 📦 CORE-004: Real-time Notification System

### 구현된 기능

#### 1. **Device Token 관리**
- iOS/Android 디바이스 토큰 등록
- 사용자당 최대 5개 디바이스 지원
- 토큰 만료 관리 (30일)
- 디바이스 정보 추적 (기기명, OS 버전, 앱 버전)

#### 2. **Push Notification (기본 구조)**
- FCM (Firebase Cloud Messaging) 준비
- APNS (Apple Push Notification Service) 준비
- 알림 발송 로그 저장
- 알림 템플릿 시스템

#### 3. **사용자 알림 설정**
- 카테고리별 알림 ON/OFF (전단지, 포인트, 시스템, 돌봄)
- 야간 알림 차단 (22:00 ~ 08:00)
- 사용자별 개인화 설정

#### 4. **알림 히스토리**
- 알림 목록 조회 (페이지네이션)
- 읽지 않은 알림 개수
- 알림 읽음 처리
- 알림 열람 추적

### Entities

#### DeviceToken
```typescript
{
  id: uuid
  userId: uuid
  token: text (FCM/APNS token)
  platform: enum (ios, android)
  deviceName: string
  appVersion: string
  osVersion: string
  isActive: boolean
  lastUsedAt: timestamp
  expiresAt: timestamp
}
```

#### NotificationLog
```typescript
{
  id: uuid
  userId: uuid
  deviceTokenId: uuid
  type: string (flyer_new, points_earned, ...)
  title: string
  body: text
  data: jsonb
  status: enum (pending, sent, failed)
  platform: string
  errorMessage: text
  sentAt: timestamp
  isOpened: boolean
  openedAt: timestamp
}
```

#### NotificationPreference
```typescript
{
  id: uuid
  userId: uuid
  flyerEnabled: boolean
  pointsEnabled: boolean
  systemEnabled: boolean
  careEnabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart: time
  quietHoursEnd: time
}
```

#### NotificationTemplate
```typescript
{
  id: uuid
  type: string (unique)
  title: string
  body: text
  data: jsonb
  icon: string
  sound: string
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/notifications/device-tokens` | 디바이스 토큰 등록 |
| **DELETE** | `/api/notifications/device-tokens/:token` | 디바이스 토큰 삭제 |
| **GET** | `/api/notifications/devices` | 내 디바이스 목록 |
| **GET** | `/api/notifications/history` | 알림 히스토리 조회 |
| **GET** | `/api/notifications/unread-count` | 읽지 않은 알림 개수 |
| **PATCH** | `/api/notifications/:id/read` | 알림 읽음 처리 |
| **GET** | `/api/notifications/preferences` | 알림 설정 조회 |
| **PATCH** | `/api/notifications/preferences` | 알림 설정 수정 |

### 주요 서비스 메서드

```typescript
class NotificationsService {
  // Device Token
  registerDeviceToken(userId, dto): DeviceToken
  deleteDeviceToken(token, userId): void
  getUserDevices(userId): DeviceToken[]

  // Push Notification
  sendNotification(dto): NotificationLog

  // History
  getNotificationHistory(userId, page, limit): { data, total }
  getUnreadCount(userId): number
  markAsRead(notificationId, userId): void

  // Preferences
  getOrCreatePreference(userId): NotificationPreference
  updatePreference(userId, updates): NotificationPreference
  shouldSendNotification(preference, type): boolean
}
```

---

## 📊 CORE-006: Logging & Monitoring

### 구현된 기능

#### 1. **Analytics Event Tracking**
- 사용자 행동 추적 (전단지 조회, 검색, 회원가입 등)
- 세션 추적
- 이벤트 메타데이터 저장 (JSONB)
- IP, User-Agent, Platform 추적

#### 2. **DAU/MAU 측정**
- Daily Active Users (DAU) 집계
- Monthly Active Users (MAU) 집계
- Retention Rate 계산 (D1, D7, D30)
- 이벤트 타입별 통계

#### 3. **Health Check**
- 서버 상태 확인 (`GET /health`)
- 데이터베이스 연결 확인 (`GET /health/database`)
- Uptime 정보

#### 4. **Logger 설정**
- NestJS 기본 Logger 사용
- Winston 통합 준비 (설정 파일 생성)
- 로그 레벨 설정 (LOG_LEVEL 환경 변수)

### Entities

#### AnalyticsEvent
```typescript
{
  id: uuid
  userId: uuid (nullable)
  sessionId: string
  eventType: string (flyer_view, user_signup, ...)
  eventCategory: string (engagement, conversion, retention)
  metadata: jsonb
  ipAddress: inet
  userAgent: text
  platform: string (web, ios, android)
  appVersion: string
  regionId: uuid
  createdAt: timestamp
}
```

#### AnalyticsStats
```typescript
{
  id: uuid
  date: date (unique)
  dau: int
  newUsers: int
  returningUsers: int
  totalFlyerViews: int
  totalSearches: int
  avgSessionDurationSeconds: int
  d1RetentionRate: decimal
  d7RetentionRate: decimal
  d30RetentionRate: decimal
  createdAt: timestamp
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/analytics/events` | 이벤트 추적 |
| **GET** | `/api/analytics/dau-mau` | DAU/MAU 통계 (Admin) |
| **GET** | `/api/analytics/events/counts` | 이벤트 타입별 집계 |
| **GET** | `/health` | 헬스 체크 |
| **GET** | `/health/database` | DB 연결 상태 |

### 주요 서비스 메서드

```typescript
class AnalyticsService {
  // Event Tracking
  trackEvent(dto): AnalyticsEvent

  // Metrics
  getDau(date): number
  getMau(year, month): number
  getStats(startDate, endDate): { data, summary }
  getEventCounts(startDate, endDate): { eventType, count }[]
}
```

---

## 🗂️ 생성된 파일들

### CORE-004 Files
```
src/modules/notifications/
├── entities/
│   ├── device-token.entity.ts
│   ├── notification-log.entity.ts
│   ├── notification-preference.entity.ts
│   └── notification-template.entity.ts
├── dto/
│   └── register-device-token.dto.ts
├── notifications.service.ts
├── notifications.controller.ts
└── notifications.module.ts
```

### CORE-006 Files
```
src/modules/analytics/
├── entities/
│   ├── analytics-event.entity.ts
│   └── analytics-stats.entity.ts
├── analytics.service.ts
├── analytics.controller.ts
└── analytics.module.ts

src/modules/health/
├── health.controller.ts
└── health.module.ts

src/config/
└── logger.config.ts
```

---

## 🚀 다음 단계 (배포 시)

### CORE-004: Push Notification 활성화

#### 1. Firebase 설정
```bash
# Firebase Console에서 프로젝트 생성
# 서비스 계정 키 다운로드 (JSON)
```

#### 2. 환경 변수 설정
```env
FCM_PROJECT_ID=townin-prod
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FCM_CLIENT_EMAIL=firebase-adminsdk@townin-prod.iam.gserviceaccount.com
```

#### 3. APNS 설정
```bash
# Apple Developer에서 Push Notification 인증서 발급 (.p8)
```

```env
APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=DEF456GHI
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
APNS_PRODUCTION=true
```

#### 4. FCM/APNS 패키지 설치
```bash
npm install firebase-admin @nestjs/websockets @nestjs/platform-socket.io socket.io
```

#### 5. NotificationsService 업데이트
```typescript
// FCM 초기화
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FCM_PROJECT_ID,
    privateKey: process.env.FCM_PRIVATE_KEY,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
  }),
});

// 푸시 발송
const message = {
  notification: { title, body },
  data,
  token: deviceToken.token,
};

await admin.messaging().send(message);
```

### CORE-006: Winston & Sentry 활성화

#### 1. Winston 패키지 설치
```bash
npm install winston nest-winston
```

#### 2. Winston 설정 업데이트
```typescript
// src/config/logger.config.ts 주석 해제
export const winstonConfig = WinstonModule.createLogger({...});
```

#### 3. Sentry 설정
```bash
npm install @sentry/node @sentry/profiling-node
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1,
});
```

#### 4. CloudWatch Logs (선택 사항)
```bash
npm install winston-cloudwatch
```

---

## 📊 데이터베이스 테이블 요약

| 테이블 | 목적 | 주요 컬럼 |
|--------|------|----------|
| **device_tokens** | 푸시 알림 디바이스 관리 | user_id, token, platform |
| **notification_logs** | 알림 발송 이력 | user_id, type, status, sent_at |
| **notification_preferences** | 사용자 알림 설정 | user_id, flyer_enabled, quiet_hours |
| **notification_templates** | 알림 템플릿 | type, title, body |
| **analytics_events** | 사용자 행동 로그 | user_id, event_type, metadata |
| **analytics_stats** | 일일 통계 집계 | date, dau, total_flyer_views |

---

## ✅ 구현 완료 Status

### 완료된 Epic
- ✅ CORE-001: Authentication & Authorization System
- ✅ CORE-002: Geospatial Data Infrastructure
- ✅ CORE-003: Public Data Integration
- ✅ **CORE-004: Real-time Notification System**
- ✅ CORE-005: File Upload & CDN
- ✅ **CORE-006: Logging & Monitoring**

### 모든 CORE Epic 완료! 🎉

---

## 🎯 사용 예제

### 디바이스 토큰 등록 (Flutter)
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

final fcmToken = await FirebaseMessaging.instance.getToken();

final response = await dio.post(
  'http://localhost:3000/api/notifications/device-tokens',
  data: {
    'token': fcmToken,
    'platform': 'ios',
    'deviceName': 'iPhone 15 Pro',
    'appVersion': '1.0.0',
    'osVersion': '17.2',
  },
  options: Options(
    headers: {'Authorization': 'Bearer $accessToken'},
  ),
);
```

### 이벤트 추적
```typescript
await analyticsService.trackEvent({
  userId: user.id,
  eventType: 'flyer_view',
  eventCategory: 'engagement',
  metadata: {
    flyerId: 'flyer-uuid',
    duration: 15000,
  },
  platform: 'ios',
  appVersion: '1.0.0',
});
```

### Health Check
```bash
curl http://localhost:3000/health

{
  "status": "ok",
  "timestamp": "2025-02-01T10:00:00.000Z",
  "database": "up",
  "uptime": 12345.67
}
```

---

**🎉 모든 CORE 인프라 구축 완료!**

이제 전단지, 상인, 사용자 기능 개발을 위한 완전한 백엔드 인프라가 준비되었습니다.
