# Docker 배포 가이드

**작성일**: 2024-12-21
**목적**: PM4Py Action Items 웹 애플리케이션 + MLflow 통합 Docker 배포
**대상**: 개발 환경, 프로덕션 환경

---

## 📦 배포 구성

### 포함된 서비스

1. **Web App** (포트 3000): PM4Py Action Items Next.js 애플리케이션
2. **MLflow Server** (포트 5000): ML 실험 추적 서버
3. **PostgreSQL** (포트 5432): MLflow 메타데이터 저장소
4. **MinIO** (포트 9000, 9001): S3 호환 아티팩트 저장소

---

## 🚀 빠른 시작

### 1. 사전 요구사항

```bash
# Docker 설치 확인
docker --version
# Docker version 24.0.0 이상

# Docker Compose 설치 확인
docker-compose --version
# Docker Compose version 2.20.0 이상
```

### 2. 환경 변수 설정 (선택)

```bash
# .env 파일 생성 (기본값 사용 시 생략 가능)
cat > .env << 'EOF'
# PostgreSQL
POSTGRES_PASSWORD=mlflow_strong_password

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=admin_strong_password
EOF
```

### 3. 배포 실행

```bash
# 프로젝트 디렉토리로 이동
cd "/Users/gangseungsig/Documents/02_GitHub/14_Townin Graph/pm4py-action-items"

# MLflow entrypoint 실행 권한 부여
chmod +x mlflow-docker/mlflow-entrypoint.sh

# 모든 서비스 시작
docker-compose -f docker-compose.deploy.yml up -d

# 빌드부터 시작 (코드 변경 시)
docker-compose -f docker-compose.deploy.yml up -d --build
```

### 4. 서비스 확인

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.deploy.yml ps

# 로그 확인
docker-compose -f docker-compose.deploy.yml logs -f

# 특정 서비스 로그만 확인
docker-compose -f docker-compose.deploy.yml logs -f web
docker-compose -f docker-compose.deploy.yml logs -f mlflow
```

### 5. 웹 접속

- **Web App**: http://localhost:3000
- **MLflow UI**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (admin/admin_strong_password)

---

## 🏗️ 개발 환경 vs 프로덕션 환경

### 개발 환경 (현재 구성)

```bash
# 로컬에서 실행
docker-compose -f docker-compose.deploy.yml up -d
```

**특징**:
- 기본 포트 사용 (3000, 5000, 9000, 5432)
- 기본 비밀번호 (보안 낮음)
- 로컬 볼륨 저장

### 프로덕션 환경 (AWS/GCP 배포 시)

#### AWS EC2 배포 예시

**1. EC2 인스턴스 생성**:
```
- AMI: Amazon Linux 2023
- Instance Type: t3.medium (4GB RAM 권장)
- Security Group:
  - 포트 80 (HTTP)
  - 포트 443 (HTTPS)
  - 포트 22 (SSH, 본인 IP만)
```

**2. Docker 설치**:
```bash
# EC2 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# Docker 설치
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**3. 프로젝트 배포**:
```bash
# Git clone (또는 파일 업로드)
git clone https://github.com/your-repo/pm4py-action-items.git
cd pm4py-action-items

# 환경 변수 설정
cat > .env << 'EOF'
POSTGRES_PASSWORD=$(openssl rand -base64 32)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)
EOF

# 배포 실행
chmod +x mlflow-docker/mlflow-entrypoint.sh
docker-compose -f docker-compose.deploy.yml up -d
```

**4. Nginx 리버스 프록시 (선택)**:
```nginx
# /etc/nginx/conf.d/townin.conf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /mlflow/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**5. SSL 인증서 (Let's Encrypt)**:
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 관리 명령어

### 시작/중지/재시작

```bash
# 시작
docker-compose -f docker-compose.deploy.yml up -d

# 중지
docker-compose -f docker-compose.deploy.yml down

# 재시작
docker-compose -f docker-compose.deploy.yml restart

# 특정 서비스만 재시작
docker-compose -f docker-compose.deploy.yml restart web
docker-compose -f docker-compose.deploy.yml restart mlflow
```

### 로그 확인

```bash
# 전체 로그
docker-compose -f docker-compose.deploy.yml logs

# 실시간 로그 (tail -f)
docker-compose -f docker-compose.deploy.yml logs -f

# 최근 100줄만
docker-compose -f docker-compose.deploy.yml logs --tail=100

# 특정 서비스
docker-compose -f docker-compose.deploy.yml logs -f web
```

### 상태 확인

```bash
# 컨테이너 상태
docker-compose -f docker-compose.deploy.yml ps

# 리소스 사용량
docker stats

# 헬스체크
curl http://localhost:3000  # Web App
curl http://localhost:5000/health  # MLflow
curl http://localhost:9000/minio/health/live  # MinIO
```

### 업데이트

```bash
# 코드 업데이트 후 재배포
git pull
docker-compose -f docker-compose.deploy.yml up -d --build

# 이미지만 재빌드
docker-compose -f docker-compose.deploy.yml build web

# 특정 서비스만 재배포
docker-compose -f docker-compose.deploy.yml up -d --build web
```

### 데이터 백업

```bash
# PostgreSQL 백업
docker exec mlflow-postgres pg_dump -U mlflow_user mlflow > backup_$(date +%Y%m%d).sql

# MinIO 데이터 백업 (볼륨 전체)
docker run --rm -v pm4py-action-items_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz -C /data .

