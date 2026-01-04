# MLflow SaaS 프로덕션 아키텍처

Townin 프로젝트를 위한 엔터프라이즈급 MLflow SaaS 플랫폼 구축 가이드

## 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [보안 설정](#보안-설정)
3. [고가용성 구성](#고가용성-구성)
4. [모니터링 및 알림](#모니터링-및-알림)
5. [비용 최적화](#비용-최적화)
6. [멀티테넌시](#멀티테넌시)
7. [CI/CD 파이프라인](#cicd-파이프라인)
8. [컴플라이언스](#컴플라이언스)

---

## 아키텍처 개요

### SaaS 프로덕션 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐         ┌──────────────────┐              │
│  │ Cloud Load  │────────>│  Cloud Run       │              │
│  │ Balancer    │         │  (MLflow Server) │              │
│  │ (HTTPS)     │         │  Min: 1, Max: 50 │              │
│  └─────────────┘         └────────┬─────────┘              │
│                                   │                         │
│                         ┌─────────┴─────────┐               │
│                         │                   │               │
│                 ┌───────▼────────┐  ┌──────▼────────┐      │
│                 │  Cloud SQL     │  │ Cloud Storage │      │
│                 │  (PostgreSQL)  │  │ (Artifacts)   │      │
│                 │  HA Enabled    │  │ Versioned     │      │
│                 │  Auto Backup   │  │ Encrypted     │      │
│                 └────────────────┘  └───────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Monitoring & Logging                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Cloud Monitoring | Cloud Logging | Alerting         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Security                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  IAM | VPC | Cloud Armor | Secret Manager            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 보안 설정

### 1. IAM 기반 인증 (필수)

```bash
# Cloud Run 서비스 인증 활성화
gcloud run deploy mlflow-server \
  --image gcr.io/msccruises/mlflow-server:latest \
  --region asia-northeast3 \
  --no-allow-unauthenticated \  # 인증 필수
  --service-account mlflow-sa@msccruises.iam.gserviceaccount.com

# 특정 사용자/그룹에게만 접근 권한 부여
gcloud run services add-iam-policy-binding mlflow-server \
  --region=asia-northeast3 \
  --member="user:admin@townin.com" \
  --role="roles/run.invoker"

# 팀 전체 접근 (Google Group)
gcloud run services add-iam-policy-binding mlflow-server \
  --region=asia-northeast3 \
  --member="group:ml-team@townin.com" \
  --role="roles/run.invoker"
```

### 2. VPC 네트워크 격리

```bash
# VPC 커넥터 생성 (Cloud Run <-> Cloud SQL 프라이빗 연결)
gcloud compute networks vpc-access connectors create mlflow-connector \
  --network default \
  --region asia-northeast3 \
  --range 10.8.0.0/28

# Cloud Run에 VPC 연결
gcloud run services update mlflow-server \
  --region asia-northeast3 \
  --vpc-connector mlflow-connector \
  --vpc-egress private-ranges-only
```

### 3. 시크릿 관리

```bash
# Secret Manager에 민감 정보 저장
echo -n "postgresql://mlflow_user:PASSWORD@..." | \
  gcloud secrets create mlflow-db-uri --data-file=-

echo -n "gs://townin-mlflow-artifacts" | \
  gcloud secrets create mlflow-artifact-root --data-file=-

# Cloud Run에서 시크릿 사용
gcloud run services update mlflow-server \
  --region asia-northeast3 \
  --update-secrets=MLFLOW_BACKEND_STORE_URI=mlflow-db-uri:latest \
  --update-secrets=MLFLOW_ARTIFACT_ROOT=mlflow-artifact-root:latest
```

### 4. Cloud Armor (DDoS 방지)

```bash
# 보안 정책 생성
gcloud compute security-policies create mlflow-security-policy \
  --description "MLflow DDoS and rate limiting"

# Rate limiting 규칙 추가 (초당 100 요청)
gcloud compute security-policies rules create 100 \
  --security-policy mlflow-security-policy \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 100 \
  --rate-limit-threshold-interval-sec 60 \
  --ban-duration-sec 600

# IP 화이트리스트 (선택)
gcloud compute security-policies rules create 200 \
  --security-policy mlflow-security-policy \
  --expression "inIpRange(origin.ip, '203.0.113.0/24')" \
  --action "allow"
```

---

## 고가용성 구성

### 1. Cloud SQL 고가용성

```bash
# Regional HA 구성 (자동 failover)
gcloud sql instances create townin-mlflow-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=asia-northeast3 \
  --availability-type=REGIONAL \  # HA 활성화
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=30 \
  --retained-transaction-log-days=7 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --database-flags=max_connections=500,shared_buffers=4GB

# Read Replica 추가 (읽기 성능 향상)
gcloud sql instances create townin-mlflow-postgres-replica \
  --master-instance-name=townin-mlflow-postgres \
  --tier=db-custom-2-8192 \
  --region=asia-northeast3
```

### 2. Cloud Run 고가용성

```bash
gcloud run deploy mlflow-server \
  --image gcr.io/msccruises/mlflow-server:latest \
  --region asia-northeast3 \
  --min-instances=2 \  # 최소 2개 인스턴스 (99.95% SLA)
  --max-instances=50 \
  --cpu=2 \
  --memory=4Gi \
  --timeout=300 \
  --concurrency=80 \
  --cpu-throttling \  # 비용 절감
  --execution-environment=gen2  # 더 빠른 Cold Start
```

### 3. 멀티 리전 백업

```bash
# Cloud Storage 멀티 리전 복제
gsutil mb -p msccruises -c STANDARD -l asia gs://townin-mlflow-artifacts

# 백업 버킷 생성 (다른 리전)
gsutil mb -p msccruises -c NEARLINE -l us gs://townin-mlflow-artifacts-backup

# 자동 복제 설정
gsutil rsync -r -d gs://townin-mlflow-artifacts gs://townin-mlflow-artifacts-backup
```

---

## 모니터링 및 알림

### 1. Cloud Monitoring 대시보드

```bash
# 커스텀 대시보드 생성 (JSON 설정)
cat > mlflow-dashboard.json << 'EOF'
{
  "displayName": "MLflow Production Dashboard",
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run Request Count",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" resource.labels.service_name=\"mlflow-server\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        }
      }
    ]
  }
}
EOF

gcloud monitoring dashboards create --config-from-file=mlflow-dashboard.json
```

### 2. Alerting 정책

```bash
# CPU 사용률 알림 (80% 초과 시)
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="MLflow High CPU Usage" \
  --condition-display-name="CPU > 80%" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="mlflow-server" AND metric.type="run.googleapis.com/container/cpu/utilizations"'

# 에러율 알림 (5xx 에러 발생 시)
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="MLflow 5xx Errors" \
  --condition-display-name="5xx Error Rate > 1%" \
  --condition-threshold-value=0.01 \
  --condition-threshold-duration=60s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"'

# Cloud SQL 연결 실패 알림
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud SQL Connection Failure" \
  --condition-display-name="Database Unavailable" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=60s \
  --condition-filter='resource.type="cloudsql_database" AND metric.type="cloudsql.googleapis.com/database/up"'
```

### 3. Uptime Check (가동 시간 모니터링)

```bash
# HTTP 헬스 체크 설정
gcloud monitoring uptime-checks create \
  --display-name="MLflow Health Check" \
  --resource-type=uptime-url \
  --monitored-resource=https://mlflow-server-HASH.run.app/health \
  --period=60 \
  --timeout=10s
```

### 4. 로그 기반 메트릭

```bash
# 로그에서 메트릭 추출 (예: MLflow 실험 생성 수)
gcloud logging metrics create mlflow_experiments_created \
  --description="Number of MLflow experiments created" \
  --log-filter='resource.type="cloud_run_revision"
    resource.labels.service_name="mlflow-server"
    jsonPayload.message=~"Created experiment"'
```

---

## 비용 최적화

### 1. Cloud Run 비용 최적화

```bash
# 최적화된 설정
gcloud run deploy mlflow-server \
  --region asia-northeast3 \
  --cpu=2 \
  --memory=4Gi \
  --min-instances=1 \  # Cold Start 방지, 비용 균형
  --max-instances=20 \  # 합리적인 상한선
  --cpu-throttling \  # 요청 없을 때 CPU 제한
  --execution-environment=gen2 \  # 더 효율적
  --concurrency=100  # 인스턴스당 동시 요청 증가
```

**예상 비용 (월간):**
- Min 1 인스턴스 (2 vCPU, 4GiB): ~$35-50/month
- 추가 트래픽 요청: ~$0.40/million requests

### 2. Cloud SQL 비용 최적화

```bash
# 개발/스테이징 환경: 자동 스케일링
gcloud sql instances create townin-mlflow-postgres-dev \
  --database-version=POSTGRES_15 \
  --edition=ENTERPRISE_PLUS \
  --tier=db-perf-optimized-N-2 \
  --region=asia-northeast3 \
  --availability-type=ZONAL \
  --enable-google-ml-integration  # AI 최적화
```

### 3. Cloud Storage 비용 최적화

```bash
# Lifecycle 정책: 30일 후 Nearline, 90일 후 Coldline
cat > lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 30, "matchesPrefix": ["mlflow-artifacts/"]}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://townin-mlflow-artifacts
```

### 4. 비용 모니터링

```bash
# 예산 알림 설정 (월 $500 초과 시)
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="MLflow Monthly Budget" \
  --budget-amount=500 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## 멀티테넌시

### 옵션 1: Experiment 네임스페이스 (권장)

**Python SDK 수정:**

```python
# lib/mlflow_client.py
import mlflow
import os

class TowninMLflowClient:
    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI"))

    def create_experiment(self, name: str):
        # 고객별 네임스페이스
        experiment_name = f"/customer_{self.customer_id}/{name}"
        return mlflow.create_experiment(experiment_name)

    def start_run(self, experiment_name: str):
        full_name = f"/customer_{self.customer_id}/{experiment_name}"
        mlflow.set_experiment(full_name)
        return mlflow.start_run()

# 사용 예시
client = TowninMLflowClient(customer_id="townin_corp")
client.create_experiment("graphrag_optimization")
```

**MLflow 서버 설정:**

```python
# mlflow_config.py
import os
from mlflow.server import app

@app.before_request
def enforce_customer_isolation():
    """고객별 데이터 격리 검증"""
    customer_id = request.headers.get("X-Customer-ID")
    if not customer_id:
        abort(401, "Customer ID required")

    # 요청된 실험/런이 고객 소유인지 검증
    # (상세 로직 생략)
```

### 옵션 2: 완전 격리 (엔터프라이즈)

```bash
# 고객별 별도 Cloud Run 서비스
for customer in customer_list; do
  gcloud run deploy mlflow-${customer} \
    --image gcr.io/msccruises/mlflow-server:latest \
    --region asia-northeast3 \
    --set-env-vars "MLFLOW_BACKEND_STORE_URI=postgresql://.../${customer}_mlflow" \
    --set-env-vars "MLFLOW_ARTIFACT_ROOT=gs://townin-mlflow-${customer}"
done
```

---

## CI/CD 파이프라인

### 1. Cloud Build Trigger (GitHub 연동)

```yaml
# cloudbuild.yaml
steps:
  # Step 1: Run tests
  - name: 'python:3.11'
    entrypoint: 'pip'
    args: ['install', '-r', 'requirements.txt']

  - name: 'python:3.11'
    entrypoint: 'pytest'
    args: ['tests/']

  # Step 2: Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/mlflow-server:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/mlflow-server:latest'
      - '-f'
      - 'mlflow-docker/Dockerfile.production'
      - '.'

  # Step 3: Push to GCR
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '--all-tags', 'gcr.io/$PROJECT_ID/mlflow-server']

  # Step 4: Deploy to Cloud Run (Canary)
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'mlflow-server'
      - '--image'
      - 'gcr.io/$PROJECT_ID/mlflow-server:$COMMIT_SHA'
      - '--region'
      - 'asia-northeast3'
      - '--tag'
      - 'canary'
      - '--no-traffic'  # Canary에 트래픽 보내지 않음

  # Step 5: Run smoke tests
  - name: 'gcr.io/cloud-builders/curl'
    args: ['https://canary---mlflow-server-HASH.run.app/health']

  # Step 6: Gradual rollout
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        # 10% 트래픽
        gcloud run services update-traffic mlflow-server \
          --region=asia-northeast3 \
          --to-revisions=canary=10,LATEST=90

        sleep 300  # 5분 대기

        # 문제 없으면 100% 전환
        gcloud run services update-traffic mlflow-server \
          --region=asia-northeast3 \
          --to-latest

images:
  - 'gcr.io/$PROJECT_ID/mlflow-server'

options:
  machineType: 'N1_HIGHCPU_8'
  timeout: '1200s'
```

### 2. Trigger 생성

```bash
gcloud builds triggers create github \
  --repo-name=pm4py-action-items \
  --repo-owner=YOUR_GITHUB_USER \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## 컴플라이언스

### 1. 데이터 암호화

```bash
# Cloud KMS 키 생성
gcloud kms keyrings create mlflow-keyring \
  --location=asia-northeast3

gcloud kms keys create mlflow-key \
  --location=asia-northeast3 \
  --keyring=mlflow-keyring \
  --purpose=encryption

# Cloud SQL 암호화
gcloud sql instances create townin-mlflow-postgres \
  --database-version=POSTGRES_15 \
  --region=asia-northeast3 \
  --disk-encryption-key=projects/msccruises/locations/asia-northeast3/keyRings/mlflow-keyring/cryptoKeys/mlflow-key

# Cloud Storage 암호화
gsutil kms encryption \
  -k projects/msccruises/locations/asia-northeast3/keyRings/mlflow-keyring/cryptoKeys/mlflow-key \
  gs://townin-mlflow-artifacts
```

### 2. Audit Logging

```bash
# IAM 감사 로그 활성화
gcloud projects set-iam-policy msccruises policy.yaml

# policy.yaml
auditConfigs:
  - service: run.googleapis.com
    auditLogConfigs:
      - logType: ADMIN_READ
      - logType: DATA_READ
      - logType: DATA_WRITE
  - service: sqladmin.googleapis.com
    auditLogConfigs:
      - logType: ADMIN_READ
      - logType: DATA_READ
```

### 3. 데이터 보존 정책

```bash
# Cloud Logging 보존 기간 설정 (400일)
gcloud logging buckets update _Default \
  --location=global \
  --retention-days=400
```

---

## 요약: SaaS 프로덕션 체크리스트

### Critical (반드시 필요)
- [ ] IAM 인증 활성화 (`--no-allow-unauthenticated`)
- [ ] Cloud SQL HA 구성 (`--availability-type=REGIONAL`)
- [ ] 자동 백업 설정 (30일 보관)
- [ ] Cloud Monitoring & Alerting 설정
- [ ] Secret Manager로 민감 정보 관리
- [ ] VPC 네트워크 격리
- [ ] Cloud Armor DDoS 방지
- [ ] 멀티테넌시 구현

### Important (권장)
- [ ] CI/CD 파이프라인 구축
- [ ] Canary/Blue-Green 배포
- [ ] Read Replica 추가
- [ ] 멀티 리전 백업
- [ ] 비용 예산 알림
- [ ] Uptime Check 설정

### Nice to Have (선택)
- [ ] Cloud CDN (정적 에셋 캐싱)
- [ ] Global Load Balancer (글로벌 서비스)
- [ ] Custom Domain (mlflow.townin.com)
- [ ] SSL 인증서 (Let's Encrypt)

---

## 예상 비용 (SaaS 프로덕션)

### 월간 비용 추정

| 항목 | 사양 | 월 비용 (USD) |
|------|------|---------------|
| Cloud Run | 2 vCPU, 4GiB, Min 1 | $35-50 |
| Cloud SQL HA | Custom 4-16384 | $350-400 |
| Cloud Storage | 100GB Standard | $2-5 |
| Cloud Monitoring | 기본 메트릭 | $0-10 |
| Cloud Load Balancer | HTTPS | $20-30 |
| VPC Connector | 1개 | $10-15 |
| **총계** | | **$417-510/month** |

### 트래픽별 추가 비용
- Cloud Run 요청: $0.40/million
- Cloud SQL 네트워크: $0.01/GB
- Cloud Storage egress: $0.12/GB

---

## 다음 단계

1. 보안 설정 우선 구현 (IAM, VPC, Secret Manager)
2. Cloud SQL HA 구성 및 백업 테스트
3. 모니터링 대시보드 및 알림 설정
4. CI/CD 파이프라인 구축
5. 멀티테넌시 구현 및 테스트
6. 부하 테스트 수행
7. 재해 복구 계획(DR) 문서화
8. 고객 온보딩 프로세스 정의

**Built for Townin - Production-Ready MLflow SaaS Platform**
