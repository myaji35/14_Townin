#!/bin/bash
set -e

# Environment variables validation
: "${MLFLOW_BACKEND_STORE_URI:?Need to set MLFLOW_BACKEND_STORE_URI}"
: "${MLFLOW_ARTIFACT_ROOT:?Need to set MLFLOW_ARTIFACT_ROOT}"
: "${PORT:=5000}"

echo "Starting MLflow Server on Cloud Run..."
echo "Backend Store: ${MLFLOW_BACKEND_STORE_URI}"
echo "Artifact Root: ${MLFLOW_ARTIFACT_ROOT}"
echo "Port: ${PORT}"

# Wait for Cloud SQL Proxy (if used)
if [ -n "$CLOUD_SQL_CONNECTION_NAME" ]; then
    echo "Waiting for Cloud SQL Proxy..."
    until pg_isready -h localhost -p 5432; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
fi

# Start MLflow server
exec mlflow server \
    --backend-store-uri "${MLFLOW_BACKEND_STORE_URI}" \
    --default-artifact-root "${MLFLOW_ARTIFACT_ROOT}" \
    --host 0.0.0.0 \
    --port "${PORT}" \
    --gunicorn-opts "--workers=4 --threads=2 --timeout=120"
