# Epic: CORE-005 - File Upload & CDN

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-005 |
| **Epic Title** | File Upload & CDN |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 5 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
타운인은 전단지 이미지, 프로필 사진, 상점 로고 등 대량의 이미지 파일을 처리해야 합니다. Phase 2에서는 전단지 AI 스캔을 위한 고해상도 이미지, Phase 3에서는 보험 관련 서류 등도 처리해야 합니다. 안전하고 확장 가능한 파일 저장 및 CDN 인프라가 필요합니다.

### Business Value
- **성능**: CDN을 통한 빠른 이미지 로딩 (< 500ms)
- **비용 절감**: S3 Intelligent-Tiering으로 스토리지 비용 최적화
- **보안**: 서명된 URL (Signed URL)로 민감한 파일 보호
- **확장성**: 무제한 파일 저장 (S3)

### Target Users
- **상인**: 전단지 이미지, 상점 로고 업로드
- **사용자**: 프로필 사진 업로드
- **보안관**: 지역 활동 사진 업로드
- **FP 전문가**: 프로필 사진, 자격증 업로드 (Phase 3)

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 업로드 성공률 | ≥ 99% | 성공 / 전체 업로드 시도 |
| 업로드 시간 | < 3초 | 5MB 이미지 업로드 평균 시간 |
| CDN 캐시 히트율 | ≥ 90% | CloudFront 캐시 히트 비율 |
| 이미지 로딩 시간 | < 500ms | CDN을 통한 이미지 로드 시간 |
| 스토리지 비용 | < $50/월 | Phase 1 예상 비용 (10GB) |

## Epic Scope

### In Scope
✅ **File Upload**
- 이미지 업로드 (JPEG, PNG, WebP)
- 파일 크기 제한 (최대 10MB)
- 파일 형식 검증 (MIME Type)
- Multipart Upload (대용량 파일)

✅ **S3 Integration**
- AWS S3 버킷 생성 및 설정
- IAM 정책 (최소 권한)
- 버킷 폴더 구조 (users/, flyers/, merchants/)
- S3 Lifecycle Policy (90일 후 Glacier 이동)

✅ **Image Processing**
- 이미지 리사이징 (thumbnail, medium, large)
- WebP 변환 (용량 30% 절감)
- 메타데이터 추출 (EXIF)
- 자동 회전 (EXIF Orientation)

✅ **CDN (CloudFront)**
- CloudFront Distribution 생성
- Cache Policy 설정 (TTL 7일)
- Gzip/Brotli 압축
- HTTPS 인증서

✅ **Signed URL**
- 임시 업로드 URL (15분 유효)
- 보안 파일 다운로드 URL (1시간 유효)

✅ **File Metadata Management**
- File 테이블 (URL, size, mime_type, uploaded_by)
- 파일 삭제 (Soft Delete)

### Out of Scope
❌ 동영상 업로드/스트리밍 - Phase 2
❌ PDF/문서 업로드 - Phase 3 (보험 서류)
❌ 파일 바이러스 스캔 - Phase 3
❌ 실시간 이미지 편집 (필터, 크롭) - Phase 2

## User Stories

### Story 5.1: AWS S3 버킷 설정
**As a** DevOps 엔지니어
**I want to** S3 버킷을 생성하고 설정하고
**So that** 파일을 안전하게 저장할 수 있다

**Acceptance Criteria:**
- [ ] S3 버킷 생성 (townin-uploads-prod)
- [ ] 퍼블릭 액세스 차단 (Block Public Access)
- [ ] 버전 관리 활성화
- [ ] 서버 측 암호화 (SSE-S3)
- [ ] Lifecycle Policy: 90일 후 Standard-IA → 180일 후 Glacier
- [ ] IAM 사용자 생성 (s3-upload-user, 최소 권한)

**Tasks:**
- [ ] AWS Console에서 S3 버킷 생성
- [ ] IAM 정책 작성 (s3:PutObject, s3:GetObject, s3:DeleteObject)
- [ ] Access Key 발급 및 환경 변수 설정
- [ ] Lifecycle Policy 적용

**Story Points:** 2

---

### Story 5.2: 파일 업로드 API (Direct Upload)
**As a** 사용자
**I want to** 이미지를 업로드하고
**So that** 프로필 사진/전단지를 등록할 수 있다

