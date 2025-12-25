# Epic: CORE-006 - Logging & Monitoring

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-006 |
| **Epic Title** | Logging & Monitoring |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 6 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
프로덕션 환경에서 에러 추적, 성능 모니터링, 사용자 행동 분석이 없으면 장애 대응이 어렵고 서비스 개선이 불가능합니다. 체계적인 로깅과 모니터링 인프라가 필요합니다.

### Business Value
- **장애 대응**: 에러 발생 시 즉시 알림 및 원인 파악 (MTTR 단축)
- **성능 최적화**: API 응답 시간, DB 쿼리 성능 모니터링
- **사용자 행동 분석**: 전단지 조회, 검색 패턴 분석으로 UX 개선
- **비즈니스 인사이트**: DAU, MAU, 사용자 유지율 측정

### Target Users
- **개발자**: 에러 로그, API 성능 모니터링
- **DevOps**: 인프라 리소스 모니터링 (CPU, Memory)
- **PM/PO**: 사용자 행동 분석, 비즈니스 메트릭
- **경영진**: DAU, MAU, GMV 대시보드

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 에러 탐지율 | 100% | 모든 에러 Sentry 전송 |
| 알림 도달 시간 | < 1분 | 에러 발생 → Slack 알림 |
| 로그 보존 기간 | 30일 | CloudWatch Logs 보존 |
| APM 커버리지 | 100% | 모든 API 엔드포인트 추적 |
| 대시보드 로딩 시간 | < 2초 | Grafana 대시보드 로드 |

## Epic Scope

### In Scope
✅ **Application Logging**
- Winston Logger (NestJS)
- 로그 레벨 (error, warn, info, debug)
- 구조화된 로그 (JSON)
- 로그 필터링 (민감 정보 제거)

✅ **Error Tracking**
- Sentry 통합
- 에러 그룹핑 및 우선순위
- Source Map 업로드 (스택 트레이스)
- Slack 알림 연동

✅ **Performance Monitoring (APM)**
- API 응답 시간 추적
- Database Query 성능
- HTTP 요청 추적 (Distributed Tracing)

✅ **Infrastructure Monitoring**
- CloudWatch (AWS)
- CPU, Memory, Disk 사용률
- RDS 성능 메트릭
- S3 스토리지 사용량

✅ **User Analytics**
- 사용자 행동 로그 (플라이어 조회, 검색)
- DAU, MAU 측정
- Retention Rate (재방문율)

✅ **Alerting**
- Slack 알림 (에러, 성능 저하)
- PagerDuty 통합 (중대 장애)
- 알림 임계값 설정

### Out of Scope
❌ Business Intelligence (BI) 툴 - Phase 2 (Metabase/Tableau)
❌ User Session Recording - Phase 3 (FullStory/Hotjar)
❌ A/B Testing Analytics - Phase 3
❌ 실시간 로그 스트리밍 (Kafka) - Phase 4

## User Stories

### Story 6.1: Winston Logger 설정
**As a** 백엔드 개발자
**I want to** 구조화된 로깅 시스템을 구축하고
**So that** 프로덕션 환경에서 디버깅이 가능하다

**Acceptance Criteria:**
- [ ] Winston Logger 설정 (NestJS)
- [ ] 로그 레벨: error, warn, info, debug
- [ ] JSON 형식 로그 출력
- [ ] 로그 파일 저장 (logs/error.log, logs/combined.log)
- [ ] 민감 정보 필터링 (password, JWT token)

**Tasks:**
- [ ] winston, nest-winston 설치
- [ ] WinstonModule 설정
- [ ] Custom Logger 생성 (SanitizingLogger)
- [ ] 모든 컨트롤러/서비스에 Logger 주입

**Story Points:** 3

---

### Story 6.2: Sentry 에러 트래킹 통합
**As a** 개발자
**I want to** 프로덕션 에러를 자동으로 수집하고
**So that** 사용자 신고 전에 에러를 인지할 수 있다

