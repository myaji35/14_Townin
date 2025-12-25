# Epic: MRC-003 - Flyer Creation & Management

## Epic Overview

| Epic ID | MRC-003 |
| Title | Flyer Creation & Management |
| Priority | P0 | Effort | 8 days |
| Phase | Phase 1 | Category | MRC |

## Business Value

**타운인의 핵심!** 상인이 전단지를 등록하여 사용자에게 할인 정보를 전달합니다.

## Epic Scope

✅ 전단지 등록 (제목, 내용, 이미지)
✅ 전단지 수정/삭제
✅ 전단지 유효 기간 설정
✅ 타겟 지역 설정 (반경)
✅ 전단지 미리보기
✅ 전단지 통계 (조회 수, 클릭 수)

## User Stories (간결 버전)

1. **전단지 이미지 업로드** (5P)
   - 갤러리/카메라, 최대 5장
2. **전단지 기본 정보** (3P)
   - 제목, 내용, 카테고리
3. **할인 정보 입력** (3P)
   - 할인율, 원가/할인가
4. **유효 기간 설정** (2P)
   - 시작일, 종료일
5. **타겟 지역 설정** (5P)
   - 상점 기준 반경 500m/1km/2km
   - 지도에 반경 표시
6. **전단지 미리보기** (3P)
   - 사용자 화면 미리보기
7. **전단지 등록** (3P)
   - 관리자 승인 대기
8. **전단지 수정** (3P)
9. **전단지 삭제** (2P)
10. **전단지 통계 대시보드** (5P)
    - 조회 수, 클릭 수, 저장 수
    - 일별/주별 차트

## Technical Specifications

### API Endpoints
```
POST /api/flyers (전단지 등록)
GET /api/merchants/me/flyers (내 전단지 목록)
PATCH /api/flyers/:id
DELETE /api/flyers/:id
GET /api/flyers/:id/stats (통계)
```

### Database
- flyers 테이블 (USR-007 참조)

### Flyer Status
- pending → approved/rejected → expired

## Dependencies
- MRC-001, CORE-005 (이미지), CORE-002 (타겟 지역)
