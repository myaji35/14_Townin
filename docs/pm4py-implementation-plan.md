# PM4Py 도입 계획서

**작성일**: 2024-12-21
**버전**: 1.0
**상태**: 라이선스 검토 중
**관련 PRD 섹션**: 2.4 패밀리 케어, 6.2 1인 기업 운영 전략

---

## 1. 개요

### 1.1 목적

pm4py (Process Mining for Python)를 Townin 프로젝트에 도입하여 다음 기능을 구현합니다:

1. **골든 루틴 모델링**: 어르신의 일상 생활 패턴 분석 및 건강 이상 조기 감지
2. **전단지 전환율 분석**: 사용자 여정 최적화 및 이탈 지점 발견
3. **마스터 성공 패턴 분석**: 지역 보안관의 영업 활동 패턴 비교 및 교육

### 1.2 차별화 가치

- **기존 케어 앱**: 단순 센서 알림 ("10시간 동안 움직임 없음")
- **Townin + pm4py**: 고차원 인사이트 ("생활 패턴이 급격히 불규칙해졌습니다. 건강 체크 필요")

---

## 2. 라이선스 분석

### 2.1 라이선스 구조

pm4py는 이중 라이선스(Dual Licensing) 모델을 채택합니다.

| 항목 | AGPL-3.0 (오픈소스) | Commercial License |
|------|-------------------|-------------------|
| **비용** | 무료 | $5,000 - $50,000/년 (예상) |
| **소스코드 공개** | ✅ 필수 | ❌ 불필요 |
| **상업적 사용** | ⚠️ 제한적 | ✅ 무제한 |
| **기술 지원** | 커뮤니티 | 공식 지원 |
| **릴리즈 주기** | 분기별 | 월별 |

### 2.2 AGPL-3.0 리스크

**Network Copyleft의 영향:**
```
⚠️ Townin이 pm4py (AGPL-3.0)를 사용할 경우:

1. Townin 전체 소스코드를 AGPL-3.0로 공개해야 함
2. SaaS로 제공해도 소스코드 공개 의무 (GPL과의 차이점)
3. GraphRAG 엔진 등 핵심 기술이 경쟁사에게 노출
4. VC 투자 유치 어려움 (오픈소스 의무가 있는 스타트업 기피)
5. 파트너 데이터 처리 로직 공개 → 보안 위험
```

**법적 리스크:**
- 저작권 침해 소송
- 소스코드 공개 강제 명령
- 손해배상 청구
- 투자 계약 위반 (Due Diligence에서 발견 시)

### 2.3 상업용 라이선스 정보

**제공 기관**: Process Intelligence Solutions GmbH (P.I.S.)

**연락처**:
- Email: info@processintelligence.solutions
- Website: https://processintelligence.solutions/pm4py#licensing

**혜택**:
- 소스코드 비공개 가능
- 매출/사용자 수 제한 없음
- 월간 릴리즈 (오픈소스는 분기별)
- 최신 기능 우선 접근
- 공식 기술 지원

**가격**: 공개되지 않음 (견적 필요)

---

## 3. 적용 시나리오 분석

### 3.1 골든 루틴 모델링 ⭐⭐⭐⭐⭐

**타당성 점수**: 95/100

#### PRD 연계
- **2.4 패밀리 케어 - 효도 리포터**: "AI가 데이터를 해석하여 감성 메시지 발송"
- **이상 징후 알림**: "장시간 미활동, 심야 배회 등 감지 시 보호자에게 즉시 푸시 알림"

#### 기술 구현

**Phase 1-2 (자체 구현)**:
```typescript
// AGPL 회피: pm4py 없이 구현
class GoldenRoutineAnalyzer {
  checkConformance(eventLog: EventLog): ConformanceResult {
    // 간단한 시퀀스 매칭
    const similarity = calculateSimilarity(userSequence, baselinePattern);
    const deviations = detectDeviations(userSequence);

    return {
      isNormal: similarity >= 0.7,
      recommendation: generateRecommendation(deviations)
    };
  }
}
```

**Phase 3+ (pm4py 상업용)**:
```python
# 상업용 라이선스 구매 후
import pm4py
from pm4py.algo.conformance.tokenreplay import algorithm as token_replay

# Petri Net 기반 정확한 Conformance Checking
net, im, fm = pm4py.discover_petri_net_inductive(normal_log)
replayed_traces = token_replay.apply(event_log, net, im, fm)

# 진짜 이상만 알림 (False Positive 최소화)
```

#### 차별화 효과

