# Townin Platform - GCP 배포 가이드

## 목차
1. [사전 준비](#사전-준비)
2. [GCP 프로젝트 설정](#gcp-프로젝트-설정)
3. [Cloud SQL (PostgreSQL) 설정](#cloud-sql-설정)
4. [Secret Manager 설정](#secret-manager-설정)
5. [Cloud Storage 설정](#cloud-storage-설정)
6. [Cloud Run 배포](#cloud-run-배포)
7. [CI/CD 설정](#cicd-설정)
8. [모니터링 설정](#모니터링-설정)

---

## 사전 준비

### 필수 도구 설치
```bash
# Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Docker
# https://docs.docker.com/get-docker/

# GitHub CLI (선택사항)
brew install gh  # macOS
```

### GCP 계정 및 프로젝트
1. GCP 계정 생성: https://console.cloud.google.com
2. 새 프로젝트 생성
3. 결제 계정 연결

---

## GCP 프로젝트 설정

### 1. 프로젝트 변수 설정
```bash
export PROJECT_ID="townin-platform"
export REGION="asia-northeast3"  # Seoul
export SERVICE_NAME="townin-backend"

gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION
```

### 2. 필요한 API 활성화
```bash
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  storage-component.googleapis.com \
  container registry.googleapis.com
```

---

## Cloud SQL 설정

### 1. PostgreSQL 인스턴스 생성
```bash
gcloud sql instances create townin-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=[STRONG_PASSWORD] \
  --database-flags=cloudsql.iam_authentication=on

# 데이터베이스 생성
gcloud sql databases create townin_db --instance=townin-db

# 사용자 생성
gcloud sql users create townin \
  --instance=townin-db \
  --password=[STRONG_PASSWORD]
```

### 2. Cloud SQL Proxy 설정 (로컬 테스트용)
```bash
# Cloud SQL Proxy 다운로드
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy

# 프록시 실행
./cloud_sql_proxy -instances=$PROJECT_ID:$REGION:townin-db=tcp:5432
```

### 3. PostGIS 확장 설치
```sql
-- psql로 연결 후
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS h3;
```

---

## Secret Manager 설정

### 1. Secrets 생성
```bash
# JWT Secret
echo -n "your-super-secret-jwt-key-change-this" | \
  gcloud secrets create jwt-secret --data-file=-

# JWT Refresh Secret
echo -n "your-super-secret-refresh-key-change-this" | \
  gcloud secrets create jwt-refresh-secret --data-file=-

# Database URL
echo -n "postgresql://townin:[PASSWORD]@/townin_db?host=/cloudsql/$PROJECT_ID:$REGION:townin-db" | \
  gcloud secrets create database-url --data-file=-

# AWS Credentials (for S3)
echo -n "your-aws-access-key-id" | \
  gcloud secrets create aws-access-key-id --data-file=-

echo -n "your-aws-secret-access-key" | \
  gcloud secrets create aws-secret-access-key --data-file=-
```

### 2. Service Account 권한 부여
```bash
# Cloud Run Service Account에 Secret 접근 권한 부여
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 모든 Secret에 대해 반복
```

---

## Cloud Storage 설정

### 1. Bucket 생성
```bash
# Flyer Images Bucket
gsutil mb -c STANDARD -l $REGION gs://$PROJECT_ID-flyer-images

# Public Data Bucket
gsutil mb -c STANDARD -l $REGION gs://$PROJECT_ID-public-data

# CORS 설정
echo '[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]' > cors.json

gsutil cors set cors.json gs://$PROJECT_ID-flyer-images
```

### 2. CDN 설정 (선택사항)
```bash
# Cloud CDN은 Load Balancer를 통해 설정
```

---

## Cloud Run 배포

### 1. Docker 이미지 빌드 및 푸시
```bash
# Container Registry 인증
gcloud auth configure-docker

# 이미지 빌드
cd backend
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# 이미지 푸시
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest
```

### 2. Cloud Run 서비스 배포
```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=3000" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,JWT_REFRESH_SECRET=jwt-refresh-secret:latest,DATABASE_URL=database-url:latest" \
  --add-cloudsql-instances $PROJECT_ID:$REGION:townin-db \
  --max-instances 10 \
  --min-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --port 3000
```

### 3. 커스텀 도메인 연결 (선택사항)
```bash
# 도메인 매핑
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain api.townin.kr \
  --region $REGION
```

---

## CI/CD 설정

### 1. GitHub Secrets 설정

GitHub Repository Settings → Secrets and variables → Actions에서 다음 Secrets 추가:

```
GCP_PROJECT_ID: your-project-id
GCP_SA_KEY: <Service Account JSON Key>
```

### 2. Service Account 키 생성
```bash
# Service Account 생성
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# 권한 부여
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 키 생성 및 다운로드
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# 키 내용을 GitHub Secret GCP_SA_KEY에 복사
cat ~/gcp-key.json
```

### 3. 자동 배포 트리거
```bash
# main 브랜치에 push하면 자동 배포
git push origin main
```

---

## 모니터링 설정

### 1. Cloud Logging
```bash
# 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
  --limit 50 \
  --format json
```

### 2. Cloud Monitoring

Cloud Console → Monitoring → Dashboards에서:
- CPU 사용률
- 메모리 사용률
- 요청 지연시간
- 에러율

### 3. Uptime Check 설정
```bash
# Uptime check 생성
gcloud monitoring uptime create-http townin-health-check \
  --display-name="Townin Backend Health Check" \
  --resource-url="https://[YOUR-SERVICE-URL]/health" \
  --check-interval=60s
```

---

## 비용 최적화

### 1. 권장 리소스 설정
```
개발 환경:
- Cloud SQL: db-f1-micro
- Cloud Run: 256Mi, 0.5 CPU, min 0

운영 환경:
- Cloud SQL: db-g1-small or db-n1-standard-1
- Cloud Run: 512Mi, 1 CPU, min 1
```

### 2. 예상 비용 (월)
```
Cloud SQL (db-f1-micro): $7-10
Cloud Run (소규모 트래픽): $5-20
Cloud Storage: $1-5
------------------------------
총 예상 비용: $15-35/month
```

---

## 트러블슈팅

### Cloud SQL 연결 실패
```bash
# Cloud SQL Proxy 로그 확인
# Cloud Run에 Cloud SQL 인스턴스가 연결되었는지 확인
gcloud run services describe $SERVICE_NAME --region $REGION
```

### Secret 접근 실패
```bash
# Service Account 권한 확인
gcloud secrets get-iam-policy jwt-secret
```

### 배포 실패
```bash
# Cloud Build 로그 확인
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

---

## 다음 단계

- [ ] 커스텀 도메인 설정
- [ ] SSL 인증서 자동 갱신 확인
- [ ] Cloud CDN 설정
- [ ] Cloud Armor (WAF) 설정
- [ ] Backup 자동화
- [ ] Disaster Recovery 계획 수립

---

## 참고 자료

- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Secret Manager 문서](https://cloud.google.com/secret-manager/docs)
- [GCP 가격 계산기](https://cloud.google.com/products/calculator)
