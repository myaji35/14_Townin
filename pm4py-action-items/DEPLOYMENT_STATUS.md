# MLflow 배포 상태

## 현재 배포 정보

### 기본 구성 (개발/테스트 환경)

**배포 완료 날짜:** 2025-12-22

**서비스 URL:** https://mlflow-server-198387389327.asia-northeast3.run.app

**상태:** ✅ 정상 작동

**구성:**
- **Cloud Run 서비스:** mlflow-server
- **리전:** asia-northeast3 (Seoul)
- **이미지:** gcr.io/msccruises/mlflow-server:latest
- **CPU:** 2 vCPU
- **메모리:** 4 GiB
- **최소 인스턴스:** 0
- **최대 인스턴스:** 10
- **인증:** 비활성화 (`--allow-unauthenticated`)

**현재 제한사항:**
- ⚠️ SQLite 사용 (인메모리) - 컨테이너 재시작 시 데이터 손실
- ⚠️ 로컬 파일 시스템 (아티팩트) - 영구 저장소 미연결
- ⚠️ 인증 없음 - 보안 취약

**예상 비용:** ~$1-7/month

---

## 프로덕션 구성 진행 상황

### ✅ 완료된 작업

1. **서비스 계정 생성**
   - 계정: `mlflow-sa@msccruises.iam.gserviceaccount.com`
   - 권한:
     - Cloud SQL Client
     - Storage Object Admin
     - Secret Manager Secret Accessor

2. **Cloud Storage 버킷**
   - 버킷: `gs://townin-mlflow-artifacts`
   - 위치: asia-northeast3
   - 버전 관리: 활성화
   - IAM: mlflow-sa에게 objectAdmin 권한 부여

### ⏳ 남은 작업

1. **Secret Manager 설정**
   - DB 비밀번호 저장
   - Backend URI 저장
   - Artifact Root 저장

2. **Cloud SQL 생성** (가장 중요)
   - 옵션 A: 개발용 (db-f1-micro) - ~$10-15/month
   - 옵션 B: 프로덕션 HA (db-custom-4-16384) - ~$350-400/month

3. **VPC Connector 생성**
   - Cloud Run ↔ Cloud SQL 프라이빗 연결
   - 비용: ~$10-15/month

4. **Cloud Run 업데이트**
   - 서비스 계정 연결
   - 환경 변수 설정 (Secret Manager)
   - Cloud SQL 인스턴스 연결
   - VPC 연결

5. **IAM 인증 활성화**
   - `--no-allow-unauthenticated` 설정
   - 특정 사용자/그룹에게 접근 권한 부여

---

## 다음 단계 옵션

### 옵션 1: 개발용 Cloud SQL로 시작 (권장)

**장점:**
- ✅ 저렴한 비용 (~$25/month 총액)
- ✅ 데이터 영구 저장
- ✅ 프로덕션으로 쉽게 업그레이드 가능

**명령어:**
```bash
# Cloud SQL 인스턴스 생성 (개발용)
gcloud sql instances create townin-mlflow-postgres-dev \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --no-assign-ip \
  --network=default \
  --backup-start-time=03:00

# 데이터베이스 및 사용자 생성
gcloud sql databases create mlflow \
  --instance=townin-mlflow-postgres-dev

gcloud sql users create mlflow_user \
  --instance=townin-mlflow-postgres-dev \
  --password=YOUR_PASSWORD_HERE
```

### 옵션 2: 프로덕션 SaaS 구성 (완전 자동화)

**장점:**
- ✅ High Availability (HA)
- ✅ 자동 백업 30일
- ✅ VPC 격리
- ✅ IAM 인증

**단점:**
- ❌ 높은 비용 (~$400-500/month)

**명령어:**
```bash
cd "/Users/gangseungsig/Documents/02_GitHub/14_Townin Graph/pm4py-action-items/mlflow-docker"
./deploy-production.sh
```

### 옵션 3: 현재 상태 유지

**장점:**
- ✅ 최소 비용
- ✅ 빠른 테스트 가능

**단점:**
- ❌ 데이터 영구 저장 안 됨
- ❌ 보안 취약
- ❌ 프로덕션 사용 불가

---

## 사용 가이드

### 현재 MLflow UI 접속

브라우저에서 열기:
```
https://mlflow-server-198387389327.asia-northeast3.run.app
```

### Python에서 사용

```python
import mlflow

# MLflow Tracking URI 설정
mlflow.set_tracking_uri("https://mlflow-server-198387389327.asia-northeast3.run.app")

# 실험 생성 및 추적
with mlflow.start_run(run_name="test_run"):
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_metric("accuracy", 0.95)
    mlflow.log_artifact("model.pkl")
```

### Townin 클라이언트 라이브러리 사용

```python
from townin_mlflow_client import TowninMLflowClient, CostTracker

# 클라이언트 초기화
client = TowninMLflowClient(
    tracking_uri="https://mlflow-server-198387389327.asia-northeast3.run.app",
    customer_id="townin_corp",
    auto_auth=False  # 현재 인증 비활성화 상태
)

# 실험 추적
with client.start_run("graphrag_optimization") as run:
    client.log_params({
        "chunk_size": 512,
        "embedding_model": "text-embedding-ada-002"
    })

    client.log_metrics({
        "faithfulness": 0.92,
        "answer_relevancy": 0.88
    })

    # LLM 비용 추적
    CostTracker.log_llm_usage(
        client=client,
        model="gpt-4o",
        input_tokens=15000,
        output_tokens=3000
    )
```

---

## 비용 추정

### 현재 구성 (개발/테스트)
| 항목 | 비용 (월) |
|------|-----------|
| Cloud Run (Min 0) | $1-5 |
| 네트워크 | $1-2 |
| **총계** | **$2-7** |

### 개발용 Cloud SQL 추가 시
| 항목 | 비용 (월) |
|------|-----------|
| Cloud Run | $1-5 |
| Cloud SQL (db-f1-micro) | $10-15 |
| Cloud Storage | $1-2 |
| VPC Connector | $10-15 |
| **총계** | **$22-37** |

### 프로덕션 SaaS (HA)
| 항목 | 비용 (월) |
|------|-----------|
| Cloud Run (Min 1) | $35-50 |
| Cloud SQL HA | $350-400 |
| Cloud Storage | $2-5 |
| VPC Connector | $10-15 |
| 모니터링 | $0-10 |
| **총계** | **$397-480** |

---

## 참고 문서

- **프로덕션 아키텍처:** `SAAS_PRODUCTION_ARCHITECTURE.md`
- **배포 스크립트:** `mlflow-docker/deploy-production.sh`
- **Python 클라이언트:** `mlflow-docker/townin_mlflow_client.py`
- **Cloud Run 배포 가이드:** `CLOUD_RUN_DEPLOYMENT.md`

---

**마지막 업데이트:** 2025-12-22 19:16 KST
