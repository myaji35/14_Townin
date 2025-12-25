# MLflow 도입 계획서

**작성일**: 2024-12-21
**버전**: 1.0
**상태**: Phase 1부터 필수 도입
**관련 PRD 섹션**: 5. Insurance GraphRAG, 9.1 RAG 성능 지표, 10.1 기술적 리스크

---

## 1. 개요

### 1.1 목적

MLflow를 Townin 프로젝트의 **핵심 인프라**로 도입하여 AI/ML 라이프사이클을 관리합니다.

**타당성 점수**: 95/100 (강력 권장)

### 1.2 MLflow가 필수인 이유

```
Townin은 LLM/GraphRAG 중심 아키텍처:
├── Insurance GraphRAG 엔진 (핵심)
├── 멀티모달 AI (전단지 스캐너, 사고 현장 분석)
├── FP 코파일럿 (약관 검색, 광고 심의)
└── 사기 탐지 모델

→ MLflow 없이는 성공 지표 측정 및 비용 관리 불가능
```

### 1.3 pm4py vs MLflow 비교

| 측면 | pm4py | MLflow |
|------|-------|--------|
| **필수성** | 선택적 (차별화) | **필수** (핵심 인프라) |
| **도입 시기** | Phase 2부터 | **Phase 1부터** |
| **타당성** | 85/100 | **95/100** |
| **용도** | Process Mining | LLM/GraphRAG 실험 추적 |

---

## 2. MLflow 핵심 기능

### 2.1 LLM Tracking & Tracing

**2025년 주요 개선사항**:
- GenAI/LLM 워크플로우 전용 기능 강화
- OpenTelemetry 호환 트레이싱
- LangChain 자동 로깅: `mlflow.langchain.autolog()`

**기능**:
```python
import mlflow

mlflow.langchain.autolog()

with mlflow.start_run(run_name="graphrag_v1.2"):
    # 자동으로 추적됨:
    # - Prompt 입력/출력
    # - LLM 파라미터 (temperature, model)
    # - Token 사용량 (비용 계산 가능)
    # - 실행 시간
    # - Trace (단계별 실행 흐름)

    result = graphrag_pipeline.run(query)
```

### 2.2 Model Registry

**버전 관리**:
- 모델 자동 버전 추적
- Staging → Production 승격 워크플로우
- 롤백 기능
- 재현성 보장 (어떤 데이터/파라미터로 학습했는지 추적)

### 2.3 Prompt Registry

**프롬프트 버전 관리**:
```python
# 프롬프트를 레지스트리에 등록
mlflow.log_param("prompt_version", "insurance_qa_v2.3")

# A/B 테스트
with mlflow.start_run(run_name="prompt_a"):
    result_a = run_with_prompt("insurance_qa_v2.3")

with mlflow.start_run(run_name="prompt_b"):
    result_b = run_with_prompt("insurance_qa_v2.4")

# 성능 비교
mlflow.log_metric("faithfulness_a", 0.93)
mlflow.log_metric("faithfulness_b", 0.95)  # v2.4가 더 좋음!
```

### 2.4 Evaluation

**LLM 출력 품질 평가**:
```python
from mlflow.metrics import make_judge

# 커스텀 평가 Judge 생성
insurance_judge = make_judge(
    domain="insurance",
    criteria="답변이 약관에 기반하는지, 환각이 없는지"
)

# PRD 9.1 RAG 성능 지표 자동 측정
metrics = mlflow.evaluate(
    model=graphrag_model,
    data=test_queries,
    metrics=[
        "retrieval_precision",  # > 85% 목표
        "faithfulness",          # > 95% 목표
        "answer_relevancy"       # > 90% 목표
    ]
)
```

### 2.5 Token Usage Tracking

**비용 관리** (PRD 10.1 리스크 완화):
```python
mlflow.langchain.autolog(log_token_usage=True)

# 자동으로 추적됨
daily_cost = (
    input_tokens * 0.005 / 1000 +   # GPT-4o input
    output_tokens * 0.015 / 1000     # GPT-4o output
)

mlflow.log_metric("daily_llm_cost", daily_cost)

# 목표: 청구당 처리 비용 < $20
```

---

## 3. Townin 적용 시나리오

### 3.1 GraphRAG 파이프라인 최적화 ⭐⭐⭐⭐⭐

**PRD 연계**:
- **FR-CORE-001**: 데이터 수집 및 인덱싱
- **FR-CORE-002**: 검색 및 질의 처리
- **9.1 RAG 성능 지표**: 검색 정밀도, 충실도, 답변 관련성

