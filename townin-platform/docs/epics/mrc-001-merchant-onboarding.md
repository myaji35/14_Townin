# Epic: MRC-001 - Merchant Onboarding

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | MRC-001 |
| **Epic Title** | Merchant Onboarding |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 6 days |
| **Phase** | Phase 1 - Traffic Acquisition |
| **Category** | MRC - Merchant App |
| **Owner** | Mobile Team (Flutter) |

## Business Value

상인이 타운인에 가입하고 상점을 등록하는 첫 단계입니다. **간편한 온보딩**으로 가입 장벽을 낮춰 많은 상인을 확보해야 합니다.

### Success Metrics
- 상인 가입 완료율 ≥ 70%
- 평균 온보딩 소요 시간 < 5분
- 상점 정보 완성도 ≥ 80%

## Epic Scope

✅ 상인 회원가입 (이메일 or 소셜)
✅ 사업자 정보 입력
✅ 상점 정보 등록 (이름, 주소, 카테고리)
✅ 상점 위치 설정 (지도)
✅ 영업 시간 설정
✅ 상점 로고 업로드
✅ 온보딩 완료

## User Stories

### Story 1.1: 상인 회원가입 선택
- 이메일 회원가입 or 소셜 로그인
- 역할 자동 설정: merchant
- **Story Points**: 3

### Story 1.2: 사업자 정보 입력
- 사업자 등록번호 (선택 사항)
- 대표자명
- 전화번호
- **Story Points**: 3

### Story 1.3: 상점 기본 정보
- 상점명 (필수)
- 카테고리 (음식, 카페, 병원 등)
- 한 줄 소개
- **Story Points**: 2

### Story 1.4: 상점 위치 설정
- 주소 검색 (Kakao API)
- 지도에서 핀 드래그
- GPS 현재 위치 사용
- **Story Points**: 5

### Story 1.5: 영업 시간 설정
- 요일별 영업 시간
- 휴무일 설정
- 브레이크 타임
- **Story Points**: 3

### Story 1.6: 상점 로고 업로드
- 갤러리에서 선택 or 카메라 촬영
- 이미지 크롭 (1:1)
- **Story Points**: 3

### Story 1.7: 연락처 정보
- 대표 전화번호
- 이메일 (선택)
- SNS 링크 (선택)
- **Story Points**: 2

### Story 1.8: 약관 동의
- 서비스 이용약관
- 개인정보 처리방침
- 마케팅 수신 동의 (선택)
- **Story Points**: 2

### Story 1.9: 온보딩 완료 화면
- "환영합니다!" 축하 메시지
- 등록된 상점 정보 요약
- "타운인 시작하기" 버튼
- **Story Points**: 2

### Story 1.10: 관리자 승인 대기
- 상점 승인 대기 상태 표시
- 승인 완료 시 푸시 알림
- 승인 전에도 앱 둘러보기 가능
- **Story Points**: 3

## Technical Specifications

### API Endpoints
```
POST /api/auth/register (role: merchant)
POST /api/merchants (상점 등록)
POST /api/files/presigned-url (로고 업로드)
PATCH /api/merchants/:id (상점 정보 수정)
```

### Database Schema
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  business_number VARCHAR(50), -- 사업자 등록번호
  name VARCHAR(200) NOT NULL, -- 상점명
  category VARCHAR(50),
  description TEXT,
  location GEOMETRY(POINT, 4326),
  address VARCHAR(500),
  region_id UUID REFERENCES regions(id),

  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  sns_links JSONB, -- {"instagram": "...", "facebook": "..."}

  -- Business Hours
  business_hours JSONB, -- {"mon": "09:00-22:00", ...}
  closed_days VARCHAR(100),

  -- Media
  logo_url TEXT,
  banner_images JSONB, -- [url1, url2, ...]

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### State Management
```dart
class MerchantOnboardingState {
  final int currentStep; // 1-9
  final Merchant merchant;
  final bool isLoading;
}
```

### Screen Flow
```
회원가입 → 사업자 정보 → 상점 정보 →
위치 설정 → 영업시간 → 로고 업로드 →
연락처 → 약관 동의 → 완료 (승인 대기)
```

## Dependencies
- CORE-001 (Auth), CORE-002 (Geospatial), CORE-005 (File Upload)

## Future Enhancements
### Phase 2
- 상점 인증 (사업자 등록증 자동 인식 OCR)
- 상점 사진 갤러리 (내부/외부 사진)
