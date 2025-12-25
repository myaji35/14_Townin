# Epic: CORE-004 - Real-time Notification System

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-004 |
| **Epic Title** | Real-time Notification System |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 8 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
타운인은 전단지 업데이트, 가족 돌봄 알림(Phase 2), 보험 추천(Phase 3) 등 실시간 푸시 알림이 필수적입니다. 또한 상인-사용자 간 실시간 채팅, 관리자 대시보드 실시간 업데이트 등도 필요합니다.

### Business Value
- **사용자 참여도 증대**: 새 전단지 알림으로 재방문 유도
- **가족 돌봄 안심**: 센서 이상 시 즉시 알림 (Phase 2)
- **실시간 소통**: 상인-사용자 채팅 (Phase 2)
- **수익화**: 타겟 광고 푸시 (Phase 3)

### Target Users
- **일반 사용자**: 전단지 알림, 가족 돌봄 알림 수신
- **상인**: 전단지 승인 알림, 채팅 메시지 수신
- **보안관**: 지역 활동 알림
- **지자체**: 공공 알림 발송
- **관리자**: 시스템 알림 수신

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 푸시 전송 성공률 | ≥ 98% | FCM/APNS 전송 성공 비율 |
| 푸시 도달 시간 | < 5초 | 발송 → 사용자 수신 평균 시간 |
| 푸시 오픈율 | ≥ 15% | 푸시 클릭 / 전송 비율 |
| WebSocket 연결 안정성 | ≥ 99% | 연결 유지 시간 / 총 시간 |
| 실시간 업데이트 지연 | < 1초 | 이벤트 발생 → 클라이언트 수신 |

## Epic Scope

### In Scope
✅ **Push Notification (Mobile)**
- FCM (Firebase Cloud Messaging) - Android
- APNS (Apple Push Notification Service) - iOS
- 디바이스 토큰 관리
- 푸시 알림 템플릿
- 푸시 이력 저장

✅ **WebSocket (Real-time Communication)**
- Socket.io 기반 양방향 통신
- Room 기반 그룹 메시징
- 연결 상태 관리
- 재연결 로직

✅ **Notification Types**
- 전단지 업데이트 알림
- 시스템 공지사항
- 관리자 승인/거부 알림
- 포인트 적립 알림

✅ **Notification Preferences**
- 사용자별 알림 설정 (ON/OFF)
- 알림 카테고리별 설정
- 알림 시간대 설정 (야간 알림 차단)

✅ **Admin Notification Management**
- 대량 발송 (Bulk Send)
- 타겟 발송 (지역, 역할별)
- 예약 발송 (Schedule)

### Out of Scope
❌ 카카오톡 알림톡 - Phase 2 (전단지 알림톡 연동)
❌ SMS/MMS - Phase 2 (긴급 알림용)
❌ 이메일 알림 - Phase 2
❌ 인앱 메신저 (채팅) - Phase 2

## User Stories

### Story 4.1: FCM/APNS 설정 및 디바이스 토큰 관리
**As a** 모바일 앱 사용자
**I want to** 앱 설치 시 푸시 알림을 활성화하고
**So that** 중요한 알림을 받을 수 있다

**Acceptance Criteria:**
- [ ] FCM 프로젝트 생성 (Firebase Console)
- [ ] APNS 인증서 설정 (Apple Developer)
- [ ] 앱 실행 시 디바이스 토큰 발급
- [ ] POST /api/notifications/device-tokens 엔드포인트로 토큰 등록
- [ ] 사용자당 최대 5개 디바이스 지원
- [ ] 토큰 갱신 로직 (30일마다)

**Tasks:**
- [ ] Firebase 프로젝트 생성 및 서비스 계정 키 발급
- [ ] Apple Push Notification 인증서 발급
- [ ] DeviceToken 엔티티 생성 (user_id, token, platform, is_active)
- [ ] POST /api/notifications/device-tokens 구현
- [ ] 디바이스 토큰 유효성 검증

**Story Points:** 5

---

### Story 4.2: 푸시 알림 발송 서비스
**As a** 시스템
**I want to** 이벤트 발생 시 자동으로 푸시 알림을 발송하고
**So that** 사용자에게 실시간 정보를 전달할 수 있다