**구현**:
```python
import mlflow
from langchain.chains import GraphCypherQAChain

mlflow.langchain.autolog()

# FR-CORE-001: 청킹 전략 실험
with mlflow.start_run(run_name="chunking_strategy_comparison"):
    for strategy in ["semantic", "fixed_size", "paragraph"]:
        mlflow.log_param("chunking_strategy", strategy)
        mlflow.log_param("chunk_size", 512)

        # Leiden 클러스터링
        mlflow.log_param("leiden_resolution", 1.0)

        # 그래프 구축
        graph = build_knowledge_graph(strategy=strategy)

        # FR-CORE-002: 검색 성능 평가
        metrics = evaluate_retrieval(test_queries, graph)

        # PRD 9.1 목표치 달성 여부 확인
        mlflow.log_metrics({
            "retrieval_precision": metrics['precision'],  # 목표: > 85%
            "faithfulness": metrics['faithfulness'],       # 목표: > 95%
            "answer_relevancy": metrics['relevancy'],      # 목표: > 90%
            "graph_coverage": metrics['coverage']          # 목표: > 90%
        })

# 최고 성능 파라미터 자동 선택
best_run = mlflow.search_runs(
    filter_string="metrics.faithfulness > 0.95",
    order_by=["metrics.retrieval_precision DESC"]
).iloc[0]

print(f"Best chunking strategy: {best_run['params.chunking_strategy']}")
```

**효과**:
- PRD 목표치 달성 모니터링 자동화
- 파라미터 튜닝 이력 보존
- 재현 가능한 실험

### 3.2 전단지 스캐너 최적화 ⭐⭐⭐⭐

**PRD 연계**:
- **3.2 AI 전단지 스캐너**: OCR/Vision AI
- **FR-CORE-003.1**: 이미지 분석

**구현**:
```python
# Vision AI 모델 비교 실험
with mlflow.start_run(run_name="flyer_ocr_optimization"):
    for model in ["gpt-4-vision", "claude-3-5-sonnet-vision"]:
        mlflow.log_param("vision_model", model)
        mlflow.log_param("max_tokens", 1000)

        # 100개 샘플 테스트
        results = process_test_flyers(test_set, model=model)

        mlflow.log_metrics({
            "product_extraction_accuracy": results['product_acc'],
            "price_extraction_accuracy": results['price_acc'],
            "avg_cost_per_flyer": results['cost'],
            "processing_time_ms": results['latency']
        })

        # 샘플 이미지 저장
        mlflow.log_artifact("sample_flyer_001.jpg")

# 목표: 정확도 90% + 비용 < $0.05
```

### 3.3 FP 코파일럿 프롬프트 관리 ⭐⭐⭐⭐⭐

**PRD 연계**:
- **4.1 FP 전용 AI 코파일럿**: 리드 매칭, 약관 검색
- **4.2 AI 광고 심의 생성기**: Compliance
- **FR-INS-003**: 환각 방지

**프롬프트 버전 관리**:
```python
# 프롬프트 A/B 테스트
prompts = {
    "v2.3": "당신은 보험 전문가입니다. 약관을 기반으로 답변하세요.",
    "v2.4": "당신은 보험 전문가입니다. 반드시 약관 조항을 인용하여 답변하세요. 확실하지 않으면 '확인 필요'라고 답하세요."
}

for version, prompt in prompts.items():
    with mlflow.start_run(run_name=f"fp_copilot_{version}"):
        mlflow.log_param("prompt_version", version)
        mlflow.log_param("temperature", 0.3)
        mlflow.log_param("model", "gpt-4o")

        # 테스트
        results = run_copilot_test(prompt, test_cases)

        # FR-INS-003.2: 환각 방지 (신뢰도 점수)
        mlflow.log_metrics({
            "hallucination_rate": results['hallucination'],  # 목표: < 5%
            "citation_accuracy": results['citation'],         # 목표: > 95%
            "confidence_score": results['confidence']
        })

# v2.4가 환각률 3%로 목표 달성!
```

### 3.4 사기 탐지 모델 운영 ⭐⭐⭐⭐

**PRD 연계**:
- **FR-INS-001.3**: 사기 탐지 및 교차 검증
- **9.2 비즈니스 지표**: 직통 처리율(STP) 60% 목표

