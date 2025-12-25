# Epic: MRC-002 - Digital Signboard Management

## Epic Overview

| Epic ID | MRC-002 |
| Title | Digital Signboard Management |
| Priority | P0 | Effort | 5 days |
| Phase | Phase 1 | Category | MRC |

## Business Value

상인이 **디지털 간판**을 등록하여 상시 노출되는 상점 정보를 제공합니다. 무료 기능으로 상인 유입을 유도합니다.

## Epic Scope

✅ 간판 등록 (이미지, 정보)
✅ 간판 수정/삭제
✅ 간판 미리보기
✅ 간판 공개/비공개 설정

## User Stories (간결 버전)

1. **간판 이미지 업로드** (5P)
   - 갤러리/카메라 선택, 크롭
2. **간판 정보 입력** (3P)
   - 대표 메뉴/상품, 가격
3. **간판 미리보기** (2P)
   - 사용자 화면 미리보기
4. **간판 등록** (3P)
   - 관리자 승인 대기
5. **간판 수정** (2P)
6. **간판 공개/비공개** (2P)
7. **간판 삭제** (2P)
8. **영업 시간 표시** (2P)
9. **간판 통계** (3P) - 조회 수
10. **간판 승인 알림** (2P)

## Technical Specifications

### API Endpoints
```
POST /api/signboards (간판 등록)
GET /api/merchants/me/signboards (내 간판)
PATCH /api/signboards/:id
DELETE /api/signboards/:id
```

### Database
- digital_signboards 테이블 (USR-010 참조)

## Dependencies
- MRC-001 (상점 등록), CORE-005 (이미지 업로드)
