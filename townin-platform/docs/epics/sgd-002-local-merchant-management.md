# Epic: SGD-002 - Local Merchant Management

## Epic Overview

| Epic ID | SGD-002 |
| Title | Local Merchant Management |
| Priority | P1 | Effort | 5 days |
| Phase | Phase 1 | Category | SGD |

## Business Value

보안관이 **담당 지역의 상인을 관리**하고 신규 상인을 유치합니다. 오프라인 활동으로 플랫폼 성장을 가속화합니다.

## Epic Scope

✅ 담당 지역 상인 목록
✅ 상인 방문 기록
✅ 신규 상인 추천
✅ 상인 가입 코드 발급
✅ 활동 리포트 작성

## User Stories (간결 버전)

1. **담당 지역 상인 목록** (3P)
   - 내 지역 등록된 상인 목록
   - 승인 대기/승인 완료 필터
2. **상인 방문 기록** (5P)
   - 방문 일자, 상인명, 방문 목적
   - 사진 첨부 (상점 외관)
3. **신규 상인 추천** (5P)
   - 상점명, 주소, 연락처
   - 추천 사유
4. **상인 가입 코드 발급** (5P)
   - QR 코드 또는 6자리 코드
   - 상인이 코드로 가입 시 보안관 자동 매칭
5. **활동 리포트 작성** (5P)
   - 주간/월간 활동 요약
   - 방문 상인 수, 신규 유치 수
6. **전단지 검수** (3P)
   - 담당 지역 전단지 승인/거부 권한
7. **상인 피드백 수집** (3P)
   - 상인 만족도 조사
8. **보상 확인** (3P)
   - 신규 상인 유치 시 포인트/현금 보상
9. **활동 통계** (3P)
   - 누적 방문 상인 수, 유치 성공률
10. **지역 이벤트 기획** (Phase 2)

## Technical Specifications

### API Endpoints
```
GET /api/security-guards/me/merchants (담당 지역 상인)
POST /api/security-guards/visits (방문 기록)
POST /api/security-guards/referral-codes (가입 코드 발급)
POST /api/security-guards/reports (활동 리포트)
```

### Database
```sql
CREATE TABLE security_guard_visits (
  id UUID PRIMARY KEY,
  security_guard_id UUID REFERENCES security_guards(id),
  merchant_id UUID REFERENCES merchants(id),
  visit_date DATE,
  purpose TEXT,
  notes TEXT,
  photos JSONB, -- [url1, url2]
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_guard_referrals (
  id UUID PRIMARY KEY,
  security_guard_id UUID REFERENCES security_guards(id),
  merchant_id UUID REFERENCES merchants(id),
  referral_code VARCHAR(10) UNIQUE,
  reward_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Dependencies
- SGD-001, MRC-001

## Future Enhancements
### Phase 2
- 보안관 간 협업 (지역 간 교류)
- 지역 이벤트 기획 및 운영
