---
title: 개발 문서 인덱스
author: ZORO
last_updated: 26.03.20
---

# 개발 문서 인덱스

## 1. 목적
- 프로젝트의 설계/운영 문서를 한곳에서 찾기 위한 포털 문서.
- 웹/마케팅 기준은 이 문서에서 시작하고, 상세 운영 문서는 하위 문서로 연결한다.
- PoC 기준은 `docs/3.0-design-system.md` 단일 문서로 본다.

## 2. 현재 기준
- root 기준 문서는 2개만 유지한다.
  - `docs/README.md`: 웹/마케팅 문서 진입점
  - `docs/3.0-design-system.md`: `src/app/PoC/**` 디자인 시스템
- `/about`이 현재 마케팅 페이지의 기준 페이지다.
  - 운영 상세: `docs/pages/about.page.md`
  - 스타일 상세: `docs/guides/marketing-page-style-baseline.md`
- `docs/pages/무제 폴더/**`, `docs/guides/old/**`, `docs/old/**`는 이력 보관용이다.

## 3. 웹 기준 요약
- 페이지 기준점
  - 현재 마케팅 시각 기준은 `/about`
  - 실제 페이지 구성은 `VideoHeroSection -> StatsSection -> CommandEcosystemSection -> InfiniteCarouselSection -> PlatformSection -> CaseStudiesSection -> PartnersSection -> NewsSection -> CTACardsSection`
- 컬러 기준
  - `/about`은 흰/검정 교차가 아니라 `--color-bg`, `--color-bg-surface`, `--color-bg-raised` 3단 다크 계층만 쓴다.
  - accent는 CTA, 활성 상태, 강조 카드에만 사용한다.
- 타이포/헤더 기준
  - Hero 제외 상위 섹션은 `AboutSectionHeader` 규칙을 따른다.
  - 일반 섹션 대표 제목은 `type-heading-l`, 메타행은 `var(--color-text-dim)`으로 통일한다.
- 여백 기준
  - Hero 제외 기본 섹션은 `py-24`
  - 페이지 셸은 `min-h-screen`, `main.pt-14`, `container-max px-6`
- 상세 규칙은 `docs/guides/marketing-page-style-baseline.md`를 우선 본다.

## 4. 문서 구조
- `docs/admin/`
  - 문서 운영 허브, 활성/아카이브 상태 요약
- `docs/pages/`
  - 활성 라우트 페이지 운영 문서
  - `docs:sync` 기준으로 route별 root 문서를 유지
  - `docs/pages/무제 폴더/`는 이전 페이지 문서 아카이브
- `docs/components/`
  - (신규 작성 예정 영역, 현재 비어있음)
- `docs/guides/`
  - 활성 스타일/운영 가이드
  - 현재 root 활성 문서는 `marketing-page-style-baseline.md` 1건
  - `docs/guides/old/`는 이전 스타일 단계에서 사용한 가이드 아카이브
- `docs/old/`
  - 레거시 컴포넌트/과거 정리 문서 아카이브
- `docs/templates/`
  - 신규 문서 템플릿
- root 기준 문서
  - `docs/README.md`: 웹/마케팅 문서 진입점
  - `docs/3.0-design-system.md`: `src/app/PoC/**` 전용 내부 도구 UI 기준

## 5. 핵심 문서
- 인덱스
  - [개발 문서 인덱스](./README.md)
- 운영 허브
  - [문서 운영 허브](./admin/README.md)
- PoC 기준 문서
  - [3.0-design-system.md](./3.0-design-system.md) — PoC/internal UI 기준
- 활성 기준 문서
  - [about.page.md](./pages/about.page.md) — `/about` 운영 기준
  - [marketing-page-style-baseline.md](./guides/marketing-page-style-baseline.md) — 마케팅 페이지 스타일 단일 기준
- 템플릿
  - [component-spec.template.md](./templates/component-spec.template.md)
- 아카이브
  - [문서 아카이브 인덱스](./old/README.md)
  - [ForecastMatrix.blueprint.md](./old/components/ForecastMatrix.blueprint.md)
  - [WeightDistribution.blueprint.md](./old/components/WeightDistribution.blueprint.md)
  - [CCTVMonitor.blueprint.md](./old/components/CCTVMonitor.blueprint.md)
  - [versionmodal.md](./old/components/versionmodal.md)

## 6. 작성/갱신 규칙
1. 코드 변경 시 관련 컴포넌트 문서를 같이 업데이트한다.
2. 웹/마케팅 기준은 `docs/README.md`에서 시작하고, 현재 상세 기준은 `docs/pages/about.page.md`와 `docs/guides/marketing-page-style-baseline.md`를 우선 사용한다.
3. `docs/pages/무제 폴더/**`, `docs/guides/old/**`, `docs/old/**`는 기본적으로 신규 작업 기준으로 사용하지 않는다.
4. root 기준 문서는 `docs/README.md`, `docs/3.0-design-system.md`만 허용한다. 다른 root 문서를 추가하면 `docs:validate`에서 실패한다.
5. 활성 guide 문서는 `docs/guides/marketing-page-style-baseline.md`만 허용한다. 새 active guide가 필요하면 allowlist와 인덱스를 같이 수정한다.
6. 문서 구조를 바꾸면 `docs/README.md`, `docs/old/README.md`, `scripts/docs-sync.mjs`, `scripts/docs-validate.mjs`에 활성/아카이브 상태를 같이 반영한다.
7. `docs/admin/README.md`는 `docs:sync` 결과를 기준으로 생성되므로, 허브 문구를 바꾸려면 생성 스크립트도 같이 수정한다.

## 7. 자동화 명령
- `npm run docs:sync`
  - 페이지-문서 매핑 갱신, 누락 페이지 문서 자동 생성, 허브 문서 생성
  - 페이지 코드가 더 최신이면 해당 페이지 문서의 `last_updated`를 자동 동기화
- `npm run docs:validate`
  - frontmatter/링크/페이지 문서 누락 검사
- `npm run docs:check`
  - sync + validate 일괄 실행

## 8. Codex 요청 표준
- `README 기준으로 웹 문서 구조 정리`
- `marketing-page-style-baseline.md 기준으로 마케팅 페이지 스타일 문서 업데이트`
- `component-spec.template.md 템플릿으로 초안 생성`
- `기존 문서와 코드 차이만 업데이트`
