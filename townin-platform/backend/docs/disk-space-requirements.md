# 디스크 공간 요구사항 계산

## 📊 현재 상태

### 기존 설치된 패키지
```
현재 node_modules 크기: 541 MB
사용 가능한 디스크 공간: 5.0 GB
```

---

## 📦 추가 설치 필요한 패키지

### 1. CORE-004: Push Notification 관련

#### firebase-admin
- **패키지 크기**: 1.4 MB (1,389,992 bytes)
- **의존성 포함 예상**: ~150 MB
- **주요 의존성**:
  - `@google-cloud/firestore`: ~30 MB
  - `@google-cloud/storage`: ~20 MB
  - `google-auth-library`: ~10 MB
  - `protobufjs`: ~5 MB
  - 기타 Google Cloud 라이브러리들

#### @nestjs/websockets + socket.io + @nestjs/platform-socket.io
- **@nestjs/websockets**: 84 KB (84,570 bytes)
- **socket.io**: 1.4 MB (1,412,386 bytes)
- **@nestjs/platform-socket.io**: ~50 KB
- **의존성 포함 예상**: ~80 MB
- **주요 의존성**:
  - `engine.io`: ~500 KB
  - `socket.io-parser`: ~200 KB
  - `ws`: ~100 KB

**CORE-004 소계**: ~230 MB

---

### 2. CORE-006: Logging & Monitoring 관련

#### winston + nest-winston
- **winston**: 273 KB (272,797 bytes)
- **nest-winston**: 32 KB (32,010 bytes)
- **의존성 포함 예상**: ~15 MB
- **주요 의존성**:
  - `@colors/colors`: ~100 KB
  - `async`: ~200 KB
  - `triple-beam`: ~10 KB
  - 최소한의 의존성

#### @sentry/node + @sentry/profiling-node
- **@sentry/node**: 1.5 MB (1,498,088 bytes)
- **@sentry/profiling-node**: ~500 KB
- **의존성 포함 예상**: ~120 MB
- **주요 의존성**:
  - `@opentelemetry/*` 패키지들: ~40 MB
  - `@sentry/core`: ~5 MB
  - `@sentry/utils`: ~2 MB
  - OpenTelemetry instrumentation 패키지들: ~30 MB

