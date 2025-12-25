# Townin Platform - Epic Roadmap

**Document Version**: 1.0
**Last Updated**: 2025-11-30
**Project**: Townin Hyper-local Life OS & Insurance GraphRAG Platform

---

## Overview

본 문서는 Townin 플랫폼의 전체 기능을 **Epic 단위로 분해**하고, **Phase별 개발 우선순위**를 정의합니다. PRD에 명시된 4개 Phase에 따라 총 **40+ Epic**을 계획했습니다.

---

## Epic 분류 체계

### Epic ID 규칙
- **ADM-XXX**: Admin Dashboard (관리자 대시보드)
- **USR-XXX**: User App (일반 사용자 앱)
- **MRC-XXX**: Merchant/Partner App (상인/파트너 앱)
- **SGD-XXX**: Security Guard App (보안관 앱)
- **MUN-XXX**: Municipality App (지자체 앱)
- **FP-XXX**: FP/Expert App (FP/전문가 앱)
- **CORE-XXX**: Core Infrastructure (핵심 인프라)
- **GRA-XXX**: GraphRAG Engine (GraphRAG 엔진)

---

## Phase 1: 트래픽 확보 (Traffic Anchor)

**목표**: 공공데이터 기반 앵커 서비스로 초기 사용자 확보
**기간**: 3-6개월
**핵심 전략**: 광고 없는 클린한 생존 지도 + 무료 디지털 간판

### 완료된 Epic (5개) ✅

| Epic ID | Title | Stories | Priority | Status |
|---------|-------|---------|----------|--------|
| ADM-001 | Admin Dashboard Foundation | 3 | P0 | ✅ Complete |
| ADM-002 | User Management System | 8 | P0 | ✅ Complete |
| ADM-003 | Flyer Statistics Dashboard | 5 | P0 | ✅ Complete |
| ADM-004 | Region Management System | 7 | P1 | ✅ Complete |
| ADM-005 | Platform Activity Monitoring | 6 | P1 | ✅ Complete |

### Core Infrastructure (6 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| CORE-001 | Authentication & Authorization System | 사용자/관리자 인증, JWT, RBAC, 소셜 로그인 | P0 | 5 days |
| CORE-002 | Geospatial Data Infrastructure | PostGIS 설정, Grid Cell 시스템, 지역 계층 구조 | P0 | 7 days |
| CORE-003 | Public Data Integration | 서울 열린데이터광장 API 연동 (CCTV, 주차, 재난) | P0 | 10 days |
| CORE-004 | Real-time Notification System | FCM/APNS 푸시, Socket.io 실시간 알림 | P1 | 5 days |
| CORE-005 | File Upload & CDN | S3/CloudFront 연동, 이미지 업로드/리사이징 | P1 | 3 days |
| CORE-006 | Logging & Monitoring | Winston, Sentry, Application Insights | P2 | 3 days |

### User App - Phase 1 (6 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| USR-001 | User Onboarding & Registration | 회원가입, 이메일/소셜 로그인, 프로필 설정 | P0 | 5 days |
| USR-002 | 3-Hub Location Setup | 거주지/직장/본가 3곳 지역 설정 UI | P0 | 3 days |
| USR-003 | Safety Map (CCTV & Lighting) | CCTV, 가로등, 비상벨 위치 시각화 | P0 | 7 days |
| USR-004 | Parking Map | 주정차 단속 카메라, 공영 주차장 실시간 잔여 표시 | P0 | 5 days |
| USR-005 | Risk Map (Disaster Safety) | 침수 흔적도, 제설함, 급경사지 등 재난 정보 | P1 | 5 days |
| USR-006 | Life Map (Public Amenities) | 공공 와이파이, 무더위 쉼터, 전기차 충전소 | P1 | 4 days |

### User App - Digital Flyer (4 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| USR-007 | Digital Flyer Viewer | 디지털 전단지 열람, 카테고리별 필터링 | P0 | 7 days |
| USR-008 | Flyer Interaction & Points | 전단지 클릭/저장 시 포인트 적립 시스템 | P1 | 5 days |
| USR-009 | Flyer Search & Discovery | 지역/카테고리/키워드 검색, 추천 알고리즘 | P1 | 5 days |
| USR-010 | Point System & Rewards | 포인트 적립/사용, 리워드 관리 | P2 | 5 days |