**모델 배포**:
```python
# 사기 탐지 모델 학습
with mlflow.start_run(run_name="fraud_detector_v3"):
    mlflow.log_params({
        "algorithm": "random_forest",
        "n_estimators": 100,
        "max_depth": 10
    })

    # 학습
    model = train_fraud_detector(training_data)

    # 평가
    mlflow.log_metrics({
        "precision": 0.92,
        "recall": 0.88,
        "f1_score": 0.90
    })

    # 모델 저장
    mlflow.sklearn.log_model(model, "fraud_detector")

# Model Registry에 등록
mlflow.register_model(
    "runs:/<run_id>/fraud_detector",
    "FraudDetector"
)

# Staging → Production 승격
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="FraudDetector",
    version=3,
    stage="Production"
)

# STP 60% 목표 달성 모니터링
```

### 3.5 비용 최적화 (GraphRAG) ⭐⭐⭐⭐⭐

**PRD 연계**:
- **10.1 리스크 1**: GraphRAG 구축 비용 과다

**토큰 비용 추적**:
```python
mlflow.langchain.autolog(log_token_usage=True)

# 증분 업데이트 vs 전체 재처리 비교
strategies = ["incremental", "full_rebuild"]

for strategy in strategies:
    with mlflow.start_run(run_name=f"graphrag_build_{strategy}"):
        mlflow.log_param("update_strategy", strategy)

        # 그래프 구축
        start_time = time.time()
        graph, token_usage = build_graph(strategy=strategy)
        duration = time.time() - start_time

        # 비용 계산
        cost = (
            token_usage['input'] * 0.005 / 1000 +
            token_usage['output'] * 0.015 / 1000
        )

        mlflow.log_metrics({
            "build_time_seconds": duration,
            "total_tokens": token_usage['total'],
            "cost_usd": cost
        })

# Insight: 증분 업데이트가 90% 비용 절감!
```

---

## 4. 도입 전략

### 4.1 Phase별 MLflow 활용

```
Phase 1 (기획 단계, 현재 - 2025 Q1):
✅ MLflow 인프라 구축
✅ 전단지 OCR 실험 추적 시작
✅ 프롬프트 버전 관리 PoC

Phase 2 (개발 착수, 2025 Q2 - Q4):
✅ GraphRAG 파이프라인 최적화 (핵심!)
✅ IoT 이상 탐지 모델 실험
✅ 프롬프트 레지스트리 본격 사용

Phase 3 (수익화, 2026 Q1 - Q4):
✅ 사기 탐지 모델 운영
✅ RAG 성능 지표 대시보드
✅ FP 코파일럿 A/B 테스트

Phase 4 (글로벌 확장, 2027+):
✅ 국가별 모델 성능 비교
✅ 다국어 프롬프트 버전 관리
✅ Databricks Managed MLflow 마이그레이션
```

### 4.2 인프라 구성

#### Self-hosted MLflow (Phase 1-2 권장)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # MLflow Tracking Server
  mlflow:
    image: mlflow/mlflow:latest
    container_name: townin-mlflow
    ports:
      - "5000:5000"
    environment:
      - BACKEND_STORE_URI=postgresql://mlflow_user:password@postgres:5432/mlflow
      - ARTIFACT_ROOT=s3://townin-mlflow-artifacts
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    command: >
      mlflow server
      --backend-store-uri postgresql://mlflow_user:password@postgres:5432/mlflow
      --default-artifact-root s3://townin-mlflow-artifacts
      --host 0.0.0.0
      --port 5000
    depends_on:
      - postgres

  # PostgreSQL (실험 메타데이터)
  postgres:
    image: postgres:15
    container_name: mlflow-postgres
    environment:
      - POSTGRES_USER=mlflow_user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mlflow
    volumes:
      - mlflow_postgres_data:/var/lib/postgresql/data

  # Townin AI Engine (FastAPI + LangChain + pm4py)
  ai-engine:
    build: ./ai-engine
    environment:
      - MLFLOW_TRACKING_URI=http://mlflow:5000
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - mlflow

volumes:
  mlflow_postgres_data:
```

#### 비용 예상

| 구성 | 월 비용 (USD) | 한화 (₩) |
|------|-------------|----------|
| **Self-hosted (Phase 1-2)** | | |
| - EC2 t3.medium | $30 | ₩39,000 |
| - RDS PostgreSQL | $20 | ₩26,000 |
| - S3 (아티팩트) | $10 | ₩13,000 |
| **소계** | **$60** | **₩78,000** |
| | | |
| **Databricks Managed (Phase 3+)** | | |
| - MLflow 관리형 | $500-2,000 | ₩650K-2.6M |

**권장**: Phase 1-2는 Self-hosted ($60/월), Phase 3부터 Managed 고려

### 4.3 기술 스택 통합

```python
# ai-engine/main.py
from fastapi import FastAPI
import mlflow
from langchain.chains import GraphCypherQAChain

