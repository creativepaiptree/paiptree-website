---
title: 문서 체계 전수조사와 정리 계획
author: ZORO
last_updated: 26.05.07
---

# 문서 체계 전수조사와 정리 계획

## 1. 결론
문서 구조 정리는 바로 파일을 옮기는 방식으로 진행하지 않는다.

먼저 전체 Markdown 문서를 전수조사하고, 문서가 실제 코드/파일과 맞는지 비교한 뒤, `active`, `needs-review`, `archive`, `external-context`, `generated` 상태를 부여한다. 그 다음 서비스 단위 문서 구조로 이동한다.

## 2. 1차 자동 감사 결과
`node scripts/docs-audit.mjs` 기준 1차 결과는 아래와 같다.

- 전체 Markdown 파일: 96개
- route page 파일: 28개
- 활성 page 문서: 28개
- route 대비 누락 page 문서: 0개
- route 없는 extra page 문서: 0개
- 템플릿 문구가 남은 문서: 34개
- 문서가 참조한 경로 중 존재 확인이 필요한 문서: 13개
- frontmatter가 없거나 공통 키가 없는 문서: 20개

## 3. 현재 문서 분포
- agent 규칙 문서: 5개
  - `AGENT_CORE.md`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `CODEX.md`
  - `GEMINI.md`
- Claude rules: 3개
  - `.claude/rules/**`
- Hermes plan: 5개
  - `.hermes/plans/**`
- Kiro spec: 3개
  - `.kiro/specs/**`
- root misc 문서: 3개
  - `README.md`
  - `SITE_RESTRUCTURE_PLAN.md`
  - `1차 PLAN(한번 수정후 이후 비교플랜0308마지막).md`
- docs 활성 page 문서: 28개
- docs page 인접 service 문서: 1개
  - `docs/pages/cctvup.service-manual.md`
- docs plan 문서: 4개
- docs standard 문서: 1개
- docs template 문서: 3개
- docs active guide: 1개
- docs old guide: 14개
- docs old legacy: 5개
- docs pages 구 아카이브: 16개
- public 문서: 1개

## 4. 현재 문제
### 문서 위치 문제
- `docs/pages`가 route 운영 문서와 서비스 매뉴얼을 함께 담고 있다.
- `docs/pages/무제 폴더`는 아카이브인데 이름이 불명확하다.
- `docs/guides/old`, `docs/old`, `.hermes/plans`, `.kiro/specs`가 모두 과거 계획/이력 성격이지만 위치가 갈라져 있다.
- root에 남은 장문 계획 문서가 현재 기준인지 과거 흔적인지 불명확하다.

### 문서 품질 문제
- 활성 page 문서 중 상당수가 자동 템플릿 문구를 그대로 갖고 있다.
- 일부 문서는 실제 존재하지 않는 경로를 참조한다.
- 외부 절대 경로를 참조하는 문서는 현재 workspace 안에서 검증할 수 없다.
- 에이전트 규칙 문서와 vendor-specific 문서는 frontmatter 규칙이 적용되지 않아 일반 문서 감사와 섞으면 false positive가 난다.

### 코드 비교 문제
- route 문서는 모두 존재하지만, 실제 페이지 구현과 내용이 맞는지는 별도 검토가 필요하다.
- 특히 `cherry_tms`, `dash`, `PoC`, `tms`, `i18n`, `m`, `style` 문서는 템플릿 상태가 많아 실제 구현 반영도가 낮다.
- CCTVUP은 현재 가장 최신화되어 있으므로 새 문서 구조의 기준 사례로 쓰기 좋다.

## 5. 문서 상태 라벨
모든 문서는 최종적으로 아래 상태 중 하나를 갖는다.

- `active`: 현재 작업 기준으로 사용한다.
- `needs-review`: 실제 코드와 대조가 필요하다.
- `archive`: 이력 보관용이며 신규 작업 기준으로 사용하지 않는다.
- `external-context`: Obsidian 또는 외부 프로젝트 맥락과 연결된 문서다.
- `generated`: 자동 생성 또는 자동 동기화 문서다.