**Acceptance Criteria:**
- [ ] Sentry 프로젝트 생성
- [ ] @sentry/node 통합
- [ ] 에러 자동 캡처 (Unhandled Exception)
- [ ] User Context 포함 (userId, email)
- [ ] Release 버전 태깅 (package.json version)
- [ ] Source Map 업로드 (TypeScript 스택 트레이스)

**Tasks:**
- [ ] Sentry 계정 및 프로젝트 생성
- [ ] @sentry/node, @sentry/integrations 설치
- [ ] Sentry Module 설정 (DSN)
- [ ] Error Filter (404 제외)
- [ ] CI/CD에 Source Map 업로드 추가

**Story Points:** 5

---

### Story 6.3: CloudWatch Logs 통합
**As a** DevOps 엔지니어
**I want to** 애플리케이션 로그를 CloudWatch에 전송하고
**So that** 중앙화된 로그 관리가 가능하다

**Acceptance Criteria:**
- [ ] winston-cloudwatch 트랜스포트 사용
- [ ] Log Group: /aws/townin/backend
- [ ] Log Stream: {instance-id}-{timestamp}
- [ ] 로그 보존 기간 30일
- [ ] CloudWatch Insights 쿼리 작성

**Tasks:**
- [ ] winston-cloudwatch 설치
- [ ] CloudWatch Transport 설정
- [ ] IAM 정책 (logs:CreateLogGroup, logs:PutLogEvents)
- [ ] CloudWatch Insights 쿼리 예제 작성

**Story Points:** 3

---

### Story 6.4: API Performance Monitoring
**As a** 개발자
**I want to** API 응답 시간을 추적하고
**So that** 느린 엔드포인트를 최적화할 수 있다

**Acceptance Criteria:**
- [ ] LoggingInterceptor 구현 (NestJS)
- [ ] 모든 API 요청 로깅: method, url, statusCode, duration
- [ ] 느린 요청 경고 (> 1초)
- [ ] Sentry Performance Monitoring 통합

**Tasks:**
- [ ] LoggingInterceptor 생성
- [ ] APP_INTERCEPTOR로 글로벌 등록
- [ ] Sentry Performance 설정 (tracesSampleRate: 0.1)

**Story Points:** 3

---

### Story 6.5: Database Query Performance Monitoring
**As a** 백엔드 개발자
**I want to** 느린 DB 쿼리를 탐지하고
**So that** 쿼리를 최적화할 수 있다

**Acceptance Criteria:**
- [ ] TypeORM Logging 활성화
- [ ] 느린 쿼리 로깅 (> 500ms)
- [ ] 쿼리 실행 계획 (EXPLAIN) 자동 로깅
- [ ] RDS Performance Insights 활성화

**Tasks:**
- [ ] TypeORM logging: 'all', maxQueryExecutionTime: 500
- [ ] Custom QueryLogger 구현
- [ ] RDS Performance Insights 활성화 (AWS Console)

**Story Points:** 3

---

### Story 6.6: User Analytics Event Logging
**As a** PM
**I want to** 사용자 행동을 추적하고
**So that** 데이터 기반 의사결정을 할 수 있다

**Acceptance Criteria:**
- [ ] AnalyticsEvent 테이블 설계
- [ ] 이벤트 타입: flyer_view, flyer_search, flyer_share, user_signup
- [ ] 이벤트 메타데이터 (JSON)
- [ ] POST /api/analytics/events 엔드포인트

**Tasks:**
- [ ] AnalyticsEvent 엔티티 생성
- [ ] AnalyticsService 생성
- [ ] trackEvent(userId, eventType, metadata) 함수
- [ ] 비즈니스 로직에 이벤트 추적 추가

**Story Points:** 5

---

### Story 6.7: DAU/MAU 측정
**As a** PM
**I want to** 일간/월간 활성 사용자 수를 측정하고
**So that** 서비스 성장을 모니터링할 수 있다

**Acceptance Criteria:**
- [ ] DAU (Daily Active Users) 집계 쿼리
- [ ] MAU (Monthly Active Users) 집계 쿼리
- [ ] Retention Rate (D1, D7, D30)
- [ ] GET /api/admin/analytics/dau-mau 엔드포인트