app = FastAPI()

# MLflow 설정
mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("townin-graphrag")

# LangChain 자동 로깅
mlflow.langchain.autolog()

@app.post("/graphrag/query")
async def graphrag_query(query: str):
    with mlflow.start_run(run_name=f"query_{query[:20]}"):
        mlflow.log_param("user_query", query)

        # GraphRAG 실행 (자동으로 추적됨)
        result = graphrag_pipeline.run(query)

        mlflow.log_metric("response_time_ms", result['latency'])
        mlflow.log_metric("tokens_used", result['tokens'])

        return result
```

---

## 5. MLflow + pm4py 시너지

### 5.1 통합 활용 시나리오

**골든 루틴 실험 추적**:
```python
import mlflow
import pm4py  # 상업용 라이선스 구매 후

mlflow.set_experiment("golden-routine-optimization")

# pm4py 파라미터 실험
conformance_algorithms = ["token_replay", "alignments"]

for algorithm in conformance_algorithms:
    with mlflow.start_run(run_name=f"conformance_{algorithm}"):
        mlflow.log_param("algorithm", algorithm)
        mlflow.log_param("petri_net_variant", "inductive_miner")

        # pm4py conformance checking
        if algorithm == "token_replay":
            result = pm4py.token_replay(event_log, petri_net)
        else:
            result = pm4py.alignments(event_log, petri_net)

        # 성능 메트릭
        mlflow.log_metrics({
            "fitness": result['fitness'],
            "precision": result['precision'],
            "processing_time_ms": result['time']
        })

        # 목표: fitness > 0.9, processing_time < 500ms
```

### 5.2 통합 대시보드

```python
# MLflow + pm4py 통합 대시보드
import streamlit as st
import mlflow

st.title("Townin AI/Process Mining Dashboard")

# MLflow 실험 조회
experiments = mlflow.search_runs(
    experiment_names=["townin-graphrag", "golden-routine"]
)

# GraphRAG 성능
st.subheader("GraphRAG Performance (PRD 9.1 목표치)")
st.metric("검색 정밀도", f"{experiments['retrieval_precision'].mean():.1%}",
          delta="목표: >85%")
st.metric("충실도", f"{experiments['faithfulness'].mean():.1%}",
          delta="목표: >95%")

# pm4py Golden Routine
st.subheader("Golden Routine Analysis")
st.metric("패턴 적합도", f"{experiments['fitness'].mean():.2f}",
          delta="목표: >0.9")
```

---

## 6. 성공 지표 (PRD 업데이트)

### 6.1 MLflow 운영 지표

| 지표 | 정의 | 목표치 |
|------|------|--------|
| **실험 추적 커버리지** | MLflow로 추적되는 LLM 호출 비율 | > 95% |
| **비용 가시성** | 토큰 비용이 추적되는 비율 | > 90% |
| **모델 재현율** | MLflow로 재현 가능한 모델 비율 | 100% |
| **평균 실험 주기** | 새 프롬프트/파라미터 테스트 주기 | < 1일 |

### 6.2 PRD 9.1 RAG 성능 지표 (MLflow 자동 측정)

```python
# 자동화된 성능 모니터링
with mlflow.start_run(run_name="daily_rag_benchmark"):
    metrics = mlflow.evaluate(
        model=graphrag_model,
        data=test_queries,
        metrics=["retrieval_precision", "faithfulness", "answer_relevancy"]
    )

    # PRD 목표치 달성 여부 알림
    if metrics['faithfulness'] < 0.95:
        send_alert("⚠️ Faithfulness dropped below 95% target!")