### Merchant App - Phase 1 (5 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| MRC-001 | Merchant Onboarding | 상인 회원가입, 사업자 등록, 상점 정보 입력 | P0 | 5 days |
| MRC-002 | Digital Signboard (Open/Close) | 무료 간판 앱 - 영업 중/휴무/외출 표시 | P0 | 3 days |
| MRC-003 | Basic Flyer Creation | 간단한 전단지 생성 (템플릿 기반) | P0 | 7 days |
| MRC-004 | Flyer Management Dashboard | 등록한 전단지 목록, 수정/삭제, 상태 관리 | P1 | 5 days |
| MRC-005 | Basic Analytics | 조회수, 클릭수, 저장수 등 기본 통계 | P1 | 3 days |

### Security Guard App - Phase 1 (3 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| SGD-001 | Security Guard Dashboard | 담당 지역 현황, 활동 요약, 수익 현황 | P1 | 5 days |
| SGD-002 | Flyer Approval Workflow | 담당 지역 전단지 승인/거부, 부적절 콘텐츠 필터링 | P1 | 7 days |
| SGD-003 | Local Activity Monitoring | 지역 활동 피드, 신고 관리, 사용자 문의 | P2 | 5 days |

**Phase 1 Total**: 29 Epics, ~150-180 days (6개월)

---

## Phase 2: 락인 & 데이터 수집 (Lock-in & Data Collection)

**목표**: IoT 연동으로 사용자 락인, AI 기능으로 상인 편의성 향상
**기간**: 6-12개월
**핵심 전략**: 가족 케어로 앱 체류 시간 증대, AI 스캐너로 상인 진입 장벽 제거

### User App - Phase 2 (7 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| USR-011 | IoT Sensor Integration | 저가형 동작/문열림 센서 연동 및 데이터 수집 | P0 | 10 days |
| USR-012 | Family Care Reporter (효도 리포터) | AI가 센서 데이터를 해석하여 감성 메시지 발송 | P0 | 10 days |
| USR-013 | Anomaly Detection & Alerts | 이상 징후 감지 (장시간 미활동, 심야 배회) 및 알림 | P0 | 7 days |
| USR-014 | Safe Route Navigation (안심 귀가) | 가로등 + 영업 중 상점 데이터로 밝은 길 안내 | P1 | 7 days |
| USR-015 | Smart Pickup (스마트 픽업) | 퇴근 경로 기반 상점 추천 및 사전 결제/픽업 | P1 | 10 days |
| USR-016 | Group Buy Marketplace (N빵 공구) | 대용량 상품 아파트 이웃과 공동 구매 매칭 | P2 | 10 days |
| USR-017 | Townin Gamification (대동여지도) | 회색 지대 방문 인증, 보안관 배지, 포인트 보상 | P2 | 7 days |

### Merchant App - Phase 2 (5 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| MRC-006 | AI Flyer Scanner (Multimodal AI) | 종이 전단지 사진 찍어 자동 OCR/Vision AI로 온라인 변환 | P0 | 15 days |
| MRC-007 | Product Catalog Management | 상품 카탈로그 관리, 재고 연동, 가격 변경 | P1 | 7 days |
| MRC-008 | Smart Pickup Integration | 스마트 픽업 주문 수신, 준비 완료 알림 | P1 | 5 days |
| MRC-009 | Cross-Selling Coupon System (릴레이 쿠폰) | GraphRAG 기반 순차 방문 패턴 분석 및 쿠폰 제안 | P1 | 10 days |
| MRC-010 | Advanced Analytics & Insights | 시간대별 방문자, 전환율, ROI 분석 | P2 | 7 days |

### Security Guard App - Phase 2 (2 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| SGD-004 | Community Engagement Tools | 지역 이벤트 생성, 공지사항, 설문조사 | P2 | 5 days |
| SGD-005 | Revenue Sharing Dashboard | 전단지 승인별 수익 정산, 월별 리포트 | P2 | 3 days |

### Municipality App - Phase 2 (4 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| MUN-001 | Municipality Dashboard | 지자체 전체 통계, 지역별 활동 현황 | P1 | 7 days |
| MUN-002 | Welfare Blind Spot Detection | 데이터 분석으로 복지 사각지대 가구 발굴 | P1 | 10 days |
| MUN-003 | Policy Promotion System | 지자체 정책 홍보 캠페인 생성 및 타겟팅 | P2 | 7 days |
| MUN-004 | Livability Index Management | '살기 좋은 동네 지수' 산출 및 공개 | P2 | 5 days |

**Phase 2 Total**: 18 Epics, ~110-130 days (5개월)

---

## Phase 3: 수익화 (Monetization with GraphRAG)