**Tasks:**
- [ ] AnalyticsStats 테이블 (daily aggregation)
- [ ] Cron Job (매일 새벽 4시 DAU 집계)
- [ ] Retention Rate 계산 로직
- [ ] Admin API 구현

**Story Points:** 5

---

### Story 6.8: Slack 알림 통합
**As a** 개발자
**I want to** 에러 발생 시 Slack으로 알림받고
**So that** 즉시 대응할 수 있다

**Acceptance Criteria:**
- [ ] Slack Webhook 설정
- [ ] 에러 알림 (Sentry 통합)
- [ ] 성능 저하 알림 (API > 3초)
- [ ] 알림 메시지 포맷 (에러 메시지, 스택 트레이스, 사용자)

**Tasks:**
- [ ] Slack Webhook URL 발급
- [ ] SlackService 생성
- [ ] Sentry Webhook 통합
- [ ] 알림 메시지 템플릿 작성

**Story Points:** 3

---

### Story 6.9: Health Check Endpoint
**As a** DevOps 엔지니어
**I want to** 서버 헬스 체크 엔드포인트를 구현하고
**So that** 로드밸런서가 서버 상태를 확인할 수 있다

**Acceptance Criteria:**
- [ ] GET /health 엔드포인트
- [ ] DB 연결 상태 확인
- [ ] Redis 연결 상태 확인
- [ ] Response: { status: 'ok', database: 'up', redis: 'up' }

**Tasks:**
- [ ] HealthController 생성
- [ ] DB 연결 확인 로직
- [ ] Redis 연결 확인 로직

**Story Points:** 2

---

### Story 6.10: Grafana 대시보드 구축
**As a** DevOps 엔지니어
**I want to** Grafana 대시보드를 구축하고
**So that** 실시간 서버 상태를 모니터링할 수 있다

**Acceptance Criteria:**
- [ ] Grafana 설치 (Docker)
- [ ] CloudWatch Data Source 연동
- [ ] 대시보드 패널: CPU, Memory, API Latency, Error Rate
- [ ] 알림 규칙 설정 (CPU > 80%)

**Tasks:**
- [ ] Grafana Docker Compose 설정
- [ ] CloudWatch Data Source 추가
- [ ] 대시보드 JSON 작성
- [ ] 알림 채널 설정 (Slack)

**Story Points:** 5

## Technical Specifications

### Technology Stack
- **Logging**: Winston (Node.js)
- **Error Tracking**: Sentry
- **Cloud Logging**: AWS CloudWatch Logs
- **Monitoring**: Grafana + CloudWatch
- **Alerting**: Slack, PagerDuty (Phase 2)
- **Database**: PostgreSQL (AnalyticsEvent, AnalyticsStats)

### Architecture Decisions

#### 1. Winston vs Bunyan vs Pino
**Decision**: Winston

**Rationale**:
- **NestJS 통합**: nest-winston 공식 지원
- **Transports**: CloudWatch, File, Console 동시 지원
- **커뮤니티**: 가장 활발한 커뮤니티

#### 2. Sentry vs Rollbar vs Bugsnag
**Decision**: Sentry

**Rationale**:
- **무료 플랜**: 월 5,000 이벤트 (Phase 1 충분)
- **Performance Monitoring**: APM 기능 내장
- **Source Map**: TypeScript 스택 트레이스 지원

#### 3. Metrics Storage
**Decision**: CloudWatch Metrics (Phase 1), Prometheus (Phase 2)

**Rationale**:
- **Phase 1**: AWS 인프라 사용 시 CloudWatch 비용 효율적
- **Phase 2**: Prometheus + Grafana로 이전 (비용 절감)

### Database Schema

