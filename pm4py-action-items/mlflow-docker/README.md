# MLflow Docker 환경 구축 가이드

**작성일**: 2024-12-21
**목적**: Townin 프로젝트의 AI/ML 실험 추적 인프라 구축
**상태**: ✅ 실행 준비 완료

---

## 개요

이 Docker Compose 환경은 MLflow Tracking Server와 필요한 모든 의존성을 포함합니다.

### 포함된 서비스

1. **PostgreSQL** (포트 5432): MLflow 메타데이터 저장소
2. **MinIO** (포트 9000, 9001): S3 호환 아티팩트 저장소
3. **MLflow Server** (포트 5000): Tracking Server UI 및 API

---

## 빠른 시작

### 1단계: Docker 환경 시작

```bash
# 프로젝트 디렉토리로 이동
cd "/Users/gangseungsig/Documents/02_GitHub/14_Townin Graph/pm4py-action-items/mlflow-docker"

# 실행 권한 부여
chmod +x mlflow-entrypoint.sh

# Docker Compose 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f mlflow
```

### 2단계: MLflow UI 접속

브라우저에서 http://localhost:5000 열기

### 3단계: Python에서 MLflow 사용

```python
import mlflow

# MLflow Tracking URI 설정
mlflow.set_tracking_uri("http://localhost:5000")

# 실험 생성
mlflow.set_experiment("townin-test")

# 실험 실행
with mlflow.start_run(run_name="my_first_run"):
    mlflow.log_param("param1", "value1")
    mlflow.log_metric("metric1", 0.85)
    print("✅ First MLflow run completed!")
```

---

## 서비스 세부 정보

### PostgreSQL

**접속 정보**:
- Host: localhost
- Port: 5432
- Database: mlflow
- User: mlflow_user
- Password: mlflow_password

**Connection String**:
```
postgresql://mlflow_user:mlflow_password@localhost:5432/mlflow
```

### MinIO (S3-compatible Storage)

**Web UI**: http://localhost:9001

**접속 정보**:
- Username: minioadmin
- Password: minioadmin
- Bucket: mlflow-artifacts

**S3 Endpoint**: http://localhost:9000

### MLflow Tracking Server

**UI**: http://localhost:5000

**API Endpoint**: http://localhost:5000

**Health Check**: http://localhost:5000/health

---

## LangChain + MLflow 통합 예제

### GraphRAG 실험 추적

```python
import mlflow
from langchain.chains import GraphCypherQAChain
from langchain.chat_models import ChatOpenAI

# MLflow 설정
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("townin-graphrag")

# LangChain 자동 로깅 활성화
mlflow.langchain.autolog()

# GraphRAG 실험
with mlflow.start_run(run_name="graphrag_chunking_test"):
    # 파라미터 로깅
    mlflow.log_param("chunking_strategy", "semantic")
    mlflow.log_param("chunk_size", 512)
    mlflow.log_param("leiden_resolution", 1.0)
    mlflow.log_param("embedding_model", "text-embedding-3-large")

    # GraphRAG 실행 (LangChain이 자동으로 추적)
    llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
    # ... GraphRAG 코드 ...

    # 성능 메트릭 로깅
    mlflow.log_metrics({
        "retrieval_precision": 0.87,  # PRD 목표: > 85%
        "faithfulness": 0.93,          # PRD 목표: > 95%
        "answer_relevancy": 0.89,      # PRD 목표: > 90%
        "graph_coverage": 0.91         # PRD 목표: > 90%
    })

    # 토큰 비용 추적
    mlflow.log_metric("total_tokens", 1500)
    mlflow.log_metric("cost_usd", 0.023)

print("✅ GraphRAG experiment logged to MLflow!")
```

### 전단지 OCR 실험

```python
import mlflow

mlflow.set_experiment("flyer-ocr-optimization")

models = ["gpt-4-vision", "claude-3-5-sonnet"]

for model in models:
    with mlflow.start_run(run_name=f"ocr_{model}"):
        mlflow.log_param("vision_model", model)
        mlflow.log_param("max_tokens", 1000)

        # 100개 샘플 테스트
        results = process_flyers(test_set, model=model)

        mlflow.log_metrics({
            "product_extraction_accuracy": results['product_acc'],
            "price_extraction_accuracy": results['price_acc'],
            "avg_cost_per_flyer": results['cost'],
            "processing_time_ms": results['latency']
        })

        # 샘플 이미지 저장
        mlflow.log_artifact("sample_flyer_001.jpg")
```

---

## 관리 명령어

### 시작/중지

```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 중지 + 데이터 삭제
docker-compose down -v
```

