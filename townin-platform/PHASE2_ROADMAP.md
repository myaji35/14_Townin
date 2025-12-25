# Phase 2: Lock-in & Data Collection Roadmap

## 📋 목표 (Phase 2 Objectives)

**핵심 목표**: 사용자 락인(Lock-in) 및 데이터 수집 강화

**주요 전략**:
1. **IoT 센서 연동** - 가족 케어 기능으로 앱 체류 시간 증대
2. **AI 전단지 스캐너** - 판매자의 진입 장벽 제거 및 데이터 품질 향상
3. **스마트 픽업** - 배달비 0원 모델로 상거래 활성화

---

## 🎯 Phase 2 핵심 기능

### 1. IoT 센서 연동 & 효도 리포터

#### Backend APIs
```
POST   /api/iot/devices              # IoT 디바이스 등록
GET    /api/iot/devices              # 등록된 디바이스 목록
GET    /api/iot/devices/:id          # 디바이스 상세
DELETE /api/iot/devices/:id          # 디바이스 삭제

POST   /api/iot/data                 # 센서 데이터 수신 (InfluxDB)
GET    /api/iot/data                 # 센서 데이터 조회

POST   /api/care/reports             # AI 케어 리포트 생성
GET    /api/care/reports             # 케어 리포트 조회
GET    /api/care/reports/:id         # 특정 리포트 상세

POST   /api/care/alerts              # 이상 징후 알림 발송
GET    /api/care/alerts              # 알림 내역 조회
```

#### 데이터 흐름
```
IoT 센서 → MQTT/HTTP → Backend API
→ InfluxDB (시계열 저장)
→ AI 분석 (Claude/GPT-4)
→ 감성 메시지 생성
→ Push Notification
```

#### 기술 스택
- **센서**: 저가형 동작/문열림 센서 (Zigbee/Wi-Fi)
- **프로토콜**: MQTT or HTTP
- **저장소**: InfluxDB (시계열 데이터)
- **AI**: Anthropic Claude 3.5 (감성 메시지 생성)
- **알림**: Firebase Cloud Messaging (FCM)

#### 구현 순서
1. InfluxDB 스키마 설계 (측정값, 태그, 필드)
2. IoT 데이터 수신 API 구현
3. InfluxDB 쓰기/읽기 로직 구현
4. AI 분석 엔진 (Python FastAPI 마이크로서비스)
5. 케어 리포트 생성 로직
6. 이상 징후 감지 알고리즘
7. Push 알림 시스템 연동

#### 예상 기간
- Backend: 1주
- AI 분석 엔진: 1주
- Flutter 앱: 3-4일
- 테스트 & 검증: 2-3일
**총 3주**

---

### 2. AI 전단지 스캐너 (Multimodal AI)

#### Backend APIs
```
POST   /api/flyers/scan              # 전단지 이미지 업로드 & AI 분석
GET    /api/flyers/scan/:id          # 스캔 결과 조회
POST   /api/flyers/scan/:id/approve  # 스캔 결과 승인 & 전단지 생성
POST   /api/flyers/scan/:id/edit     # 스캔 결과 수정
```

#### 데이터 흐름
```
전단지 사진 (Flutter)
→ S3 업로드
→ Vision AI (OCR)
→ LLM (구조화)
→ JSON 변환
→ 사장님 확인
→ Flyer 생성
```

#### AI 처리 파이프라인
1. **이미지 전처리**
   - 해상도 조정
   - 회전 보정
   - 노이즈 제거

2. **OCR (Google Vision AI or Tesseract)**
   - 텍스트 추출
   - 위치 정보 (bounding box)

3. **이미지 분석 (Claude 3.5 Vision or GPT-4V)**
   - 상품 이미지 인식
   - 레이아웃 분석
   - 색상 추출