```

---

## 7. 다음 단계

### 7.1 즉시 실행

- [ ] MLflow Docker 환경 구축
- [ ] PostgreSQL + S3 설정
- [ ] LangChain 자동 로깅 테스트
- [ ] 전단지 OCR 실험 시작

### 7.2 1주일 이내

- [ ] GraphRAG 파이프라인에 MLflow 통합
- [ ] 프롬프트 레지스트리 PoC
- [ ] 토큰 비용 대시보드 구축

### 7.3 1개월 이내

- [ ] RAG 성능 지표 자동 측정 시스템
- [ ] FP 코파일럿 A/B 테스트 프레임워크
- [ ] 사기 탐지 모델 실험 시작

### 7.4 Phase 2 착수 시

- [ ] pm4py + MLflow 통합 (상업용 라이선스 구매 시)
- [ ] 골든 루틴 실험 추적
- [ ] MLflow UI를 NestJS 대시보드에 임베드

---

## 8. 대안 도구 비교

| 도구 | 장점 | 단점 | 결론 |
|------|------|------|------|
| **MLflow** | LangChain 네이티브, 오픈소스 | UI 다소 투박 | ✅ **최적** |
| **Weights & Biases** | 아름다운 UI, 협업 기능 | LangChain 통합 약함 | ❌ 부적합 |
| **LangSmith** | LangChain 전용, 트레이싱 강력 | 유료, 벤더 락인 | △ 보조 도구 |
| **Neptune.ai** | 메타데이터 관리 우수 | LLM 기능 약함 | ❌ 부적합 |

**권장 조합**:
- **Primary**: MLflow (실험 추적, 모델 레지스트리)
- **Secondary**: LangSmith (디버깅용, Phase 3 이후)

---

## 9. PRD 업데이트 제안

### 9.1 기술 스택 추가

**8. 기술 스택 (Tech Stack)**

```yaml
Backend:
  AI Engine: Python (FastAPI)
    - LangChain (GraphRAG)
    - pm4py (상업용 또는 자체 구현)
    - MLflow (필수 인프라)  # 신규

Infrastructure:
  - Docker, Kubernetes
  - AWS or Google Cloud
  - MLflow Tracking Server  # 신규
  - PostgreSQL (MLflow 메타데이터)  # 신규
  - S3 (MLflow 아티팩트)  # 신규
```

### 9.2 성공 지표 자동화

**9.1. RAG 성능 지표 (MLflow 자동 측정)**

```python
# 매일 자동 실행
@scheduler.scheduled_job('cron', hour=2)
def daily_rag_benchmark():
    with mlflow.start_run():
        metrics = mlflow.evaluate(
            model=graphrag_model,
            data=test_queries,
            metrics=[
                "retrieval_precision",  # 목표: > 85%
                "faithfulness",          # 목표: > 95%
                "answer_relevancy"       # 목표: > 90%
            ]
        )

        # Slack 알림
        if metrics['faithfulness'] < 0.95:
            send_slack_alert("GraphRAG faithfulness 목표 미달!")
```

---

## 10. 결론

### 10.1 핵심 메시지

**MLflow는 Townin 프로젝트의 필수 인프라입니다.**

**이유**:
1. ✅ GraphRAG 최적화 없이는 성공 지표(검색 정밀도 85%, 충실도 95%) 달성 불가
2. ✅ LLM 비용 추적 없이는 "GraphRAG 구축 비용 과다" 리스크 완화 불가
3. ✅ 프롬프트 버전 관리 없이는 환각 방지(FR-INS-003) 보장 불가
4. ✅ 1인 운영 모델에서 수동 실험 추적은 비현실적

### 10.2 pm4py vs MLflow

| 항목 | pm4py | MLflow |
|------|-------|--------|
| **타당성 점수** | 85/100 | **95/100** |
| **필수성** | 선택적 (차별화) | **필수** (인프라) |
| **도입 시기** | Phase 2부터 | **Phase 1부터** |
| **비용** | $5K-50K/년 또는 자체 구현 | **$60/월 (Self-hosted)** |

### 10.3 최종 권장사항

```
Phase 1 (즉시):
✅ MLflow 인프라 구축 (Docker)
✅ LangChain + MLflow 통합 테스트
✅ 전단지 OCR 실험 시작

Phase 2:
✅ GraphRAG 최적화 핵심 도구로 활용
✅ pm4py + MLflow 통합 (pm4py 상업용 구매 시)
✅ RAG 성능 지표 대시보드

Phase 3+:
✅ 모델 레지스트리로 사기 탐지 운영
✅ FP 코파일럿 A/B 테스트
✅ Databricks Managed MLflow 마이그레이션 고려
```

---

**문서 상태**: ✅ 최종 검토 완료
**마지막 업데이트**: 2024-12-21
**담당자**: Townin Development Team
**우선순위**: 🔴 **Critical** (Phase 1부터 필수)

**MLflow 공식 사이트**: https://mlflow.org
**MLflow LLM Tracking**: https://mlflow.org/docs/latest/llms/index.html
**LangChain Integration**: https://python.langchain.com/docs/integrations/providers/mlflow_tracking/
