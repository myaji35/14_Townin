# Townin Graph - GCP 배포 빠른 시작 가이드

기존 GCP 프로젝트 **sd-kanban-api**를 사용하여 Townin Graph를 배포합니다.

---

## 1단계: GCP 인프라 설정 (15분)

### 사전 확인
```bash
# gcloud 설치 확인
gcloud --version

# 로그인
gcloud auth login

# 프로젝트 확인
gcloud projects list | grep sd-kanban-api
```

### 자동 설정 스크립트 실행
```bash
cd backend
./scripts/setup-gcp-existing.sh
```

**스크립트가 수행하는 작업:**
- ✅ 프로젝트 이름을 "Townin Graph"로 변경
- ✅ 필요한 GCP API 활성화
- ✅ Cloud SQL PostgreSQL 인스턴스 생성
- ✅ Secret Manager에 환경 변수 저장
- ✅ Cloud Storage 버킷 생성
- ✅ GitHub Actions 서비스 계정 생성

**입력해야 할 정보:**
- PostgreSQL root 비밀번호 (안전하게 보관!)
- Townin 사용자 비밀번호 (안전하게 보관!)
- JWT Secret (선택 - 자동 생성 가능)
- JWT Refresh Secret (선택 - 자동 생성 가능)

---

## 2단계: PostgreSQL 확장 설치 (5분)

```bash
# Cloud SQL에 연결
gcloud sql connect townin-db --user=postgres

# PostgreSQL 쉘에서 실행
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# 설치 확인
\dx

# 종료
\q
```

---

## 3단계: GitHub Secrets 설정 (2분)

### GitHub Repository → Settings → Secrets and variables → Actions

**두 개의 Secret 추가:**

1. **GCP_PROJECT_ID**
   ```
   sd-kanban-api
   ```

2. **GCP_SA_KEY**
   ```bash
   # 서비스 계정 키 내용 복사
   cat ~/gcp-key-townin-graph.json
   ```
   전체 JSON 내용을 복사하여 GitHub Secret에 붙여넣기

---

## 4단계: 첫 배포 (10분)

### 로컬에서 직접 배포

```bash
cd backend

# 배포 스크립트 실행
./scripts/deploy-to-cloudrun.sh
```

**또는 GitHub Actions로 자동 배포:**

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "chore: initial GCP deployment setup"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황 확인

---

## 5단계: 배포 확인 (2분)

```bash
# 배포 상태 확인
./scripts/verify-deployment.sh
```

### 수동 확인

```bash
# 서비스 URL 가져오기
SERVICE_URL=$(gcloud run services describe townin-backend \
  --region asia-northeast3 \
  --format 'value(status.url)')

echo "Service URL: $SERVICE_URL"

# Health 체크
curl $SERVICE_URL/health

# API 문서 (브라우저에서 열기)
echo "$SERVICE_URL/api/docs"
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T...",
  "database": "connected"
}
```

---

## 주요 정보 요약

### GCP 리소스

| 리소스 | 이름/ID | 위치 |
|--------|---------|------|
| 프로젝트 ID | `sd-kanban-api` | - |
| 프로젝트 이름 | Townin Graph | - |
| Cloud SQL | `townin-db` | asia-northeast3 |
| Database | `townin_db` | - |
| Cloud Run Service | `townin-backend` | asia-northeast3 |
| Storage Bucket (Flyers) | `sd-kanban-api-flyer-images` | asia-northeast3 |
| Storage Bucket (Public) | `sd-kanban-api-public-data` | asia-northeast3 |

### Secrets in Secret Manager

- `jwt-secret` - JWT 토큰 서명 키
- `jwt-refresh-secret` - Refresh 토큰 서명 키
- `database-url` - Cloud SQL 연결 문자열

### Service Accounts

- **Default**: `{PROJECT_NUMBER}-compute@developer.gserviceaccount.com`
  - Cloud Run 실행에 사용
  - Secret Manager 접근 권한 보유

- **GitHub Actions**: `github-actions@sd-kanban-api.iam.gserviceaccount.com`
  - CI/CD 배포에 사용
  - Cloud Run, Storage, IAM 권한 보유

---

## 다음 단계