4. **LLM 구조화 (Claude 3.5)**
   ```
   Input: OCR 텍스트 + 이미지 메타데이터
   Output: JSON
   {
     "title": "신선한 과일 특가전",
     "products": [
       {
         "name": "사과",
         "price": 9900,
         "unit": "1박스(10개)",
         "discount": "20%",
         "imageUrl": "s3://..."
       }
     ],
     "validFrom": "2025-01-01",
     "validTo": "2025-01-07",
     "tags": ["과일", "할인", "신선식품"]
   }
   ```

5. **상품 이미지 크롭 & 업로드**
   - Bounding box 기반 자동 크롭
   - S3 업로드

#### 기술 스택
- **OCR**: Google Cloud Vision API
- **Vision AI**: Claude 3.5 Vision or GPT-4 Vision
- **LLM**: Anthropic Claude 3.5 Sonnet
- **이미지 처리**: Python (PIL/OpenCV)
- **백엔드**: Python FastAPI (AI 마이크로서비스)

#### 구현 순서
1. S3 이미지 업로드 API
2. Python FastAPI 마이크로서비스 구축
3. OCR 파이프라인 구현
4. Vision AI 통합
5. LLM 구조화 프롬프트 엔지니어링
6. 이미지 크롭 로직
7. NestJS ↔ FastAPI 연동
8. Flutter 카메라 & 업로드 UI

#### 예상 기간
- Python 마이크로서비스: 1주
- AI 파이프라인: 1주
- NestJS 연동: 2-3일
- Flutter 앱: 3-4일
- 프롬프트 최적화: 3-5일
**총 4주**

---

### 3. 스마트 픽업 기능

#### Backend APIs
```
POST   /api/pickups                  # 픽업 주문 생성
GET    /api/pickups                  # 픽업 주문 목록
GET    /api/pickups/:id              # 픽업 주문 상세
PATCH  /api/pickups/:id/status       # 픽업 상태 변경
POST   /api/pickups/:id/complete     # 픽업 완료

GET    /api/pickups/route            # 퇴근 경로 기반 상점 추천
```

#### 핵심 로직
1. **퇴근 경로 추론**
   ```
   직장 Hub → 거주지 Hub
   → H3 Grid 기반 경로 상점 검색
   → 거리순 정렬
   ```

2. **상점 추천 알고리즘**
   ```
   - 경로상 500m 이내 상점
   - 영업 중 (간판 앱 OPEN 상태)
   - 픽업 가능 상품 보유
   - 과거 구매 이력 고려 (선호도)
   ```

3. **상태 관리**
   ```
   주문 생성 → 상점 확인 → 픽업 준비 완료 → 픽업 완료
   ```

#### 기술 스택
- **경로 계산**: H3 Grid Distance
- **실시간 알림**: Socket.io or FCM
- **결제**: 이니시스/토스페이먼츠 연동 (Phase 2.5)

#### 구현 순서
1. Pickup 엔티티 설계
2. 경로 기반 상점 추천 API
3. 픽업 주문 생성 & 관리 API
4. 상점 알림 시스템 (Socket.io)
5. Flutter 주문 UI
6. 상점 앱 주문 수신 UI

#### 예상 기간
- Backend: 1주
- Flutter (사용자): 3-4일
- Flutter (상점): 2-3일
- 테스트: 2-3일
**총 2.5주**

---

## 🗓️ Phase 2 전체 일정

### Week 1-3: IoT 센서 & 효도 리포터
- Week 1: InfluxDB & IoT API
- Week 2: AI 분석 엔진 (Python FastAPI)
- Week 3: Flutter 앱 & 테스트

### Week 4-7: AI 전단지 스캐너
- Week 4: Python 마이크로서비스 & OCR
- Week 5: Vision AI & LLM 파이프라인
- Week 6: NestJS 연동 & 프롬프트 최적화
- Week 7: Flutter 앱 & 테스트

### Week 8-10: 스마트 픽업
- Week 8: Backend API & 경로 알고리즘
- Week 9: Flutter 앱 (사용자 & 상점)
- Week 10: 테스트 & 버그 수정

