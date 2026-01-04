# 🏙️ Townin - 지역 기반 광고 플랫폼

[![CI/CD Pipeline](https://github.com/townin/townin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/townin/townin/actions)
[![codecov](https://codecov.io/gh/townin/townin/branch/main/graph/badge.svg)](https://codecov.io/gh/townin/townin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 의정부시를 위한 혁신적인 지역 기반 전단지 광고 플랫폼

---

## 📋 **프로젝트 개요**

Townin은 지역 상권을 활성화하고 주민들에게 편리한 정보를 제공하는 통합 플랫폼입니다.

### **주요 기능**

#### **👥 일반 사용자**
- 🔍 **AR 전단지 뷰어**: AR 기술로 주변 매장 전단지 확인
- 🗺️ **안전 지도**: CCTV, 주차장, 대피소 등 공공 데이터 통합
- ⭐ **포인트 시스템**: 전단지 열람 시 포인트 적립
- 📱 **실시간 알림**: 주변 매장의 신규 프로모션 알림

#### **🏪 머천트**
- 📝 **전단지 관리**: 손쉬운 전단지 생성 및 수정
- 📊 **분석 대시보드**: 실시간 조회수, 클릭수, ROI 추적
- 📺 **디지털 간판**: 매장 내 전자 간판 자동 슬라이드쇼
- 💰 **포인트 관리**: 사용자 리워드 포인트 설정

#### **🛡️ 보안요원**
- ✅ **전단지 승인**: 체크리스트 기반 검토 시스템
- 📹 **CCTV 모니터링**: 실시간 카메라 피드
- 🚨 **안전 이벤트**: 우선순위 기반 이벤트 관리
- 📞 **긴급 연락망**: 원터치 전화 연결

#### **⚙️ 관리자**
- 📈 **통합 대시보드**: 전체 시스템 현황
- 👥 **사용자 관리**: 머천트/보안요원 승인
- 📊 **통계 분석**: 플랫폼 전체 인사이트

---

## 🏗️ **기술 스택**

### **Frontend**
- **Web Dashboard**: Next.js 16.1 + TypeScript + Tailwind CSS + shadcn/ui
- **Mobile App**: Flutter 3.19 + Material 3
- **State Management**: Riverpod
- **AR**: ARCore (Android) + ARKit (iOS)

### **Backend**
- **Framework**: NestJS 10 + TypeScript
- **Database**: PostgreSQL 15 + TypeORM
- **Cache**: Redis 7
- **Queue**: Bull
- **Real-time**: WebSocket
- **API Docs**: Swagger/OpenAPI

### **Infrastructure**
- **Cloud**: Google Cloud Platform (Cloud Run, Cloud SQL, Cloud Storage)
- **CI/CD**: GitHub Actions
- **Monitoring**: Cloud Logging, Cloud Monitoring
- **Container**: Docker + docker-compose

### **External APIs**
- Google Maps API
- 공공 데이터 포털 API (CCTV, 주차장, 대피소, 병원, 약국)

---

## 🚀 **빠른 시작**

### **전체 시스템 실행 (Docker Compose)**

```bash
# 저장소 클론
git clone https://github.com/townin/townin.git
cd townin

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 값들을 설정하세요

# 전체 시스템 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### **개별 실행**

#### **Backend (NestJS)**
```bash
cd townin-platform/backend

# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run migration:run

# 개발 서버 실행
npm run start:dev
```

**접속**: http://localhost:8000  
**API Docs**: http://localhost:8000/api/docs

#### **Frontend (Next.js)**
```bash
cd pm4py-action-items

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**접속**: http://localhost:3000

#### **Mobile App (Flutter)**
```bash
cd townin-platform/townin_app

# 의존성 설치
flutter pub get

# iOS
flutter run -d ios

# Android
flutter run -d android

# Web
flutter run -d chrome
```

**Web 접속**: http://localhost:5173  
**Firebase**: https://townin-cb270.web.app

---

## 🧪 **테스트**

### **Backend 테스트**
```bash
cd townin-platform/backend

# Unit 테스트
npm run test

# E2E 테스트
npm run test:e2e

# Coverage
npm run test:cov
```

### **Frontend 테스트**
```bash
cd pm4py-action-items

# Type 체크
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### **Flutter 테스트**
```bash
cd townin-platform/townin_app

# 분석
flutter analyze

# 테스트
flutter test

# Coverage
flutter test --coverage
```

---

## 📦 **배포**

### **자동 배포 (CI/CD)**

`main` 브랜치에 Push하면 자동으로 프로덕션에 배포됩니다:
- **Backend**: Google Cloud Run
- **Frontend**: Vercel
- **Mobile**: Firebase Hosting (Web)

### **수동 배포**

#### **Backend → Google Cloud Run**
```bash
cd townin-platform/backend

# Docker 이미지 빌드
docker build -t gcr.io/townin-project/backend:latest .

# Google Cloud에 배포
gcloud run deploy townin-backend \
  --image gcr.io/townin-project/backend:latest \
  --region asia-northeast3 \
  --platform managed
```

#### **Frontend → Vercel**
```bash
cd pm4py-action-items

# Vercel에 배포
vercel --prod
```

#### **Flutter → Firebase**
```bash
cd townin-platform/townin_app

# Web 빌드
flutter build web

# Firebase에 배포
firebase deploy --only hosting
```

---

## 📖 **문서**

- [API 문서](http://localhost:8000/api/docs) - Swagger UI
- [Flutter Web 이미지 가이드](./townin-platform/townin_app/docs/FLUTTER_WEB_IMAGES.md)
- [Maps & API 연동 가이드](./townin-platform/townin_app/docs/MAPS_AND_API_INTEGRATION.md)
- [AR 구현 가이드](./townin-platform/townin_app/docs/AR_IMPLEMENTATION.md)

---

## 🗂️ **프로젝트 구조**

```
townin/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # CI/CD 파이프라인
├── pm4py-action-items/            # Next.js Dashboard
│   ├── app/
│   │   ├── merchant-dashboard/    # 머천트 대시보드
│   │   ├── guard-dashboard/       # 보안요원 대시보드
│   │   └── townin-dashboard/      # 관리자 대시보드
│   ├── components/                # 재사용 컴포넌트
│   └── lib/
│       └── api-client.ts          # API 클라이언트
├── townin-platform/
│   ├── backend/                   # NestJS API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # 인증
│   │   │   │   ├── flyers/        # 전단지
│   │   │   │   ├── merchants/     # 머천트
│   │   │   │   ├── analytics/     # 분석
│   │   │   │   └── ...
│   │   │   └── app.module.ts
│   │   ├── test/                  # E2E 테스트
│   │   └── package.json
│   └── townin_app/                # Flutter App
│       ├── lib/
│       │   ├── presentation/
│       │   │   ├── ar/            # AR 뷰어
│       │   │   ├── maps/          # 지도
│       │   │   └── ...
│       │   ├── core/
│       │   └── data/
│       ├── docs/                  # 문서
│       └── pubspec.yaml
├── docker-compose.yml             # Docker Compose
└── README.md
```

---

## 🤝 **기여 가이드**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📊 **진행률**

| Category | Epic | 완료 | 진행률 |
|----------|------|------|--------|
| **Merchant App** | 5 | **5** | **100%** ✅ |
| **User App** | 11 | **11** | **100%** ✅ |
| **Security Guard** | 3 | **3** | **100%** ✅ |
| **Admin** | 5 | **5** | **100%** ✅ |

**전체 진행률**: **100%** 🎉

---

## 📝 **라이센스**

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **팀**

- **Project Manager**: Seungsig Gang
- **Tech Stack**: Next.js, NestJS, Flutter
- **Region**: 의정부시, 경기도

---

## 📞 **문의**

- **Email**: admin@townin.kr
- **Website**: https://townin.kr
- **GitHub**: https://github.com/townin/townin

---

**Made with ❤️ by Townin Team**
