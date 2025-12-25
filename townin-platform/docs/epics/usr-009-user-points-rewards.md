# Epic: USR-009 - User Points & Rewards

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | USR-009 |
| **Epic Title** | User Points & Rewards |
| **Priority** | P1 (High) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 5 days |
| **Phase** | Phase 1 |
| **Category** | USR - User App |

## Business Value

사용자 참여를 유도하기 위한 **포인트 시스템**입니다. 전단지 조회, 리뷰 작성 등으로 포인트를 적립하고, 상점 할인에 사용할 수 있습니다(Phase 2).

### Success Metrics
- 포인트 적립 사용자 비율 ≥ 60%
- 일평균 포인트 적립 ≥ 50P/사용자

## Epic Scope

✅ 포인트 적립 (전단지 조회, 회원가입)
✅ 포인트 내역 조회
✅ 포인트 잔액 표시
✅ 포인트 적립 알림
✅ 등급 시스템 (Bronze, Silver, Gold)

❌ 포인트 사용 (상점 할인) - Phase 2
❌ 포인트 선물 - Phase 3

## User Stories

### Story 9.1: 포인트 적립 규칙
- 회원가입: 1,000P
- 전단지 조회: 10P (일 최대 50P)
- 프로필 완성: 500P
- 3-Hub 등록: 300P
- **Story Points**: 3

### Story 9.2: 포인트 잔액 표시
- 홈 화면 상단: "내 포인트: 1,250P"
- 포인트 클릭 시 상세 화면 이동
- **Story Points**: 2

### Story 9.3: 포인트 내역 조회
- 포인트 적립/사용 내역 리스트
- 날짜, 내용, 금액 (+100P, -50P)
- 무한 스크롤
- **Story Points**: 3

### Story 9.4: 포인트 적립 알림
- 포인트 적립 시 인앱 토스트 메시지
- "+10P 전단지 조회 포인트"
- **Story Points**: 2

### Story 9.5: 등급 시스템
- Bronze (0-999P), Silver (1,000-4,999P), Gold (5,000P+)
- 등급별 혜택 (Phase 2: 추가 할인)
- 프로필에 등급 배지 표시
- **Story Points**: 3

### Story 9.6: 포인트 적립 이벤트
- 특정 기간 2배 적립
- 이벤트 배너 표시
- **Story Points**: 3

### Story 9.7: 일일 출석 체크
- 매일 앱 오픈 시 출석 체크
- 연속 출석: 1일 10P, 7일 100P
- **Story Points**: 5

### Story 9.8: 포인트 만료
- 적립 후 1년 후 만료
- 만료 예정 포인트 알림 (30일 전)
- **Story Points**: 3

### Story 9.9: 포인트 통계
- 월별 적립/사용 통계 차트
- **Story Points**: 3

### Story 9.10: 포인트 FAQ
- 포인트 사용법, 적립 규칙 설명
- **Story Points**: 1

## Technical Specifications

### Database Schema
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  balance INT DEFAULT 0, -- 현재 잔액
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE point_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INT NOT NULL, -- +100, -50
  type VARCHAR(50), -- 'signup', 'flyer_view', 'profile_complete'
  description TEXT,
  expires_at DATE, -- 만료일
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
GET /api/users/me/points
GET /api/users/me/points/transactions?page=1
POST /api/points/earn (내부 API - 포인트 적립)
```

### Point Earning Logic
```dart
Future<void> earnPoints(String userId, String type) async {
  final points = {
    'signup': 1000,
    'flyer_view': 10,
    'profile_complete': 500,
    'location_register': 300,
    'daily_checkin': 10,
  };

  await apiService.earnPoints(
    userId: userId,
    amount: points[type],
    type: type,
  );
}
```

## Dependencies
- CORE-001 (Auth), USR-007 (전단지 조회)

## Future Enhancements
### Phase 2
- 포인트 사용 (상점 할인)
- 포인트 → 쿠폰 교환

### Phase 3
- 포인트 선물하기
- 포인트 랭킹 (리더보드)
