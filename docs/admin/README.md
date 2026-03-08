---
title: 문서 운영 허브
author: SYSTEM
last_updated: 26.03.08
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
- 레거시 문서 위치: `docs/old/**/*.md`

## 3. 요약
- 총 라우트 페이지: **17**
- 페이지 문서 생성됨: **17**
- 자동 신규 생성: **0**
- 자동 메타 갱신(SYNCED): **0**
- 업데이트 필요(STALE): **0**
- 전체 문서 수(`docs/**/*.md`): **43**

## 4. 페이지-문서 매핑
| Route | Page File | Doc File | Status |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | `docs/pages/home.page.md` | OK |
| `/about` | `src/app/about/page.tsx` | `docs/pages/about.page.md` | OK |
| `/blog` | `src/app/blog/page.tsx` | `docs/pages/blog.page.md` | OK |
| `/careers` | `src/app/careers/page.tsx` | `docs/pages/careers.page.md` | OK |
| `/culture` | `src/app/culture/page.tsx` | `docs/pages/culture.page.md` | OK |
| `/dash` | `src/app/dash/page.tsx` | `docs/pages/dash.page.md` | OK |
| `/dash_2` | `src/app/dash_2/page.tsx` | `docs/pages/dash_2.page.md` | OK |
| `/dash_3` | `src/app/dash_3/page.tsx` | `docs/pages/dash_3.page.md` | OK |
| `/farm` | `src/app/farm/page.tsx` | `docs/pages/farm.page.md` | OK |
| `/i18n` | `src/app/i18n/page.tsx` | `docs/pages/i18n.page.md` | OK |
| `/main` | `src/app/main/page.tsx` | `docs/pages/main.page.md` | OK |
| `/news` | `src/app/news/page.tsx` | `docs/pages/news.page.md` | OK |
| `/newsroom` | `src/app/newsroom/page.tsx` | `docs/pages/newsroom.page.md` | OK |
| `/PoC` | `src/app/PoC/page.tsx` | `docs/pages/poc.page.md` | OK |
| `/services` | `src/app/services/page.tsx` | `docs/pages/services.page.md` | OK |
| `/tms` | `src/app/tms/page.tsx` | `docs/pages/tms.page.md` | OK |
| `/tms/main` | `src/app/tms/main/page.tsx` | `docs/pages/tms-main.page.md` | OK |

## 5. 문서 디렉토리 통계
| Section | Count |
| --- | --- |
| admin | 1 |
| decisions | 1 |
| guides | 13 |
| old | 5 |
| pages | 17 |
| root | 4 |
| templates | 2 |

## 6. 최근 수정 문서 (상위 10개)
- `docs/admin/README.md` (26.03.08)
- `docs/pages/blog.page.md` (26.03.08)
- `docs/pages/services.page.md` (26.03.07)
- `docs/pages/newsroom.page.md` (26.03.07)
- `docs/pages/culture.page.md` (26.03.07)
- `docs/pages/careers.page.md` (26.03.07)
- `docs/pages/about.page.md` (26.03.07)
- `docs/web-design-system.md` (26.03.06)
- `docs/pages/dash.page.md` (26.03.06)
- `docs/homepage-design-system.md` (26.03.06)