**Acceptance Criteria:**
- [ ] FCM Admin SDK 사용 (Node.js)
- [ ] APNS Provider API 사용
- [ ] 알림 템플릿 (title, body, data, icon, sound)
- [ ] 단일 발송, 다중 발송 지원
- [ ] 발송 실패 시 재시도 (최대 3회)
- [ ] 발송 이력 저장 (NotificationLog)

**Tasks:**
- [ ] NotificationService 생성
- [ ] sendToDevice(userId, notification) 함수 구현
- [ ] sendToMultipleDevices(userIds, notification) 함수 구현
- [ ] FCM/APNS 에러 핸들링
- [ ] 발송 이력 로깅

**Story Points:** 5

---

### Story 4.3: 알림 템플릿 관리
**As a** 관리자
**I want to** 알림 템플릿을 관리하고
**So that** 일관된 메시지를 발송할 수 있다

**Acceptance Criteria:**
- [ ] NotificationTemplate 테이블 (type, title, body, data)
- [ ] 알림 타입: flyer_new, flyer_approved, points_earned, system_announcement
- [ ] 변수 치환 (예: {{merchantName}}, {{points}})
- [ ] Admin API: CRUD

**Tasks:**
- [ ] NotificationTemplate 엔티티 생성
- [ ] Template 렌더링 함수 (변수 치환)
- [ ] Admin API 구현

**Story Points:** 3

---

### Story 4.4: WebSocket 서버 구현 (Socket.io)
**As a** 개발자
**I want to** WebSocket 서버를 구축하고
**So that** 실시간 양방향 통신을 지원할 수 있다

**Acceptance Criteria:**
- [ ] Socket.io 설치 및 설정
- [ ] 인증된 사용자만 연결 허용 (JWT 검증)
- [ ] Room 개념 (user:{userId}, admin, region:{regionId})
- [ ] 연결/해제 이벤트 핸들링
- [ ] 재연결 로직 (클라이언트)

**Tasks:**
- [ ] @nestjs/websockets, socket.io 설치
- [ ] WebSocketGateway 생성
- [ ] JWT 기반 WebSocket 인증
- [ ] handleConnection, handleDisconnect 구현
- [ ] 클라이언트 연결 가이드 문서 작성

**Story Points:** 5

---

### Story 4.5: 실시간 이벤트 발행 (Event Emitter)
**As a** 백엔드 개발자
**I want to** 비즈니스 로직에서 이벤트를 발행하고
**So that** 알림 서비스가 자동으로 푸시를 발송할 수 있다

**Acceptance Criteria:**
- [ ] NestJS EventEmitter 사용
- [ ] 이벤트 타입: flyer.created, flyer.approved, points.earned
- [ ] 이벤트 리스너에서 푸시/WebSocket 발송
- [ ] 비동기 처리 (Bull Queue - Optional)

**Tasks:**
- [ ] @nestjs/event-emitter 설치
- [ ] NotificationListener 생성
- [ ] 각 이벤트별 리스너 구현
- [ ] 비즈니스 로직에 EventEmitter 통합

**Story Points:** 3

---

### Story 4.6: 사용자 알림 설정 (Preferences)
**As a** 사용자
**I want to** 알림 수신 여부를 설정하고
**So that** 원하는 알림만 받을 수 있다

**Acceptance Criteria:**
- [ ] NotificationPreference 테이블 (user_id, category, is_enabled, quiet_hours)
- [ ] 카테고리: flyer, points, system, care (Phase 2)
- [ ] 야간 알림 차단 (22:00 ~ 08:00)
- [ ] API: GET/PATCH /api/users/me/notification-preferences

**Tasks:**
- [ ] NotificationPreference 엔티티 생성
- [ ] 기본 설정 Seed (회원가입 시)
- [ ] API 구현
- [ ] 알림 발송 시 설정 확인 로직

**Story Points:** 3

---

### Story 4.7: 관리자 대량 푸시 발송
**As a** 관리자
**I want to** 특정 조건의 사용자에게 대량 푸시를 발송하고
**So that** 시스템 공지나 마케팅 메시지를 전달할 수 있다

**Acceptance Criteria:**
- [ ] POST /api/admin/notifications/broadcast 엔드포인트
- [ ] 타겟 조건: 전체, 지역별, 역할별
- [ ] 예약 발송 (scheduled_at)
- [ ] 발송 진행률 표시
- [ ] 발송 결과 리포트

