# MLflow Tracking Server - Townin Project

Townin 프로젝트의 AI/ML 실험 추적 및 모델 관리를 위한 MLflow 서버 환경입니다.

## 프로젝트 개요

이 프로젝트는 Townin의 GraphRAG 파이프라인 최적화 및 LLM 실험 추적을 위한 MLflow 인프라를 제공합니다.

**주요 기능:**
- LLM 파라미터 및 프롬프트 버전 추적
- 모델 성능 메트릭 자동 기록
- 아티팩트(모델, 데이터) S3 호환 저장소 관리
- API 비용 및 토큰 사용량 모니터링

## 기술 스택

- **Web Interface**: Next.js 16 (App Router)
- **MLflow Server**: Python 3.11
- **Backend Store**: PostgreSQL 15
- **Artifact Store**: MinIO (S3 compatible)
- **Deployment**: Docker Compose

## 빠른 시작

### 1. 개발 웹 인터페이스 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

웹 인터페이스: http://localhost:3000

### 2. MLflow Docker 환경 실행

```bash
# MLflow 실행 권한 부여
chmod +x mlflow-docker/mlflow-entrypoint.sh

# 전체 스택 시작 (MLflow + PostgreSQL + MinIO)
docker-compose -f docker-compose.deploy.yml up -d

# 로그 확인
docker-compose -f docker-compose.deploy.yml logs -f
```

**서비스 접속:**
- MLflow UI: http://localhost:5000
- MinIO Console: http://localhost:9001 (admin/minioadmin)
- PostgreSQL: localhost:5432

## Docker 서비스 구성

### 1. PostgreSQL (Backend Store)
- **역할**: MLflow 메타데이터 저장 (experiments, runs, metrics)
- **포트**: 5432
- **데이터베이스**: mlflow
- **볼륨**: postgres_data

### 2. MinIO (Artifact Store)
- **역할**: S3 호환 객체 스토리지 (모델 파일, 데이터셋)
- **포트**: 9000 (API), 9001 (Console)
- **버킷**: mlflow-artifacts
- **볼륨**: minio_data

### 3. MLflow Server
- **역할**: 실험 추적 서버
- **포트**: 5000
- **Backend URI**: postgresql://mlflow_user:mlflow_password@postgres:5432/mlflow
- **Artifact URI**: s3://mlflow-artifacts (MinIO)

### 4. Web App
- **역할**: MLflow 관리 대시보드
- **포트**: 3000
- **프레임워크**: Next.js 16

## Python에서 MLflow 사용

### 설치

```bash
pip install mlflow
```

### LangChain 자동 추적

```python
import mlflow
import mlflow.langchain

# MLflow 서버 설정
mlflow.set_tracking_uri("http://localhost:5000")

# LangChain 자동 로깅 활성화
mlflow.langchain.autolog()

# 이후 LangChain 코드는 자동으로 추적됨
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(temperature=0.7)
response = chat([HumanMessage(content="안녕하세요")])
# 자동으로 MLflow에 기록됨
```

### 수동 실험 추적

```python
import mlflow

mlflow.set_tracking_uri("http://localhost:5000")

with mlflow.start_run(run_name="graphrag_experiment_1"):
    # 파라미터 기록
    mlflow.log_param("chunk_size", 512)
    mlflow.log_param("overlap", 50)
    mlflow.log_param("embedding_model", "text-embedding-ada-002")

    # 메트릭 기록
    mlflow.log_metric("faithfulness", 0.92)
    mlflow.log_metric("answer_relevancy", 0.88)
    mlflow.log_metric("context_recall", 0.95)

    # 아티팩트 저장
    mlflow.log_artifact("results/graph_visualization.png")
```

## 프로젝트 구조

