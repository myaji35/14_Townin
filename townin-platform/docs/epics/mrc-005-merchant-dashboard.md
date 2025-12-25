# Epic: MRC-005 - Merchant Dashboard

## Epic Overview

| Epic ID | MRC-005 |
| Title | Merchant Dashboard |
| Priority | P0 | Effort | 6 days |
| Phase | Phase 1 | Category | MRC |

## Business Value

상인이 **자신의 성과를 한눈에** 볼 수 있는 대시보드입니다. 데이터 기반 의사결정을 지원합니다.

## Epic Scope

✅ 홈 대시보드 (요약 통계)
✅ 전단지 통계 (조회/클릭/저장)
✅ 간판 조회 통계
✅ 일별/주별/월별 차트
✅ 전단지/간판 관리 바로가기
✅ 알림 센터

## User Stories (간결 버전)

1. **홈 대시보드** (5P)
   - 오늘의 통계 카드: 전단지 조회 수, 클릭 수, 신규 팔로워
2. **전단지 성과** (5P)
   - 전단지별 조회/클릭/저장 수
   - 가장 인기 있는 전단지 TOP 3
3. **간판 조회 통계** (3P)
   - 일별 간판 조회 수
4. **차트 (일/주/월)** (5P)
   - 선 그래프: 조회 수 추이
   - 막대 그래프: 요일별 조회 수
5. **빠른 액션** (3P)
   - 새 전단지 등록, 간판 수정 버튼
6. **알림 센터** (3P)
   - 전단지 승인/거부 알림
   - 신규 팔로워 알림 (Phase 2)
7. **상점 정보 요약** (2P)
   - 상점명, 승인 상태, 평점 (Phase 2)
8. **전단지 목록** (3P)
   - 승인 대기, 승인됨, 거부됨 필터
9. **간판 목록** (2P)
10. **설정 바로가기** (2P)

## Technical Specifications

### API Endpoints
```
GET /api/merchants/me/dashboard
Response: {
  todayViews: 125,
  todayClicks: 45,
  activeFlyers: 5,
  activeSig boards: 1,
  topFlyers: [...]
}

GET /api/merchants/me/analytics?period=week
Response: {
  views: [10, 15, 20, ...],
  clicks: [5, 8, 10, ...]
}
```

### Screen Layout
```
┌─────────────────────────────┐
│ 내 상점: 치킨마을     🔔 ⚙️  │
├─────────────────────────────┤
│ 오늘의 통계                 │
│ [조회 125][클릭 45][저장 12]│
├─────────────────────────────┤
│ 📈 최근 7일 조회 수          │
│ [선 그래프]                 │
├─────────────────────────────┤
│ 인기 전단지 TOP 3           │
│ 1. 치킨 2마리 - 조회 350    │
│ 2. ...                      │
├─────────────────────────────┤
│ [새 전단지][간판 수정][통계] │
└─────────────────────────────┘
```

## Dependencies
- MRC-001, MRC-002, MRC-003

## Future Enhancements
### Phase 2
- 고객 리뷰/평점
- 경쟁 분석 (주변 상점 대비 성과)
- AI 추천 (최적 전단지 발행 시간)