**Tasks:**
- [ ] BroadcastController 생성
- [ ] 타겟 사용자 쿼리 로직
- [ ] 배치 발송 (1,000명씩)
- [ ] 예약 발송 Queue (Bull)
- [ ] 발송 결과 저장

**Story Points:** 5

---

### Story 4.8: 알림 히스토리 조회
**As a** 사용자
**I want to** 받은 알림 목록을 조회하고
**So that** 놓친 알림을 확인할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/notifications/history 엔드포인트
- [ ] Pagination (page, limit)
- [ ] 읽음/안읽음 필터
- [ ] PATCH /api/notifications/:id/read 읽음 처리
- [ ] 읽지 않은 알림 개수 배지

**Tasks:**
- [ ] NotificationHistory 테이블 (user_id, title, body, is_read, sent_at)
- [ ] GET /api/notifications/history 구현
- [ ] GET /api/notifications/unread-count 구현
- [ ] PATCH /api/notifications/:id/read 구현

**Story Points:** 3

---

### Story 4.9: 실시간 관리자 대시보드 업데이트
**As a** 관리자
**I want to** 대시보드가 실시간으로 업데이트되고
**So that** 시스템 상태를 즉시 파악할 수 있다

**Acceptance Criteria:**
- [ ] WebSocket Room: admin
- [ ] 이벤트: new_user, new_flyer, new_merchant
- [ ] 통계 카드 실시간 업데이트
- [ ] 활동 피드 실시간 추가

**Tasks:**
- [ ] Admin WebSocket 이벤트 정의
- [ ] 이벤트 발생 시 admin 룸에 Broadcast
- [ ] 프론트엔드 Socket.io 클라이언트 통합 가이드

**Story Points:** 3

---

### Story 4.10: 알림 발송 모니터링
**As a** 시스템 관리자
**I want to** 알림 발송 현황을 모니터링하고
**So that** 장애를 빠르게 감지할 수 있다

**Acceptance Criteria:**
- [ ] 발송 성공률 대시보드
- [ ] 실패 원인별 통계 (잘못된 토큰, FCM/APNS 장애)
- [ ] 평균 도달 시간 (latency)
- [ ] 알림 타입별 오픈율

**Tasks:**
- [ ] NotificationStats 테이블 (hourly aggregation)
- [ ] GET /api/admin/notifications/stats 구현
- [ ] 실패 로그 Slack 알림

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Push Notification**: FCM (Firebase), APNS (Apple)
- **WebSocket**: Socket.io
- **Event Bus**: NestJS EventEmitter
- **Queue**: Bull (Redis-based, for scheduled notifications)
- **Database**: PostgreSQL (NotificationLog, DeviceToken)

### Architecture Decisions

#### 1. FCM vs OneSignal vs Custom
**Decision**: FCM + APNS 직접 연동

**Rationale**:
- **비용**: FCM/APNS 무료 (OneSignal 유료 플랜 필요)
- **제어**: 직접 연동으로 세밀한 제어 가능
- **데이터 소유**: 사용자 토큰 자체 관리

**Trade-offs**:
- 개발 복잡도 증가 → Phase 3에서 OneSignal 재검토

#### 2. WebSocket vs Server-Sent Events (SSE)
**Decision**: WebSocket (Socket.io)

**Rationale**:
- **양방향 통신**: 채팅 기능 (Phase 2) 대비
- **Room 기능**: 그룹 메시징 지원
- **생태계**: Socket.io 라이브러리 풍부

#### 3. 푸시 발송 방식
**Decision**: 이벤트 기반 비동기 발송

**Rationale**:
- **확장성**: 대량 발송 시 서버 부하 방지
- **신뢰성**: Queue 기반 재시도 로직

### Database Schema

#### DeviceToken Table
```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL, -- FCM/APNS Token
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),

  -- Metadata
  device_name VARCHAR(100), -- 예: iPhone 15 Pro
  app_version VARCHAR(20),
  os_version VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  last_used_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- 토큰 만료 시간 (30일)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_is_active ON device_tokens(is_active);
```

