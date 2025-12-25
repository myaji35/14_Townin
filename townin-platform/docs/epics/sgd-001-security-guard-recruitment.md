# Epic: SGD-001 - Security Guard Recruitment & Onboarding

## Epic Overview

| Epic ID | SGD-001 |
| Title | Security Guard Recruitment & Onboarding |
| Priority | P1 | Effort | 5 days |
| Phase | Phase 1 | Category | SGD |

## Business Value

**보안관(동네 홍보 대사)**을 모집하여 지역 커뮤니티를 활성화합니다. 보안관은 상인 유치, 전단지 검수, 지역 활동 등을 담당합니다.

## Epic Scope

✅ 보안관 지원서 작성
✅ 담당 지역 선택 (1개 아파트 단지 또는 동)
✅ 자기소개 및 활동 계획
✅ 관리자 심사 및 승인

## User Stories (간결 버전)

1. **보안관 지원하기** (3P)
   - 회원가입 후 "보안관 지원" 메뉴
2. **지원서 작성** (5P)
   - 이름, 연령, 직업
   - 자기소개 (500자)
   - 활동 가능 시간
3. **담당 지역 선택** (5P)
   - 지도에서 아파트 단지 또는 동 선택
   - 1인 1지역 원칙
4. **활동 계획 작성** (3P)
   - 상인 유치 계획
   - 지역 홍보 방안
5. **지원서 제출** (2P)
6. **관리자 심사** (ADM)
   - 지원서 검토 및 승인/거부
7. **승인 알림** (2P)
   - 푸시 알림 + 이메일
8. **보안관 계약서** (3P)
   - 활동 규칙, 보상 체계
9. **보안관 프로필** (3P)
   - 담당 지역, 활동 기간
10. **보안관 탈퇴** (2P)

## Technical Specifications

### API Endpoints
```
POST /api/security-guards/apply (지원서 제출)
GET /api/security-guards/me (내 보안관 정보)
```

### Database
```sql
CREATE TABLE security_guards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  assigned_region_id UUID REFERENCES regions(id),
  introduction TEXT,
  activity_plan TEXT,
  available_hours VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Dependencies
- CORE-001 (Auth), CORE-002 (지역)
