---
title: 문서 운영 허브
author: SYSTEM
last_updated: 26.04.24
---

# 문서 운영 허브

## 1. 목적
- 전체 페이지 문서화 상태를 한곳에서 확인한다.
- 신규 페이지 추가 시 문서 생성 누락을 방지한다.
- 이 문서는 `npm run docs:sync`로 자동 갱신한다.

## 2. 운영 원칙
- 페이지 문서 대상: `src/app/**/page.tsx` 전체
- 상단 문서/버전 버튼 노출: `/PoC` 상단 UI 전용
- 페이지 문서 위치: `docs/pages/*.page.md`
- 아카이브 페이지 문서 위치: `docs/pages/무제 폴더/**/*.page.md`
- 활성 가이드 위치: `docs/guides/*.md`
- 아카이브 가이드 위치: `docs/guides/old/**/*.md`
- 레거시 문서 위치: `docs/old/**/*.md`
- root 기준 문서는 `docs/README.md`와 `docs/3.0-design-system.md` 두 개만 유지한다.
- 웹/마케팅 기준은 `docs/README.md`에서 시작하고, PoC 기준은 `docs/3.0-design-system.md`를 사용한다.
- 이 정책은 `docs:validate`에서 allowlist로 강제한다.
- 아카이브 폴더 문서는 이력 보관용이며 현재 기준으로 사용하지 않는다.

## 3. 요약
- 총 라우트 페이지: **26**
- 페이지 문서 생성됨: **26**
- 자동 신규 생성: **0**
- 자동 메타 갱신(SYNCED): **0**
- 업데이트 필요(STALE): **0**
- 활성 페이지 문서(root): **26**
- 아카이브 페이지 문서: **16**
- 활성 가이드(root): **1**
- 아카이브 가이드: **14**
- 레거시 문서(`docs/old/**`): **5**
- 전체 문서 수(`docs/**/*.md`): **68**

## 4. 페이지-문서 매핑
| Route | Page File | Doc File | Status |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | `docs/pages/home.page.md` | OK |
| `/about` | `src/app/about/page.tsx` | `docs/pages/about.page.md` | OK |
| `/blog` | `src/app/blog/page.tsx` | `docs/pages/blog.page.md` | OK |
| `/careers` | `src/app/careers/page.tsx` | `docs/pages/careers.page.md` | OK |
| `/cherry_tms` | `src/app/cherry_tms/page.tsx` | `docs/pages/cherry_tms.page.md` | OK |
| `/cherry_tms/claim-docs` | `src/app/cherry_tms/claim-docs/page.tsx` | `docs/pages/cherry_tms-claim-docs.page.md` | OK |
| `/cherry_tms/grouping` | `src/app/cherry_tms/grouping/page.tsx` | `docs/pages/cherry_tms-grouping.page.md` | OK |
| `/cherry_tms/intake` | `src/app/cherry_tms/intake/page.tsx` | `docs/pages/cherry_tms-intake.page.md` | OK |
| `/cherry_tms/settlement-register` | `src/app/cherry_tms/settlement-register/page.tsx` | `docs/pages/cherry_tms-settlement-register.page.md` | OK |
| `/cherry_tms/settlement-review` | `src/app/cherry_tms/settlement-review/page.tsx` | `docs/pages/cherry_tms-settlement-review.page.md` | OK |
| `/culture` | `src/app/culture/page.tsx` | `docs/pages/culture.page.md` | OK |
| `/dash` | `src/app/dash/page.tsx` | `docs/pages/dash.page.md` | OK |
| `/dash_2` | `src/app/dash_2/page.tsx` | `docs/pages/dash_2.page.md` | OK |
| `/dash_3` | `src/app/dash_3/page.tsx` | `docs/pages/dash_3.page.md` | OK |
| `/farm` | `src/app/farm/page.tsx` | `docs/pages/farm.page.md` | OK |
| `/git` | `src/app/git/page.tsx` | `docs/pages/git.page.md` | OK |
| `/i18n` | `src/app/i18n/page.tsx` | `docs/pages/i18n.page.md` | OK |
| `/m` | `src/app/m/page.tsx` | `docs/pages/m.page.md` | OK |
| `/main` | `src/app/main/page.tsx` | `docs/pages/main.page.md` | OK |
| `/news` | `src/app/news/page.tsx` | `docs/pages/news.page.md` | OK |
| `/newsroom` | `src/app/newsroom/page.tsx` | `docs/pages/newsroom.page.md` | OK |
| `/PoC` | `src/app/PoC/page.tsx` | `docs/pages/poc.page.md` | OK |
| `/services` | `src/app/services/page.tsx` | `docs/pages/services.page.md` | OK |
| `/style` | `src/app/style/page.tsx` | `docs/pages/style.page.md` | OK |
| `/tms` | `src/app/tms/page.tsx` | `docs/pages/tms.page.md` | OK |
| `/tms/main` | `src/app/tms/main/page.tsx` | `docs/pages/tms-main.page.md` | OK |

## 5. 문서 디렉토리 통계
| Section | Count |
| --- | --- |
| admin | 1 |
| decisions | 1 |
| guides | 15 |
| old | 5 |
| pages | 42 |
| root | 2 |
| templates | 2 |

## 6. 아카이브 상태
- `docs/pages/무제 폴더/**/*.page.md`
  - 이전 페이지 문서 아카이브 **16**건
- `docs/guides/old/**/*.md`
  - 이전 스타일 단계 가이드 아카이브 **14**건
- `docs/old/**/*.md`
  - 레거시 컴포넌트/기록성 문서 **5**건

## 7. 현재 참고 우선순위
1. 웹/마케팅 작업은 `docs/README.md`에서 시작한다.
2. `/about` 상세 기준은 `docs/guides/marketing-page-style-baseline.md`, `docs/pages/about.page.md`를 본다.
3. PoC 작업만 `docs/3.0-design-system.md`를 기준으로 본다.

## 8. 최근 수정 문서 (상위 10개)
- `docs/admin/README.md` (26.04.24)
- `docs/pages/cherry_tms-grouping.page.md` (26.04.24)
- `docs/pages/cherry_tms-intake.page.md` (26.04.24)
- `docs/pages/cherry_tms-settlement-register.page.md` (26.04.24)
- `docs/pages/cherry_tms-settlement-review.page.md` (26.04.24)
- `docs/pages/cherry_tms-claim-docs.page.md` (26.04.24)
- `docs/pages/cherry_tms.page.md` (26.04.24)
- `docs/pages/m.page.md` (26.04.14)
- `docs/pages/style.page.md` (26.04.14)
- `docs/pages/tms-main.page.md` (26.04.13)