**Acceptance Criteria:**
- [ ] POST /api/files/upload 엔드포인트
- [ ] Multipart/form-data 지원
- [ ] 파일 크기 제한 (최대 10MB)
- [ ] 파일 형식 검증 (image/jpeg, image/png, image/webp)
- [ ] 고유 파일명 생성 (UUID + timestamp)
- [ ] S3 업로드 후 URL 반환

**Tasks:**
- [ ] FileUploadController 생성
- [ ] Multer 미들웨어 설정 (메모리 스토리지)
- [ ] S3Service 생성 (AWS SDK v3)
- [ ] 파일 검증 로직 (크기, MIME Type)
- [ ] S3 업로드 함수 구현

**Story Points:** 3

---

### Story 5.3: Presigned URL을 통한 클라이언트 직접 업로드
**As a** 프론트엔드 개발자
**I want to** Presigned URL을 발급받아 클라이언트에서 직접 S3에 업로드하고
**So that** 서버 부하를 줄이고 업로드 속도를 높일 수 있다

**Acceptance Criteria:**
- [ ] POST /api/files/presigned-url 엔드포인트
- [ ] Request: fileName, fileType, fileSize
- [ ] Response: presignedUrl, expiresIn (15분)
- [ ] 업로드 완료 후 POST /api/files/confirm으로 DB 저장
- [ ] 클라이언트 JavaScript 예제 제공

**Tasks:**
- [ ] getPresignedUrl(key, contentType) 함수 구현
- [ ] POST /api/files/presigned-url 구현
- [ ] POST /api/files/confirm 구현
- [ ] 클라이언트 업로드 가이드 문서 작성

**Story Points:** 3

---

### Story 5.4: 이미지 리사이징 (Sharp)
**As a** 시스템
**I want to** 업로드된 이미지를 자동으로 리사이징하고
**So that** 다양한 디바이스에서 최적화된 이미지를 제공할 수 있다

**Acceptance Criteria:**
- [ ] Sharp 라이브러리 사용
- [ ] 3가지 크기 생성: thumbnail (150x150), medium (800x600), large (1920x1080)
- [ ] 원본 이미지 유지
- [ ] WebP 변환 (용량 30% 절감)
- [ ] S3에 각 크기별 업로드 (폴더: /original, /thumbnail, /medium, /large)

**Tasks:**
- [ ] Sharp 라이브러리 설치
- [ ] ImageProcessingService 생성
- [ ] resize(buffer, size) 함수 구현
- [ ] convertToWebP(buffer) 함수 구현
- [ ] 업로드 후 리사이징 트리거 (EventEmitter)

**Story Points:** 5

---

### Story 5.5: CloudFront CDN 설정
**As a** DevOps 엔지니어
**I want to** CloudFront Distribution을 설정하고
**So that** 빠른 이미지 로딩을 제공할 수 있다

**Acceptance Criteria:**
- [ ] CloudFront Distribution 생성 (Origin: S3 버킷)
- [ ] Cache Policy: TTL 7일 (이미지는 거의 변하지 않음)
- [ ] Gzip/Brotli 압축 활성화
- [ ] HTTPS 인증서 (ACM)
- [ ] Custom Domain: cdn.townin.kr

**Tasks:**
- [ ] CloudFront Distribution 생성
- [ ] Origin Access Identity (OAI) 설정
- [ ] S3 버킷 정책 업데이트 (CloudFront만 접근 허용)
- [ ] ACM 인증서 발급 (Route 53 검증)
- [ ] DNS 레코드 추가 (cdn.townin.kr → CloudFront)

**Story Points:** 3

---

### Story 5.6: 파일 메타데이터 관리
**As a** 시스템 관리자
**I want to** 업로드된 파일 정보를 DB에 저장하고
**So that** 파일 사용 현황을 추적할 수 있다

**Acceptance Criteria:**
- [ ] File 테이블 (id, original_name, key, url, size, mime_type, uploaded_by)
- [ ] 파일 목록 조회 API (GET /api/files)
- [ ] 파일 삭제 API (DELETE /api/files/:id) - Soft Delete
- [ ] 실제 S3 파일 삭제는 Cron Job (7일 후)

