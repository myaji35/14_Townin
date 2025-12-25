# CORE-004 & CORE-006 패키지 설치 가이드

## 현재 상태

✅ **코드 구현 완료**: 모든 엔티티, 서비스, 컨트롤러 구현됨
⚠️ **패키지 설치 대기**: 디스크 공간 부족으로 일부 패키지 미설치

---

## 필수 패키지 목록

### CORE-004: Real-time Notification System

#### 1. Push Notification (선택 사항)
```bash
npm install firebase-admin
```

**용도:**
- FCM (Firebase Cloud Messaging) - Android 푸시
- APNS (Apple Push Notification Service) - iOS 푸시

**설치 전 준비:**
- Firebase Console에서 프로젝트 생성
- 서비스 계정 키 다운로드 (JSON)

#### 2. WebSocket (선택 사항)
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**용도:**
- 실시간 양방향 통신
- 관리자 대시보드 실시간 업데이트
- 채팅 기능 (Phase 2)

**버전 호환성:**
```bash
# NestJS 10.x와 호환되지 않을 수 있음
npm install --legacy-peer-deps @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

### CORE-006: Logging & Monitoring

#### 1. Winston Logger (권장)
```bash
npm install winston nest-winston
```

**용도:**
- 구조화된 로깅 (JSON)
- 로그 파일 저장 (error.log, combined.log)
- 다양한 Transport 지원

#### 2. Sentry (Error Tracking)
```bash
npm install @sentry/node @sentry/profiling-node
```

**용도:**
- 프로덕션 에러 추적
- 스택 트레이스 캡처
- 성능 모니터링 (APM)

**설치 전 준비:**
- Sentry 계정 생성 (https://sentry.io)
- 프로젝트 생성 및 DSN 발급

#### 3. CloudWatch (선택 사항)
```bash
npm install winston-cloudwatch
```

**용도:**
- AWS CloudWatch Logs 통합
- 중앙화된 로그 관리

---

## 단계별 설치 가이드

### Step 1: 디스크 공간 확보

현재 사용 가능한 공간: **5GB**
필요한 공간: **최소 10GB**

```bash
# node_modules 정리 (선택 사항)
rm -rf node_modules package-lock.json
npm cache clean --force

# Docker 이미지 정리 (사용 시)
docker system prune -a

# 불필요한 파일 삭제
# 예: 다운로드 폴더, 캐시 등
```

### Step 2: 패키지 개별 설치

#### 옵션 A: 모든 패키지 한번에 (디스크 공간 충분 시)
```bash
cd backend

npm install --legacy-peer-deps \
  firebase-admin \
  @nestjs/websockets \
  @nestjs/platform-socket.io \
  socket.io \
  winston \
  nest-winston \
  @sentry/node \
  @sentry/profiling-node
```

#### 옵션 B: 필수 패키지만 우선 설치 (공간 부족 시)
```bash
# 1. 로깅만 (가장 중요)
npm install winston nest-winston

# 2. 에러 추적 (프로덕션 필수)
npm install @sentry/node

# 3. 푸시 알림 (나중에)
npm install firebase-admin

# 4. WebSocket (Phase 2)
npm install --legacy-peer-deps @nestjs/websockets socket.io
```

---

## 설치 후 설정

### 1. Winston Logger 활성화

**파일:** `src/config/logger.config.ts`

주석 해제:
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

**파일:** `src/main.ts`

```typescript
import { winstonConfig } from './config/logger.config';

const app = await NestFactory.create(AppModule, {
  logger: winstonConfig,
});
```

### 2. Sentry 설정

**파일:** `src/main.ts`

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  release: process.env.npm_package_version,
  tracesSampleRate: 0.1, // 10% of requests
});
```

**에러 캡처:**
```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 3. Firebase Admin 설정

**파일:** `src/modules/notifications/notifications.service.ts`

```typescript
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FCM_CLIENT_EMAIL,
      }),
    });
  }

  async sendPushNotification(token: string, notification: any) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      token: token,
    };

    return admin.messaging().send(message);
  }
}
```

### 4. WebSocket Gateway 추가 (선택 사항)

**파일:** `src/modules/notifications/gateways/notifications.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: process.env.WEBSOCKET_CORS_ORIGIN },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
```

---

## 환경 변수 설정

**.env 파일에 추가:**

```env
# Logging
LOG_LEVEL=info

# Sentry
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production

# Firebase (FCM)
FCM_PROJECT_ID=townin-prod
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL=firebase-adminsdk@townin-prod.iam.gserviceaccount.com

# APNS
APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=DEF456GHI
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
APNS_PRODUCTION=true

# WebSocket
WEBSOCKET_PORT=3001
WEBSOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

---

## 패키지 없이 현재 작동하는 기능

### ✅ 완전 작동
- Device Token 등록/삭제 (DB에 저장)
- Notification Log 저장
- Notification Preferences 관리
- Analytics Event Tracking
- DAU/MAU 집계
- Health Check

### ⚠️ 패키지 필요 (코드는 준비됨)
- FCM/APNS 실제 푸시 발송 → `firebase-admin` 필요
- Winston 로깅 → `winston`, `nest-winston` 필요
- Sentry 에러 추적 → `@sentry/node` 필요
- WebSocket 실시간 통신 → `socket.io` 필요

---

## 테스트 방법

### 패키지 없이 테스트
```bash
# 서버 시작
npm run start:dev

# 디바이스 토큰 등록
curl -X POST http://localhost:3000/api/notifications/device-tokens \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-fcm-token-123",
    "platform": "ios",
    "deviceName": "iPhone 15 Pro"
  }'

# Health Check
curl http://localhost:3000/health

# Analytics Event
curl -X POST http://localhost:3000/api/analytics/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "flyer_view",
    "eventCategory": "engagement",
    "metadata": {"flyerId": "test-123"}
  }'
```

---

## 프로덕션 배포 전 체크리스트

- [ ] 디스크 공간 확보 (최소 10GB)
- [ ] Winston 패키지 설치 및 설정
- [ ] Sentry 계정 생성 및 DSN 발급
- [ ] Firebase 프로젝트 생성 및 서비스 계정 키 발급
- [ ] APNS 인증서 발급 (.p8)
- [ ] 환경 변수 설정 (.env)
- [ ] logs 디렉토리 생성 (`mkdir logs`)
- [ ] Database Migration 실행
- [ ] Health Check 확인
- [ ] 테스트 푸시 발송 확인

---

## 문제 해결

### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a -f

# npm 캐시 정리
npm cache clean --force

# 오래된 node_modules 삭제
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
```

### 패키지 버전 충돌
```bash
# legacy-peer-deps 사용
npm install --legacy-peer-deps PACKAGE_NAME

# 또는 package.json에 설정
echo 'legacy-peer-deps=true' >> .npmrc
```

### FCM 푸시 발송 실패
- Firebase 프로젝트 설정 확인
- 서비스 계정 키 JSON 형식 확인
- FCM_PRIVATE_KEY 줄바꿈 처리 (`\n`)

---

## 참고 자료

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Sentry Documentation](https://docs.sentry.io/platforms/node/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)

---

**현재 상태:** 모든 코드 구현 완료, 패키지 설치 대기 중
**작동 여부:** 패키지 없이도 기본 기능(DB 저장, 조회) 정상 작동
**다음 단계:** 디스크 공간 확보 후 패키지 설치 및 실제 푸시/로깅 활성화