### Week 11-12: 통합 테스트 & 폴리싱
- Week 11: E2E 테스트, 성능 최적화
- Week 12: 사용자 테스트, 피드백 반영

**총 예상 기간: 12주 (3개월)**

---

## 📊 Phase 2 KPI 목표

| KPI | 목표 | 측정 방법 |
|-----|------|----------|
| DAU | 10,000명 | 일일 활성 사용자 수 |
| IoT 센서 등록 수 | 5,000대 | 등록된 센서 디바이스 |
| 케어 리포트 열람율 | 80% | 발송된 리포트 중 열람 비율 |
| AI 스캔 성공률 | 85% | 스캔 → 전단지 생성 비율 |
| 스마트 픽업 사용자 | 2,000명 | 픽업 주문 사용자 수 |
| 월간 픽업 주문 | 10,000건 | 월간 픽업 완료 건수 |

---

## 🛠️ 기술적 준비사항

### 1. InfluxDB 설정
```bash
# InfluxDB 2.x 설치
docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v influxdb-data:/var/lib/influxdb2 \
  influxdb:2.7

# 초기 설정
influx setup \
  --username admin \
  --password townin123 \
  --org townin \
  --bucket iot_sensors \
  --force
```

### 2. Python FastAPI 마이크로서비스
```bash
# 프로젝트 생성
cd townin-platform
mkdir ai-service && cd ai-service
python -m venv venv
source venv/bin/activate

# 패키지 설치
pip install fastapi uvicorn anthropic google-cloud-vision pillow opencv-python
```

### 3. MQTT Broker (선택)
```bash
# Mosquitto MQTT Broker
docker run -d \
  --name mosquitto \
  -p 1883:1883 \
  -p 9001:9001 \
  eclipse-mosquitto
```

### 4. 환경 변수 추가
`.env` 파일에 추가:
```
# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-influx-token
INFLUXDB_ORG=townin
INFLUXDB_BUCKET=iot_sensors

# AI Services
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_CLOUD_VISION_KEY=your-google-vision-key

# MQTT (optional)
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=townin
MQTT_PASSWORD=townin123

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

---

## 🚀 시작 방법

### 즉시 시작 가능 (Docker 준비 완료 시)
```bash
cd townin-platform/backend

# 1. Docker 서비스 확인
docker-compose ps

# 2. 마이그레이션 실행 (아직 안 했다면)
npm run migration:run

# 3. 시드 데이터 삽입 (아직 안 했다면)
npm run seed

# 4. 백엔드 서버 실행
npm run start:dev

# 5. 검증 스크립트 실행
bash scripts/verify-backend.sh
```

### Phase 2 시작 순서
1. ✅ Phase 1 완료 확인
2. InfluxDB 설정
3. IoT API 구현 시작
4. Python AI 마이크로서비스 구축
5. Flutter 앱 IoT 화면 추가

---

## 📚 참고 자료

### InfluxDB
- [InfluxDB 2.x Documentation](https://docs.influxdata.com/influxdb/v2/)
- [InfluxDB Node.js Client](https://github.com/influxdata/influxdb-client-js)

### AI/ML
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Google Cloud Vision](https://cloud.google.com/vision/docs)
- [LangChain](https://python.langchain.com/)

### IoT
- [MQTT Protocol](https://mqtt.org/)
- [Zigbee Smart Sensors](https://www.zigbee.org/)

---

## ✅ 체크리스트 (Phase 2 시작 전)

- [ ] Phase 1 백엔드 100% 완료 확인
- [ ] Phase 1 Flutter MVP 완료 확인
- [ ] Docker 환경 정상 작동 확인
- [ ] InfluxDB 설치 및 설정
- [ ] Anthropic API Key 발급
- [ ] Google Cloud Vision API 설정
- [ ] Python 개발 환경 구축
- [ ] Phase 2 기술 검증 (POC)

---

**다음 단계**: Docker 재시작 → 백엔드 검증 → Phase 2 시작!