**Tasks:**
- [ ] File 엔티티 생성
- [ ] FileController CRUD 구현
- [ ] Soft Delete 로직 (deleted_at)
- [ ] S3 파일 삭제 Cron Job

**Story Points:** 3

---

### Story 5.7: 파일 다운로드 Signed URL
**As a** 시스템
**I want to** 민감한 파일(예: 보험 서류)을 Signed URL로 보호하고
**So that** 권한 있는 사용자만 다운로드할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/files/:id/download 엔드포인트
- [ ] 권한 검증 (소유자 또는 관리자)
- [ ] Signed URL 발급 (1시간 유효)
- [ ] 다운로드 이력 기록

**Tasks:**
- [ ] getSignedDownloadUrl(key, expiresIn) 함수 구현
- [ ] GET /api/files/:id/download 구현
- [ ] 권한 검증 로직
- [ ] 다운로드 이력 테이블 (FileDownloadLog)

**Story Points:** 3

---

### Story 5.8: 이미지 최적화 및 WebP 변환
**As a** 시스템
**I want to** 모든 이미지를 WebP로 변환하고
**So that** 대역폭을 절감하고 로딩 속도를 높일 수 있다

**Acceptance Criteria:**
- [ ] JPEG/PNG → WebP 자동 변환
- [ ] 원본 이미지도 유지 (호환성)
- [ ] Content-Type 헤더 기반 WebP 제공 (Accept: image/webp)
- [ ] 품질 설정 (quality: 80)

**Tasks:**
- [ ] Sharp WebP 변환 로직
- [ ] S3에 WebP 버전 별도 저장 (/original.webp, /thumbnail.webp)
- [ ] CloudFront에서 Accept 헤더 기반 라우팅

**Story Points:** 3

---

### Story 5.9: 파일 업로드 진행률 표시 (Optional)
**As a** 사용자
**I want to** 업로드 진행률을 확인하고
**So that** 대용량 파일 업로드 시 기다릴 수 있다

**Acceptance Criteria:**
- [ ] 클라이언트에서 xhr.upload.onprogress 이벤트 사용
- [ ] 진행률 퍼센트 표시
- [ ] 업로드 취소 버튼

**Tasks:**
- [ ] 프론트엔드 가이드 작성 (Axios 업로드 진행률)

**Story Points:** 2

---

### Story 5.10: 파일 업로드 모니터링
**As a** 시스템 관리자
**I want to** 파일 업로드 현황을 모니터링하고
**So that** 스토리지 비용 및 트래픽을 관리할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/admin/files/stats 엔드포인트
- [ ] 통계: 총 파일 수, 총 용량, 일별 업로드 건수
- [ ] S3 버킷 크기 모니터링
- [ ] CloudFront 트래픽 모니터링

**Tasks:**
- [ ] FileStats 집계 쿼리
- [ ] S3 GetBucketSize 스크립트
- [ ] CloudWatch 메트릭 통합

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Storage**: AWS S3
- **CDN**: AWS CloudFront
- **Image Processing**: Sharp (libvips)
- **SDK**: AWS SDK v3 (@aws-sdk/client-s3)
- **Upload**: Multer (NestJS)

### Architecture Decisions

#### 1. Direct Upload vs Presigned URL
**Decision**: Presigned URL (우선), Direct Upload (Fallback)

**Rationale**:
- **서버 부하 감소**: 클라이언트가 직접 S3에 업로드
- **속도**: 서버를 거치지 않아 빠름
- **비용 절감**: 서버 대역폭 절약

**Trade-offs**:
- 클라이언트 구현 복잡도 증가 → 가이드 문서 제공

#### 2. Image Processing Timing
**Decision**: 업로드 후 비동기 처리

**Rationale**:
- **사용자 경험**: 업로드 즉시 응답 (리사이징 기다리지 않음)
- **확장성**: Queue 기반 처리로 부하 분산

**구현**:
- EventEmitter: file.uploaded 이벤트 발행
- Listener: 이미지 리사이징 후 S3 업로드

#### 3. CDN Cache Strategy
**Decision**: 7일 TTL, 버전 쿼리 파라미터

**Rationale**:
- **성능**: 긴 TTL로 캐시 히트율 최대화
- **갱신**: 파일 변경 시 ?v=timestamp 쿼리 파라미터 추가