**목표**: Insurance GraphRAG 엔진 가동, FP 코파일럿으로 본격 매출 발생
**기간**: 12-24개월
**핵심 전략**: 이종 데이터 추론으로 초개인화 보험 추천, FP에게 리드 판매

### GraphRAG Engine (8 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| GRA-001 | Data Ingestion & Chunking | 문서 수집, 의미론적 청킹 (TextUnit 생성) | P0 | 10 days |
| GRA-002 | Entity & Relationship Extraction | LLM 기반 엔티티/관계 추출, 그래프 노드/엣지 생성 | P0 | 15 days |
| GRA-003 | Hierarchical Clustering (Leiden) | 계층적 클러스터링으로 커뮤니티 형성 | P0 | 10 days |
| GRA-004 | Community Summary Generation | 상향식 커뮤니티 요약 생성 (글로벌 검색용) | P0 | 7 days |
| GRA-005 | Global Search Engine | 모호한 질문에 대한 커뮤니티 요약 기반 답변 | P0 | 10 days |
| GRA-006 | Local Search Engine | 구체적 질문에 대한 벡터 유사도 + 그래프 탐색 | P0 | 10 days |
| GRA-007 | Multimodal Processing | 이미지 분석 (GPT-4 Vision), OCR 통합 | P1 | 10 days |
| GRA-008 | Incremental Update & Caching | 증분 업데이트, 캐싱 전략으로 비용 절감 | P1 | 7 days |

### Insurance Module (6 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| INS-001 | Smart FNOL (First Notice of Loss) | 사고 접수 자동화 (사진/음성/텍스트 → 구조화 데이터) | P0 | 10 days |
| INS-002 | Claims Triage System | AI 기반 클레임 분류 (단순/복잡) 및 즉시 지급 | P0 | 10 days |
| INS-003 | Fraud Detection | GraphRAG로 클레임 교차 검증 및 사기 탐지 | P0 | 10 days |
| INS-004 | Policy Q&A Chatbot | 개인 보험 약관 기반 챗봇 (환각 방지) | P0 | 15 days |
| INS-005 | Risk Inference Engine | 위치/행동/IoT 데이터로 리스크 프로파일 생성 | P1 | 15 days |
| INS-006 | Personalized Insurance Recommendation | GraphRAG 기반 초개인화 보험 상품 추천 | P1 | 15 days |

### FP/Expert App (7 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| FP-001 | FP Onboarding & Verification | FP 회원가입, 자격증 인증, 프로필 설정 | P0 | 7 days |
| FP-002 | AI Co-pilot Dashboard | 리드 매칭, 고객 리스크 프로파일 조회 | P0 | 10 days |
| FP-003 | Lead Matching System | Life Event 기반 익명 리드 제공 및 매칭 | P0 | 10 days |
| FP-004 | Policy Search & Comparison | 약관/지침 자연어 검색, 상품 비교 | P1 | 10 days |
| FP-005 | Recommendation Validation | FP 추천 상품과 고객 데이터 불일치 시 경고 | P1 | 7 days |
| FP-006 | AI Ad Generator (Compliance) | 보험협회 규정 준수 광고 문구 자동 생성 | P1 | 10 days |
| FP-007 | Campaign Management | 정보성/업무성 광고 캠페인 생성 및 집행 | P2 | 7 days |

### User App - Phase 3 (3 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| USR-018 | Insurance Recommendation Feed | 맞춤형 보험 추천 피드, 리스크 프로파일 표시 | P0 | 7 days |
| USR-019 | Claims Filing Interface | 앱 내 보험 청구 접수 (FNOL) UI | P0 | 10 days |
| USR-020 | Policy Management | 가입한 보험 목록, 보장 내용 확인, Q&A 챗봇 | P1 | 7 days |

### Merchant App - Phase 3 (2 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| MRC-011 | Targeted Advertising System | GraphRAG 기반 타겟팅 광고 (100원+ 고관여 트래픽) | P1 | 10 days |
| MRC-012 | Resource Donation Matching | 재고 식자재를 복지기관에 기부 연결 | P2 | 5 days |

**Phase 3 Total**: 26 Epics, ~230-270 days (10-12개월)

---

## Phase 4: 글로벌 확장 (Global Expansion)

**목표**: 베트남(전단지 중심), 일본(케어 중심) 시장 진출
**기간**: 24개월+
**핵심 전략**: 국가별 특화 모델 적용, 글로벌 지도 API 연동