```
mlflow-tracking/
├── app/
│   ├── page.tsx           # MLflow 관리 웹 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 전역 스타일
├── mlflow-docker/
│   ├── docker-compose.yml # MLflow 스택 설정
│   ├── mlflow-entrypoint.sh # MLflow 서버 시작 스크립트
│   └── README.md          # MLflow Docker 상세 가이드
├── docker-compose.deploy.yml  # 전체 배포 설정
├── Dockerfile             # Next.js 앱 이미지
├── DOCKER_DEPLOY.md       # 배포 가이드
└── README.md              # 본 문서
```

## 주요 사용 사례 (Townin)

### 1. GraphRAG 파이프라인 최적화
- **목표**: Faithfulness 95% 달성
- **추적 항목**:
  - Chunk size, overlap 설정
  - Embedding model 선택
  - Graph construction 파라미터
  - Retrieval 알고리즘 (BM25 vs Dense)

### 2. LLM 프롬프트 버전 관리
- **목표**: Hallucination 방지
- **추적 항목**:
  - System prompt 버전
  - Temperature, top_p 설정
  - Few-shot examples
  - Output 품질 메트릭

### 3. 비용 최적화
- **목표**: API 비용 절감
- **추적 항목**:
  - 토큰 사용량 (input/output)
  - 모델별 비용 ($)
  - 캐싱 효과 측정
  - Batch processing 효율

## 관리 명령어

### 서비스 제어

```bash
# 시작
docker-compose -f docker-compose.deploy.yml up -d

# 중지
docker-compose -f docker-compose.deploy.yml down

# 재시작
docker-compose -f docker-compose.deploy.yml restart

# 특정 서비스만 재시작
docker-compose -f docker-compose.deploy.yml restart mlflow
```

### 로그 확인

```bash
# 전체 로그
docker-compose -f docker-compose.deploy.yml logs

# 실시간 로그
docker-compose -f docker-compose.deploy.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.deploy.yml logs -f mlflow
docker-compose -f docker-compose.deploy.yml logs -f postgres
```

### 데이터 백업

```bash
# PostgreSQL 백업
docker exec mlflow-postgres pg_dump -U mlflow_user mlflow > mlflow_backup_$(date +%Y%m%d).sql

# MinIO 데이터 백업
docker run --rm -v pm4py-action-items_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## 배포 옵션

### 로컬 개발 환경
- 현재 설정 그대로 사용
- 포트: 3000 (Web), 5000 (MLflow), 9000/9001 (MinIO)

### AWS 배포
- EC2 인스턴스에 Docker 설치
- 환경 변수 보안 강화 (`.env` 파일)
- Nginx 리버스 프록시 설정
- Let's Encrypt SSL 인증서

자세한 내용은 `DOCKER_DEPLOY.md` 참조

## PRD 연계

이 프로젝트는 Townin PRD의 다음 섹션과 연계됩니다:

- **10.1 기술적 리스크**: GraphRAG 구축 비용 과다 → MLflow로 비용 추적
- **8. 기술 스택**: AI/ML 엔진 최적화 → 실험 관리 필수
- **2.2 보험 GraphRAG 엔진**: Faithfulness 95% 목표 → 메트릭 추적

## 다음 단계

1. ✅ MLflow Docker 환경 구축 완료
2. ⏳ Python 백엔드와 MLflow 통합 (LangChain autolog)
3. ⏳ GraphRAG 실험 추적 시작
4. ⏳ 프로덕션 환경 배포 (AWS EC2)

## 유용한 링크

- **MLflow Documentation**: https://mlflow.org/docs/latest/index.html
- **MLflow LangChain Integration**: https://mlflow.org/docs/latest/llms/langchain/index.html
- **MinIO Documentation**: https://min.io/docs/minio/kubernetes/upstream/
- **Docker Compose Reference**: https://docs.docker.com/compose/

## 라이선스

- **MLflow**: Apache License 2.0
- **MinIO**: AGPL-3.0 (오픈소스) / Commercial (엔터프라이즈)
- **본 프로젝트**: ISC License

---

**Built with ❤️ for Townin - Hyper-local Life OS & Insurance GraphRAG Platform**
