---
title: 개발 문서 인덱스
author: ZORO
last_updated: 26.02.07
---

# 개발 문서 인덱스

## 1. 목적
- 프로젝트의 설계/운영 문서를 한곳에서 찾기 위한 포털 문서.
- 문서 작성 기준과 템플릿의 시작점으로 사용.

## 2. 문서 구조
- `docs/components/`
  - 컴포넌트별 설계 문서
- `docs/guides/`
  - 문서 작성/운영 가이드
- `docs/templates/`
  - 신규 문서 템플릿

## 3. 핵심 문서 (README 포함 6개)
- 인덱스
  - `/Users/zoro/projects/paiptree-website/docs/README.md`
- 컴포넌트 문서
  - `/docs/components/ForecastMatrix.blueprint.md`
  - `/docs/components/WeightDistribution.blueprint.md`
  - `/docs/components/versionmodal.md`
- 작성 가이드
  - `/Users/zoro/projects/paiptree-website/docs/guides/document-authoring.md`
- 템플릿
  - `/Users/zoro/projects/paiptree-website/docs/templates/component-spec.template.md`

## 4. 작성/갱신 규칙
1. 코드 변경 시 관련 컴포넌트 문서를 같이 업데이트한다.
2. 신규 문서는 템플릿 기반으로 생성한다.
3. 문서 품질 기준은 `document-authoring.md`를 따른다.

## 5. Codex 요청 표준
- `document-authoring.md 기준으로 개발문서 작성`
- `component-spec.template.md 템플릿으로 초안 생성`
- `기존 문서와 코드 차이만 업데이트`