### 로그 확인

```bash
# 전체 로그
docker-compose logs

# MLflow만
docker-compose logs -f mlflow

# PostgreSQL만
docker-compose logs -f postgres
```

### 상태 확인

```bash
# 컨테이너 상태
docker-compose ps

# 헬스체크
curl http://localhost:5000/health
```

### 데이터 백업

```bash
# PostgreSQL 백업
docker exec mlflow-postgres pg_dump -U mlflow_user mlflow > mlflow_backup.sql

# MinIO 아티팩트 백업 (웹 UI에서 다운로드)
# http://localhost:9001 접속 → mlflow-artifacts 버킷 다운로드
```

---

## 프로덕션 배포 고려사항

### AWS 배포 시 변경사항

```yaml
# docker-compose.prod.yml
services:
  mlflow:
    environment:
      # AWS RDS PostgreSQL
      MLFLOW_BACKEND_STORE_URI: postgresql://user:password@rds-endpoint:5432/mlflow

      # AWS S3 (MinIO 대신)
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      # MLFLOW_S3_ENDPOINT_URL 제거 (AWS S3 기본 사용)

  # MinIO 서비스 제거
```

### 환경 변수 설정

```bash
# .env 파일 생성
cat > .env << EOF
# PostgreSQL
POSTGRES_USER=mlflow_user
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DB=mlflow

# AWS (프로덕션)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=ap-northeast-2

# MLflow
MLFLOW_PORT=5000
MLFLOW_HOST=0.0.0.0
EOF

# docker-compose.yml에서 환경 변수 사용
# environment:
#   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

---

## 비용 예상 (AWS 프로덕션)

| 서비스 | 구성 | 월 비용 (USD) | 한화 (₩) |
|--------|------|-------------|----------|
| **EC2** | t3.medium (MLflow) | $30 | ₩39,000 |
| **RDS** | PostgreSQL db.t3.micro | $20 | ₩26,000 |
| **S3** | 10GB (아티팩트) | $0.25 | ₩325 |
| **데이터 전송** | 10GB/월 | $1 | ₩1,300 |
| **총계** | | **$51.25** | **₩66,625** |

**개발 환경 (로컬 Docker)**: 무료 ✅

---

## 트러블슈팅

### 문제 1: PostgreSQL 연결 실패

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres

# 재시작
docker-compose restart postgres
```

### 문제 2: MinIO 버킷 생성 실패

```bash
# mc 컨테이너 재실행
docker-compose up mc

# 수동으로 버킷 생성
docker exec -it mlflow-minio mc mb /data/mlflow-artifacts
```

### 문제 3: MLflow UI 접속 불가

```bash
# 포트 충돌 확인
lsof -i :5000

# MLflow 재시작
docker-compose restart mlflow

# 헬스체크
curl http://localhost:5000/health
```

### 문제 4: 아티팩트 업로드 실패

```python
# Python 클라이언트에서 S3 엔드포인트 설정
import os
os.environ['MLFLOW_S3_ENDPOINT_URL'] = 'http://localhost:9000'
os.environ['AWS_ACCESS_KEY_ID'] = 'minioadmin'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'minioadmin'

import mlflow
mlflow.set_tracking_uri("http://localhost:5000")
```

---

## 다음 단계

### Phase 1 (즉시)
- [x] MLflow Docker 환경 구축
- [ ] 기본 실험 실행 테스트
- [ ] LangChain 통합 테스트

### Phase 2 (1주일 이내)
- [ ] GraphRAG 파이프라인에 MLflow 통합
- [ ] 전단지 OCR 실험 시작
- [ ] 프롬프트 레지스트리 PoC

### Phase 3 (1개월 이내)
- [ ] RAG 성능 지표 자동 측정
- [ ] 비용 대시보드 구축
- [ ] AWS 프로덕션 환경 배포 계획

---

## 참고 자료

- **MLflow 공식 문서**: https://mlflow.org/docs/latest/
- **MLflow LLM Tracking**: https://mlflow.org/docs/latest/llms/
- **LangChain + MLflow**: https://python.langchain.com/docs/integrations/providers/mlflow_tracking/
- **Docker Compose 문서**: https://docs.docker.com/compose/

## 관련 문서

- `../docs/mlflow-implementation-plan.md`: MLflow 도입 계획서
- `../lib/goldenRoutine.ts`: Golden Routine PoC
- `../README.md`: 프로젝트 개요

---

**마지막 업데이트**: 2024-12-21
**상태**: ✅ 실행 준비 완료
**우선순위**: 🔴 High (Phase 1부터 필수)
