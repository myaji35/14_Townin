#!/bin/bash
set -e

# ============================================================================
# MLflow Production SaaS Deployment Script
# ============================================================================
#
# Townin 프로젝트를 위한 프로덕션급 MLflow 자동 배포 스크립트
#
# 사용법:
#   ./deploy-production.sh [--skip-infra] [--skip-deploy]
#
# 옵션:
#   --skip-infra    인프라 생성 건너뛰기 (DB, Storage만)
#   --skip-deploy   Cloud Run 배포만 건너뛰기
# ============================================================================

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# 환경 변수 설정
# ============================================================================

export PROJECT_ID="msccruises"
export REGION="asia-northeast3"
export SERVICE_NAME="mlflow-server"
export DB_INSTANCE_NAME="townin-mlflow-postgres"
export STORAGE_BUCKET="townin-mlflow-artifacts"
export SERVICE_ACCOUNT="mlflow-sa"
export VPC_CONNECTOR="mlflow-vpc-connector"

# 데이터베이스 설정
export DB_NAME="mlflow"
export DB_USER="mlflow_user"
export DB_TIER="db-custom-4-16384"  # 4 vCPU, 16GB RAM

# Cloud Run 설정
export MIN_INSTANCES=1
export MAX_INSTANCES=50
export CPU=2
export MEMORY="4Gi"

log_info "프로젝트: $PROJECT_ID"
log_info "리전: $REGION"
log_info "서비스: $SERVICE_NAME"

# ============================================================================
# Step 1: 서비스 계정 생성
# ============================================================================

create_service_account() {
    log_info "서비스 계정 생성 중..."

    # 서비스 계정 확인
    if gcloud iam service-accounts describe ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
        log_warning "서비스 계정이 이미 존재합니다. 건너뜁니다."
    else
        gcloud iam service-accounts create ${SERVICE_ACCOUNT} \
            --display-name="MLflow Production Service Account" \
            --description="Service account for MLflow Cloud Run service"
        log_success "서비스 계정 생성 완료"
    fi

    # IAM 권한 부여
    log_info "IAM 권한 부여 중..."

    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/cloudsql.client" \
        --condition=None

    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/storage.objectAdmin" \
        --condition=None

    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --condition=None

    log_success "IAM 권한 부여 완료"
}

# ============================================================================
# Step 2: Secret Manager 설정
# ============================================================================

setup_secrets() {
    log_info "Secret Manager 설정 중..."

    # DB 비밀번호 생성
    if gcloud secrets describe mlflow-db-password &>/dev/null; then
        log_warning "DB 비밀번호 시크릿이 이미 존재합니다."
    else
        log_info "강력한 DB 비밀번호를 생성하세요:"
        read -sp "DB 비밀번호 입력: " DB_PASSWORD
        echo
        echo -n "$DB_PASSWORD" | gcloud secrets create mlflow-db-password \
            --data-file=- \
            --replication-policy="automatic"
        log_success "DB 비밀번호 시크릿 생성 완료"
    fi

    # 아티팩트 루트 URL
    if gcloud secrets describe mlflow-artifact-root &>/dev/null; then
        log_warning "아티팩트 루트 시크릿이 이미 존재합니다."
    else
        echo -n "gs://${STORAGE_BUCKET}" | gcloud secrets create mlflow-artifact-root \
            --data-file=- \
            --replication-policy="automatic"
        log_success "아티팩트 루트 시크릿 생성 완료"
    fi

    # 서비스 계정에 접근 권한 부여
    gcloud secrets add-iam-policy-binding mlflow-db-password \
        --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor"

    gcloud secrets add-iam-policy-binding mlflow-artifact-root \
        --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor"

    log_success "Secret Manager 설정 완료"
}

# ============================================================================
# Step 3: Cloud SQL 생성 (HA 구성)
# ============================================================================

create_cloud_sql() {
    log_info "Cloud SQL 인스턴스 생성 중 (HA 구성)..."

    # 인스턴스 존재 확인
    if gcloud sql instances describe ${DB_INSTANCE_NAME} &>/dev/null; then
        log_warning "Cloud SQL 인스턴스가 이미 존재합니다. 건너뜁니다."
        return
    fi

    # DB 비밀번호 가져오기
    DB_PASSWORD=$(gcloud secrets versions access latest --secret="mlflow-db-password")

    log_info "프로덕션급 PostgreSQL 인스턴스 생성 중... (5-10분 소요)"
    gcloud sql instances create ${DB_INSTANCE_NAME} \
        --database-version=POSTGRES_15 \
        --tier=${DB_TIER} \
        --region=${REGION} \
        --availability-type=REGIONAL \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --retained-backups-count=30 \
        --retained-transaction-log-days=7 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04 \
        --database-flags=max_connections=500,shared_buffers=4GB \
        --no-assign-ip \
        --network=default

    log_success "Cloud SQL 인스턴스 생성 완료"

    # 루트 비밀번호 설정
    log_info "루트 비밀번호 설정 중..."
    gcloud sql users set-password postgres \
        --instance=${DB_INSTANCE_NAME} \
        --password="${DB_PASSWORD}"

    # MLflow 데이터베이스 생성
    log_info "MLflow 데이터베이스 생성 중..."
    gcloud sql databases create ${DB_NAME} \
        --instance=${DB_INSTANCE_NAME}

    # MLflow 사용자 생성
    log_info "MLflow 사용자 생성 중..."
    gcloud sql users create ${DB_USER} \
        --instance=${DB_INSTANCE_NAME} \
        --password="${DB_PASSWORD}"

    log_success "Cloud SQL 설정 완료"
}