## 6. 목표 구조
- `docs/README.md`
- `docs/admin/README.md`
- docs/standards/documentation.md
- docs/standards/agents.md
- docs/services/cctvup/README.md
- docs/services/cctvup/roadmap.md
- docs/services/cctvup/operations.md
- docs/services/cctvup/data-model.md
- docs/services/cherry-tms/README.md
- docs/services/cherry-tms/workflow.md
- docs/services/cherry-tms/data-model.md
- docs/services/git-reports/README.md
- docs/services/marketing/README.md
- docs/services/poc/README.md
- docs/pages/*.page.md
- docs/plans/YYYY-MM-DD-service-topic.md
- docs/decisions/ADR-0001-title.md
- docs/archive/pages/**
- docs/archive/guides/**
- docs/archive/legacy/**
- docs/archive/hermes/**
- docs/archive/kiro/**
- docs/templates/page.template.md
- docs/templates/service.template.md
- docs/templates/plan.template.md
- docs/templates/adr.template.md
- docs/templates/obsidian-note.template.md

## 7. Repo 문서와 Obsidian의 역할 분리
### Repo 문서
- 개발 기준
- 서비스 운영 절차
- API/DB/data model
- 변경 금지 사항
- QA/검증 절차
- 에이전트가 코드 수정 전에 반드시 확인해야 하는 기준

### Obsidian
- 장문 배경지식
- 회사/서비스 맥락
- 사고 과정과 회고
- 에이전트 간 분석 기록
- 공개/비공개 콘텐츠 초안

Repo 문서는 실행 기준이고, Obsidian은 맥락 저장소다.

## 8. Company/Obsidian 연결 방식
현재 repo에는 Obsidian vault 또는 Company 에이전트로 문서를 자동 동기화하는 기존 연결이 없다.

이 gap은 `scripts/docs-agent-feed.mjs`로 메운다. 이 스크립트는 전체 Markdown을 상태별로 분류하고, Company 에이전트와 Obsidian vault가 읽을 수 있는 export 묶음을 생성한다.

생성 산출물:
- `manifest.json`: 전체 문서 목록, 상태, 서비스, 우선순위, hash
- `company-agent-feed.jsonl`: Company 에이전트에 먹일 본문 포함 JSONL
- `company-agent-brief.md`: Company가 먼저 읽을 요약/섭취 규칙
- `obsidian-notes/**`: `--obsidian` 또는 `--vault` 옵션 사용 시 생성되는 vault용 Markdown

기본 규칙:
- `.company-feed/**`는 로컬 생성물이므로 git에 커밋하지 않는다.
- Company는 `active` 문서를 현재 기준으로 읽고, `needs-review`는 확정 기준으로 쓰지 않는다.
- CCTVUP 작업은 `service=cctvup` 문서를 우선 읽힌다.

실행 예:
- `node scripts/docs-agent-feed.mjs`
- `node scripts/docs-agent-feed.mjs --service cctvup --out /private/tmp/cctvup-company-feed --obsidian`
- `node scripts/docs-agent-feed.mjs --vault /절대경로/ObsidianVault/PaiptreeDocs`

## 9. 전수조사 진행 순서
### Step 1 - 자동 감사 기준 고정
- `scripts/docs-audit.mjs`를 기준 감사 도구로 사용한다.
- 전체 md 파일을 path/type/status 후보로 분류한다.
- frontmatter 누락, 템플릿 잔재, 깨진 참조를 추출한다.

### Step 1.5 - 외부 섭취 feed 고정
- `scripts/docs-agent-feed.mjs`를 Company/Obsidian feed 생성 도구로 사용한다.
- 새로 생긴 문서도 이 스크립트의 manifest와 JSONL에 포함되도록 한다.
- export 산출물은 `.company-feed/**` 또는 지정한 vault 경로에만 둔다.

### Step 2 - 활성 page 문서와 실제 route 비교
- 각 `docs/pages/*.page.md`를 대응하는 `src/app/**/page.tsx`와 비교한다.
- 문서의 목적/화면/데이터/상태/QA가 실제 구현과 맞는지 확인한다.
- 템플릿 문구가 남은 문서는 `needs-review`로 표시한다.

### Step 3 - 서비스 단위 묶음 판정
- route를 아래 서비스 묶음으로 나눈다.
  - `cctvup`
  - `cherry-tms`
  - `git-reports`
  - `marketing`
  - `poc`
  - `legacy-static`
- 서비스 문서가 필요한 route와 단순 page 문서만 있으면 되는 route를 분리한다.

### Step 4 - 아카이브 이동 후보 판정
- `docs/pages/무제 폴더/**`는 `docs/archive/pages/**` 후보로 둔다.
- `docs/guides/old/**`는 `docs/archive/guides/**` 후보로 둔다.
- `docs/old/**`는 `docs/archive/legacy/**` 후보로 둔다.
- `.hermes/plans/**`와 `.kiro/specs/**`는 현재 기준으로 편입할 내용만 선별하고 나머지는 `docs/archive/hermes/**`, `docs/archive/kiro/**` 후보로 둔다.

### Step 5 - 문서 검증 정책 업데이트
- `scripts/docs-utils.mjs`
- `scripts/docs-validate.mjs`
- `scripts/docs-sync.mjs`
- `docs/admin/README.md` 생성 문구

위 파일들이 새 구조를 인정하도록 수정한다.

### Step 6 - 템플릿 통일
- page 문서 템플릿
- service 문서 템플릿
- plan 문서 템플릿
- ADR 템플릿
- Obsidian note 템플릿

공통 frontmatter를 맞춘다.

### Step 7 - 기준 사례부터 이동
1. CCTVUP
2. Cherry TMS
3. Git reports
4. Marketing/About
5. PoC/Internal tools
6. 나머지 static/legacy routes

## 10. 우선순위
### P0 - 먼저 해야 함
- 문서 표준 문서 작성
- 감사 스크립트 유지
- Company/Obsidian feed 스크립트 유지
- validator가 새 구조를 이해하도록 수정
- CCTVUP 문서를 `docs/services/cctvup/**`로 승격

### P1 - 다음 단계
- Cherry TMS 하위 route 문서와 실제 파일 비교
- Cherry TMS 서비스 workflow 문서 생성
- 템플릿 문구가 남은 active page 문서 정리

### P2 - 이후 단계
- Hermes/Kiro 계획 문서 선별
- Obsidian 연결 규칙 보강
- archive 폴더 이동
- root misc 문서 정리

## 11. 작업 중 금지사항
- 감사 없이 문서를 대량 이동하지 않는다.
- 현재 기준인지 과거 맥락인지 판정하지 않은 문서를 active 기준으로 승격하지 않는다.
- route 문서를 삭제하지 않는다.
- 외부 절대 경로를 내부 파일처럼 고치지 않는다.
- Obsidian에 있어야 할 장문 배경지식을 repo 운영 기준 문서로 끌어오지 않는다.
