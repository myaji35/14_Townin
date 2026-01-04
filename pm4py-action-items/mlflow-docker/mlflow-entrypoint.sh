#!/bin/bash

# MLflow Server Entrypoint Script
set -e

echo "================================================"
echo "MLflow Tracking Server - Townin Project"
echo "================================================"

# Install required packages
echo "Installing MLflow and dependencies..."
pip install --no-cache-dir \
    mlflow==2.9.2 \
    psycopg2-binary \
    boto3 \
    langchain \
    langchain-openai \
    scikit-learn

echo "✅ Dependencies installed successfully"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U mlflow_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for MinIO to be ready
echo "Waiting for MinIO..."
until curl -f http://minio:9000/minio/health/live; do
  echo "MinIO is unavailable - sleeping"
  sleep 2
done
echo "✅ MinIO is ready"

# Start MLflow server
echo "================================================"
echo "Starting MLflow Tracking Server..."
echo "================================================"
echo ""
echo "MLflow UI: http://localhost:5000"
echo "Backend Store: PostgreSQL (postgres:5432/mlflow)"
echo "Artifact Store: MinIO (S3-compatible)"
echo ""
echo "================================================"

mlflow server \
    --backend-store-uri "${MLFLOW_BACKEND_STORE_URI}" \
    --default-artifact-root s3://mlflow-artifacts/ \
    --host "${MLFLOW_HOST}" \
    --port "${MLFLOW_PORT}"