# PostgreSQL 볼륨 백업
docker run --rm -v pm4py-action-items_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### 데이터 복원

```bash
# PostgreSQL 복원
cat backup_20241221.sql | docker exec -i mlflow-postgres psql -U mlflow_user mlflow

# MinIO 볼륨 복원
docker run --rm -v pm4py-action-items_minio_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/minio_backup_20241221.tar.gz"
```

### 완전 삭제 (주의!)

```bash
# 컨테이너 중지 및 삭제 (볼륨 유지)
docker-compose -f docker-compose.deploy.yml down

# 컨테이너 + 볼륨 + 네트워크 모두 삭제
docker-compose -f docker-compose.deploy.yml down -v

# 이미지까지 삭제
docker-compose -f docker-compose.deploy.yml down --rmi all -v
```

---

## 🐛 트러블슈팅

### 문제 1: 웹 앱이 시작되지 않음

```bash
# 로그 확인
docker-compose -f docker-compose.deploy.yml logs web

# 빌드 에러 시 재빌드
docker-compose -f docker-compose.deploy.yml build --no-cache web
docker-compose -f docker-compose.deploy.yml up -d web
```

### 문제 2: MLflow 연결 실패

```bash
# PostgreSQL 상태 확인
docker-compose -f docker-compose.deploy.yml logs postgres

# PostgreSQL 재시작
docker-compose -f docker-compose.deploy.yml restart postgres

# MLflow 재시작
docker-compose -f docker-compose.deploy.yml restart mlflow
```

### 문제 3: MinIO 버킷 생성 실패

```bash
# mc 컨테이너 재실행
docker-compose -f docker-compose.deploy.yml up mc

# 수동 버킷 생성
docker exec -it mlflow-minio mc mb /data/mlflow-artifacts
```

### 문제 4: 포트 충돌

```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :5000

# 포트 변경 (docker-compose.deploy.yml 수정)
# web:
#   ports:
#     - "8080:3000"  # 3000 → 8080으로 변경
```

### 문제 5: 디스크 공간 부족

```bash
# 사용하지 않는 컨테이너 삭제
docker container prune

# 사용하지 않는 이미지 삭제
docker image prune -a

# 사용하지 않는 볼륨 삭제 (주의!)
docker volume prune
```

---

## 📊 모니터링

### 리소스 사용량 확인

```bash
# 실시간 모니터링
docker stats

# 특정 컨테이너만
docker stats pm4py-action-items-web mlflow-server
```

### 로그 모니터링 (Cloudwatch, Grafana 등)

```yaml
# docker-compose.deploy.yml에 logging 추가
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔐 보안 설정

### 1. 환경 변수 보안

```bash
# .env 파일을 .gitignore에 추가
echo ".env" >> .gitignore

# 강력한 비밀번호 생성
openssl rand -base64 32
```

### 2. 네트워크 격리

```yaml
# docker-compose.deploy.yml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

services:
  web:
    networks:
      - frontend

  mlflow:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend  # 외부 접근 차단
```

### 3. 방화벽 설정 (AWS Security Group)

```
인바운드 규칙:
- 포트 80: 0.0.0.0/0 (HTTP)
- 포트 443: 0.0.0.0/0 (HTTPS)
- 포트 22: YOUR_IP/32 (SSH, 본인만)

차단:
- 포트 3000, 5000, 9000, 5432 (내부 통신만)
```

---

## 📈 성능 최적화

### 1. 리소스 제한

```yaml
# docker-compose.deploy.yml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 이미지 크기 최적화

```dockerfile
# Dockerfile에서 Multi-stage build 사용 (이미 적용됨)
FROM node:20-alpine AS base  # alpine으로 경량화
```

### 3. 캐시 활용

```bash
# 빌드 시 캐시 활용
docker-compose -f docker-compose.deploy.yml build
```

---

## 💰 비용 예상

### AWS 배포 시 (월간)

| 항목 | 구성 | 비용 (USD) | 비용 (KRW) |
|------|------|-----------|-----------|
| **EC2** | t3.medium | $30 | ₩39,000 |
| **EBS** | 30GB gp3 | $3 | ₩3,900 |
| **데이터 전송** | 50GB/월 | $5 | ₩6,500 |
| **Route 53** | 도메인 | $1 | ₩1,300 |
| **총계** | | **$39** | **₩50,700** |

**절약 팁**:
- t3.micro (1GB RAM) 사용 시: $7.5/월 (₩9,750)
- Spot Instance 사용 시: 70% 절약
- AWS Free Tier 활용 (12개월)

---

## 🔄 CI/CD 통합 (GitHub Actions 예시)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_KEY }}
          script: |
            cd pm4py-action-items
            git pull
            docker-compose -f docker-compose.deploy.yml up -d --build
```

---

## 📚 관련 문서

- `README.md`: 프로젝트 개요
- `NEXT_STEPS.md`: 다음 단계 가이드
- `mlflow-docker/README.md`: MLflow Docker 상세 가이드

---

## 🆘 지원

### 문제 발생 시
1. 로그 확인: `docker-compose -f docker-compose.deploy.yml logs`
2. GitHub Issues 등록
3. 이메일: [Your Email]

### 유용한 링크
- **Next.js 배포**: https://nextjs.org/docs/deployment
- **Docker 문서**: https://docs.docker.com/
- **MLflow 문서**: https://mlflow.org/docs/

---

**마지막 업데이트**: 2024-12-21
**상태**: ✅ 배포 가능
**테스트 완료**: 로컬 환경
