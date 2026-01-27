# Townin Project Recovery Information
**작성일시**: 2026-01-27 17:16 KST
**작성자**: Claude Code (Assistant)

## Git Repository 정보

### Remote Repository
- **URL**: https://github.com/myaji35/14_Townin.git
- **Branch**: main
- **Status**: Saved to remote

### 최근 변경 사항 (2026-01-27 기준)
- **Flush App**: Deployment & Cost Optimization (Kamal setup, Vultr integration)
- **Avatar**: AI Avatar creation and fit recommendation features
- **UI**: Sidebar, translations, and product detail page updates
- **System**: Deployment configurations (Dockerfile, Kamal)

## 프로젝트 복구 방법

### 1. 전체 프로젝트 복구
```bash
# 새로운 디렉토리에서 클론
git clone https://github.com/myaji35/14_Townin.git
cd 14_Townin

# 의존성 설치 및 복구
cd townin-platform/backend && npm install
cd ../web && npm install
```

### 2. 중요 파일 경로
- **env 파일**: 보안상 유지되지 않음 (별도 로컬 백업 필요)
- **데이터베이스**: 로컬 DB 데이터는 삭제됨

## 프로젝트 구조 (마지막 상태)
```
14_Townin Graph/
├── townin-platform/          # 통합 플랫폼
│   ├── backend/             # NestJS
│   ├── web/                 # React/Next.js
│   └── townin_app/          # Flutter
├── docs/                    # 문서
└── RECOVERY_INFO.md         # 이 파일
```

## 주의사항
1. 이 디렉토리는 정리('cleaned')되었습니다.
2. 프로젝트를 다시 진행하려면 위 복구 방법을 따르세요.
3. `.env` 파일 등 민감 정보는 포함되어 있지 않습니다.