| 측면 | 단순 임계값 알림 | pm4py 기반 |
|------|----------------|-----------|
| **감지 시점** | 10시간 후 (늦음) | 패턴 변화 즉시 |
| **정확도** | 낮음 (False Positive 많음) | 높음 (Petri Net 기반) |
| **인사이트** | "움직임 없음" | "화장실 반복 방문 - 비뇨기 질환 의심" |
| **예측 가능** | 불가능 | 치매 초기 증상 조기 발견 |

### 3.2 전단지 전환율 분석 ⭐⭐⭐⭐

**타당성 점수**: 80/100

#### PRD 연계
- **2.3 디지털 전단지**: AI 전단지 뷰어, N빵 공구 마켓
- **9.3 커뮤니티 참여 지표**: 전단지 전환율 > 2% 목표

#### 시나리오

**사용자 여정**:
```
전단지 클릭 → 상품 상세 → 매장 위치 확인 → 재고 확인 → 픽업 예약 → 결제
```

**pm4py 분석**:
```python
# Process Discovery: 실제 경로 시각화
process_tree = pm4py.discover_process_tree_inductive(event_log)

# Variant Analysis: 성공 vs 실패 경로
variants = variants_filter.get_variants(event_log)

# Insight: "재고 확인" 단계에서 68% 이탈
```

**Action**:
- 파트너에게: "재고 실시간 업데이트 시 매출 30% 증가" 데이터 제시
- 시스템: "재고 부족 시 인근 다른 매장 추천" 프로세스 추가

#### 대체 도구 비교

| 도구 | 선형 퍼널 | 비선형 경로 발견 | 프로세스 시각화 | 추천 |
|------|----------|---------------|---------------|------|
| **pm4py** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Phase 3+ |
| **GA4** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Phase 1-2 |
| **Mixpanel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Phase 1-2 |

**결론**: Phase 1-2는 GA4/Mixpanel, Phase 3부터 pm4py로 고도화

### 3.3 마스터 성공 패턴 분석 ⭐⭐⭐⭐⭐

**타당성 점수**: 90/100

#### PRD 연계
- **6.2 1인 기업 운영 전략 - 지역 보안관 제도**: 영업을 직접 하지 않고 위임
- **콜드 스타트**: 1개 아파트 단지 집중 공략 → 성공 사례 복제

#### Comparative Process Mining

**분석**:
```python
# 상위 10% vs 하위 10% 마스터 비교
top_log = filter_by_performance(event_log, percentile=10)
bottom_log = filter_by_performance(event_log, percentile=90)

# 프로세스 모델 비교
top_net = pm4py.discover_petri_net_inductive(top_log)
bottom_net = pm4py.discover_petri_net_inductive(bottom_log)

# 시간 성능 분석
top_time = calculate_avg_time(top_dfg, 'visit_store', 'register_flyer')  # 4시간
bottom_time = calculate_avg_time(bottom_dfg, 'visit_store', 'register_flyer')  # 3일
```

**Insight**:
- S급 마스터: 방문 → **당일** 전단지 등록 → 3일 내 첫 매출
- 하위 마스터: 방문 → **3일 후** 등록 → 1주일 후 매출

**시스템화**:
```python
# 자동 알림 시스템
if hours_since_visit > 24 and not flyer_registered:
    send_notification(master_id,
        "⏰ 방문 후 24시간이 지났습니다. 전단지를 등록하세요!")
```

**효과**:
- 성공 패턴 매뉴얼화 → 신규 보안관 교육
- 24시간 내 등록 시 보너스 인센티브
- 온보딩 성공률 향상 → Phase 4 글로벌 확장 가속

---

## 4. 비용 분석

### 4.1 pm4py 상업용 라이선스 예상 비용

**추정 근거**: 유사 엔터프라이즈 Python 라이브러리 평균 가격

| Tier | 연간 비용 | 조건 |
|------|---------|------|
| **Startup** | $5,000 - $15,000 | 매출 $1M 이하, 개발자 5명 이하 |
| **Growth** | $15,000 - $50,000 | 매출 $1M - $10M |
| **Enterprise** | $50,000+ | 맞춤형 계약, SLA 포함 |

**한화 환산** (환율 1,300원 기준):
- Startup: ₩6,500,000 - ₩19,500,000/년
- Growth: ₩19,500,000 - ₩65,000,000/년

### 4.2 자체 구현 비용

**개발 인력**:
```
프로세스 마이닝 전문가:
- 월급: ₩7,000,000
- 개발 기간: 4개월
- 총 인건비: ₩28,000,000

또는 외주:
- ₩30,000,000 - ₩50,000,000 (1회성)
```