# ============================================================================
# Step 4: Cloud Storage 생성
# ============================================================================

create_storage() {
    log_info "Cloud Storage 버킷 생성 중..."

    # 버킷 존재 확인
    if gsutil ls -b gs://${STORAGE_BUCKET} &>/dev/null; then
        log_warning "Storage 버킷이 이미 존재합니다. 건너뜁니다."
        return
    fi

    # 버킷 생성
    gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${STORAGE_BUCKET}

    # 버전 관리 활성화
    gsutil versioning set on gs://${STORAGE_BUCKET}

    # Lifecycle 정책 설정
    log_info "Lifecycle 정책 설정 중..."
    cat > /tmp/lifecycle.json << 'EOF'
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

    gsutil lifecycle set /tmp/lifecycle.json gs://${STORAGE_BUCKET}
    rm /tmp/lifecycle.json

    # 서비스 계정에 권한 부여
    gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin \
        gs://${STORAGE_BUCKET}

    log_success "Cloud Storage 설정 완료"
}

# ============================================================================
# Step 5: VPC Connector 생성
# ============================================================================

create_vpc_connector() {
    log_info "VPC Connector 생성 중..."

    # VPC Connector 존재 확인
    if gcloud compute networks vpc-access connectors describe ${VPC_CONNECTOR} \
        --region=${REGION} &>/dev/null; then
        log_warning "VPC Connector가 이미 존재합니다. 건너뜁니다."
        return
    fi

    log_info "VPC Connector 생성 중... (5분 소요)"
    gcloud compute networks vpc-access connectors create ${VPC_CONNECTOR} \
        --network=default \
        --region=${REGION} \
        --range=10.8.0.0/28 \
        --min-instances=2 \
        --max-instances=10

    log_success "VPC Connector 생성 완료"
}

# ============================================================================
# Step 6: Cloud Run 배포
# ============================================================================

deploy_cloud_run() {
    log_info "Cloud Run 서비스 배포 중..."

    # Cloud SQL 연결 이름 가져오기
    SQL_CONNECTION=$(gcloud sql instances describe ${DB_INSTANCE_NAME} \
        --format='value(connectionName)')

    log_info "Cloud SQL Connection: $SQL_CONNECTION"

    # DB URI 구성 (Secret Manager 사용)
    DB_PASSWORD=$(gcloud secrets versions access latest --secret="mlflow-db-password")
    BACKEND_STORE_URI="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${SQL_CONNECTION}"

    # Backend URI를 Secret Manager에 저장
    if ! gcloud secrets describe mlflow-backend-uri &>/dev/null; then
        echo -n "$BACKEND_STORE_URI" | gcloud secrets create mlflow-backend-uri \
            --data-file=- \
            --replication-policy="automatic"

        gcloud secrets add-iam-policy-binding mlflow-backend-uri \
            --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor"
    fi

    # Cloud Run 배포
    log_info "프로덕션 Cloud Run 서비스 배포 중..."
    gcloud run deploy ${SERVICE_NAME} \
        --image gcr.io/${PROJECT_ID}/mlflow-server:latest \
        --platform managed \
        --region ${REGION} \
        --service-account ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
        --no-allow-unauthenticated \
        --add-cloudsql-instances ${SQL_CONNECTION} \
        --vpc-connector ${VPC_CONNECTOR} \
        --vpc-egress private-ranges-only \
        --update-secrets MLFLOW_BACKEND_STORE_URI=mlflow-backend-uri:latest \
        --update-secrets MLFLOW_ARTIFACT_ROOT=mlflow-artifact-root:latest \
        --cpu ${CPU} \
        --memory ${MEMORY} \
        --timeout 300 \
        --concurrency 80 \
        --min-instances ${MIN_INSTANCES} \
        --max-instances ${MAX_INSTANCES} \
        --port 5000 \
        --cpu-throttling \
        --execution-environment gen2

    log_success "Cloud Run 배포 완료"

    # 서비스 URL 가져오기
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --format='value(status.url)')

    log_success "MLflow 서비스 URL: $SERVICE_URL"
}