#### AnalyticsEvent Table
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),

  -- Event Info
  event_type VARCHAR(100) NOT NULL, -- 'flyer_view', 'flyer_search', 'user_signup'
  event_category VARCHAR(50), -- 'engagement', 'conversion', 'retention'
  metadata JSONB, -- { "flyerId": "...", "query": "치킨", "duration": 123 }

  -- Context
  ip_address INET,
  user_agent TEXT,
  platform VARCHAR(20), -- 'web', 'ios', 'android'
  app_version VARCHAR(20),

  -- Geolocation
  region_id UUID REFERENCES regions(id),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
```

#### AnalyticsStats Table (Daily Aggregation)
```sql
CREATE TABLE analytics_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,

  -- User Metrics
  dau INT DEFAULT 0, -- Daily Active Users
  new_users INT DEFAULT 0,
  returning_users INT DEFAULT 0,

  -- Engagement Metrics
  total_flyer_views INT DEFAULT 0,
  total_searches INT DEFAULT 0,
  avg_session_duration_seconds INT,

  -- Retention
  d1_retention_rate DECIMAL(5, 2), -- 1일 후 재방문률
  d7_retention_rate DECIMAL(5, 2),
  d30_retention_rate DECIMAL(5, 2),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_stats_date ON analytics_stats(date);
```

### Winston Configuration
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as CloudWatchTransport from 'winston-cloudwatch';

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),

    // File
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),

    // CloudWatch (Production only)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new CloudWatchTransport({
            logGroupName: '/aws/townin/backend',
            logStreamName: `${process.env.INSTANCE_ID}-${Date.now()}`,
            awsRegion: 'ap-northeast-2',
          }),
        ]
      : []),
  ],
});
```

### Sentry Configuration
```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of requests

  // Profiling
  profilesSampleRate: 0.1,

  integrations: [
    new ProfilingIntegration(),
  ],

  beforeSend(event, hint) {
    // Filter out 404 errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.status === 404) {
        return null;
      }
    }
    return event;
  },
});
```

### API Endpoints

#### Health Check APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | 서버 헬스 체크 | No |
| GET | `/health/database` | DB 연결 상태 | No |
| GET | `/health/redis` | Redis 연결 상태 | No |

#### Analytics APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/analytics/events` | 이벤트 추적 | Yes | All |
| GET | `/api/admin/analytics/dau-mau` | DAU/MAU 조회 | Yes | super_admin |
| GET | `/api/admin/analytics/retention` | Retention Rate | Yes | super_admin |
| GET | `/api/admin/analytics/events` | 이벤트 목록 | Yes | super_admin |

### Request/Response Examples

#### POST /api/analytics/events
**Request:**
```json
{
  "eventType": "flyer_view",
  "eventCategory": "engagement",
  "metadata": {
    "flyerId": "flyer-uuid",
    "merchantId": "merchant-uuid",
    "duration": 15000
  }
}
```

**Response (201 Created):**
```json
{
  "id": "event-uuid",
  "eventType": "flyer_view",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

#### GET /api/admin/analytics/dau-mau?startDate=2025-02-01&endDate=2025-02-28
**Response (200 OK):**
```json
{
  "data": [
    {
      "date": "2025-02-01",
      "dau": 1250,
      "newUsers": 120,
      "returningUsers": 1130,
      "totalFlyerViews": 5600,
      "totalSearches": 890
    }
  ],
  "summary": {
    "avgDau": 1200,
    "mau": 15000,
    "d1RetentionRate": 42.5,
    "d7RetentionRate": 28.3,
    "d30RetentionRate": 15.7
  }
}
```

### Environment Variables
```env
# Logging
LOG_LEVEL=info # debug, info, warn, error

# Sentry
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production

# CloudWatch
AWS_REGION=ap-northeast-2
CLOUDWATCH_LOG_GROUP=/aws/townin/backend
INSTANCE_ID=i-1234567890abcdef0

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ALERT_CHANNEL=#townin-alerts