#### NotificationTemplate Table
```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) UNIQUE NOT NULL, -- flyer_new, flyer_approved, points_earned
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- 추가 데이터 (예: { "action": "open_flyer", "flyerId": "..." })
  icon VARCHAR(255),
  sound VARCHAR(50) DEFAULT 'default',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed 데이터 예시
INSERT INTO notification_templates (type, title, body, data) VALUES
  ('flyer_new', '새 전단지가 도착했어요!', '{{merchantName}}에서 {{title}} 전단지를 등록했어요', '{"action": "open_flyer"}'),
  ('flyer_approved', '전단지가 승인되었습니다', '{{title}} 전단지가 승인되어 사용자에게 노출됩니다', '{"action": "view_my_flyers"}'),
  ('points_earned', '포인트가 적립되었습니다', '{{points}}P가 적립되었습니다. 전단지를 확인하세요!', '{"action": "open_points"}');
```

#### NotificationLog Table
```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,

  -- Notification Content
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,

  -- Delivery
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  platform VARCHAR(10), -- ios/android
  error_message TEXT,
  sent_at TIMESTAMP,

  -- Engagement
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
```

#### NotificationPreference Table
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Category Preferences
  flyer_enabled BOOLEAN DEFAULT TRUE,
  points_enabled BOOLEAN DEFAULT TRUE,
  system_enabled BOOLEAN DEFAULT TRUE,
  care_enabled BOOLEAN DEFAULT TRUE, -- Phase 2 (가족 돌봄)

  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

#### ScheduledNotification Table
```sql
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,

  -- Target
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'region', 'role')),
  target_region_id UUID REFERENCES regions(id),
  target_role VARCHAR(50),

  -- Schedule
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed')),

  -- Results
  total_recipients INT,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

CREATE INDEX idx_scheduled_notifications_scheduled_at ON scheduled_notifications(scheduled_at);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);
```

### API Endpoints

#### Device Token APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/notifications/device-tokens` | 디바이스 토큰 등록 | Yes | All |
| DELETE | `/api/notifications/device-tokens/:token` | 디바이스 토큰 삭제 | Yes | All |
| GET | `/api/users/me/devices` | 내 디바이스 목록 | Yes | All |

#### Notification History APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/notifications/history` | 알림 히스토리 조회 | Yes | All |
| GET | `/api/notifications/unread-count` | 읽지 않은 알림 개수 | Yes | All |
| PATCH | `/api/notifications/:id/read` | 알림 읽음 처리 | Yes | All |

#### Notification Preference APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users/me/notification-preferences` | 알림 설정 조회 | Yes | All |
| PATCH | `/api/users/me/notification-preferences` | 알림 설정 수정 | Yes | All |

#### Admin Notification APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/admin/notifications/broadcast` | 대량 푸시 발송 | Yes | super_admin |
| GET | `/api/admin/notifications/scheduled` | 예약 알림 목록 | Yes | super_admin |
| GET | `/api/admin/notifications/stats` | 알림 통계 | Yes | super_admin |
| GET | `/api/admin/notifications/templates` | 템플릿 목록 | Yes | super_admin |
| POST | `/api/admin/notifications/templates` | 템플릿 생성 | Yes | super_admin |

### Request/Response Examples

#### POST /api/notifications/device-tokens
**Request:**
```json
{
  "token": "eXampleFCMToken123...",
  "platform": "ios",
  "deviceName": "iPhone 15 Pro",
  "appVersion": "1.0.0",
  "osVersion": "17.2"
}
```

**Response (201 Created):**
```json
{
  "id": "token-uuid",
  "userId": "user-uuid",
  "platform": "ios",
  "deviceName": "iPhone 15 Pro",
  "isActive": true,
  "createdAt": "2025-02-01T10:00:00Z"
}
```

#### POST /api/admin/notifications/broadcast
**Request:**
```json
{
  "title": "설 연휴 배송 안내",
  "body": "2월 9일~12일 배송이 지연될 수 있습니다",
  "targetType": "region",
  "targetRegionId": "region-uuid",
  "scheduledAt": "2025-02-08T09:00:00Z",
  "data": {
    "action": "open_url",
    "url": "https://townin.kr/notice/123"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "scheduled-uuid",
  "status": "pending",
  "estimatedRecipients": 15000,
  "scheduledAt": "2025-02-08T09:00:00Z"
}
```