### Database Schema

#### File Table
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name VARCHAR(255) NOT NULL,
  key VARCHAR(500) UNIQUE NOT NULL, -- S3 Key (예: flyers/2025/02/uuid.jpg)
  url TEXT NOT NULL, -- CloudFront URL

  -- File Info
  size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  extension VARCHAR(10),

  -- Variants
  has_thumbnail BOOLEAN DEFAULT FALSE,
  has_medium BOOLEAN DEFAULT FALSE,
  has_large BOOLEAN DEFAULT FALSE,
  has_webp BOOLEAN DEFAULT FALSE,

  -- Metadata
  uploaded_by UUID REFERENCES users(id),
  entity_type VARCHAR(50), -- 'user_profile', 'flyer', 'merchant_logo'
  entity_id UUID,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_entity_type_id ON files(entity_type, entity_id);
CREATE INDEX idx_files_key ON files(key);
CREATE INDEX idx_files_is_deleted ON files(is_deleted);
```

#### FileDownloadLog Table (Phase 3 - 민감 파일용)
```sql
CREATE TABLE file_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_download_logs_file_id ON file_download_logs(file_id);
CREATE INDEX idx_file_download_logs_user_id ON file_download_logs(user_id);
```

### S3 Bucket Structure
```
townin-uploads-prod/
├── users/
│   ├── 2025/
│   │   ├── 02/
│   │   │   ├── {uuid}/
│   │   │   │   ├── original.jpg
│   │   │   │   ├── original.webp
│   │   │   │   ├── thumbnail.jpg
│   │   │   │   ├── thumbnail.webp
│   │   │   │   ├── medium.jpg
│   │   │   │   ├── large.jpg
├── flyers/
│   ├── 2025/02/{uuid}/...
├── merchants/
│   ├── logos/2025/02/{uuid}/...
│   ├── photos/2025/02/{uuid}/...
```

### API Endpoints

#### File Upload APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/files/upload` | 직접 업로드 (서버 경유) | Yes | All |
| POST | `/api/files/presigned-url` | Presigned URL 발급 | Yes | All |
| POST | `/api/files/confirm` | 업로드 완료 확인 | Yes | All |

#### File Management APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/files` | 파일 목록 조회 | Yes | All |
| GET | `/api/files/:id` | 파일 상세 조회 | Yes | All |
| DELETE | `/api/files/:id` | 파일 삭제 (Soft) | Yes | All |
| GET | `/api/files/:id/download` | Signed URL 발급 | Yes | All |

#### Admin APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/admin/files/stats` | 파일 통계 | Yes | super_admin |
| GET | `/api/admin/files/storage-usage` | 스토리지 사용량 | Yes | super_admin |

### Request/Response Examples

#### POST /api/files/presigned-url
**Request:**
```json
{
  "fileName": "flyer-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 5242880,
  "entityType": "flyer"
}
```

**Response (200 OK):**
```json
{
  "presignedUrl": "https://townin-uploads-prod.s3.ap-northeast-2.amazonaws.com/flyers/2025/02/uuid.jpg?X-Amz-Algorithm=...",
  "key": "flyers/2025/02/uuid.jpg",
  "expiresIn": 900,
  "uploadId": "upload-uuid"
}
```

#### POST /api/files/confirm
**Request:**
```json
{
  "uploadId": "upload-uuid",
  "key": "flyers/2025/02/uuid.jpg",
  "originalName": "flyer-image.jpg",
  "size": 5242880,
  "mimeType": "image/jpeg"
}
```

**Response (201 Created):**
```json
{
  "id": "file-uuid",
  "url": "https://cdn.townin.kr/flyers/2025/02/uuid.jpg",
  "thumbnailUrl": "https://cdn.townin.kr/flyers/2025/02/uuid/thumbnail.webp",
  "mediumUrl": "https://cdn.townin.kr/flyers/2025/02/uuid/medium.webp",
  "size": 5242880,
  "mimeType": "image/jpeg",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

### Environment Variables
```env
# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=townin-uploads-prod

# CloudFront
CLOUDFRONT_DOMAIN=cdn.townin.kr
CLOUDFRONT_DISTRIBUTION_ID=E123456789ABCD

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