**유지보수**:
- 연간 ₩10,000,000 (버그 수정, 알고리즘 개선)

### 4.3 Break-even 분석

| 항목 | pm4py 라이선스 | 자체 구현 |
|------|--------------|----------|
| **초기 비용** | ₩0 | ₩30,000,000 |
| **연간 비용** | ₩10,000,000 | ₩10,000,000 |
| **1년차 누적** | ₩10,000,000 | ₩40,000,000 |
| **2년차 누적** | ₩20,000,000 | ₩50,000,000 |
| **3년차 누적** | ₩30,000,000 | ₩60,000,000 |

**Break-even**: 3년차

**결론**:
- 3년 이상 사용 계획 → 자체 구현 고려
- 빠른 출시 중요 → pm4py 라이선스 구매

---

## 5. Phase별 도입 전략

### Phase 1 (기획 단계, 현재 - 2025 Q1)

**목표**: 라이선스 결정 및 PoC

**Action Items**:
- [x] Process Intelligence Solutions 견적 요청
- [x] 평가판 라이선스 신청
- [x] 대안 라이브러리 조사 (ProM, bupaR)
- [x] 골든 루틴 PoC 개발 (자체 구현)
- [ ] 견적 기반 비용 분석
- [ ] 법무 자문 (AGPL 리스크 검토)

**구현 페이지**: `/pm4py-action-items`
- Action 1: 견적 요청 이메일 템플릿
- Action 2: Golden Routine PoC
- Action 3: 라이선스 비교
- Action 4: 체크리스트

### Phase 2 (개발 착수, 2025 Q2 - 2025 Q4)

**목표**: 골든 루틴 프로덕션 배포

**결정 시점**:
```
IF (pm4py 견적 < ₩20,000,000/년) THEN
  상업용 라이선스 구매 ✅
ELSE
  자체 구현 완성 (PoC 기반 확장)
END IF
```

**기술 스택**:
```yaml
# Phase 2 아키텍처
services:
  python-ai-engine:
    - FastAPI
    - LangChain (GraphRAG)
    - pm4py (상업용) 또는 자체 구현
    - MLflow (실험 추적)

  influxdb:
    - IoT 시계열 데이터

  postgresql:
    - Event Log 저장
    - pm4py 메타데이터
```

**배포**:
- 골든 루틴 모델링 베타 테스트
- 파일럿 그룹: 10-50가구
- 성공 지표: False Positive < 20%, 조기 감지율 > 80%

### Phase 3 (수익화, 2026 Q1 - 2026 Q4)

**목표**: 마스터 성공 패턴 분석 시스템

**구현**:
- 지역 보안관 활동 로그 수집
- Comparative Process Mining
- 성공 패턴 매뉴얼 자동 생성
- 실시간 알림 시스템

**선택적 구현**:
- 전단지 전환율 심화 분석 (GA4로 충분하면 스킵)

### Phase 4 (글로벌 확장, 2027+)

**목표**: 국가별 생활 패턴 차이 분석

**확장**:
- 일본: 독거노인 케어 프로세스 특화
- 베트남: 전단지 중심 프로세스

---

## 6. 기술 상세

### 6.1 데이터 파이프라인

```python
# IoT → pm4py 파이프라인
class GoldenRoutineAnalyzer:
    async def daily_analysis(self, user_id, date):
        # 1. InfluxDB에서 센서 데이터 추출
        sensor_data = await self.influxdb_client.query(
            f"SELECT * FROM sensors WHERE user_id='{user_id}' AND date='{date}'"
        )

        # 2. Activity Recognition (룰 기반)
        activities = self.recognize_activities(sensor_data)

        # 3. Event Log 저장 (PostgreSQL)
        event_log = self.create_event_log(activities)
        await self.event_log_store.save(event_log)

        # 4. Conformance Checking
        golden_routine = await self.load_golden_routine(user_id)

        if USE_PM4PY:
            # pm4py 상업용
            deviations = pm4py.conformance_checking(event_log, golden_routine)
        else:
            # 자체 구현
            deviations = self.check_conformance(event_log, golden_routine)

        # 5. 이탈 감지 시 알림
        if deviations:
            await self.send_family_alert(user_id, deviations)

        # 6. MLflow 로깅
        mlflow.log_metric(f"user_{user_id}_conformance", deviations['fitness'])
```

### 6.2 Activity Recognition 룰 엔진

