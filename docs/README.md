---
title: 개발 문서 인덱스
author: ZORO
last_updated: 26.02.11
---

# 개발 문서 인덱스

## 1. 목적
- 프로젝트의 설계/운영 문서를 한곳에서 찾기 위한 포털 문서.
- 문서 작성 기준과 템플릿의 시작점으로 사용.

## 2. 문서 구조
- `docs/admin/`
  - 자동 생성 허브 문서(페이지-문서 매핑, 상태 요약)
- `docs/pages/`
  - 라우트 페이지별 운영 문서
- `docs/components/`
  - (신규 작성 예정 영역, 현재 비어있음)
- `docs/guides/`
  - 문서 작성/운영 가이드
- `docs/old/`
  - 아카이브 문서(레거시 컴포넌트/과거 정리 문서)
- `docs/templates/`
  - 신규 문서 템플릿

## 3. 핵심 문서
- 인덱스
  - [개발 문서 인덱스](./README.md)
- 운영 허브
  - [문서 운영 허브](./admin/README.md)
- 페이지 문서
  - [home.page.md](./pages/home.page.md)
  - [about.page.md](./pages/about.page.md)
- 작성 가이드
  - [document-authoring.md](./guides/document-authoring.md)
  - [cctv-live-analysis-benchmark.md](./guides/cctv-live-analysis-benchmark.md)
- 템플릿
  - [component-spec.template.md](./templates/component-spec.template.md)
- 아카이브
  - [ForecastMatrix.blueprint.md](./old/components/ForecastMatrix.blueprint.md)
  - [WeightDistribution.blueprint.md](./old/components/WeightDistribution.blueprint.md)
  - [CCTVMonitor.blueprint.md](./old/components/CCTVMonitor.blueprint.md)
  - [versionmodal.md](./old/components/versionmodal.md)

## 4. 작성/갱신 규칙
1. 코드 변경 시 관련 컴포넌트 문서를 같이 업데이트한다.
2. 신규 페이지 문서는 `npm run docs:sync` 또는 `npm run docs:scaffold:page -- <route>`로 생성한다.
3. 문서 품질 기준은 `document-authoring.md`를 따른다.
4. `docs/admin/README.md`는 수동 편집하지 않고 자동 생성 결과만 사용한다.

## 5. 자동화 명령
- `npm run docs:sync`
  - 페이지-문서 매핑 갱신, 누락 페이지 문서 자동 생성, 허브 문서 생성
  - 페이지 코드가 더 최신이면 해당 페이지 문서의 `last_updated`를 자동 동기화
- `npm run docs:validate`
  - frontmatter/링크/페이지 문서 누락 검사
- `npm run docs:check`
  - sync + validate 일괄 실행

## 6. Codex 요청 표준
- `document-authoring.md 기준으로 개발문서 작성`
- `component-spec.template.md 템플릿으로 초안 생성`
- `기존 문서와 코드 차이만 업데이트`