### Environment Variables
```env
# Firebase Cloud Messaging
FCM_PROJECT_ID=your_firebase_project_id
FCM_PRIVATE_KEY=your_firebase_private_key
FCM_CLIENT_EMAIL=your_firebase_client_email

# Apple Push Notification Service
APNS_KEY_ID=your_apns_key_id
APNS_TEAM_ID=your_apple_team_id
APNS_PRIVATE_KEY=your_apns_private_key
APNS_PRODUCTION=false # true for production

# WebSocket
WEBSOCKET_PORT=3001
WEBSOCKET_CORS_ORIGIN=http://localhost:3000

# Bull Queue (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing Strategy

### Unit Tests
- [ ] NotificationService 푸시 발송 테스트 (Mocked FCM/APNS)
- [ ] 알림 템플릿 변수 치환 테스트
- [ ] 야간 알림 차단 로직 테스트
- [ ] WebSocket 인증 테스트

### Integration Tests
- [ ] 디바이스 토큰 등록 → 푸시 발송 플로우
- [ ] EventEmitter → NotificationListener 연동 테스트
- [ ] WebSocket 연결/해제 테스트
- [ ] 예약 알림 Queue 처리 테스트

### E2E Tests
- [ ] 전단지 생성 → 푸시 알림 수신 (End-to-End)
- [ ] WebSocket 실시간 업데이트 테스트
- [ ] 대량 발송 성능 테스트 (10,000명)

## Deployment Checklist

### Pre-Deployment
- [ ] Firebase 프로젝트 생성 및 서비스 계정 키 다운로드
- [ ] Apple Push Notification 인증서 발급 (.p8)
- [ ] Redis 서버 설정 (Bull Queue)
- [ ] WebSocket CORS 설정

### Deployment
- [ ] 환경 변수 설정
- [ ] Database Migration 실행
- [ ] NotificationTemplate Seed 데이터 삽입
- [ ] WebSocket 서버 시작

### Post-Deployment
- [ ] 테스트 푸시 발송 (iOS/Android)
- [ ] WebSocket 연결 테스트
- [ ] 발송 성공률 모니터링

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| FCM/APNS 장애 | High | Low | 재시도 로직, 에러 로그 |
| 디바이스 토큰 만료 | Medium | High | 30일마다 토큰 갱신 요청 |
| WebSocket 연결 끊김 | Medium | Medium | 자동 재연결 로직 |
| 대량 발송 시 서버 과부하 | High | Low | Queue 기반 배치 발송 |
| 스팸 알림 민원 | Medium | Low | 알림 설정, 야간 차단 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System (사용자 인증)

### Blocks (Dependent Epics)
- **USR-007**: Digital Flyer Viewer (새 전단지 푸시)
- **MRC-003**: Flyer Creation & Management (전단지 승인 알림)
- **USR-009**: User Points & Rewards (포인트 적립 알림)
- **Phase 2 - Care**: Family Care Monitoring (센서 이상 알림)

## Related Epics

- **ADM-005**: Platform Activity Monitoring (실시간 대시보드)
- **Phase 2 - USR-014**: In-app Messenger (채팅 알림)

## Future Enhancements

### Phase 2
- 카카오톡 알림톡 (전단지 알림)
- SMS/MMS (긴급 알림)
- 이메일 알림
- Rich Push (이미지, 버튼)

### Phase 3
- AI 기반 개인화 알림 (최적 발송 시간)
- A/B 테스트 (알림 문구 최적화)
- 위치 기반 Geo-fence 알림

### Phase 4
- 다국어 알림 (Vietnam, Japan)
- Voice 알림 (고령자 대상)

## Notes

### FCM/APNS 비교

| Feature | FCM (Android) | APNS (iOS) |
|---------|---------------|------------|
| SDK | Firebase Admin SDK | @parse/node-apn |
| 인증 | 서비스 계정 JSON | .p8 인증서 |
| 페이로드 크기 | 4KB | 4KB (iOS 8+) |
| 우선순위 | high/normal | 5/10 |
| 배지 | 수동 관리 | 자동 지원 |

### Socket.io Events

**Client → Server:**
```typescript
socket.emit('join_room', { roomId: 'admin' });
socket.emit('leave_room', { roomId: 'admin' });
```

**Server → Client:**
```typescript
io.to('admin').emit('new_user', { userId, name, createdAt });
io.to(`user:${userId}`).emit('new_notification', { title, body });
```

### References
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging
- APNS Documentation: https://developer.apple.com/documentation/usernotifications
- Socket.io Documentation: https://socket.io/docs/v4/
- NestJS WebSockets: https://docs.nestjs.com/websockets/gateways
