# Epic: SGD-003 - Community Engagement & Activity Feed

## Epic Overview

| Epic ID | SGD-003 |
| Title | Community Engagement & Activity Feed |
| Priority | P2 | Effort | 4 days |
| Phase | Phase 1 | Category | SGD |

## Business Value

보안관이 **지역 소식과 활동**을 공유하여 커뮤니티를 활성화합니다. 주민과 상인 간 유대감을 형성합니다.

## Epic Scope

✅ 지역 활동 피드 작성
✅ 사진/텍스트 게시글
✅ 주민 댓글 및 좋아요
✅ 지역 공지사항 발행
✅ 활동 통계 (조회 수, 참여율)

## User Stories (간결 버전)

1. **활동 피드 작성** (5P)
   - 제목, 내용, 사진 (최대 10장)
   - 카테고리: 지역 소식, 상인 소개, 이벤트
2. **게시글 수정/삭제** (2P)
3. **주민 댓글** (3P)
   - 댓글 작성, 수정, 삭제
4. **좋아요** (2P)
5. **지역 공지사항** (3P)
   - 푸시 알림 포함
   - 중요 공지 상단 고정
6. **게시글 조회 통계** (3P)
   - 조회 수, 좋아요 수, 댓글 수
7. **활동 피드 목록** (3P)
   - 최신순, 인기순 정렬
8. **게시글 공유** (2P)
   - 카카오톡, 메시지
9. **주민 신고** (3P)
   - 부적절한 댓글 신고
10. **보안관 활동 배지** (2P)
    - 월간 우수 보안관 배지

## Technical Specifications

### API Endpoints
```
POST /api/community/posts (게시글 작성)
GET /api/community/posts?regionId=... (지역 피드)
POST /api/community/posts/:id/comments
POST /api/community/posts/:id/like
```

### Database
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  security_guard_id UUID REFERENCES security_guards(id),
  region_id UUID REFERENCES regions(id),
  category VARCHAR(50), -- news, merchant_intro, event
  title VARCHAR(200),
  content TEXT,
  images JSONB,
  is_pinned BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_likes (
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES community_posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
```

## Dependencies
- SGD-001, USR-002 (커뮤니티 참여)

## Future Enhancements
### Phase 2
- 지역 설문조사
- 지역 챌린지 (예: 쓰레기 줍기)
- 지역 랭킹 (활동 점수)