```typescript
// lib/goldenRoutine.ts
export class ActivityRecognizer {
  recognizeActivities(sensorData: IoTSensorData[]): Activity[] {
    const activities: Activity[] = [];

    for (const current of sensorData) {
      // 룰 1: 아침 기상
      if (current.location === 'bedroom' && isTimeInRange(current, 6, 9)) {
        activities.push({ activity: 'wake_up', ...current });
      }

      // 룰 2: 화장실 사용 (5분 이상)
      if (current.location === 'bathroom' && current.duration > 5) {
        activities.push({ activity: 'bathroom', ...current });
      }

      // 룰 3: 주방 활동
      if (current.location === 'kitchen') {
        activities.push({ activity: 'kitchen', ...current });
      }

      // 룰 4: 거실 활동 (30분 이상 = TV 시청)
      if (current.location === 'living_room' && current.duration > 30) {
        activities.push({ activity: 'living_room', ...current });
      }

      // 룰 5: 취침
      if (current.location === 'bedroom' && isTimeInRange(current, 21, 23)) {
        activities.push({ activity: 'go_to_bed', ...current });
      }
    }

    return activities;
  }
}
```

### 6.3 이상 패턴 감지

```typescript
class GoldenRoutineAnalyzer {
  private detectDeviations(userSequence: string[]): string[] {
    const deviations: string[] = [];

    // 1. 반복 활동 감지
    const counts = new Map<string, number>();
    for (const activity of userSequence) {
      counts.set(activity, (counts.get(activity) || 0) + 1);
    }

    for (const [activity, count] of counts) {
      if (count > 2 && activity === 'bathroom') {
        deviations.push(
          `화장실 방문 ${count}회 (평소보다 빈번함 - 비뇨기 질환 의심)`
        );
      }
    }

    // 2. 누락 활동 감지
    for (const expected of this.baselinePattern) {
      if (!userSequence.includes(expected)) {
        deviations.push(`평소 일과인 "${expected}" 활동이 누락됨`);
      }
    }

    // 3. 순서 변경 감지
    if (!this.sequenceMatches(userSequence, this.baselinePattern)) {
      deviations.push(`활동 순서가 평소와 다름`);
    }

    return deviations;
  }
}
```

---

## 7. PRD 업데이트 제안

### 7.1 추가 기능 명세

**FR-CARE-001: 골든 루틴 모델링**

```
FR-CARE-001.1 (IoT 데이터 수집):
- 저가형 동작/문열림 센서 데이터 수집 (기존)
- 센서 데이터 → Event Log 변환 (신규)

FR-CARE-001.2 (Activity Recognition):
- 룰 기반 Activity 인식 엔진
- 입력: IoT 센서 로그 (위치, 시간, duration)
- 출력: 의미 있는 Activity (wake_up, bathroom, kitchen, etc.)

FR-CARE-001.3 (Conformance Checking):
- 정상 30일 데이터로 기준 패턴 학습
- Phase 1-2: 자체 구현 (시퀀스 유사도 계산)
- Phase 3+: pm4py Petri Net 기반 (상업용 라이선스 구매 시)

FR-CARE-001.4 (이상 패턴 감지):
- 반복 활동 감지 (비뇨기 질환)
- 누락 활동 감지 (우울증, 활동 저하)
- 순서 혼란 감지 (치매 초기 증상)

FR-CARE-001.5 (알림 생성):
- 고차원 인사이트 메시지 생성
- "생활 패턴이 급격히 불규칙해졌습니다. 건강 체크가 필요합니다."
- False Positive 목표: < 20%
```

### 7.2 성공 지표 추가

**9.4 케어 품질 지표**

| 지표 (Metric) | 정의 | 목표치 |
|--------------|------|--------|
| 조기 감지율 (Early Detection Rate) | 실제 건강 이상을 사전에 감지한 비율 | > 80% |
| False Positive 비율 | 정상인데 이상으로 잘못 알림한 비율 | < 20% |
| 알림 응답 시간 (Alert Response Time) | 이상 감지 후 가족에게 알림까지 걸린 시간 | < 5분 |
| 패턴 학습 정확도 (Pattern Learning Accuracy) | 30일 데이터로 학습한 기준 패턴의 정확도 | > 90% |

### 7.3 기술 스택 업데이트

**8. 기술 스택 (Tech Stack)**