### 1. 모니터링 설정
```bash
# 로그 확인
gcloud logging read "resource.type=cloud_run_revision \
  AND resource.labels.service_name=townin-backend" \
  --limit 50 \
  --format json

# Uptime 체크 생성
gcloud monitoring uptime create-http townin-health-check \
  --display-name="Townin Health Check" \
  --resource-url="$SERVICE_URL/health" \
  --check-interval=60s
```

### 2. 커스텀 도메인 연결 (선택사항)
```bash
# 도메인 매핑
gcloud run domain-mappings create \
  --service townin-backend \
  --domain api.townin.kr \
  --region asia-northeast3
```

### 3. 프론트엔드 배포
```bash
cd frontend

# Flutter Web 빌드
flutter build web --release

# Cloud Run에 배포 (또는 Firebase Hosting 사용)
docker build -t gcr.io/sd-kanban-api/townin-frontend:latest .
docker push gcr.io/sd-kanban-api/townin-frontend:latest

gcloud run deploy townin-frontend \
  --image gcr.io/sd-kanban-api/townin-frontend:latest \
  --region asia-northeast3 \
  --allow-unauthenticated
```

---

## 트러블슈팅

### 문제: Cloud SQL 연결 실패

```bash
# 인스턴스 상태 확인
gcloud sql instances describe townin-db

# Cloud Run에 SQL 인스턴스 연결 확인
gcloud run services describe townin-backend \
  --region asia-northeast3 \
  --format="value(spec.template.metadata.annotations)"
```

### 문제: Secret 접근 권한 오류

```bash
# Secret IAM 정책 확인
gcloud secrets get-iam-policy jwt-secret

# 권한 재부여
PROJECT_NUMBER=$(gcloud projects describe sd-kanban-api --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### 문제: 배포 실패

```bash
# Cloud Build 로그 확인
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]

# Cloud Run 로그 확인
gcloud run services logs read townin-backend \
  --region asia-northeast3 \
  --limit 100
```

---

## 비용 관리

### 예상 월 비용 (개발 환경)

- **Cloud SQL** (db-f1-micro): $7-10
- **Cloud Run** (저트래픽): $5-15
- **Cloud Storage**: $1-5
- **기타** (Network, Logs): $2-5

**총 예상**: **$15-35/월**

### 비용 절감 팁

1. **Cloud SQL 자동 종료** (개발 시)
   ```bash
   gcloud sql instances patch townin-db --activation-policy=NEVER
   # 사용 시: --activation-policy=ALWAYS
   ```

2. **Cloud Run 최소 인스턴스 0으로 설정**
   ```bash
   gcloud run services update townin-backend \
     --region asia-northeast3 \
     --min-instances 0
   ```

3. **예산 알림 설정**
   ```bash
   # GCP Console → Billing → Budgets & alerts
   # 월 $30 예산 설정 및 50%, 90%, 100% 알림
   ```

---

## 유용한 명령어

```bash
# 서비스 상태 확인
gcloud run services list --region asia-northeast3

# 서비스 URL 가져오기
gcloud run services describe townin-backend \
  --region asia-northeast3 \
  --format='value(status.url)'

# 최근 로그 보기
gcloud run services logs read townin-backend \
  --region asia-northeast3 \
  --limit 50

# 서비스 삭제 (필요 시)
gcloud run services delete townin-backend --region asia-northeast3

# Cloud SQL 백업 목록
gcloud sql backups list --instance=townin-db

# Storage 사용량 확인
gsutil du -sh gs://sd-kanban-api-flyer-images
```

---

## 지원 및 문서

- **GCP Console**: https://console.cloud.google.com
- **프로젝트 대시보드**: https://console.cloud.google.com/home/dashboard?project=sd-kanban-api
- **Cloud Run 서비스**: https://console.cloud.google.com/run?project=sd-kanban-api
- **Cloud SQL**: https://console.cloud.google.com/sql?project=sd-kanban-api

**상세 가이드**: `docs/GCP-Deployment-Guide.md`
**체크리스트**: `docs/DEPLOYMENT-CHECKLIST.md`

---

**배포 성공하시면, Service URL을 확인하고 API 문서(`/api/docs`)에서 엔드포인트를 테스트해보세요!** 🚀