# PagerDuty (Phase 2)
PAGERDUTY_API_KEY=your_pagerduty_api_key
```

## Testing Strategy

### Unit Tests
- [ ] Logger Sanitization 테스트 (비밀번호 필터링)
- [ ] AnalyticsService trackEvent 테스트
- [ ] DAU/MAU 계산 로직 테스트

### Integration Tests
- [ ] Sentry 에러 캡처 테스트
- [ ] CloudWatch Logs 전송 테스트 (Mocked)
- [ ] Health Check 엔드포인트 테스트

### E2E Tests
- [ ] 에러 발생 → Sentry 캡처 → Slack 알림 플로우
- [ ] 사용자 행동 → AnalyticsEvent 저장 → DAU 집계

## Deployment Checklist

### Pre-Deployment
- [ ] Sentry 프로젝트 생성 및 DSN 발급
- [ ] Slack Webhook URL 발급
- [ ] CloudWatch Log Group 생성
- [ ] IAM 정책 설정 (CloudWatch Logs)

### Deployment
- [ ] 환경 변수 설정
- [ ] Database Migration 실행 (AnalyticsEvent, AnalyticsStats)
- [ ] Source Map 업로드 (Sentry CLI)
- [ ] Grafana 대시보드 배포

### Post-Deployment
- [ ] 테스트 에러 발생 → Sentry 확인
- [ ] CloudWatch Logs 확인
- [ ] Slack 알림 테스트
- [ ] Grafana 대시보드 로딩 확인

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Sentry 할당량 초과 | Medium | Medium | 샘플링 레이트 조정 (10%) |
| CloudWatch Logs 비용 증가 | Medium | Low | 로그 보존 기간 30일 제한 |
| 민감 정보 로깅 | High | Low | Logger Sanitization, 정기 감사 |
| 에러 알림 폭주 (Alarm Fatigue) | Medium | Medium | 중복 알림 필터링, 임계값 설정 |
| AnalyticsEvent 테이블 비대화 | Medium | Medium | 파티셔닝, 90일 후 아카이빙 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System (userId 추적)
- **CORE-002**: Geospatial Data Infrastructure (regionId 추적)

### Blocks (Dependent Epics)
- All Epics (모든 기능에서 로깅/모니터링 사용)

## Related Epics

- **ADM-005**: Platform Activity Monitoring (실시간 활동 피드)
- **Phase 2 - Business Intelligence**: Metabase 대시보드

## Future Enhancements

### Phase 2
- Prometheus + Grafana (비용 절감)
- Business Intelligence (Metabase/Tableau)
- User Session Recording (FullStory)
- PagerDuty 통합 (중대 장애 알림)

### Phase 3
- A/B Testing Analytics
- Funnel Analysis (전환율 분석)
- Cohort Analysis (코호트 분석)

### Phase 4
- 실시간 로그 스트리밍 (Kafka + ELK)
- Machine Learning 기반 이상 탐지
- 글로벌 모니터링 (다지역)

## Notes

### CloudWatch Insights 쿼리 예제

**Top 10 Slowest APIs:**
```
fields @timestamp, method, url, duration
| filter @message like /API Request/
| sort duration desc
| limit 10
```

**Error Rate by Endpoint:**
```
fields @timestamp, url, statusCode
| filter statusCode >= 500
| stats count() by url
```

### Sentry Performance Monitoring
```typescript
import * as Sentry from '@sentry/node';

// Manual Transaction
const transaction = Sentry.startTransaction({
  op: 'flyer.create',
  name: 'Create Flyer',
});

try {
  // Business Logic
  await createFlyer(data);
} catch (error) {
  Sentry.captureException(error);
  throw error;
} finally {
  transaction.finish();
}
```

### Grafana Dashboard Panels
1. **API Latency**: CloudWatch Metric → AVG(Duration) by Endpoint
2. **Error Rate**: CloudWatch Metric → COUNT(StatusCode >= 500) / COUNT(*)
3. **CPU Usage**: CloudWatch Metric → CPUUtilization
4. **Memory Usage**: CloudWatch Metric → MemoryUtilization
5. **DB Connections**: RDS Metric → DatabaseConnections

### References
- Winston Documentation: https://github.com/winstonjs/winston
- Sentry Documentation: https://docs.sentry.io/platforms/node/
- CloudWatch Logs Insights: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html
- Grafana Documentation: https://grafana.com/docs/
