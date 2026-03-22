---
title: "/git 페이지 운영 문서"
author: ZORO
last_updated: 26.03.21
---

# /git 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/git`
- 페이지 파일: `src/app/git/page.tsx`
- 문서 파일: `docs/pages/git.page.md`
- 문서 상태: active
- 디자인 기준: `docs/3.0-design-system.md`

## 2. 목적
- GitLab 주간 리포트 기능을 현재 웹사이트 안에서 어떤 형태로 붙일 수 있는지 검증하는 운영용 페이지다.
- 현재 버전은 날짜별 상세 변경 블록을 Supabase에서 읽어 한 화면에서 보는 조회용 화면이다.
- 마케팅 페이지가 아니라 내부 도구이므로 `PoC`와 같은 dark control surface, panel 중심 레이아웃을 따른다.

## 3. 화면/기능 구성
- 상단: 내부 도구용 top bar + source/status strip
- 본문:
  - 좌측: 저장된 날짜별 리포트 목록
  - 중앙 상단: 날짜 선택 + DB 상태 카드
  - 중앙 하단: 리포트 개요/작성자 요약/상세 블록/원문 markdown 뷰
  - 우측: 조회 단계 로그 + 시스템 인스펙터(구현 가능 범위, 권장 아키텍처, Supabase 저장 단위)
- 공통 네비게이션: `DashFloatingNav`

## 4. 데이터/상태
- 주요 데이터 소스:
  - `src/content/gitWeeklyReports.ts`
  - 실제 참조 원문: `/Users/zoro/projects/gitlab-sync/reports/weekly-report-2026-03-16_db.md`
  - DB 적재용 원문: `/Users/zoro/projects/gitlab-sync/reports/weekly-report-2026-03-16_db.md`
  - 실제 참조 프롬프트: `/Users/zoro/projects/gitlab-sync/WEEKLY_PROMPT.md`
  - 파서 스크립트: `scripts/git-weekly-report-to-json.mjs`
  - SQL 생성 스크립트: `scripts/git-weekly-report-to-supabase-sql.mjs`
  - 블록 파서 스크립트: `scripts/git-report-db-markdown-to-json.mjs`
  - 블록 SQL 생성 스크립트: `scripts/git-report-db-markdown-to-supabase-sql.mjs`
  - Supabase 스키마:
    - `docs/sql/supabase/012_git_weekly_reports.sql`
    - `docs/sql/supabase/013_git_weekly_report_document_model.sql`
    - `docs/sql/supabase/015_git_report_daily_block_model.sql`
  - 읽기 API: `src/app/api/git/reports/route.ts`
- 클라이언트 상태:
  - 선택된 리포트 ID
  - 주간 시작일(date input)
  - 데모 수집 진행 상태 및 스트리밍 텍스트
  - Supabase 읽기 상태(`supabase` / `unavailable`)
- 서버/정적 의존성:
  - `/api/git/reports`가 서버에서 `git_report_blocks_export_v1`를 읽어 날짜별로 그룹화한다.
  - 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
  - 실제 GitLab 수집기, DB write 자동화, LLM 연결은 아직 미구현

## 5. 인터랙션 규칙
- 좌측 목록 클릭 또는 날짜 입력 시 해당 날짜 리포트를 우측 뷰로 전환한다.
- 페이지 진입 시 클라이언트가 `/api/git/reports`를 호출해 Supabase 날짜별 리포트로 화면 데이터를 채운다.
- 현재 화면은 읽기 전용이며, DB 적재는 외부 스크립트로 수행한다.
- 전체 레이아웃은 `h-screen` 고정 내부 도구 패턴을 사용하고, 패널 단위 스크롤로 동작한다.

## 6. Supabase 저장 전략
- `git_report_blocks`: 날짜별 상세 변경 블록 저장
- `git_report_block_files`: 상세 블록의 Before / After 파일 행 저장
- `git_report_blocks_export_v1`: 블록과 파일행을 합친 조회용 view
- 원문 블록과 parsed 필드를 같이 저장해 날짜 조회와 원문 복원이 둘 다 가능해야 한다.

## 7. 수동 MVP 흐름
- 사용자가 `/Users/zoro/projects/gitlab-sync/reports/weekly-report-YYYY-MM-DD_db.md` 형태의 블록 전용 문서를 준비한다.
- `node scripts/git-report-db-markdown-to-supabase-sql.mjs /absolute/path/to/report_db.md` 실행으로 Supabase insert SQL을 생성한다.
- 생성된 SQL을 Supabase SQL editor에 붙여 넣어 `git_report_blocks`, `git_report_block_files`를 적재한다.
- `/git` 페이지는 `/api/git/reports`를 통해 `git_report_blocks_export_v1`를 조회하는 읽기 전용 화면으로 연결한다.
- 자동 수집/LLM 생성은 이후 단계에서 같은 테이블 구조를 재사용한다.

## 8. QA 체크리스트
- [ ] `/git` 진입 시 top bar, source strip, 3열 워크스페이스가 렌더링된다.
- [ ] 좌측 저장된 리포트 목록에서 다른 주간을 선택하면 우측 상세가 즉시 바뀐다.
- [ ] `데모 수집 실행` 후 진행 로그와 raw markdown 영역이 순차적으로 갱신된다.
- [ ] 첫 리포트에서 실제 2026-03-16 주간 기준 작성자 요약, 전체 맥락, 주요 레포 목록이 보인다.
- [ ] 우측 `Supabase Storage` 패널에서 3개 테이블과 저장 필드가 보인다.
- [ ] 모바일에서 목록/진행 로그/리포트 뷰가 세로 스택으로 읽힌다.
