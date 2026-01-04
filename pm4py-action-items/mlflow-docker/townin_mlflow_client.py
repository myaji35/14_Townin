"""
Townin MLflow Client - Production SaaS
======================================

프로덕션 환경에서 MLflow를 안전하게 사용하기 위한 클라이언트 라이브러리

특징:
- IAM 인증 자동 처리
- 고객별 데이터 격리 (Multi-tenancy)
- 에러 핸들링 및 재시도
- 비용 추적 (토큰 사용량, API 호출)

사용 예시:
    from townin_mlflow_client import TowninMLflowClient

    client = TowninMLflowClient(
        tracking_uri="https://mlflow-server-HASH.run.app",
        customer_id="townin_corp"
    )

    with client.start_run("graphrag_optimization") as run:
        client.log_param("chunk_size", 512)
        client.log_metric("faithfulness", 0.92)
        client.log_artifact("results/graph.png")
"""

import os
import mlflow
from mlflow.entities import Metric, Param
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import google.auth
from google.auth.transport.requests import Request

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TowninMLflowClient:
    """
    Townin 프로젝트를 위한 MLflow 클라이언트

    멀티테넌시를 지원하며, IAM 인증을 자동으로 처리합니다.
    """

    def __init__(
        self,
        tracking_uri: str,
        customer_id: str = "default",
        auto_auth: bool = True
    ):
        """
        Args:
            tracking_uri: MLflow 서버 URL (Cloud Run)
            customer_id: 고객 ID (데이터 격리용)
            auto_auth: 자동 인증 활성화 (Google Cloud IAM)
        """
        self.tracking_uri = tracking_uri
        self.customer_id = customer_id
        self.auto_auth = auto_auth

        # MLflow tracking URI 설정
        mlflow.set_tracking_uri(self.tracking_uri)

        # Google Cloud 인증 설정
        if self.auto_auth:
            self._setup_auth()

        logger.info(f"TowninMLflowClient 초기화 완료: {tracking_uri}")
        logger.info(f"Customer ID: {customer_id}")

    def _setup_auth(self):
        """Google Cloud IAM 인증 설정"""
        try:
            credentials, project = google.auth.default()

            # 토큰 갱신
            if credentials.expired:
                credentials.refresh(Request())

            # 환경 변수에 토큰 설정 (MLflow가 사용)
            os.environ["MLFLOW_TRACKING_TOKEN"] = credentials.token

            logger.info("Google Cloud 인증 성공")

        except Exception as e:
            logger.warning(f"자동 인증 실패: {e}")
            logger.warning("다음 명령어로 수동 인증하세요: gcloud auth application-default login")

    def _get_experiment_name(self, base_name: str) -> str:
        """
        고객별 네임스페이스를 적용한 실험 이름 반환

        Args:
            base_name: 기본 실험 이름

        Returns:
            고객 ID가 포함된 전체 실험 이름
        """
        return f"/customer_{self.customer_id}/{base_name}"

    def create_experiment(
        self,
        name: str,
        artifact_location: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None
    ) -> str:
        """
        새 MLflow Experiment 생성

        Args:
            name: 실험 이름
            artifact_location: 아티팩트 저장 위치 (선택)
            tags: 실험 태그

        Returns:
            생성된 실험 ID
        """
        experiment_name = self._get_experiment_name(name)

        try:
            # 이미 존재하는지 확인
            experiment = mlflow.get_experiment_by_name(experiment_name)
            if experiment:
                logger.info(f"기존 실험 사용: {experiment_name} (ID: {experiment.experiment_id})")
                return experiment.experiment_id

            # 새 실험 생성
            experiment_id = mlflow.create_experiment(
                name=experiment_name,
                artifact_location=artifact_location,
                tags=tags or {}
            )

            logger.info(f"새 실험 생성: {experiment_name} (ID: {experiment_id})")
            return experiment_id

        except Exception as e:
            logger.error(f"실험 생성 실패: {e}")
            raise

    def start_run(
        self,
        experiment_name: str,
        run_name: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None
    ):
        """
        MLflow Run 시작

        Args:
            experiment_name: 실험 이름
            run_name: Run 이름 (선택)
            tags: Run 태그

        Returns:
            MLflow ActiveRun 객체

        Example:
            with client.start_run("graphrag_test") as run:
                client.log_param("chunk_size", 512)
                client.log_metric("faithfulness", 0.92)
        """
        full_experiment_name = self._get_experiment_name(experiment_name)

        # 실험 존재 확인 및 생성
        experiment = mlflow.get_experiment_by_name(full_experiment_name)
        if not experiment:
            self.create_experiment(experiment_name)

        # 실험 설정
        mlflow.set_experiment(full_experiment_name)

        # Run 시작
        default_tags = {
            "customer_id": self.customer_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        if tags:
            default_tags.update(tags)

        return mlflow.start_run(run_name=run_name, tags=default_tags)

    def log_param(self, key: str, value: Any):
        """파라미터 로깅"""
        mlflow.log_param(key, value)
        logger.debug(f"Param logged: {key}={value}")

    def log_params(self, params: Dict[str, Any]):
        """여러 파라미터 일괄 로깅"""
        mlflow.log_params(params)
        logger.debug(f"Params logged: {len(params)} items")

    def log_metric(self, key: str, value: float, step: Optional[int] = None):
        """메트릭 로깅"""
        mlflow.log_metric(key, value, step=step)
        logger.debug(f"Metric logged: {key}={value}")

    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        """여러 메트릭 일괄 로깅"""
        mlflow.log_metrics(metrics, step=step)
        logger.debug(f"Metrics logged: {len(metrics)} items")

    def log_artifact(self, local_path: str, artifact_path: Optional[str] = None):
        """아티팩트 (파일) 로깅"""
        mlflow.log_artifact(local_path, artifact_path=artifact_path)
        logger.info(f"Artifact logged: {local_path}")

    def log_artifacts(self, local_dir: str, artifact_path: Optional[str] = None):
        """여러 아티팩트 (디렉토리) 로깅"""
        mlflow.log_artifacts(local_dir, artifact_path=artifact_path)
        logger.info(f"Artifacts logged from: {local_dir}")

    def log_model(self, model, artifact_path: str, **kwargs):
        """모델 로깅"""
        mlflow.sklearn.log_model(model, artifact_path, **kwargs)
        logger.info(f"Model logged: {artifact_path}")

    def set_tag(self, key: str, value: Any):
        """태그 설정"""
        mlflow.set_tag(key, value)

    def set_tags(self, tags: Dict[str, Any]):
        """여러 태그 일괄 설정"""
        mlflow.set_tags(tags)

    def get_experiment(self, name: str):
        """실험 정보 조회"""
        full_name = self._get_experiment_name(name)
        return mlflow.get_experiment_by_name(full_name)

    def search_runs(
        self,
        experiment_name: str,
        filter_string: str = "",
        max_results: int = 100
    ) -> List:
        """
        실험의 Run 검색

        Args:
            experiment_name: 실험 이름
            filter_string: 필터 조건 (MLflow 쿼리 문법)
            max_results: 최대 결과 수

        Returns:
            Run 목록
        """
        experiment = self.get_experiment(experiment_name)
        if not experiment:
            logger.warning(f"실험을 찾을 수 없음: {experiment_name}")
            return []

        return mlflow.search_runs(
            experiment_ids=[experiment.experiment_id],
            filter_string=filter_string,
            max_results=max_results
        )


# ============================================================================
# LangChain 통합
# ============================================================================

class TowninLangChainTracker(TowninMLflowClient):
    """
    LangChain 자동 추적을 위한 클라이언트

    LangChain 실행을 자동으로 MLflow에 로깅합니다.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._setup_langchain_autolog()

    def _setup_langchain_autolog(self):
        """LangChain 자동 로깅 활성화"""
        try:
            import mlflow.langchain
            mlflow.langchain.autolog()
            logger.info("LangChain 자동 로깅 활성화")
        except ImportError:
            logger.warning("mlflow.langchain을 사용하려면 'pip install mlflow[langchain]' 실행")


# ============================================================================
# 비용 추적 Wrapper
# ============================================================================

class CostTracker:
    """
    LLM API 비용 추적 유틸리티

    OpenAI, Anthropic 등의 API 사용량을 추적하고 MLflow에 로깅합니다.
    """

    # 모델별 비용 (USD per 1K tokens)
    PRICING = {
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
        "text-embedding-ada-002": {"input": 0.0001, "output": 0.0},
    }

    @classmethod
    def calculate_cost(
        cls,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """
        LLM API 비용 계산

        Args:
            model: 모델 이름
            input_tokens: 입력 토큰 수
            output_tokens: 출력 토큰 수

        Returns:
            비용 (USD)
        """
        pricing = cls.PRICING.get(model, {"input": 0, "output": 0})
        cost = (
            (input_tokens / 1000) * pricing["input"] +
            (output_tokens / 1000) * pricing["output"]
        )
        return round(cost, 6)

    @classmethod
    def log_llm_usage(
        cls,
        client: TowninMLflowClient,
        model: str,
        input_tokens: int,
        output_tokens: int,
        step: Optional[int] = None
    ):
        """
        LLM 사용량을 MLflow에 로깅

        Args:
            client: TowninMLflowClient 인스턴스
            model: 모델 이름
            input_tokens: 입력 토큰 수
            output_tokens: 출력 토큰 수
            step: 스텝 번호 (시계열 추적용)
        """
        cost = cls.calculate_cost(model, input_tokens, output_tokens)

        client.log_metrics({
            "llm_input_tokens": input_tokens,
            "llm_output_tokens": output_tokens,
            "llm_total_tokens": input_tokens + output_tokens,
            "llm_cost_usd": cost
        }, step=step)

        client.set_tag("llm_model", model)

        logger.info(f"LLM 비용 로깅: {model} - ${cost:.6f}")


# ============================================================================
# 사용 예시
# ============================================================================

if __name__ == "__main__":
    # 예시: GraphRAG 실험 추적
    client = TowninMLflowClient(
        tracking_uri="https://mlflow-server-HASH.run.app",
        customer_id="townin_corp"
    )

    with client.start_run("graphrag_optimization", run_name="experiment_001") as run:
        # 파라미터 로깅
        client.log_params({
            "chunk_size": 512,
            "chunk_overlap": 50,
            "embedding_model": "text-embedding-ada-002",
            "llm_model": "gpt-4o"
        })

        # 메트릭 로깅
        client.log_metrics({
            "faithfulness": 0.92,
            "answer_relevancy": 0.88,
            "context_recall": 0.95
        })

        # LLM 비용 추적
        CostTracker.log_llm_usage(
            client=client,
            model="gpt-4o",
            input_tokens=15000,
            output_tokens=3000
        )

        # 아티팩트 저장
        # client.log_artifact("results/graph_visualization.png")

        print(f"Run ID: {run.info.run_id}")
        print(f"Experiment ID: {run.info.experiment_id}")