### Global Infrastructure (5 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| GLB-001 | Multi-language Support (i18n) | 다국어 지원 (한국어, 베트남어, 일본어, 영어) | P0 | 10 days |
| GLB-002 | Multi-currency & Payment | 다중 통화 결제, 환율 계산, 현지 결제 게이트웨이 | P0 | 15 days |
| GLB-003 | Global Map API Integration | Google Maps, Mapbox, 네이버/카카오맵 통합 | P0 | 10 days |
| GLB-004 | Region-specific Public Data | 베트남/일본 공공데이터 API 연동 | P1 | 20 days |
| GLB-005 | Compliance & Regulations | 국가별 개인정보보호법, 보험 규정 준수 | P1 | 15 days |

### Vietnam Market (3 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| VNM-001 | Vietnam Flyer Ecosystem | 베트남 시장 특화 디지털 전단지 기능 | P1 | 10 days |
| VNM-002 | Vietnam Payment Integration | Momo, ZaloPay 등 현지 결제 연동 | P1 | 7 days |
| VNM-003 | Vietnam Partner Network | 현지 소상공인 온보딩 및 지원 | P2 | 10 days |

### Japan Market (3 Epics)

| Epic ID | Title | Description | Priority | Estimated |
|---------|-------|-------------|----------|-----------|
| JPN-001 | Japan Care-focused Features | 일본 시장 특화 고령자 케어 기능 | P1 | 10 days |
| JPN-002 | Japan Disaster Alert System | 지진/쓰나미 실시간 알림, 대피소 안내 | P1 | 7 days |
| JPN-003 | Japan Payment Integration | PayPay, LINE Pay 등 현지 결제 연동 | P1 | 7 days |

**Phase 4 Total**: 11 Epics, ~110-130 days (5개월)

---

## 전체 Epic 요약

| Phase | Epic 수 | 예상 기간 | 핵심 목표 |
|-------|--------|-----------|----------|
| Phase 0 (Admin) | 5 | 11 days | ✅ 완료 (Admin Dashboard) |
| Phase 1 | 29 | 150-180 days | 트래픽 확보 |
| Phase 2 | 18 | 110-130 days | 락인 & 데이터 수집 |
| Phase 3 | 26 | 230-270 days | 수익화 (GraphRAG) |
| Phase 4 | 11 | 110-130 days | 글로벌 확장 |
| **Total** | **89 Epics** | **~24-30개월** | Full Platform |

---

## Epic 우선순위 정의

### P0 (Critical) - 즉시 착수
- 플랫폼 기본 기능, MVP 필수 요소
- Phase 1 Core Infrastructure, User/Merchant 기본 기능

### P1 (High) - Phase 내 필수
- Phase 목표 달성을 위한 핵심 기능
- Admin 관리 도구, Analytics

### P2 (Medium) - Phase 내 권장
- UX 개선, 편의 기능, Gamification
- 추후 추가 가능한 기능

### P3 (Low) - 선택적 구현
- 실험적 기능, 차별화 요소
- 사용자 피드백 후 결정

---

## Epic Dependencies (주요 의존성)

```
CORE-001 (Auth) → 모든 User/Merchant/FP Epic
    ↓
CORE-002 (Geospatial) → USR-001~USR-006 (Maps)
    ↓
CORE-003 (Public Data) → USR-003~USR-006 (Safety/Risk/Life Maps)
    ↓
USR-007 (Flyer Viewer) → MRC-003 (Flyer Creation)
    ↓
MRC-006 (AI Scanner) → GRA-001~GRA-008 (GraphRAG)
    ↓
GRA-001~GRA-008 → INS-001~INS-006 (Insurance)
    ↓
INS-001~INS-006 → FP-001~FP-007 (FP App)
```

---

## Next Steps

### Immediate (현재)
1. ✅ Admin Dashboard Epic 완료
2. 🔄 Phase 1 Epic 파일 작성 시작
3. 🔄 CORE-001~CORE-003 구현 시작

### Short-term (1-2개월)
1. Phase 1 Core Infrastructure 완료
2. USR-001~USR-007 구현
3. MRC-001~MRC-003 구현

### Medium-term (3-6개월)
1. Phase 1 전체 Epic 완료
2. Phase 2 IoT Epic 시작
3. AI Scanner MVP 구현

### Long-term (12개월+)
1. GraphRAG Engine 구현
2. Insurance Module 런칭
3. FP App 출시

---

**Document Owner**: Development Team
**Last Reviewed**: 2025-11-30
**Status**: Living Document (지속 업데이트)