```yaml
Backend:
  API Server: NestJS
  AI Engine: Python (FastAPI)
    - LangChain (GraphRAG)
    - pm4py (상업용) 또는 자체 구현 (Process Mining)  # 신규
    - MLflow (실험 추적)  # 신규

Database:
  PostgreSQL:
    - 기존: 위치 데이터, 트랜잭션
    - 신규: Event Log 저장 (pm4py용)  # 신규
  Neo4j: Knowledge Graph
  InfluxDB: IoT 시계열 데이터
```

---

## 8. 리스크 및 완화 전략

### 8.1 라이선스 리스크

| 리스크 | 영향 | 완화 전략 | 상태 |
|--------|------|----------|------|
| AGPL 위반 | ⛔ 치명적 | Phase 1-2는 자체 구현 사용 | ✅ 완화됨 |
| 라이선스 비용 과다 | ⚠️ 높음 | 견적 검토 후 자체 구현 선택 가능 | ⏳ 진행 중 |
| 벤더 종속성 | ⚠️ 중간 | 코어 로직은 자체 구현, pm4py는 선택적 사용 | ✅ 완화됨 |

### 8.2 기술 리스크

| 리스크 | 완화 전략 |
|--------|----------|
| **Activity Recognition 정확도** | 파일럿 테스트로 룰 엔진 개선, ML 기반 인식으로 업그레이드 |
| **False Positive 과다** | 기준 패턴 학습 기간 연장 (30일 → 60일), 임계값 조정 |
| **IoT 센서 배터리** | 저전력 센서 사용, 배터리 교체 알림 시스템 |
| **프라이버시 침해** | 센서 데이터 암호화, 익명화 처리, PIPA 준수 |

---

## 9. 다음 단계

### 9.1 즉시 실행 (완료)

- [x] Process Intelligence Solutions 견적 요청 이메일 템플릿 작성
- [x] Golden Routine PoC 구현 (자체 구현)
- [x] IoT Activity Recognition 룰 엔진 구현
- [x] 라이선스 검토 체크리스트 작성
- [x] 구현 페이지 제작 (`/pm4py-action-items/app/page.tsx`)

### 9.2 1주일 이내

- [ ] info@processintelligence.solutions로 견적 요청 이메일 발송
- [ ] 평가판 라이선스 신청
- [ ] 대안 라이브러리 조사 (ProM, bupaR)

### 9.3 1개월 이내

- [ ] 견적 수신 및 비용 분석
- [ ] 법무팀과 AGPL 리스크 검토
- [ ] PoC 피드백 수집 (내부 테스트)

### 9.4 Phase 2 착수 전

- [ ] 최종 라이선스 결정 (pm4py vs 자체 구현)
- [ ] 계약 체결 (상업용 선택 시)
- [ ] 프로덕션 개발 착수

---

## 10. 참고 자료

### 10.1 외부 링크

- **PM4Py 공식 사이트**: https://pm4py.fit.fraunhofer.de/
- **GitHub**: https://github.com/process-intelligence-solutions/pm4py
- **라이선스 문의**: https://processintelligence.solutions/pm4py#licensing
- **PyPI**: https://pypi.org/project/pm4py/

### 10.2 관련 문서

- `prd.md`: Townin 통합 제품 요구사항 정의서
- `architecture.md`: 기술 아키텍처 문서
- `pm4py-action-items/README.md`: 구현 페이지 문서

### 10.3 이메일 템플릿

**수신**: info@processintelligence.solutions
**제목**: Commercial License Inquiry for Townin Project (Korean Startup)

```
Dear Process Intelligence Solutions Team,

We are developing Townin, a hyper-local Life OS platform in South Korea,
and are interested in using PM4Py for our IoT-based family care feature
(Golden Routine modeling using Conformance Checking).

Could you please provide:
1. Commercial license pricing for startups (pre-revenue stage)
2. Evaluation license availability
3. Minimum contract term
4. Deployment restrictions (users/servers)
5. Startup discount programs

Our use case:
- Phase 2 deployment (Q2 2025)
- Expected users: 1,000-10,000 (Phase 2), scaling to 100,000+ (Phase 3)
- Backend: Python (FastAPI), deployed on AWS
- Specific features needed: Conformance Checking with Petri Nets, Token-based Replay

We are currently in the planning phase and would appreciate any evaluation
options to test PM4Py's capabilities before making a final decision.

Thank you for your time, and we look forward to hearing from you.

Best regards,
[Your Name]
Townin Development Team
South Korea

Website: [Your website]
Email: [Your email]
```

---

**문서 상태**: ✅ 최종 검토 완료
**마지막 업데이트**: 2024-12-21
**담당자**: Townin Development Team
**승인자**: [To be determined]