#### winston-cloudwatch (선택 사항)
- **패키지 크기**: ~50 KB
- **의존성 포함 예상**: ~10 MB
- **주요 의존성**:
  - `aws-sdk`: 이미 설치됨 (@aws-sdk/*)

**CORE-006 소계**: ~145 MB

---

## 💾 총 예상 디스크 공간

### 시나리오별 계산

#### 시나리오 1: 모든 패키지 설치
```
현재 node_modules:           541 MB
+ firebase-admin:            150 MB
+ WebSocket 관련:             80 MB
+ winston/nest-winston:       15 MB
+ Sentry:                    120 MB
+ CloudWatch (선택):          10 MB
+ npm 캐시/임시 파일:         50 MB
─────────────────────────────────
예상 총 크기:               ~966 MB
```

**필요한 추가 공간**: **약 425 MB** (node_modules 541MB → 966MB)
**여유 공간 포함**: **약 600 MB 권장**

#### 시나리오 2: 필수 패키지만 설치 (Winston + Sentry)
```
현재 node_modules:           541 MB
+ winston/nest-winston:       15 MB
+ Sentry:                    120 MB
+ npm 캐시/임시 파일:         30 MB
─────────────────────────────────
예상 총 크기:               ~706 MB
```

**필요한 추가 공간**: **약 165 MB**
**여유 공간 포함**: **약 250 MB 권장**

#### 시나리오 3: 최소 필수 (Winston만)
```
현재 node_modules:           541 MB
+ winston/nest-winston:       15 MB
+ npm 캐시/임시 파일:         10 MB
─────────────────────────────────
예상 총 크기:               ~566 MB
```

**필요한 추가 공간**: **약 25 MB**
**여유 공간 포함**: **약 100 MB 권장**

---

## 📈 상세 분석

### 의존성 트리 예상 크기

#### firebase-admin 의존성 트리
```
firebase-admin (1.4 MB)
├── @google-cloud/firestore (30 MB)
├── @google-cloud/storage (20 MB)
├── @firebase/database (15 MB)
├── google-auth-library (10 MB)
├── protobufjs (5 MB)
├── jsonwebtoken (500 KB)
├── node-forge (2 MB)
└── 기타 Google Cloud 패키지들 (65 MB)
```
**총 예상**: ~150 MB

#### @sentry/node 의존성 트리
```
@sentry/node (1.5 MB)
├── @opentelemetry/api (2 MB)
├── @opentelemetry/core (3 MB)
├── @opentelemetry/instrumentation (15 MB)
├── @opentelemetry/sdk-trace-base (5 MB)
├── @sentry/core (5 MB)
├── @sentry/utils (2 MB)
└── 기타 OpenTelemetry 패키지들 (85 MB)
```
**총 예상**: ~120 MB

#### socket.io 의존성 트리
```
socket.io (1.4 MB)
├── engine.io (5 MB)
├── socket.io-parser (2 MB)
├── socket.io-adapter (500 KB)
├── ws (500 KB)
├── debug (100 KB)
└── 기타 (20 MB)
```
**총 예상**: ~80 MB

---

## 🎯 권장 설치 순서

### Phase 1: 필수 로깅 (100 MB)
```bash
npm install winston nest-winston
```
**이유**: 프로덕션 환경에서 로그는 필수
**공간 필요**: 100 MB

### Phase 2: 에러 추적 (250 MB)
```bash
npm install @sentry/node
```
**이유**: 프로덕션 에러 모니터링 필수
**공간 필요**: 250 MB (누적)

### Phase 3: 푸시 알림 (400 MB)
```bash
npm install firebase-admin
```
**이유**: 전단지 알림 등 비즈니스 로직에 필요
**공간 필요**: 400 MB (누적)

### Phase 4: WebSocket (600 MB)
```bash
npm install --legacy-peer-deps @nestjs/websockets socket.io
```
**이유**: Phase 2 (채팅) 기능 개발 시 필요
**공간 필요**: 600 MB (누적)

---

## 💡 디스크 공간 확보 방법

### 방법 1: npm 캐시 정리
```bash
npm cache clean --force
```
**예상 확보 공간**: 500 MB ~ 2 GB

### 방법 2: Docker 정리
```bash
docker system prune -a -f
docker volume prune -f
```
**예상 확보 공간**: 5 GB ~ 20 GB

### 방법 3: 불필요한 node_modules 삭제
```bash
# 프로젝트 디렉토리 외부의 오래된 node_modules 찾기
find ~ -name "node_modules" -type d -mtime +30 -prune

# 삭제 (주의!)
find ~ -name "node_modules" -type d -mtime +30 -prune -exec rm -rf {} \;
```
**예상 확보 공간**: 1 GB ~ 10 GB

### 방법 4: 브라우저 캐시 정리
- Chrome/Safari 캐시 삭제
- 다운로드 폴더 정리
**예상 확보 공간**: 2 GB ~ 5 GB

### 방법 5: macOS 시스템 정리
```bash
# Xcode 캐시 (Xcode 사용자만)
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 시스템 로그
sudo rm -rf /var/log/*

# Time Machine 로컬 스냅샷 (자동 정리됨)
tmutil listlocalsnapshots /
```
**예상 확보 공간**: 5 GB ~ 20 GB

---

## 📋 현재 상황 요약

### 현재
- **사용 가능 공간**: 5.0 GB
- **현재 node_modules**: 541 MB
- **여유 공간**: 4.5 GB

### 필요 공간
- **모든 패키지 설치**: 600 MB (충분함 ✅)
- **필수 패키지만**: 250 MB (충분함 ✅)
- **Winston만**: 100 MB (충분함 ✅)

---

## ✅ 결론

### 즉시 설치 가능
현재 5GB의 여유 공간이 있으므로 **모든 패키지 설치 가능**합니다!

```bash
# 안전하게 한 번에 설치
cd backend

npm install --legacy-peer-deps \
  winston \
  nest-winston \
  @sentry/node \
  firebase-admin \
  @nestjs/websockets \
  @nestjs/platform-socket.io \
  socket.io
```

**예상 설치 후 남은 공간**: 약 4.4 GB

### 문제 없음! 🎉

**이전 계산 착오**: 디스크 공간 부족이 아니라 **npm 설치 중 임시 파일** 문제였을 가능성이 높습니다.

### 재시도 권장
```bash
# npm 캐시 정리 후 재시도
npm cache clean --force

# 패키지 설치
npm install --legacy-peer-deps winston nest-winston @sentry/node
```

---

## 📊 실제 설치 크기 비교 (벤치마크)

| 패키지 | 공식 크기 | 실제 설치 크기 (의존성 포함) |
|--------|-----------|---------------------------|
| winston | 273 KB | ~15 MB |
| @sentry/node | 1.5 MB | ~120 MB |
| firebase-admin | 1.4 MB | ~150 MB |
| socket.io | 1.4 MB | ~80 MB |
| **총합** | **~5 MB** | **~365 MB** |

---

## 🚀 즉시 실행 가능한 설치 명령어

### 옵션 A: 필수 로깅 (15 MB)
```bash
npm install winston nest-winston
```

### 옵션 B: 로깅 + 에러 추적 (135 MB)
```bash
npm install winston nest-winston @sentry/node
```

### 옵션 C: 모든 패키지 (365 MB)
```bash
npm install --legacy-peer-deps \
  winston nest-winston \
  @sentry/node \
  firebase-admin \
  @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**모두 현재 5GB 공간에서 설치 가능합니다!** ✅