# ============================================================================
# Step 7: IAM 접근 권한 설정
# ============================================================================

setup_iam_access() {
    log_info "IAM 접근 권한 설정 중..."

    echo ""
    log_warning "누가 MLflow 서비스에 접근할 수 있어야 하나요?"
    echo "1) 특정 사용자 (이메일)"
    echo "2) Google Group"
    echo "3) 나중에 수동으로 설정"
    read -p "선택 (1-3): " choice

    case $choice in
        1)
            read -p "사용자 이메일 입력: " user_email
            gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
                --region=${REGION} \
                --member="user:${user_email}" \
                --role="roles/run.invoker"
            log_success "사용자 ${user_email}에게 접근 권한 부여 완료"
            ;;
        2)
            read -p "Google Group 이메일 입력: " group_email
            gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
                --region=${REGION} \
                --member="group:${group_email}" \
                --role="roles/run.invoker"
            log_success "그룹 ${group_email}에게 접근 권한 부여 완료"
            ;;
        3)
            log_info "나중에 다음 명령어로 수동 설정하세요:"
            echo "gcloud run services add-iam-policy-binding ${SERVICE_NAME} \\"
            echo "  --region=${REGION} \\"
            echo "  --member=\"user:your-email@example.com\" \\"
            echo "  --role=\"roles/run.invoker\""
            ;;
    esac
}

# ============================================================================
# Step 8: 모니터링 및 알림 설정
# ============================================================================

setup_monitoring() {
    log_info "모니터링 및 알림 설정 중..."

    # Uptime Check 생성
    log_info "Uptime Check 생성 중..."
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --format='value(status.url)')

    # 간단한 헬스 체크만 설정 (상세 설정은 GCP Console에서)
    log_warning "상세한 모니터링 설정은 GCP Console에서 수동으로 구성하세요:"
    echo "  - Cloud Monitoring > Uptime checks"
    echo "  - Cloud Monitoring > Alerting policies"
    echo "  - Notification channels (이메일, Slack 등)"
}

# ============================================================================
# 메인 실행 흐름
# ============================================================================

main() {
    log_info "=========================================="
    log_info "MLflow Production SaaS 배포 시작"
    log_info "=========================================="
    echo ""

    # 사전 확인
    log_warning "다음 작업이 수행됩니다:"
    echo "  1. 서비스 계정 생성 및 IAM 권한 부여"
    echo "  2. Secret Manager 설정"
    echo "  3. Cloud SQL HA 인스턴스 생성 (~$350/month)"
    echo "  4. Cloud Storage 버킷 생성"
    echo "  5. VPC Connector 생성 (~$10/month)"
    echo "  6. Cloud Run 배포 (Min 1 instance ~$35/month)"
    echo ""
    log_warning "예상 월 비용: ~$400-500 USD"
    echo ""
    read -p "계속 진행하시겠습니까? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_error "배포가 취소되었습니다."
        exit 1
    fi

    echo ""

    # 인프라 구성
    if [[ ! " $@ " =~ " --skip-infra " ]]; then
        create_service_account
        setup_secrets
        create_cloud_sql
        create_storage
        create_vpc_connector
    else
        log_warning "인프라 생성을 건너뜁니다."
    fi

    # Cloud Run 배포
    if [[ ! " $@ " =~ " --skip-deploy " ]]; then
        deploy_cloud_run
        setup_iam_access
        setup_monitoring
    else
        log_warning "Cloud Run 배포를 건너뜁니다."
    fi

    echo ""
    log_success "=========================================="
    log_success "MLflow Production SaaS 배포 완료!"
    log_success "=========================================="
    echo ""

    # 배포 정보 출력
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --format='value(status.url)' 2>/dev/null || echo "배포 필요")

    log_info "배포 정보:"
    echo "  - 서비스 URL: $SERVICE_URL"
    echo "  - 프로젝트: $PROJECT_ID"
    echo "  - 리전: $REGION"
    echo "  - Cloud SQL: $DB_INSTANCE_NAME"
    echo "  - Storage: gs://$STORAGE_BUCKET"
    echo ""

    log_info "다음 단계:"
    echo "  1. IAM 인증을 통해 MLflow에 접근"
    echo "  2. Python SDK에서 인증 설정:"
    echo "     gcloud auth application-default login"
    echo "  3. MLflow Tracking URI 설정:"
    echo "     mlflow.set_tracking_uri(\"$SERVICE_URL\")"
    echo ""
    echo "  자세한 사용법: SAAS_PRODUCTION_ARCHITECTURE.md 참고"
}

# 스크립트 실행
main "$@"