# Presigned URL
PRESIGNED_URL_EXPIRES_IN=900 # 15 minutes
```

## Testing Strategy

### Unit Tests
- [ ] S3 업로드 함수 테스트 (Mocked AWS SDK)
- [ ] Presigned URL 생성 테스트
- [ ] 이미지 리사이징 테스트 (Sharp)
- [ ] 파일 검증 로직 테스트 (크기, MIME Type)

### Integration Tests
- [ ] 전체 업로드 플로우 (Presigned URL → S3 → DB)
- [ ] 이미지 리사이징 → S3 업로드 플로우
- [ ] 파일 삭제 Soft Delete 테스트

### E2E Tests
- [ ] 프론트엔드 → Presigned URL → S3 → 확인 플로우
- [ ] CloudFront를 통한 이미지 로딩 테스트

### Performance Tests
- [ ] 5MB 이미지 업로드 < 3초
- [ ] 이미지 리사이징 (3가지 크기) < 2초
- [ ] CDN 캐시 히트율 ≥ 90%

## Deployment Checklist

### Pre-Deployment
- [ ] AWS 계정 준비
- [ ] S3 버킷 생성
- [ ] CloudFront Distribution 생성
- [ ] IAM 사용자 및 정책 설정
- [ ] ACM 인증서 발급

### Deployment
- [ ] 환경 변수 설정
- [ ] Database Migration 실행
- [ ] Sharp 라이브러리 의존성 설치

### Post-Deployment
- [ ] 테스트 이미지 업로드
- [ ] CloudFront 캐시 동작 확인
- [ ] S3 버킷 크기 모니터링 설정

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| S3 장애 | High | Very Low | 다중 AZ, 버전 관리 활성화 |
| CloudFront 캐시 미스 | Medium | Low | Cache Policy 최적화, TTL 7일 |
| 대용량 파일 업로드 실패 | Medium | Medium | Multipart Upload, 재시도 로직 |
| 스토리지 비용 초과 | Medium | Low | Lifecycle Policy, Intelligent-Tiering |
| 악의적 파일 업로드 | High | Medium | MIME Type 검증, 바이러스 스캔 (Phase 3) |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System (파일 업로드 인증)

### Blocks (Dependent Epics)
- **USR-002**: User Profile & Hub Management (프로필 사진)
- **MRC-001**: Merchant Onboarding (상점 로고)
- **MRC-003**: Flyer Creation & Management (전단지 이미지)

## Related Epics

- **Phase 2 - MRC-006**: AI Flyer Scanner (고해상도 이미지 업로드)
- **Phase 3 - INS**: Insurance Module (보험 서류 업로드)

## Future Enhancements

### Phase 2
- 동영상 업로드 및 스트리밍 (HLS)
- 이미지 편집 (크롭, 필터, 회전)
- 파일 압축 (ZIP)

### Phase 3
- PDF 업로드 (보험 서류)
- 바이러스 스캔 (ClamAV)
- AI 기반 이미지 태깅

### Phase 4
- 글로벌 CDN (Cloudflare)
- 블록체인 기반 파일 무결성 검증

## Notes

### Sharp Image Processing Example
```typescript
import sharp from 'sharp';

async function resizeImage(buffer: Buffer) {
  const thumbnail = await sharp(buffer)
    .resize(150, 150, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const medium = await sharp(buffer)
    .resize(800, 600, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  const large = await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  return { thumbnail, medium, large };
}
```

### S3 Presigned URL Example
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: 'townin-uploads-prod',
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return url;
}
```

### CloudFront Cache Policy (JSON)
```json
{
  "CachePolicyConfig": {
    "Name": "TowninImagesCachePolicy",
    "DefaultTTL": 604800,
    "MaxTTL": 31536000,
    "MinTTL": 1,
    "ParametersInCacheKeyAndForwardedToOrigin": {
      "EnableAcceptEncodingGzip": true,
      "EnableAcceptEncodingBrotli": true,
      "QueryStringsConfig": {
        "QueryStringBehavior": "whitelist",
        "QueryStrings": ["v"]
      }
    }
  }
}
```

### References
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- CloudFront Documentation: https://docs.aws.amazon.com/cloudfront/
- Sharp Documentation: https://sharp.pixelplumbing.com/
- NestJS File Upload: https://docs.nestjs.com/techniques/file-upload
